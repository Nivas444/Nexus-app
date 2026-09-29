/**
 * Nexus ERP API Client Module
 * Handles HTTP communications with FastAPI backend (/api/v1).
 */
(function(window) {
  'use strict';

  const isLocal = typeof window !== 'undefined' && window.location && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.protocol === 'file:'
  );

  const storedApiUrl = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.getItem('API_BASE_URL') : null;
  const API_BASE_URL = window.API_BASE_URL || storedApiUrl || (isLocal ? 'http://127.0.0.1:8000/api/v1' : '/api/v1');

  async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Accept': 'application/json'
    };

    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      
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
        const err = new Error(errorDetail || 'Request failed');
        err.status = response.status;
        err.statusCode = response.status;
        err.detail = errorDetail;
        err.data = data;
        err.isConflict = (response.status === 409);
        throw err;
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const friendlyMsg = `Cannot connect to FastAPI backend at ${API_BASE_URL}. Please ensure backend is running via: python -m uvicorn app.main:app --port 8000`;
        console.error(friendlyMsg, error);
        throw new Error(friendlyMsg);
      }
      console.error(`API Request failed for ${url}:`, error);
      throw error;
    }
  }

  const NexusApi = {
    baseUrl: API_BASE_URL,

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
      async createContact(payload) {
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
      async createLocation(payload) {
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
    }
  };

  window.NexusApi = NexusApi;
})(window);
