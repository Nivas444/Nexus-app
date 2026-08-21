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

// Master -> Vendor Dataset (Matching Uploaded Mockup)
const masterVendorData = [
  {
    id: "vend-1",
    vendorType: "Service",
    vendorId: "230510678",
    vendorName: "R/RL-234567",
    gstNumber: "R/RL-234567",
    panNumber: "R/RL-234567",
    gstType: "SGST",
    status: "Active"
  },
  {
    id: "vend-2",
    vendorType: "Supply",
    vendorId: "230510678",
    vendorName: "R/RL-234567",
    gstNumber: "R/RL-234567",
    panNumber: "R/RL-234567",
    gstType: "IGST",
    status: "In - Active"
  },
  {
    id: "vend-3",
    vendorType: "Service",
    vendorId: "230510678",
    vendorName: "R/RL-234567",
    gstNumber: "NA",
    panNumber: "R/RL-234567",
    gstType: "NA",
    status: "Active"
  }
];

// Master -> Products Dataset (Matching Uploaded Mockup)
const masterProductsData = [
  {
    id: "prod-1",
    productHead: "230510678",
    productCode: "",
    hsnCode: "",
    productDescription: "",
    gstRate: "",
    status: "Active"
  },
  {
    id: "prod-2",
    productHead: "230510678",
    productCode: "",
    hsnCode: "",
    productDescription: "",
    gstRate: "",
    status: "In - Active"
  },
  {
    id: "prod-3",
    productHead: "230510678",
    productCode: "",
    hsnCode: "",
    productDescription: "",
    gstRate: "",
    status: "Active"
  }
];

// Master -> Expenses Dataset (Matching Uploaded Mockup)
const masterExpensesData = [
  {
    id: "exp-1",
    expenseHead: "230510678",
    expenseCode: "",
    sacCode: "",
    expenseDescription: "",
    tdsRate: "",
    gstRate: "",
    uom: "",
    status: "Active"
  },
  {
    id: "exp-2",
    expenseHead: "230510678",
    expenseCode: "",
    sacCode: "",
    expenseDescription: "",
    tdsRate: "",
    gstRate: "",
    uom: "",
    status: "In - Active"
  },
  {
    id: "exp-3",
    expenseHead: "230510678",
    expenseCode: "",
    sacCode: "",
    expenseDescription: "",
    tdsRate: "",
    gstRate: "",
    uom: "",
    status: "Active"
  }
];

// ==========================================================================
// INDUS TOWERS DATASET (Sub-Page from Customer Table Indus Link)
// ==========================================================================
let currentIndusSubpage = 'site'; // 'site', 'products', 'infra', 'projects'

const indusSiteData = [
  {
    id: "indus-1",
    circle: "KTN",
    siteId: "230510678",
    whId: "KTN",
    siteName: "R/RL-234567",
    district: "R/RL-234567",
    town: "",
    latitude: "SGST",
    longitude: "B2B",
    transportZone: "",
    status: "Active"
  },
  {
    id: "indus-2",
    circle: "KK",
    siteId: "230510678",
    whId: "KK",
    siteName: "R/RL-234567",
    district: "R/RL-234567",
    town: "",
    latitude: "IGST",
    longitude: "B2C",
    transportZone: "",
    status: "In - Active"
  },
  {
    id: "indus-3",
    circle: "AP",
    siteId: "230510678",
    whId: "AP",
    siteName: "R/RL-234567",
    district: "R/RL-234567",
    town: "",
    latitude: "NA",
    longitude: "Cash",
    transportZone: "",
    status: "Active"
  }
];

const indusProductsData = [
  {
    id: "indus-prod-1",
    itemCode: "KTN",
    productName: "230510678",
    productType: "Capex",
    productDescription: "KTN",
    hsnSacType: "HSN",
    hsnSacCode: "R/RL-234567",
    activeRate: "11000.00",
    budgetPercent: "95",
    budgetAmount: "11000.00",
    status: "Active"
  },
  {
    id: "indus-prod-2",
    itemCode: "KK",
    productName: "230510678",
    productType: "Opex",
    productDescription: "KK",
    hsnSacType: "SAC",
    hsnSacCode: "R/RL-234567",
    activeRate: "11000.00",
    budgetPercent: "90",
    budgetAmount: "11000.00",
    status: "In - Active"
  },
  {
    id: "indus-prod-3",
    itemCode: "AP",
    productName: "230510678",
    productType: "",
    productDescription: "AP",
    hsnSacType: "HSN",
    hsnSacCode: "R/RL-234567",
    activeRate: "11000.00",
    budgetPercent: "85",
    budgetAmount: "11000.00",
    status: "Active"
  }
];

const indusInfraData = [
  {
    id: "indus-infra-1",
    infraCategory: "KTN",
    infraDescription: "KTN",
    uom: "R/RL-234567",
    make: "R/RL-234567",
    commissioning: "Yes",
    iMap: "Yes",
    status: "Active"
  },
  {
    id: "indus-infra-2",
    infraCategory: "KK",
    infraDescription: "KK",
    uom: "R/RL-234567",
    make: "R/RL-234567",
    commissioning: "No",
    iMap: "No",
    status: "In - Active"
  }
];

const indusProjectsData = [
  {
    id: "indus-proj-1",
    projectType: "KTN",
    subProjectType: "KTN",
    tat: "45",
    indusPm: "R/RL-234567",
    indusScm: "R/RL-234567",
    pm: "R/RL-234567",
    mis: "R/RL-234567",
    survey: "Yes",
    additionalTransport: "Yes",
    status: "Active"
  },
  {
    id: "indus-proj-2",
    projectType: "KK",
    subProjectType: "KK",
    tat: "45",
    indusPm: "R/RL-234567",
    indusScm: "R/RL-234567",
    pm: "R/RL-234567",
    mis: "R/RL-234567",
    survey: "No",
    additionalTransport: "No",
    status: "In - Active"
  },
  {
    id: "indus-proj-3",
    projectType: "KTN",
    subProjectType: "KTN",
    tat: "45",
    indusPm: "R/RL-234567",
    indusScm: "R/RL-234567",
    pm: "R/RL-234567",
    mis: "R/RL-234567",
    survey: "Yes",
    additionalTransport: "No",
    status: "Active"
  },
  {
    id: "indus-proj-4",
    projectType: "KTN",
    subProjectType: "KTN",
    tat: "45",
    indusPm: "R/RL-234567",
    indusScm: "R/RL-234567",
    pm: "R/RL-234567",
    mis: "R/RL-234567",
    survey: "No",
    additionalTransport: "Yes",
    status: "Active"
  }
];

let currentIndusProductSubpage = 'materials';
let selectedProductName = 'Product Name';

const indusProductMaterialsData = [
  {
    id: "mat-1",
    materialCode: "230510678",
    materialHead: "230510678",
    materialCategory: "230510678",
    materialDescription: "230510678",
    type: "Parent",
    status: "Active"
  },
  {
    id: "mat-2",
    materialCode: "230510678",
    materialHead: "230510678",
    materialCategory: "230510678",
    materialDescription: "230510678",
    type: "Child",
    status: "In - Active"
  }
];

const indusProductExpensesData = [
  {
    id: "prod-exp-1",
    expenseCode: "230510678",
    expenseHead: "230510678",
    expenseCategory: "230510678",
    expenseDescription: "230510678",
    type: "Parent",
    status: "Active"
  },
  {
    id: "prod-exp-2",
    expenseCode: "230510678",
    expenseHead: "230510678",
    expenseCategory: "230510678",
    expenseDescription: "230510678",
    type: "Child",
    status: "In - Active"
  }
];

const indusProductInfraData = [
  {
    id: "prod-infra-1",
    infraCode: "230510678",
    infraCategory: "230510678",
    infraDescription: "230510678",
    type: "Parent",
    status: "Active"
  },
  {
    id: "prod-infra-2",
    infraCode: "230510678",
    infraCategory: "230510678",
    infraDescription: "230510678",
    type: "Child",
    status: "In - Active"
  }
];

const indusProductRateData = [
  {
    id: "prod-rate-1",
    from: "230510678",
    to: "230510678",
    gbpa: "230510678",
    rate: "Parent",
    status: "Active"
  },
  {
    id: "prod-rate-2",
    from: "230510678",
    to: "230510678",
    gbpa: "230510678",
    rate: "Child",
    status: "In - Active"
  }
];

let selectedProjectType = "Project Type";
let currentIndusProjectTypeSubpage = "survey"; // 'survey' | 'transport'

const indusProjectSurveyData = [
  { id: "survey-1", description: "KTN" },
  { id: "survey-2", description: "KK" }
];

const indusProjectTransportData = [
  {
    id: "transport-1",
    itemCode: "KTN",
    itemDescription: "KTN",
    transportZone: "Zone 1",
    qty: "1",
    status: "Active"
  },
  {
    id: "transport-2",
    itemCode: "KK",
    itemDescription: "KK",
    transportZone: "Zone 2",
    qty: "2",
    status: "In - Active"
  }
];

function openIndusProjectTypeDetails(projectTypeName) {
  selectedProjectType = projectTypeName || "Project Type";
  currentModule = 'indus_towers';
  currentIndusSubpage = 'project_type_details';
  currentIndusProjectTypeSubpage = 'survey';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to ${selectedProjectType} / Sub - Project Type`);
}

function openIndusProductDetails(productName) {
  currentModule = 'indus_towers';
  currentIndusSubpage = 'product_details';
  currentIndusProductSubpage = 'materials';
  selectedProductName = productName || 'Product Name';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Opened Product Details for ${selectedProductName}`);
}

// Worklist -> PO Dataset
const poData = [
  {
    id: "po-1",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    submittedBy: "R/RL-234567",
    vendorName: "Guindy",
    poNo: "2026001",
    poAmount: "10000.00",
    selected: false
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
    selected: false
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
  } else if (moduleParam === 'indus_towers') {
    currentModule = 'indus_towers';
    if (subpageParam) {
      currentIndusSubpage = subpageParam;
    } else {
      currentIndusSubpage = 'site';
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
    indus_towers: "Indus Towers",
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
  } else if (currentModule === 'indus_towers') {
    url.searchParams.set('subpage', currentIndusSubpage);
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
// 2. MAIN APPLICATION RENDERER & BACK NAVIGATION
// ==========================================================================
function goBackSubpage() {
  if (currentModule === 'indus_towers') {
    if (currentIndusSubpage === 'project_type_details') {
      currentIndusSubpage = 'projects';
      showToast('Returned to Projects');
    } else if (currentIndusSubpage === 'product_details') {
      currentIndusSubpage = 'products';
      showToast('Returned to Products');
    } else if (currentIndusSubpage === 'infra' || currentIndusSubpage === 'projects' || currentIndusSubpage === 'products') {
      currentIndusSubpage = 'site';
      showToast('Returned to Site');
    } else {
      currentModule = 'master';
      currentMasterSubpage = 'customer';
      showToast('Returned to Master Customer');
    }
  } else if (currentModule === 'master') {
    if (currentMasterSubpage !== 'customer') {
      currentMasterSubpage = 'customer';
      showToast('Returned to Customer');
    } else {
      currentModule = 'worklist';
      showToast('Returned to Worklist');
    }
  } else {
    currentModule = 'indus_towers';
    currentIndusSubpage = 'site';
  }
  activeColumnFilters = {};
  updateURL();
  renderApp();
}

const universalBackBtnHtml = `
  <button type="button" class="toolbar-icon-btn btn-back-action" id="btnUniversalBack" onclick="goBackSubpage()" data-tooltip="Go Back" aria-label="Go Back">
    <img src="icons/Backward.svg" alt="Back" class="toolbar-icon-img" width="30" height="30">
  </button>
`;

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
  } else if (currentModule === 'indus_towers') {
    if (currentIndusSubpage === 'product_details') {
      if (bannerTitle) bannerTitle.innerHTML = `<span class="banner-title-underline">${selectedProductName || 'Product Name'}</span>`;
    } else if (currentIndusSubpage === 'project_type_details') {
      if (bannerTitle) bannerTitle.innerHTML = `<span class="banner-title-underline">${selectedProjectType || 'Project Type'} / Sub - Project Type</span>`;
    } else {
      if (bannerTitle) bannerTitle.innerHTML = `<span class="banner-title-underline">Indus Towers</span>`;
    }
    loadIndusDataset();
    renderIndusToolbar();
    renderIndusTableHead();
    renderIndusFooter();
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
// INDUS TOWERS MODULE RENDERERS
// ==========================================================================
function openIndusTowersPage() {
  currentModule = 'indus_towers';
  currentIndusSubpage = 'site';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to Indus Towers Details');
}

function loadIndusDataset() {
  if (currentIndusSubpage === 'site') {
    currentDataset = [...indusSiteData];
  } else if (currentIndusSubpage === 'products') {
    currentDataset = [...indusProductsData];
  } else if (currentIndusSubpage === 'infra') {
    currentDataset = [...indusInfraData];
  } else if (currentIndusSubpage === 'projects') {
    currentDataset = [...indusProjectsData];
  } else if (currentIndusSubpage === 'project_type_details') {
    if (currentIndusProjectTypeSubpage === 'transport') {
      currentDataset = [...indusProjectTransportData];
    } else {
      currentDataset = [...indusProjectSurveyData];
    }
  } else if (currentIndusSubpage === 'product_details') {
    if (currentIndusProductSubpage === 'materials') {
      currentDataset = [...indusProductMaterialsData];
    } else if (currentIndusProductSubpage === 'expenses') {
      currentDataset = [...indusProductExpensesData];
    } else if (currentIndusProductSubpage === 'infra') {
      currentDataset = [...indusProductInfraData];
    } else if (currentIndusProductSubpage === 'rate') {
      currentDataset = [...indusProductRateData];
    }
  }
}

function renderIndusToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  if (currentIndusSubpage === 'product_details' || currentIndusSubpage === 'project_type_details') {
    // Product Details / Project Type Details Toolbar: Backward Icon on Left + Single Blue Plus (+) on Right
    toolbar.innerHTML = `
      <div class="toolbar-left">${universalBackBtnHtml}</div>
      <div class="toolbar-right">
        <!-- Blue Add (+) Button -->
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnIndusAdd" data-tooltip="Add New Record" aria-label="Add Record">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;
    document.getElementById('btnIndusAdd')?.addEventListener('click', () => {
      openSideForm();
    });
    return;
  }

  if (currentIndusSubpage === 'products') {
    // Indus Towers Products Toolbar: CSV Upload + Orange Bulk Upload on Right (No + Button)
    toolbar.innerHTML = `
      <div class="toolbar-left">${universalBackBtnHtml}</div>
      <div class="toolbar-right">
        <!-- Green CSV Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnIndusCsv" data-tooltip="CSV Upload" aria-label="CSV Upload">
          <img src="icons/CSV upload.svg" alt="CSV Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- Orange Bulk Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-doc-upload-action" id="btnIndusDocUpload" data-tooltip="Bulk Upload" aria-label="Bulk Upload">
          <img src="icons/Bulk Upload.svg" alt="Bulk Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;

    document.getElementById('btnIndusCsv')?.addEventListener('click', () => {
      exportToCsv();
    });
    document.getElementById('btnIndusDocUpload')?.addEventListener('click', () => {
      showToast('Bulk Upload initiated');
    });
    return;
  }

  if (currentIndusSubpage === 'infra') {
    // Indus Towers Infra Toolbar: Backward Icon on Left + Orange Bulk Upload + Blue Plus (+) on Right
    toolbar.innerHTML = `
      <div class="toolbar-left">${universalBackBtnHtml}</div>
      <div class="toolbar-right">
        <!-- Orange Bulk Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-doc-upload-action" id="btnIndusDocUpload" data-tooltip="Bulk Upload" aria-label="Bulk Upload">
          <img src="icons/Bulk Upload.svg" alt="Bulk Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- Blue Add (+) Button -->
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnIndusAdd" data-tooltip="Add New Infra" aria-label="Add Infra">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;
  } else {
    // Indus Towers Toolbar (Site, Projects): Backward Icon on Left + CSV Upload + Orange Bulk Upload + Blue Plus (+) on Right
    toolbar.innerHTML = `
      <div class="toolbar-left">${universalBackBtnHtml}</div>
      <div class="toolbar-right">
        <!-- Green CSV Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnIndusCsv" data-tooltip="CSV Upload" aria-label="CSV Upload">
          <img src="icons/CSV upload.svg" alt="CSV Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- Orange Bulk Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-doc-upload-action" id="btnIndusDocUpload" data-tooltip="Bulk Upload" aria-label="Bulk Upload">
          <img src="icons/Bulk Upload.svg" alt="Bulk Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- Blue Add (+) Button -->
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnIndusAdd" data-tooltip="Add New Record" aria-label="Add Record">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;

    document.getElementById('btnIndusCsv')?.addEventListener('click', () => {
      exportToCsv();
    });
  }

  document.getElementById('btnIndusAdd')?.addEventListener('click', () => {
    openSideForm();
  });

  document.getElementById('btnIndusDocUpload')?.addEventListener('click', () => {
    showToast('Bulk Upload initiated');
  });
}

function renderIndusTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentIndusSubpage === 'product_details') {
    if (currentIndusProductSubpage === 'materials') {
      // 6 Columns Matching Image 1: Material Code, Material Head, Material Category, Material Description, Type, Status
      thead.innerHTML = `
        <tr class="master-view-header">
          <th>
            <div class="th-content-wrap">
              <span>Material Code</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Material Head</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['materialHead'] ? 'has-active-filter' : ''}" data-filter-col="materialHead" title="Filter Material Head">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Material Category</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['materialCategory'] ? 'has-active-filter' : ''}" data-filter-col="materialCategory" title="Filter Material Category">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Material Description</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['materialDescription'] ? 'has-active-filter' : ''}" data-filter-col="materialDescription" title="Filter Material Description">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Type</span>
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
    } else if (currentIndusProductSubpage === 'expenses') {
      // 6 Columns Matching Uploaded Mockup: Expense Code, Expense Head, Expense Category, Expense Description, Type, Status
      thead.innerHTML = `
        <tr class="master-view-header">
          <th>
            <div class="th-content-wrap">
              <span>Expense Code</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Expense Head</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseHead'] ? 'has-active-filter' : ''}" data-filter-col="expenseHead" title="Filter Expense Head">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Expense Category</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseCategory'] ? 'has-active-filter' : ''}" data-filter-col="expenseCategory" title="Filter Expense Category">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Expense Description</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseDescription'] ? 'has-active-filter' : ''}" data-filter-col="expenseDescription" title="Filter Expense Description">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Type</span>
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
    } else if (currentIndusProductSubpage === 'infra') {
      // 5 Columns Matching Uploaded Mockup: Infra Code, Infra Category, Infra Description, Type, Status
      thead.innerHTML = `
        <tr class="master-view-header">
          <th>
            <div class="th-content-wrap">
              <span>Infra Code</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraCode'] ? 'has-active-filter' : ''}" data-filter-col="infraCode" title="Filter Infra Code">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Infra Category</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraCategory'] ? 'has-active-filter' : ''}" data-filter-col="infraCategory" title="Filter Infra Category">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Infra Description</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraDescription'] ? 'has-active-filter' : ''}" data-filter-col="infraDescription" title="Filter Infra Description">&#9660;</button>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Type</span>
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
    } else if (currentIndusProductSubpage === 'rate') {
      // 5 Columns Matching Uploaded Mockup: From, To, GBPA, Rate, Status
      thead.innerHTML = `
        <tr class="master-view-header">
          <th>
            <div class="th-content-wrap">
              <span>From</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>To</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>GBPA</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Rate</span>
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
      thead.innerHTML = `
        <tr class="master-view-header">
          <th>Code</th>
          <th>Head / Description</th>
          <th>Category</th>
          <th>Status</th>
        </tr>
      `;
    }
    return;
  }

  if (currentIndusSubpage === 'project_type_details') {
    if (currentIndusProjectTypeSubpage === 'transport') {
      // 5 Columns Matching Transport Mockup: Item Code, Item Description, Transport Zone, Qty, Status
      thead.innerHTML = `
        <tr class="master-view-header">
          <th>
            <div class="th-content-wrap">
              <span>Item Code</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Item Description</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Transport Zone</span>
            </div>
          </th>
          <th>
            <div class="th-content-wrap">
              <span>Qty</span>
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
      // 1 Column Header Matching Survey Mockup: Description
      thead.innerHTML = `
        <tr class="master-view-header">
          <th style="text-align: center;">
            <div class="th-content-wrap" style="justify-content: center;">
              <span>Description</span>
            </div>
          </th>
        </tr>
      `;
    }
    return;
  }

  if (currentIndusSubpage === 'projects') {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Project Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['projectType'] ? 'has-active-filter' : ''}" data-filter-col="projectType" title="Filter Project Type">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Sub - Project Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['subProjectType'] ? 'has-active-filter' : ''}" data-filter-col="subProjectType" title="Filter Sub - Project Type">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>TAT</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Indus PM</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Indus SCM</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>PM</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>MIS</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Survey</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Additional Transport</span>
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
  } else if (currentIndusSubpage === 'infra') {
    // Indus Towers Infra Table Headers (Matching Mockup: Infra Category, Infra Description, Uom, Make, Commissioning, I - Map, Status)
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Infra Category</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraCategory'] ? 'has-active-filter' : ''}" data-filter-col="infraCategory" title="Filter Infra Category">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Infra Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraDescription'] ? 'has-active-filter' : ''}" data-filter-col="infraDescription" title="Filter Infra Description">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Uom</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Make</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Commissioning</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>I - Map</span>
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
  } else if (currentIndusSubpage === 'products') {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Item Code</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['itemCode'] ? 'has-active-filter' : ''}" data-filter-col="itemCode" title="Filter Item Code">&#9660;</button>
          </div>
        </th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Product Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productName'] ? 'has-active-filter' : ''}" data-filter-col="productName" title="Filter Product Name">&#9660;</button>
          </div>
        </th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Product Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productType'] ? 'has-active-filter' : ''}" data-filter-col="productType" title="Filter Product Type">&#9660;</button>
          </div>
        </th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Product Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productDescription'] ? 'has-active-filter' : ''}" data-filter-col="productDescription" title="Filter Product Description">&#9660;</button>
          </div>
        </th>
        <th colspan="2">
          <div class="th-content-wrap">
            <span>HSN / SAC</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['hsnSacCode'] ? 'has-active-filter' : ''}" data-filter-col="hsnSacCode" title="Filter HSN / SAC">&#9660;</button>
          </div>
        </th>
        <th colspan="1">
          <div class="th-content-wrap">
            <span>Active Rate</span>
          </div>
        </th>
        <th colspan="2">
          <div class="th-content-wrap">
            <span>Budget</span>
          </div>
        </th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Status</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['status'] ? 'has-active-filter' : ''}" data-filter-col="status" title="Filter Status">&#9660;</button>
          </div>
        </th>
      </tr>
      <tr class="tr-sub-headers master-view-header">
        <th>Type</th>
        <th>Code</th>
        <th>₹</th>
        <th>%</th>
        <th>₹</th>
      </tr>
    `;
  } else {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Circle</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['circle'] ? 'has-active-filter' : ''}" data-filter-col="circle" title="Filter Circle">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Site ID</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['siteId'] ? 'has-active-filter' : ''}" data-filter-col="siteId" title="Filter Site ID">&#9660;</button>
          </div>
        </th>
        <th>WH ID</th>
        <th>
          <div class="th-content-wrap">
            <span>Site Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['siteName'] ? 'has-active-filter' : ''}" data-filter-col="siteName" title="Filter Site Name">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>District</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['district'] ? 'has-active-filter' : ''}" data-filter-col="district" title="Filter District">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Town</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['town'] ? 'has-active-filter' : ''}" data-filter-col="town" title="Filter Town">&#9660;</button>
          </div>
        </th>
        <th>Lattitude</th>
        <th>Longtitude</th>
        <th>
          <div class="th-content-wrap">
            <span>Transport Zone</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['transportZone'] ? 'has-active-filter' : ''}" data-filter-col="transportZone" title="Filter Transport Zone">&#9660;</button>
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
  }
}

function renderIndusFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;

  if (currentIndusSubpage === 'project_type_details') {
    const projTypeSubpages = [
      { key: 'survey', label: 'Survey' },
      { key: 'transport', label: 'Transport' }
    ];

    footer.innerHTML = `
      <div class="segmented-toggle-group master-segmented-group indus-segmented-group">
        ${projTypeSubpages.map((sp, idx) => `
          <button type="button" class="segmented-btn ${currentIndusProjectTypeSubpage === sp.key ? 'active' : ''}" data-projtype-subpage="${sp.key}">
            ${sp.label}
          </button>
          ${idx < projTypeSubpages.length - 1 ? '<div class="segmented-divider"></div>' : ''}
        `).join('')}
      </div>
    `;

    footer.querySelectorAll('.segmented-btn[data-projtype-subpage]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spKey = btn.getAttribute('data-projtype-subpage');
        if (currentIndusProjectTypeSubpage !== spKey) {
          currentIndusProjectTypeSubpage = spKey;
          activeColumnFilters = {};
          renderApp();
          showToast(`Switched to ${selectedProjectType} &bull; ${btn.textContent.trim()}`);
        }
      });
    });
    return;
  }

  if (currentIndusSubpage === 'product_details') {
    const prodSubpages = [
      { key: 'materials', label: 'Materials' },
      { key: 'expenses', label: 'Expenses' },
      { key: 'infra', label: 'Infra' },
      { key: 'rate', label: 'Rate' }
    ];

    footer.innerHTML = `
      <div class="segmented-toggle-group master-segmented-group indus-segmented-group">
        ${prodSubpages.map((sp, idx) => `
          <button type="button" class="segmented-btn ${currentIndusProductSubpage === sp.key ? 'active' : ''}" data-prod-subpage="${sp.key}">
            ${sp.label}
          </button>
          ${idx < prodSubpages.length - 1 ? '<div class="segmented-divider"></div>' : ''}
        `).join('')}
      </div>
    `;

    footer.querySelectorAll('.segmented-btn[data-prod-subpage]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spKey = btn.getAttribute('data-prod-subpage');
        if (currentIndusProductSubpage !== spKey) {
          currentIndusProductSubpage = spKey;
          activeColumnFilters = {};
          renderApp();
          showToast(`Switched to Product &bull; ${btn.textContent.trim()}`);
        }
      });
    });
    return;
  }

  const subpages = [
    { key: 'site', label: 'Site' },
    { key: 'products', label: 'Products' },
    { key: 'infra', label: 'Infra' },
    { key: 'projects', label: 'Projects' }
  ];

  footer.innerHTML = `
    <div class="segmented-toggle-group master-segmented-group indus-segmented-group">
      ${subpages.map((sp, idx) => `
        <button type="button" class="segmented-btn ${currentIndusSubpage === sp.key ? 'active' : ''}" data-indus-subpage="${sp.key}">
          ${sp.label}
        </button>
        ${idx < subpages.length - 1 ? '<div class="segmented-divider"></div>' : ''}
      `).join('')}
    </div>
  `;

  footer.querySelectorAll('.segmented-btn[data-indus-subpage]').forEach(btn => {
    btn.addEventListener('click', () => {
      const spKey = btn.getAttribute('data-indus-subpage');
      if (currentIndusSubpage !== spKey) {
        currentIndusSubpage = spKey;
        activeColumnFilters = {};
        updateURL();
        renderApp();
        showToast(`Switched to Indus Towers &bull; ${btn.textContent.trim()}`);
      }
    });
  });
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

  if (currentMasterSubpage === 'employee') {
    // Employee Toolbar: Green CSV Upload Icon on Right (No + icon, No Backward icon)
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <!-- Green CSV Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnMasterCsv" data-tooltip="CSV Upload" aria-label="CSV Upload">
          <img src="icons/CSV upload.svg" alt="CSV Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;
    document.getElementById('btnMasterCsv')?.addEventListener('click', () => {
      exportToCsv();
    });
    return;
  }

  if (currentMasterSubpage === 'vendor' || currentMasterSubpage === 'products' || currentMasterSubpage === 'expenses') {
    // Toolbar: Green CSV Upload + Orange Bulk Upload + Blue Add (+) Button on Right (No Backward icon)
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <!-- Green CSV Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnMasterCsv" data-tooltip="CSV Upload" aria-label="CSV Upload">
          <img src="icons/CSV upload.svg" alt="CSV Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- Orange Bulk Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-doc-upload-action" id="btnMasterDocUpload" data-tooltip="Bulk Upload" aria-label="Bulk Upload">
          <img src="icons/Bulk Upload.svg" alt="Bulk Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- Blue Add (+) Button -->
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnMasterAdd" data-tooltip="Add New ${currentMasterSubpage === 'products' ? 'Product' : currentMasterSubpage === 'expenses' ? 'Expense' : 'Vendor'}" aria-label="Add Record">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;

    document.getElementById('btnMasterDocUpload')?.addEventListener('click', () => {
      showToast('Bulk Upload dialog opened');
    });
  } else {
    // Master Customer Toolbar: Green CSV Upload + Blue Add (+) Button on Right (No Backward icon)
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <!-- Green CSV Upload Icon -->
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnMasterCsv" data-tooltip="CSV Upload" aria-label="CSV Upload">
          <img src="icons/CSV upload.svg" alt="CSV Upload" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- Blue Add (+) Button -->
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnMasterAdd" data-tooltip="Add New Record" aria-label="Add Record">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;
  }

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
  } else if (currentMasterSubpage === 'vendor') {
    // Vendor Table Headers (Matching Mockup: Vendor Type, Vendor ID, Vendor Name, GST Number, PAN Number, GST Type, Status)
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Vendor Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorType'] ? 'has-active-filter' : ''}" data-filter-col="vendorType" title="Filter Vendor Type">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Vendor ID</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Vendor Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorName'] ? 'has-active-filter' : ''}" data-filter-col="vendorName" title="Filter Vendor Name">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>GST Number</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>PAN Number</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['panNumber'] ? 'has-active-filter' : ''}" data-filter-col="panNumber" title="Filter PAN Number">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>GST Type</span>
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
  } else if (currentMasterSubpage === 'products') {
    // Products Table Headers (Matching Mockup: Product Head, Product Code, HSN Code, Product Description, GST Rate, Status)
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Product Head</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productHead'] ? 'has-active-filter' : ''}" data-filter-col="productHead" title="Filter Product Head">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Product Code</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>HSN Code</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Product Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productDescription'] ? 'has-active-filter' : ''}" data-filter-col="productDescription" title="Filter Product Description">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>GST Rate</span>
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
  } else if (currentMasterSubpage === 'expenses') {
    // Expenses Table Headers (Matching Mockup: Expense Head, Expense Code, SAC Code, Expense Description, TDS Rate, GST Rate, Uom, Status)
    thead.innerHTML = `
      <tr class="master-view-header">
        <th>
          <div class="th-content-wrap">
            <span>Expense Head</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseHead'] ? 'has-active-filter' : ''}" data-filter-col="expenseHead" title="Filter Expense Head">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Expense Code</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>SAC Code</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Expense Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseDescription'] ? 'has-active-filter' : ''}" data-filter-col="expenseDescription" title="Filter Expense Description">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>TDS Rate</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>GST Rate</span>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Uom</span>
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

  const hasSelected = currentDataset.some(r => r.selected);

  if (currentWorklistView === 'po') {
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <button type="button" class="toolbar-icon-btn btn-delete-action" id="btnDeleteAction" data-tooltip="Delete Selected" aria-label="Delete" style="display: ${hasSelected ? 'flex' : 'none'};">
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
        <button type="button" class="toolbar-icon-btn btn-delete-action" id="btnDeleteAction" data-tooltip="Delete Selected" aria-label="Delete" style="display: ${hasSelected ? 'flex' : 'none'};">
          <img src="icons/Delete.svg" alt="Delete" class="toolbar-icon-img" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnCsvAction" data-tooltip="CSV Upload" aria-label="CSV Upload">
          <img src="icons/CSV upload.svg" alt="CSV Upload" class="toolbar-icon-img" width="28" height="28">
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
      applyFiltersAndRender();
      updateDeleteButtonVisibility();
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
    const colSpan = currentModule === 'indus_towers' ? 10 : (currentModule === 'master' ? (currentMasterSubpage === 'customer' ? 7 : 6) : (currentWorklistView === 'po' ? 6 : 10));
    tbody.innerHTML = `
      <tr>
        <td colspan="${colSpan}" class="empty-data-row">No records match the selected filter criteria.</td>
      </tr>
    `;
    return;
  }

  if (currentModule === 'indus_towers') {
    if (currentIndusSubpage === 'product_details') {
      if (currentIndusProductSubpage === 'materials') {
        // Render Product Details -> Materials Rows (Matching Image 1 Uploaded Mockup)
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Material Code: ${row.materialCode}'); return false;">${row.materialCode || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Material Head: ${row.materialHead}'); return false;">${row.materialHead || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Material Category: ${row.materialCategory}'); return false;">${row.materialCategory || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Material Description: ${row.materialDescription}'); return false;">${row.materialDescription || ''}</a>
              </td>
              <td>${row.type || ''}</td>
              <td class="td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      } else if (currentIndusProductSubpage === 'expenses') {
        // Render Product Details -> Expenses Rows (Matching Uploaded Mockup)
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Expense Code: ${row.expenseCode}'); return false;">${row.expenseCode || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Expense Head: ${row.expenseHead}'); return false;">${row.expenseHead || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Expense Category: ${row.expenseCategory}'); return false;">${row.expenseCategory || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Expense Description: ${row.expenseDescription}'); return false;">${row.expenseDescription || ''}</a>
              </td>
              <td>${row.type || ''}</td>
              <td class="td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      } else if (currentIndusProductSubpage === 'infra') {
        // Render Product Details -> Infra Rows (Matching Uploaded Mockup)
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Infra Code: ${row.infraCode}'); return false;">${row.infraCode || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Infra Category: ${row.infraCategory}'); return false;">${row.infraCategory || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Infra Description: ${row.infraDescription}'); return false;">${row.infraDescription || ''}</a>
              </td>
              <td>${row.type || ''}</td>
              <td class="td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      } else if (currentIndusProductSubpage === 'rate') {
        // Render Product Details -> Rate Rows (Matching Uploaded Mockup)
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('From: ${row.from}'); return false;">${row.from || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('To: ${row.to}'); return false;">${row.to || ''}</a>
              </td>
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('GBPA: ${row.gbpa}'); return false;">${row.gbpa || ''}</a>
              </td>
              <td>${row.rate || ''}</td>
              <td class="td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      }
      return;
    }

    if (currentIndusSubpage === 'project_type_details') {
      if (currentIndusProjectTypeSubpage === 'transport') {
        // Render Transport Rows (Matching Uploaded Mockup: Item Code, Item Description, Transport Zone, Qty, Status)
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td>
                <a href="#" class="req-link td-link-blue" onclick="showToast('Item Code: ${row.itemCode}'); return false;">${row.itemCode || ''}</a>
              </td>
              <td>${row.itemDescription || ''}</td>
              <td>${row.transportZone || ''}</td>
              <td>${row.qty || ''}</td>
              <td class="td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status || 'Active'}</span>
              </td>
            </tr>
          `;
        }).join('');
      } else {
        // Render Survey Description Rows (Matching Uploaded Mockup: KTN, KK)
        tbody.innerHTML = filteredDataset.map(row => {
          return `
            <tr data-row-id="${row.id}">
              <td style="text-align: center;">${row.description || ''}</td>
            </tr>
          `;
        }).join('');
      }
      return;
    }

    if (currentIndusSubpage === 'projects') {
      // Render Indus Towers -> Projects Rows (Matching Uploaded Mockup)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        const isSurveyYes = (row.survey || '').toLowerCase() === 'yes';
        const isTransportYes = (row.additionalTransport || '').toLowerCase() === 'yes';
        return `
          <tr data-row-id="${row.id}">
            <td>
              <a href="#" class="req-link td-link-blue" onclick="openIndusProjectTypeDetails('${row.projectType}'); return false;">${row.projectType || ''}</a>
            </td>
            <td>${row.subProjectType || ''}</td>
            <td>${row.tat || ''}</td>
            <td>${row.indusPm || ''}</td>
            <td>${row.indusScm || ''}</td>
            <td>${row.pm || ''}</td>
            <td>${row.mis || ''}</td>
            <td style="color: ${isSurveyYes ? '#2e7d32' : '#d32f2f'}; font-weight: 700;">${row.survey || ''}</td>
            <td style="color: ${isTransportYes ? '#2e7d32' : '#d32f2f'}; font-weight: 700;">${row.additionalTransport || ''}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentIndusSubpage === 'infra') {
      // Render Indus Towers -> Infra Rows (Matching Uploaded Mockup: Infra Category, Infra Description, Uom, Make, Commissioning, I - Map, Status)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>
              <a href="#" class="req-link td-link-blue" onclick="showToast('Infra Category: ${row.infraCategory}'); return false;">${row.infraCategory || ''}</a>
            </td>
            <td>${row.infraDescription || ''}</td>
            <td>${row.uom || ''}</td>
            <td>${row.make || ''}</td>
            <td>${row.commissioning || ''}</td>
            <td>${row.iMap || ''}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentIndusSubpage === 'products') {
      // Render Indus Towers -> Products Rows (Matching Uploaded Mockup)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>${row.itemCode || ''}</td>
            <td>
              <a href="#" class="req-link td-link-blue" onclick="openIndusProductDetails('${row.productName}'); return false;">${row.productName || ''}</a>
            </td>
            <td>${row.productType || ''}</td>
            <td>${row.productDescription || ''}</td>
            <td>${row.hsnSacType || ''}</td>
            <td>${row.hsnSacCode || ''}</td>
            <td class="td-amount">${row.activeRate || ''}</td>
            <td>${row.budgetPercent || ''}</td>
            <td class="td-amount">${row.budgetAmount || ''}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      // Render Indus Towers Site Rows (Matching Mockup)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>${row.circle}</td>
            <td>
              <a href="#" class="req-link site-id-link td-link-blue" onclick="showToast('Site ID: ${row.siteId}'); return false;">${row.siteId}</a>
            </td>
            <td>${row.whId}</td>
            <td>${row.siteName}</td>
            <td>${row.district}</td>
            <td>${row.town || ''}</td>
            <td>${row.latitude}</td>
            <td>${row.longitude}</td>
            <td>${row.transportZone || ''}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    }
  } else if (currentModule === 'master') {
    if (currentMasterSubpage === 'customer') {
      // Render Customer Rows with Clean Text Status Badge & Indus Hyperlink
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = row.status.toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>
              ${row.businessType === 'Indus' ? `<a href="#" class="business-type-link td-link-blue" onclick="openIndusTowersPage(); return false;" title="View Indus Towers details">${row.businessType}</a>` : row.businessType}
            </td>
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
    } else if (currentMasterSubpage === 'vendor') {
      // Render Vendor Rows (Matching Mockup: Vendor Type, Vendor ID, Vendor Name, GST Number, PAN Number, GST Type, Status)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>${row.vendorType}</td>
            <td>${row.vendorId}</td>
            <td>${row.vendorName}</td>
            <td>${row.gstNumber}</td>
            <td>${row.panNumber}</td>
            <td>${row.gstType}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentMasterSubpage === 'products') {
      // Render Products Rows (Matching Mockup: Product Head, Product Code, HSN Code, Product Description, GST Rate, Status)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>
              <a href="#" class="req-link td-link-blue" onclick="showToast('Product Head: ${row.productHead}'); return false;">${row.productHead}</a>
            </td>
            <td>${row.productCode || ''}</td>
            <td>${row.hsnCode || ''}</td>
            <td>${row.productDescription || ''}</td>
            <td>${row.gstRate || ''}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentMasterSubpage === 'expenses') {
      // Render Expenses Rows (Matching Mockup: Expense Head, Expense Code, SAC Code, Expense Description, TDS Rate, GST Rate, Uom, Status)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>
              <a href="#" class="req-link td-link-blue" onclick="showToast('Expense Head: ${row.expenseHead}'); return false;">${row.expenseHead}</a>
            </td>
            <td>${row.expenseCode || ''}</td>
            <td>${row.sacCode || ''}</td>
            <td>${row.expenseDescription || ''}</td>
            <td>${row.tdsRate || ''}</td>
            <td>${row.gstRate || ''}</td>
            <td>${row.uom || ''}</td>
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

  if (toolbar) toolbar.innerHTML = `<div class="toolbar-left">${universalBackBtnHtml}</div><div class="toolbar-right"></div>`;
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
  const btnMessage = document.getElementById('btnCardMessage');
  const contactPanel = document.getElementById('contactDetailsSidePanel');
  const btnLocation = document.getElementById('btnCardLocation');
  const locationPanel = document.getElementById('locationDetailsSidePanel');
  const btnCloseInfra = document.getElementById('btnCloseInfraForm');
  const btnInfraMessage = document.getElementById('btnInfraCardMessage');
  const btnCloseSite = document.getElementById('btnCloseSiteForm');
  const btnSiteMessage = document.getElementById('btnSiteCardMessage');
  const btnSubmitSite = document.getElementById('btnSubmitSite');

  if (btnClose) btnClose.addEventListener('click', closeSideForm);
  if (btnCloseInfra) btnCloseInfra.addEventListener('click', closeSideForm);
  if (btnCloseSite) btnCloseSite.addEventListener('click', closeSideForm);
  if (btnSubmitSite) btnSubmitSite.addEventListener('click', handleFormSave);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSideForm();
    });
  }

  // Toggle Contact & Mail Side Message Popup Next to Add Customer Card
  if (btnMessage && contactPanel) {
    btnMessage.addEventListener('click', (e) => {
      e.stopPropagation();
      if (locationPanel) locationPanel.style.display = 'none';
      const isHidden = contactPanel.style.display === 'none' || contactPanel.style.display === '';
      contactPanel.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        showToast('Contact & Communication popup opened');
      } else {
        showToast('Contact popup closed');
      }
    });
  }

  // Toggle Contact & Mail Side Message Popup Next to Add Infra Card
  if (btnInfraMessage && contactPanel) {
    btnInfraMessage.addEventListener('click', (e) => {
      e.stopPropagation();
      if (locationPanel) locationPanel.style.display = 'none';
      const isHidden = contactPanel.style.display === 'none' || contactPanel.style.display === '';
      contactPanel.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        showToast('Contact & Communication popup opened');
      } else {
        showToast('Contact popup closed');
      }
    });
  }

  // Toggle Contact & Mail Side Message Popup Next to Add Site Card
  if (btnSiteMessage && contactPanel) {
    btnSiteMessage.addEventListener('click', (e) => {
      e.stopPropagation();
      if (locationPanel) locationPanel.style.display = 'none';
      const isHidden = contactPanel.style.display === 'none' || contactPanel.style.display === '';
      contactPanel.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        showToast('Contact & Communication popup opened');
      } else {
        showToast('Contact popup closed');
      }
    });
  }

  // Toggle Location Side Message Popup Next to Add Customer Card
  if (btnLocation && locationPanel) {
    btnLocation.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contactPanel) contactPanel.style.display = 'none';
      const isHidden = locationPanel.style.display === 'none' || locationPanel.style.display === '';
      locationPanel.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        showToast('Office Location details popup opened');
      } else {
        showToast('Location popup closed');
      }
    });
  }

  // Close Contact / Location Message Popups when user clicks outside of them
  document.addEventListener('click', (e) => {
    if (contactPanel && contactPanel.style.display !== 'none' && contactPanel.style.display !== '') {
      const isInsideBtn = (btnMessage && btnMessage.contains(e.target)) || (btnInfraMessage && btnInfraMessage.contains(e.target));
      if (!contactPanel.contains(e.target) && !isInsideBtn) {
        contactPanel.style.display = 'none';
      }
    }
    if (locationPanel && locationPanel.style.display !== 'none' && locationPanel.style.display !== '') {
      if (!locationPanel.contains(e.target) && !btnLocation.contains(e.target)) {
        locationPanel.style.display = 'none';
      }
    }
  });

  // Contact Toolbar: CSV Upload & Plus Add Row
  const btnCsvUpload = document.getElementById('btnContactCsvUpload');
  const btnAddRow = document.getElementById('btnContactAddRow');
  const tblContactBody = document.querySelector('#tblContactPopup tbody');

  if (btnCsvUpload) {
    btnCsvUpload.addEventListener('click', () => {
      showToast('Contact CSV import ready');
    });
  }

  if (btnAddRow && tblContactBody) {
    btnAddRow.addEventListener('click', () => {
      const newTr = document.createElement('tr');
      newTr.innerHTML = `
        <td class="td-link-blue" contenteditable="true">New Contact</td>
        <td contenteditable="true">Staff</td>
        <td contenteditable="true">+91 90000 00000</td>
        <td contenteditable="true">new@nexus.org</td>
        <td><span class="status-badge status-active">Active</span></td>
      `;
      tblContactBody.appendChild(newTr);
      showToast('New contact row added to table');
    });
  }

  // Location Toolbar: Plus Add Row
  const btnLocationAddRow = document.getElementById('btnLocationAddRow');
  const tblLocationBody = document.querySelector('#tblLocationPopup tbody');

  if (btnLocationAddRow && tblLocationBody) {
    btnLocationAddRow.addEventListener('click', () => {
      const newTr = document.createElement('tr');
      newTr.innerHTML = `
        <td class="td-link-blue" contenteditable="true">New Office Location</td>
        <td contenteditable="true">13.0000° N</td>
        <td contenteditable="true">80.0000° E</td>
        <td><span class="status-badge status-active">Active</span></td>
      `;
      tblLocationBody.appendChild(newTr);
      showToast('New location row added to table');
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

  // Real Slide Toggle Switch Listener inside Add Infra Form
  const infraStatusToggle = document.getElementById('inpInfraStatusToggle');
  const lblInfraStatus = document.getElementById('lblInfraFormStatus');
  if (infraStatusToggle && lblInfraStatus) {
    infraStatusToggle.addEventListener('change', () => {
      if (infraStatusToggle.checked) {
        lblInfraStatus.textContent = "Active";
        lblInfraStatus.classList.remove('status-off');
      } else {
        lblInfraStatus.textContent = "In - Active";
        lblInfraStatus.classList.add('status-off');
      }
    });
  }

  // Submit / Save Actions
  function handleFormSave() {
    if (currentModule === 'indus_towers') {
      if (currentIndusSubpage === 'project_type_details') {
        if (currentIndusProjectTypeSubpage === 'transport') {
          const itemCode = document.getElementById('inpProjectTransItemCode')?.value || "KTN";
          const itemDescription = document.getElementById('inpProjectTransItemDesc')?.value || "KTN";
          const zoneSelect = document.getElementById('inpProjectTransZone');
          const transportZone = zoneSelect ? zoneSelect.value : "Zone 1";
          const qty = document.getElementById('inpProjectTransQty')?.value || "1";
          const statusToggle = document.getElementById('inpProjectTransStatusToggle');
          const status = (statusToggle && statusToggle.checked) ? "Active" : "In - Active";

          const newRecord = {
            id: `transport-${Date.now()}`,
            itemCode,
            itemDescription,
            transportZone,
            qty,
            status
          };
          indusProjectTransportData.push(newRecord);
          loadIndusDataset();
          applyFiltersAndRender();
          closeSideForm();
          showToast(`Transport item ${itemCode} successfully saved!`);
          return;
        }

        const descriptionInput = document.getElementById('inpProjectTypeDescription')?.value || "KTN";
        const newRecord = {
          id: `proj-desc-${Date.now()}`,
          description: descriptionInput
        };
        indusProjectSurveyData.push(newRecord);
        loadIndusDataset();
        applyFiltersAndRender();
        closeSideForm();
        showToast(`Record ${descriptionInput} successfully saved!`);
        return;
      }

      if (currentIndusSubpage === 'product_details') {
        if (currentIndusProductSubpage === 'rate') {
          const from = document.getElementById('inpProdRateFrom')?.value || "230510678";
          const to = document.getElementById('inpProdRateTo')?.value || "230510678";
          const gbpa = document.getElementById('inpProdRateGbpa')?.value || "230510678";
          const rate = document.getElementById('inpProdRateType')?.value || "Parent";
          const prodRateStatusToggle = document.getElementById('inpProdRateStatusToggle');
          const status = (prodRateStatusToggle && prodRateStatusToggle.checked) ? "Active" : "In - Active";

          const newRecord = {
            id: `prod-rate-${Date.now()}`,
            from,
            to,
            gbpa,
            rate,
            status
          };

          indusProductRateData.push(newRecord);
          loadIndusDataset();
          applyFiltersAndRender();
          closeSideForm();
          showToast(`Rate record successfully saved & added to table!`);
          return;
        }

        if (currentIndusProductSubpage === 'infra') {
          const infraCategory = document.getElementById('inpProdInfraCategory')?.value || "230510678";
          const infraDescription = document.getElementById('inpProdInfraDescription')?.value || "230510678";
          const infraCode = infraCategory;
          const typeSelect = document.getElementById('inpProdInfraType');
          const type = (typeSelect && typeSelect.value !== "Parent / Child") ? typeSelect.value : "Parent";
          const prodInfraStatusToggle = document.getElementById('inpProdInfraStatusToggle');
          const status = (prodInfraStatusToggle && prodInfraStatusToggle.checked) ? "Active" : "In - Active";

          const newRecord = {
            id: `prod-infra-${Date.now()}`,
            infraCode,
            infraCategory,
            infraDescription,
            type,
            status
          };

          indusProductInfraData.push(newRecord);
          loadIndusDataset();
          applyFiltersAndRender();
          closeSideForm();
          showToast(`Infra ${infraCode} successfully saved & added to table!`);
          return;
        }

        if (currentIndusProductSubpage === 'expenses') {
          const expenseHead = document.getElementById('inpProdExpenseHead')?.value || "230510678";
          const expenseCategory = document.getElementById('inpProdExpenseCategory')?.value || "230510678";
          const expenseDescription = document.getElementById('inpProdExpenseDescription')?.value || "230510678";
          const expenseCode = expenseHead;
          const typeSelect = document.getElementById('inpProdExpenseType');
          const type = (typeSelect && typeSelect.value !== "Parent / Child") ? typeSelect.value : "Parent";
          const prodExpenseStatusToggle = document.getElementById('inpProdExpenseStatusToggle');
          const status = (prodExpenseStatusToggle && prodExpenseStatusToggle.checked) ? "Active" : "In - Active";

          const newRecord = {
            id: `prod-exp-${Date.now()}`,
            expenseCode,
            expenseHead,
            expenseCategory,
            expenseDescription,
            type,
            status
          };

          indusProductExpensesData.push(newRecord);
          loadIndusDataset();
          applyFiltersAndRender();
          closeSideForm();
          showToast(`Expense ${expenseCode} successfully saved & added to table!`);
          return;
        }

        const materialHead = document.getElementById('inpMaterialHead')?.value || "230510678";
        const materialCategory = document.getElementById('inpMaterialCategory')?.value || "230510678";
        const materialDescription = document.getElementById('inpMaterialDescription')?.value || "230510678";
        const materialCode = materialHead;
        const typeSelect = document.getElementById('inpMaterialType');
        const type = (typeSelect && typeSelect.value !== "Parent / Child") ? typeSelect.value : "Parent";
        const materialStatusToggle = document.getElementById('inpMaterialStatusToggle');
        const status = (materialStatusToggle && materialStatusToggle.checked) ? "Active" : "In - Active";

        const newRecord = {
          id: `mat-${Date.now()}`,
          materialCode,
          materialHead,
          materialCategory,
          materialDescription,
          type,
          status
        };

        indusProductMaterialsData.push(newRecord);
        loadIndusDataset();
        applyFiltersAndRender();
        closeSideForm();
        showToast(`Material ${materialCode} successfully saved & added to table!`);
        return;
      }

      if (currentIndusSubpage === 'infra') {
        const infraCategory = document.getElementById('inpInfraCategory')?.value || "KTN";
        const infraDescription = document.getElementById('inpInfraDescription')?.value || "KTN";
        const uom = document.getElementById('inpInfraUom')?.value || "R/RL-234567";
        const make = document.getElementById('inpInfraMake')?.value || "R/RL-234567";
        const commissioningToggle = document.getElementById('inpInfraCommissioningToggle');
        const commissioning = (commissioningToggle && commissioningToggle.checked) ? "Yes" : "No";
        const iMapToggle = document.getElementById('inpInfraIMapToggle');
        const iMap = (iMapToggle && iMapToggle.checked) ? "Yes" : "No";
        const infraStatusToggle = document.getElementById('inpInfraStatusToggle');
        const status = (infraStatusToggle && infraStatusToggle.checked) ? "Active" : "In - Active";

        const newRecord = {
          id: `indus-infra-${Date.now()}`,
          infraCategory,
          infraDescription,
          uom,
          make,
          commissioning,
          iMap,
          status
        };

        indusInfraData.push(newRecord);
        loadIndusDataset();
        applyFiltersAndRender();
        closeSideForm();
        showToast(`Infra Category ${infraCategory} successfully saved & added to table!`);
        return;
      }

      const circle = document.getElementById('inpSiteCircle')?.value || document.getElementById('inpInfraCircle')?.value || "KTN";
      const siteId = document.getElementById('inpSiteId')?.value || document.getElementById('inpInfraSiteId')?.value || `23051068${currentDataset.length + 1}`;
      const whId = document.getElementById('inpSiteWhId')?.value || document.getElementById('inpInfraWhId')?.value || "KTN";
      const siteName = document.getElementById('inpSiteName')?.value || document.getElementById('inpInfraSiteName')?.value || "New Site";
      const district = document.getElementById('inpSiteDistrict')?.value || document.getElementById('inpInfraDistrict')?.value || "Chennai";
      const town = document.getElementById('inpSiteTown')?.value || document.getElementById('inpInfraTown')?.value || "";
      const latitude = document.getElementById('inpSiteLattitude')?.value || document.getElementById('inpInfraLatitude')?.value || "13.0000° N";
      const longitude = document.getElementById('inpSiteLongtitude')?.value || document.getElementById('inpInfraLongitude')?.value || "80.0000° E";
      const transportZone = document.getElementById('inpSiteTransportZone')?.value || document.getElementById('inpInfraTransportZone')?.value || "";
      const siteStatusToggle = document.getElementById('inpSiteStatusToggle') || document.getElementById('inpInfraStatusToggle');
      const status = (siteStatusToggle && siteStatusToggle.checked) ? "Active" : "In - Active";

      const newRecord = {
        id: `indus-${Date.now()}`,
        circle,
        siteId,
        whId,
        siteName,
        district,
        town,
        latitude,
        longitude,
        transportZone,
        status
      };

      if (currentIndusSubpage === 'site') indusSiteData.push(newRecord);
      else if (currentIndusSubpage === 'products') indusProductsData.push(newRecord);
      else if (currentIndusSubpage === 'projects') indusProjectsData.push(newRecord);

      loadIndusDataset();
      applyFiltersAndRender();
      closeSideForm();
      showToast(`Site ${siteId} successfully saved & added to table!`);
      return;
    }

    if (currentModule === 'master' && currentMasterSubpage === 'expenses') {
      const expenseHead = document.getElementById('inpExpenseHead')?.value || "230510678";
      const expenseCode = document.getElementById('inpExpenseCode')?.value || "";
      const sacCode = document.getElementById('inpExpenseSac')?.value || "";
      const expenseDescription = document.getElementById('inpExpenseDesc')?.value || "";
      const uom = document.getElementById('inpExpenseUom')?.value || "";
      const gstRate = document.getElementById('inpExpenseGstRate')?.value || "0% / 5 % / 12% / 18%";
      const tdsRate = document.getElementById('inpExpenseTdsRate')?.value || "1% / 2% / 10%";
      const expenseStatusToggle = document.getElementById('inpExpenseStatusToggle');
      const status = (expenseStatusToggle && expenseStatusToggle.checked) ? "Active" : "In - Active";

      const newRecord = {
        id: `exp-${Date.now()}`,
        expenseHead,
        expenseCode,
        sacCode,
        expenseDescription,
        tdsRate,
        gstRate,
        uom,
        status
      };

      masterExpensesData.push(newRecord);
      currentDataset = [...masterExpensesData];
      applyFiltersAndRender();
      closeSideForm();
      showToast(`Expense ${expenseHead} successfully saved & added to table!`);
      return;
    }

    if (currentModule === 'master' && currentMasterSubpage === 'products') {
      const productHead = document.getElementById('inpProductHead')?.value || "230510678";
      const productCode = document.getElementById('inpProductCode')?.value || "";
      const hsnCode = document.getElementById('inpProductHsn')?.value || "";
      const productDescription = document.getElementById('inpProductDesc')?.value || "";
      const gstRate = document.getElementById('inpProductGstRate')?.value || "18%";
      const productStatusToggle = document.getElementById('inpProductStatusToggle');
      const status = (productStatusToggle && productStatusToggle.checked) ? "Active" : "In - Active";

      const newRecord = {
        id: `prod-${Date.now()}`,
        productHead,
        productCode,
        hsnCode,
        productDescription,
        gstRate,
        status
      };

      masterProductsData.push(newRecord);
      currentDataset = [...masterProductsData];
      applyFiltersAndRender();
      closeSideForm();
      showToast(`Product ${productHead} successfully saved & added to table!`);
      return;
    }

    if (currentModule === 'master' && currentMasterSubpage === 'vendor') {
      const vendorName = document.getElementById('inpVendorName').value || "R/RL-234567";
      const vendorType = document.getElementById('inpVendorType').value || "Supply / Service";
      const gstType = document.getElementById('inpVendorGstType').value || "SGST";
      const gstNumber = document.getElementById('inpVendorGstNumber').value || "33ASMPM8643F";
      const panNumber = document.getElementById('inpVendorPanNumber').value || "ASMPM8643F";
      const vendorStatusToggle = document.getElementById('inpVendorStatusToggle');
      const status = (vendorStatusToggle && vendorStatusToggle.checked) ? "Active" : "In - Active";
      const vendorId = `23051068${masterVendorData.length + 1}`;

      const newRecord = {
        id: `vend-${Date.now()}`,
        vendorType,
        vendorId,
        vendorName,
        gstNumber,
        panNumber,
        gstType,
        status
      };

      masterVendorData.push(newRecord);
      currentDataset = [...masterVendorData];
      applyFiltersAndRender();
      closeSideForm();
      showToast(`Vendor ${vendorId} successfully saved & added to table!`);
      return;
    }

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

  const btnSubmitCustomer = document.getElementById('btnSubmitCustomer');
  const btnSubmitInfra = document.getElementById('btnSubmitInfra');
  const btnSubmitProject = document.getElementById('btnSubmitProject');
  const btnSubmitMaterials = document.getElementById('btnSubmitMaterials');
  const btnSubmitProductExpense = document.getElementById('btnSubmitProductExpense');
  const btnSubmitProductInfra = document.getElementById('btnSubmitProductInfra');
  const btnSubmitProductRate = document.getElementById('btnSubmitProductRate');
  const btnSubmitProjectType = document.getElementById('btnSubmitProjectType');
  const btnSubmitProjectTransport = document.getElementById('btnSubmitProjectTransport');
  const btnSubmitVendor = document.getElementById('btnSubmitVendor');
  const btnSubmitProduct = document.getElementById('btnSubmitProduct');
  const btnSubmitExpense = document.getElementById('btnSubmitExpense');
  if (btnSubmitCustomer) btnSubmitCustomer.addEventListener('click', handleFormSave);
  if (btnSubmitInfra) btnSubmitInfra.addEventListener('click', handleFormSave);
  if (btnSubmitProject) btnSubmitProject.addEventListener('click', handleFormSave);
  if (btnSubmitMaterials) btnSubmitMaterials.addEventListener('click', handleFormSave);
  if (btnSubmitProductExpense) btnSubmitProductExpense.addEventListener('click', handleFormSave);
  if (btnSubmitProductInfra) btnSubmitProductInfra.addEventListener('click', handleFormSave);
  if (btnSubmitProductRate) btnSubmitProductRate.addEventListener('click', handleFormSave);
  if (btnSubmitProjectType) btnSubmitProjectType.addEventListener('click', handleFormSave);
  if (btnSubmitProjectTransport) btnSubmitProjectTransport.addEventListener('click', handleFormSave);
  if (btnSubmitVendor) btnSubmitVendor.addEventListener('click', handleFormSave);
  if (btnSubmitProduct) btnSubmitProduct.addEventListener('click', handleFormSave);
  if (btnSubmitExpense) btnSubmitExpense.addEventListener('click', handleFormSave);

  const btnCloseVendorForm = document.getElementById('btnCloseVendorForm');
  if (btnCloseVendorForm) btnCloseVendorForm.addEventListener('click', closeSideForm);

  const btnCloseProductForm = document.getElementById('btnCloseProductForm');
  if (btnCloseProductForm) btnCloseProductForm.addEventListener('click', closeSideForm);

  const btnCloseExpenseForm = document.getElementById('btnCloseExpenseForm');
  if (btnCloseExpenseForm) btnCloseExpenseForm.addEventListener('click', closeSideForm);

  const btnCloseProjectForm = document.getElementById('btnCloseProjectForm');
  if (btnCloseProjectForm) btnCloseProjectForm.addEventListener('click', closeSideForm);

  const btnCloseMaterialsForm = document.getElementById('btnCloseMaterialsForm');
  if (btnCloseMaterialsForm) btnCloseMaterialsForm.addEventListener('click', closeSideForm);

  const btnCloseProductExpenseForm = document.getElementById('btnCloseProductExpenseForm');
  if (btnCloseProductExpenseForm) btnCloseProductExpenseForm.addEventListener('click', closeSideForm);

  const btnCloseProductInfraForm = document.getElementById('btnCloseProductInfraForm');
  if (btnCloseProductInfraForm) btnCloseProductInfraForm.addEventListener('click', closeSideForm);

  const btnCloseProductRateForm = document.getElementById('btnCloseProductRateForm');
  if (btnCloseProductRateForm) btnCloseProductRateForm.addEventListener('click', closeSideForm);

  const btnCloseProjectTypeForm = document.getElementById('btnCloseProjectTypeForm');
  if (btnCloseProjectTypeForm) btnCloseProjectTypeForm.addEventListener('click', closeSideForm);

  const btnCloseProjectTransportForm = document.getElementById('btnCloseProjectTransportForm');
  if (btnCloseProjectTransportForm) btnCloseProjectTransportForm.addEventListener('click', closeSideForm);

  const btnProjectTransportEdit = document.getElementById('btnProjectTransportCardEdit');
  if (btnProjectTransportEdit) {
    btnProjectTransportEdit.addEventListener('click', () => {
      showToast('Project Transport edit info mode activated');
    });
  }

  const btnProjectTypeEdit = document.getElementById('btnProjectTypeCardEdit');
  if (btnProjectTypeEdit) {
    btnProjectTypeEdit.addEventListener('click', () => {
      showToast('Project Type edit info mode activated');
    });
  }

  const btnProductRateEdit = document.getElementById('btnProductRateCardEdit');
  if (btnProductRateEdit) {
    btnProductRateEdit.addEventListener('click', () => {
      showToast('Product Rate edit info mode activated');
    });
  }

  const btnProductInfraEdit = document.getElementById('btnProductInfraCardEdit');
  if (btnProductInfraEdit) {
    btnProductInfraEdit.addEventListener('click', () => {
      showToast('Product Infra edit info mode activated');
    });
  }

  const btnProductExpenseEdit = document.getElementById('btnProductExpenseCardEdit');
  if (btnProductExpenseEdit) {
    btnProductExpenseEdit.addEventListener('click', () => {
      showToast('Product Expense edit info mode activated');
    });
  }

  const btnMaterialsEdit = document.getElementById('btnMaterialsCardEdit');
  if (btnMaterialsEdit) {
    btnMaterialsEdit.addEventListener('click', () => {
      showToast('Materials edit info mode activated');
    });
  }

  const btnProjectEdit = document.getElementById('btnProjectCardEdit');
  if (btnProjectEdit) {
    btnProjectEdit.addEventListener('click', () => {
      showToast('Project Type edit info mode activated');
    });
  }

  const btnExpenseEdit = document.getElementById('btnExpenseCardEdit');
  if (btnExpenseEdit) {
    btnExpenseEdit.addEventListener('click', () => {
      showToast('Expense edit info mode activated');
    });
  }

  const btnProductEdit = document.getElementById('btnProductCardEdit');
  if (btnProductEdit) {
    btnProductEdit.addEventListener('click', () => {
      showToast('Product edit info mode activated');
    });
  }

  const btnVendorMessage = document.getElementById('btnVendorCardMessage');
  if (btnVendorMessage && contactPanel) {
    btnVendorMessage.addEventListener('click', (e) => {
      e.stopPropagation();
      if (locationPanel) locationPanel.style.display = 'none';
      const isHidden = contactPanel.style.display === 'none' || contactPanel.style.display === '';
      contactPanel.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        showToast('Vendor Contact & Communication details opened');
      } else {
        showToast('Vendor Contact popup closed');
      }
    });
  }

  const bankPanel = document.getElementById('bankDetailsSidePanel');
  const btnCloseBankCard = document.getElementById('btnCloseBankCard');
  const btnBankCardEdit = document.getElementById('btnBankCardEdit');
  let isBankEditable = false;

  function setBankEditableState(editable) {
    isBankEditable = editable;
    const bankFields = document.querySelectorAll('.bank-field-control');
    const bankStatusToggle = document.getElementById('inpBankStatusToggle');

    bankFields.forEach(field => {
      if (editable) {
        field.removeAttribute('readonly');
      } else {
        field.setAttribute('readonly', 'true');
      }
    });

    if (bankStatusToggle) {
      bankStatusToggle.disabled = !editable;
    }

    if (btnBankCardEdit) {
      if (editable) {
        btnBankCardEdit.classList.add('active-edit-mode');
      } else {
        btnBankCardEdit.classList.remove('active-edit-mode');
      }
    }
  }

  if (btnCloseBankCard && bankPanel) {
    btnCloseBankCard.addEventListener('click', () => {
      bankPanel.style.display = 'none';
      setBankEditableState(false);
    });
  }

  if (btnBankCardEdit) {
    btnBankCardEdit.addEventListener('click', () => {
      setBankEditableState(!isBankEditable);
      if (isBankEditable) {
        document.getElementById('inpBankAccountName')?.focus();
        showToast('Bank details are now editable');
      } else {
        showToast('Bank details saved & locked');
      }
    });
  }

  const btnVendorBank = document.getElementById('btnVendorCardBank');
  if (btnVendorBank && bankPanel) {
    btnVendorBank.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contactPanel) contactPanel.style.display = 'none';
      if (locationPanel) locationPanel.style.display = 'none';
      const isHidden = bankPanel.style.display === 'none' || bankPanel.style.display === '';
      bankPanel.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        const vendorNameVal = document.getElementById('inpVendorName')?.value;
        const titleBadge = document.getElementById('lblBankVendorTitle');
        if (titleBadge) titleBadge.textContent = vendorNameVal || "Vendor Name";
        setBankEditableState(false);
        showToast('Vendor Bank details opened (Read-only)');
      } else {
        showToast('Bank details closed');
      }
    });
  }

  const btnVendorEdit = document.getElementById('btnVendorCardEdit');
  if (btnVendorEdit) {
    btnVendorEdit.addEventListener('click', () => {
      showToast('Vendor edit info mode activated');
    });
  }

  // Close Contact / Location / Bank Message Popups when user clicks outside of them
  document.addEventListener('click', (e) => {
    if (contactPanel && contactPanel.style.display !== 'none' && contactPanel.style.display !== '') {
      const isInsideBtn = (btnMessage && btnMessage.contains(e.target)) || (btnInfraMessage && btnInfraMessage.contains(e.target)) || (btnVendorMessage && btnVendorMessage.contains(e.target));
      if (!contactPanel.contains(e.target) && !isInsideBtn) {
        contactPanel.style.display = 'none';
      }
    }
    if (locationPanel && locationPanel.style.display !== 'none' && locationPanel.style.display !== '') {
      if (!locationPanel.contains(e.target) && !btnLocation.contains(e.target)) {
        locationPanel.style.display = 'none';
      }
    }
    if (bankPanel && bankPanel.style.display !== 'none' && bankPanel.style.display !== '') {
      if (!bankPanel.contains(e.target) && !(btnVendorBank && btnVendorBank.contains(e.target))) {
        bankPanel.style.display = 'none';
        setBankEditableState(false);
      }
    }
  });
}

function openSideForm() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const addCustomerCard = document.getElementById('addCustomerCard');
  const addSiteCard = document.getElementById('addSiteCard');
  const addInfraCard = document.getElementById('addInfraCard');
  const addProjectCard = document.getElementById('addProjectCard');
  const addMaterialsCard = document.getElementById('addMaterialsCard');
  const addProductExpenseCard = document.getElementById('addProductExpenseCard');
  const addProductInfraCard = document.getElementById('addProductInfraCard');
  const addProductRateCard = document.getElementById('addProductRateCard');
  const addProjectTypeCard = document.getElementById('addProjectTypeCard');
  const addProjectTransportCard = document.getElementById('addProjectTransportCard');
  const addVendorCard = document.getElementById('addVendorCard');
  const addProductCard = document.getElementById('addProductCard');
  const addExpenseCard = document.getElementById('addExpenseCard');

  if (addCustomerCard) addCustomerCard.style.display = 'none';
  if (addSiteCard) addSiteCard.style.display = 'none';
  if (addInfraCard) addInfraCard.style.display = 'none';
  if (addProjectCard) addProjectCard.style.display = 'none';
  if (addMaterialsCard) addMaterialsCard.style.display = 'none';
  if (addProductExpenseCard) addProductExpenseCard.style.display = 'none';
  if (addProductInfraCard) addProductInfraCard.style.display = 'none';
  if (addProductRateCard) addProductRateCard.style.display = 'none';
  if (addProjectTypeCard) addProjectTypeCard.style.display = 'none';
  if (addProjectTransportCard) addProjectTransportCard.style.display = 'none';
  if (addVendorCard) addVendorCard.style.display = 'none';
  if (addProductCard) addProductCard.style.display = 'none';
  if (addExpenseCard) addExpenseCard.style.display = 'none';

  if (currentModule === 'indus_towers') {
    if (currentIndusSubpage === 'project_type_details') {
      if (currentIndusProjectTypeSubpage === 'transport') {
        if (addProjectTransportCard) addProjectTransportCard.style.display = 'block';
      } else {
        if (addProjectTypeCard) addProjectTypeCard.style.display = 'block';
      }
    } else if (currentIndusSubpage === 'product_details') {
      if (currentIndusProductSubpage === 'rate') {
        if (addProductRateCard) addProductRateCard.style.display = 'block';
      } else if (currentIndusProductSubpage === 'infra') {
        if (addProductInfraCard) addProductInfraCard.style.display = 'block';
      } else if (currentIndusProductSubpage === 'expenses') {
        if (addProductExpenseCard) addProductExpenseCard.style.display = 'block';
      } else {
        if (addMaterialsCard) addMaterialsCard.style.display = 'block';
      }
    } else if (currentIndusSubpage === 'projects') {
      if (addProjectCard) addProjectCard.style.display = 'block';
    } else if (currentIndusSubpage === 'infra') {
      if (addInfraCard) addInfraCard.style.display = 'block';
    } else if (currentIndusSubpage === 'site') {
      if (addSiteCard) addSiteCard.style.display = 'block';
    } else {
      if (addSiteCard) addSiteCard.style.display = 'block';
    }
  } else if (currentModule === 'master' && currentMasterSubpage === 'vendor') {
    if (addVendorCard) addVendorCard.style.display = 'block';
  } else if (currentModule === 'master' && currentMasterSubpage === 'products') {
    if (addProductCard) addProductCard.style.display = 'block';
  } else if (currentModule === 'master' && currentMasterSubpage === 'expenses') {
    if (addExpenseCard) addExpenseCard.style.display = 'block';
  } else {
    if (addCustomerCard) addCustomerCard.style.display = 'block';
  }

  overlay.style.display = 'flex';
}

function closeSideForm() {
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
  const contactPanel = document.getElementById('contactDetailsSidePanel');
  if (contactPanel) contactPanel.style.display = 'none';
  const locationPanel = document.getElementById('locationDetailsSidePanel');
  if (locationPanel) locationPanel.style.display = 'none';
  const bankPanel = document.getElementById('bankDetailsSidePanel');
  if (bankPanel) bankPanel.style.display = 'none';
}

// ==========================================================================
// 7. EXCEL-STYLE FILTER ENGINE
// ==========================================================================
function initExcelFilterSystem() {
  const dropdown = document.getElementById('excelFilterDropdown');
  const btnCancel = document.getElementById('btnCancelFilter');
  const btnApply = document.getElementById('btnApplyFilter');
  const searchInput = document.getElementById('filterSearchInput');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

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
    status: "Status",
    infraCategory: "Infra Category",
    infraDescription: "Infra Description",
    make: "Make",
    commissioning: "Commissioning",
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
    designation: "Designation",
    contactNumber: "Contact Number",
    email: "E-Mail",
    productHead: "Product Head",
    productCode: "Product Code",
    hsnCode: "HSN Code",
    productDescription: "Product Description",
    gstRate: "GST Rate",
    expenseHead: "Expense Head",
    expenseCode: "Expense Code",
    sacCode: "SAC Code",
    expenseDescription: "Expense Description",
    tdsRate: "TDS Rate",
    uom: "Uom",
    submittedBy: "Submitted BY",
    submitBy: "Submit By",
    submissionDate: "Submission Date",
    approvedBy: "Approved By",
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
  currentDataset = currentDataset.map(row => {
    if (row.id === rowId) {
      return { ...row, selected: !row.selected };
    }
    return { ...row, selected: false };
  });
  applyFiltersAndRender();
  updateDeleteButtonVisibility();
};

function updateDeleteButtonVisibility() {
  const btnDel = document.getElementById('btnDeleteAction');
  if (btnDel) {
    const hasSelected = currentDataset.some(r => r.selected);
    btnDel.style.display = hasSelected ? 'flex' : 'none';
  }
}

window.handleReqClick = function(reqCode) {
  showToast(`Opening requisition details: ${reqCode}`);
};

window.handleEmpClick = function(empName) {
  showToast(`Opening employee profile: ${empName}`);
};

function exportToCsv() {
  let headers = [];
  let rows = [];

  if (currentModule === 'indus_towers') {
    if (currentIndusSubpage === 'infra') {
      headers = ["Infra Category", "Infra Description", "Uom", "Make", "Commissioning", "I - Map", "Status"];
      rows = filteredDataset.map(r => [r.infraCategory, r.infraDescription, r.uom, r.make, r.commissioning, r.iMap, r.status]);
    } else if (currentIndusSubpage === 'products') {
      headers = ["Item Code", "Product Name", "Product Type", "Product Description", "HSN / SAC Type", "HSN / SAC Code", "Active Rate", "Budget %", "Budget Amount", "Status"];
      rows = filteredDataset.map(r => [r.itemCode, r.productName, r.productType, r.productDescription, r.hsnSacType, r.hsnSacCode, r.activeRate, r.budgetPercent, r.budgetAmount, r.status]);
    } else {
      headers = ["Circle", "Site ID", "WH ID", "Site Name", "District", "Town", "Lattitude", "Longtitude", "Transport Zone", "Status"];
      rows = filteredDataset.map(r => [r.circle, r.siteId, r.whId, r.siteName, r.district, r.town, r.latitude, r.longitude, r.transportZone, r.status]);
    }
  } else if (currentModule === 'master') {
    if (currentMasterSubpage === 'customer') {
      headers = ["Business Type", "Customer ID", "Customer Name", "GST Number", "GST Type", "Invoice Type", "Status"];
      rows = filteredDataset.map(r => [r.businessType, r.customerId, r.customerName, r.gstNumber, r.gstType, r.invoiceType, r.status]);
    } else if (currentMasterSubpage === 'vendor') {
      headers = ["Vendor Type", "Vendor ID", "Vendor Name", "GST Number", "PAN Number", "GST Type", "Status"];
      rows = filteredDataset.map(r => [r.vendorType, r.vendorId, r.vendorName, r.gstNumber, r.panNumber, r.gstType, r.status]);
    } else if (currentMasterSubpage === 'products') {
      headers = ["Product Head", "Product Code", "HSN Code", "Product Description", "GST Rate", "Status"];
      rows = filteredDataset.map(r => [r.productHead, r.productCode, r.hsnCode, r.productDescription, r.gstRate, r.status]);
    } else if (currentMasterSubpage === 'expenses') {
      headers = ["Expense Head", "Expense Code", "SAC Code", "Expense Description", "TDS Rate", "GST Rate", "Uom", "Status"];
      rows = filteredDataset.map(r => [r.expenseHead, r.expenseCode, r.sacCode, r.expenseDescription, r.tdsRate, r.gstRate, r.uom, r.status]);
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
  link.setAttribute("download", `nexus_${currentModule}_${currentIndusSubpage || currentMasterSubpage || currentWorklistView}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported ${(currentIndusSubpage || currentMasterSubpage).toUpperCase()} to CSV successfully!`);
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
