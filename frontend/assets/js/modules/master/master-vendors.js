/**
 * Master Vendors Module
 * Extracted from home.js
 * Handles vendor dataset loading, sub-data store (bank, contacts, scopes),
 * vendor form viewing, editing, bank modal, conditional layout, and persistence.
 */
(function(window) {
  'use strict';

  window.masterVendorData = window.masterVendorData || [];
  window.vendorSubDataStore = window.vendorSubDataStore || {};
  window.newVendorTempSubData = window.newVendorTempSubData || {
    bank: null,
    contacts: [],
    supplyScope: [],
    serviceProjectScope: [],
    serviceTransportScope: [],
    serviceOthersScope: []
  };
  window.currentViewedVendorId = window.currentViewedVendorId || null;
  window.isVendorFormEditing = window.isVendorFormEditing || false;
  window.isVendorBankEditing = window.isVendorBankEditing || false;

  async function loadMasterVendorsFromApi() {
    if (typeof NexusApi !== 'undefined' && NexusApi.vendors) {
      try {
        const response = await NexusApi.vendors.getAll({ limit: 500 });
        let items = [];
        if (response && Array.isArray(response.items)) {
          items = response.items;
        } else if (Array.isArray(response)) {
          items = response;
        }
        masterVendorData = items.map(v => {
          const vId = v.vendor_id || v.id;
          if (!vendorSubDataStore[vId]) {
            vendorSubDataStore[vId] = {
              bank: (v.account_name || v.account_number || v.bank_name) ? {
                accountName: v.account_name || '',
                accountNumber: v.account_number || '',
                bankName: v.bank_name || '',
                accountType: v.account_type || '',
                ifscCode: v.ifsc_code || '',
                status: v.status || 'Active'
              } : null,
              contacts: v.contact_name ? [{
                id: `c-${vId}-1`,
                name: v.contact_name,
                designation: 'Primary Contact',
                phone: v.contact_number || '',
                email: v.email || '',
                status: v.status || 'Active'
              }] : [],
              supplyScope: [],
              serviceProjectScope: [],
              serviceTransportScope: [],
              serviceOthersScope: []
            };
          } else {
            if (v.account_name || v.account_number || v.bank_name) {
              vendorSubDataStore[vId].bank = {
                accountName: v.account_name || '',
                accountNumber: v.account_number || '',
                bankName: v.bank_name || '',
                accountType: v.account_type || '',
                ifscCode: v.ifsc_code || '',
                status: v.status || 'Active'
              };
            }
            if (v.contact_name && (!vendorSubDataStore[vId].contacts || vendorSubDataStore[vId].contacts.length === 0)) {
              vendorSubDataStore[vId].contacts = [{
                id: `c-${vId}-1`,
                name: v.contact_name,
                designation: 'Primary Contact',
                phone: v.contact_number || '',
                email: v.email || '',
                status: v.status || 'Active'
              }];
            }
          }
  
          return {
            ...v,
            id: vId,
            vendor_id: vId,
            vendorName: v.vendor_name || v.vendorName || '',
            vendor_name: v.vendor_name || v.vendorName || '',
            entityType: v.entity_type || v.entityType || 'Proprietorship',
            businessType: v.business_type || v.businessType || 'Supply',
            vendorType: v.business_type || v.vendorType || 'Supply',
            serviceType: v.service_type || v.serviceType || '',
            contractType: v.contract_type || v.contractType || '',
            gstEnabled: (v.gst_number_available !== undefined) ? v.gst_number_available : (v.gst_number && v.gst_number !== 'NA' && v.gst_number !== ''),
            gstNumber: v.gst_number || v.gstNumber || '',
            gstType: v.gst_type || v.gstType || 'SGST',
            panNumber: v.pan_number || v.panNumber || '',
            tdsDeduction: v.tds_deduction !== undefined ? v.tds_deduction : false,
            tdsCode: v.tds_code || v.tdsCode || '',
            tdsRate: v.tds_rate ? `${v.tds_rate}%` : (v.tdsRate || '1%'),
            address: v.address || '',
            status: v.status || 'Active'
          };
        });
      } catch (err) {
        console.error('Error fetching master vendors from API:', err);
        if (typeof showToast === 'function') {
          showToast('Could not load vendors from database: ' + (err.message || err));
        }
      }
    }
    if (typeof currentModule !== 'undefined' && currentModule === 'master' && typeof currentMasterSubpage !== 'undefined' && currentMasterSubpage === 'vendor') {
      currentDataset = [...masterVendorData];
      if (typeof applyFiltersAndRender === 'function') {
        applyFiltersAndRender();
      }
    }
  }
  
  async function loadVendorPricingFromApi(vendorId) {
    if (typeof NexusApi !== 'undefined' && NexusApi.vendors && vendorId) {
      try {
        const numericId = parseInt(vendorId, 10);
        const res = !isNaN(numericId) ? await NexusApi.vendors.getPricing(numericId) : null;
        if (res && Array.isArray(res.items)) {
          if (!vendorSubDataStore[vendorId]) {
            vendorSubDataStore[vendorId] = {
              bank: null,
              contacts: [],
              supplyScope: [],
              serviceProjectScope: [],
              serviceTransportScope: [],
              serviceOthersScope: []
            };
          }
          const store = vendorSubDataStore[vendorId];
          store.supplyScope = [];
          store.serviceProjectScope = [];
          store.serviceTransportScope = [];
          store.serviceOthersScope = [];
  
          res.items.forEach(item => {
            if (item.vehicle_type || item.vehicle_number) {
              store.serviceTransportScope.push({
                id: item.vendor_service_id || item.id,
                vendor_service_id: item.vendor_service_id,
                vehicleType: item.vehicle_type || '',
                vehicleNumber: item.vehicle_number || '',
                fuelType: item.fuel_type || '',
                range: item.range_value ? String(item.range_value) : (item.sub_project_type || 'Project'),
                rentalType: item.rental_type || 'Monthly',
                rate: item.rate ? String(item.rate) : '',
                status: item.status || 'Active'
              });
            } else if (item.sub_project_type && item.sub_project_type.toLowerCase() !== 'supply') {
              store.serviceProjectScope.push({
                id: item.vendor_service_id || item.id,
                vendor_service_id: item.vendor_service_id,
                subProjectType: item.sub_project_type || '',
                uom: item.item_description || 'LS',
                rate: item.rate ? String(item.rate) : '',
                status: item.status || 'Active'
              });
            } else if (item.service_description) {
              store.serviceOthersScope.push({
                id: item.vendor_service_id || item.id,
                vendor_service_id: item.vendor_service_id,
                description: item.service_description || '',
                from: item.fromDate || '01 - 01 - 2026',
                to: item.toDate || '31 - 12 - 2026',
                uom: item.item_description || 'Project',
                rate: item.rate ? String(item.rate) : '',
                status: item.status || 'Active'
              });
            } else {
              store.supplyScope.push({
                id: item.vendor_service_id || item.id,
                vendor_service_id: item.vendor_service_id,
                category: item.sub_project_type || 'Supply',
                productName: item.product_name || '',
                uom: item.item_description || 'Nos',
                price: item.rate ? String(item.rate) : '',
                status: item.status || 'Active'
              });
            }
          });
        }
      } catch (err) {
        console.warn('Could not fetch vendor pricing from API:', err);
      }
    }
  }
  
  function getEffectiveVendorContext() {
    if (currentViewedVendorId) {
      if (!vendorSubDataStore[currentViewedVendorId]) {
        vendorSubDataStore[currentViewedVendorId] = {
          bank: null,
          contacts: [],
          supplyScope: [],
          serviceProjectScope: [],
          serviceTransportScope: [],
          serviceOthersScope: []
        };
      }
      return vendorSubDataStore[currentViewedVendorId];
    }
    return newVendorTempSubData;
  }
  
  function loadVendorBankDataToForm() {
    const ctx = getEffectiveVendorContext();
    const bank = ctx.bank;
    const inpName = document.getElementById('inpVendorBankAccountName');
    const inpNum = document.getElementById('inpVendorBankAccountNumber');
    const inpIfsc = document.getElementById('inpVendorBankIfsc');
    const selBank = document.getElementById('inpVendorBankName');
    const chkStatus = document.getElementById('inpVendorBankStatusToggle');
  
    if (bank) {
      if (inpName) inpName.value = bank.accountName || '';
      if (inpNum) inpNum.value = bank.accountNumber || '';
      if (inpIfsc) inpIfsc.value = bank.ifscCode || '';
      if (selBank) selBank.value = bank.bankName || '';
      if (chkStatus) chkStatus.checked = (bank.status || '').toLowerCase() === 'active';
    } else {
      if (inpName) inpName.value = '';
      if (inpNum) inpNum.value = '';
      if (inpIfsc) inpIfsc.value = '';
      if (selBank) selBank.value = '';
      if (chkStatus) chkStatus.checked = true;
    }
  }
  
  function saveVendorBankDataFromForm() {
    const ctx = getEffectiveVendorContext();
    const inpName = document.getElementById('inpVendorBankAccountName');
    const inpNum = document.getElementById('inpVendorBankAccountNumber');
    const inpIfsc = document.getElementById('inpVendorBankIfsc');
    const selBank = document.getElementById('inpVendorBankName');
    const chkStatus = document.getElementById('inpVendorBankStatusToggle');
  
    ctx.bank = {
      accountName: inpName ? inpName.value.trim() : '',
      accountNumber: inpNum ? inpNum.value.trim() : '',
      ifscCode: inpIfsc ? inpIfsc.value.trim() : '',
      bankName: selBank ? selBank.value : '',
      status: (chkStatus && chkStatus.checked) ? 'Active' : 'In - Active'
    };
  }


  function setVendorFormReadOnly(isReadOnly, isEditModeOnly = false) {
    const form = document.getElementById('frmAddVendor');
    if (!form) return;
  
    const isEdit = !isReadOnly && (isEditModeOnly || isVendorFormEditing);
  
    // 1. Text Inputs
    const inputs = form.querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(inp => {
      if (isReadOnly) {
        inp.setAttribute('readonly', 'true');
        inp.style.backgroundColor = '#f8fafc';
      } else {
        inp.removeAttribute('readonly');
        inp.style.backgroundColor = '#ffffff';
      }
    });
  
    // 2. Select Dropdowns
    const selects = form.querySelectorAll('select');
    selects.forEach(sel => {
      if (isReadOnly) {
        sel.setAttribute('disabled', 'true');
        sel.style.backgroundColor = '#f8fafc';
      } else {
        sel.removeAttribute('disabled');
        sel.style.backgroundColor = '#ffffff';
      }
    });
  
    // 3. Slidebar Toggles
    const toggles = form.querySelectorAll('input[type="checkbox"]');
    toggles.forEach(t => {
      const parentSwitch = t.closest('.toggle-slide-switch');
      t.disabled = isReadOnly;
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
      }
    });
  
    // 4. Action / Upload Badges
    const gstProcessBadge = document.querySelector('#rowVendorGstNumber .input-process-badge, #rowVendorGstNumber .input-pdf-badge');
    const panPdfBadge = document.querySelector('#rowVendorPanNumber .input-pdf-badge');
  
    if (isReadOnly) {
      if (gstProcessBadge) {
        gstProcessBadge.style.pointerEvents = 'none';
        gstProcessBadge.style.opacity = '0.5';
        gstProcessBadge.style.cursor = 'default';
      }
      if (panPdfBadge) {
        panPdfBadge.style.pointerEvents = 'none';
        panPdfBadge.style.opacity = '0.5';
        panPdfBadge.style.cursor = 'default';
      }
    } else {
      if (gstProcessBadge) {
        gstProcessBadge.style.pointerEvents = 'auto';
        gstProcessBadge.style.opacity = '1';
        gstProcessBadge.style.cursor = 'pointer';
      }
      if (panPdfBadge) {
        panPdfBadge.style.pointerEvents = 'auto';
        panPdfBadge.style.opacity = '1';
        panPdfBadge.style.cursor = 'pointer';
      }
    }
  }
  
  window.setVendorFormReadOnly = setVendorFormReadOnly;
  
  function updateVendorConditionalFields() {
    const inpVendorType = document.getElementById('inpVendorType');
    const inpServiceType = document.getElementById('inpServiceType');
    const inpGstToggle = document.getElementById('inpVendorGstToggle');
  
    const rowServiceType = document.getElementById('rowVendorServiceType');
    const rowContractType = document.getElementById('rowVendorContractType');
    const rowGstType = document.getElementById('rowVendorGstType');
    const rowGstNumber = document.getElementById('rowVendorGstNumber');
  
    const bType = (inpVendorType?.value || 'Supply').trim();
    const sType = (inpServiceType?.value || 'Project').trim();
    const isGstOn = inpGstToggle ? inpGstToggle.checked : false;
  
    // 1. Business Type logic:
    if (bType.toLowerCase() === 'service') {
      if (rowServiceType) rowServiceType.style.setProperty('display', 'flex', 'important');
      if (sType.toLowerCase() === 'project') {
        if (rowContractType) rowContractType.style.setProperty('display', 'flex', 'important');
      } else {
        if (rowContractType) rowContractType.style.setProperty('display', 'none', 'important');
      }
    } else {
      if (rowServiceType) rowServiceType.style.setProperty('display', 'none', 'important');
      if (rowContractType) rowContractType.style.setProperty('display', 'none', 'important');
    }
  
    // 2. GST Slidebar logic:
    if (isGstOn) {
      if (rowGstType) rowGstType.style.setProperty('display', 'flex', 'important');
      if (rowGstNumber) rowGstNumber.style.setProperty('display', 'flex', 'important');
    } else {
      if (rowGstType) rowGstType.style.setProperty('display', 'none', 'important');
      if (rowGstNumber) rowGstNumber.style.setProperty('display', 'none', 'important');
    }
  
    // 3. TDS Deduction Slidebar logic:
    const inpTdsToggle = document.getElementById('inpTdsDeductionToggle');
    const rowTdsCode = document.getElementById('rowVendorTdsCode');
    const rowTdsRate = document.getElementById('rowVendorTdsRate');
    const isTdsOn = inpTdsToggle ? inpTdsToggle.checked : false;
  
    if (isTdsOn) {
      if (rowTdsCode) rowTdsCode.style.setProperty('display', 'flex', 'important');
      if (rowTdsRate) rowTdsRate.style.setProperty('display', 'flex', 'important');
    } else {
      if (rowTdsCode) rowTdsCode.style.setProperty('display', 'none', 'important');
      if (rowTdsRate) rowTdsRate.style.setProperty('display', 'none', 'important');
    }
  }
  window.updateVendorConditionalFields = updateVendorConditionalFields;
  window.updateVendorBusinessTypeFields = updateVendorConditionalFields;
  


  window.openViewVendorCard = async function(vendorId) {
    let vend = masterVendorData.find(v => v.id === vendorId || v.vendorName === vendorId || v.vendorId === vendorId || String(v.vendor_id) === String(vendorId));
    const numericId = parseInt(vendorId, 10);
    if (!vend && !isNaN(numericId) && typeof NexusApi !== 'undefined' && NexusApi.vendors) {
      try {
        vend = await NexusApi.vendors.getById(numericId);
      } catch (err) {
        console.warn('Could not fetch vendor by ID:', err);
      }
    }
    if (!vend) return;
  
    const actualVendorId = vend.vendor_id || vend.id;
    currentViewedVendorId = actualVendorId;
    isVendorFormEditing = false;
    openSideForm();
  
    const cards = document.querySelectorAll('.side-form-card');
    cards.forEach(c => c.style.display = 'none');
  
    const card = document.getElementById('addVendorCard');
    if (card) card.style.display = 'block';
  
    const lblTitle = document.getElementById('lblVendorCardTitle');
    if (lblTitle) lblTitle.innerText = vend.vendor_name || vend.vendorName || 'View Vendor';
  
    const btnEditToggle = document.getElementById('btnVendorCardEditToggle');
    const imgEditIcon = document.getElementById('imgVendorCardEditIcon');
    if (btnEditToggle) btnEditToggle.style.display = 'flex';
    if (imgEditIcon) {
      imgEditIcon.src = 'icons/Edit.svg';
      imgEditIcon.className = 'icon-blue';
      imgEditIcon.title = 'Edit Info';
    }
  
    const btnBank = document.getElementById('btnVendorCardBank');
    const btnMessage = document.getElementById('btnVendorCardMessage');
    const btnScope = document.getElementById('btnVendorCardScope');
    if (btnBank) btnBank.style.display = 'inline-flex';
    if (btnMessage) btnMessage.style.display = 'inline-flex';
    if (btnScope) btnScope.style.display = 'inline-flex';
  
    const btnSaveWrap = document.querySelector('#frmAddVendor .form-submit-inside-wrap');
    if (btnSaveWrap) btnSaveWrap.style.display = 'none';
  
    if (document.getElementById('inpVendorName')) document.getElementById('inpVendorName').value = vend.vendor_name || vend.vendorName || '';
    if (document.getElementById('inpVendorEntityType')) document.getElementById('inpVendorEntityType').value = vend.entity_type || vend.entityType || 'Proprietorship';
    if (document.getElementById('inpVendorType')) document.getElementById('inpVendorType').value = (vend.business_type || vend.businessType || vend.vendorType || 'Supply');
    if (document.getElementById('inpServiceType')) document.getElementById('inpServiceType').value = vend.service_type || vend.serviceType || 'Project';
    if (document.getElementById('inpVendorContractType')) document.getElementById('inpVendorContractType').value = vend.contract_type || vend.contractType || 'B2B';
    if (document.getElementById('inpVendorAddress')) document.getElementById('inpVendorAddress').value = vend.address || '';
    if (document.getElementById('inpVendorPanNumber')) document.getElementById('inpVendorPanNumber').value = vend.pan_number || vend.panNumber || '';
  
    const chkGst = document.getElementById('inpVendorGstToggle');
    if (chkGst) {
      chkGst.checked = (vend.gst_number_available !== undefined) ? vend.gst_number_available : (vend.gstEnabled !== undefined ? vend.gstEnabled : (vend.gst_number && vend.gst_number !== 'NA' && vend.gst_number !== ''));
    }
  
    if (document.getElementById('inpVendorGstType')) document.getElementById('inpVendorGstType').value = vend.gst_type || vend.gstType || 'SGST';
    if (document.getElementById('inpVendorGstNumber')) document.getElementById('inpVendorGstNumber').value = (vend.gst_number && vend.gst_number !== 'NA') ? vend.gst_number : ((vend.gstNumber && vend.gstNumber !== 'NA') ? vend.gstNumber : '');
  
    const chkTds = document.getElementById('inpTdsDeductionToggle');
    if (chkTds) chkTds.checked = (vend.tds_deduction === true || vend.tdsDeduction === true);
  
    if (document.getElementById('inpTdsCode')) document.getElementById('inpTdsCode').value = vend.tds_code || vend.tdsCode || '';
    if (document.getElementById('inpTdsRate')) document.getElementById('inpTdsRate').value = vend.tds_rate ? `${vend.tds_rate}%` : (vend.tdsRate || '1%');
  
    const statusToggle = document.getElementById('inpVendorStatusToggle');
    if (statusToggle) {
      statusToggle.checked = (vend.status || '').toLowerCase() === 'active';
    }
  
    updateVendorConditionalFields();
    setVendorFormReadOnly(true);
  
    // Pre-load bank data and reset active filter sets for view
    loadVendorBankDataToForm();
    activeContactFilters = {};
    activeSupplyScopeFilters = {};
    activeServiceProjectScopeFilters = {};
    activeServiceTransportScopeFilters = {};
    activeServiceOthersScopeFilters = {};
  
    // Fetch live pricing records from backend
    await loadVendorPricingFromApi(actualVendorId);
  
    showToast(`Viewing vendor details: ${vend.vendor_name || vend.vendorName}`);
  };


  function setVendorBankEditingState(isEditing) {
    isVendorBankEditing = isEditing;
    const form = document.getElementById('frmVendorBank');
    if (!form) return;
  
    const textInputs = form.querySelectorAll('input[type="text"]');
    textInputs.forEach(inp => {
      if (isEditing) {
        inp.removeAttribute('readonly');
        inp.style.backgroundColor = '#ffffff';
        inp.style.cursor = 'text';
      } else {
        inp.setAttribute('readonly', 'true');
        inp.style.backgroundColor = '#f8fafc';
        inp.style.cursor = 'not-allowed';
      }
    });
  
    const selects = form.querySelectorAll('select');
    selects.forEach(sel => {
      if (isEditing) {
        sel.removeAttribute('disabled');
        sel.style.backgroundColor = '#ffffff';
        sel.style.cursor = 'pointer';
      } else {
        sel.setAttribute('disabled', 'true');
        sel.style.backgroundColor = '#f8fafc';
        sel.style.cursor = 'not-allowed';
      }
    });
  
    const toggles = form.querySelectorAll('input[type="checkbox"]');
    toggles.forEach(t => {
      t.disabled = !isEditing;
    });
  
    const btnEditToggle = document.getElementById('btnVendorBankEditToggle');
    const imgEditIcon = document.getElementById('imgVendorBankEditIcon');
    if (btnEditToggle) {
      if (currentViewedVendorId) {
        btnEditToggle.style.display = 'flex';
        if (imgEditIcon) {
          if (isEditing) {
            imgEditIcon.src = 'icons/Save.svg';
            imgEditIcon.className = 'icon-green';
            imgEditIcon.title = 'Save';
          } else {
            imgEditIcon.src = 'icons/Edit.svg';
            imgEditIcon.className = 'icon-blue';
            imgEditIcon.title = 'Edit Info';
          }
        }
      } else {
        btnEditToggle.style.display = 'none';
      }
    }
  
    const btnSubmitWrap = form.querySelector('.form-submit-inside-wrap');
    if (btnSubmitWrap) {
      btnSubmitWrap.style.display = (!currentViewedVendorId) ? 'flex' : 'none';
    }
  }


  // Save Vendor Form (Create & Update)
    async function saveVendorForm(isFormSubmit = true) {
      const vName = document.getElementById('inpVendorName')?.value.trim();
      if (!vName) {
        if (typeof showSvgErrorPopup === 'function') {
          showSvgErrorPopup('Please enter a Vendor Name', 'Validation Error');
        } else {
          showToast('Please enter a Vendor Name');
        }
        return false;
      }
  
      const entityType = document.getElementById('inpVendorEntityType')?.value || 'Proprietorship';
      const bType = document.getElementById('inpVendorType')?.value || 'Supply';
      const sType = document.getElementById('inpServiceType')?.value || 'Project';
      const contractType = document.getElementById('inpVendorContractType')?.value || 'B2B';
      const address = document.getElementById('inpVendorAddress')?.value.trim() || '';
      const pan = document.getElementById('inpVendorPanNumber')?.value.trim() || '';
      const isGstOn = document.getElementById('inpVendorGstToggle')?.checked || false;
      const gstType = document.getElementById('inpVendorGstType')?.value || 'SGST';
      const gstNumber = isGstOn ? (document.getElementById('inpVendorGstNumber')?.value.trim() || '') : 'NA';
      const isTdsOn = document.getElementById('inpTdsDeductionToggle')?.checked || false;
      const tdsCode = document.getElementById('inpTdsCode')?.value || '';
      const tdsRate = document.getElementById('inpTdsRate')?.value || '1%';
      const status = document.getElementById('inpVendorStatusToggle')?.checked ? 'Active' : 'In - Active';
  
      if (currentViewedVendorId) {
        // Update existing vendor in PostgreSQL
        const numericVendorId = parseInt(currentViewedVendorId, 10);
        const updatePayload = {
          vendor_name: vName,
          entity_type: entityType,
          business_type: bType,
          service_type: (bType.toLowerCase() === 'service') ? sType : '',
          contract_type: (bType.toLowerCase() === 'service' && sType.toLowerCase() === 'project') ? contractType : '',
          address: address,
          pan_number: pan,
          gst_number_available: isGstOn,
          gst_type: isGstOn ? gstType : 'NA',
          gst_number: gstNumber,
          tds_deduction: isTdsOn,
          tds_code: isTdsOn ? tdsCode : '',
          tds_rate: isTdsOn ? tdsRate : '',
          status: status
        };
  
        const ctx = getEffectiveVendorContext();
        if (ctx && ctx.bank) {
          updatePayload.account_name = ctx.bank.accountName;
          updatePayload.account_number = ctx.bank.accountNumber;
          updatePayload.bank_name = ctx.bank.bankName;
          updatePayload.ifsc_code = ctx.bank.ifscCode;
          updatePayload.account_type = ctx.bank.accountType;
        }
  
        if (typeof NexusApi !== 'undefined' && NexusApi.vendors && !isNaN(numericVendorId)) {
          try {
            await NexusApi.vendors.update(numericVendorId, updatePayload);
            await loadMasterVendorsFromApi();
  
            const lblTitle = document.getElementById('lblVendorCardTitle');
            if (lblTitle) lblTitle.innerText = vName;
  
            isVendorFormEditing = false;
            setVendorFormReadOnly(true);
  
            const imgIcon = document.getElementById('imgVendorCardEditIcon');
            if (imgIcon) {
              imgIcon.src = 'icons/Edit.svg';
              imgIcon.className = 'icon-blue';
              imgIcon.title = 'Edit Info';
            }
            const btnSaveWrap = document.querySelector('#frmAddVendor .form-submit-inside-wrap');
            if (btnSaveWrap) btnSaveWrap.style.display = 'none';
  
            if (isFormSubmit) {
              closeSideForm();
            }
  
            if (typeof showSvgSuccessPopup === 'function') {
              showSvgSuccessPopup(`Vendor updated successfully!`, 'Task Completed');
            } else {
              showToast(`Vendor ${vName} updated successfully!`);
            }
            return true;
          } catch (err) {
            console.error('Failed to update vendor:', err);
            const errorMsg = err.detail || err.message || 'Failed to update vendor';
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(errorMsg, 'Error Message!');
            } else {
              showToast(`Error: ${errorMsg}`);
            }
            return false;
          }
        }
      } else {
        // Add new vendor in PostgreSQL
        const createPayload = {
          vendor_name: vName,
          entity_type: entityType,
          business_type: bType,
          service_type: (bType.toLowerCase() === 'service') ? sType : '',
          contract_type: (bType.toLowerCase() === 'service' && sType.toLowerCase() === 'project') ? contractType : '',
          address: address,
          pan_number: pan,
          gst_number_available: isGstOn,
          gst_type: isGstOn ? gstType : 'NA',
          gst_number: gstNumber,
          tds_deduction: isTdsOn,
          tds_code: isTdsOn ? tdsCode : '',
          tds_rate: isTdsOn ? tdsRate : '',
          status: status
        };
  
        if (newVendorTempSubData.bank) {
          createPayload.account_name = newVendorTempSubData.bank.accountName;
          createPayload.account_number = newVendorTempSubData.bank.accountNumber;
          createPayload.bank_name = newVendorTempSubData.bank.bankName;
          createPayload.ifsc_code = newVendorTempSubData.bank.ifscCode;
          createPayload.account_type = newVendorTempSubData.bank.accountType;
        }
        if (newVendorTempSubData.contacts && newVendorTempSubData.contacts.length > 0) {
          createPayload.contact_name = newVendorTempSubData.contacts[0].name;
          createPayload.contact_number = newVendorTempSubData.contacts[0].phone;
          createPayload.email = newVendorTempSubData.contacts[0].email;
        }
  
        if (typeof NexusApi !== 'undefined' && NexusApi.vendors) {
          try {
            const created = await NexusApi.vendors.create(createPayload);
            const createdId = created.vendor_id || created.id;
  
            // If temporary pricing rows were configured, save them to vendor_price
            if (createdId) {
              const allScopes = [
                ...(newVendorTempSubData.supplyScope || []).map(s => ({
                  product_name: s.productName,
                  item_description: s.uom,
                  rate: s.price,
                  sub_project_type: s.category || 'Supply',
                  status: s.status || 'Active'
                })),
                ...(newVendorTempSubData.serviceProjectScope || []).map(s => ({
                  sub_project_type: s.subProjectType,
                  item_description: s.uom,
                  rate: s.rate,
                  status: s.status || 'Active'
                })),
                ...(newVendorTempSubData.serviceTransportScope || []).map(s => ({
                  vehicle_type: s.vehicleType,
                  vehicle_number: s.vehicleNumber,
                  fuel_type: s.fuelType,
                  rental_type: s.rentalType,
                  rate: s.rate,
                  sub_project_type: s.range,
                  status: s.status || 'Active'
                })),
                ...(newVendorTempSubData.serviceOthersScope || []).map(s => ({
                  service_description: s.description,
                  from_date: s.from,
                  to_date: s.to,
                  item_description: s.uom,
                  rate: s.rate,
                  status: s.status || 'Active'
                }))
              ];
  
              for (const scopePayload of allScopes) {
                try {
                  await NexusApi.vendors.createPricing(createdId, scopePayload);
                } catch (e) {
                  console.warn('Failed to save scope row:', e);
                }
              }
            }
  
            newVendorTempSubData = {
              bank: null,
              contacts: [],
              supplyScope: [],
              serviceProjectScope: [],
              serviceTransportScope: [],
              serviceOthersScope: []
            };
  
            await loadMasterVendorsFromApi();
            closeSideForm();
  
            if (typeof showSvgSuccessPopup === 'function') {
              showSvgSuccessPopup(`Vendor added successfully!`, 'Task Completed');
            } else {
              showToast(`Vendor ${vName} added successfully!`);
            }
            return true;
          } catch (err) {
            console.error('Failed to create vendor:', err);
            const errorMsg = err.detail || err.message || 'Failed to create vendor';
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(errorMsg, 'Error Message!');
            } else {
              showToast(`Error: ${errorMsg}`);
            }
            return false;
          }
        }
      }
    }

  window.saveVendorForm = saveVendorForm;

  function initVendorEventListeners() {
    document.getElementById('inpVendorType')?.addEventListener('change', updateVendorConditionalFields);
    document.getElementById('inpServiceType')?.addEventListener('change', updateVendorConditionalFields);
    document.getElementById('inpVendorGstToggle')?.addEventListener('change', updateVendorConditionalFields);
    document.getElementById('inpTdsDeductionToggle')?.addEventListener('change', updateVendorConditionalFields);

    const btnVendorCardEditToggle = document.getElementById('btnVendorCardEditToggle');
    if (btnVendorCardEditToggle && !btnVendorCardEditToggle.dataset.vendorBound) {
      btnVendorCardEditToggle.dataset.vendorBound = 'true';
      btnVendorCardEditToggle.addEventListener('click', async (e) => {
        e.stopPropagation();
        const imgIcon = document.getElementById('imgVendorCardEditIcon');
        if (!window.isVendorFormEditing) {
          window.isVendorFormEditing = true;
          setVendorFormReadOnly(false, true);
          if (imgIcon) {
            imgIcon.src = 'icons/Save.svg';
            imgIcon.className = 'icon-green';
            imgIcon.title = 'Save';
          }
          const btnSaveWrap = document.querySelector('#frmAddVendor .form-submit-inside-wrap');
          if (btnSaveWrap) btnSaveWrap.style.display = 'flex';
          if (typeof showToast === 'function') showToast('Vendor form is now editable');
        } else {
          await saveVendorForm(false);
        }
      });
    }

    const btnSubmitVendor = document.getElementById('btnSubmitVendor');
    if (btnSubmitVendor && !btnSubmitVendor.dataset.vendorBound) {
      btnSubmitVendor.dataset.vendorBound = 'true';
      btnSubmitVendor.addEventListener('click', async (e) => {
        e.preventDefault();
        await saveVendorForm(true);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVendorEventListeners);
  } else {
    initVendorEventListeners();
  }
  window.initVendorEventListeners = initVendorEventListeners;

  window.loadMasterVendorsFromApi = typeof loadMasterVendorsFromApi !== 'undefined' ? loadMasterVendorsFromApi : window.loadMasterVendorsFromApi;
  window.loadVendorPricingFromApi = typeof loadVendorPricingFromApi !== 'undefined' ? loadVendorPricingFromApi : window.loadVendorPricingFromApi;
  window.getEffectiveVendorContext = typeof getEffectiveVendorContext !== 'undefined' ? getEffectiveVendorContext : window.getEffectiveVendorContext;
  window.loadVendorBankDataToForm = typeof loadVendorBankDataToForm !== 'undefined' ? loadVendorBankDataToForm : window.loadVendorBankDataToForm;
  window.saveVendorBankDataFromForm = typeof saveVendorBankDataFromForm !== 'undefined' ? saveVendorBankDataFromForm : window.saveVendorBankDataFromForm;
  window.setVendorBankEditingState = typeof setVendorBankEditingState !== 'undefined' ? setVendorBankEditingState : window.setVendorBankEditingState;
})(window);
