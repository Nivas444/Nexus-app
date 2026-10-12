/**
 * Master Employees Module
 * Extracted from home.js
 * Handles employee dataset loading, viewing, editing, creation, layout toggling, document uploads, and state management.
 */
(function(window) {
  'use strict';

  window.masterEmployeeData = window.masterEmployeeData || [];
  window.currentViewedEmpId = window.currentViewedEmpId || null;
  window.isEmployeeFormEditing = window.isEmployeeFormEditing || false;
  window.pendingEmployeePdfs = window.pendingEmployeePdfs || {};

  // Load employees from API
  window.loadMasterEmployeesFromApi = async function() {
    if (typeof NexusApi !== 'undefined' && NexusApi.employees) {
      try {
        const response = await NexusApi.employees.getAll({ limit: 500 });
        let items = [];
        if (response && Array.isArray(response.items)) {
          items = response.items;
        } else if (Array.isArray(response)) {
          items = response;
        }
        masterEmployeeData = items.map(e => ({
          ...e,
          id: e.employee_id || e.id || `emp-${e.employee_code || Date.now()}`,
          employee_id: e.employee_id || e.id,
          employeeName: e.employee_name || e.employeeName || '',
          employeeId: e.employee_code || e.employeeId || '',
          employee_code: e.employee_code || e.employeeId || '',
          employeeType: e.employee_type || e.empType || 'On-Roll',
          empType: e.employee_type || e.empType || 'On-Roll',
          designation: e.designation || '',
          contactNumber: e.mobile_number || e.contactNumber || '',
          email: e.email || '',
          address: e.address || '',
          pan: e.pan_number || e.pan || '',
          aadhar: e.aadhaar_number || e.aadhar || '',
          drivingLicense: e.dl_number || e.drivingLicense || '',
          passportNumber: e.passport_number || e.passportNumber || '',
          epfUan: e.epf_uan || e.epfUan || '',
          esiCode: e.esi_code || e.esiId || e.esiCode || '',
          esiId: e.esi_code || e.esiId || e.esiCode || '',
          documents: e.documents || [],
          pan_documents: e.pan_documents || '',
          aadhaar_documents: e.aadhaar_documents || '',
          dl_documents: e.dl_documents || '',
          passport_documents: e.passport_documents || '',
          epf_documents: e.epf_documents || '',
          esi_documents: e.esi_documents || '',
          qualification_documents: e.qualification_documents || '',
          geo_attendance: (e.geo_attendance === true || e.geo_attendance === 'true' || e.geoAttendance === true || e.geoAttendance === 'true' || e.geo_attendance === 1 || e.geoAttendance === 1),
          geoAttendance: (e.geo_attendance === true || e.geo_attendance === 'true' || e.geoAttendance === true || e.geoAttendance === 'true' || e.geo_attendance === 1 || e.geoAttendance === 1),
          status: (e.status === false || e.status === 'In - Active' || e.status === 'Inactive' || (typeof e.status === 'string' && (e.status.toLowerCase().includes('in') || e.status.toLowerCase().includes('false')))) ? 'In - Active' : 'Active'
        }));
      } catch (err) {
        console.error('Error fetching master employees from API:', err);
        if (typeof showToast === 'function') {
          showToast('Could not load employees from database: ' + (err.message || err));
        }
      }
    }
    if (typeof currentModule !== 'undefined' && currentModule === 'master' && typeof currentMasterSubpage !== 'undefined' && currentMasterSubpage === 'employee') {
      currentDataset = [...masterEmployeeData];
      if (typeof applyFiltersAndRender === 'function') {
        applyFiltersAndRender();
      }
    }
  };

  window.handleEmpToggleDisappear = function(toggleId, toggleWrapId, wrapInputId) {
    const toggle = document.getElementById(toggleId);
    const toggleWrap = document.getElementById(toggleWrapId);
    const wrapInput = document.getElementById(wrapInputId);
    if (toggle && toggle.checked) {
      if (toggleWrap) toggleWrap.style.setProperty('display', 'none', 'important');
      if (wrapInput) {
        wrapInput.style.setProperty('display', 'flex', 'important');
        const textInp = wrapInput.querySelector('input[type="text"]');
        if (textInp) textInp.focus();
      }
    }
  };
  
  window.handleEmpToggleReappear = function(toggleId, toggleWrapId, wrapInputId) {
    const toggle = document.getElementById(toggleId);
    const toggleWrap = document.getElementById(toggleWrapId);
    const wrapInput = document.getElementById(wrapInputId);
    if (toggle) toggle.checked = false;
    if (wrapInput) {
      wrapInput.style.setProperty('display', 'none', 'important');
      const textInp = wrapInput.querySelector('input[type="text"]');
      if (textInp) textInp.value = '';
    }
    if (toggleWrap) toggleWrap.style.setProperty('display', 'flex', 'important');
  };
  
  window.triggerEmpPdf = function(fileInputId) {
    const fileInput = document.getElementById(fileInputId);
    if (fileInput) fileInput.click();
  };
  
  window.pendingEmployeePdfs = window.pendingEmployeePdfs || {};
  
  window.handleEmpPdfUpload = function(fileInput, textInputId) {
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const txt = document.getElementById(textInputId);
      if (txt) {
        txt.value = file.name;
      }
      window.pendingEmployeePdfs = window.pendingEmployeePdfs || {};
      const map = {
        'inpEmpQualification': 'qualification',
        'inpEmpPanNumber': 'pan',
        'inpEmpAadharNumber': 'aadhar',
        'inpEmpDrivingLicense': 'driving_license',
        'inpEmpPassportNumber': 'passport',
        'inpEmpEpfUan': 'epf',
        'inpEmpEsiCode': 'esi'
      };
      const docType = map[textInputId] || textInputId;
      window.pendingEmployeePdfs[docType] = file;
      showToast('Document selected: ' + file.name);
    }
  };
  
  window.handleEmpPhotoUpload = function(fileInput, textInputId) {
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const txt = document.getElementById(textInputId);
      if (txt) {
        txt.value = file.name;
      }
      window.pendingEmployeePdfs = window.pendingEmployeePdfs || {};
      window.pendingEmployeePdfs['photo'] = file;
      showToast('Photo selected: ' + file.name);
    }
  };
  
  window.updateEmployeeFormLayout = function(mode, empType) {
    const empCard = document.getElementById('addEmployeeCard');
    if (!empCard) return;
  
    empCard.classList.remove('emp-contract-add', 'emp-contract-view', 'emp-contract-edit', 'emp-onroll-edit');
  
    const isContract = (empType === 'Contract');
  
    if (isContract) {
      if (mode === 'add') {
        empCard.classList.add('emp-contract-add');
      } else if (mode === 'view') {
        empCard.classList.add('emp-contract-view');
      } else if (mode === 'edit') {
        empCard.classList.add('emp-contract-edit');
      }
    } else {
      // On-Roll: only apply restricted layout and compact width in edit mode
      if (mode === 'edit') {
        empCard.classList.add('emp-onroll-edit');
      }
    }
  };
  
  function setEmployeeFormReadOnly(isReadOnly) {
    const form = document.getElementById('frmAddEmployee');
    const card = document.getElementById('addEmployeeCard');
    if (!form) return;
  
    if (isReadOnly) {
      if (card) card.classList.add('is-view-mode');
      form.classList.add('is-view-mode');
    } else {
      if (card) card.classList.remove('is-view-mode');
      form.classList.remove('is-view-mode');
    }
  
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (input.type === 'file') return;
      if (input.type === 'checkbox') {
        if (isReadOnly) {
          input.disabled = true;
          const parentSwitch = input.closest('.toggle-slide-switch') || input.closest('label');
          if (parentSwitch) {
            parentSwitch.style.pointerEvents = 'none';
            parentSwitch.style.opacity = '0.75';
            parentSwitch.style.cursor = 'not-allowed';
          }
        } else {
          input.disabled = false;
          const parentSwitch = input.closest('.toggle-slide-switch') || input.closest('label');
          if (parentSwitch) {
            parentSwitch.style.pointerEvents = 'auto';
            parentSwitch.style.opacity = '1';
            parentSwitch.style.cursor = 'pointer';
          }
        }
        return;
      }
  
      if (input.tagName === 'SELECT') {
        if (isReadOnly) {
          input.setAttribute('disabled', 'true');
          input.style.backgroundColor = '#f8fafc';
        } else {
          input.removeAttribute('disabled');
          input.style.backgroundColor = '#ffffff';
        }
      } else {
        if (isReadOnly) {
          input.setAttribute('readonly', 'true');
          input.style.backgroundColor = '#f8fafc';
        } else {
          input.removeAttribute('readonly');
          input.style.backgroundColor = '#ffffff';
        }
      }
    });
  
    // Explicitly ensure Status and Geo Attendance toggles and containers are properly enabled/disabled
    const statusToggle = document.getElementById('inpEmpStatusToggle');
    if (statusToggle) {
      statusToggle.disabled = isReadOnly;
      const parent = statusToggle.closest('.toggle-slide-switch') || statusToggle.parentElement;
      if (parent) {
        parent.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parent.style.opacity = isReadOnly ? '0.75' : '1';
        parent.style.cursor = isReadOnly ? 'not-allowed' : 'pointer';
      }
      const wrap = document.getElementById('toggleWrapEmpStatus');
      if (wrap) {
        wrap.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      }
    }
  
    const geoToggle = document.getElementById('inpEmpGeoAttendanceToggle');
    if (geoToggle) {
      geoToggle.disabled = isReadOnly;
      const parent = geoToggle.closest('.toggle-slide-switch') || geoToggle.parentElement;
      if (parent) {
        parent.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parent.style.opacity = isReadOnly ? '0.75' : '1';
        parent.style.cursor = isReadOnly ? 'not-allowed' : 'pointer';
      }
      const wrap = document.getElementById('toggleWrapEmpGeoAttendance');
      if (wrap) {
        wrap.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      }
    }
  
    const reverts = form.querySelectorAll('.btn-toggle-revert');
    reverts.forEach(b => {
      if (isReadOnly) {
        b.style.setProperty('display', 'none', 'important');
      } else {
        const wrap = b.closest('.slide-dynamic-wrap');
        if (wrap && wrap.style.display !== 'none') {
          b.style.setProperty('display', 'flex', 'important');
        }
      }
    });
  
    const badges = form.querySelectorAll('.input-pdf-badge');
    badges.forEach(b => {
      b.style.pointerEvents = 'auto';
      b.style.opacity = '1';
      b.style.cursor = 'pointer';
    });
  }
  
  window.handleEmpClick = function(empId, empName) {
    const dataset = masterEmployeeData;
    let emp = dataset.find(e => String(e.id) === String(empId) || String(e.employee_id) === String(empId) || e.employeeName === empName || e.employeeId === empId);
  
    if (!emp) {
      emp = {
        id: empId || 'emp-1',
        employeeId: "",
        employeeName: empName || "",
        empType: "On-Roll",
        address: "",
        contactNumber: "",
        email: "",
        dob: "",
        bloodGroup: "A+",
        maritalStatus: "Single",
        qualification: "",
        pan: "",
        aadhar: "",
        drivingLicense: "",
        passportNumber: "",
        epfUan: "",
        esiCode: "",
        prevExp: "",
        currentExp: "",
        totalExp: "",
        doj: "",
        designation: "",
        status: "Active"
      };
    }
  
    currentViewedEmpId = emp.employee_id || emp.id;
    isEmployeeFormEditing = false;
  
    const overlay = document.getElementById('sideFormOverlay');
    if (overlay) overlay.style.display = 'flex';
  
    const cards = document.querySelectorAll('.side-form-card, .side-contact-popup');
    cards.forEach(c => c.style.display = 'none');
  
    const card = document.getElementById('addEmployeeCard');
    if (card) card.style.display = 'block';
  
    // Update Header Title to Employee Name
    const lblTitle = document.getElementById('lblEmployeeCardTitle');
    if (lblTitle) lblTitle.innerText = emp.employeeName || emp.employee_name || 'View Employee';
  
    // Hide Bank, Asset, Salary action icons in View Employee tab
    const btnEmpBank = document.getElementById('btnEmpBankDetails');
    const btnEmpAsset = document.getElementById('btnEmpAssetDetails');
    const btnEmpSalary = document.getElementById('btnEmpSalaryDetails');
    if (btnEmpBank) btnEmpBank.style.display = 'none';
    if (btnEmpAsset) btnEmpAsset.style.display = 'none';
    if (btnEmpSalary) btnEmpSalary.style.display = 'none';
  
    // Show Edit button with Blue Pencil icon
    const btnEditToggle = document.getElementById('btnEmpCardEditToggle');
    const imgEditIcon = document.getElementById('imgEmpCardEditIcon');
    if (btnEditToggle) btnEditToggle.style.display = 'flex';
    if (imgEditIcon) {
      imgEditIcon.src = 'icons/Edit.svg';
      imgEditIcon.title = 'Edit Info';
    }
  
    // Hide bottom save button container in View mode
    const btnSaveWrap = document.querySelector('#frmAddEmployee .form-submit-inside-wrap');
    if (btnSaveWrap) btnSaveWrap.style.display = 'none';
  
    // Populate form regular fields
    if (document.getElementById('inpEmpType')) document.getElementById('inpEmpType').value = emp.empType || emp.employeeType || emp.employee_type || 'On-Roll';
    if (document.getElementById('inpEmpName')) document.getElementById('inpEmpName').value = emp.employeeName || emp.employee_name || '';
    if (document.getElementById('inpEmpId')) document.getElementById('inpEmpId').value = emp.employeeId || emp.employee_code || '';
    if (document.getElementById('inpEmpAddress')) document.getElementById('inpEmpAddress').value = emp.address || '';
    if (document.getElementById('inpEmpMobile')) document.getElementById('inpEmpMobile').value = emp.contactNumber || emp.mobile_number || '';
    if (document.getElementById('inpEmpEmail')) document.getElementById('inpEmpEmail').value = emp.email || '';
    if (document.getElementById('inpEmpDob')) document.getElementById('inpEmpDob').value = emp.dob || '';
    if (document.getElementById('inpEmpDoj')) document.getElementById('inpEmpDoj').value = emp.doj || '';
    if (document.getElementById('inpEmpBloodGroup')) document.getElementById('inpEmpBloodGroup').value = emp.bloodGroup || emp.blood_group || 'A+';
    if (document.getElementById('inpEmpMaritalStatus')) document.getElementById('inpEmpMaritalStatus').value = emp.maritalStatus || emp.marital_status || 'Single';
    if (document.getElementById('inpEmpQualification')) document.getElementById('inpEmpQualification').value = emp.qualification || '';
    if (document.getElementById('inpEmpPrevExp')) document.getElementById('inpEmpPrevExp').value = emp.prevExp || '';
    if (document.getElementById('inpEmpCurrExp')) document.getElementById('inpEmpCurrExp').value = emp.currentExp || '';
    if (document.getElementById('inpEmpTotalExp')) document.getElementById('inpEmpTotalExp').value = emp.totalExp || '';
    if (document.getElementById('inpEmpDesignation')) document.getElementById('inpEmpDesignation').value = emp.designation || '';
  
    // Populate toggle fields (PAN, Aadhar, DL, Passport, EPF, ESI)
    const toggleFields = [
      { key: 'Pan', val: emp.pan || emp.pan_number, inpId: 'inpEmpPanNumber' },
      { key: 'Aadhar', val: emp.aadhar || emp.aadhaar_number, inpId: 'inpEmpAadharNumber' },
      { key: 'Dl', val: emp.drivingLicense || emp.dl_number, inpId: 'inpEmpDrivingLicense' },
      { key: 'Passport', val: emp.passportNumber || emp.passport_number, inpId: 'inpEmpPassportNumber' },
      { key: 'Epf', val: emp.epfUan || emp.epf_uan, inpId: 'inpEmpEpfUan' },
      { key: 'Esi', val: emp.esiId || emp.esiCode || emp.esi_code, inpId: 'inpEmpEsiCode' }
    ];
  
    toggleFields.forEach(tf => {
      const toggle = document.getElementById(`inpEmp${tf.key}Toggle`);
      const wrap = document.getElementById(`wrapEmp${tf.key}`);
      const toggleWrap = document.getElementById(`toggleWrapEmp${tf.key}`);
      const textInp = document.getElementById(tf.inpId);
  
      if (tf.val && String(tf.val).trim() !== '') {
        if (toggle) toggle.checked = true;
        if (toggleWrap) toggleWrap.style.setProperty('display', 'none', 'important');
        if (wrap) wrap.style.setProperty('display', 'flex', 'important');
        if (textInp) textInp.value = tf.val;
      } else {
        if (toggle) toggle.checked = false;
        if (wrap) wrap.style.setProperty('display', 'none', 'important');
        if (toggleWrap) toggleWrap.style.setProperty('display', 'flex', 'important');
        if (textInp) textInp.value = '';
      }
    });
  
    const statusToggleEl = document.getElementById('inpEmpStatusToggle');
    const rawStatus = emp.status !== undefined ? emp.status : 'Active';
    const isStatusActive = (rawStatus === true || rawStatus === 'Active' || (typeof rawStatus === 'string' && rawStatus.trim().toLowerCase() === 'active'));
    if (statusToggleEl) {
      statusToggleEl.checked = isStatusActive;
      if (isStatusActive) {
        statusToggleEl.setAttribute('checked', 'checked');
      } else {
        statusToggleEl.removeAttribute('checked');
      }
    }
  
    const geoToggleEl = document.getElementById('inpEmpGeoAttendanceToggle');
    const rawGeo = emp.geo_attendance !== undefined ? emp.geo_attendance : emp.geoAttendance;
    const isGeoActive = Boolean(rawGeo === true || rawGeo === 'true' || rawGeo === 1 || rawGeo === '1');
    if (geoToggleEl) {
      geoToggleEl.checked = isGeoActive;
      if (isGeoActive) {
        geoToggleEl.setAttribute('checked', 'checked');
      } else {
        geoToggleEl.removeAttribute('checked');
      }
    }
  
    setEmployeeFormReadOnly(true);
    const isContract = (emp.empType === 'Contract' || emp.employeeType === 'Contract' || emp.employee_type === 'Contract');
    if (typeof updateEmployeeFormLayout === 'function') {
      updateEmployeeFormLayout('view', isContract ? 'Contract' : 'On-Roll');
    }
    showToast(`Viewing details for employee: ${emp.employeeName || emp.employee_name}`);
  };
  
  window.saveEmployeeEdits = async function() {
    const currentEmp = masterEmployeeData.find(e => String(e.id) === String(currentViewedEmpId) || String(e.employee_id) === String(currentViewedEmpId) || String(e.employeeId) === String(currentViewedEmpId));
    const dbEmpId = (currentEmp && (currentEmp.employee_id || currentEmp.id)) || currentViewedEmpId;
    const isContract = currentEmp && (currentEmp.empType === 'Contract' || currentEmp.employeeType === 'Contract' || currentEmp.employee_type === 'Contract');
  
    const empType = document.getElementById('inpEmpType')?.value || (currentEmp ? currentEmp.employeeType : 'On-Roll');
    const employeeName = document.getElementById('inpEmpName')?.value?.trim() || (currentEmp ? currentEmp.employeeName : '');
    const employeeId = document.getElementById('inpEmpId')?.value?.trim() || (currentEmp ? currentEmp.employeeId : '');
    const address = document.getElementById('inpEmpAddress')?.value?.trim() || '';
    const contactNumber = document.getElementById('inpEmpMobile')?.value?.trim() || '';
    const email = document.getElementById('inpEmpEmail')?.value?.trim() || '';
    const dob = document.getElementById('inpEmpDob')?.value || '';
    const doj = document.getElementById('inpEmpDoj')?.value || '';
    const bloodGroup = document.getElementById('inpEmpBloodGroup')?.value || 'A+';
    const maritalStatus = document.getElementById('inpEmpMaritalStatus')?.value || 'Single';
    const qualification = document.getElementById('inpEmpQualification')?.value?.trim() || '';
    const designation = document.getElementById('inpEmpDesignation')?.value?.trim() || '';
  
    const panToggle = document.getElementById('inpEmpPanToggle');
    const pan = (panToggle && panToggle.checked) ? (document.getElementById('inpEmpPanNumber')?.value?.trim() || '') : (document.getElementById('inpEmpPanNumber')?.value?.trim() || '');
  
    const aadharToggle = document.getElementById('inpEmpAadharToggle');
    const aadhar = (aadharToggle && aadharToggle.checked) ? (document.getElementById('inpEmpAadharNumber')?.value?.trim() || '') : (document.getElementById('inpEmpAadharNumber')?.value?.trim() || '');
  
    const dlToggle = document.getElementById('inpEmpDlToggle');
    const drivingLicense = (dlToggle && dlToggle.checked) ? (document.getElementById('inpEmpDrivingLicense')?.value?.trim() || '') : (document.getElementById('inpEmpDrivingLicense')?.value?.trim() || '');
  
    const passportToggle = document.getElementById('inpEmpPassportToggle');
    const passportNumber = (passportToggle && passportToggle.checked) ? (document.getElementById('inpEmpPassportNumber')?.value?.trim() || '') : (document.getElementById('inpEmpPassportNumber')?.value?.trim() || '');
  
    const epfToggle = document.getElementById('inpEmpEpfToggle');
    const epfUan = (epfToggle && epfToggle.checked) ? (document.getElementById('inpEmpEpfUan')?.value?.trim() || '') : (document.getElementById('inpEmpEpfUan')?.value?.trim() || '');
  
    const esiToggle = document.getElementById('inpEmpEsiToggle');
    const esiId = (esiToggle && esiToggle.checked) ? (document.getElementById('inpEmpEsiCode')?.value?.trim() || '') : (document.getElementById('inpEmpEsiCode')?.value?.trim() || '');
  
    const prevExp = document.getElementById('inpEmpPrevExp')?.value?.trim() || '';
    const currentExp = document.getElementById('inpEmpCurrExp')?.value?.trim() || '';
    const totalExp = document.getElementById('inpEmpTotalExp')?.value?.trim() || '';
  
    const geoToggle = document.getElementById('inpEmpGeoAttendanceToggle');
    const geoAttendance = Boolean(geoToggle && geoToggle.checked);
  
    const statusToggle = document.getElementById('inpEmpStatusToggle');
    const status = (statusToggle && statusToggle.checked) ? 'Active' : 'In - Active';
  
    const payload = {
      employee_type: empType,
      empType: empType,
      employee_name: employeeName,
      employeeName: employeeName,
      employee_code: employeeId,
      employeeId: employeeId,
      address,
      mobile_number: contactNumber,
      contactNumber,
      email,
      dob,
      doj,
      blood_group: bloodGroup,
      bloodGroup,
      marital_status: maritalStatus,
      maritalStatus,
      qualification,
      designation,
      pan_number: pan,
      pan,
      aadhaar_number: aadhar,
      aadhar,
      dl_number: drivingLicense,
      drivingLicense,
      passport_number: passportNumber,
      passportNumber,
      epf_uan: epfUan,
      epfUan,
      esi_code: esiId,
      esiId,
      esiCode: esiId,
      previous_experience: prevExp,
      prevExp,
      current_experience: currentExp,
      currentExp,
      total_experience: totalExp,
      totalExp,
      geo_attendance: geoAttendance,
      geoAttendance,
      status
    };
  
    let numericEmpId = parseInt(dbEmpId, 10);
    if (isNaN(numericEmpId) && currentEmp && currentEmp.employee_id) {
      numericEmpId = parseInt(currentEmp.employee_id, 10);
    }
  
    if (typeof NexusApi !== 'undefined' && NexusApi.employees && !isNaN(numericEmpId)) {
      try {
        const updatedRecord = await NexusApi.employees.update(numericEmpId, payload);
  
        if (window.pendingEmployeePdfs && Object.keys(window.pendingEmployeePdfs).length > 0) {
          for (const [docType, file] of Object.entries(window.pendingEmployeePdfs)) {
            try {
              await NexusApi.employees.uploadDocument(numericEmpId, docType, file);
            } catch (docErr) {
              console.error(`Failed to upload ${docType} PDF:`, docErr);
            }
          }
          window.pendingEmployeePdfs = {};
        }
  
        const targetIdx = masterEmployeeData.findIndex(e => String(e.id) === String(currentViewedEmpId) || String(e.employee_id) === String(currentViewedEmpId) || String(e.employeeId) === String(currentViewedEmpId) || String(e.employee_id) === String(numericEmpId));
  
        const mappedRecord = {
          ...updatedRecord,
          id: updatedRecord.employee_id || updatedRecord.id || numericEmpId,
          employee_id: updatedRecord.employee_id || updatedRecord.id || numericEmpId,
          employeeName: updatedRecord.employee_name || updatedRecord.employeeName || employeeName,
          employee_name: updatedRecord.employee_name || updatedRecord.employeeName || employeeName,
          employeeId: updatedRecord.employee_code || updatedRecord.employeeId || employeeId,
          employee_code: updatedRecord.employee_code || updatedRecord.employeeId || employeeId,
          employeeType: updatedRecord.employee_type || updatedRecord.empType || empType,
          empType: updatedRecord.employee_type || updatedRecord.empType || empType,
          designation: updatedRecord.designation !== undefined ? updatedRecord.designation : designation,
          address: updatedRecord.address !== undefined ? updatedRecord.address : address,
          contactNumber: updatedRecord.mobile_number || updatedRecord.contactNumber || contactNumber,
          mobile_number: updatedRecord.mobile_number || updatedRecord.contactNumber || contactNumber,
          email: updatedRecord.email !== undefined ? updatedRecord.email : email,
          dob: updatedRecord.dob !== undefined ? updatedRecord.dob : dob,
          doj: updatedRecord.doj !== undefined ? updatedRecord.doj : doj,
          bloodGroup: updatedRecord.blood_group || updatedRecord.bloodGroup || bloodGroup,
          maritalStatus: updatedRecord.marital_status || updatedRecord.maritalStatus || maritalStatus,
          qualification: updatedRecord.qualification !== undefined ? updatedRecord.qualification : qualification,
          pan: updatedRecord.pan_number || updatedRecord.pan || pan,
          aadhar: updatedRecord.aadhaar_number || updatedRecord.aadhar || aadhar,
          drivingLicense: updatedRecord.dl_number || updatedRecord.drivingLicense || drivingLicense,
          passportNumber: updatedRecord.passport_number || updatedRecord.passportNumber || passportNumber,
          epfUan: updatedRecord.epf_uan || updatedRecord.epfUan || epfUan,
          esiCode: updatedRecord.esi_code || updatedRecord.esiId || esiId,
          esiId: updatedRecord.esi_code || updatedRecord.esiId || esiId,
          geo_attendance: updatedRecord.geo_attendance !== undefined ? updatedRecord.geo_attendance : geoAttendance,
          geoAttendance: updatedRecord.geo_attendance !== undefined ? updatedRecord.geo_attendance : geoAttendance,
          status: updatedRecord.status || status
        };
  
        if (targetIdx !== -1) {
          masterEmployeeData[targetIdx] = mappedRecord;
        } else {
          masterEmployeeData.unshift(mappedRecord);
        }
  
        if (currentModule === 'master' && currentMasterSubpage === 'employee') {
          currentDataset = [...masterEmployeeData];
          applyFiltersAndRender();
        }
  
        isEmployeeFormEditing = false;
        setEmployeeFormReadOnly(true);
        if (typeof updateEmployeeFormLayout === 'function') {
          updateEmployeeFormLayout('view', isContract ? 'Contract' : 'On-Roll');
        }
  
        const lblTitle = document.getElementById('lblEmployeeCardTitle');
        if (lblTitle) lblTitle.innerText = mappedRecord.employeeName;
        const imgIcon = document.getElementById('imgEmpCardEditIcon');
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        const btnSaveWrap = document.querySelector('#frmAddEmployee .form-submit-inside-wrap');
        if (btnSaveWrap) btnSaveWrap.style.display = 'none';
  
        currentViewedEmpId = mappedRecord.employee_id || mappedRecord.id;
  
        // Synchronize form toggle elements in view mode
        const stToggle = document.getElementById('inpEmpStatusToggle');
        if (stToggle) {
          const isStActive = (mappedRecord.status === true || mappedRecord.status === 'Active' || (typeof mappedRecord.status === 'string' && !mappedRecord.status.toLowerCase().includes('in') && !mappedRecord.status.toLowerCase().includes('false')));
          stToggle.checked = isStActive;
        }
        const gToggle = document.getElementById('inpEmpGeoAttendanceToggle');
        if (gToggle) {
          const rawG = mappedRecord.geo_attendance !== undefined ? mappedRecord.geo_attendance : mappedRecord.geoAttendance;
          gToggle.checked = Boolean(rawG === true || rawG === 'true' || rawG === 1 || rawG === '1');
        }
  
        if (typeof showSvgSuccessPopup === 'function') {
          showSvgSuccessPopup('Employee details updated successfully!', 'Task Completed');
        } else {
          showToast('Employee details saved & updated successfully!');
        }
      } catch (err) {
        console.error('Failed to update employee via API:', err);
        const msg = err.detail || err.message || 'Failed to update employee.';
        if (typeof showSvgErrorPopup === 'function') {
          showSvgErrorPopup(msg, 'Error Message!');
        } else {
          showToast(`Error: ${msg}`);
        }
      }
    } else {
      // Fallback local update
      if (currentEmp) {
        Object.assign(currentEmp, payload);
      }
      if (currentModule === 'master' && currentMasterSubpage === 'employee') {
        currentDataset = [...masterEmployeeData];
        applyFiltersAndRender();
      }
      isEmployeeFormEditing = false;
      setEmployeeFormReadOnly(true);
      if (typeof updateEmployeeFormLayout === 'function') {
        updateEmployeeFormLayout('view', isContract ? 'Contract' : 'On-Roll');
      }
      const lblTitle = document.getElementById('lblEmployeeCardTitle');
      if (lblTitle) lblTitle.innerText = employeeName || 'View Employee';
      const imgIcon = document.getElementById('imgEmpCardEditIcon');
      if (imgIcon) {
        imgIcon.src = 'icons/Edit.svg';
        imgIcon.title = 'Edit Info';
      }
      const btnSaveWrap = document.querySelector('#frmAddEmployee .form-submit-inside-wrap');
      if (btnSaveWrap) btnSaveWrap.style.display = 'none';
      if (typeof showSvgSuccessPopup === 'function') {
        showSvgSuccessPopup('Employee details updated successfully!', 'Task Completed');
      } else {
        showToast('Employee details saved & updated successfully!');
      }
    }
  };

  // Save Master Employee Record (for creation)
  window.saveMasterEmployeeRecord = async function() {
        if (isEmployeeFormEditing || currentViewedEmpId) {
          if (typeof window.saveEmployeeEdits === 'function') {
            window.saveEmployeeEdits();
          }
          return;
        }
        const employeeName = document.getElementById('inpEmpName')?.value.trim();
        const employeeId = document.getElementById('inpEmpId')?.value.trim();
        const empType = document.getElementById('inpEmpType')?.value || "On-Roll";
        const address = document.getElementById('inpEmpAddress')?.value.trim() || "";
        const contactNumber = document.getElementById('inpEmpMobile')?.value.trim() || "";
        const email = document.getElementById('inpEmpEmail')?.value.trim() || "";
        const dob = document.getElementById('inpEmpDob')?.value || "";
        const bloodGroup = document.getElementById('inpEmpBloodGroup')?.value || "A+";
        const maritalStatus = document.getElementById('inpEmpMaritalStatus')?.value || "Single";
        const qualification = document.getElementById('inpEmpQualification')?.value.trim() || "";
        const panToggle = document.getElementById('inpEmpPanToggle');
        const pan = (panToggle && panToggle.checked) ? (document.getElementById('inpEmpPanNumber')?.value.trim() || "") : "";
        const aadharToggle = document.getElementById('inpEmpAadharToggle');
        const aadhar = (aadharToggle && aadharToggle.checked) ? (document.getElementById('inpEmpAadharNumber')?.value.trim() || "") : "";
        const dlToggle = document.getElementById('inpEmpDlToggle');
        const drivingLicense = (dlToggle && dlToggle.checked) ? (document.getElementById('inpEmpDrivingLicense')?.value.trim() || "") : "";
        const passportToggle = document.getElementById('inpEmpPassportToggle');
        const passportNumber = (passportToggle && passportToggle.checked) ? (document.getElementById('inpEmpPassportNumber')?.value.trim() || "") : "";
        const epfToggle = document.getElementById('inpEmpEpfToggle');
        const epfUan = (epfToggle && epfToggle.checked) ? (document.getElementById('inpEmpEpfUan')?.value.trim() || "") : "";
        const esiToggle = document.getElementById('inpEmpEsiToggle');
        const esiId = (esiToggle && esiToggle.checked) ? (document.getElementById('inpEmpEsiCode')?.value.trim() || "") : "";
        const prevExp = document.getElementById('inpEmpPrevExp')?.value.trim() || "";
        const currentExp = document.getElementById('inpEmpCurrExp')?.value.trim() || "";
        const totalExp = document.getElementById('inpEmpTotalExp')?.value.trim() || "";
        const doj = document.getElementById('inpEmpDoj')?.value || "";
        const designation = document.getElementById('inpEmpDesignation')?.value || "Executive";
        const geoToggle = document.getElementById('inpEmpGeoAttendanceToggle');
        const geoAttendance = geoToggle ? geoToggle.checked : false;
        const statusToggle = document.getElementById('inpEmpStatusToggle');
        const status = (statusToggle && statusToggle.checked) ? "Active" : "In - Active";
  
        if (!employeeName) {
          if (typeof showSvgErrorPopup === 'function') {
            showSvgErrorPopup("Please enter Employee Name.", "Error Message!");
          } else {
            showToast("Please enter Employee Name.");
          }
          return;
        }
  
        if (!employeeId) {
          if (typeof showSvgErrorPopup === 'function') {
            showSvgErrorPopup("Please enter Employee ID / Code.", "Error Message!");
          } else {
            showToast("Please enter Employee ID / Code.");
          }
          return;
        }
  
        const payload = {
          employeeName,
          employeeId,
          empType,
          designation,
          address,
          contactNumber,
          email,
          dob,
          bloodGroup,
          maritalStatus,
          qualification,
          pan,
          aadhar,
          drivingLicense,
          passportNumber,
          epfUan,
          esiId,
          prevExp,
          currentExp,
          totalExp,
          doj,
          geoAttendance,
          status
        };
  
        if (typeof NexusApi !== 'undefined' && NexusApi.employees) {
          try {
            const newRecord = await NexusApi.employees.create(payload);
            const dbEmpId = newRecord.employee_id || newRecord.id;
  
            // Upload any pending PDF documents
            if (window.pendingEmployeePdfs && Object.keys(window.pendingEmployeePdfs).length > 0 && dbEmpId) {
              for (const [docType, file] of Object.entries(window.pendingEmployeePdfs)) {
                try {
                  await NexusApi.employees.uploadDocument(dbEmpId, docType, file);
                } catch (docErr) {
                  console.error(`Failed to upload ${docType} PDF:`, docErr);
                }
              }
              window.pendingEmployeePdfs = {};
            }
  
            masterEmployeeData.unshift({
              ...newRecord,
              id: newRecord.employee_id || newRecord.id,
              employeeName: newRecord.employee_name || newRecord.employeeName,
              employeeId: newRecord.employee_code || newRecord.employeeId,
              employeeType: newRecord.employee_type || newRecord.empType,
              empType: newRecord.employee_type || newRecord.empType,
              contactNumber: newRecord.mobile_number || newRecord.contactNumber
            });
            currentDataset = [...masterEmployeeData];
            applyFiltersAndRender();
            closeSideForm();
            if (typeof showSvgSuccessPopup === 'function') {
              showSvgSuccessPopup('Employee added successfully!', 'Task Completed');
            } else {
              showToast(`Employee ${employeeName} successfully saved & added to table!`);
            }
          } catch (err) {
            console.error('Failed to create employee via API:', err);
            const msg = err.detail || err.message || "Failed to create employee.";
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(msg, "Error Message!");
            } else {
              showToast(`Error: ${msg}`);
            }
          }
        } else {
          const newRecord = {
            id: `emp-${Date.now()}`,
            employeeName,
            employeeId,
            empType,
            employeeType: empType,
            address,
            contactNumber,
            email,
            dob,
            bloodGroup,
            maritalStatus,
            qualification,
            pan,
            aadhar,
            drivingLicense,
            passportNumber,
            epfUan,
            esiId,
            esiCode: esiId,
            prevExp,
            currentExp,
            totalExp,
            doj,
            designation,
            status
          };
  
          masterEmployeeData.unshift(newRecord);
          currentDataset = [...masterEmployeeData];
          applyFiltersAndRender();
          closeSideForm();
          showToast(`Employee ${employeeName} successfully saved & added to table!`);
        }
        return;

  };

  function initEmployeeEventListeners() {
    const btnEmpCardEditToggle = document.getElementById('btnEmpCardEditToggle');
    if (btnEmpCardEditToggle && !btnEmpCardEditToggle.dataset.empBound) {
      btnEmpCardEditToggle.dataset.empBound = 'true';
      btnEmpCardEditToggle.addEventListener('click', async () => {
        const lblTitle = document.getElementById('lblEmployeeCardTitle');
        const imgIcon = document.getElementById('imgEmpCardEditIcon');
        const currentEmp = (window.masterEmployeeData || []).find(e => String(e.id) === String(window.currentViewedEmpId) || String(e.employee_id) === String(window.currentViewedEmpId) || String(e.employeeId) === String(window.currentViewedEmpId));
        const isContract = currentEmp && (currentEmp.empType === 'Contract' || currentEmp.employeeType === 'Contract' || currentEmp.employee_type === 'Contract');

        if (!window.isEmployeeFormEditing) {
          window.isEmployeeFormEditing = true;
          if (typeof setEmployeeFormReadOnly === 'function') setEmployeeFormReadOnly(false);
          if (typeof updateEmployeeFormLayout === 'function') {
            updateEmployeeFormLayout('edit', isContract ? 'Contract' : 'On-Roll');
          }
          if (lblTitle) lblTitle.innerText = currentEmp?.employeeName || currentEmp?.employee_name || 'Edit Employee';
          if (imgIcon) {
            imgIcon.src = 'icons/Save.svg';
            imgIcon.title = 'Save Changes';
          }
          const btnSaveWrap = document.querySelector('#frmAddEmployee .form-submit-inside-wrap');
          if (btnSaveWrap) btnSaveWrap.style.display = 'none';
          if (typeof showToast === 'function') showToast('Employee form is now editable');
        } else {
          await window.saveEmployeeEdits();
        }
      });
    }

    const inpEmpTypeSelect = document.getElementById('inpEmpType');
    if (inpEmpTypeSelect && !inpEmpTypeSelect.dataset.empBound) {
      inpEmpTypeSelect.dataset.empBound = 'true';
      inpEmpTypeSelect.addEventListener('change', () => {
        if (!window.isEmployeeFormEditing && (!window.currentViewedEmpId || window.currentViewedEmpId === null)) {
          if (typeof updateEmployeeFormLayout === 'function') {
            updateEmployeeFormLayout('add', inpEmpTypeSelect.value);
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmployeeEventListeners);
  } else {
    initEmployeeEventListeners();
  }
  window.initEmployeeEventListeners = initEmployeeEventListeners;

  // Exports
  window.setEmployeeFormReadOnly = typeof setEmployeeFormReadOnly !== 'undefined' ? setEmployeeFormReadOnly : window.setEmployeeFormReadOnly;
})(window);
