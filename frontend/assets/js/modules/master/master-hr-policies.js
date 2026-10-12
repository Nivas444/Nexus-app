/**
 * Nexus ERP - Master HR Policies & Compliance Module
 * Encapsulates Company HR statutory policy modals (EPF, ESI, PT, LWF, TDS, Leave, Bonus, Medical Insurance),
 * form read-only toggling, and API creation/saving via window.NexusApi.hrCompliance.
 */
(function(window) {
  'use strict';

  function openCompanyHrPoliciesPage(tab) {
    if (typeof window.closeSideForm === 'function') window.closeSideForm();
    window.currentModule = 'master';
    window.currentMasterView = 'hr_policies';
    window.currentCompanyHrTab = tab || 'epf';
    window.activeColumnFilters = {};
    if (typeof window.updateURL === 'function') window.updateURL();
    if (typeof window.renderApp === 'function') window.renderApp();
    if (typeof window.fetchCompanyHrDataFromBackend === 'function') {
      window.fetchCompanyHrDataFromBackend(window.currentCompanyHrTab);
    }
    if (typeof window.showToast === 'function') {
      window.showToast(`Opened Company HR Policies • ${(window.currentCompanyHrTab || 'epf').toUpperCase()}`);
    }
  }

  function genericSetHrReadOnly(formId, toggleId, isReadOnly) {
    const form = document.getElementById(formId);
    if (!form) return;
    const inputs = form.querySelectorAll('input:not([type="checkbox"])');
    inputs.forEach(inp => {
      inp.readOnly = isReadOnly;
      inp.style.backgroundColor = '#ffffff';
      inp.style.cursor = isReadOnly ? 'default' : 'text';
    });
    const selects = form.querySelectorAll('select');
    selects.forEach(sel => {
      sel.disabled = isReadOnly;
      sel.style.backgroundColor = isReadOnly ? '#f8fafc' : '#ffffff';
      sel.style.cursor = isReadOnly ? 'default' : 'pointer';
    });
    const calTriggers = form.querySelectorAll('.btn-calendar-trigger');
    calTriggers.forEach(b => {
      b.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      b.style.opacity = isReadOnly ? '0.65' : '1';
      b.style.cursor = isReadOnly ? 'default' : 'pointer';
    });
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.disabled = isReadOnly;
      const parentSwitch = toggle.closest('.toggle-slide-switch');
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
      }
    }
  }

  let isSubmittingHrCompliance = false;

  async function saveCompanyHrCompliance(complianceType) {
    if (isSubmittingHrCompliance) return;

    const companyName = (typeof window.currentCompanyMasterName !== 'undefined' && window.currentCompanyMasterName)
      ? window.currentCompanyMasterName
      : 'Nexus';

    let payload = {
      compliance_type: complianceType,
      company_name: companyName
    };

    const getVal = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const getChecked = id => {
      const el = document.getElementById(id);
      return el ? el.checked : true;
    };

    if (complianceType === 'EPF') {
      const fromDate = getVal('inpEpfFromDate');
      const toDate = getVal('inpEpfToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.epf_filling_due_date = getVal('inpEpfFillingDueDate') || null;
      payload.epf_sealing_amount = getVal('inpEpfSealingAmount') || null;
      payload.epf_employee_contribution = getVal('inpEpfEmpContribution') || null;
      payload.epf_employer_contribution = getVal('inpEpfEmployerContribution') || null;
      payload.eps_employer_contribution = getVal('inpEpsEmployerContribution') || null;
      payload.edli_employer_contribution = getVal('inpEdliEmployerContribution') || null;
      payload.epf_admin_charges = getVal('inpEpfAdminCharges') || null;
      payload.epf_status = getChecked('inpEpfStatusToggle') ? 'Active' : 'In - Active';
    } else if (complianceType === 'ESI') {
      const fromDate = getVal('inpEsiFromDate');
      const toDate = getVal('inpEsiToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.esi_filling_frequency = getVal('inpEsiFillingFrequency') || 'Monthly';
      payload.esi_filling_date = getVal('inpEsiFillingDueDate') || null;
      payload.esi_sealing_amount = getVal('inpEsiSealingAmount') || null;
      payload.esi_employee_contribution = getVal('inpEsiEmpContribution') || null;
      payload.esi_employer_contribution = getVal('inpEsiEmployerContribution') || null;
      payload.esi_status = getChecked('inpEsiStatusToggle') ? 'Active' : 'In - Active';
    } else if (complianceType === 'PT') {
      const fromDate = getVal('inpPtFromDate');
      const toDate = getVal('inpPtToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.state = getVal('inpPtState') || null;
      payload.pt_filling_frequency = getVal('inpPtFillingFrequency') || null;
      payload.pt_filling_due_date = getVal('inpPtFillingDueDate') || null;
      payload.gross_salary_from = getVal('inpPtThresholdLimit') || null;
      payload.pt_employee_deduction = getVal('inpPtEmpContribution') || null;
      payload.pt_status = getChecked('inpPtStatusToggle') ? 'Active' : 'In - Active';
    } else if (complianceType === 'LWF') {
      const fromDate = getVal('inpLwfFromDate');
      const toDate = getVal('inpLwfToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.state = getVal('inpLwfState') || null;
      payload.lwf_filling_frequency = getVal('inpLwfFillingFrequency') || null;
      payload.lwf_filling_due_date = getVal('inpLwfFillingDueDate') || null;
      payload.lwf_employee_contribution = getVal('inpLwfEmpContribution') || null;
      payload.lwf_employer_contribution = getVal('inpLwfEmployerContribution') || null;
      payload.lwf_status = getChecked('inpLwfStatusToggle') ? 'Active' : 'In - Active';
    } else if (complianceType === 'TDS') {
      const fromDate = getVal('inpTdsFromDate');
      const toDate = getVal('inpTdsToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.pt_filling_frequency = getVal('inpTdsFillingFrequency') || null;
      payload.pt_filling_due_date = getVal('inpTdsFillingDueDate') || null;
      payload.state = getVal('inpTdsCode') || null;
      payload.epf_filling_frequency = getVal('inpTdsCategory') || null;
      payload.gross_salary_from = getVal('inpTdsThresholdLimit') || null;
      payload.tds_standard_deduction = getVal('inpTdsStandardDeduction') || null;
      payload.tds_deduction_percentage = getVal('inpTdsRate') || null;
      payload.health_and_education_cess = getVal('inpTdsHealthCess') || null;
      payload.tds_status = getChecked('inpTdsStatusToggle') ? 'Active' : 'In - Active';
    } else if (complianceType === 'Leave') {
      const fromDate = getVal('inpLeaveFromDate');
      const toDate = getVal('inpLeaveToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      const leaveType = getVal('inpLeaveType') || 'Casual Leave';
      const eligibleDays = getVal('inpLeaveEligibleWorkingDays');
      const claimablePeriod = getVal('inpLeaveClaimablePeriod');
      const sandwichPolicy = getVal('inpLeaveSandwichPolicy') || 'No';

      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.state = leaveType;
      payload.leave_type = leaveType;
      payload.sandwich_leave_policy = sandwichPolicy;

      if (leaveType === 'Casual Leave') {
        payload.cl_eligible = eligibleDays || null;
        payload.cl_can_claim = claimablePeriod || null;
      } else if (leaveType === 'Sick Leave') {
        payload.sl_eligible = eligibleDays || null;
        payload.sl_can_claim = claimablePeriod || null;
      } else if (leaveType === 'Earning Leave') {
        payload.el_eligible = eligibleDays || null;
        payload.el_can_claim = claimablePeriod || null;
      }
      payload.leave_status = getChecked('inpLeaveStatusToggle') ? 'Active' : 'In - Active';
    } else if (complianceType === 'Bonus') {
      const fromDate = getVal('inpBonusFromDate');
      const toDate = getVal('inpBonusToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      const bonusType = getVal('inpBonusType') || 'Statutory Bonus';
      const bonusVal = getVal('inpBonusPercent') || null;
      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.state = bonusType;
      payload.bonus_type = bonusType;
      payload.statutory_bonus_sealing_amount = getVal('inpBonusSealingAmount') || null;
      if (bonusType === 'Performance Bonus') {
        payload.performance_bonus = bonusVal;
        payload.statutory_bonus = bonusVal;
      } else {
        payload.statutory_bonus = bonusVal;
      }
      payload.bonus_status = getChecked('inpBonusStatusToggle') ? 'Active' : 'In - Active';
    } else if (complianceType === 'Medical Insurance') {
      const fromDate = getVal('inpMedFromDate');
      const toDate = getVal('inpMedToDate');
      if (!fromDate || !toDate) {
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup('From Date and To Date are required.', 'Validation Error');
        } else if (typeof window.showToast === 'function') {
          window.showToast('From Date and To Date are required.');
        }
        return;
      }
      payload.from_date = fromDate;
      payload.to_date = toDate;
      payload.medical_insurance_company_name = getVal('inpMedInsuranceCompany') || null;
      payload.epf_sealing_amount = getVal('inpMedSealingAmount') || null;
      payload.medical_insurance_employee_contribution = getVal('inpMedEmpContribution') || null;
      payload.medical_insurance_employer_contribution = getVal('inpMedEmployerContribution') || null;
      payload.medical_insurance_status = getChecked('inpMedStatusToggle') ? 'Active' : 'In - Active';
    }

    isSubmittingHrCompliance = true;
    try {
      if (!window.NexusApi || !window.NexusApi.hrCompliance) {
        throw new Error('HR Compliance API is not available.');
      }
      await window.NexusApi.hrCompliance.create(payload, companyName);
      if (typeof window.showSvgSuccessPopup === 'function') {
        window.showSvgSuccessPopup(`${complianceType} compliance details added successfully!`, 'Task Completed');
      }

      const closeFns = {
        'EPF': closeCompanyHrEpfModal,
        'ESI': closeCompanyHrEsiModal,
        'PT': closeCompanyHrPtModal,
        'LWF': closeCompanyHrLwfModal,
        'TDS': closeCompanyHrTdsModal,
        'Leave': closeCompanyHrLeaveModal,
        'Bonus': closeCompanyHrBonusModal,
        'Medical Insurance': closeCompanyHrMedicalInsuranceModal
      };
      if (closeFns[complianceType]) closeFns[complianceType]();

      const tabMap = {
        'EPF': 'epf',
        'ESI': 'esi',
        'PT': 'pt',
        'LWF': 'lwf',
        'TDS': 'tds',
        'Leave': 'leave',
        'Bonus': 'bonus',
        'Medical Insurance': 'medical_insurance'
      };
      if (typeof window.fetchCompanyHrDataFromBackend === 'function') {
        await window.fetchCompanyHrDataFromBackend(tabMap[complianceType]);
      }
    } catch (err) {
      console.error(`Failed to save ${complianceType} compliance record:`, err);
      if (typeof window.showSvgErrorPopup === 'function') {
        window.showSvgErrorPopup(err.message || `Failed to save ${complianceType} compliance details`, 'Error Message!');
      }
    } finally {
      isSubmittingHrCompliance = false;
    }
  }

  // 1. EPF Modal Controller
  function openCompanyHrEpfModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrEpfCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrEpfData !== 'undefined') && window.companyHrEpfData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpEpfFromDate')) document.getElementById('inpEpfFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpEpfToDate')) document.getElementById('inpEpfToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpEpfFillingDueDate')) document.getElementById('inpEpfFillingDueDate').value = row ? (row.fillingDueDate || '') : '';
    if (document.getElementById('inpEpfSealingAmount')) document.getElementById('inpEpfSealingAmount').value = row ? String(row.sealingAmount || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpEpfEmpContribution')) document.getElementById('inpEpfEmpContribution').value = row ? String(row.employee || '').replace('%', '').trim() : '';
    if (document.getElementById('inpEpfEmployerContribution')) document.getElementById('inpEpfEmployerContribution').value = row ? String(row.epf || '').replace('%', '').trim() : '';
    if (document.getElementById('inpEpsEmployerContribution')) document.getElementById('inpEpsEmployerContribution').value = row ? String(row.eps || '').replace('%', '').trim() : '';
    if (document.getElementById('inpEdliEmployerContribution')) document.getElementById('inpEdliEmployerContribution').value = row ? String(row.edli || '').replace('%', '').trim() : '';
    if (document.getElementById('inpEpfAdminCharges')) document.getElementById('inpEpfAdminCharges').value = row ? String(row.adminCharges || '').replace('%', '').trim() : '';
    if (document.getElementById('inpEpfStatusToggle')) document.getElementById('inpEpfStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrEpf', 'inpEpfStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrEpfEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrEpfCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrEpfModal() {
    document.getElementById('companyHrEpfCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // 2. ESI Modal Controller
  function openCompanyHrEsiModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrEsiCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrEsiData !== 'undefined') && window.companyHrEsiData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpEsiFromDate')) document.getElementById('inpEsiFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpEsiToDate')) document.getElementById('inpEsiToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpEsiFillingFrequency')) document.getElementById('inpEsiFillingFrequency').value = row ? (row.fillingFrequency || '') : '';
    if (document.getElementById('inpEsiFillingDueDate')) document.getElementById('inpEsiFillingDueDate').value = row ? (row.fillingDueDate || '') : '';
    if (document.getElementById('inpEsiSealingAmount')) document.getElementById('inpEsiSealingAmount').value = row ? String(row.sealingAmount || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpEsiEmpContribution')) document.getElementById('inpEsiEmpContribution').value = row ? String(row.employee || '').replace('%', '').trim() : '';
    if (document.getElementById('inpEsiEmployerContribution')) document.getElementById('inpEsiEmployerContribution').value = row ? String(row.employer || '').replace('%', '').trim() : '';
    if (document.getElementById('inpEsiStatusToggle')) document.getElementById('inpEsiStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrEsi', 'inpEsiStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrEsiEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrEsiCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrEsiModal() {
    document.getElementById('companyHrEsiCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // 3. PT Modal Controller
  function openCompanyHrPtModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrPtCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrPtData !== 'undefined') && window.companyHrPtData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpPtFromDate')) document.getElementById('inpPtFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpPtToDate')) document.getElementById('inpPtToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpPtState')) document.getElementById('inpPtState').value = row ? (row.state || '') : '';
    if (document.getElementById('inpPtFillingFrequency')) document.getElementById('inpPtFillingFrequency').value = row ? (row.fillingFrequency || '') : '';
    if (document.getElementById('inpPtFillingDueDate')) document.getElementById('inpPtFillingDueDate').value = row ? (row.fillingDueDate || '') : '';
    if (document.getElementById('inpPtThresholdLimit')) document.getElementById('inpPtThresholdLimit').value = row ? String(row.thresholdLimit || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpPtEmpContribution')) document.getElementById('inpPtEmpContribution').value = row ? String(row.employee || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpPtStatusToggle')) document.getElementById('inpPtStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrPt', 'inpPtStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrPtEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrPtCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrPtModal() {
    document.getElementById('companyHrPtCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // 4. LWF Modal Controller
  function openCompanyHrLwfModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrLwfCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrLwfData !== 'undefined') && window.companyHrLwfData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpLwfFromDate')) document.getElementById('inpLwfFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpLwfToDate')) document.getElementById('inpLwfToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpLwfState')) document.getElementById('inpLwfState').value = row ? (row.state || '') : '';
    if (document.getElementById('inpLwfFillingFrequency')) document.getElementById('inpLwfFillingFrequency').value = row ? (row.fillingFrequency || '') : '';
    if (document.getElementById('inpLwfFillingDueDate')) document.getElementById('inpLwfFillingDueDate').value = row ? (row.fillingDueDate || '') : '';
    if (document.getElementById('inpLwfEmpContribution')) document.getElementById('inpLwfEmpContribution').value = row ? String(row.employee || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpLwfEmployerContribution')) document.getElementById('inpLwfEmployerContribution').value = row ? String(row.employer || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpLwfStatusToggle')) document.getElementById('inpLwfStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrLwf', 'inpLwfStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrLwfEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrLwfCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrLwfModal() {
    document.getElementById('companyHrLwfCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // 5. TDS Modal Controller
  function openCompanyHrTdsModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrTdsCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrTdsData !== 'undefined') && window.companyHrTdsData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpTdsFromDate')) document.getElementById('inpTdsFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpTdsToDate')) document.getElementById('inpTdsToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpTdsFillingFrequency')) document.getElementById('inpTdsFillingFrequency').value = row ? (row.fillingFrequency || '') : '';
    if (document.getElementById('inpTdsFillingDueDate')) document.getElementById('inpTdsFillingDueDate').value = row ? (row.fillingDueDate || '') : '';
    if (document.getElementById('inpTdsCode')) document.getElementById('inpTdsCode').value = row ? (row.tdsCode || '') : '';
    if (document.getElementById('inpTdsCategory')) document.getElementById('inpTdsCategory').value = row ? (row.category || '') : '';
    if (document.getElementById('inpTdsThresholdLimit')) document.getElementById('inpTdsThresholdLimit').value = row ? String(row.thresholdLimit || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpTdsStandardDeduction')) document.getElementById('inpTdsStandardDeduction').value = row ? String(row.standardDeduction || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpTdsRate')) document.getElementById('inpTdsRate').value = row ? String(row.tdsRate || '').replace('%', '').trim() : '';
    if (document.getElementById('inpTdsHealthCess')) document.getElementById('inpTdsHealthCess').value = row ? String(row.healthCess || '').replace('%', '').trim() : '';
    if (document.getElementById('inpTdsStatusToggle')) document.getElementById('inpTdsStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrTds', 'inpTdsStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrTdsEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrTdsCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrTdsModal() {
    document.getElementById('companyHrTdsCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // 6. Leave Modal Controller
  function openCompanyHrLeaveModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrLeaveCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrLeaveData !== 'undefined') && window.companyHrLeaveData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpLeaveFromDate')) document.getElementById('inpLeaveFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpLeaveToDate')) document.getElementById('inpLeaveToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpLeaveType')) document.getElementById('inpLeaveType').value = row ? (row.leaveType || 'Casual Leave') : 'Casual Leave';
    if (document.getElementById('inpLeaveEligibleWorkingDays')) document.getElementById('inpLeaveEligibleWorkingDays').value = row ? (row.eligibleWorkingDays || '') : '';
    if (document.getElementById('inpLeaveClaimablePeriod')) document.getElementById('inpLeaveClaimablePeriod').value = row ? (row.claimablePeriod || '') : '';
    if (document.getElementById('inpLeaveSandwichPolicy')) document.getElementById('inpLeaveSandwichPolicy').value = row ? (row.sandwichPolicy || 'No') : 'No';
    if (document.getElementById('inpLeaveStatusToggle')) document.getElementById('inpLeaveStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrLeave', 'inpLeaveStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrLeaveEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrLeaveCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrLeaveModal() {
    document.getElementById('companyHrLeaveCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // 7. Bonus Modal Controller
  function openCompanyHrBonusModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrBonusCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrBonusData !== 'undefined') && window.companyHrBonusData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpBonusFromDate')) document.getElementById('inpBonusFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpBonusToDate')) document.getElementById('inpBonusToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpBonusType')) document.getElementById('inpBonusType').value = row ? (row.bonusType || 'Statutory Bonus') : 'Statutory Bonus';
    if (document.getElementById('inpBonusSealingAmount')) document.getElementById('inpBonusSealingAmount').value = row ? String(row.sealingAmount || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpBonusPercent')) document.getElementById('inpBonusPercent').value = row ? String(row.bonusPercent || '').replace('%', '').trim() : '';
    if (document.getElementById('inpBonusStatusToggle')) document.getElementById('inpBonusStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrBonus', 'inpBonusStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrBonusEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrBonusCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrBonusModal() {
    document.getElementById('companyHrBonusCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // 8. Medical Insurance Modal Controller
  function openCompanyHrMedicalInsuranceModal(rowId) {
    const overlay = document.getElementById('sideFormOverlay');
    if (!overlay) return;
    overlay.querySelectorAll('.side-form-card, .side-contact-popup').forEach(c => {
      if (c.id !== 'companyHrMedicalInsuranceCard') c.style.display = 'none';
    });
    const row = (rowId && (typeof window.companyHrMedicalInsuranceData !== 'undefined') && window.companyHrMedicalInsuranceData.find(r => r.id === rowId)) || null;

    if (document.getElementById('inpMedFromDate')) document.getElementById('inpMedFromDate').value = row ? (row.from || '') : '';
    if (document.getElementById('inpMedToDate')) document.getElementById('inpMedToDate').value = row ? (row.to || '') : '';
    if (document.getElementById('inpMedInsuranceCompany')) document.getElementById('inpMedInsuranceCompany').value = row ? (row.insuranceCompany || '') : '';
    if (document.getElementById('inpMedSealingAmount')) document.getElementById('inpMedSealingAmount').value = row ? String(row.sealingAmount || '').replace('₹', '').trim() : '';
    if (document.getElementById('inpMedEmpContribution')) document.getElementById('inpMedEmpContribution').value = row ? String(row.employee || '').replace('%', '').trim() : '';
    if (document.getElementById('inpMedEmployerContribution')) document.getElementById('inpMedEmployerContribution').value = row ? String(row.employer || '').replace('%', '').trim() : '';
    if (document.getElementById('inpMedStatusToggle')) document.getElementById('inpMedStatusToggle').checked = row ? !((row.status || '').toLowerCase().includes('in')) : true;

    genericSetHrReadOnly('frmCompanyHrMed', 'inpMedStatusToggle', false);

    const imgIcon = document.getElementById('imgCompanyHrMedEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Save.svg';
      imgIcon.className = 'icon-green';
      imgIcon.title = 'Save';
    }
    const modal = document.getElementById('companyHrMedicalInsuranceCard');
    if (modal) {
      modal.style.display = 'block';
      overlay.style.display = 'flex';
    }
  }

  function closeCompanyHrMedicalInsuranceModal() {
    document.getElementById('companyHrMedicalInsuranceCard')?.style.setProperty('display', 'none');
    document.getElementById('sideFormOverlay')?.style.setProperty('display', 'none');
  }

  // Export globally
  window.openCompanyHrPoliciesPage = openCompanyHrPoliciesPage;
  window.genericSetHrReadOnly = genericSetHrReadOnly;
  window.saveCompanyHrCompliance = saveCompanyHrCompliance;
  window.openCompanyHrEpfModal = openCompanyHrEpfModal;
  window.closeCompanyHrEpfModal = closeCompanyHrEpfModal;
  window.openCompanyHrEsiModal = openCompanyHrEsiModal;
  window.closeCompanyHrEsiModal = closeCompanyHrEsiModal;
  window.openCompanyHrPtModal = openCompanyHrPtModal;
  window.closeCompanyHrPtModal = closeCompanyHrPtModal;
  window.openCompanyHrLwfModal = openCompanyHrLwfModal;
  window.closeCompanyHrLwfModal = closeCompanyHrLwfModal;
  window.openCompanyHrTdsModal = openCompanyHrTdsModal;
  window.closeCompanyHrTdsModal = closeCompanyHrTdsModal;
  window.openCompanyHrLeaveModal = openCompanyHrLeaveModal;
  window.closeCompanyHrLeaveModal = closeCompanyHrLeaveModal;
  window.openCompanyHrBonusModal = openCompanyHrBonusModal;
  window.closeCompanyHrBonusModal = closeCompanyHrBonusModal;
  window.openCompanyHrMedicalInsuranceModal = openCompanyHrMedicalInsuranceModal;
  window.closeCompanyHrMedicalInsuranceModal = closeCompanyHrMedicalInsuranceModal;

})(window);
