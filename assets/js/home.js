/**
 * NEXUS ECOSYSTEM INTERACTIVE ENGINE
 * Manages in-page SPA module switching (Worklist, Master, etc.), sub-pages, side popup form, and Excel filters.
 */

// ==========================================================================
// DATASETS
// ==========================================================================

// Master -> Employee Sub-Page Dataset
const masterEmployeeData = [
  {
    id: "emp-1",
    employeeId: "230510678",
    employeeName: "R/RL-234567",
    designation: "R/RL-234567",
    contactNumber: "R/RL-234567",
    email: "R/RL-234567",
    status: "Active"
  },
  {
    id: "emp-2",
    employeeId: "230510678",
    employeeName: "R/RL-234567",
    designation: "R/RL-234567",
    contactNumber: "R/RL-234567",
    email: "R/RL-234567",
    status: "In - Active"
  }
];

// Master -> Customer Sub-Page Dataset (matches uploaded user mockup)
const masterCustomerData = [
  {
    id: "cust-1",
    businessType: "Indus",
    customerId: "230510678",
    customerName: "",
    gstNumber: "R/RL-234567",
    gstType: "SGST",
    invoiceType: "B2B",
    status: "Active"
  },
  {
    id: "cust-2",
    businessType: "Supply",
    customerId: "230510678",
    customerName: "",
    gstNumber: "R/RL-234567",
    gstType: "IGST",
    invoiceType: "B2C",
    status: "In - Active"
  },
  {
    id: "cust-3",
    businessType: "Infra",
    customerId: "230510678",
    customerName: "",
    gstNumber: "NA",
    gstType: "NA",
    invoiceType: "Cash",
    status: "Active"
  }
];

// Master -> Vendor Dataset
const masterVendorData = [
  {
    id: "vend-1",
    vendorId: "VEND-40091",
    vendorName: "Guindy Steel Fabricators",
    category: "Raw Materials",
    contactNumber: "+91 94440 98765",
    email: "guindy.steels@nexus.org",
    status: "Active"
  }
];

// Master -> Products Dataset
const masterProductsData = [
  {
    id: "prod-1",
    productCode: "PRD-9901",
    productName: "Reinforced Concrete Beams",
    unit: "Pcs",
    rate: "14500.00",
    hsnCode: "681099",
    status: "Active"
  }
];

// Master -> Expenses Dataset
const masterExpensesData = [
  {
    id: "exp-1",
    expenseCode: "EXP-501",
    expenseHead: "Project Site Operations",
    category: "Direct Operating",
    budgetLimit: "500000.00",
    status: "Active"
  }
];

// Worklist -> PO Dataset
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

// Worklist -> Payment Dataset
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

// ==========================================================================
// STATE MANAGEMENT (Default landing page: Worklist)
// ==========================================================================
let currentModule = 'worklist'; // 'worklist' as default on login, or 'master'
let currentWorklistView = 'po'; // 'po' or 'payment'
let currentMasterSubpage = 'customer'; // 'employee', 'customer', 'vendor', 'products', 'expenses'

let currentDataset = [...poData];
let filteredDataset = [...poData];

// Active column filters: { [columnKey]: Set of selected values }
let activeColumnFilters = {};
let currentFilterColumn = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const moduleParam = params.get('module');
  const viewParam = params.get('view');
  const subpageParam = params.get('subpage');

  if (moduleParam === 'master') {
    currentModule = 'master';
    if (subpageParam) {
      currentMasterSubpage = subpageParam;
    } else {
      currentMasterSubpage = 'customer';
    }
  } else if (moduleParam) {
    currentModule = moduleParam;
    if (viewParam === 'payment' || viewParam === 'po') {
      currentWorklistView = viewParam;
    }
  } else {
    // Default after login is Worklist
    currentModule = 'worklist';
    if (viewParam === 'payment' || viewParam === 'po') {
      currentWorklistView = viewParam;
    }
  }

  initNavEventListeners();
  initExcelFilterSystem();
  initSideFormEvents();
  renderApp();
});

// ==========================================================================
// 1. TOP NAVBAR MODULE NAVIGATION
// ==========================================================================
function initNavEventListeners() {
  document.querySelectorAll('.nav-icon-item[data-module]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetModule = btn.getAttribute('data-module');
      switchModule(targetModule);
    });
  });
}

function switchModule(moduleName) {
  currentModule = moduleName;
  activeColumnFilters = {};

  document.querySelectorAll('.nav-icon-item').forEach(btn => {
    btn.classList.remove('active-nav-tab');
  });

  const activeBtn = document.querySelector(`.nav-icon-item[data-module="${moduleName}"]`);
  if (activeBtn) activeBtn.classList.add('active-nav-tab');

  updateURL();
  renderApp();

  const moduleTitles = {
    master: "Master (Company)",
    worklist: "Work List",
    projects: "Projects",
    accounts: "Accounts",
    admin: "Admin",
    purchase: "Purchase",
    inventory: "Inventory",
    profile: "Profile Details"
  };
  showToast(`Navigated to ${moduleTitles[moduleName] || moduleName}`);
}

function updateURL() {
  const url = new URL(window.location.href);
  url.searchParams.set('module', currentModule);

  if (currentModule === 'master') {
    url.searchParams.set('subpage', currentMasterSubpage);
    url.searchParams.delete('view');
  } else if (currentModule === 'worklist') {
    url.searchParams.set('view', currentWorklistView);
    url.searchParams.delete('subpage');
  } else {
    url.searchParams.delete('view');
    url.searchParams.delete('subpage');
  }

  window.history.replaceState({}, '', url);
}

// ==========================================================================
// 2. MAIN APPLICATION RENDERER
// ==========================================================================
function renderApp() {
  const bannerTitle = document.getElementById('pageBannerTitle');

  // Update Navbar Active Tab
  document.querySelectorAll('.nav-icon-item').forEach(btn => {
    btn.classList.remove('active-nav-tab');
  });
  const activeNavBtn = document.querySelector(`.nav-icon-item[data-module="${currentModule}"]`);
  if (activeNavBtn) activeNavBtn.classList.add('active-nav-tab');

  if (currentModule === 'master') {
    if (bannerTitle) bannerTitle.textContent = "Company Name";
    loadMasterDataset();
    renderMasterToolbar();
    renderMasterTableHead();
    renderMasterFooter();
  } else if (currentModule === 'worklist') {
    if (bannerTitle) bannerTitle.textContent = "Work List";
    loadWorklistDataset();
    renderWorklistToolbar();
    renderWorklistTableHead();
    renderWorklistFooter();
  } else {
    if (bannerTitle) bannerTitle.textContent = currentModule.toUpperCase();
    renderPlaceholderModule();
    return;
  }

  applyFiltersAndRender();
  rebindFilterButtons();
}

// ==========================================================================
// 3. MASTER MODULE RENDERERS
// ==========================================================================
function loadMasterDataset() {
  if (currentMasterSubpage === 'employee') {
    currentDataset = [...masterEmployeeData];
  } else if (currentMasterSubpage === 'customer') {
    currentDataset = [...masterCustomerData];
  } else if (currentMasterSubpage === 'vendor') {
    currentDataset = [...masterVendorData];
  } else if (currentMasterSubpage === 'products') {
    currentDataset = [...masterProductsData];
  } else if (currentMasterSubpage === 'expenses') {
    currentDataset = [...masterExpensesData];
  }
}

function renderMasterToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  // Master Toolbar: Green CSV Download + Blue Add (+) Button on Right
  toolbar.innerHTML = `
    <div class="toolbar-left"></div>
    <div class="toolbar-right">
      <!-- Green CSV Download Icon -->
      <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnMasterCsv" data-tooltip="Export CSV" aria-label="Export CSV">
        <img src="icons/CSV download.svg" alt="CSV Download" class="toolbar-icon-img" width="30" height="30">
      </button>
      <!-- Blue Add (+) Button -->
      <button type="button" class="toolbar-icon-btn btn-add-action" id="btnMasterAdd" data-tooltip="Add New Record" aria-label="Add Record">
        <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
      </button>
    </div>
  `;

  document.getElementById('btnMasterAdd')?.addEventListener('click', () => {
    openSideForm();
  });

  document.getElementById('btnMasterCsv')?.addEventListener('click', () => {
    exportToCsv();
  });
}

function renderMasterTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentMasterSubpage === 'customer') {
    // Customer Table Headers
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Business Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['businessType'] ? 'has-active-filter' : ''}" data-filter-col="businessType" title="Filter Business Type">&#9660;</button>
          </div>
        </th>
        <th>Customer ID</th>
        <th>
          <div class="th-content-wrap">
            <span>Customer Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['customerName'] ? 'has-active-filter' : ''}" data-filter-col="customerName" title="Filter Customer Name">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>GST Number</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['gstNumber'] ? 'has-active-filter' : ''}" data-filter-col="gstNumber" title="Filter GST Number">&#9660;</button>
          </div>
        </th>
        <th>GST Type</th>
        <th>
          <div class="th-content-wrap">
            <span>Invoice Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceType'] ? 'has-active-filter' : ''}" data-filter-col="invoiceType" title="Filter Invoice Type">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Status</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['status'] ? 'has-active-filter' : ''}" data-filter-col="status" title="Filter Status">&#9660;</button>
          </div>
        </th>
      </tr>
    `;
  } else if (currentMasterSubpage === 'employee') {
    // Employee Table Headers
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Employee ID</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeId'] ? 'has-active-filter' : ''}" data-filter-col="employeeId" title="Filter Employee ID">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Employee Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeName'] ? 'has-active-filter' : ''}" data-filter-col="employeeName" title="Filter Employee Name">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Designation</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['designation'] ? 'has-active-filter' : ''}" data-filter-col="designation" title="Filter Designation">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Contact Number</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['contactNumber'] ? 'has-active-filter' : ''}" data-filter-col="contactNumber" title="Filter Contact Number">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>E-Mail</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['email'] ? 'has-active-filter' : ''}" data-filter-col="email" title="Filter E-Mail">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Status</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['status'] ? 'has-active-filter' : ''}" data-filter-col="status" title="Filter Status">&#9660;</button>
          </div>
        </th>
      </tr>
    `;
  } else {
    // Generic Master Fallback Headers
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>ID</th>
        <th>Name / Code</th>
        <th>Category / Detail</th>
        <th>Contact / Limit</th>
        <th>Status</th>
      </tr>
    `;
  }
}

function renderMasterFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;

  const subpages = [
    { key: 'employee', label: 'Employee' },
    { key: 'customer', label: 'Customer' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'products', label: 'Products' },
    { key: 'expenses', label: 'Expenses' }
  ];

  footer.innerHTML = `
    <div class="segmented-toggle-group master-segmented-group">
      ${subpages.map((sp, idx) => `
        <button type="button" class="segmented-btn ${currentMasterSubpage === sp.key ? 'active' : ''}" data-subpage="${sp.key}">
          ${sp.label}
        </button>
        ${idx < subpages.length - 1 ? '<div class="segmented-divider"></div>' : ''}
      `).join('')}
    </div>
  `;

  footer.querySelectorAll('.segmented-btn[data-subpage]').forEach(btn => {
    btn.addEventListener('click', () => {
      const spKey = btn.getAttribute('data-subpage');
      if (currentMasterSubpage !== spKey) {
        currentMasterSubpage = spKey;
        activeColumnFilters = {};
        updateURL();
        renderApp();
        showToast(`Switched to Master &bull; ${btn.textContent.trim()} Page`);
      }
    });
  });
}

// ==========================================================================
// 4. WORKLIST MODULE RENDERERS
// ==========================================================================
function loadWorklistDataset() {
  if (currentWorklistView === 'po') {
    currentDataset = [...poData];
  } else {
    currentDataset = [...paymentData];
  }
}

function renderWorklistToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  if (currentWorklistView === 'po') {
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <button type="button" class="toolbar-icon-btn btn-delete-action" id="btnDeleteAction" data-tooltip="Delete Selected" aria-label="Delete">
          <img src="icons/Delete.svg" alt="Delete" class="toolbar-icon-img" width="28" height="28">
        </button>
      </div>
    `;
  } else {
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

  initWorklistToolbarEvents();
}

function renderWorklistTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentWorklistView === 'po') {
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

function renderWorklistFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;

  footer.innerHTML = `
    <div class="segmented-toggle-group">
      <button type="button" class="segmented-btn ${currentWorklistView === 'payment' ? 'active' : ''}" id="btnTogglePayment">
        Payment
      </button>
      <div class="segmented-divider"></div>
      <button type="button" class="segmented-btn ${currentWorklistView === 'po' ? 'active' : ''}" id="btnTogglePO">
        PO
      </button>
    </div>
  `;

  document.getElementById('btnTogglePO')?.addEventListener('click', () => {
    if (currentWorklistView !== 'po') {
      currentWorklistView = 'po';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Switched to PO Page');
    }
  });

  document.getElementById('btnTogglePayment')?.addEventListener('click', () => {
    if (currentWorklistView !== 'payment') {
      currentWorklistView = 'payment';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Switched to Payment Page');
    }
  });
}

function initWorklistToolbarEvents() {
  document.getElementById('btnSigmaSummary')?.addEventListener('click', () => {
    let total = 0;
    filteredDataset.forEach(r => {
      const val = parseFloat(r.approvedAmount || r.poAmount);
      if (!isNaN(val)) total += val;
    });
    showToast(`Total Approved Amount: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${filteredDataset.length} Records)`);
  });

  document.getElementById('btnInfoAction')?.addEventListener('click', () => {
    const selected = filteredDataset.find(r => r.selected);
    if (selected) {
      showToast(`Selected: ${selected.submitBy || selected.submittedBy} | Amount: ₹${selected.approvedAmount || selected.poAmount}`);
    } else {
      showToast('Select a record to view details.');
    }
  });

  document.getElementById('btnDeleteAction')?.addEventListener('click', () => {
    const selectedIndex = currentDataset.findIndex(r => r.selected);
    if (selectedIndex !== -1) {
      const deleted = currentDataset.splice(selectedIndex, 1)[0];
      if (currentDataset.length > 0) currentDataset[0].selected = true;
      applyFiltersAndRender();
      showToast(`Deleted record: ${deleted.submitBy || deleted.submittedBy}`);
    } else {
      showToast('No record selected to delete.');
    }
  });

  document.getElementById('btnCsvAction')?.addEventListener('click', () => {
    exportToCsv();
  });
}

// ==========================================================================
// 5. TABLE BODY RENDERING (Clean Text Badges in Table)
// ==========================================================================
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
    const colSpan = currentModule === 'master' ? (currentMasterSubpage === 'customer' ? 7 : 6) : (currentWorklistView === 'po' ? 6 : 10);
    tbody.innerHTML = `
      <tr>
        <td colspan="${colSpan}" class="empty-data-row">No records match the selected filter criteria.</td>
      </tr>
    `;
    return;
  }

  if (currentModule === 'master') {
    if (currentMasterSubpage === 'customer') {
      // Render Customer Rows with Clean Text Status Badge (Matching Mockup)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = row.status.toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>${row.businessType}</td>
            <td class="td-center">${row.customerId}</td>
            <td>${row.customerName}</td>
            <td>${row.gstNumber}</td>
            <td class="td-center">${row.gstType}</td>
            <td class="td-center">${row.invoiceType}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentMasterSubpage === 'employee') {
      // Render Employee Rows with Clean Text Status Badge
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = row.status.toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>${row.employeeId}</td>
            <td>
              <a href="#" class="req-link" onclick="handleEmpClick('${row.employeeName}'); return false;">${row.employeeName}</a>
            </td>
            <td>${row.designation}</td>
            <td>${row.contactNumber}</td>
            <td>${row.email}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr data-row-id="${row.id}">
          <td>${Object.values(row)[1] || ''}</td>
          <td>${Object.values(row)[2] || ''}</td>
          <td>${Object.values(row)[3] || ''}</td>
          <td>${Object.values(row)[4] || ''}</td>
          <td class="td-center"><span class="status-badge status-active">${row.status || 'Active'}</span></td>
        </tr>
      `).join('');
    }
  } else if (currentModule === 'worklist') {
    if (currentWorklistView === 'po') {
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
}

function renderPlaceholderModule() {
  const thead = document.getElementById('worklistTableHead');
  const tbody = document.getElementById('worklistTableBody');
  const toolbar = document.getElementById('worklistToolbar');
  const footer = document.getElementById('worklistFooterBar');

  if (toolbar) toolbar.innerHTML = '<div class="toolbar-left"></div><div class="toolbar-right"></div>';
  if (thead) thead.innerHTML = '<tr><th>Module Overview</th><th>Status</th></tr>';
  if (tbody) tbody.innerHTML = `<tr><td colspan="2" class="empty-data-row">${currentModule.toUpperCase()} Module content will be configured here.</td></tr>`;
  if (footer) footer.innerHTML = '';
}

// ==========================================================================
// 6. ADD CUSTOMER / ADD RECORD SIDE POPUP FORM (With Real Slide Bar)
// ==========================================================================
function initSideFormEvents() {
  const overlay = document.getElementById('sideFormOverlay');
  const btnClose = document.getElementById('btnCloseSideForm');
  const statusToggle = document.getElementById('inpStatusToggle');
  const lblStatus = document.getElementById('lblFormStatus');
  const btnSubmit = document.getElementById('btnSubmitCustomer');
  const btnSave = document.getElementById('btnSaveCustomer');

  if (btnClose) btnClose.addEventListener('click', closeSideForm);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSideForm();
    });
  }

  // Real Slide Toggle Switch Listener inside Add Customer Form
  if (statusToggle && lblStatus) {
    statusToggle.addEventListener('change', () => {
      if (statusToggle.checked) {
        lblStatus.textContent = "Active";
        lblStatus.classList.remove('status-off');
      } else {
        lblStatus.textContent = "In - Active";
        lblStatus.classList.add('status-off');
      }
    });
  }

  // Submit / Save Actions
  function handleFormSave() {
    const businessType = document.getElementById('inpBusinessType').value;
    const customerId = document.getElementById('inpCustomerId').value || `23051068${masterCustomerData.length + 1}`;
    const customerName = document.getElementById('inpCustomerName').value || "";
    const gstType = document.getElementById('inpGstType').value;
    const gstNumber = document.getElementById('inpGstNumber').value || "33ASMPM8643F";
    const invoiceType = document.getElementById('inpInvoiceType').value;
    const status = statusToggle.checked ? "Active" : "In - Active";

    const newRecord = {
      id: `cust-${Date.now()}`,
      businessType,
      customerId,
      customerName,
      gstNumber,
      gstType,
      invoiceType,
      status
    };

    masterCustomerData.push(newRecord);
    if (currentModule === 'master' && currentMasterSubpage === 'customer') {
      currentDataset = [...masterCustomerData];
      applyFiltersAndRender();
    }

    closeSideForm();
    showToast(`Customer ${customerId} successfully saved & added to table!`);
  }

  if (btnSubmit) btnSubmit.addEventListener('click', handleFormSave);
  if (btnSave) btnSave.addEventListener('click', handleFormSave);
}

function openSideForm() {
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function closeSideForm() {
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ==========================================================================
// 7. EXCEL-STYLE FILTER ENGINE
// ==========================================================================
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
    businessType: "Business Type",
    customerId: "Customer ID",
    customerName: "Customer Name",
    gstNumber: "GST Number",
    gstType: "GST Type",
    invoiceType: "Invoice Type",
    status: "Status",
    employeeId: "Employee ID",
    employeeName: "Employee Name",
    designation: "Designation",
    contactNumber: "Contact Number",
    email: "E-Mail",
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

// ==========================================================================
// 8. ROW ACTIONS & CSV EXPORT
// ==========================================================================
window.selectRow = function(rowId) {
  currentDataset = currentDataset.map(row => ({
    ...row,
    selected: row.id === rowId
  }));
  applyFiltersAndRender();
};

window.handleReqClick = function(reqCode) {
  showToast(`Opening requisition details: ${reqCode}`);
};

window.handleEmpClick = function(empName) {
  showToast(`Opening employee profile: ${empName}`);
};

function exportToCsv() {
  let headers = [];
  let rows = [];

  if (currentModule === 'master') {
    if (currentMasterSubpage === 'customer') {
      headers = ["Business Type", "Customer ID", "Customer Name", "GST Number", "GST Type", "Invoice Type", "Status"];
      rows = filteredDataset.map(r => [r.businessType, r.customerId, r.customerName, r.gstNumber, r.gstType, r.invoiceType, r.status]);
    } else if (currentMasterSubpage === 'employee') {
      headers = ["Employee ID", "Employee Name", "Designation", "Contact Number", "E-Mail", "Status"];
      rows = filteredDataset.map(r => [r.employeeId, r.employeeName, r.designation, r.contactNumber, r.email, r.status]);
    } else {
      headers = Object.keys(filteredDataset[0] || {}).filter(k => k !== 'id');
      rows = filteredDataset.map(r => headers.map(h => r[h]));
    }
  } else if (currentWorklistView === 'po') {
    headers = ["Submission Date", "Submitted BY", "Vendor Name", "PO No", "PO Amount"];
    rows = filteredDataset.map(r => [r.submissionDate, r.submittedBy, r.vendorName, r.poNo, r.poAmount]);
  } else {
    headers = ["Submit By", "Submission Date", "Approved By", "Expense Head", "Transfer To", "Approved Amount", "Transferred Amount", "Payable Amount", "Ageing"];
    rows = filteredDataset.map(r => [r.submitBy, r.submissionDate, r.approvedBy, r.expenseHead, r.transferTo, r.approvedAmount, r.transferredAmount, r.payableAmount, r.ageing]);
  }

  let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `nexus_${currentModule}_${currentMasterSubpage || currentWorklistView}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported ${currentMasterSubpage.toUpperCase()} to CSV successfully!`);
}

// ==========================================================================
// 9. TOAST NOTIFICATIONS
// ==========================================================================
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
