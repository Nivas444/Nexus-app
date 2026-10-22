/**
 * Nexus ERP - Master Expenses Module
 * Encapsulates Master Expenses dataset, API integration, modal view/edit/save controllers,
 * and Capex/Opex dynamic depreciation visibility logic.
 */
(function(window) {
  'use strict';

  // Module state
  var masterExpensesData = [];
  var currentViewedExpenseId = null;
  var isExpenseFormEditing = false;

  /**
   * Fetch master expenses from PostgreSQL database via FastAPI /api/v1/master/expenses
   */
  async function loadMasterExpensesFromApi() {
    if (typeof window.NexusApi !== 'undefined' && window.NexusApi.expenses) {
      try {
        const response = await window.NexusApi.expenses.getAll({ limit: 500 });
        if (response && Array.isArray(response.items)) {
          masterExpensesData = response.items;
        } else if (Array.isArray(response)) {
          masterExpensesData = response;
        }
        window.masterExpensesData = masterExpensesData;
      } catch (err) {
        console.error('Error fetching master expenses from API:', err);
        if (typeof window.showToast === 'function') {
          const errorCode = (err && (err.status || err.statusCode || err.code)) || 503;
          window.showToast(`Couldnt load DataBase: ${errorCode}`);
        }
      }
    }

    if (typeof window.currentModule !== 'undefined' && window.currentModule === 'master' &&
        typeof window.currentMasterSubpage !== 'undefined' && window.currentMasterSubpage === 'expenses') {
      window.currentDataset = [...masterExpensesData];
      if (typeof window.applyFiltersAndRender === 'function') {
        window.applyFiltersAndRender();
      }
    }
  }

  /**
   * Configure input controls in #frmAddExpense as read-only or editable
   */
  function setExpenseFormReadOnly(isReadOnly, isEditModeOnly = false) {
    const form = document.getElementById('frmAddExpense');
    if (!form) return;

    // In edit mode, ONLY GST, RCM, and Status are editable
    const editableInEditModeIds = ['inpExpenseGst'];
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
      if (input.type === 'checkbox') return;
      if (isReadOnly) {
        if (input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
        else input.setAttribute('readonly', 'true');
        input.style.backgroundColor = '#f8fafc';
      } else {
        if (isEditModeOnly) {
          if (editableInEditModeIds.includes(input.id)) {
            if (input.tagName === 'SELECT') input.removeAttribute('disabled');
            else input.removeAttribute('readonly');
            input.style.backgroundColor = '#ffffff';
          } else {
            if (input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
            else input.setAttribute('readonly', 'true');
            input.style.backgroundColor = '#f8fafc';
          }
        } else {
          if (input.tagName === 'SELECT') input.removeAttribute('disabled');
          else input.removeAttribute('readonly');
          input.style.backgroundColor = '#ffffff';
        }
      }
    });

    const toggles = form.querySelectorAll('input[type="checkbox"]');
    toggles.forEach(t => {
      t.disabled = isReadOnly;
      const parentSwitch = t.closest('.toggle-slide-switch') || t.closest('.form-toggle-wrap') || t.closest('label');
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
      }
    });
  }

  /**
   * Open Expense View Drawer Card and populate values from dataset / API
   */
  async function openViewExpenseCard(expenseId) {
    let exp = masterExpensesData.find(e =>
      String(e.id) === String(expenseId) ||
      String(e.expense_id) === String(expenseId) ||
      e.expenseHead === expenseId ||
      e.expenseName === expenseId
    );

    if (!exp && typeof window.NexusApi !== 'undefined' && window.NexusApi.expenses) {
      try {
        exp = await window.NexusApi.expenses.getById(expenseId);
      } catch (e) {
        console.warn('Could not fetch expense by ID from API', e);
      }
    }

    if (!exp) {
      if (typeof window.showToast === 'function') {
        window.showToast('Expense record not found.');
      }
      return;
    }

    currentViewedExpenseId = exp.id || exp.expense_id;
    window.currentViewedExpenseId = currentViewedExpenseId;
    isExpenseFormEditing = false;
    window.isExpenseFormEditing = false;

    const overlay = document.getElementById('sideFormOverlay');
    if (overlay) overlay.style.display = 'flex';

    const cards = document.querySelectorAll('.side-form-card');
    cards.forEach(c => c.style.display = 'none');

    const card = document.getElementById('addExpenseCard');
    if (card) card.style.display = 'block';

    const lblTitle = document.getElementById('lblExpenseCardTitle');
    if (lblTitle) lblTitle.innerText = 'View Expense';

    const btnEditToggle = document.getElementById('btnExpenseCardEditToggle');
    const imgEditIcon = document.getElementById('imgExpenseCardEditIcon');
    if (btnEditToggle) btnEditToggle.style.display = 'flex';
    if (imgEditIcon) {
      imgEditIcon.src = 'icons/Edit.svg';
      imgEditIcon.title = 'Edit Info';
    }

    const btnSaveWrap = document.querySelector('#frmAddExpense .form-submit-inside-wrap');
    if (btnSaveWrap) btnSaveWrap.style.display = 'none';

    if (document.getElementById('inpExpenseName')) {
      document.getElementById('inpExpenseName').value = exp.expenseName || exp.expense_name || exp.expenseDescription || exp.expenseHead || '';
    }
    if (document.getElementById('inpExpenseCategory')) {
      document.getElementById('inpExpenseCategory').value = exp.expenseCategory || exp.expense_category || 'Direct Operations';
    }
    if (document.getElementById('inpExpenseSubCategory')) {
      document.getElementById('inpExpenseSubCategory').value = exp.expenseSubCategory || exp.expense_sub_category || exp.expense_description || 'Civil Works';
    }
    if (document.getElementById('inpExpenseHead')) {
      document.getElementById('inpExpenseHead').value = exp.expenseHead || exp.expense_head || 'Capex';
      handleExpenseHeadChange();
    }
    if (document.getElementById('inpExpenseGst')) {
      document.getElementById('inpExpenseGst').value = exp.gst || (exp.gst_rate != null ? exp.gst_rate + '%' : '18%');
    }
    if (document.getElementById('inpExpenseDepreciation')) {
      document.getElementById('inpExpenseDepreciation').value = exp.depreciation_rate || exp.depreciation || '10%';
    }

    const rcmToggle = document.getElementById('inpExpenseRcmToggle');
    if (rcmToggle) {
      rcmToggle.checked = (String(exp.rcm || '').toLowerCase() === 'yes' || exp.rcm === true);
    }

    const statusToggle = document.getElementById('inpExpenseStatusToggle');
    if (statusToggle) {
      statusToggle.checked = (String(exp.status || '').toLowerCase() === 'active' || exp.status === true);
    }

    setExpenseFormReadOnly(true);
    if (typeof window.showToast === 'function') {
      window.showToast(`Viewing expense details: ${exp.expenseName || exp.expense_name || exp.expenseHead || ''}`);
    }
  }

  /**
   * Toggle Capex / Opex Depreciation Row Visibility
   */
  function handleExpenseHeadChange() {
    const expenseHead = document.getElementById('inpExpenseHead')?.value || '';
    const rowDeprec = document.getElementById('rowExpenseDepreciation');
    if (!rowDeprec) return;

    if (expenseHead.toLowerCase() === 'capex') {
      rowDeprec.style.setProperty('display', 'flex', 'important');
    } else {
      rowDeprec.style.setProperty('display', 'none', 'important');
      const inpDeprec = document.getElementById('inpExpenseDepreciation');
      if (inpDeprec) inpDeprec.value = '';
    }
  }

  /**
   * Save a newly added Master Expense record
   */
  async function saveMasterExpenseRecord() {
    const expenseName = document.getElementById('inpExpenseName')?.value?.trim();
    if (!expenseName) {
      if (typeof window.showToast === 'function') window.showToast('Please enter Expense Name');
      return;
    }

    const expenseCategory = document.getElementById('inpExpenseCategory')?.value || "Direct Operations";
    const expenseSubCategory = document.getElementById('inpExpenseSubCategory')?.value || "";
    const expenseHead = document.getElementById('inpExpenseHead')?.value || "Capex";
    const gst = document.getElementById('inpExpenseGst')?.value || "18%";
    const depreciation = document.getElementById('inpExpenseDepreciation')?.value || "10%";
    const expenseRcmToggle = document.getElementById('inpExpenseRcmToggle');
    const rcm = (expenseRcmToggle && expenseRcmToggle.checked);
    const expenseStatusToggle = document.getElementById('inpExpenseStatusToggle');
    const status = (expenseStatusToggle && expenseStatusToggle.checked) ? "Active" : "In - Active";

    const payload = {
      expenseName,
      expenseCategory,
      expenseSubCategory,
      expenseHead,
      gst,
      depreciation_rate: (expenseHead.toLowerCase() === 'capex' ? depreciation : '0%'),
      rcm,
      status
    };

    if (typeof window.NexusApi !== 'undefined' && window.NexusApi.expenses) {
      try {
        const newRecord = await window.NexusApi.expenses.create(payload);
        masterExpensesData.unshift(newRecord);
        window.masterExpensesData = masterExpensesData;
        window.currentDataset = [...masterExpensesData];
        if (typeof window.applyFiltersAndRender === 'function') window.applyFiltersAndRender();
        if (typeof window.closeSideForm === 'function') window.closeSideForm();

        if (typeof window.showSvgSuccessPopup === 'function') {
          window.showSvgSuccessPopup('Expense added successfully!', 'Task Completed');
        } else if (typeof window.showToast === 'function') {
          window.showToast(`Expense ${expenseName} successfully saved to database!`);
        }
      } catch (err) {
        console.error('Failed to create expense:', err);
        const msg = err.detail || err.message || "Expense with this name or code already exists.";
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup(msg, "Error Message!");
        } else if (typeof window.showToast === 'function') {
          window.showToast(`Error: ${msg}`);
        }
      }
    } else {
      const newRecord = {
        id: `exp-${Date.now()}`,
        expenseName,
        expenseCategory,
        expenseSubCategory,
        expenseHead,
        gst,
        gstRate: gst,
        depreciation: (expenseHead.toLowerCase() === 'capex' ? depreciation : '0%'),
        rcm: rcm ? "Yes" : "No",
        status
      };
      masterExpensesData.unshift(newRecord);
      window.masterExpensesData = masterExpensesData;
      window.currentDataset = [...masterExpensesData];
      if (typeof window.applyFiltersAndRender === 'function') window.applyFiltersAndRender();
      if (typeof window.closeSideForm === 'function') window.closeSideForm();
      if (typeof window.showToast === 'function') window.showToast(`Expense ${expenseName} successfully saved!`);
    }
  }

  /**
   * Save edits to an existing Master Expense record
   */
  async function updateMasterExpenseRecord() {
    if (!currentViewedExpenseId) return;

    const expenseName = document.getElementById('inpExpenseName')?.value?.trim();
    const expenseCategory = document.getElementById('inpExpenseCategory')?.value;
    const expenseSubCategory = document.getElementById('inpExpenseSubCategory')?.value;
    const expenseHead = document.getElementById('inpExpenseHead')?.value;
    const gst = document.getElementById('inpExpenseGst')?.value;
    const depreciation = document.getElementById('inpExpenseDepreciation')?.value;
    const rcmToggle = document.getElementById('inpExpenseRcmToggle');
    const statusToggle = document.getElementById('inpExpenseStatusToggle');

    const updatePayload = {
      expenseName,
      expenseCategory,
      expenseSubCategory,
      expenseHead,
      gst,
      depreciation_rate: (expenseHead?.toLowerCase() === 'capex' ? depreciation : '0%'),
      rcm: (rcmToggle && rcmToggle.checked),
      status: (statusToggle && statusToggle.checked) ? "Active" : "In - Active"
    };

    const lblTitle = document.getElementById('lblExpenseCardTitle');
    const imgIcon = document.getElementById('imgExpenseCardEditIcon');

    if (typeof window.NexusApi !== 'undefined' && window.NexusApi.expenses) {
      try {
        const updatedRecord = await window.NexusApi.expenses.update(currentViewedExpenseId, updatePayload);
        const idx = masterExpensesData.findIndex(e =>
          String(e.id) === String(currentViewedExpenseId) ||
          String(e.expense_id) === String(currentViewedExpenseId)
        );

        if (idx !== -1) {
          masterExpensesData[idx] = updatedRecord;
        } else {
          masterExpensesData.unshift(updatedRecord);
        }
        window.masterExpensesData = masterExpensesData;
        window.currentDataset = [...masterExpensesData];
        if (typeof window.applyFiltersAndRender === 'function') window.applyFiltersAndRender();

        isExpenseFormEditing = false;
        window.isExpenseFormEditing = false;
        setExpenseFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Expense';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }

        if (typeof window.showSvgSuccessPopup === 'function') {
          window.showSvgSuccessPopup('Expense updated successfully!', 'Task Completed');
        } else if (typeof window.showToast === 'function') {
          window.showToast('Expense details saved & updated successfully to database!');
        }
      } catch (err) {
        console.error('Failed to update expense:', err);
        const msg = err.detail || err.message || "Expense with this name or code already exists.";
        if (typeof window.showSvgErrorPopup === 'function') {
          window.showSvgErrorPopup(msg, "Error Message!");
        } else if (typeof window.showToast === 'function') {
          window.showToast(`Error: ${msg}`);
        }
      }
    } else {
      const exp = masterExpensesData.find(e =>
        String(e.id) === String(currentViewedExpenseId) ||
        String(e.expense_id) === String(currentViewedExpenseId)
      );
      if (exp) {
        exp.expenseName = expenseName || exp.expenseName || exp.expenseDescription;
        exp.expenseCategory = expenseCategory || exp.expenseCategory;
        exp.expenseSubCategory = expenseSubCategory || exp.expenseSubCategory;
        exp.expenseHead = expenseHead || exp.expenseHead;
        exp.gst = gst || exp.gst || exp.gstRate;
        exp.gstRate = exp.gst;
        exp.depreciation = depreciation || exp.depreciation;
        exp.rcm = (rcmToggle && rcmToggle.checked) ? "Yes" : "No";
        exp.status = (statusToggle && statusToggle.checked) ? "Active" : "In - Active";
      }
      window.masterExpensesData = masterExpensesData;
      window.currentDataset = [...masterExpensesData];
      if (typeof window.applyFiltersAndRender === 'function') window.applyFiltersAndRender();

      isExpenseFormEditing = false;
      window.isExpenseFormEditing = false;
      setExpenseFormReadOnly(true);
      if (lblTitle) lblTitle.innerText = 'View Expense';
      if (imgIcon) {
        imgIcon.src = 'icons/Edit.svg';
        imgIcon.title = 'Edit Info';
      }
      if (typeof window.showToast === 'function') {
        window.showToast('Expense details saved & updated successfully!');
      }
    }
  }

  /**
   * Bind DOM event listeners for Expense Form
   */
  function initMasterExpensesEvents() {
    const expenseHeadEl = document.getElementById('inpExpenseHead');
    if (expenseHeadEl) {
      expenseHeadEl.addEventListener('change', handleExpenseHeadChange);
    }

    const btnExpenseCardEditToggle = document.getElementById('btnExpenseCardEditToggle');
    if (btnExpenseCardEditToggle) {
      btnExpenseCardEditToggle.addEventListener('click', async () => {
        const lblTitle = document.getElementById('lblExpenseCardTitle');
        const imgIcon = document.getElementById('imgExpenseCardEditIcon');

        if (!isExpenseFormEditing) {
          isExpenseFormEditing = true;
          window.isExpenseFormEditing = true;
          setExpenseFormReadOnly(false, true);
          if (lblTitle) lblTitle.innerText = 'Edit Expense';
          if (imgIcon) {
            imgIcon.src = 'icons/Save.svg';
            imgIcon.title = 'Save Changes';
          }
          if (typeof window.showToast === 'function') {
            window.showToast('Expense form is now editable');
          }
        } else {
          await updateMasterExpenseRecord();
        }
      });
    }
  }

  // DOM initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMasterExpensesEvents);
  } else {
    initMasterExpensesEvents();
  }

  // Export to window
  window.masterExpensesData = masterExpensesData;
  window.loadMasterExpensesFromApi = loadMasterExpensesFromApi;
  window.setExpenseFormReadOnly = setExpenseFormReadOnly;
  window.openViewExpenseCard = openViewExpenseCard;
  window.handleExpenseHeadChange = handleExpenseHeadChange;
  window.saveMasterExpenseRecord = saveMasterExpenseRecord;
  window.updateMasterExpenseRecord = updateMasterExpenseRecord;

})(window);
