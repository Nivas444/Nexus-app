/**
 * Nexus ERP API Client Module
 * Handles authenticated HTTP communications with FastAPI backend (/api/v1).
 *
 * Security notes:
 * - Zero database credentials, Supabase keys, or hardcoded user passwords/hashes.
 * - Uses HttpOnly cookies (with double-submit CSRF token) + short-lived session access token.
 * - Never stores long-lived tokens in localStorage.
 * - Automatically handles 401 token refresh/redirect and 403 authorization feedback.
 */
(function(window) {
  'use strict';

  const isLocalDifferentOrigin = typeof window !== 'undefined' && window.location && (
    window.location.protocol === 'file:' ||
    ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      window.location.port !== '8000' && window.location.port !== '')
  );

  // Public same-origin API base URL (/api/v1 via Vercel rewrites in production)
  const metaApiBase = (typeof document !== 'undefined')
    ? (document.querySelector('meta[name="nexus-api-base"]')?.getAttribute('content') || '').trim()
    : '';
  const API_BASE_URL = (
    window.API_BASE_URL ||
    metaApiBase ||
    (isLocalDifferentOrigin ? 'http://127.0.0.1:8000/api/v1' : '/api/v1')
  ).replace(/\/+$/, '');

  // Public lightweight health-check endpoint (/api/health via Vercel rewrite -> Render /health)
  const HEALTH_URL = (
    window.HEALTH_CHECK_URL ||
    (isLocalDifferentOrigin ? 'http://127.0.0.1:8000/health' : '/api/health')
  );

  // In-memory access token (backed by sessionStorage for page navigation within the same tab; never localStorage)
  let _memoryAccessToken = null;
  let _refreshPromise = null;
  let _wakeUpPromise = null;
  let _isRedirectingToLogin = false;

  // Performance: in-flight GET deduplication & short-TTL GET response cache (auto-invalidated on writes)
  const _inflightGetRequests = new Map();
  const _clientGetCache = new Map();
  const CLIENT_GET_CACHE_TTL_MS = 20000;
  const _activeActionLocks = new Set();

  // Lightweight frontend performance telemetry (never logs tokens, passwords, or PII)
  const _perfMetrics = {
    requests: [],
    marks: {},
    recordRequest(entry) {
      this.requests.push(entry);
      if (this.requests.length > 200) this.requests.shift();
    },
    mark(name, durationMs) {
      this.marks[name] = { durationMs: Number(durationMs.toFixed(1)), at: Date.now() };
    },
    getSummary() {
      const slow = this.requests.filter(r => r.durationMs >= 500).sort((a, b) => b.durationMs - a.durationMs);
      return {
        totalRequests: this.requests.length,
        cacheHits: this.requests.filter(r => r.cacheHit).length,
        slowestRequests: slow.slice(0, 10),
        marks: { ...this.marks }
      };
    },
    async guardAction(actionKey, fn) {
      if (_activeActionLocks.has(actionKey)) return null;
      _activeActionLocks.add(actionKey);
      try {
        return await fn();
      } finally {
        _activeActionLocks.delete(actionKey);
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.NexusPerf = _perfMetrics;
  }

  function _generateRequestId() {
    return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function _isCacheableGet(endpoint) {
    if (!endpoint || endpoint.includes('/auth/') || endpoint.includes('/health')) return false;
    return true;
  }

  function clearClientApiCache(prefix) {
    if (!prefix) {
      _clientGetCache.clear();
      return;
    }
    for (const k of _clientGetCache.keys()) {
      if (k.includes(prefix)) _clientGetCache.delete(k);
    }
  }

  // Purge any legacy insecure localStorage token keys
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('nexus_token');
      window.localStorage.removeItem('nexus_user');
      window.localStorage.removeItem('nexus_role');
      window.localStorage.removeItem('nxtkn_commercial');
    }
  } catch (e) {}

  function getCookie(name) {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function getAccessToken() {
    if (_memoryAccessToken) return _memoryAccessToken;
    try {
      const tok = window.sessionStorage ? window.sessionStorage.getItem('nexus_token') : null;
      if (tok) {
        _memoryAccessToken = tok;
        return tok;
      }
    } catch (e) {}
    return null;
  }

  function setSessionState(userProfile) {
    if (!userProfile) return;
    if (userProfile.token) {
      _memoryAccessToken = userProfile.token;
    }
    try {
      if (window.sessionStorage) {
        // Store profile without duplicating raw token unnecessarily, keep short-lived token in sessionStorage for tab navigation
        const safeProfile = { ...userProfile };
        delete safeProfile.token;
        window.sessionStorage.setItem('nexus_user', JSON.stringify(safeProfile));
        if (safeProfile.role) window.sessionStorage.setItem('nexus_role', safeProfile.role);
        if (_memoryAccessToken) window.sessionStorage.setItem('nexus_token', _memoryAccessToken);
      }
    } catch (e) {}
  }

  function clearSessionState() {
    _memoryAccessToken = null;
    clearClientApiCache();
    _inflightGetRequests.clear();
    try {
      if (window.sessionStorage) {
        window.sessionStorage.removeItem('nexus_user');
        window.sessionStorage.removeItem('nexus_role');
        window.sessionStorage.removeItem('nexus_token');
      }
      if (window.localStorage) {
        window.localStorage.removeItem('nexus_user');
        window.localStorage.removeItem('nexus_role');
        window.localStorage.removeItem('nexus_token');
        window.localStorage.removeItem('nxtkn_commercial');
      }
    } catch (e) {}
  }

  function isLoginPage() {
    if (typeof window === 'undefined' || !window.location) return false;
    const p = (window.location.pathname || '').toLowerCase();
    return p === '/' || p.endsWith('/index.html') || p.endsWith('index.html');
  }

  function redirectToLogin() {
    clearSessionState();
    if (!isLoginPage() && !_isRedirectingToLogin) {
      _isRedirectingToLogin = true;
      window.location.href = 'index.html';
    }
  }

  function isProtectedApiUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return false;
    return (
      urlStr.startsWith(API_BASE_URL) ||
      urlStr.startsWith('/api/v1') ||
      urlStr.includes('/api/v1/')
    );
  }

  function isAuthEndpoint(urlStr) {
    return (
      urlStr.includes('/auth/login') ||
      urlStr.includes('/auth/refresh') ||
      urlStr.includes('/auth/logout')
    );
  }

  // Keep reference to native fetch before wrapping
  const _nativeFetch = (typeof window !== 'undefined' && typeof window.fetch === 'function')
    ? window.fetch.bind(window)
    : null;

  async function tryRefreshSession() {
    if (!_nativeFetch) return false;
    if (_refreshPromise) return _refreshPromise;

    _refreshPromise = (async () => {
      try {
        const csrfToken = getCookie('nexus_csrf_token');
        const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

        const res = await _nativeFetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({})
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data && data.success && data.user) {
          setSessionState(data.user);
          return true;
        }
        return false;
      } catch (e) {
        return false;
      } finally {
        _refreshPromise = null;
      }
    })();

    return _refreshPromise;
  }

  // Global fetch wrapper so even legacy direct fetch('/api/v1/...') calls in home.js
  // automatically send JWT + HttpOnly cookies + CSRF token and handle 401/403 centrally.
  if (_nativeFetch) {
    window.fetch = async function nexusAuthenticatedFetch(input, init = {}) {
      const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
      if (!isProtectedApiUrl(urlStr)) {
        return _nativeFetch(input, init);
      }

      const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      const headers = new Headers(init && init.headers ? init.headers : (input instanceof Request ? input.headers : undefined));

      // Never allow frontend code to spoof role via untrusted header
      headers.delete('x-user-role');
      headers.delete('X-User-Role');

      const token = getAccessToken();
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const csrfToken = getCookie('nexus_csrf_token');
        if (csrfToken && !headers.has('X-CSRF-Token')) {
          headers.set('X-CSRF-Token', csrfToken);
        }
      }

      const mergedInit = {
        ...init,
        credentials: 'include',
        headers
      };

      let response = await _nativeFetch(input, mergedInit);

      // Handle 401 Unauthorized: attempt one silent refresh, then redirect to login
      if (response.status === 401 && !isAuthEndpoint(urlStr)) {
        const refreshed = await tryRefreshSession();
        if (refreshed) {
          const retryHeaders = new Headers(headers);
          const newToken = getAccessToken();
          if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`);
          const newCsrf = getCookie('nexus_csrf_token');
          if (newCsrf && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            retryHeaders.set('X-CSRF-Token', newCsrf);
          }
          response = await _nativeFetch(input, { ...mergedInit, headers: retryHeaders });
        }
        if (response.status === 401) {
          redirectToLogin();
        }
      } else if (response.status === 403 && !isAuthEndpoint(urlStr)) {
        if (typeof window.showToast === 'function') {
          window.showToast('Access forbidden: you do not have permission for this action.', 'error');
        }
      }

      return response;
    };
  }

  async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const bypassCache = Boolean(options.bypassCache);
    const cacheKey = `${method}:${url}`;

    // Invalidate cached GETs on any mutating operation so data stays strictly consistent
    if (method !== 'GET') {
      clearClientApiCache();
    } else if (!bypassCache && _isCacheableGet(endpoint)) {
      const cached = _clientGetCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        _perfMetrics.recordRequest({
          method,
          endpoint,
          status: 200,
          durationMs: 0.1,
          cacheHit: true
        });
        return typeof structuredClone === 'function' ? structuredClone(cached.data) : JSON.parse(JSON.stringify(cached.data));
      }
      if (_inflightGetRequests.has(cacheKey)) {
        return _inflightGetRequests.get(cacheKey);
      }
    }

    const reqId = _generateRequestId();
    const defaultHeaders = {
      'Accept': 'application/json',
      'X-Request-Id': reqId
    };

    const token = getAccessToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
      credentials: 'include',
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    const execPromise = (async () => {
      const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      try {
        const response = await fetch(url, config);
        const durationMs = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
        const serverMs = response.headers ? parseFloat(response.headers.get('X-Process-Time-Ms') || '0') : 0;

        _perfMetrics.recordRequest({
          requestId: reqId,
          method,
          endpoint,
          status: response.status,
          durationMs: Number(durationMs.toFixed(1)),
          serverMs: isNaN(serverMs) ? 0 : serverMs,
          cacheHit: false
        });

        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }

        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          let errorDetail = (data && data.detail) || (data && data.message) || response.statusText;
          if (Array.isArray(errorDetail)) {
            errorDetail = errorDetail.map(e => `${e.loc ? e.loc.join('.') + ': ' : ''}${e.msg}`).join(', ');
          } else if (typeof errorDetail === 'object') {
            errorDetail = JSON.stringify(errorDetail);
          }
          const err = new Error(errorDetail || `Request failed (HTTP ${response.status})`);
          err.status = response.status;
          err.statusCode = response.status;
          err.detail = errorDetail;
          err.data = data;
          err.isConflict = (response.status === 409);
          throw err;
        }

        if (method === 'GET' && _isCacheableGet(endpoint) && data !== undefined) {
          _clientGetCache.set(cacheKey, {
            expiresAt: Date.now() + CLIENT_GET_CACHE_TTL_MS,
            data
          });
        }

        return data;
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          const friendlyMsg = `Cannot connect to FastAPI backend at ${API_BASE_URL}. Please ensure the backend service is running.`;
          console.error(friendlyMsg, error);
          const err = new Error(friendlyMsg);
          err.status = 503;
          err.statusCode = 503;
          err.code = 503;
          throw err;
        }
        console.error(`API Request failed for ${url}:`, error);
        throw error;
      } finally {
        if (method === 'GET') {
          _inflightGetRequests.delete(cacheKey);
        }
      }
    })();

    if (method === 'GET' && _isCacheableGet(endpoint)) {
      _inflightGetRequests.set(cacheKey, execPromise);
    }

    return execPromise;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const NexusApi = {
    baseUrl: API_BASE_URL,
    healthUrl: HEALTH_URL,

    health: {
      /**
       * Lightweight unauthenticated GET to /api/health (never sends credentials).
       */
      async check(timeoutMs = 8000) {
        const fetchFn = _nativeFetch || window.fetch.bind(window);
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const timerId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        const startedAt = Date.now();

        try {
          const response = await fetchFn(HEALTH_URL, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'omit',
            headers: { 'Accept': 'application/json' },
            signal: controller ? controller.signal : undefined
          });
          if (timerId) clearTimeout(timerId);

          if (response.status === 200) {
            try {
              const body = await response.json();
              if (body && (body.status === 'ok' || body.status === 'healthy')) {
                return { healthy: true, status: 200, networkError: false, aborted: false, elapsedMs: Date.now() - startedAt };
              }
            } catch (e) {
              // Non-JSON 200 (e.g. HTML error page) is not a healthy API response
            }
          }
          return { healthy: false, status: response.status, networkError: false, aborted: false, elapsedMs: Date.now() - startedAt };
        } catch (err) {
          if (timerId) clearTimeout(timerId);
          const isAbort = Boolean(err && err.name === 'AbortError');
          return { healthy: false, status: 0, networkError: !isAbort, aborted: isAbort, elapsedMs: Date.now() - startedAt };
        }
      },

      /**
       * Wake up sleeping Render backend by polling /api/health every 2.5s up to 120s.
       * Single-flight guarded so duplicate calls never spawn parallel polling loops.
       */
      async waitUntilReady(options = {}) {
        if (_wakeUpPromise) {
          return _wakeUpPromise;
        }

        const pollIntervalMs = Number(options.pollIntervalMs) || 2500;
        const maxWaitMs = Number(options.maxWaitMs) || 120000;
        const perRequestTimeoutMs = Number(options.perRequestTimeoutMs) || 10000;
        const onAttempt = typeof options.onAttempt === 'function' ? options.onAttempt : null;

        _wakeUpPromise = (async () => {
          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            const err = new Error('Unable to connect to the server. Please check your connection and try again.');
            err.code = 'BACKEND_UNAVAILABLE';
            throw err;
          }

          const deadline = Date.now() + maxWaitMs;
          let attempts = 0;
          let consecutiveFastNetworkErrors = 0;

          while (Date.now() < deadline) {
            attempts += 1;
            if (onAttempt) onAttempt(attempts);

            const remainingMs = Math.max(1000, deadline - Date.now());
            const result = await NexusApi.health.check(Math.min(perRequestTimeoutMs, remainingMs));

            if (result.healthy) {
              return { healthy: true, attempts };
            }

            // If health route returns 404 (e.g. proxy/server doesn't expose /api/health yet),
            // do not stall login for 120s — proceed directly to /api/v1/auth/login.
            if (result.status === 404) {
              return { healthy: true, attempts, skipped: true };
            }

            if (result.networkError) {
              if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                const err = new Error('Unable to connect to the server. Please check your connection and try again.');
                err.code = 'BACKEND_UNAVAILABLE';
                throw err;
              }
              if (result.elapsedMs < 1500) {
                consecutiveFastNetworkErrors += 1;
              } else {
                consecutiveFastNetworkErrors = 0;
              }
              if (consecutiveFastNetworkErrors >= 3) {
                const err = new Error('Unable to connect to the server. Please check your connection and try again.');
                err.code = 'BACKEND_UNAVAILABLE';
                throw err;
              }
            } else {
              consecutiveFastNetworkErrors = 0;
            }

            const timeLeft = deadline - Date.now();
            if (timeLeft <= 0) {
              break;
            }
            await sleep(Math.min(pollIntervalMs, timeLeft));
          }

          const timeoutErr = new Error('Server is taking longer than expected to start. Please try again.');
          timeoutErr.code = 'WAKEUP_TIMEOUT';
          throw timeoutErr;
        })();

        try {
          return await _wakeUpPromise;
        } finally {
          _wakeUpPromise = null;
        }
      }
    },

    auth: {
      async login(email, password) {
        const normalized = (email || '').trim().toLowerCase();
        const apiRes = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: normalized, password })
        });
        if (!apiRes || !apiRes.success || !apiRes.user) {
          const err = new Error('Invalid email or password');
          err.status = 401;
          err.detail = 'Invalid email or password';
          throw err;
        }
        setSessionState(apiRes.user);
        return { success: true, user: apiRes.user };
      },

      async refresh() {
        const ok = await tryRefreshSession();
        return ok ? this.getStoredUser() : null;
      },

      async me() {
        try {
          const user = await request('/auth/me', { method: 'GET' });
          if (user) {
            setSessionState(user);
            return user;
          }
          return null;
        } catch (err) {
          if (err && (err.status === 401 || err.statusCode === 401)) {
            clearSessionState();
          }
          return null;
        }
      },

      getStoredUser() {
        try {
          const raw = window.sessionStorage ? window.sessionStorage.getItem('nexus_user') : null;
          if (!raw) return null;
          if (raw.startsWith('{')) {
            return JSON.parse(raw);
          }
          return null;
        } catch (e) {
          return null;
        }
      },

      getUserRole() {
        const user = this.getStoredUser();
        if (user && user.role) return user.role;
        try {
          const role = window.sessionStorage ? window.sessionStorage.getItem('nexus_role') : null;
          if (role) return role;
        } catch (e) {}
        return null;
      },

      getPermissions() {
        const user = this.getStoredUser();
        return (user && Array.isArray(user.permissions)) ? user.permissions : [];
      },

      hasPermission(permissionCode) {
        const user = this.getStoredUser();
        if (!user) return false;
        if (user.is_super_admin || user.role === 'Master') return true;
        return Array.isArray(user.permissions) && user.permissions.includes(permissionCode);
      },

      isAuthenticated() {
        return Boolean(getAccessToken() || this.getStoredUser());
      },

      async logout() {
        try {
          await request('/auth/logout', { method: 'POST' });
        } catch (e) {
          // Proceed with local cleanup even if token was already expired
        }
        clearSessionState();
        window.location.href = 'index.html';
      }
    },

    expenses: {
      /**
       * Fetch expenses with optional search, filters, pagination
       */
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.category) query.set('category', params.category);
        if (params.head) query.set('head', params.head);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);

        const qs = query.toString();
        return await request(`/master/expenses${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Fetch single expense by ID
       */
      async getById(expenseId) {
        return await request(`/master/expenses/${expenseId}`, {
          method: 'GET'
        });
      },

      /**
       * Create new expense in PostgreSQL
       */
      async create(payload) {
        return await request('/master/expenses', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update existing expense by ID
       */
      async update(expenseId, payload) {
        return await request(`/master/expenses/${expenseId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Toggle active/inactive status
       */
      async updateStatus(expenseId, statusData) {
        return await request(`/master/expenses/${expenseId}/status`, {
          method: 'PATCH',
          body: JSON.stringify(statusData)
        });
      },

      /**
       * Delete expense
       */
      async delete(expenseId) {
        return await request(`/master/expenses/${expenseId}`, {
          method: 'DELETE'
        });
      },

      /**
       * Bulk upload CSV file
       */
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/master/expenses/bulk-upload', {
          method: 'POST',
          body: formData
        });
      },

      /**
       * Get template download URL
       */
      getTemplateUrl() {
        return `${API_BASE_URL}/master/expenses/template`;
      }
    },

    products: {
      /**
       * Fetch products with optional search, filters, pagination
       */
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.category) query.set('category', params.category);
        if (params.head) query.set('head', params.head);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);

        const qs = query.toString();
        return await request(`/master/products${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Fetch single product by ID (material_id)
       */
      async getById(productId) {
        return await request(`/master/products/${productId}`, {
          method: 'GET'
        });
      },

      /**
       * Create new product in PostgreSQL company_products
       */
      async create(payload) {
        return await request('/master/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update existing product by ID (material_id)
       */
      async update(productId, payload) {
        return await request(`/master/products/${productId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Toggle active/inactive status
       */
      async updateStatus(productId, statusData) {
        return await request(`/master/products/${productId}/status`, {
          method: 'PATCH',
          body: JSON.stringify(statusData)
        });
      },

      /**
       * Delete product
       */
      async delete(productId) {
        return await request(`/master/products/${productId}`, {
          method: 'DELETE'
        });
      },

      /**
       * Bulk upload products from Excel or CSV
       */
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/master/products/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },


    employees: {
      /**
       * Fetch employees with optional search, filters, pagination
       */
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.employee_type) query.set('employee_type', params.employee_type);
        if (params.status) query.set('status', params.status);

        const qs = query.toString();
        return await request(`/master/employees${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Fetch single employee by ID
       */
      async getById(employeeId) {
        return await request(`/master/employees/${employeeId}`, {
          method: 'GET'
        });
      },

      /**
       * Create new employee in PostgreSQL company_employee_details
       */
      async create(payload) {
        return await request('/master/employees', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update employee by ID
       */
      async update(employeeId, payload) {
        return await request(`/master/employees/${employeeId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update On-Roll employee restricted fields
       */
      async updateOnRollRestricted(employeeId, payload) {
        return await this.update(employeeId, payload);
      },

      /**
       * Update Contract employee restricted fields
       */
      async updateContractRestricted(employeeId, payload) {
        return await this.update(employeeId, payload);
      },

      /**
       * Toggle employee active/inactive status
       */
      async updateStatus(employeeId, statusData) {
        return await request(`/master/employees/${employeeId}/status`, {
          method: 'PATCH',
          body: JSON.stringify(statusData)
        });
      },

      /**
       * Delete employee
       */
      async delete(employeeId) {
        return await request(`/master/employees/${employeeId}`, {
          method: 'DELETE'
        });
      },

      /**
       * Upload PDF document for employee
       */
      async uploadDocument(employeeId, documentType, file) {
        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('file', file);
        return await request(`/master/employees/${employeeId}/documents`, {
          method: 'POST',
          body: formData
        });
      },

      /**
       * List documents attached to employee
       */
      async listDocuments(employeeId) {
        return await request(`/master/employees/${employeeId}/documents`, {
          method: 'GET'
        });
      },

      /**
       * Get document download URL
       */
      getDocumentUrl(employeeId, documentType) {
        return `${API_BASE_URL}/master/employees/${employeeId}/documents/${documentType}`;
      },

      /**
       * Bulk upload employees from Excel or CSV
       */
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/master/employees/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },

    employeeBank: {
      async getAll(employeeIdOrParams = null) {
        if (typeof employeeIdOrParams === 'string' || typeof employeeIdOrParams === 'number') {
          return await request(`/master/employees/${employeeIdOrParams}/bank-details`, { method: 'GET' });
        }
        const query = new URLSearchParams();
        if (employeeIdOrParams && employeeIdOrParams.employee_id) query.set('employee_id', employeeIdOrParams.employee_id);
        const qs = query.toString();
        return await request(`/master/employee-bank-details${qs ? '?' + qs : ''}`, { method: 'GET' });
      },

      async getById(bankDetailId) {
        return await request(`/master/employee-bank-details/${bankDetailId}`, { method: 'GET' });
      },

      async create(payload, employeeId = null) {
        if (employeeId) {
          return await request(`/master/employees/${employeeId}/bank-details`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
        return await request('/master/employee-bank-details', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      async update(bankDetailId, payload) {
        return await request(`/master/employee-bank-details/${bankDetailId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      async uploadDocument(bankDetailId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request(`/master/employee-bank-details/${bankDetailId}/document`, {
          method: 'POST',
          body: formData
        });
      },

      getDocumentUrl(bankDetailId) {
        return `${API_BASE_URL}/master/employee-bank-details/${bankDetailId}/document`;
      },

      async downloadDocument(bankDetailId, defaultFileName = 'bank_document.pdf') {
        const url = `${API_BASE_URL}/master/employee-bank-details/${bankDetailId}/document`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) {
          let msg = 'Failed to download account document.';
          try {
            const errJson = await res.json();
            if (errJson && errJson.detail) msg = errJson.detail;
          } catch(e) {}
          throw new Error(msg);
        }
        const blob = await res.blob();
        const disposition = res.headers.get('content-disposition');
        let filename = defaultFileName;
        if (disposition && disposition.indexOf('filename=') !== -1) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
          a.remove();
        }, 200);
        return filename;
      }
    },

    employeeAssets: {
      async getAll(employeeIdOrParams = null) {
        if (typeof employeeIdOrParams === 'string' || typeof employeeIdOrParams === 'number') {
          return await request(`/master/employees/${employeeIdOrParams}/assets`, { method: 'GET' });
        }
        const query = new URLSearchParams();
        if (employeeIdOrParams && employeeIdOrParams.employee_id) query.set('employee_id', employeeIdOrParams.employee_id);
        const qs = query.toString();
        return await request(`/master/employee-assets${qs ? '?' + qs : ''}`, { method: 'GET' });
      },

      async create(payload, employeeId = null) {
        if (employeeId) {
          return await request(`/master/employees/${employeeId}/assets`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
        return await request('/master/employee-assets', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      async update(assetId, payload) {
        return await request(`/master/employee-assets/${assetId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      async getTotal(employeeId = null) {
        if (employeeId) {
          return await request(`/master/employees/${employeeId}/assets/total`, { method: 'GET' });
        }
        return await request('/master/employee-assets/total', { method: 'GET' });
      }
    },

    employeeSalary: {
      async getAll(employeeIdOrParams = null) {
        if (typeof employeeIdOrParams === 'string' || typeof employeeIdOrParams === 'number') {
          return await request(`/master/employees/${employeeIdOrParams}/salary-details`, { method: 'GET' });
        }
        const query = new URLSearchParams();
        if (employeeIdOrParams && employeeIdOrParams.employee_id) query.set('employee_id', employeeIdOrParams.employee_id);
        const qs = query.toString();
        return await request(`/master/employee-salary-details${qs ? '?' + qs : ''}`, { method: 'GET' });
      },

      async create(payload, employeeId = null) {
        if (employeeId) {
          return await request(`/master/employees/${employeeId}/salary-details`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
        return await request('/master/employee-salary-details', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      async update(salaryId, payload) {
        return await request(`/master/employee-salary-details/${salaryId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
    },

    customers: {
      /**
       * Fetch customers with optional search, filters, pagination
       */
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.business_type || params.businessType) query.set('business_type', params.business_type || params.businessType);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);

        const qs = query.toString();
        return await request(`/master/customers${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Fetch single customer by ID
       */
      async getById(customerId) {
        return await request(`/master/customers/${customerId}`, {
          method: 'GET'
        });
      },

      /**
       * Create new customer in PostgreSQL customer table
       */
      async create(payload) {
        return await request('/master/customers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update customer by ID
       */
      async update(customerId, payload) {
        return await request(`/master/customers/${customerId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Restricted update specifically for Indus Tower green banner edit workflow
       */
      async updateRestricted(customerId, payload) {
        return await request(`/master/customers/${customerId}/restricted`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Toggle active/inactive status
       */
      async updateStatus(customerId, statusData) {
        return await request(`/master/customers/${customerId}/status`, {
          method: 'PATCH',
          body: JSON.stringify(statusData)
        });
      },

      /**
       * Delete customer
       */
      async delete(customerId) {
        return await request(`/master/customers/${customerId}`, {
          method: 'DELETE'
        });
      },

      /**
       * Fetch contacts
       */
      async getContacts(params = {}) {
        let customerId = null;
        if (typeof params === 'number' || typeof params === 'string') {
          if (!isNaN(params)) customerId = params;
          params = {};
        } else if (params && (params.customerId || params.customer_id)) {
          customerId = params.customerId || params.customer_id;
        }

        if (customerId) {
          return await request(`/customers/${customerId}/contact-details`, {
            method: 'GET'
          });
        }

        const query = new URLSearchParams();
        if (params.customer_name || params.customerName) {
          query.set('customer_name', params.customer_name || params.customerName);
        }
        const qs = query.toString();
        return await request(`/customer-contacts${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Create contact
       */
      async createContact(payload, customerId = null) {
        const cId = customerId || (payload && (payload.customerId || payload.customer_id));
        if (cId) {
          return await request(`/customers/${cId}/contact-details`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
        return await request('/customer-contacts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Delete contact
       */
      async deleteContact(contactId) {
        return await request(`/customer-contacts/${contactId}`, {
          method: 'DELETE'
        });
      },

      /**
       * Fetch office locations
       */
      async getLocations(params = {}) {
        let customerId = null;
        if (typeof params === 'number' || typeof params === 'string') {
          if (!isNaN(params)) customerId = params;
          params = {};
        } else if (params && (params.customerId || params.customer_id)) {
          customerId = params.customerId || params.customer_id;
        }

        if (customerId) {
          return await request(`/customers/${customerId}/office-locations`, {
            method: 'GET'
          });
        }

        const query = new URLSearchParams();
        if (params.customer_name || params.customerName) {
          query.set('customer_name', params.customer_name || params.customerName);
        }
        const qs = query.toString();
        return await request(`/customer-locations${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Create office location
       */
      async createLocation(payload, customerId = null) {
        const cId = customerId || (payload && (payload.customerId || payload.customer_id));
        if (cId) {
          return await request(`/customers/${cId}/office-locations`, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
        return await request('/customer-locations', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Delete office location
       */
      async deleteLocation(officeId) {
        return await request(`/customer-locations/${officeId}`, {
          method: 'DELETE'
        });
      }
    },

    /**
     * Master Employees API
     */
    employees: {
      /**
       * List employees with optional filters
       */
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.pageSize) query.set('page_size', params.page_size || params.pageSize || 100);
        if (params.search) query.set('search', params.search);
        if (params.employee_type || params.employeeType || params.empType) {
          query.set('employee_type', params.employee_type || params.employeeType || params.empType);
        }
        if (params.status) query.set('status', params.status);

        const qs = query.toString();
        const data = await request(`/master/employees${qs ? '?' + qs : ''}`);
        return data.items || data;
      },

      /**
       * Get employee details by ID
       */
      async getById(employeeId) {
        return await request(`/master/employees/${employeeId}`);
      },

      /**
       * Create new employee
       */
      async create(payload) {
        return await request('/master/employees', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update employee details
       */
      async update(employeeId, payload) {
        return await request(`/master/employees/${employeeId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Toggle employee status
       */
      async updateStatus(employeeId, status) {
        return await request(`/master/employees/${employeeId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      },

      /**
       * Delete employee
       */
      async delete(employeeId) {
        return await request(`/master/employees/${employeeId}`, {
          method: 'DELETE'
        });
      },

      /**
       * Upload employee PDF document
       */
      async uploadDocument(employeeId, documentType, file) {
        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('file', file);
        return await request(`/master/employees/${employeeId}/documents`, {
          method: 'POST',
          body: formData
        });
      },

      /**
       * List document metadata for an employee
       */
      async getDocuments(employeeId) {
        return await request(`/master/employees/${employeeId}/documents`);
      },

      /**
       * Get direct URL to view/download PDF document
       */
      getDocumentUrl(employeeId, documentType) {
        return `${API_BASE_URL}/master/employees/${employeeId}/documents/${documentType}`;
      },

      /**
       * Bulk upload employees from Excel or CSV
       */
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/master/employees/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },

    vendors: {
      /**
       * Fetch vendors with optional search, filters, pagination
       */
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.business_type || params.businessType) query.set('business_type', params.business_type || params.businessType);
        if (params.service_type || params.serviceType) query.set('service_type', params.service_type || params.serviceType);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);

        const qs = query.toString();
        return await request(`/master/vendors${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Fetch single vendor by ID
       */
      async getById(vendorId) {
        return await request(`/master/vendors/${vendorId}`, {
          method: 'GET'
        });
      },

      /**
       * Create new vendor in PostgreSQL vendor_master
       */
      async create(payload) {
        return await request('/master/vendors', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update existing vendor by ID
       */
      async update(vendorId, payload) {
        return await request(`/master/vendors/${vendorId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Toggle active/inactive status
       */
      async updateStatus(vendorId, statusData) {
        return await request(`/master/vendors/${vendorId}/status`, {
          method: 'PATCH',
          body: JSON.stringify(statusData)
        });
      },

      /**
       * Update vendor bank details
       */
      async updateBank(vendorId, payload) {
        return await request(`/master/vendors/${vendorId}/bank`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Update vendor contact details
       */
      async updateContact(vendorId, payload) {
        return await request(`/master/vendors/${vendorId}/contact`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      /**
       * Delete vendor
       */
      async delete(vendorId) {
        return await request(`/master/vendors/${vendorId}`, {
          method: 'DELETE'
        });
      },

      /**
       * Fetch pricing / scope details for a vendor
       */
      async getPricing(vendorId, params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.status) query.set('status', params.status);

        const qs = query.toString();
        return await request(`/master/vendors/${vendorId}/pricing${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      /**
       * Create new pricing / scope record against a vendor
       */
      async createPricing(vendorId, payload) {
        return await request(`/master/vendors/${vendorId}/pricing`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    },

    vendorPricing: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.vendor_name || params.vendorName) query.set('vendor_name', params.vendor_name || params.vendorName);
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.status) query.set('status', params.status);

        const qs = query.toString();
        return await request(`/master/vendor-pricing${qs ? '?' + qs : ''}`, {
          method: 'GET'
        });
      },

      async getById(pricingId) {
        return await request(`/master/vendor-pricing/${pricingId}`, {
          method: 'GET'
        });
      },

      async create(payload) {
        return await request('/master/vendor-pricing', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },

      async update(pricingId, payload) {
        return await request(`/master/vendor-pricing/${pricingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },

      async delete(pricingId) {
        return await request(`/master/vendor-pricing/${pricingId}`, {
          method: 'DELETE'
        });
      }
    },

    company: {
      async get(params = {}) {
        const query = new URLSearchParams();
        if (params.company_name || params.companyName) query.set('company_name', params.company_name || params.companyName);
        if (params.company_id || params.companyId) query.set('company_id', params.company_id || params.companyId);
        const qs = query.toString();
        return await request(`/master/company${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getAll() {
        return await request('/master/companies', { method: 'GET' });
      },
      async update(companyIdOrName, payload) {
        return await request(`/master/company/${encodeURIComponent(companyIdOrName)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
    },

    companyBank: {
      async getAll(companyName = 'Nexus', status = null) {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        if (status) query.set('status', status);
        const qs = query.toString();
        return await request(`/master/company-bank-accounts${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async create(payload, companyName = 'Nexus') {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        const qs = query.toString();
        return await request(`/master/company-bank-accounts${qs ? '?' + qs : ''}`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(bankAccountId, payload, companyName = 'Nexus') {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        const qs = query.toString();
        return await request(`/master/company-bank-accounts/${bankAccountId}${qs ? '?' + qs : ''}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
    },

    companyLocations: {
      async getAll(companyName = 'Nexus', status = null) {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        if (status) query.set('status', status);
        const qs = query.toString();
        return await request(`/master/company-locations${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async create(payload, companyName = 'Nexus') {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        const qs = query.toString();
        return await request(`/master/company-locations${qs ? '?' + qs : ''}`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(officeId, payload, companyName = 'Nexus') {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        const qs = query.toString();
        return await request(`/master/company-locations/${officeId}${qs ? '?' + qs : ''}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
    },

    companyHolidays: {
      async getAll(companyName = 'Nexus', year = null, status = null) {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        if (year) query.set('year', year);
        if (status) query.set('status', status);
        const qs = query.toString();
        return await request(`/master/company-holidays${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async create(payload, companyName = 'Nexus') {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        const qs = query.toString();
        return await request(`/master/company-holidays${qs ? '?' + qs : ''}`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    },

    hrCompliance: {
      async getAll(companyName = 'Nexus', complianceType = null) {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        if (complianceType) query.set('compliance_type', complianceType);
        const qs = query.toString();
        return await request(`/master/hr-compliance${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async create(payload, companyName = 'Nexus') {
        const query = new URLSearchParams();
        if (companyName) query.set('company_name', companyName);
        const qs = query.toString();
        return await request(`/master/hr-compliance${qs ? '?' + qs : ''}`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    },

    indusSites: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.tower_type) query.set('tower_type', params.tower_type);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/sites${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(siteId) {
        return await request(`/customer/indus/sites/${siteId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/sites', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(siteId, payload) {
        return await request(`/customer/indus/sites/${siteId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async delete(siteId) {
        return await request(`/customer/indus/sites/${siteId}`, { method: 'DELETE' });
      },
      async getContacts(siteId) {
        return await request(`/customer/indus/sites/${siteId}/contacts`, { method: 'GET' });
      },
      async saveContact(siteId, payload) {
        return await request(`/customer/indus/sites/${siteId}/contacts`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/customer/indus/sites/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },

    indusGbpa: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.item_type) query.set('item_type', params.item_type);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/gbpa${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(itemId) {
        return await request(`/customer/indus/gbpa/${itemId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/gbpa', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(itemId, payload) {
        return await request(`/customer/indus/gbpa/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/customer/indus/gbpa/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },

    indusGbpaMaterials: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.customer_name) query.set('customer_name', params.customer_name);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/gbpa/materials${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(materialId) {
        return await request(`/customer/indus/gbpa/materials/${materialId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/gbpa/materials', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(materialId, payload) {
        return await request(`/customer/indus/gbpa/materials/${materialId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async delete(materialId) {
        return await request(`/customer/indus/gbpa/materials/${materialId}`, { method: 'DELETE' });
      },
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/customer/indus/gbpa/materials/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },

    indusGbpaExpenses: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.customer_name) query.set('customer_name', params.customer_name);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/gbpa/expenses${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(expenseId) {
        return await request(`/customer/indus/gbpa/expenses/${expenseId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/gbpa/expenses', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(expenseId, payload) {
        return await request(`/customer/indus/gbpa/expenses/${expenseId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async delete(expenseId) {
        return await request(`/customer/indus/gbpa/expenses/${expenseId}`, { method: 'DELETE' });
      },
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/customer/indus/gbpa/expenses/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },

    indusGbpaInfra: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.customer_name) query.set('customer_name', params.customer_name);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/gbpa/infra${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(infraId) {
        return await request(`/customer/indus/gbpa/infra/${infraId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/gbpa/infra', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(infraId, payload) {
        return await request(`/customer/indus/gbpa/infra/${infraId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async delete(infraId) {
        return await request(`/customer/indus/gbpa/infra/${infraId}`, { method: 'DELETE' });
      }
    },

    indusInfra: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.customer_name) query.set('customer_name', params.customer_name);
        if (params.infra_category) query.set('infra_category', params.infra_category);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/infra${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(infraId) {
        return await request(`/customer/indus/infra/${infraId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/infra', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(infraId, payload) {
        return await request(`/customer/indus/infra/${infraId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async delete(infraId) {
        return await request(`/customer/indus/infra/${infraId}`, { method: 'DELETE' });
      },
      async bulkUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/customer/indus/infra/bulk-upload', {
          method: 'POST',
          body: formData
        });
      }
    },


    indusEsh: {
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.company_name || params.companyName) query.set('company_name', params.company_name || params.companyName);
        if (params.employee_type || params.employeeType) query.set('employee_type', params.employee_type || params.employeeType);
        if (params.training_type || params.trainingType) query.set('training_type', params.training_type || params.trainingType);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/esh${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(eshId) {
        return await request(`/customer/indus/esh/${eshId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/esh', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(eshId, payload) {
        return await request(`/customer/indus/esh/${eshId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async delete(eshId) {
        return await request(`/customer/indus/esh/${eshId}`, { method: 'DELETE' });
      }
    },

    indusProjects: {
      // 1. Project Master
      async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.page_size || params.limit) query.set('page_size', params.page_size || params.limit);
        if (params.search) query.set('search', params.search);
        if (params.customer_name || params.customerName) query.set('customer_name', params.customer_name || params.customerName);
        if (params.project_type || params.projectType) query.set('project_type', params.project_type || params.projectType);
        if (params.status) query.set('status', params.status);
        if (params.sort_by) query.set('sort_by', params.sort_by);
        if (params.sort_desc !== undefined) query.set('sort_desc', params.sort_desc);
        const qs = query.toString();
        return await request(`/customer/indus/projects${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getById(projectId) {
        return await request(`/customer/indus/projects/${projectId}`, { method: 'GET' });
      },
      async create(payload) {
        return await request('/customer/indus/projects', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async update(projectId, payload) {
        return await request(`/customer/indus/projects/${projectId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async delete(projectId) {
        return await request(`/customer/indus/projects/${projectId}`, { method: 'DELETE' });
      },

      // 2. Activities (Icon 1)
      async getActivities(params = {}) {
        const query = new URLSearchParams();
        if (params.project_type || params.projectType) query.set('project_type', params.project_type || params.projectType);
        if (params.sub_project_type || params.subProjectType) query.set('sub_project_type', params.sub_project_type || params.subProjectType);
        if (params.stage) query.set('stage', params.stage);
        if (params.search) query.set('search', params.search);
        const qs = query.toString();
        return await request(`/customer/indus/projects/activities/list${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getActivityById(activityId) {
        return await request(`/customer/indus/projects-activities/${activityId}`, { method: 'GET' });
      },
      async createActivity(payload) {
        return await request('/customer/indus/projects-activities', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async updateActivity(activityId, payload) {
        return await request(`/customer/indus/projects-activities/${activityId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async deleteActivity(activityId) {
        return await request(`/customer/indus/projects-activities/${activityId}`, { method: 'DELETE' });
      },

      // 3. Transports (Icon 2)
      async getTransports(params = {}) {
        const query = new URLSearchParams();
        if (params.project_type || params.projectType) query.set('project_type', params.project_type || params.projectType);
        if (params.sub_project_type || params.subProjectType) query.set('sub_project_type', params.sub_project_type || params.subProjectType);
        if (params.customer_name || params.customerName) query.set('customer_name', params.customer_name || params.customerName);
        if (params.status) query.set('status', params.status);
        if (params.search) query.set('search', params.search);
        const qs = query.toString();
        return await request(`/customer/indus/projects/transports/list${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getTransportById(transportId) {
        return await request(`/customer/indus/projects-transports/${transportId}`, { method: 'GET' });
      },
      async createTransport(payload) {
        return await request('/customer/indus/projects-transports', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async updateTransport(transportId, payload) {
        return await request(`/customer/indus/projects-transports/${transportId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async deleteTransport(transportId) {
        return await request(`/customer/indus/projects-transports/${transportId}`, { method: 'DELETE' });
      },

      // 4. Approvals / Supply History (Icon 3)
      async getApprovals(params = {}) {
        const query = new URLSearchParams();
        if (params.sub_project_type || params.subProjectType) query.set('sub_project_type', params.sub_project_type || params.subProjectType);
        if (params.customer_name || params.customerName) query.set('customer_name', params.customer_name || params.customerName);
        if (params.search) query.set('search', params.search);
        const qs = query.toString();
        return await request(`/customer/indus/projects/approvals/list${qs ? '?' + qs : ''}`, { method: 'GET' });
      },
      async getApprovalById(approvalId) {
        return await request(`/customer/indus/projects-approvals/${approvalId}`, { method: 'GET' });
      },
      async createApproval(payload) {
        return await request('/customer/indus/projects-approvals', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async updateApproval(approvalId, payload) {
        return await request(`/customer/indus/projects-approvals/${approvalId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async deleteApproval(approvalId) {
        return await request(`/customer/indus/projects-approvals/${approvalId}`, { method: 'DELETE' });
      }
    },

    commercial: {
      async getProjects() {
        return await request('/commercial/projects', { method: 'GET' });
      },
      async savePmProjectDetails(details) {
        return await request('/commercial/projects/save-pm-details', {
          method: 'POST',
          body: JSON.stringify(details)
        });
      },
      async getProjectExpenses(poNo, siteId) {
        let url = '/commercial/projects/expenses?';
        const params = [];
        if (poNo) params.push(`po_no=${encodeURIComponent(poNo)}`);
        if (siteId) params.push(`site_id=${encodeURIComponent(siteId)}`);
        return await request(url + params.join('&'), { method: 'GET' });
      },
      async getProjectMaterials(poNo, siteId) {
        let url = '/commercial/projects/materials?';
        const params = [];
        if (poNo) params.push(`po_no=${encodeURIComponent(poNo)}`);
        if (siteId) params.push(`site_id=${encodeURIComponent(siteId)}`);
        return await request(url + params.join('&'), { method: 'GET' });
      },
      async getPoLineItems(poNo, query) {
        let url = `/commercial/projects/po-line-items?po_no=${encodeURIComponent(poNo)}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        return await request(url, { method: 'GET' });
      },
      async saveProjectExpense(expenseData) {
        return await request('/commercial/projects/expenses', {
          method: 'POST',
          body: JSON.stringify(expenseData)
        });
      },
      async editProjectUpdate(payload) {
        return await request('/commercial/projects/edit-project-update', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async saveProjectMaterial(materialData) {
        return await request('/commercial/projects/materials', {
          method: 'POST',
          body: JSON.stringify(materialData)
        });
      },
      async deleteProject(projectId) {
        return await request(`/commercial/projects/${encodeURIComponent(projectId)}`, {
          method: 'DELETE'
        });
      },
      async deleteProjects(projectIds) {
        return await request('/commercial/projects/delete', {
          method: 'POST',
          body: JSON.stringify({ project_ids: projectIds })
        });
      },
      async uploadProjects(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/commercial/projects/bulk-upload', {
          method: 'POST',
          body: formData
        });
      },
      async uploadPo(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await request('/commercial/po/bulk-upload', {
          method: 'POST',
          body: formData
        });
      },
      async bulkUpload(file, uploadType = 'projects') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_type', uploadType);
        return await request('/commercial/bulk-upload', {
          method: 'POST',
          body: formData
        });
      },
      jms: {
        async getPoDetails(poNo, siteId) {
          const url = `/commercial/jms/po-details?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async updateQty(lineItemId, jmsQty) {
          return await request(`/commercial/jms/line-items/${lineItemId}/qty`, {
            method: 'PATCH',
            body: JSON.stringify({ jmsQty: parseFloat(jmsQty) })
          });
        },
        async approveRows(lineItemIds, status = 'Approved') {
          return await request('/commercial/jms/line-items/approve', {
            method: 'POST',
            body: JSON.stringify({ lineItemIds, status })
          });
        },
        async getGbpaItems(poNo, siteId, search = '') {
          const url = `/commercial/jms/gbpa-items?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}${search ? '&search=' + encodeURIComponent(search) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async getEligibleGbpa(poNo, siteId, search = '') {
          return await this.getGbpaItems(poNo, siteId, search);
        },
        async checkItem(poNo, siteId, itemCode) {
          const url = `/commercial/jms/check-item?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}&item_code=${encodeURIComponent(itemCode || '')}`;
          return await request(url, { method: 'GET' });
        },
        async addLineItem(poNo, siteId, itemCode, qty = 1.0) {
          return await request('/commercial/jms/line-items', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, itemCode, qty })
          });
        },
        async submitJms(poNo, siteId) {
          return await request('/commercial/jms/submit', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId })
          });
        },
        async getDocuments(poNo, siteId) {
          const url = `/commercial/jms/documents?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async uploadDocument(poNoOrFormData, siteId, docType, docDetails, file) {
          let formData;
          if (poNoOrFormData instanceof FormData) {
            formData = poNoOrFormData;
          } else {
            formData = new FormData();
            formData.append('po_no', poNoOrFormData);
            if (siteId) formData.append('site_id', siteId);
            formData.append('doc_type', docType);
            formData.append('doc_details', docDetails || `${docType} Upload`);
            if (file) formData.append('file', file);
          }
          return await request('/commercial/jms/documents', {
            method: 'POST',
            body: formData
          });
        },
        async deleteDocument(documentId) {
          return await request(`/commercial/jms/documents/${documentId}`, {
            method: 'DELETE'
          });
        },
        async getExpenses(poNo, siteId) {
          const url = `/commercial/jms/expenses?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async processJms(poNo, siteId, lineItemIds = null) {
          return await request('/commercial/jms/process', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, lineItemIds })
          });
        },
        async submitSelectWorks(poNo, siteId, selectedWorks = {}) {
          return await request('/commercial/jms/select-works/submit', {
            method: 'POST',
            body: JSON.stringify({
              poNo,
              siteId,
              civil: selectedWorks.civil ?? true,
              electrical: selectedWorks.electrical ?? false,
              service: selectedWorks.service ?? false,
              eb: selectedWorks.eb ?? false
            })
          });
        },
        async downloadGeneratedPdf(poNo, siteId) {
          const url = `/commercial/jms/pdf/download?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async processPdf(poNo, siteId) {
          return await request('/commercial/jms/pdf/process', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId })
          });
        },
        async getWccDetails(poNo, siteId) {
          const url = `/commercial/jms/wcc-details?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async getPoAmendDetails(poNo, siteId) {
          const url = `/commercial/jms/po-amend-details?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async rejectRow(poNo, siteId, workflow = 'PO Amend') {
          return await request('/commercial/jms/reject', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, workflow })
          });
        },
        async submitAmendmentStatus(poNo, siteId, workflow = 'PO Amend', revisionNo = null, approvedDate = null) {
          return await request('/commercial/jms/submit-amendment-status', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, workflow, revisionNo, approvedDate })
          });
        },
        async processPdf(poNo, siteId) {
          return await request('/commercial/jms/pdf/process', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId })
          });
        }
      },
      wcc: {
        async getProjects() {
          return await request('/commercial/wcc/projects', { method: 'GET' });
        },
        async getPoDetails(poNo, siteId) {
          const url = `/commercial/jms/wcc-details?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async updateLineItemQty(lineItemId, qty, poNo, siteId) {
          return await request(`/commercial/jms/wcc/line-items/${encodeURIComponent(lineItemId)}/qty`, {
            method: 'PATCH',
            body: JSON.stringify({ qty: parseFloat(qty), poNo, siteId })
          });
        },
        async submitDetails(poNo, siteId, wccNo, wccDate, wccAmount, submissionDate = null, approvedDate = null) {
          return await request('/commercial/jms/wcc/submit-details', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, wccNo, wccDate, wccAmount, submissionDate, approvedDate })
          });
        },
        async submitReceipt(poNo, siteId, receiptNo, receiptDate, ersNo) {
          return await request('/commercial/jms/wcc/submit-receipt', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, receiptNo, receiptDate, ersNo })
          });
        },
        async rejectRow(poNo, siteId) {
          return await request('/commercial/jms/reject', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, workflow: 'WCC' })
          });
        },
        async submitAmendmentStatus(poNo, siteId, revisionNo, approvedDate) {
          return await request('/commercial/jms/submit-amendment-status', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, workflow: 'WCC', revisionNo, approvedDate })
          });
        },
        async processPdf(poNo, siteId) {
          return await request('/commercial/jms/pdf/process', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId })
          });
        }
      },
      poAmend: {
        async getProjects() {
          return await request('/commercial/po-amend/projects', { method: 'GET' });
        },
        async uploadPoAmend(file) {
          const formData = new FormData();
          formData.append('file', file);
          return await request('/commercial/po-amend/bulk-upload', {
            method: 'POST',
            body: formData
          });
        },
        async getPoDetails(poNo, siteId) {
          const url = `/commercial/jms/po-amend-details?po_no=${encodeURIComponent(poNo || '')}${siteId ? '&site_id=' + encodeURIComponent(siteId) : ''}`;
          return await request(url, { method: 'GET' });
        },
        async updateLineItemQty(lineItemId, qty, poNo, siteId) {
          return await request(`/commercial/jms/po-amend/line-items/${encodeURIComponent(lineItemId)}/qty`, {
            method: 'PATCH',
            body: JSON.stringify({ qty: parseFloat(qty), poNo, siteId })
          });
        },
        async processPdf(poNo, siteId) {
          return await request('/commercial/jms/pdf/process', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId })
          });
        },
        async submitReference(poNo, siteId, poAmendmentRefId) {
          return await request('/commercial/jms/po-amend/submit-reference', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, poAmendmentRefId })
          });
        },
        async submitAmendmentStatus(poNo, siteId, revisionNo, approvedDate) {
          return await request('/commercial/jms/submit-amendment-status', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, workflow: 'po_amend', revisionNo, approvedDate })
          });
        },
        async rejectPo(poNo, siteId) {
          return await request('/commercial/jms/reject', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, workflow: 'po_amend' })
          });
        },
        async rejectRow(poNo, siteId) {
          return await request('/commercial/jms/reject', {
            method: 'POST',
            body: JSON.stringify({ poNo, siteId, workflow: 'PO Amend' })
          });
        }
      },
      invoice: {
        async getProjects() {
          return await request('/commercial/invoice/projects', { method: 'GET' });
        },
        async submitDetails(data) {
          return await request('/commercial/invoice/submit-details', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        },
        async submitHash(data) {
          return await request('/commercial/invoice/submit-hash', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        },
        getDownloadUrl(params = {}) {
          const q = new URLSearchParams();
          if (params.invoiceNo) q.set('invoice_no', params.invoiceNo);
          if (params.poNo) q.set('po_no', params.poNo);
          if (params.siteId) q.set('site_id', params.siteId);
          if (params.irnNo) q.set('irn_no', params.irnNo);
          if (params.ersNo) q.set('ers_no', params.ersNo);
          if (params.invoiceDate) q.set('invoice_date', params.invoiceDate);
          if (params.gstType) q.set('gst_type', params.gstType);
          return `/api/v1/commercial/invoice/pdf/download?${q.toString()}`;
        }
      },
      receivable: {
        async getProjects() {
          return await request('/commercial/receivable/projects', { method: 'GET' });
        },
        async updateInvoiceAmount(data) {
          return await request('/commercial/receivable/update-invoice-amount', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        },
        async updateDeduction(data) {
          return await request('/commercial/receivable/update-deduction', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        },
        async updateReceivedAmount(data) {
          return await request('/commercial/receivable/update-received-amount', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        },
        async submitIndusPaymentReceipt(data) {
          return await request('/commercial/receivable/indus-payment-receipt', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        },
        async submitM1PaymentReceipt(data) {
          return await request('/commercial/receivable/m1-payment-receipt', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        },
        async bulkUpload(formData) {
          return await request('/commercial/receivable/bulk-upload', {
            method: 'POST',
            body: formData
          });
        }
      },
      poToBeOpen: {
        async getProjects() {
          return await request('/commercial/po-to-be-open/projects', { method: 'GET' });
        }
      },
      async rejectRow(poNo, siteId, workflow = 'PO Amend') {
        return await request('/commercial/jms/reject', {
          method: 'POST',
          body: JSON.stringify({ poNo, siteId, workflow })
        });
      },
      async submitAmendmentStatus(poNo, siteId, workflow = 'PO Amend', revisionNo = null, approvedDate = null) {
        return await request('/commercial/jms/submit-amendment-status', {
          method: 'POST',
          body: JSON.stringify({ poNo, siteId, workflow, revisionNo, approvedDate })
        });
      },
      async processPdf(poNo, siteId) {
        return await request('/commercial/jms/pdf/process', {
          method: 'POST',
          body: JSON.stringify({ poNo, siteId })
        });
      }
    },

    dpr: {
      async list(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await request(`/commercial/dpr${query ? '?' + query : ''}`, { method: 'GET' });
      },
      async update(dprId, payload) {
        return await request(`/commercial/dpr/${encodeURIComponent(dprId)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async create(payload) {
        return await request('/commercial/dpr', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    },

    purchase: {
      async listPr() {
        return await request('/purchase/pr', { method: 'GET' });
      },
      async createPr(payload) {
        return await request('/purchase/pr', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async updatePr(prId, payload) {
        return await request('/purchase/pr/' + encodeURIComponent(prId), {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      async selectSuppliers(payload) {
        return await request('/purchase/pr/select-suppliers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async listRfq() {
        return await request('/purchase/rfq', { method: 'GET' });
      },
      async saveTerms(payload) {
        return await request('/purchase/rfq/terms', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async listPo() {
        return await request('/purchase/po', { method: 'GET' });
      },
      async getPo(poId) {
        return await request('/purchase/po/' + encodeURIComponent(poId), { method: 'GET' });
      },
      async updatePoStatus(poId, newStatus) {
        return await request('/purchase/po/' + encodeURIComponent(poId) + '/status?new_status=' + encodeURIComponent(newStatus), {
          method: 'PUT'
        });
      },
      async saveTransportDetails(poId, payload) {
        return await request('/purchase/po/' + encodeURIComponent(poId) + '/transport-details', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async uploadDocuments(poId, payload) {
        return await request('/purchase/po/' + encodeURIComponent(poId) + '/upload-documents', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async getDocument(poId, docType) {
        return await request('/purchase/po/' + encodeURIComponent(poId) + '/document/' + encodeURIComponent(docType), {
          method: 'GET'
        });
      },
      async generatePoPdf(poIdentifier) {
        if (typeof poIdentifier === 'object') {
          return await request('/purchase/po/trigger-pdf', {
            method: 'POST',
            body: JSON.stringify(poIdentifier)
          });
        }
        return await request('/purchase/po/' + encodeURIComponent(poIdentifier) + '/generate-pdf', {
          method: 'POST'
        });
      },
      async getPoPdfStatus(poId) {
        return await request('/purchase/po/' + encodeURIComponent(poId) + '/pdf-status', {
          method: 'GET'
        });
      },
      getPoPdfUrl(poId) {
        return `${API_BASE_URL}/purchase/po/${encodeURIComponent(poId)}/pdf`;
      },
      async submitTransportPayment(payload) {
        return await request('/purchase/transport-payment', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async syncPurchasePayment(payload) {
        return await request('/purchase/payment', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async listPurchasePayments() {
        return await request('/purchase/payment', {
          method: 'GET'
        });
      }
    },

    accounts: {
      async getPayments() {
        return await request('/accounts/payments', {
          method: 'GET'
        });
      },
      async createPayment(payload) {
        return await request('/accounts/payments', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async submitPayments(payload) {
        return await request('/accounts/payments/submit', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async getBankEntries() {
        return await request('/accounts/bank', {
          method: 'GET'
        });
      },
      async createBankEntry(payload) {
        return await request('/accounts/bank', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async submitBankEntries(payload) {
        return await request('/accounts/bank/submit', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async getReceivables() {
        return await request('/accounts/receivable', {
          method: 'GET'
        });
      },
      async getGstr1() {
        return await request('/accounts/gstr1', {
          method: 'GET'
        });
      },
      async submitGstr1(payload) {
        return await request('/accounts/gstr1/submit', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async getGstr2b() {
        return await request('/accounts/gstr2b', {
          method: 'GET'
        });
      },
      async submitGstr2b(payload) {
        return await request('/accounts/gstr2b/submit', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async getTds() {
        return await request('/accounts/tds', {
          method: 'GET'
        });
      },
      async submitTdsChallan(payload) {
        return await request('/accounts/tds/challan', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      async getGstr3b(year, month) {
        const params = [];
        if (year) params.push(`year=${encodeURIComponent(year)}`);
        if (month) params.push(`month=${encodeURIComponent(month)}`);
        const qs = params.length ? `?${params.join('&')}` : '';
        return await request(`/accounts/gstr3b${qs}`, {
          method: 'GET'
        });
      },
      async submitGstr3bReturns(payload) {
        return await request('/accounts/gstr3b/submit', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      module: {
        async getSales() {
          return await request('/accounts/module/sales', { method: 'GET' });
        },
        async getPurchase() {
          return await request('/accounts/module/purchase', { method: 'GET' });
        },
        async getPayment() {
          return await request('/accounts/module/payment', { method: 'GET' });
        },
        async getReceipt() {
          return await request('/accounts/module/receipt', { method: 'GET' });
        },
        async getBank() {
          return await request('/accounts/module/bank', { method: 'GET' });
        },
        async getTds() {
          return await request('/accounts/module/tds', { method: 'GET' });
        },
        async getGst() {
          return await request('/accounts/module/gst', { method: 'GET' });
        }
      }
    },

    clearCache: clearClientApiCache
  };

  window.NexusApi = NexusApi;
})(window);



