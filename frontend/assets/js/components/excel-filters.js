/**
 * Excel Filters UI Component
 * Extracted from home.js
 * Provides universal Excel-style column sorting, searching, multi-select checkboxes,
 * and filter application across tables and sub-modals.
 */
(function(window) {
  'use strict';

  window.activeColumnFilters = window.activeColumnFilters || {};
  window.currentFilterColumn = window.currentFilterColumn || null;

  function openExcelFilter(colKey, triggerBtn) {
    currentFilterColumn = colKey;
    const dropdown = document.getElementById('excelFilterDropdown');
    const searchInput = document.getElementById('filterSearchInput');
    const chkList = document.getElementById('filterCheckboxList');
    const chkSelectAll = document.getElementById('chkFilterSelectAll');
  
    if (!dropdown) return;
  
    if (searchInput) searchInput.value = '';
  
    const uniqueValues = Array.from(new Set(currentDataset.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  
    const activeSet = activeColumnFilters[colKey];
  
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
  
    const rect = triggerBtn.getBoundingClientRect();
    const dropdownWidth = 280;
    let leftPos = rect.left;
    if (leftPos + dropdownWidth > window.innerWidth - 16) {
      leftPos = window.innerWidth - dropdownWidth - 16;
    }
  
    dropdown.style.display = 'flex';
    dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
    dropdown.style.left = `${Math.max(12, leftPos)}px`;
  
    if (searchInput) searchInput.focus();
  }
  
  function closeExcelFilter() {
    const dropdown = document.getElementById('excelFilterDropdown');
    if (dropdown) dropdown.style.display = 'none';
    currentFilterColumn = null;
  }
  
  function getColumnDisplayName(colKey) {
    const map = {
      businessType: "Business Type",
      customerId: "Customer ID",
      customerName: "Customer Name",
      gstNumber: "GST Number",
      gstType: "GST Type",
      invoiceType: "Invoice Type",
      name: "Name",
      employeeType: "Employee Type",
      trainingType: "Training Type",
      status: "Status",
      infraCategory: "Infra Category",
      infraDescription: "Infra Description",
      make: "Make",
      commissioning: "Commissioning",
      materialHead: "Material Head",
      materialCategory: "Material Category",
      materialDescription: "Material Description",
      expenseHead: "Expense Head",
      expenseCategory: "Expense Category",
      expenseDescription: "Expense Description",
      infraCode: "Infra Code",
      type: "Type",
      ucf: "UCF",
      tat: "TAT",
      submitDate: "Submit Date",
      poNo: "PO No",
      projectId: "Project ID",
      projectType: "Project Type",
      subProjectType: "Sub - Project Type",
      indusPm: "Indus PM",
      indusScm: "Indus SCM",
      pm: "PM",
      mis: "MIS",
      iMap: "I - Map",
      itemCode: "Item Code",
      productName: "Product Name",
      productType: "Product Type",
      hsnSacType: "HSN / SAC Type",
      hsnSacCode: "HSN / SAC Code",
      activeRate: "Active Rate",
      budgetPercent: "Budget %",
      budgetAmount: "Budget Amount",
      vendorType: "Vendor Type",
      vendorId: "Vendor ID",
      vendorName: "Vendor Name",
      serviceVendorName: "Service Vendor Name",
      panNumber: "PAN Number",
      circle: "Circle",
      siteId: "Site ID",
      whId: "WH ID",
      siteName: "Site Name",
      district: "District",
      town: "Town",
      latitude: "Lattitude",
      longitude: "Longtitude",
      transportZone: "Transport Zone",
      employeeId: "Employee ID",
      employeeName: "Employee Name",
      location: "Location",
      designation: "Designation",
      contactNumber: "Contact Number",
      email: "E-Mail",
      productHead: "Product Head",
      productName: "Product Name",
      productCategory: "Product Category",
      productCode: "Product Code",
      hsnCode: "HSN Code",
      productDescription: "Product Description",
      gst: "GST",
      gstRate: "GST Rate",
      price: "Price",
      expenseName: "Expense Name",
      expenseCategory: "Expense Category",
      expenseHead: "Expense Head",
      expenseCode: "Expense Code",
      sacCode: "SAC Code",
      expenseDescription: "Expense Description",
      tdsRate: "TDS Rate",
      uom: "Uom",
      submittedBy: "Submitted BY",
      submitBy: "Submit By",
      requestBy: "Request By",
      submissionDate: "Submission Date",
      approvedBy: "Approved By",
      transferTo: "Transfer To",
      ageing: "Ageing",
      whName: "WH Name",
      projectManager: "Project Manager",
      customer: "Customer",
      projectId: "Project ID",
      poNo: "PO No",
      poAgeing: "PO Ageing",
      poStatus: "PO Status",
      subProjectType: "Sub-Project Type",
      projectStatus: "Project Status",
      task: "Task",
      pendingWith: "Pending With",
      supportRequired: "Support Required",
      pendingWith2: "Pending With",
      orderId: "Order ID",
      orderDate: "Order Date",
      orderAmount: "Order Amount",
      invoiceNumber: "Invoice Number",
      invoiceDate: "Invoice Date",
      invoiceAmount: "Invoice Amount",
      paymentStatus: "Payment Status",
      expenseName: "Expense Name",
      itemDescription: "Item Description",
      expenseType: "Expense Type",
      itemCode: "Item Code",
      itemName: "Item Name",
      remark: "Remark",
      po: "PO",
      budget: "Budget",
      used: "Used",
      available: "Available",
      boqName: "BOQ Name",
      boqNo: "BOQ No",
      stnNo: "STN No",
      srnNo: "SRN No",
      remarks: "Remarks",
      mir: "MIR",
      min: "MIN",
      mrr: "MRR",
      mrn: "MRN",
      net: "Net",
      qty: "Qty",
      rate: "Rate",
      amount: "Amount",
      docType: "Doc Type",
      boqNo: "BOQ No",
      boqDate: "BOQ Date",
      category: "Category",
      qy: "Qy",
      customerName: "Customer Name",
      orderValue: "Order Value",
      status: "Status",
      supplierName: "Supplier Name",
      rfqNo: "RFQ#",
      transportName: "Transport Name",
      transportType: "Transport Type",
      vehicleType: "Vehicle Type",
      vehicleNumber: "Vehicle Number"
    };
    return map[colKey] || colKey;
  }
  
  function updateFilterIconBadge(colKey) {
    const btn = document.querySelector(`.filter-funnel-btn[data-filter-col="${colKey}"]`);
    if (!btn) return;
    if (activeColumnFilters[colKey]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  }
  
  function sortDataset(colKey, direction) {
    currentDataset.sort((a, b) => {
      let valA = a[colKey] !== undefined ? a[colKey] : '';
      let valB = b[colKey] !== undefined ? b[colKey] : '';
  
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }
  


  function rebindFilterButtons() {
    document.querySelectorAll('.filter-funnel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const colKey = btn.getAttribute('data-filter-col');
        openExcelFilter(colKey, btn);
      });
    });
  }


  function initExcelFilterSystem() {
    const dropdown = document.getElementById('excelFilterDropdown');
    const btnCancel = document.getElementById('btnCancelFilter');
    const btnApply = document.getElementById('btnApplyFilter');
    const searchInput = document.getElementById('filterSearchInput');
    const chkSelectAll = document.getElementById('chkFilterSelectAll');
  
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        if (dropdown.dataset.filterContext === 'contact') {
          if (currentContactFilterCol) {
            delete activeContactFilters[currentContactFilterCol];
            renderVendorContactTable();
          }
          closeExcelFilter();
          showToast('Contact filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'supplyScope') {
          if (currentSupplyScopeFilterCol) {
            delete activeSupplyScopeFilters[currentSupplyScopeFilterCol];
            renderVendorSupplyScopeTable();
          }
          closeExcelFilter();
          showToast('Scope filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'serviceProjectScope') {
          if (currentServiceProjectScopeFilterCol) {
            delete activeServiceProjectScopeFilters[currentServiceProjectScopeFilterCol];
            renderVendorServiceProjectScopeTable();
          }
          closeExcelFilter();
          showToast('Scope filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'serviceTransportScope') {
          if (currentServiceTransportScopeFilterCol) {
            delete activeServiceTransportScopeFilters[currentServiceTransportScopeFilterCol];
            renderVendorServiceTransportScopeTable();
          }
          closeExcelFilter();
          showToast('Scope filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'companyLocation') {
          if (currentCompanyLocationFilterCol) {
            delete activeCompanyLocationFilters[currentCompanyLocationFilterCol];
            renderCompanyLocationTable();
          }
          closeExcelFilter();
          showToast('Location filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'companyHolidays') {
          if (currentCompanyHolidaysFilterCol) {
            delete activeCompanyHolidaysFilters[currentCompanyHolidaysFilterCol];
            renderCompanyHolidaysTable();
          }
          closeExcelFilter();
          showToast('Holiday filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'companyBank') {
          if (currentCompanyBankFilterCol) {
            delete activeCompanyBankFilters[currentCompanyBankFilterCol];
            renderCompanyBankTable();
          }
          closeExcelFilter();
          showToast('Bank filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'serviceOthersScope') {
          if (currentServiceOthersScopeFilterCol) {
            delete activeServiceOthersScopeFilters[currentServiceOthersScopeFilterCol];
            renderVendorServiceOthersScopeTable();
          }
          closeExcelFilter();
          showToast('Scope filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'tdsSummary') {
          if (currentTdsSummaryFilterCol) {
            delete activeTdsSummaryFilters[currentTdsSummaryFilterCol];
            renderAccountsTdsSummaryTable();
          }
          closeExcelFilter();
          showToast('TDS filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'customerLoc') {
          if (currentCustomerLocFilterCol) {
            delete activeCustomerLocFilters[currentCustomerLocFilterCol];
            renderCustomerLocationTable();
          }
          closeExcelFilter();
          showToast('Location filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'customerContact') {
          if (currentCustomerContactFilterCol) {
            delete activeCustomerContactFilters[currentCustomerContactFilterCol];
            renderCustomerContactTable();
          }
          closeExcelFilter();
          showToast('Contact filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'bulkUpload') {
          if (currentBulkUploadFilterCol) {
            delete activeBulkUploadFilters[currentBulkUploadFilterCol];
            renderBulkUploadTable();
          }
          closeExcelFilter();
          showToast('Bulk upload filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'siteContact') {
          if (currentSiteContactFilterCol) {
            delete activeSiteContactFilters[currentSiteContactFilterCol];
            renderSiteContactTable();
          }
          closeExcelFilter();
          showToast('Site contact filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'projectDoc') {
          if (currentProjectDocFilterCol) {
            delete activeProjectDocFilters[currentProjectDocFilterCol];
            if (typeof renderProjectDocTable === 'function') renderProjectDocTable();
          }
          closeExcelFilter();
          showToast('Description filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'projectTransport') {
          if (currentProjectTransportFilterCol) {
            delete activeProjectTransportFilters[currentProjectTransportFilterCol];
            if (typeof renderProjectTransportTable === 'function') renderProjectTransportTable();
          }
          closeExcelFilter();
          showToast('Transport filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'projectActivity') {
          if (currentProjectActivityFilterCol) {
            delete activeProjectActivityFilters[currentProjectActivityFilterCol];
            if (typeof renderProjectActivityTable === 'function') renderProjectActivityTable();
          }
          closeExcelFilter();
          showToast('Activity filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'expenseItemName') {
          if (window.currentExpenseItemFilterCol) {
            delete window.activeExpenseItemFilters[window.currentExpenseItemFilterCol];
            if (typeof renderExpenseDetailsTable === 'function') renderExpenseDetailsTable();
          }
          closeExcelFilter();
          showToast('Filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'expensesSummaryItemName') {
          if (window.currentExpensesSummaryItemFilterCol) {
            delete window.activeExpensesSummaryItemFilters[window.currentExpensesSummaryItemFilterCol];
            if (typeof renderExpensesSummaryDetailsTable === 'function') renderExpensesSummaryDetailsTable();
          }
          closeExcelFilter();
          showToast('Filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'pmMaterialDetail') {
          if (window.currentPmMaterialDetailFilterCol) {
            delete window.activePmMaterialDetailFilters[window.currentPmMaterialDetailFilterCol];
            if (typeof renderPmMaterialDetailTable === 'function') renderPmMaterialDetailTable();
          }
          closeExcelFilter();
          showToast('Filter cleared');
          return;
        }
        if (dropdown.dataset.filterContext === 'expenseSummaryOverview') {
          if (window.currentExpenseSummaryOverviewFilterCol) {
            delete window.activeExpenseSummaryOverviewFilters[window.currentExpenseSummaryOverviewFilterCol];
            if (typeof renderExpenseSummaryOverviewTable === 'function') renderExpenseSummaryOverviewTable();
          }
          closeExcelFilter();
          showToast('Filter cleared');
          return;
        }
        closeExcelFilter();
      });
    }
  
    document.addEventListener('click', (e) => {
      if (dropdown && !dropdown.contains(e.target) && !e.target.classList.contains('filter-funnel-btn') && !e.target.classList.contains('contact-th-filter-btn')) {
        closeExcelFilter();
      }
    });
  
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const items = document.querySelectorAll('.excel-filter-dynamic-item');
        items.forEach(item => {
          const val = item.getAttribute('data-val').toLowerCase();
          item.style.display = val.includes(query) ? 'flex' : 'none';
        });
      });
    }
  
    if (chkSelectAll) {
      chkSelectAll.addEventListener('change', () => {
        const visibleCheckboxes = Array.from(document.querySelectorAll('.excel-filter-dynamic-item'))
          .filter(item => item.style.display !== 'none')
          .map(item => item.querySelector('input[type="checkbox"]'));
  
        visibleCheckboxes.forEach(chk => {
          chk.checked = chkSelectAll.checked;
        });
      });
    }
  
    if (btnApply) {
      btnApply.addEventListener('click', () => {
        if (dropdown.dataset.filterContext === 'contact') {
          if (!currentContactFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeContactFilters[currentContactFilterCol];
          } else {
            activeContactFilters[currentContactFilterCol] = new Set(checkedItems);
          }
          renderVendorContactTable();
          closeExcelFilter();
          showToast('Contact filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'supplyScope') {
          if (!currentSupplyScopeFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeSupplyScopeFilters[currentSupplyScopeFilterCol];
          } else {
            activeSupplyScopeFilters[currentSupplyScopeFilterCol] = new Set(checkedItems);
          }
          renderVendorSupplyScopeTable();
          closeExcelFilter();
          showToast('Scope filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'serviceProjectScope') {
          if (!currentServiceProjectScopeFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeServiceProjectScopeFilters[currentServiceProjectScopeFilterCol];
          } else {
            activeServiceProjectScopeFilters[currentServiceProjectScopeFilterCol] = new Set(checkedItems);
          }
          renderVendorServiceProjectScopeTable();
          closeExcelFilter();
          showToast('Scope filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'serviceTransportScope') {
          if (!currentServiceTransportScopeFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeServiceTransportScopeFilters[currentServiceTransportScopeFilterCol];
          } else {
            activeServiceTransportScopeFilters[currentServiceTransportScopeFilterCol] = new Set(checkedItems);
          }
          renderVendorServiceTransportScopeTable();
          closeExcelFilter();
          showToast('Transport filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'companyLocation') {
          if (!currentCompanyLocationFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeCompanyLocationFilters[currentCompanyLocationFilterCol];
          } else {
            activeCompanyLocationFilters[currentCompanyLocationFilterCol] = new Set(checkedItems);
          }
          renderCompanyLocationTable();
          closeExcelFilter();
          showToast('Location filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'companyHolidays') {
          if (!currentCompanyHolidaysFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeCompanyHolidaysFilters[currentCompanyHolidaysFilterCol];
          } else {
            activeCompanyHolidaysFilters[currentCompanyHolidaysFilterCol] = new Set(checkedItems);
          }
          renderCompanyHolidaysTable();
          closeExcelFilter();
          showToast('Holiday filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'companyBank') {
          if (!currentCompanyBankFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeCompanyBankFilters[currentCompanyBankFilterCol];
          } else {
            activeCompanyBankFilters[currentCompanyBankFilterCol] = new Set(checkedItems);
          }
          renderCompanyBankTable();
          closeExcelFilter();
          showToast('Bank filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'serviceOthersScope') {
          if (!currentServiceOthersScopeFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeServiceOthersScopeFilters[currentServiceOthersScopeFilterCol];
          } else {
            activeServiceOthersScopeFilters[currentServiceOthersScopeFilterCol] = new Set(checkedItems);
          }
          renderVendorServiceOthersScopeTable();
          closeExcelFilter();
          showToast('Other Service filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'tdsSummary') {
          if (!currentTdsSummaryFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeTdsSummaryFilters[currentTdsSummaryFilterCol];
          } else {
            activeTdsSummaryFilters[currentTdsSummaryFilterCol] = new Set(checkedItems);
          }
          renderAccountsTdsSummaryTable();
          closeExcelFilter();
          showToast('TDS filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'customerLoc') {
          if (!currentCustomerLocFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeCustomerLocFilters[currentCustomerLocFilterCol];
          } else {
            activeCustomerLocFilters[currentCustomerLocFilterCol] = new Set(checkedItems);
          }
          renderCustomerLocationTable();
          closeExcelFilter();
          showToast('Location filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'customerContact') {
          if (!currentCustomerContactFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeCustomerContactFilters[currentCustomerContactFilterCol];
          } else {
            activeCustomerContactFilters[currentCustomerContactFilterCol] = new Set(checkedItems);
          }
          renderCustomerContactTable();
          closeExcelFilter();
          showToast('Contact filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'bulkUpload') {
          if (!currentBulkUploadFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeBulkUploadFilters[currentBulkUploadFilterCol];
          } else {
            activeBulkUploadFilters[currentBulkUploadFilterCol] = new Set(checkedItems);
          }
          renderBulkUploadTable();
          closeExcelFilter();
          showToast('Bulk upload filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'siteContact') {
          if (!currentSiteContactFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeSiteContactFilters[currentSiteContactFilterCol];
          } else {
            activeSiteContactFilters[currentSiteContactFilterCol] = new Set(checkedItems);
          }
          renderSiteContactTable();
          closeExcelFilter();
          showToast('Site contact filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'projectDoc') {
          if (!currentProjectDocFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeProjectDocFilters[currentProjectDocFilterCol];
          } else {
            activeProjectDocFilters[currentProjectDocFilterCol] = new Set(checkedItems);
          }
          if (typeof renderProjectDocTable === 'function') renderProjectDocTable();
          closeExcelFilter();
          showToast('Description filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'projectTransport') {
          if (!currentProjectTransportFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeProjectTransportFilters[currentProjectTransportFilterCol];
          } else {
            activeProjectTransportFilters[currentProjectTransportFilterCol] = new Set(checkedItems);
          }
          if (typeof renderProjectTransportTable === 'function') renderProjectTransportTable();
          closeExcelFilter();
          showToast('Transport filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'projectActivity') {
          if (!currentProjectActivityFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete activeProjectActivityFilters[currentProjectActivityFilterCol];
          } else {
            activeProjectActivityFilters[currentProjectActivityFilterCol] = new Set(checkedItems);
          }
          if (typeof renderProjectActivityTable === 'function') renderProjectActivityTable();
          closeExcelFilter();
          showToast('Activity filter applied');
          return;
        }

        if (dropdown.dataset.filterContext === 'expenseItemName') {
          if (!window.currentExpenseItemFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete window.activeExpenseItemFilters[window.currentExpenseItemFilterCol];
          } else {
            window.activeExpenseItemFilters[window.currentExpenseItemFilterCol] = new Set(checkedItems);
          }
          if (typeof renderExpenseDetailsTable === 'function') renderExpenseDetailsTable();
          closeExcelFilter();
          showToast('Filter applied');
          return;
        }

        if (dropdown.dataset.filterContext === 'expensesSummaryItemName') {
          if (!window.currentExpensesSummaryItemFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete window.activeExpensesSummaryItemFilters[window.currentExpensesSummaryItemFilterCol];
          } else {
            window.activeExpensesSummaryItemFilters[window.currentExpensesSummaryItemFilterCol] = new Set(checkedItems);
          }
          if (typeof renderExpensesSummaryDetailsTable === 'function') renderExpensesSummaryDetailsTable();
          closeExcelFilter();
          showToast('Filter applied');
          return;
        }
  
        if (dropdown.dataset.filterContext === 'pmMaterialDetail') {
          if (!window.currentPmMaterialDetailFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete window.activePmMaterialDetailFilters[window.currentPmMaterialDetailFilterCol];
          } else {
            window.activePmMaterialDetailFilters[window.currentPmMaterialDetailFilterCol] = new Set(checkedItems);
          }
          if (typeof renderPmMaterialDetailTable === 'function') renderPmMaterialDetailTable();
          closeExcelFilter();
          showToast('Filter applied');
          return;
        }

        if (dropdown.dataset.filterContext === 'expenseSummaryOverview') {
          if (!window.currentExpenseSummaryOverviewFilterCol) return;
          const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
            .map(chk => chk.value);
          const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
            .map(chk => chk.value);
          if (checkedItems.length === allItems.length) {
            delete window.activeExpenseSummaryOverviewFilters[window.currentExpenseSummaryOverviewFilterCol];
          } else {
            window.activeExpenseSummaryOverviewFilters[window.currentExpenseSummaryOverviewFilterCol] = new Set(checkedItems);
          }
          if (typeof renderExpenseSummaryOverviewTable === 'function') renderExpenseSummaryOverviewTable();
          closeExcelFilter();
          showToast('Filter applied');
          return;
        }

        if (!currentFilterColumn) return;
  
        const checkedItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]:checked'))
          .map(chk => chk.value);
  
        const allItems = Array.from(document.querySelectorAll('.excel-filter-dynamic-item input[type="checkbox"]'))
          .map(chk => chk.value);
  
        if (checkedItems.length === allItems.length) {
          delete activeColumnFilters[currentFilterColumn];
        } else {
          activeColumnFilters[currentFilterColumn] = new Set(checkedItems);
        }
  
        updateFilterIconBadge(currentFilterColumn);
        applyFiltersAndRender();
        closeExcelFilter();
        showToast(`Filter applied on ${getColumnDisplayName(currentFilterColumn)}`);
      });
    }
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExcelFilterSystem);
  } else {
    initExcelFilterSystem();
  }

  window.openExcelFilter = typeof openExcelFilter !== 'undefined' ? openExcelFilter : window.openExcelFilter;
  window.closeExcelFilter = typeof closeExcelFilter !== 'undefined' ? closeExcelFilter : window.closeExcelFilter;
  window.getColumnDisplayName = typeof getColumnDisplayName !== 'undefined' ? getColumnDisplayName : window.getColumnDisplayName;
  window.updateFilterIconBadge = typeof updateFilterIconBadge !== 'undefined' ? updateFilterIconBadge : window.updateFilterIconBadge;
  window.sortDataset = typeof sortDataset !== 'undefined' ? sortDataset : window.sortDataset;
  window.rebindFilterButtons = typeof rebindFilterButtons !== 'undefined' ? rebindFilterButtons : window.rebindFilterButtons;
  window.initExcelFilterSystem = typeof initExcelFilterSystem !== 'undefined' ? initExcelFilterSystem : window.initExcelFilterSystem;
})(window);
