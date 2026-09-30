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
    }
  };

  window.NexusApi = NexusApi;
})(window);

