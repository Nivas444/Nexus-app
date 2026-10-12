/**
 * Master Customers Module
 * Extracted from home.js
 * Handles customer dataset loading, Indus Telecom details modal, customer location & contact modals, viewing, and creation.
 */
(function(window) {
  'use strict';

  window.masterCustomerData = window.masterCustomerData || [
    {
      id: "cust-1",
      customer_id: 1,
      customerName: "Indus Towers Ltd",
      customer_name: "Indus Towers Ltd",
      legal_name: "Indus Towers Ltd",
      customerId: "230510678",
      customer_code: "230510678",
      businessType: "Projects",
      business_type: "Projects",
      gstNumber: "33ASMPM8643F1Z5",
      gst_number: "33ASMPM8643F1Z5",
      gstType: "SGST",
      gst_type: "SGST",
      invoiceType: "B2B",
      invoice_type: "B2B",
      panNumber: "33ASMPM8643F",
      pan_number: "33ASMPM8643F",
      address: "Building 10, DLF Cyber City, Gurugram, Haryana - 122002",
      gst_address: "Building 10, DLF Cyber City, Gurugram, Haryana - 122002",
      poDigits: "450",
      po_stating_3_digits: "450",
      status: "Active"
    }
  ];
  window.customerLocationData = window.customerLocationData || [];
  window.customerContactData = window.customerContactData || [];
  window.activeCustomerLocFilters = window.activeCustomerLocFilters || {};
  window.currentCustomerLocFilterCol = window.currentCustomerLocFilterCol || null;
  window.activeCustomerContactFilters = window.activeCustomerContactFilters || {};
  window.currentCustomerContactFilterCol = window.currentCustomerContactFilterCol || null;
  let isSavingCustomerLocation = false;
  let isSavingCustomerContact = false;
  let isTelecomDetailsEditing = false;

  // Load master customers from API
  window.loadMasterCustomersFromApi = async function() {
    if (typeof NexusApi !== 'undefined' && NexusApi.customers) {
      try {
        const response = await NexusApi.customers.getAll({ limit: 500 });
        let items = [];
        if (response && Array.isArray(response.items)) {
          items = response.items;
        } else if (Array.isArray(response)) {
          items = response;
        }
        if (items.length > 0) {
          masterCustomerData = items.map(c => ({
            ...c,
            id: c.customer_id || c.id || `cust-${c.customer_code || Date.now()}`,
            customerName: c.customer_name || c.customerName || c.legal_name || 'Customer',
            customerId: c.customer_code || c.customerId || c.customer_id || '',
            businessType: c.business_type || c.businessType || 'Projects',
            gstNumber: c.gst_number || c.gstNumber || 'NA',
            gstType: c.gst_type || c.gstType || 'SGST',
            invoiceType: c.invoice_type || c.invoiceType || 'B2B',
            panNumber: c.pan_number || c.panNumber || '',
            address: c.gst_address || c.address || '',
            poDigits: c.po_stating_3_digits || c.poDigits || '',
            status: c.status || 'Active'
          }));
        }
      } catch (err) {
        console.error('Error fetching master customers from API:', err);
        if (typeof showToast === 'function') {
          showToast('Could not load customers from database: ' + (err.message || err));
        }
      }
    }
    if (typeof currentModule !== 'undefined' && currentModule === 'master' && typeof currentMasterSubpage !== 'undefined' && currentMasterSubpage === 'customer') {
      currentDataset = [...masterCustomerData];
      if (typeof applyFiltersAndRender === 'function') {
        applyFiltersAndRender();
      }
    }
  };

  // Telecom Details Modal Handlers
  window.setTelecomDetailsReadOnly = function(isReadOnly) {
    const form = document.getElementById('frmTelecomDetails');
    if (!form) return;
  
    // 1. Business Type, Customer Legal Name, PO Starting Digits, PAN Number are always strictly read-only
    const alwaysReadOnlyIds = ['inpTelecomBusinessType', 'inpTelecomCustomerName', 'inpTelecomPoDigits', 'inpTelecomPanNumber'];
    alwaysReadOnlyIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.readOnly = true;
        el.disabled = true;
        el.style.background = '#f8fafc';
        el.style.color = '#64748b';
        el.style.cursor = 'not-allowed';
        el.style.borderColor = '#cbd5e1';
      }
    });
  
    // 2. GST Slidebar Toggle
    const gstToggle = document.getElementById('inpTelecomGstToggle');
    if (gstToggle) {
      gstToggle.disabled = isReadOnly;
      const parentSwitch = gstToggle.closest('.toggle-slide-switch');
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
      }
    }
  
    // 3. GST Type & GST Number
    const isGstOn = gstToggle ? gstToggle.checked : true;
    const rowGstType = document.getElementById('rowTelecomGstType');
    const rowGstNumber = document.getElementById('rowTelecomGstNumber');
    const inpGstType = document.getElementById('inpTelecomGstType');
    const inpGstNumber = document.getElementById('inpTelecomGstNumber');
  
    if (rowGstType) rowGstType.style.display = isGstOn ? 'flex' : 'none';
    if (rowGstNumber) rowGstNumber.style.display = isGstOn ? 'flex' : 'none';
  
    if (inpGstType) {
      inpGstType.disabled = isReadOnly || !isGstOn;
      inpGstType.style.background = (isReadOnly || !isGstOn) ? '#f8fafc' : '#ffffff';
      inpGstType.style.color = (isReadOnly || !isGstOn) ? '#64748b' : '#1e293b';
      inpGstType.style.cursor = (isReadOnly || !isGstOn) ? 'not-allowed' : 'pointer';
      inpGstType.style.borderColor = isReadOnly ? '#cbd5e1' : '#00cba0';
    }
  
    if (inpGstNumber) {
      inpGstNumber.readOnly = isReadOnly || !isGstOn;
      inpGstNumber.disabled = isReadOnly || !isGstOn;
      inpGstNumber.style.background = (isReadOnly || !isGstOn) ? '#f8fafc' : '#ffffff';
      inpGstNumber.style.color = (isReadOnly || !isGstOn) ? '#64748b' : '#1e293b';
      inpGstNumber.style.cursor = (isReadOnly || !isGstOn) ? 'not-allowed' : 'text';
      inpGstNumber.style.borderColor = isReadOnly ? '#cbd5e1' : '#00cba0';
    }
  
    // 4. Address (Editable when edit mode active)
    const inpAddress = document.getElementById('inpTelecomAddress');
    if (inpAddress) {
      inpAddress.readOnly = isReadOnly;
      inpAddress.disabled = isReadOnly;
      inpAddress.style.background = isReadOnly ? '#f8fafc' : '#ffffff';
      inpAddress.style.color = isReadOnly ? '#64748b' : '#1e293b';
      inpAddress.style.cursor = isReadOnly ? 'not-allowed' : 'text';
      inpAddress.style.borderColor = isReadOnly ? '#cbd5e1' : '#00cba0';
    }
  
    // 5. Status Slidebar Toggle (Editable when edit mode active)
    const statusToggle = document.getElementById('inpTelecomStatusToggle');
    if (statusToggle) {
      statusToggle.disabled = isReadOnly;
      const parentSwitch = statusToggle.closest('.toggle-slide-switch');
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
      }
    }
  
    // 6. Edit/Save Icon update
    const imgIcon = document.getElementById('imgTelecomDetailsEditIcon');
    const btnToggle = document.getElementById('btnTelecomDetailsEditToggle');
    if (imgIcon && btnToggle) {
      if (isReadOnly) {
        imgIcon.src = 'icons/Edit.svg';
        imgIcon.alt = 'Edit';
        btnToggle.title = 'Edit Info';
      } else {
        imgIcon.src = 'icons/Save.svg';
        imgIcon.alt = 'Save';
        btnToggle.title = 'Save Changes';
      }
    }
  };
  
  window.handleTelecomGstToggleChange = function() {
    const gstToggle = document.getElementById('inpTelecomGstToggle');
    const isGstOn = gstToggle ? gstToggle.checked : true;
    const rowGstType = document.getElementById('rowTelecomGstType');
    const rowGstNumber = document.getElementById('rowTelecomGstNumber');
    const inpGstType = document.getElementById('inpTelecomGstType');
    const inpGstNumber = document.getElementById('inpTelecomGstNumber');
  
    if (rowGstType) rowGstType.style.display = isGstOn ? 'flex' : 'none';
    if (rowGstNumber) rowGstNumber.style.display = isGstOn ? 'flex' : 'none';
  
    if (inpGstType) {
      inpGstType.disabled = !isTelecomDetailsEditing || !isGstOn;
      inpGstType.style.background = (!isTelecomDetailsEditing || !isGstOn) ? '#f8fafc' : '#ffffff';
      inpGstType.style.color = (!isTelecomDetailsEditing || !isGstOn) ? '#64748b' : '#1e293b';
      inpGstType.style.cursor = (!isTelecomDetailsEditing || !isGstOn) ? 'not-allowed' : 'pointer';
      inpGstType.style.borderColor = !isTelecomDetailsEditing ? '#cbd5e1' : '#00cba0';
    }
  
    if (inpGstNumber) {
      inpGstNumber.readOnly = !isTelecomDetailsEditing || !isGstOn;
      inpGstNumber.disabled = !isTelecomDetailsEditing || !isGstOn;
      inpGstNumber.style.background = (!isTelecomDetailsEditing || !isGstOn) ? '#f8fafc' : '#ffffff';
      inpGstNumber.style.color = (!isTelecomDetailsEditing || !isGstOn) ? '#64748b' : '#1e293b';
      inpGstNumber.style.cursor = (!isTelecomDetailsEditing || !isGstOn) ? 'not-allowed' : 'text';
      inpGstNumber.style.borderColor = !isTelecomDetailsEditing ? '#cbd5e1' : '#00cba0';
    }
  };
  
  window.openTelecomDetailsModal = function() {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
  
    const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
    cards.forEach(card => {
      if (card.id !== 'telecomDetailsCard') card.style.display = 'none';
    });
  
    const cust = (typeof masterCustomerData !== 'undefined' && masterCustomerData.find(c => ((c.customerName || c.customer_name || '').toLowerCase().includes('indus')))) || 
                 (typeof masterCustomerData !== 'undefined' && masterCustomerData[0]) || {
                   customerName: "Indus Towers Ltd",
                   customerId: "230510678",
                   businessType: "Projects",
                   panNumber: "33ASMPM8643F",
                   poDigits: "450",
                   gstNumber: "33ASMPM8643F1Z5",
                   gstType: "SGST",
                   address: "Building 10, DLF Cyber City, Gurugram, Haryana - 122002",
                   status: "Active",
                   gstEnabled: true
                 };
  
    const inpType = document.getElementById('inpTelecomBusinessType');
    if (inpType) inpType.value = cust.businessType || cust.business_type || 'Projects';
  
    const inpName = document.getElementById('inpTelecomCustomerName');
    if (inpName) inpName.value = cust.customerName || cust.customer_name || 'Indus Towers Ltd';
  
    const inpDigits = document.getElementById('inpTelecomPoDigits');
    if (inpDigits) inpDigits.value = cust.poDigits || cust.po_stating_3_digits || '450';
  
    const inpPan = document.getElementById('inpTelecomPanNumber');
    if (inpPan) inpPan.value = cust.panNumber || cust.pan_number || '33ASMPM8643F';
  
    const inpGstToggle = document.getElementById('inpTelecomGstToggle');
    if (inpGstToggle) {
      inpGstToggle.checked = (cust.gstEnabled !== false && cust.gstNumber !== 'NA' && cust.gst_number !== 'NA');
    }
  
    const inpGstType = document.getElementById('inpTelecomGstType');
    if (inpGstType) inpGstType.value = cust.gstType || cust.gst_type || 'SGST';
  
    const inpGstNumber = document.getElementById('inpTelecomGstNumber');
    const actualGst = cust.gstNumber || cust.gst_number;
    if (inpGstNumber) inpGstNumber.value = (actualGst && actualGst !== 'NA') ? actualGst : '33ASMPM8643F1Z5';
  
    const inpAddress = document.getElementById('inpTelecomAddress');
    if (inpAddress) inpAddress.value = cust.address || cust.gst_address || 'Building 10, DLF Cyber City, Gurugram, Haryana - 122002';
  
    const inpStatus = document.getElementById('inpTelecomStatusToggle');
    if (inpStatus) inpStatus.checked = !((cust.status || '').toLowerCase().includes('in'));
  
    // Initial mode is view-only (read-only) with Edit icon
    isTelecomDetailsEditing = false;
    setTelecomDetailsReadOnly(true);
  
    const lblCardTitle = document.getElementById('lblTelecomDetailsCardTitle');
    if (lblCardTitle) lblCardTitle.innerText = cust.customerName || cust.customer_name || 'Indus Towers Ltd';
  
    const modal = document.getElementById('telecomDetailsCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
    showToast('Opened Indus Towers Ltd Details');
  };
  
  window.closeTelecomDetailsModal = function() {
    const modal = document.getElementById('telecomDetailsCard');
    if (modal) modal.style.display = 'none';
    const overlay = document.getElementById('sideFormOverlay');
    if (overlay) overlay.style.display = 'none';
  };
  
  window.toggleTelecomDetailsEdit = async function() {
    if (!isTelecomDetailsEditing) {
      // Switch to edit mode
      isTelecomDetailsEditing = true;
      setTelecomDetailsReadOnly(false);
      showToast('Edit mode enabled for GST, Address, and Status');
    } else {
      // Save changes
      const gstToggle = document.getElementById('inpTelecomGstToggle');
      const isGstOn = gstToggle ? gstToggle.checked : true;
      const gstType = isGstOn ? (document.getElementById('inpTelecomGstType')?.value || 'SGST') : 'NA';
      const gstNumber = isGstOn ? (document.getElementById('inpTelecomGstNumber')?.value?.trim() || 'NA') : 'NA';
      const address = document.getElementById('inpTelecomAddress')?.value?.trim() || '';
      const statusToggle = document.getElementById('inpTelecomStatusToggle');
      const status = (statusToggle && statusToggle.checked) ? 'Active' : 'In - Active';
  
      const cust = (typeof masterCustomerData !== 'undefined' && masterCustomerData.find(c => ((c.customerName || c.customer_name || '').toLowerCase().includes('indus')))) || 
                   (typeof masterCustomerData !== 'undefined' && masterCustomerData[0]);
  
      const payload = {
        gstEnabled: isGstOn,
        gst_enabled: isGstOn,
        gstType: gstType,
        gst_type: gstType,
        gstNumber: gstNumber,
        gst_number: gstNumber,
        address: address,
        gst_address: address,
        status: status
      };
  
      if (cust && (cust.customer_id || cust.id) && typeof NexusApi !== 'undefined' && NexusApi.customers) {
        try {
          const custId = cust.customer_id || cust.id;
          const updated = await NexusApi.customers.updateRestricted(custId, payload);
          Object.assign(cust, updated);
          if (typeof currentModule !== 'undefined' && currentModule === 'master' && typeof currentMasterSubpage !== 'undefined' && currentMasterSubpage === 'customer') {
            currentDataset = [...masterCustomerData];
            applyFiltersAndRender();
          }
          isTelecomDetailsEditing = false;
          setTelecomDetailsReadOnly(true);
          if (typeof showSvgSuccessPopup === 'function') {
            showSvgSuccessPopup('Customer updated successfully!', 'Task Completed');
          } else {
            showToast('Telecom Details saved successfully!');
          }
        } catch (err) {
          console.error('Failed to update Indus Tower details:', err);
          const msg = err.detail || err.message || 'Failed to update customer details.';
          if (typeof showSvgErrorPopup === 'function') {
            showSvgErrorPopup(msg, 'Error Message!');
          } else {
            showToast(`Error: ${msg}`);
          }
        }
      } else {
        if (cust) {
          cust.gstEnabled = isGstOn;
          cust.gstType = gstType;
          cust.gstNumber = gstNumber;
          cust.address = address;
          cust.status = status;
        }
  
        if (typeof currentModule !== 'undefined' && currentModule === 'master' && typeof currentMasterSubpage !== 'undefined' && currentMasterSubpage === 'customer') {
          currentDataset = [...masterCustomerData];
          applyFiltersAndRender();
        }
  
        isTelecomDetailsEditing = false;
        setTelecomDetailsReadOnly(true);
        showToast('Telecom Details saved successfully!');
      }
    }
  };


  // Customer Location & Contact Handlers
  function getCurrentCustomerContext() {
    const inpName = document.getElementById('inpCustomerName')?.value?.trim();
    const inpProj = document.getElementById('inpCustomerProjectName')?.value?.trim();
    const name = inpName || inpProj || window.currentCustomerName || (window.currentCustomerContext && (window.currentCustomerContext.customerName || window.currentCustomerContext.customer_name || window.currentCustomerContext.legalName)) || '';
    const id = window.currentCustomerId || (window.currentCustomerContext && (window.currentCustomerContext.customer_id || window.currentCustomerContext.id)) || null;
    return { customer_name: name, customer_id: id };
  }
  
  // --- CUSTOMER LOCATION MODAL HANDLERS ---
  window.loadCustomerLocationsFromApi = async function() {
    try {
      const { customer_name, customer_id } = getCurrentCustomerContext();
      let res;
      if (customer_id) {
        res = await NexusApi.customers.getLocations({ customerId: customer_id });
      } else if (customer_name) {
        res = await NexusApi.customers.getLocations({ customerName: customer_name });
      } else {
        res = await NexusApi.customers.getLocations();
      }
      if (res && res.items) {
        customerLocationData = res.items.map(item => ({
          id: item.office_id || item.id,
          office_id: item.office_id || item.id,
          officeName: item.office_name || item.officeName || '',
          latitude: item.latitude !== null && item.latitude !== undefined ? String(item.latitude) : '',
          longitude: item.longitude !== null && item.longitude !== undefined ? String(item.longitude) : '',
          status: item.status || 'Active',
          customer_name: item.customer_name || item.customerName || ''
        }));
      } else {
        customerLocationData = [];
      }
    } catch (err) {
      console.error('Failed to load customer locations from backend:', err);
      customerLocationData = [];
    }
    renderCustomerLocationTable();
  };
  
  window.openCustomerLocationModal = function() {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
  
    const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
    cards.forEach(card => {
      if (card.id !== 'customerLocationSidePanel') card.style.display = 'none';
    });
  
    const modal = document.getElementById('customerLocationSidePanel');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
    activeCustomerLocFilters = {};
    currentCustomerLocFilterCol = null;
    loadCustomerLocationsFromApi();
  };
  
  window.closeCustomerLocationModal = function() {
    const modal = document.getElementById('customerLocationSidePanel');
    if (modal) modal.style.display = 'none';
    const customerCard = document.getElementById('addCustomerCard');
    if (customerCard && currentModule === 'master' && currentMasterSubpage === 'customer') {
      customerCard.style.display = 'block';
    } else {
      const overlay = document.getElementById('sideFormOverlay');
      if (overlay) overlay.style.display = 'none';
    }
  };
  
  window.renderCustomerLocationTable = function() {
    const tbody = document.getElementById('tbodyCustomerLocationDetails');
    if (!tbody) return;
  
    let filtered = [...customerLocationData];
  
    for (const [colKey, allowedSet] of Object.entries(activeCustomerLocFilters)) {
      if (allowedSet && allowedSet instanceof Set) {
        filtered = filtered.filter(item => {
          const val = String(item[colKey] !== undefined ? item[colKey] : '');
          return allowedSet.has(val);
        });
      }
    }
  
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 24px; color: #64748b; font-weight: 500; font-size: 14px;">
            No office locations found
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = filtered.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
            <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #1e293b; font-weight: 500;" title="${(row.officeName || '').replace(/"/g, '&quot;')}">${row.officeName || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 6px; white-space: nowrap; color: #1e293b; font-family: monospace;">${row.latitude || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 6px; white-space: nowrap; color: #1e293b; font-family: monospace;">${row.longitude || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 6px; white-space: nowrap;">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status || 'Active'}</span>
            </td>
          </tr>
        `;
      }).join('');
    }
  
    // Update filter button active states
    const btnOffice = document.getElementById('btnCustomerLocOfficeFilter');
    if (btnOffice) {
      if (activeCustomerLocFilters['officeName']) btnOffice.classList.add('has-active-filter');
      else btnOffice.classList.remove('has-active-filter');
    }
    const btnStatus = document.getElementById('btnCustomerLocStatusFilter');
    if (btnStatus) {
      if (activeCustomerLocFilters['status']) btnStatus.classList.add('has-active-filter');
      else btnStatus.classList.remove('has-active-filter');
    }
  };
  
  window.openCustomerLocationAddForm = function() {
    const panel = document.getElementById('customerLocationSidePanel');
    if (panel) panel.style.display = 'none';
  
    const formCard = document.getElementById('addCustomerLocationCard');
    if (formCard) {
      formCard.style.display = 'block';
      const frm = document.getElementById('frmAddCustomerLocation');
      if (frm) frm.reset();
      const stToggle = document.getElementById('inpCustLocStatusToggle');
      if (stToggle) stToggle.checked = true;
    }
  };
  
  window.closeAddCustomerLocationForm = function() {
    const formCard = document.getElementById('addCustomerLocationCard');
    if (formCard) formCard.style.display = 'none';
  
    const panel = document.getElementById('customerLocationSidePanel');
    if (panel) panel.style.display = 'block';
  };
  
  window.saveCustomerLocation = async function() {
    if (isSavingCustomerLocation) return;
  
    const name = document.getElementById('inpCustLocOfficeName')?.value?.trim();
    const lat = document.getElementById('inpCustLocLatitude')?.value?.trim() || '';
    const lng = document.getElementById('inpCustLocLongitude')?.value?.trim() || '';
    const isChecked = document.getElementById('inpCustLocStatusToggle')?.checked;
    const status = isChecked ? 'Active' : 'In - Active';
  
    if (!name) {
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup("Please enter Office Name", "Error Message!");
      } else {
        showToast('Please enter Office Name');
      }
      return;
    }
  
    const { customer_name, customer_id } = getCurrentCustomerContext();
    const payload = {
      customer_name: customer_name || 'Indus Towers Ltd',
      office_name: name,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      status: status
    };
  
    isSavingCustomerLocation = true;
    try {
      await NexusApi.customers.createLocation(payload, customer_id);
  
      if (typeof showSvgSuccessPopup === 'function') {
        showSvgSuccessPopup('Office location added successfully!', 'Task Completed');
      } else {
        showToast('Office location added successfully!');
      }
  
      await loadCustomerLocationsFromApi();
      closeAddCustomerLocationForm();
    } catch (err) {
      console.error('Failed to save office location:', err);
      const msg = (err && (err.message || err.detail)) || 'Failed to add office location. Please try again.';
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(msg, 'Error Message!');
      } else {
        showToast(msg);
      }
    } finally {
      isSavingCustomerLocation = false;
    }
  };
  
  window.openCustomerLocFilter = function(colKey, event) {
    if (event) event.stopPropagation();
    currentCustomerLocFilterCol = colKey;
    const dropdown = document.getElementById('excelFilterDropdown');
    const searchInput = document.getElementById('filterSearchInput');
    const chkList = document.getElementById('filterCheckboxList');
    const chkSelectAll = document.getElementById('chkFilterSelectAll');
  
    if (!dropdown) return;
    if (searchInput) searchInput.value = '';
  
    const uniqueValues = Array.from(new Set(customerLocationData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  
    const activeSet = activeCustomerLocFilters[colKey];
  
    chkList.innerHTML = uniqueValues.map(val => {
      const isChecked = activeSet ? activeSet.has(val) : true;
      const displayLabel = val === '' ? '(Blanks)' : val;
      return `
        <label class="excel-checkbox-item excel-filter-dynamic-item" data-val="${val}">
          <input type="checkbox" value="${val}" ${isChecked ? 'checked' : ''}>
          <span class="chk-label">${displayLabel}</span>
        </label>
      `;
    }).join('');
  
    if (chkSelectAll) {
      chkSelectAll.checked = !activeSet || activeSet.size === uniqueValues.length;
    }
  
    const targetBtn = event ? event.currentTarget : document.getElementById(colKey === 'officeName' ? 'btnCustomerLocOfficeFilter' : 'btnCustomerLocStatusFilter');
    const rect = targetBtn ? targetBtn.getBoundingClientRect() : { left: 200, bottom: 200 };
    const dropdownWidth = 280;
    let leftPos = rect.left;
    if (leftPos + dropdownWidth > window.innerWidth - 16) {
      leftPos = window.innerWidth - dropdownWidth - 16;
    }
  
    dropdown.dataset.filterContext = 'customerLoc';
    dropdown.style.display = 'flex';
    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
    dropdown.style.left = `${Math.max(12, leftPos)}px`;
  
    if (searchInput) searchInput.focus();
  };
  
  // --- CUSTOMER CONTACT MODAL HANDLERS ---
  window.loadCustomerContactsFromApi = async function() {
    try {
      const { customer_name, customer_id } = getCurrentCustomerContext();
      let res;
      if (customer_id) {
        res = await NexusApi.customers.getContacts({ customerId: customer_id });
      } else if (customer_name) {
        res = await NexusApi.customers.getContacts({ customerName: customer_name });
      } else {
        res = await NexusApi.customers.getContacts();
      }
      if (res && res.items) {
        customerContactData = res.items.map(item => ({
          id: item.contact_id || item.id,
          contact_id: item.contact_id || item.id,
          name: item.name || '',
          designation: item.designation || '',
          contact: item.contact_number || item.contact || '',
          email: item.email || '',
          status: item.status || 'Active',
          customer_name: item.customer_name || item.customerName || ''
        }));
      } else {
        customerContactData = [];
      }
    } catch (err) {
      console.error('Failed to load customer contacts from backend:', err);
      customerContactData = [];
    }
    renderCustomerContactTable();
  };
  
  window.openCustomerContactModal = function() {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
  
    const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
    cards.forEach(card => {
      if (card.id !== 'customerContactSidePanel') card.style.display = 'none';
    });
  
    const modal = document.getElementById('customerContactSidePanel');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
    activeCustomerContactFilters = {};
    currentCustomerContactFilterCol = null;
    loadCustomerContactsFromApi();
  };
  
  window.closeCustomerContactModal = function() {
    const modal = document.getElementById('customerContactSidePanel');
    if (modal) modal.style.display = 'none';
    const customerCard = document.getElementById('addCustomerCard');
    if (customerCard && currentModule === 'master' && currentMasterSubpage === 'customer') {
      customerCard.style.display = 'block';
    } else {
      const overlay = document.getElementById('sideFormOverlay');
      if (overlay) overlay.style.display = 'none';
    }
  };
  
  window.renderCustomerContactTable = function() {
    const tbody = document.getElementById('tbodyCustomerContactDetails');
    if (!tbody) return;
  
    let filtered = [...customerContactData];
  
    for (const [colKey, allowedSet] of Object.entries(activeCustomerContactFilters)) {
      if (allowedSet && allowedSet instanceof Set) {
        filtered = filtered.filter(item => {
          const val = String(item[colKey] !== undefined ? item[colKey] : '');
          return allowedSet.has(val);
        });
      }
    }
  
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px; color: #64748b; font-weight: 500; font-size: 14px;">
            No contact details found
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = filtered.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
            <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #0454e4; font-weight: 500;" title="${(row.name || '').replace(/"/g, '&quot;')}">${row.name || ''}</td>
            <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #1e293b; font-weight: 500;" title="${(row.designation || '').replace(/"/g, '&quot;')}">${row.designation || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-family: monospace;">${row.contact || ''}</td>
            <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #1e293b;" title="${(row.email || '').replace(/"/g, '&quot;')}">${row.email || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 6px; white-space: nowrap;">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status || 'Active'}</span>
            </td>
          </tr>
        `;
      }).join('');
    }
  
    // Update filter button active states
    const btnName = document.getElementById('btnCustomerContactNameFilter');
    if (btnName) {
      if (activeCustomerContactFilters['name']) btnName.classList.add('has-active-filter');
      else btnName.classList.remove('has-active-filter');
    }
    const btnDesig = document.getElementById('btnCustomerContactDesigFilter');
    if (btnDesig) {
      if (activeCustomerContactFilters['designation']) btnDesig.classList.add('has-active-filter');
      else btnDesig.classList.remove('has-active-filter');
    }
    const btnStatus = document.getElementById('btnCustomerContactStatusFilter');
    if (btnStatus) {
      if (activeCustomerContactFilters['status']) btnStatus.classList.add('has-active-filter');
      else btnStatus.classList.remove('has-active-filter');
    }
  };
  
  window.openCustomerContactAddForm = function() {
    const panel = document.getElementById('customerContactSidePanel');
    if (panel) panel.style.display = 'none';
  
    const formCard = document.getElementById('addCustomerContactCard');
    if (formCard) {
      formCard.style.display = 'block';
      const frm = document.getElementById('frmAddCustomerContact');
      if (frm) frm.reset();
      const stToggle = document.getElementById('inpCustContactStatusToggle');
      if (stToggle) stToggle.checked = true;
    }
  };
  
  window.closeAddCustomerContactForm = function() {
    const formCard = document.getElementById('addCustomerContactCard');
    if (formCard) formCard.style.display = 'none';
  
    const panel = document.getElementById('customerContactSidePanel');
    if (panel) panel.style.display = 'block';
  };
  
  window.saveCustomerContact = async function() {
    if (isSavingCustomerContact) return;
  
    const name = document.getElementById('inpCustContactName')?.value?.trim();
    const desig = document.getElementById('inpCustContactDesignation')?.value?.trim() || '';
    const phone = document.getElementById('inpCustContactPhone')?.value?.trim() || '';
    const email = document.getElementById('inpCustContactEmail')?.value?.trim() || '';
    const isChecked = document.getElementById('inpCustContactStatusToggle')?.checked;
    const status = isChecked ? 'Active' : 'In - Active';
  
    if (!name) {
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup("Please enter Name", "Error Message!");
      } else {
        showToast('Please enter Name');
      }
      return;
    }
  
    const { customer_name, customer_id } = getCurrentCustomerContext();
    const payload = {
      customer_name: customer_name || 'Indus Towers Ltd',
      name: name,
      designation: desig,
      contact_number: phone,
      email: email,
      status: status
    };
  
    isSavingCustomerContact = true;
    try {
      await NexusApi.customers.createContact(payload, customer_id);
  
      if (typeof showSvgSuccessPopup === 'function') {
        showSvgSuccessPopup('Contact details added successfully!', 'Task Completed');
      } else {
        showToast('Contact details added successfully!');
      }
  
      await loadCustomerContactsFromApi();
      closeAddCustomerContactForm();
    } catch (err) {
      console.error('Failed to save customer contact:', err);
      const msg = (err && (err.message || err.detail)) || 'Failed to add contact details. Please try again.';
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(msg, 'Error Message!');
      } else {
        showToast(msg);
      }
    } finally {
      isSavingCustomerContact = false;
    }
  };
  
  window.triggerCustomerContactCsvUpload = function() {
    document.getElementById('inpCustContactCsvFile')?.click();
  };
  
  window.handleCustomerContactCsvFile = function(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      showToast(`File selected: ${file.name}`);
      input.value = '';
    }
  };
  
  window.triggerCustomerContactBulkUpload = function() {
    document.getElementById('inpCustContactFolderFile')?.click();
  };
  
  window.handleCustomerContactFolderFile = function(input) {
    if (input.files && input.files.length > 0) {
      const count = input.files.length;
      const folderPath = input.files[0].webkitRelativePath || '';
      const folderName = folderPath.split('/')[0] || 'Selected Folder';
      showToast(`Folder selected: "${folderName}" (${count} files)`);
      input.value = '';
    }
  };
  
  window.openCustomerContactFilter = function(colKey, event) {
    if (event) event.stopPropagation();
    currentCustomerContactFilterCol = colKey;
    const dropdown = document.getElementById('excelFilterDropdown');
    const searchInput = document.getElementById('filterSearchInput');
    const chkList = document.getElementById('filterCheckboxList');
    const chkSelectAll = document.getElementById('chkFilterSelectAll');
  
    if (!dropdown) return;
    if (searchInput) searchInput.value = '';
  
    const uniqueValues = Array.from(new Set(customerContactData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  
    const activeSet = activeCustomerContactFilters[colKey];
  
    chkList.innerHTML = uniqueValues.map(val => {
      const isChecked = activeSet ? activeSet.has(val) : true;
      const displayLabel = val === '' ? '(Blanks)' : val;
      return `
        <label class="excel-checkbox-item excel-filter-dynamic-item" data-val="${val}">
          <input type="checkbox" value="${val}" ${isChecked ? 'checked' : ''}>
          <span class="chk-label">${displayLabel}</span>
        </label>
      `;
    }).join('');
  
    if (chkSelectAll) {
      chkSelectAll.checked = !activeSet || activeSet.size === uniqueValues.length;
    }
  
    const targetBtn = event ? event.currentTarget : document.getElementById(`btnCustomerContact${colKey.charAt(0).toUpperCase() + colKey.slice(1)}Filter`);
    const rect = targetBtn ? targetBtn.getBoundingClientRect() : { left: 200, bottom: 200 };
    const dropdownWidth = 280;
    let leftPos = rect.left;
    if (leftPos + dropdownWidth > window.innerWidth - 16) {
      leftPos = window.innerWidth - dropdownWidth - 16;
    }
  
    dropdown.dataset.filterContext = 'customerContact';
    dropdown.style.display = 'flex';
    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
    dropdown.style.left = `${Math.max(12, leftPos)}px`;
  
    if (searchInput) searchInput.focus();
  };
  
  window.openViewCustomerCard = function(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
  
    const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
    cards.forEach(card => {
      if (card.id !== 'addCustomerCard') card.style.display = 'none';
    });
  
    const row = (rowId && (typeof masterCustomerData !== 'undefined') && masterCustomerData.find(r => r.id === rowId || r.customer_id === rowId || r.customerName === rowId)) || 
                ((typeof masterCustomerData !== 'undefined') && masterCustomerData[0]);
    if (!row) return;
  
    window.currentCustomerContext = row;
    window.currentCustomerName = row.customerName || row.customer_name || row.legalName || '';
    window.currentCustomerId = row.customer_id || row.id || null;
  
    const addCustomerCard = document.getElementById('addCustomerCard');
    if (addCustomerCard) {
      addCustomerCard.style.display = 'block';
      const lblTitle = document.getElementById('lblCustomerCardTitle');
      if (lblTitle) lblTitle.innerText = 'View Customer';
  
      const bTypeSelect = document.getElementById('inpBusinessType');
      if (bTypeSelect) bTypeSelect.value = row.businessType || 'Projects';
  
      const inpName = document.getElementById('inpCustomerName');
      if (inpName) inpName.value = row.customerName || row.customer_name || '';
  
      const inpDigits = document.getElementById('inpCustomerPoDigits');
      if (inpDigits) inpDigits.value = row.poDigits || row.po_stating_3_digits || '450';
  
      const gstToggle = document.getElementById('inpCustomerGstToggle');
      if (gstToggle) gstToggle.checked = (row.gstNumber && row.gstNumber !== 'NA') || (row.gst_number && row.gst_number !== 'NA');
  
      const inpGstType = document.getElementById('inpGstType');
      if (inpGstType) inpGstType.value = row.gstType || row.gst_type || 'SGST';
  
      const inpGstNumber = document.getElementById('inpGstNumber');
      if (inpGstNumber) inpGstNumber.value = (row.gstNumber && row.gstNumber !== 'NA') ? row.gstNumber : ((row.gst_number && row.gst_number !== 'NA') ? row.gst_number : '');
  
      const inpPan = document.getElementById('inpPanNumber');
      if (inpPan) inpPan.value = row.panNumber || row.pan_number || '33ASMPM8643F';
  
      const inpAddress = document.getElementById('inpAddress');
      if (inpAddress) inpAddress.value = row.address || row.gst_address || 'Building 10, DLF Cyber City, Gurugram, Haryana - 122002';
  
      const statusToggle = document.getElementById('inpStatusToggle');
      if (statusToggle) statusToggle.checked = !((row.status || '').toLowerCase().includes('in'));
  
      if (typeof updateCustomerConditionalFields === 'function') {
        updateCustomerConditionalFields();
      }
    }
  
    overlay.style.display = 'flex';
    showToast('Opened View Customer');
  };
  


  // Save Master Customer Record (for creation)
  window.saveMasterCustomerRecord = async function() {
      const businessType = document.getElementById('inpBusinessType')?.value || "Projects";
      const legalName = document.getElementById('inpCustomerName')?.value?.trim();
      const customerProjectName = document.getElementById('inpCustomerProjectName')?.value?.trim();
      const customerName = (businessType === 'Projects' && customerProjectName) ? customerProjectName : (legalName || "");
  
      if (!legalName && !customerName) {
        if (typeof showSvgErrorPopup === 'function') {
          showSvgErrorPopup("Please enter Customer Legal Name.", "Error Message!");
        } else {
          showToast("Please enter Customer Legal Name.");
        }
        return;
      }
  
      const effectiveCustomerName = customerName || legalName;
      const effectiveLegalName = legalName || customerName;
  
      // Check Indus Towers variant uniqueness (Only 1 Indus Towers record is allowable)
      const isIndusVariant = (effectiveCustomerName + ' ' + effectiveLegalName).toLowerCase().replace(/[^a-z0-9]/g, '').includes('industower');
      if (isIndusVariant) {
        const existingIndus = (typeof masterCustomerData !== 'undefined' && Array.isArray(masterCustomerData)) ? masterCustomerData.find(c => {
          const cn = (c.customerName || c.customer_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const ln = (c.legalName || c.legal_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return cn.includes('industower') || ln.includes('industower');
        }) : null;
  
        if (existingIndus) {
          if (typeof showSvgErrorPopup === 'function') {
            showSvgErrorPopup("Indus Towers Ltd already exists. Only one Indus Towers customer record is allowable.", "Duplicate Error!");
          } else {
            showToast("Indus Towers Ltd already exists. Only one Indus Towers customer record is allowable.");
          }
          return;
        }
      }
  
      // Check general duplicate customer name in active dataset
      const normEnteredName = effectiveCustomerName.trim().toLowerCase();
      const normEnteredLegal = effectiveLegalName.trim().toLowerCase();
      const existingDup = (typeof masterCustomerData !== 'undefined' && Array.isArray(masterCustomerData)) ? masterCustomerData.find(c => {
        const cn = (c.customerName || c.customer_name || '').trim().toLowerCase();
        const ln = (c.legalName || c.legal_name || '').trim().toLowerCase();
        return (cn && cn === normEnteredName) || (ln && ln === normEnteredLegal);
      }) : null;
  
      if (existingDup) {
        if (typeof showSvgErrorPopup === 'function') {
          showSvgErrorPopup("Customer name already exists. Please use a different name.", "Duplicate Error!");
        } else {
          showToast("Customer name already exists.");
        }
        return;
      }
  
      const isGstOn = document.getElementById('inpCustomerGstToggle')?.checked || false;
      const gstType = isGstOn ? (document.getElementById('inpGstType')?.value || "SGST") : "NA";
      const gstNumber = isGstOn ? (document.getElementById('inpGstNumber')?.value?.trim() || "NA") : "NA";
      const panNumber = businessType === 'Projects' ? (document.getElementById('inpPanNumber')?.value?.trim() || "") : "";
      const address = document.getElementById('inpAddress')?.value?.trim() || "";
      const poDigits = (businessType === 'Projects' && isIndusVariant) ? (document.getElementById('inpCustomerPoDigits')?.value?.trim() || "") : "";
      const statusToggleEl = document.getElementById('inpStatusToggle');
      const status = (statusToggleEl && statusToggleEl.checked) ? "Active" : "In - Active";
      const invoiceType = "B2B";
  
      const payload = {
        customer_name: customerName || legalName,
        customerName: customerName || legalName,
        legal_name: legalName || customerName,
        legalName: legalName || customerName,
        business_type: businessType,
        businessType: businessType,
        gst_type: gstType,
        gstType: gstType,
        gst_number: gstNumber,
        gstNumber: gstNumber,
        pan_number: panNumber,
        panNumber: panNumber,
        invoice_type: invoiceType,
        invoiceType: invoiceType,
        po_stating_3_digits: poDigits,
        poDigits: poDigits,
        gst_address: address,
        address: address,
        status: status,
        gst_enabled: isGstOn,
        gstEnabled: isGstOn
      };
  
      if (typeof NexusApi !== 'undefined' && NexusApi.customers) {
        NexusApi.customers.create(payload)
          .then(newRecord => {
            const mapped = {
              ...newRecord,
              id: newRecord.customer_id || newRecord.id || `cust-${Date.now()}`,
              customerName: newRecord.customer_name || newRecord.customerName || customerName || legalName,
              customerId: newRecord.customer_code || newRecord.customerId || '',
              businessType: newRecord.business_type || newRecord.businessType || businessType,
              gstNumber: newRecord.gst_number || newRecord.gstNumber || gstNumber,
              gstType: newRecord.gst_type || newRecord.gstType || gstType,
              invoiceType: newRecord.invoice_type || newRecord.invoiceType || invoiceType,
              panNumber: newRecord.pan_number || newRecord.panNumber || panNumber,
              address: newRecord.gst_address || newRecord.address || address,
              poDigits: newRecord.po_stating_3_digits || newRecord.poDigits || poDigits,
              status: newRecord.status || status
            };
            masterCustomerData.unshift(mapped);
            currentDataset = [...masterCustomerData];
            applyFiltersAndRender();
            closeSideForm();
            if (typeof showSvgSuccessPopup === 'function') {
              showSvgSuccessPopup('Customer added successfully!', 'Task Completed');
            } else {
              showToast(`Customer ${customerName || legalName} successfully saved to database!`);
            }
          })
          .catch(err => {
            console.error('Failed to create customer in DB:', err);
            const msg = err.detail || err.message || "Customer with this name or code already exists.";
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(msg, "Error Message!");
            } else {
              showToast(`Error: ${msg}`);
            }
            // Form remains open and all field values are preserved for user correction!
          });
      } else {
        const newRecord = {
          id: `cust-${Date.now()}`,
          customerName: customerName || legalName,
          customerId: `23051068${masterCustomerData.length + 1}`,
          businessType,
          gstNumber,
          gstType,
          invoiceType,
          panNumber,
          address,
          poDigits,
          status
        };
  
        masterCustomerData.unshift(newRecord);
        if (currentModule === 'master' && currentMasterSubpage === 'customer') {
          currentDataset = [...masterCustomerData];
          applyFiltersAndRender();
        }
  
        closeSideForm();
        if (typeof showSvgSuccessPopup === 'function') {
          showSvgSuccessPopup('Customer added successfully!', 'Task Completed');
        } else {
          showToast(`Customer ${customerName || legalName} successfully saved!`);
        }
      }
      return;
  };

})(window);
