/**
 * NEXUS WORK LIST INTERACTIVE ENGINE
 * Manages PO & Payment worklist views, dynamic table headers, Excel-style column filters, row selection, CSV export, and segmented toggles.
 */

// PO (Purchase Order) Worklist Dataset (matches the uploaded PO layout)
const poData = [
  {
    id: "po-1",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    submittedBy: "R/RL-234567",
    vendorName: "Guindy",
    poNo: "2026001",
    poAmount: "10000.00",
    selected: true
  },
  {
    id: "po-2",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    submittedBy: "R/RL-234567",
    vendorName: "Guindy",
    poNo: "2026001",
    poAmount: "10000.00",
    selected: false
  },
  {
    id: "po-3",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    submittedBy: "R/RL-234589",
    vendorName: "Ambattur",
    poNo: "2026002",
    poAmount: "24500.00",
    selected: false
  }
];

// Payment Worklist Dataset (matches previous Payment layout with grouped Amount)
const paymentData = [
  {
    id: "pay-1",
    submitBy: "R/RL-234567",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    approvedBy: "R/RL-234567",
    expenseHead: "Project",
    transferTo: "Guindy",
    approvedAmount: "10000.00",
    transferredAmount: "",
    payableAmount: "",
    ageing: 10,
    selected: true
  },
  {
    id: "pay-2",
    submitBy: "R/RL-234567",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    approvedBy: "R/RL-234567",
    expenseHead: "Purchase",
    transferTo: "Guindy",
    approvedAmount: "10000.00",
    transferredAmount: "",
    payableAmount: "",
    ageing: 10,
    selected: false
  },
  {
    id: "pay-3",
    submitBy: "R/RL-234589",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    approvedBy: "R/RL-234589",
    expenseHead: "Operations",
    transferTo: "Ambattur",
    approvedAmount: "24500.00",
    transferredAmount: "12000.00",
    payableAmount: "12500.00",
    ageing: 5,
    selected: false
  }
];

let currentView = 'po'; // Default to 'po' per user instruction
let currentDataset = [...poData];
let filteredDataset = [...poData];

// Active column filters: { [columnKey]: Set of selected values }
let activeColumnFilters = {};
let currentFilterColumn = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  if (viewParam === 'payment' || viewParam === 'po') {
    currentView = viewParam;
  }

  initViewToggles();
  initExcelFilterSystem();
  renderCurrentView();
});

/* --------------------------------------------------------------------------
   1. VIEW TOGGLES (Segmented Payment & PO with 1px divider)
   -------------------------------------------------------------------------- */
function initViewToggles() {
  const btnPO = document.getElementById('btnTogglePO');
  const btnPayment = document.getElementById('btnTogglePayment');

  function updateToggleButtons() {
    if (currentView === 'po') {
      btnPO.classList.add('active');
      btnPayment.classList.remove('active');
      currentDataset = [...poData];
    } else {
      btnPayment.classList.add('active');
      btnPO.classList.remove('active');
      currentDataset = [...paymentData];
    }
    activeColumnFilters = {};
    renderCurrentView();
  }

  if (btnPO) {
    btnPO.addEventListener('click', () => {
      if (currentView !== 'po') {
        currentView = 'po';
        updateURLParam('po');
        updateToggleButtons();
        showToast('Switched to PO Page');
      }
    });
  }

  if (btnPayment) {
    btnPayment.addEventListener('click', () => {
      if (currentView !== 'payment') {
        currentView = 'payment';
        updateURLParam('payment');
        updateToggleButtons();
        showToast('Switched to Payment Page');
      }
    });
  }
}

function updateURLParam(viewName) {
  const url = new URL(window.location.href);
  url.searchParams.set('view', viewName);
  window.history.replaceState({}, '', url);
}

/* --------------------------------------------------------------------------
   2. RENDER CURRENT VIEW (Toolbar, Table Head, Table Body)
   -------------------------------------------------------------------------- */
function renderCurrentView() {
  renderToolbar();
  renderTableHead();
  applyFiltersAndRender();
  rebindFilterButtons();
}

/* Render Action Toolbar */
function renderToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  if (currentView === 'po') {
    // PO View: Red Delete Icon on Right
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <button type="button" class="toolbar-icon-btn btn-delete-action" id="btnDeleteAction" data-tooltip="Delete Selected" aria-label="Delete">
          <img src="icons/Delete.svg" alt="Delete" class="toolbar-icon-img" width="28" height="28">
        </button>
      </div>
    `;
  } else {
    // Payment View: Sigma on left, Info, Delete, CSV on right
    toolbar.innerHTML = `
      <div class="toolbar-left">
        <button type="button" class="toolbar-sigma-btn" id="btnSigmaSummary" data-tooltip="Sum Amounts" aria-label="Summary">&Sigma;</button>
      </div>
      <div class="toolbar-right">
        <button type="button" class="toolbar-icon-btn btn-info-action" id="btnInfoAction" data-tooltip="Record Details" aria-label="Information">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#dc2626">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
        <button type="button" class="toolbar-icon-btn btn-delete-action" id="btnDeleteAction" data-tooltip="Delete Selected" aria-label="Delete">
          <img src="icons/Delete.svg" alt="Delete" class="toolbar-icon-img" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnCsvAction" data-tooltip="Export CSV" aria-label="Export CSV">
          <img src="icons/CSV download.svg" alt="CSV Download" class="toolbar-icon-img" width="28" height="28">
        </button>
      </div>
    `;
  }

  initToolbarEventListeners();
}

/* Render Table Header (PO vs Payment) */
function renderTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentView === 'po') {
    // PO Header: Grey with white text
    thead.innerHTML = `
      <tr class="po-view-header">
        <th class="th-select">Select</th>
        <th>Submission Date</th>
        <th>
          <div class="th-content-wrap">
            <span>Submitted BY</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['submittedBy'] ? 'has-active-filter' : ''}" data-filter-col="submittedBy" title="Filter Submitted BY">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Vendor Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorName'] ? 'has-active-filter' : ''}" data-filter-col="vendorName" title="Filter Vendor Name">&#9660;</button>
          </div>
        </th>
        <th>PO No</th>
        <th>PO Amount</th>
      </tr>
    `;
  } else {
    // Payment Header: White background with dual-layer amount headers
    thead.innerHTML = `
      <tr class="payment-view-header">
        <th rowspan="2" class="th-select">Select</th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Submit By</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['submitBy'] ? 'has-active-filter' : ''}" data-filter-col="submitBy" title="Filter Submit By">&#9660;</button>
          </div>
        </th>
        <th rowspan="2">Submission Date</th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Approved By</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['approvedBy'] ? 'has-active-filter' : ''}" data-filter-col="approvedBy" title="Filter Approved By">&#9660;</button>
          </div>
        </th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Expense Head</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseHead'] ? 'has-active-filter' : ''}" data-filter-col="expenseHead" title="Filter Expense Head">&#9660;</button>
          </div>
        </th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Transfer To</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['transferTo'] ? 'has-active-filter' : ''}" data-filter-col="transferTo" title="Filter Transfer To">&#9660;</button>
          </div>
        </th>
        <th colspan="3" class="th-amount-group">Amount</th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Ageing</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['ageing'] ? 'has-active-filter' : ''}" data-filter-col="ageing" title="Filter Ageing">&#9660;</button>
          </div>
        </th>
      </tr>
      <tr class="tr-sub-headers payment-view-header">
        <th>Approved</th>
        <th>Transferred</th>
        <th>Payable</th>
      </tr>
    `;
  }
}

/* --------------------------------------------------------------------------
   3. TABLE RENDERING & FILTERING
   -------------------------------------------------------------------------- */
function applyFiltersAndRender() {
  filteredDataset = currentDataset.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeColumnFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) {
        return false;
      }
    }
    return true;
  });

  const tbody = document.getElementById('worklistTableBody');
  if (!tbody) return;

  if (filteredDataset.length === 0) {
    const colCount = currentView === 'po' ? 6 : 10;
    tbody.innerHTML = `
      <tr>
        <td colspan="${colCount}" class="empty-data-row">No records match the selected filter criteria.</td>
      </tr>
    `;
    return;
  }

  if (currentView === 'po') {
    // Render PO Rows
    tbody.innerHTML = filteredDataset.map(row => {
      const isSelected = row.selected;
      return `
        <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${row.id}">
          <td class="td-select">
            <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="selectRow('${row.id}')" aria-label="Select row"></div>
          </td>
          <td class="td-center">${row.submissionDate}</td>
          <td>
            <a href="#" class="req-link" onclick="handleReqClick('${row.submittedBy}'); return false;">${row.submittedBy}</a>
          </td>
          <td>${row.vendorName}</td>
          <td class="td-center">${row.poNo}</td>
          <td class="td-amount">${row.poAmount}</td>
        </tr>
      `;
    }).join('');
  } else {
    // Render Payment Rows
    tbody.innerHTML = filteredDataset.map(row => {
      const isSelected = row.selected;
      return `
        <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${row.id}">
          <td class="td-select">
            <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="selectRow('${row.id}')" aria-label="Select row"></div>
          </td>
          <td>
            <a href="#" class="req-link" onclick="handleReqClick('${row.submitBy}'); return false;">${row.submitBy}</a>
          </td>
          <td class="td-center">${row.submissionDate}</td>
          <td>${row.approvedBy}</td>
          <td>${row.expenseHead}</td>
          <td>${row.transferTo}</td>
          <td class="td-amount">${row.approvedAmount || ''}</td>
          <td class="td-amount">${row.transferredAmount || ''}</td>
          <td class="td-amount">${row.payableAmount || ''}</td>
          <td class="td-center">${row.ageing}</td>
        </tr>
      `;
    }).join('');
  }
}

/* --------------------------------------------------------------------------
   4. EXCEL-STYLE FILTER ENGINE
   -------------------------------------------------------------------------- */
function initExcelFilterSystem() {
  const dropdown = document.getElementById('excelFilterDropdown');
  const btnClose = document.getElementById('btnFilterClose');
  const btnCancel = document.getElementById('btnCancelFilter');
  const btnApply = document.getElementById('btnApplyFilter');
  const btnClearCol = document.getElementById('btnClearColFilter');
  const btnSortAsc = document.getElementById('btnSortAsc');
  const btnSortDesc = document.getElementById('btnSortDesc');
  const searchInput = document.getElementById('filterSearchInput');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (btnClose) btnClose.addEventListener('click', closeExcelFilter);
  if (btnCancel) btnCancel.addEventListener('click', closeExcelFilter);

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target) && !e.target.classList.contains('filter-funnel-btn')) {
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

  if (btnClearColFilter) {
    btnClearColFilter.addEventListener('click', () => {
      if (!currentFilterColumn) return;
      delete activeColumnFilters[currentFilterColumn];
      updateFilterIconBadge(currentFilterColumn);
      applyFiltersAndRender();
      closeExcelFilter();
      showToast(`Cleared filter on ${getColumnDisplayName(currentFilterColumn)}`);
    });
  }

  if (btnSortAsc) {
    btnSortAsc.addEventListener('click', () => {
      if (!currentFilterColumn) return;
      sortDataset(currentFilterColumn, 'asc');
      applyFiltersAndRender();
      closeExcelFilter();
      showToast(`Sorted ${getColumnDisplayName(currentFilterColumn)} Ascending`);
    });
  }

  if (btnSortDesc) {
    btnSortDesc.addEventListener('click', () => {
      if (!currentFilterColumn) return;
      sortDataset(currentFilterColumn, 'desc');
      applyFiltersAndRender();
      closeExcelFilter();
      showToast(`Sorted ${getColumnDisplayName(currentFilterColumn)} Descending`);
    });
  }
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

function openExcelFilter(colKey, triggerBtn) {
  currentFilterColumn = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const titleEl = document.getElementById('filterColTitle');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;

  titleEl.textContent = `Filter: ${getColumnDisplayName(colKey)}`;
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
    submittedBy: "Submitted BY",
    vendorName: "Vendor Name",
    submitBy: "Submit By",
    submissionDate: "Submission Date",
    approvedBy: "Approved By",
    expenseHead: "Expense Head",
    transferTo: "Transfer To",
    ageing: "Ageing"
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

/* --------------------------------------------------------------------------
   5. ROW SELECTION & TOOLBAR ACTIONS
   -------------------------------------------------------------------------- */
window.selectRow = function(rowId) {
  currentDataset = currentDataset.map(row => {
    return {
      ...row,
      selected: row.id === rowId
    };
  });
  applyFiltersAndRender();
};

window.handleReqClick = function(reqCode) {
  showToast(`Opening requisition details for: ${reqCode}`);
};

function initToolbarEventListeners() {
  const btnSigma = document.getElementById('btnSigmaSummary');
  const btnInfo = document.getElementById('btnInfoAction');
  const btnDelete = document.getElementById('btnDeleteAction');
  const btnCsv = document.getElementById('btnCsvAction');

  if (btnSigma) {
    btnSigma.addEventListener('click', () => {
      let totalApproved = 0;
      filteredDataset.forEach(r => {
        const val = parseFloat(r.approvedAmount || r.poAmount);
        if (!isNaN(val)) totalApproved += val;
      });
      showToast(`Total Approved Amount: ₹${totalApproved.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${filteredDataset.length} Records Shown)`);
    });
  }

  if (btnInfo) {
    btnInfo.addEventListener('click', () => {
      const selected = filteredDataset.find(r => r.selected);
      if (selected) {
        showToast(`Selected Record: ${selected.submitBy || selected.submittedBy} | Amount: ₹${selected.approvedAmount || selected.poAmount}`);
      } else {
        showToast('Please select a record from the table to view info.');
      }
    });
  }

  if (btnDelete) {
    btnDelete.addEventListener('click', () => {
      const selectedIndex = currentDataset.findIndex(r => r.selected);
      if (selectedIndex !== -1) {
        const deleted = currentDataset.splice(selectedIndex, 1)[0];
        if (currentDataset.length > 0) {
          currentDataset[0].selected = true;
        }
        applyFiltersAndRender();
        showToast(`Deleted record: ${deleted.submitBy || deleted.submittedBy}`);
      } else {
        showToast('No record selected to delete.');
      }
    });
  }

  if (btnCsv) {
    btnCsv.addEventListener('click', () => {
      exportToCsv();
    });
  }
}

function exportToCsv() {
  let headers = [];
  let rows = [];

  if (currentView === 'po') {
    headers = ["Submission Date", "Submitted BY", "Vendor Name", "PO No", "PO Amount"];
    rows = filteredDataset.map(r => [
      r.submissionDate,
      r.submittedBy,
      r.vendorName,
      r.poNo,
      r.poAmount
    ]);
  } else {
    headers = ["Submit By", "Submission Date", "Approved By", "Expense Head", "Transfer To", "Approved Amount", "Transferred Amount", "Payable Amount", "Ageing"];
    rows = filteredDataset.map(r => [
      r.submitBy,
      r.submissionDate,
      r.approvedBy,
      r.expenseHead,
      r.transferTo,
      r.approvedAmount,
      r.transferredAmount,
      r.payableAmount,
      r.ageing
    ]);
  }

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `nexus_worklist_${currentView}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported ${currentView.toUpperCase()} Worklist to CSV successfully!`);
}

/* --------------------------------------------------------------------------
   6. TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */
let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('homeToast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
