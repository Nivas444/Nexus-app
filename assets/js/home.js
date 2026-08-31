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
    businessType: "Telecom",
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
    productHead: "Telecom Tower Mast",
    productCode: "PRD-TTM-001",
    hsnCode: "73082019",
    productDescription: "40M Galvanized Tubular Telecom Tower Mast Structure",
    uom: "Nos",
    msq: "10",
    moq: "2",
    stockPrices: "4,50,000.00",
    oh: "2%",
    margin: "10%",
    gstRate: "18%",
    status: "Active"
  },
  {
    id: "prod-2",
    productHead: "Optical Fiber Cable",
    productCode: "PRD-OFC-002",
    hsnCode: "85447090",
    productDescription: "24-Core Armored Outdoor Single-Mode Fiber Cable",
    uom: "Mtr",
    msq: "5000",
    moq: "500",
    stockPrices: "85.00",
    oh: "1%",
    margin: "5%",
    gstRate: "18%",
    status: "Active"
  },
  {
    id: "prod-3",
    productHead: "Power Distribution Unit",
    productCode: "PRD-PDU-003",
    hsnCode: "85371000",
    productDescription: "AC/DC Dual Power Distribution Panel with Surge Protection",
    uom: "Pcs",
    msq: "25",
    moq: "5",
    stockPrices: "32,000.00",
    oh: "2%",
    margin: "8%",
    gstRate: "18%",
    status: "In - Active"
  }
];

/// Master -> Expenses Dataset (Matching Uploaded Mockup)
const masterExpensesData = [
  {
    id: "exp-1",
    expenseHead: "Project",
    expenseCode: "EXP-PRJ-001",
    sacCode: "998313",
    expenseDescription: "Site Infrastructure & Telecom Tower Installation",
    tdsRate: "2%",
    gstRate: "18%",
    uom: "Pcs",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-2",
    expenseHead: "Purchase",
    expenseCode: "EXP-PUR-002",
    sacCode: "998719",
    expenseDescription: "Procurement of Cables, Hardware & Consumables",
    tdsRate: "1%",
    gstRate: "18%",
    uom: "Nos",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-3",
    expenseHead: "Employee",
    expenseCode: "EXP-EMP-003",
    sacCode: "998519",
    expenseDescription: "Field Staff Allowances, Travel & Reimbursements",
    tdsRate: "10%",
    gstRate: "0%",
    uom: "Month",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-4",
    expenseHead: "Transport",
    expenseCode: "EXP-TRN-004",
    sacCode: "996511",
    expenseDescription: "Logistics, Vehicle Freight & Heavy Cargo Dispatch",
    tdsRate: "2%",
    gstRate: "5%",
    uom: "Nos",
    rcm: "Yes",
    status: "Active"
  },
  {
    id: "exp-5",
    expenseHead: "Admin",
    expenseCode: "EXP-ADM-005",
    sacCode: "998599",
    expenseDescription: "Office Maintenance, Utilities & Facility Operations",
    tdsRate: "10%",
    gstRate: "18%",
    uom: "Month",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-6",
    expenseHead: "Accounts",
    expenseCode: "EXP-ACC-006",
    sacCode: "998222",
    expenseDescription: "Statutory Audit, Legal & Financial Consultancy",
    tdsRate: "10%",
    gstRate: "18%",
    uom: "Nos",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-7",
    expenseHead: "Statutory",
    expenseCode: "EXP-STA-007",
    sacCode: "999112",
    expenseDescription: "Government Licensing, Spectrum & Municipal Filings",
    tdsRate: "0%",
    gstRate: "0%",
    uom: "Nos",
    rcm: "No",
    status: "Active"
  }
];

// Worklist -> Project Payment Details Dataset (Matching Uploaded Mockup)
let selectedProjectPaymentReq = "R/RL-234567";
const worklistProjectPaymentItems = [
  {
    id: "wpp-1",
    selected: true,
    expenseType: "PO",
    boqName: "JCB Charges",
    uom: "",
    qty: "",
    rateRequested: "",
    rateValidated: "",
    rateApproved: "",
    amountBasic: "",
    amountGst: "",
    amountTotal: ""
  },
  {
    id: "wpp-2",
    selected: true,
    expenseType: "Non - PO",
    boqName: "",
    uom: "",
    qty: "",
    rateRequested: "",
    rateValidated: "",
    rateApproved: "",
    amountBasic: "",
    amountGst: "",
    amountTotal: ""
  },
  {
    id: "wpp-3",
    selected: true,
    expenseType: "",
    boqName: "",
    uom: "",
    qty: "",
    rateRequested: "",
    rateValidated: "",
    rateApproved: "",
    amountBasic: "",
    amountGst: "",
    amountTotal: ""
  }
];

// Worklist -> Payment Dataset (All 7 Expense Heads: Project, Purchase, Employee, Transport, Admin, Accounts, Statutory)
const paymentData = [
  {
    id: "pay-1",
    submitBy: "R/RL-234567",
    submissionDate: "12/08/2026 10:15:30",
    approvedBy: "R/RL-234567",
    expenseHead: "Project",
    transferTo: "Guindy Hub",
    approvedAmount: "1,50,000.00",
    transferredAmount: "1,00,000.00",
    payableAmount: "50,000.00",
    ageing: 12,
    selected: false
  },
  {
    id: "pay-2",
    submitBy: "R/RL-234568",
    submissionDate: "14/08/2026 11:30:00",
    approvedBy: "R/RL-234567",
    expenseHead: "Purchase",
    transferTo: "Ambattur Central",
    approvedAmount: "3,45,000.00",
    transferredAmount: "2,00,000.00",
    payableAmount: "1,45,000.00",
    ageing: 10,
    selected: false
  },
  {
    id: "pay-3",
    submitBy: "R/RL-234570",
    submissionDate: "16/08/2026 14:20:15",
    approvedBy: "R/RL-234589",
    expenseHead: "Employee",
    transferTo: "Chennai HQ",
    approvedAmount: "45,000.00",
    transferredAmount: "20,000.00",
    payableAmount: "25,000.00",
    ageing: 8,
    selected: false
  },
  {
    id: "pay-4",
    submitBy: "R/RL-234572",
    submissionDate: "18/08/2026 09:45:00",
    approvedBy: "R/RL-234589",
    expenseHead: "Transport",
    transferTo: "Madurai Depot",
    approvedAmount: "85,000.00",
    transferredAmount: "50,000.00",
    payableAmount: "35,000.00",
    ageing: 6,
    selected: false
  },
  {
    id: "pay-5",
    submitBy: "R/RL-234575",
    submissionDate: "20/08/2026 16:10:45",
    approvedBy: "R/RL-234567",
    expenseHead: "Admin",
    transferTo: "Coimbatore Facility",
    approvedAmount: "28,500.00",
    transferredAmount: "14,000.00",
    payableAmount: "14,500.00",
    ageing: 5,
    selected: false
  },
  {
    id: "pay-6",
    submitBy: "R/RL-234578",
    submissionDate: "22/08/2026 12:00:20",
    approvedBy: "R/RL-234589",
    expenseHead: "Accounts",
    transferTo: "Corporate Bank Escrow",
    approvedAmount: "65,000.00",
    transferredAmount: "30,000.00",
    payableAmount: "35,000.00",
    ageing: 4,
    selected: false
  },
  {
    id: "pay-7",
    submitBy: "R/RL-234580",
    submissionDate: "24/08/2026 15:30:10",
    approvedBy: "R/RL-234567",
    expenseHead: "Statutory",
    transferTo: "Govt Treasury Disbursal",
    approvedAmount: "2,10,000.00",
    transferredAmount: "1,50,000.00",
    payableAmount: "60,000.00",
    ageing: 3,
    selected: false
  },
  {
    id: "pay-8",
    submitBy: "R/RL-234583",
    submissionDate: "25/08/2026 10:05:00",
    approvedBy: "R/RL-234589",
    expenseHead: "Project",
    transferTo: "Salem Station",
    approvedAmount: "1,80,000.00",
    transferredAmount: "1,20,000.00",
    payableAmount: "60,000.00",
    ageing: 2,
    selected: false
  },
  {
    id: "pay-9",
    submitBy: "R/RL-234585",
    submissionDate: "26/08/2026 13:40:00",
    approvedBy: "R/RL-234567",
    expenseHead: "Purchase",
    transferTo: "Tiruchirappalli Yard",
    approvedAmount: "95,000.00",
    transferredAmount: "60,000.00",
    payableAmount: "35,000.00",
    ageing: 2,
    selected: false
  },
  {
    id: "pay-10",
    submitBy: "R/RL-234588",
    submissionDate: "27/08/2026 17:15:25",
    approvedBy: "R/RL-234589",
    expenseHead: "Transport",
    transferTo: "Tirunelveli Terminal",
    approvedAmount: "52,000.00",
    transferredAmount: "30,000.00",
    payableAmount: "22,000.00",
    ageing: 1,
    selected: false
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



// ==========================================================================
// STATE MANAGEMENT (Default landing page: Worklist -> Payment)
// ==========================================================================
let currentModule = 'worklist'; // 'worklist' as default on login, or 'master'
let currentWorklistView = 'payment'; // 'payment' or 'po'
let currentMasterSubpage = 'employee'; // 'employee', 'customer', 'vendor', 'products', 'expenses'

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
      currentMasterSubpage = 'employee';
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
    if (viewParam === 'payment' || viewParam === 'po' || viewParam === 'project_payment') {
      currentWorklistView = viewParam;
    } else {
      currentWorklistView = 'payment';
    }
  } else {
    // Default after login is Worklist -> Payment
    currentModule = 'worklist';
    if (viewParam === 'payment' || viewParam === 'po' || viewParam === 'project_payment') {
      currentWorklistView = viewParam;
    } else {
      currentWorklistView = 'payment';
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

  if (moduleName === 'master') {
    currentMasterSubpage = 'employee';
  } else if (moduleName === 'worklist') {
    currentWorklistView = 'payment';
  }

  document.querySelectorAll('.nav-icon-item').forEach(btn => {
    btn.classList.remove('active-nav-tab');
  });
  // indus_towers is a sub-section of master — glow the Master icon for both
  const navModuleSwitch = (moduleName === 'indus_towers') ? 'master' : moduleName;
  const activeBtn = document.querySelector(`.nav-icon-item[data-module="${navModuleSwitch}"]`);
  if (activeBtn) activeBtn.classList.add('active-nav-tab');

  updateURL();
  renderApp();

  const moduleTitles = {
    master: "Master (Company)",
    indus_towers: "Telecom",
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
      showToast('Returned to GBPA');
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
  } else if (currentModule === 'worklist') {
    if (currentWorklistView === 'project_payment') {
      isProjectPaymentEditing = false;
      currentWorklistView = 'payment';
      showToast('Returned to Payment Page');
    } else {
      currentModule = 'master';
      currentMasterSubpage = 'customer';
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
  // indus_towers is a sub-section of master — glow the Master icon for both
  const navModule = (currentModule === 'indus_towers') ? 'master' : currentModule;
  const activeNavBtn = document.querySelector(`.nav-icon-item[data-module="${navModule}"]`);
  if (activeNavBtn) activeNavBtn.classList.add('active-nav-tab');

  if (currentModule === 'master') {
    if (bannerTitle) bannerTitle.innerHTML = `<a href="#" class="banner-title-link banner-title-underline" onclick="openIndusTowerPageCard(); return false;" title="View Company Name">Company Name</a>`;
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
      if (bannerTitle) bannerTitle.textContent = "Telecom";
    }
    loadIndusDataset();
    renderIndusToolbar();
    renderIndusTableHead();
    renderIndusFooter();
  } else if (currentModule === 'worklist') {
    if (bannerTitle) {
      if (currentWorklistView === 'project_payment') {
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">${selectedProjectPaymentReq || 'R/RL-234567'} / New Build / With DG</div>
            <div class="banner-center-title">230510678 / ( O - Capex )</div>
            <div class="banner-right-title">IN-123456 / Guindy</div>
          </div>
        `;
      } else {
        bannerTitle.textContent = "Work List";
      }
    }
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
  showToast('Navigated to Telecom Details');
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
    // Indus Towers GBPA Toolbar: CSV Upload + Orange Bulk Upload + Blue Plus (+) on Right
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
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnIndusAdd" data-tooltip="Add New GBPA" aria-label="Add GBPA">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;

    document.getElementById('btnIndusCsv')?.addEventListener('click', () => {
      triggerCsvUpload();
    });
    document.getElementById('btnIndusDocUpload')?.addEventListener('click', () => {
      showToast('Bulk Upload initiated');
    });
    document.getElementById('btnIndusAdd')?.addEventListener('click', () => {
      openSideForm();
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
    document.getElementById('btnIndusDocUpload')?.addEventListener('click', () => {
      showToast('Bulk Upload initiated');
    });
    document.getElementById('btnIndusAdd')?.addEventListener('click', () => {
      openSideForm();
    });
    return;
  }

  if (currentIndusSubpage === 'site') {
    // Indus Towers Site Toolbar: Backward Icon + CSV Upload + Orange Bulk Upload + Blue Plus (+) on Right
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
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnIndusAdd" data-tooltip="Add New Site" aria-label="Add Site">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;

    document.getElementById('btnIndusCsv')?.addEventListener('click', () => {
      triggerCsvUpload();
    });
    document.getElementById('btnIndusDocUpload')?.addEventListener('click', () => {
      showToast('Bulk Upload initiated');
    });
    document.getElementById('btnIndusAdd')?.addEventListener('click', () => {
      openSideForm();
    });
    return;
  }

  // Indus Towers Toolbar (Projects): Backward Icon on Left + CSV Upload + Orange Bulk Upload + Blue Plus (+) on Right
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
    triggerCsvUpload();
  });
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
          <th class="col-gbpa-mat-code">
            <div class="th-content-wrap">
              <span>Material Code</span>
            </div>
          </th>
          <th class="col-gbpa-mat-head">
            <div class="th-content-wrap">
              <span>Material Head</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['materialHead'] ? 'has-active-filter' : ''}" data-filter-col="materialHead" title="Filter Material Head">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-mat-cat">
            <div class="th-content-wrap">
              <span>Material Category</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['materialCategory'] ? 'has-active-filter' : ''}" data-filter-col="materialCategory" title="Filter Material Category">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-mat-desc">
            <div class="th-content-wrap">
              <span>Material Description</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['materialDescription'] ? 'has-active-filter' : ''}" data-filter-col="materialDescription" title="Filter Material Description">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-mat-type">
            <div class="th-content-wrap">
              <span>Type</span>
            </div>
          </th>
          <th class="col-gbpa-mat-status">
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
          <th class="col-gbpa-exp-code">
            <div class="th-content-wrap">
              <span>Expense Code</span>
            </div>
          </th>
          <th class="col-gbpa-exp-head">
            <div class="th-content-wrap">
              <span>Expense Head</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseHead'] ? 'has-active-filter' : ''}" data-filter-col="expenseHead" title="Filter Expense Head">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-exp-cat">
            <div class="th-content-wrap">
              <span>Expense Category</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseCategory'] ? 'has-active-filter' : ''}" data-filter-col="expenseCategory" title="Filter Expense Category">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-exp-desc">
            <div class="th-content-wrap">
              <span>Expense Description</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseDescription'] ? 'has-active-filter' : ''}" data-filter-col="expenseDescription" title="Filter Expense Description">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-exp-type">
            <div class="th-content-wrap">
              <span>Type</span>
            </div>
          </th>
          <th class="col-gbpa-exp-status">
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
          <th class="col-gbpa-infra-code">
            <div class="th-content-wrap">
              <span>Infra Code</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraCode'] ? 'has-active-filter' : ''}" data-filter-col="infraCode" title="Filter Infra Code">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-infra-cat">
            <div class="th-content-wrap">
              <span>Infra Category</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraCategory'] ? 'has-active-filter' : ''}" data-filter-col="infraCategory" title="Filter Infra Category">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-infra-desc">
            <div class="th-content-wrap">
              <span>Infra Description</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraDescription'] ? 'has-active-filter' : ''}" data-filter-col="infraDescription" title="Filter Infra Description">&#9660;</button>
            </div>
          </th>
          <th class="col-gbpa-infra-type">
            <div class="th-content-wrap">
              <span>Type</span>
            </div>
          </th>
          <th class="col-gbpa-infra-status">
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
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['indusPm'] ? 'has-active-filter' : ''}" data-filter-col="indusPm" title="Filter Indus PM">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>Indus SCM</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['indusScm'] ? 'has-active-filter' : ''}" data-filter-col="indusScm" title="Filter Indus SCM">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>PM</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['pm'] ? 'has-active-filter' : ''}" data-filter-col="pm" title="Filter PM">&#9660;</button>
          </div>
        </th>
        <th>
          <div class="th-content-wrap">
            <span>MIS</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['mis'] ? 'has-active-filter' : ''}" data-filter-col="mis" title="Filter MIS">&#9660;</button>
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
    // Indus Towers Infra Table Headers (Infra Category 25char, Infra Description 50char, Uom, Make, Commissioning, I - Map, Status)
    thead.innerHTML = `
      <tr class="master-view-header">
        <th class="col-telecom-infra-category">
          <div class="th-content-wrap">
            <span>Infra Category</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraCategory'] ? 'has-active-filter' : ''}" data-filter-col="infraCategory" title="Filter Infra Category">&#9660;</button>
          </div>
        </th>
        <th class="col-telecom-infra-desc">
          <div class="th-content-wrap">
            <span>Infra Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraDescription'] ? 'has-active-filter' : ''}" data-filter-col="infraDescription" title="Filter Infra Description">&#9660;</button>
          </div>
        </th>
        <th class="col-telecom-infra-uom">
          <div class="th-content-wrap">
            <span>Uom</span>
          </div>
        </th>
        <th class="col-telecom-infra-make">
          <div class="th-content-wrap">
            <span>Make</span>
          </div>
        </th>
        <th class="col-telecom-infra-commissioning">
          <div class="th-content-wrap">
            <span>Commissioning</span>
          </div>
        </th>
        <th class="col-telecom-infra-imap">
          <div class="th-content-wrap">
            <span>I - Map</span>
          </div>
        </th>
        <th class="col-telecom-infra-status">
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
        <th class="col-gbpa-item-code">
          <div class="th-content-wrap">
            <span>Item Code</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['itemCode'] ? 'has-active-filter' : ''}" data-filter-col="itemCode" title="Filter Item Code">&#9660;</button>
          </div>
        </th>
        <th class="col-gbpa-product-name">
          <div class="th-content-wrap">
            <span>Product Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productName'] ? 'has-active-filter' : ''}" data-filter-col="productName" title="Filter Product Name">&#9660;</button>
          </div>
        </th>
        <th class="col-gbpa-product-type">
          <div class="th-content-wrap">
            <span>Product Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productType'] ? 'has-active-filter' : ''}" data-filter-col="productType" title="Filter Product Type">&#9660;</button>
          </div>
        </th>
        <th class="col-gbpa-product-desc">
          <div class="th-content-wrap">
            <span>Product Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productDescription'] ? 'has-active-filter' : ''}" data-filter-col="productDescription" title="Filter Product Description">&#9660;</button>
          </div>
        </th>
        <th class="col-gbpa-hsn-sac">
          <div class="th-content-wrap">
            <span>HSN/SAC</span>
          </div>
        </th>
        <th class="col-gbpa-hsn-code">
          <div class="th-content-wrap">
            <span>HSN/SAC Code</span>
          </div>
        </th>
        <th class="col-gbpa-active-rate">
          <div class="th-content-wrap">
            <span>Active Rate (₹)</span>
          </div>
        </th>
        <th class="col-gbpa-budget">
          <div class="th-content-wrap">
            <span>Budget (₹)</span>
          </div>
        </th>
        <th class="col-gbpa-status">
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
        <th class="col-site-circle">
          <div class="th-content-wrap">
            <span>Circle</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['circle'] ? 'has-active-filter' : ''}" data-filter-col="circle" title="Filter Circle">&#9660;</button>
          </div>
        </th>
        <th class="col-site-id">
          <div class="th-content-wrap">
            <span>Site ID</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['siteId'] ? 'has-active-filter' : ''}" data-filter-col="siteId" title="Filter Site ID">&#9660;</button>
          </div>
        </th>
        <th class="col-site-wh">WH ID</th>
        <th class="col-site-name">
          <div class="th-content-wrap">
            <span>Site Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['siteName'] ? 'has-active-filter' : ''}" data-filter-col="siteName" title="Filter Site Name">&#9660;</button>
          </div>
        </th>
        <th class="col-site-district">
          <div class="th-content-wrap">
            <span>District</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['district'] ? 'has-active-filter' : ''}" data-filter-col="district" title="Filter District">&#9660;</button>
          </div>
        </th>
        <th class="col-site-town">
          <div class="th-content-wrap">
            <span>Town</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['town'] ? 'has-active-filter' : ''}" data-filter-col="town" title="Filter Town">&#9660;</button>
          </div>
        </th>
        <th class="col-site-lat">Lattitude</th>
        <th class="col-site-lng">Longtitude</th>
        <th class="col-site-transport-zone">
          <div class="th-content-wrap">
            <span>Transport Zone</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['transportZone'] ? 'has-active-filter' : ''}" data-filter-col="transportZone" title="Filter Transport Zone">&#9660;</button>
          </div>
        </th>
        <th class="col-site-status">
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
    { key: 'products', label: 'GBPA' },
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
        showToast(`Switched to Telecom &bull; ${btn.textContent.trim()}`);
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
    // Employee Toolbar: Green CSV Upload Icon + Orange Bulk Upload Icon + Blue Add (+) Button on Right
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
        <!-- Blue Add (+) Button on Right Most Side -->
        <button type="button" class="toolbar-icon-btn btn-add-action" id="btnMasterAdd" data-tooltip="Add New Employee" aria-label="Add Record">
          <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;
    document.getElementById('btnMasterCsv')?.addEventListener('click', () => {
      triggerCsvUpload();
    });
    document.getElementById('btnMasterDocUpload')?.addEventListener('click', () => {
      triggerBulkUpload();
    });
    document.getElementById('btnMasterAdd')?.addEventListener('click', () => {
      openSideForm();
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
    triggerCsvUpload();
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
        <th class="col-master-vendor-type">
          <div class="th-content-wrap">
            <span>Vendor Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorType'] ? 'has-active-filter' : ''}" data-filter-col="vendorType" title="Filter Vendor Type">&#9660;</button>
          </div>
        </th>
        <th class="col-master-vendor-id">
          <div class="th-content-wrap">
            <span>Vendor ID</span>
          </div>
        </th>
        <th class="col-master-vendor-name">
          <div class="th-content-wrap">
            <span>Vendor Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorName'] ? 'has-active-filter' : ''}" data-filter-col="vendorName" title="Filter Vendor Name">&#9660;</button>
          </div>
        </th>
        <th class="col-master-vendor-gst-num">
          <div class="th-content-wrap">
            <span>GST Number</span>
          </div>
        </th>
        <th class="col-master-vendor-pan">
          <div class="th-content-wrap">
            <span>PAN Number</span>
          </div>
        </th>
        <th class="col-master-vendor-gst-type">
          <div class="th-content-wrap">
            <span>GST Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['gstType'] ? 'has-active-filter' : ''}" data-filter-col="gstType" title="Filter GST Type">&#9660;</button>
          </div>
        </th>
        <th class="col-master-vendor-status">
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
  if (currentWorklistView === 'project_payment') {
    currentDataset = worklistProjectPaymentItems;
  } else if (currentWorklistView === 'po') {
    currentDataset = poData;
  } else {
    currentDataset = paymentData;
  }
}

function renderWorklistToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  const hasSelected = currentDataset.some(r => r.selected);

  if (currentWorklistView === 'project_payment') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>

        <!-- Stat 1: Summation Total -->
        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #2563eb; letter-spacing: 0.3px;">12,00,000.00</span>
        </div>

        <!-- Stat 2: Validated / Paid (Green Paid _ Received.svg) -->
        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">10,00,000.00</span>
        </div>
      </div>

      <!-- Right Action Icons Group -->
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        <!-- Stat 3: Balance / Payable (Red Payable.svg) moved to right side -->
        <div class="metric-item metric-balance" style="display: flex; align-items: center; gap: 8px; margin-right: 6px;">
          <img src="icons/Payable.svg" alt="Payable" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #dc2626; letter-spacing: 0.3px;">2,00,000.00</span>
        </div>

        <button type="button" class="toolbar-icon-btn" title="Notes & Remarks" onclick="openProjectPaymentNotesModal()">
          <img src="icons/Notes _ Remarks 2.svg" alt="Notes" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Bank Details" onclick="openProjectPaymentBankModal()">
          <img src="icons/Bank.svg" alt="Bank" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Payment Report" onclick="openProjectPaymentReportModal()">
          <img src="icons/Payment Report.svg" alt="Payment Report" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="showToast('Approved')">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn btn-project-payment-edit" id="btnProjectPaymentEdit" title="${isProjectPaymentEditing ? 'Save Changes' : 'Edit Details'}" onclick="toggleProjectPaymentEditMode()">
          <img src="${isProjectPaymentEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isProjectPaymentEditing ? 'Save' : 'Edit'}" width="28" height="28">
        </button>
      </div>
    `;
    return;
  } else if (currentWorklistView === 'po') {
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right" style="display: flex; align-items: center; min-width: 44px; min-height: 44px; justify-content: flex-end;">
        <button type="button" class="toolbar-icon-btn btn-delete-action" id="btnDeleteAction" data-tooltip="Delete Selected" aria-label="Delete" style="visibility: ${hasSelected ? 'visible' : 'hidden'}; pointer-events: ${hasSelected ? 'auto' : 'none'};">
          <img src="icons/Delete.svg" alt="Delete" class="toolbar-icon-img" width="28" height="28">
        </button>
      </div>
    `;
  } else {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 8px;">
        <span class="toolbar-icon-wrap" data-tooltip="Payable Amount" title="Payable Amount" style="display: inline-flex; align-items: center; cursor: pointer;">
          <img src="icons/Payable.svg" alt="Payable Amount" class="toolbar-icon-img" width="28" height="28">
        </span>
        <span id="lblPayableAmount" class="toolbar-amount-text toolbar-amount-red">11,11,20,000.00</span>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <div class="toolbar-bank-amount-wrap" style="display: flex; align-items: center; gap: 8px;">
          <span class="toolbar-icon-wrap" data-tooltip="Bank" title="Bank" style="display: inline-flex; align-items: center; cursor: pointer;">
            <img src="icons/Bank.svg" alt="Bank" class="toolbar-icon-img" width="28" height="28">
          </span>
          <span id="lblBankAmount" class="toolbar-amount-text toolbar-amount-green">11,11,20,000.00</span>
        </div>
        <button type="button" class="toolbar-icon-btn btn-delete-action" id="btnDeleteAction" data-tooltip="Delete Selected" aria-label="Delete" style="display: ${hasSelected ? 'flex' : 'none'};">
          <img src="icons/Delete.svg" alt="Delete" class="toolbar-icon-img" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn btn-dashboard-action" id="btnPaymentDashboard" data-tooltip="Dashboard" title="Dashboard" aria-label="Dashboard">
          <img src="icons/Dash board.svg" alt="Dashboard" class="toolbar-icon-img" width="28" height="28">
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

  if (currentWorklistView === 'project_payment') {
    thead.innerHTML = `
      <tr class="project-payment-header-row1">
        <th rowspan="2" style="width: 70px;">Select</th>
        <th rowspan="2" style="width: 140px;">Expense Type</th>
        <th rowspan="2" style="width: 180px;">BOQ Name</th>
        <th rowspan="2" style="width: 80px;">Uom</th>
        <th rowspan="2" style="width: 80px;">Qty</th>
        <th colspan="3">Rate</th>
        <th colspan="3">Amount</th>
      </tr>
      <tr class="project-payment-header-row2">
        <th style="width: 110px;">Requested</th>
        <th style="width: 110px;">Validated</th>
        <th style="width: 110px;">Approved</th>
        <th style="width: 110px;">Basic</th>
        <th style="width: 110px;">GST</th>
        <th style="width: 110px;">Total</th>
      </tr>
    `;
  } else if (currentWorklistView === 'po') {
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

  if (currentWorklistView === 'project_payment') {
    footer.innerHTML = '';
    return;
  }

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
  document.getElementById('btnPaymentDashboard')?.addEventListener('click', () => {
    showToast('Payment Dashboard opened');
  });

  const btnRefresh = document.getElementById('btnPaymentRefresh');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      const img = btnRefresh.querySelector('img');
      if (img) img.classList.add('spin-refresh-icon');

      activeColumnFilters = {};
      renderApp();

      const lblPayable = document.getElementById('lblPayableAmount');
      const lblBank = document.getElementById('lblBankAmount');
      if (lblPayable) lblPayable.textContent = "11,11,20,000.00";
      if (lblBank) lblBank.textContent = "11,11,20,000.00";

      setTimeout(() => {
        if (img) img.classList.remove('spin-refresh-icon');
      }, 600);

      showToast('Payment numbers & table data refreshed successfully!');
    });
  }

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
    const colSpan = currentModule === 'indus_towers'
      ? (currentIndusSubpage === 'projects' ? 8 : 10)
      : (currentModule === 'master' ? (currentMasterSubpage === 'customer' ? 7 : 6) : (currentWorklistView === 'po' ? 6 : 10));
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
        // Render Product Details -> Materials Rows
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td class="col-gbpa-mat-code">${row.materialCode || ''}</td>
              <td class="col-gbpa-mat-head">${row.materialHead || ''}</td>
              <td class="col-gbpa-mat-cat">${row.materialCategory || ''}</td>
              <td class="col-gbpa-mat-desc">${row.materialDescription || ''}</td>
              <td class="col-gbpa-mat-type td-center">${row.type || ''}</td>
              <td class="col-gbpa-mat-status td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      } else if (currentIndusProductSubpage === 'expenses') {
        // Render Product Details -> Expenses Rows
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td class="col-gbpa-exp-code">${row.expenseCode || ''}</td>
              <td class="col-gbpa-exp-head">${row.expenseHead || ''}</td>
              <td class="col-gbpa-exp-cat">${row.expenseCategory || ''}</td>
              <td class="col-gbpa-exp-desc">${row.expenseDescription || ''}</td>
              <td class="col-gbpa-exp-type td-center">${row.type || ''}</td>
              <td class="col-gbpa-exp-status td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      } else if (currentIndusProductSubpage === 'infra') {
        // Render Product Details -> Infra Rows
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td class="col-gbpa-infra-code">${row.infraCode || ''}</td>
              <td class="col-gbpa-infra-cat">${row.infraCategory || ''}</td>
              <td class="col-gbpa-infra-desc">${row.infraDescription || ''}</td>
              <td class="col-gbpa-infra-type td-center">${row.type || ''}</td>
              <td class="col-gbpa-infra-status td-center">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      } else if (currentIndusProductSubpage === 'rate') {
        // Render Product Details -> Rate Rows
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}">
              <td>${row.from || ''}</td>
              <td>${row.to || ''}</td>
              <td>${row.gbpa || ''}</td>
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
      // Render Indus Towers -> Projects Rows (Survey & Additional Transport columns removed)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>
              <a href="#" class="req-link td-link-blue" onclick="handleProjectClick('${row.id}', '${row.projectType}'); return false;">${row.projectType || ''}</a>
            </td>
            <td>${row.subProjectType || ''}</td>
            <td>${row.tat || ''}</td>
            <td>${row.indusPm || ''}</td>
            <td>${row.indusScm || ''}</td>
            <td>${row.pm || ''}</td>
            <td>${row.mis || ''}</td>
            <td class="td-center">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentIndusSubpage === 'infra') {
      // Render Indus Towers -> Infra Rows (Matching Uploaded Mockup)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td class="col-telecom-infra-category">${row.infraCategory || ''}</td>
            <td class="col-telecom-infra-desc">
              <a href="#" class="req-link td-link-blue" onclick="handleInfraClick('${row.id}', '${row.infraCategory}'); return false;">${row.infraDescription || ''}</a>
            </td>
            <td class="col-telecom-infra-uom td-center">${row.uom || ''}</td>
            <td class="col-telecom-infra-make">${row.make || ''}</td>
            <td class="col-telecom-infra-commissioning">${row.commissioning || ''}</td>
            <td class="col-telecom-infra-imap td-center">${row.iMap || ''}</td>
            <td class="col-telecom-infra-status td-center">
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
            <td class="col-gbpa-item-code">${row.itemCode || ''}</td>
            <td class="col-gbpa-product-name">
              <a href="#" class="req-link td-link-blue" onclick="openIndusProductDetails('${row.productName}'); return false;">${row.productName || ''}</a>
            </td>
            <td class="col-gbpa-product-type">${row.productType || ''}</td>
            <td class="col-gbpa-product-desc">${row.productDescription || ''}</td>
            <td class="col-gbpa-hsn-sac td-center">${row.hsnSacType || ''}</td>
            <td class="col-gbpa-hsn-code">${row.hsnSacCode || ''}</td>
            <td class="col-gbpa-active-rate td-amount">${row.activeRate || ''}</td>
            <td class="col-gbpa-budget td-amount">${row.budgetAmount || ''}</td>
            <td class="col-gbpa-status td-center">
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
            <td class="col-site-circle">${row.circle}</td>
            <td class="col-site-id">${row.siteId}</td>
            <td class="col-site-wh">${row.whId}</td>
            <td class="col-site-name">
              <a href="#" class="req-link td-link-blue" onclick="handleSiteClick('${row.id}', '${row.siteName}'); return false;">${row.siteName}</a>
            </td>
            <td class="col-site-district">${row.district}</td>
            <td class="col-site-town">${row.town || ''}</td>
            <td class="col-site-lat">${row.latitude}</td>
            <td class="col-site-lng">${row.longitude}</td>
            <td class="col-site-transport-zone td-center">${row.transportZone || ''}</td>
            <td class="col-site-status td-center">
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
              ${row.businessType === 'Telecom' ? `<a href="#" class="business-type-link td-link-blue" onclick="openIndusTowersPage(); return false;" title="View Telecom details">${row.businessType}</a>` : row.businessType}
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
            <td class="col-master-vendor-type">${row.vendorType}</td>
            <td class="col-master-vendor-id td-center">${row.vendorId}</td>
            <td class="col-master-vendor-name">${row.vendorName}</td>
            <td class="col-master-vendor-gst-num td-center">${row.gstNumber}</td>
            <td class="col-master-vendor-pan td-center">${row.panNumber}</td>
            <td class="col-master-vendor-gst-type td-center">${row.gstType}</td>
            <td class="col-master-vendor-status td-center">
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
              <a href="#" class="req-link td-link-blue" onclick="openViewProductCard('${row.id}'); return false;">${row.productHead}</a>
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
      // Render Expenses Rows (Matching Mockup: Expense Head, Expense Code, SAC Code, Expense Description, GST Rate, Uom, Status)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        return `
          <tr data-row-id="${row.id}">
            <td>
              <a href="#" class="req-link td-link-blue" onclick="openViewExpenseCard('${row.id}'); return false;">${row.expenseHead}</a>
            </td>
            <td>${row.expenseCode || ''}</td>
            <td>${row.sacCode || ''}</td>
            <td>${row.expenseDescription || ''}</td>
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
              <a href="#" class="req-link td-link-blue" onclick="handleEmpClick('${row.id}', '${row.employeeName}'); return false;">${row.employeeName}</a>
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
    if (currentWorklistView === 'project_payment') {
      tbody.innerHTML = filteredDataset.map((row, idx) => {
        const isSelected = row.selected;
        if (isProjectPaymentEditing) {
          return `
            <tr class="project-payment-row" data-row-id="${row.id || idx}">
              <td class="td-select td-center">
                <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="toggleProjectPaymentRowSelect('${row.id}')" aria-label="Select row"></div>
              </td>
              <td class="td-center">
                <select class="project-table-edit-input" data-row-id="${row.id}" data-field="expenseType" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; cursor: pointer;">
                  <option value="PO" ${row.expenseType === 'PO' ? 'selected' : ''}>PO</option>
                  <option value="Non - PO" ${row.expenseType === 'Non - PO' ? 'selected' : ''}>Non - PO</option>
                  <option value="" ${!row.expenseType ? 'selected' : ''}>-- Select --</option>
                </select>
              </td>
              <td>
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="boqName" value="${row.boqName || ''}" placeholder="BOQ Name" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; cursor: text;">
              </td>
              <td class="td-center">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="uom" value="${row.uom || ''}" placeholder="Uom" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: center; cursor: text;">
              </td>
              <td class="td-center">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="qty" value="${row.qty || ''}" placeholder="Qty" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: center; cursor: text;">
              </td>
              <td class="td-amount">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="rateRequested" value="${row.rateRequested || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              </td>
              <td class="td-amount">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="rateValidated" value="${row.rateValidated || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              </td>
              <td class="td-amount">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="rateApproved" value="${row.rateApproved || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              </td>
              <td class="td-amount">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="amountBasic" value="${row.amountBasic || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              </td>
              <td class="td-amount">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="amountGst" value="${row.amountGst || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              </td>
              <td class="td-amount">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="amountTotal" value="${row.amountTotal || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              </td>
            </tr>
          `;
        } else {
          return `
            <tr class="project-payment-row" data-row-id="${row.id || idx}">
              <td class="td-select td-center">
                <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="toggleProjectPaymentRowSelect('${row.id}')" aria-label="Select row"></div>
              </td>
              <td class="td-center" style="font-weight: 500;">${row.expenseType || ''}</td>
              <td>
                ${row.boqName ? `<a href="#" class="boq-link" onclick="showToast('BOQ: ${row.boqName}'); return false;">${row.boqName}</a>` : ''}
              </td>
              <td class="td-center">${row.uom || ''}</td>
              <td class="td-center">${row.qty || ''}</td>
              <td class="td-amount">${row.rateRequested || ''}</td>
              <td class="td-amount">${row.rateValidated || ''}</td>
              <td class="td-amount">${row.rateApproved || ''}</td>
              <td class="td-amount">${row.amountBasic || ''}</td>
              <td class="td-amount">${row.amountGst || ''}</td>
              <td class="td-amount">${row.amountTotal || ''}</td>
            </tr>
          `;
        }
      }).join('');
    } else if (currentWorklistView === 'po') {
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
        const isProject = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'project');
        return `
          <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${row.id}">
            <td class="td-select">
              <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="selectRow('${row.id}')" aria-label="Select row"></div>
            </td>
            <td>
              ${isProject 
                ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistProjectPayment('${row.submitBy}', '${row.id}'); return false;">${row.submitBy}</a>`
                : `<span>${row.submitBy}</span>`
              }
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
  const btnSiteMessage = document.getElementById('btnSiteCardMessageIcon') || document.getElementById('btnSiteCardMessage');
  const btnSubmitSite = document.getElementById('btnSubmitSite');
  const btnCloseGbpa = document.getElementById('btnCloseGbpaForm');
  const btnSubmitGbpa = document.getElementById('btnSubmitGbpa');

  if (btnClose) btnClose.addEventListener('click', closeSideForm);
  if (btnCloseInfra) btnCloseInfra.addEventListener('click', closeSideForm);
  if (btnCloseSite) btnCloseSite.addEventListener('click', closeSideForm);
  if (btnCloseGbpa) btnCloseGbpa.addEventListener('click', closeSideForm);
  if (btnSubmitSite) btnSubmitSite.addEventListener('click', handleFormSave);
  if (btnSubmitGbpa) btnSubmitGbpa.addEventListener('click', handleFormSave);

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
      const excelDropdown = document.getElementById('excelFilterDropdown');
      const addContactCard = document.getElementById('addContactFormCard');
      const isInsideSub = (excelDropdown && excelDropdown.contains(e.target)) || (addContactCard && addContactCard.contains(e.target));
      if (!contactPanel.contains(e.target) && !isInsideBtn && !isInsideSub) {
        contactPanel.style.display = 'none';
      }
    }
    if (locationPanel && locationPanel.style.display !== 'none' && locationPanel.style.display !== '') {
      if (!locationPanel.contains(e.target) && !btnLocation.contains(e.target)) {
        locationPanel.style.display = 'none';
      }
    }
  });

  // Contact, Bank, Holiday & Location Table Data & Filtering
  renderVendorContactTable();
  initContactTableFilters();
  renderCompanyBankTable();
  initCompanyBankTableFilters();
  renderCompanyHolidaysTable();
  initCompanyHolidaysTableFilters();
  renderCompanyLocationTable();
  initCompanyLocationTableFilters();

  const btnCsvUpload = document.getElementById('btnContactCsvUpload');
  if (btnCsvUpload) {
    btnCsvUpload.addEventListener('click', () => {
      showToast('Contact CSV import ready');
    });
  }

  // Large Blue Plus Icon on Right Side -> Opens Add Contact Form Tab
  const btnContactAddRow = document.getElementById('btnContactAddRow');
  if (btnContactAddRow) {
    btnContactAddRow.addEventListener('click', () => {
      const contactPanel = document.getElementById('contactDetailsSidePanel');
      if (contactPanel) contactPanel.classList.add('card-dimmed-blurred');

      const addContactCard = document.getElementById('addContactFormCard');
      if (addContactCard) addContactCard.style.display = 'block';

      document.getElementById('inpNewContactName')?.focus();
      showToast('Add Contact form opened');
    });
  }

  // Close Add Contact Form Card
  const btnCloseAddContact = document.getElementById('btnCloseAddContactCard');
  if (btnCloseAddContact) {
    btnCloseAddContact.addEventListener('click', () => {
      const ac = document.getElementById('addContactFormCard');
      if (ac) ac.style.display = 'none';
      const contactPanel = document.getElementById('contactDetailsSidePanel');
      if (contactPanel) contactPanel.classList.remove('card-dimmed-blurred');
    });
  }

  // Submit / Save New Contact Form
  const btnSubmitNewContact = document.getElementById('btnSubmitNewContact');
  if (btnSubmitNewContact) {
    btnSubmitNewContact.addEventListener('click', () => {
      const nameVal = document.getElementById('inpNewContactName')?.value.trim() || 'New Contact';
      const desigVal = document.getElementById('inpNewContactDesignation')?.value.trim() || '';
      const phoneVal = document.getElementById('inpNewContactPhone')?.value.trim() || '';
      const emailVal = document.getElementById('inpNewContactEmail')?.value.trim() || '';
      const isStatusActive = document.getElementById('inpNewContactStatusToggle') ? document.getElementById('inpNewContactStatusToggle').checked : true;
      const statusVal = isStatusActive ? 'Active' : 'Inactive';

      const newContact = {
        id: 'c-' + Date.now(),
        name: nameVal,
        designation: desigVal,
        phone: phoneVal,
        email: emailVal,
        status: statusVal
      };

      vendorContactData.push(newContact);
      renderVendorContactTable();

      // Reset fields
      document.getElementById('inpNewContactName').value = '';
      document.getElementById('inpNewContactDesignation').value = '';
      document.getElementById('inpNewContactPhone').value = '';
      document.getElementById('inpNewContactEmail').value = '';
      if (document.getElementById('inpNewContactStatusToggle')) {
        document.getElementById('inpNewContactStatusToggle').checked = true;
      }

      const ac = document.getElementById('addContactFormCard');
      if (ac) ac.style.display = 'none';
      const contactPanel = document.getElementById('contactDetailsSidePanel');
      if (contactPanel) contactPanel.classList.remove('card-dimmed-blurred');

      showToast('New Contact details added successfully!');
    });
  }

  // Close Contact Details Side Panel
  const btnCloseContactPanel = document.getElementById('btnCloseContactPanel');
  if (btnCloseContactPanel) {
    btnCloseContactPanel.addEventListener('click', () => {
      const cp = document.getElementById('contactDetailsSidePanel');
      if (cp) cp.style.display = 'none';
      const ac = document.getElementById('addContactFormCard');
      if (ac) ac.style.display = 'none';
      const vendorCard = document.getElementById('addVendorCard');
      if (vendorCard) vendorCard.classList.remove('card-dimmed-blurred');
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
      showToast('Contact details closed');
    });
  }

  // Supply Scope Table Data & Events
  renderVendorSupplyScopeTable();
  initSupplyScopeTableFilters();

  const btnSupplyScopeCsv = document.getElementById('btnSupplyScopeCsvUpload');
  const inpSupplyScopeCsvFile = document.getElementById('inpSupplyScopeCsvFile');

  if (btnSupplyScopeCsv && inpSupplyScopeCsvFile) {
    btnSupplyScopeCsv.addEventListener('click', () => {
      inpSupplyScopeCsvFile.click();
    });

    inpSupplyScopeCsvFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const fileName = file.name;
      const isCsv = fileName.toLowerCase().endsWith('.csv');

      if (isCsv) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            let addedCount = 0;

            const startIdx = (lines.length > 0 && (lines[0].toLowerCase().includes('category') || lines[0].toLowerCase().includes('product') || lines[0].toLowerCase().includes('name'))) ? 1 : 0;

            for (let i = startIdx; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
              if (cols.length >= 2 && cols[0]) {
                vendorSupplyScopeData.push({
                  id: 'ss-' + Date.now() + '-' + i,
                  category: cols[0] || 'Supply',
                  productName: cols[1] || ('230510' + Math.floor(100 + Math.random() * 900)),
                  uom: cols[2] || 'Nos',
                  price: cols[3] || '15000.00',
                  status: (cols[4] && cols[4].toLowerCase().includes('in')) ? 'In - Active' : 'Active'
                });
                addedCount++;
              }
            }

            if (addedCount === 0) {
              vendorSupplyScopeData.push({
                id: 'ss-' + Date.now(),
                category: 'Supply',
                productName: 'Imported ' + (vendorSupplyScopeData.length + 1),
                uom: 'Nos',
                price: '15000.00',
                status: 'Active'
              });
              addedCount = 1;
            }

            renderVendorSupplyScopeTable();
            showToast(`CSV file "${fileName}" imported (${addedCount} records added)!`);
          } catch (err) {
            showToast(`Imported ${fileName} successfully!`);
          }
        };
        reader.readAsText(file);
      } else {
        // Excel file (.xlsx, .xls)
        vendorSupplyScopeData.push({
          id: 'ss-' + Date.now(),
          category: 'Supply',
          productName: 'Excel Import ' + (vendorSupplyScopeData.length + 1),
          uom: 'Nos',
          price: '15000.00',
          status: 'Active'
        });
        renderVendorSupplyScopeTable();
        showToast(`Excel file "${fileName}" imported successfully!`);
      }

      inpSupplyScopeCsvFile.value = '';
    });
  }

  // Plus icon in Supply Scope -> opens Add Products form tab
  const btnSupplyScopeAdd = document.getElementById('btnSupplyScopeAddRow');
  if (btnSupplyScopeAdd) {
    btnSupplyScopeAdd.addEventListener('click', () => {
      const scopePanel = document.getElementById('vendorSupplyScopeSidePanel');
      if (scopePanel) scopePanel.classList.add('card-dimmed-blurred');

      const addProductCard = document.getElementById('addProductScopeCard');
      if (addProductCard) addProductCard.style.display = 'block';

      showToast('Add Products form opened');
    });
  }

  // Close Add Products form card
  const btnCloseAddProduct = document.getElementById('btnCloseAddProductScopeCard');
  if (btnCloseAddProduct) {
    btnCloseAddProduct.addEventListener('click', () => {
      const ap = document.getElementById('addProductScopeCard');
      if (ap) ap.style.display = 'none';
      const scopePanel = document.getElementById('vendorSupplyScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');
    });
  }

  // Save Product via Header Edit/Save Icon
  const btnProductScopeSave = document.getElementById('btnProductScopeEditToggle');
  if (btnProductScopeSave) {
    btnProductScopeSave.addEventListener('click', () => {
      const catVal = document.getElementById('selAddProductCategory')?.value || 'Supply';
      const prodNameVal = document.getElementById('selAddProductName')?.value || '230510678';
      const isStatusActive = document.getElementById('inpAddProductStatusToggle')?.checked;
      const statusVal = isStatusActive ? 'Active' : 'In - Active';

      const newProduct = {
        id: 'ss-' + Date.now(),
        category: catVal,
        productName: prodNameVal,
        uom: 'R/RL-234567',
        price: '15000.00',
        status: statusVal
      };

      vendorSupplyScopeData.push(newProduct);
      renderVendorSupplyScopeTable();

      const ap = document.getElementById('addProductScopeCard');
      if (ap) ap.style.display = 'none';
      const scopePanel = document.getElementById('vendorSupplyScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');

      showToast('New Product added to Supply Scope!');
    });
  }

  const btnCloseSupplyScope = document.getElementById('btnCloseSupplyScopePanel');
  if (btnCloseSupplyScope) {
    btnCloseSupplyScope.addEventListener('click', () => {
      const sp = document.getElementById('vendorSupplyScopeSidePanel');
      if (sp) sp.style.display = 'none';
      const ap = document.getElementById('addProductScopeCard');
      if (ap) ap.style.display = 'none';
      const vendorCard = document.getElementById('addVendorCard');
      if (vendorCard) vendorCard.classList.remove('card-dimmed-blurred');
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
      showToast('Supply Scope closed');
    });
  }

  // Service (Project) Scope Table Data & Events
  renderVendorServiceProjectScopeTable();
  initServiceProjectScopeTableFilters();

  const btnServiceProjectCsv = document.getElementById('btnServiceProjectScopeCsvUpload');
  const inpServiceProjectCsvFile = document.getElementById('inpServiceProjectScopeCsvFile');

  if (btnServiceProjectCsv && inpServiceProjectCsvFile) {
    btnServiceProjectCsv.addEventListener('click', () => {
      inpServiceProjectCsvFile.click();
    });

    inpServiceProjectCsvFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const fileName = file.name;
      const isCsv = fileName.toLowerCase().endsWith('.csv');

      if (isCsv) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            let addedCount = 0;

            const startIdx = (lines.length > 0 && (lines[0].toLowerCase().includes('project') || lines[0].toLowerCase().includes('type') || lines[0].toLowerCase().includes('sub'))) ? 1 : 0;

            for (let i = startIdx; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
              if (cols.length >= 2 && cols[0]) {
                vendorServiceProjectScopeData.push({
                  id: 'sps-' + Date.now() + '-' + i,
                  subProjectType: cols[0] || 'Project',
                  uom: cols[1] || 'LS',
                  rate: cols[2] || '',
                  status: (cols[3] && cols[3].toLowerCase().includes('in')) ? 'In - Active' : 'Active'
                });
                addedCount++;
              }
            }

            if (addedCount === 0) {
              vendorServiceProjectScopeData.push({
                id: 'sps-' + Date.now(),
                subProjectType: 'Imported Project ' + (vendorServiceProjectScopeData.length + 1),
                uom: 'LS',
                rate: '',
                status: 'Active'
              });
              addedCount = 1;
            }

            renderVendorServiceProjectScopeTable();
            showToast(`CSV file "${fileName}" imported (${addedCount} records added)!`);
          } catch (err) {
            showToast(`Imported ${fileName} successfully!`);
          }
        };
        reader.readAsText(file);
      } else {
        vendorServiceProjectScopeData.push({
          id: 'sps-' + Date.now(),
          subProjectType: 'Excel Project ' + (vendorServiceProjectScopeData.length + 1),
          uom: 'LS',
          rate: '',
          status: 'Active'
        });
        renderVendorServiceProjectScopeTable();
        showToast(`Excel file "${fileName}" imported successfully!`);
      }

      inpServiceProjectCsvFile.value = '';
    });
  }

  const btnServiceProjectAdd = document.getElementById('btnServiceProjectScopeAddRow');
  if (btnServiceProjectAdd) {
    btnServiceProjectAdd.addEventListener('click', () => {
      const scopePanel = document.getElementById('vendorServiceProjectScopeSidePanel');
      if (scopePanel) scopePanel.classList.add('card-dimmed-blurred');

      const addSubProjCard = document.getElementById('addSubProjectTypeCard');
      if (addSubProjCard) addSubProjCard.style.display = 'block';

      showToast('Add Sub - Project Type form opened');
    });
  }

  // Close Add Sub - Project Type form card
  const btnCloseAddSubProject = document.getElementById('btnCloseAddSubProjectTypeCard');
  if (btnCloseAddSubProject) {
    btnCloseAddSubProject.addEventListener('click', () => {
      const ap = document.getElementById('addSubProjectTypeCard');
      if (ap) ap.style.display = 'none';
      const scopePanel = document.getElementById('vendorServiceProjectScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');
    });
  }

  // Save Sub - Project Type via Bottom Save Button
  const btnSubmitSubProject = document.getElementById('btnSubmitSubProjectType');
  if (btnSubmitSubProject) {
    btnSubmitSubProject.addEventListener('click', () => {
      const subTypeVal = document.getElementById('selAddSubProjectType')?.value || 'Project';
      const uomVal = document.getElementById('selAddSubProjectUom')?.value || 'PO / LS';
      const isStatusActive = document.getElementById('inpAddSubProjectStatusToggle')?.checked;
      const statusVal = isStatusActive ? 'Active' : 'In - Active';

      const newRec = {
        id: 'sps-' + Date.now(),
        subProjectType: subTypeVal,
        uom: uomVal,
        rate: '',
        status: statusVal
      };

      vendorServiceProjectScopeData.push(newRec);
      renderVendorServiceProjectScopeTable();

      const ap = document.getElementById('addSubProjectTypeCard');
      if (ap) ap.style.display = 'none';
      const scopePanel = document.getElementById('vendorServiceProjectScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');

      showToast('New Sub - Project Type added to Project Scope!');
    });
  }

  // Sub - Project Type Payment Report Table Data & Events
  renderSubProjectTypeReportTable();

  // Helper for working calendar date picker
  function initCalendarPicker(btnId, inputId, nativeId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const native = document.getElementById(nativeId);

    function triggerCalendar() {
      if (native) {
        if (typeof native.showPicker === 'function') {
          try { native.showPicker(); } catch(e) { native.click(); }
        } else {
          native.click();
        }
      }
    }

    if (btn) btn.addEventListener('click', triggerCalendar);
    if (input) input.addEventListener('click', triggerCalendar);

    if (native) {
      native.addEventListener('change', (e) => {
        const val = e.target.value; // YYYY-MM-DD
        if (val) {
          const parts = val.split('-');
          if (parts.length === 3) {
            const formatted = `${parts[2]} - ${parts[1]} - ${parts[0]}`;
            if (input) input.value = formatted;
          }
        }
      });
    }
  }

  initCalendarPicker('btnSubProjectRateFromCalendar', 'inpSubProjectRateFrom', 'inpSubProjectRateFromNative');
  initCalendarPicker('btnSubProjectRateToCalendar', 'inpSubProjectRateTo', 'inpSubProjectRateToNative');

  // Sub - Project Type Payment Report Icon Click (Opens Sub - Project Type Report Tab)
  const btnSubProjReport = document.getElementById('btnSubProjectTypeReport');
  if (btnSubProjReport) {
    btnSubProjReport.addEventListener('click', () => {
      const subProjCard = document.getElementById('addSubProjectTypeCard');
      if (subProjCard) subProjCard.classList.add('card-dimmed-blurred');

      const reportCard = document.getElementById('subProjectTypeReportCard');
      if (reportCard) reportCard.style.display = 'block';

      renderSubProjectTypeReportTable();
      showToast('Sub - Project Type Details opened');
    });
  }

  // Close Sub - Project Type Report Tab
  const btnCloseSubProjReport = document.getElementById('btnCloseSubProjectReportCard');
  if (btnCloseSubProjReport) {
    btnCloseSubProjReport.addEventListener('click', () => {
      const reportCard = document.getElementById('subProjectTypeReportCard');
      if (reportCard) reportCard.style.display = 'none';
      const addRateCard = document.getElementById('addSubProjectRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const subProjCard = document.getElementById('addSubProjectTypeCard');
      if (subProjCard) subProjCard.classList.remove('card-dimmed-blurred');
    });
  }

  // Plus (+) icon in Sub - Project Type Report Tab (Opens Add Sub - Project Details Form)
  const btnSubProjReportAdd = document.getElementById('btnSubProjectReportAddRow');
  if (btnSubProjReportAdd) {
    btnSubProjReportAdd.addEventListener('click', () => {
      const reportCard = document.getElementById('subProjectTypeReportCard');
      if (reportCard) reportCard.classList.add('card-dimmed-blurred');

      const addRateCard = document.getElementById('addSubProjectRateFormCard');
      if (addRateCard) addRateCard.style.display = 'block';

      showToast('Add Sub - Project Details form opened');
    });
  }

  // Close Add Sub - Project Details Form
  const btnCloseAddSubProjectRate = document.getElementById('btnCloseAddSubProjectRateCard');
  if (btnCloseAddSubProjectRate) {
    btnCloseAddSubProjectRate.addEventListener('click', () => {
      const addRateCard = document.getElementById('addSubProjectRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const reportCard = document.getElementById('subProjectTypeReportCard');
      if (reportCard) reportCard.classList.remove('card-dimmed-blurred');
    });
  }

  // Save Sub - Project Rate Details via Bottom Save Button
  const btnSubmitSubProjRate = document.getElementById('btnSubmitSubProjectRate');
  if (btnSubmitSubProjRate) {
    btnSubmitSubProjRate.addEventListener('click', () => {
      const fromVal = document.getElementById('inpSubProjectRateFrom')?.value || '01 - 01 - 2026';
      const toVal = document.getElementById('inpSubProjectRateTo')?.value || '01 - 01 - 2026';
      const rateVal = document.getElementById('inpSubProjectRateValue')?.value || '2000.00';
      const isStatusActive = document.getElementById('inpSubProjectRateStatusToggle')?.checked;
      const statusVal = isStatusActive ? 'Active' : 'In - Active';

      subProjectTypeReportData.push({
        id: 'sptr-' + Date.now(),
        from: fromVal,
        to: toVal,
        rate: rateVal,
        status: statusVal
      });

      renderSubProjectTypeReportTable();

      const addRateCard = document.getElementById('addSubProjectRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const reportCard = document.getElementById('subProjectTypeReportCard');
      if (reportCard) reportCard.classList.remove('card-dimmed-blurred');

      showToast('New details added to Sub - Project Type!');
    });
  }

  const btnCloseServiceProjectScope = document.getElementById('btnCloseServiceProjectScopePanel');
  if (btnCloseServiceProjectScope) {
    btnCloseServiceProjectScope.addEventListener('click', () => {
      const sp = document.getElementById('vendorServiceProjectScopeSidePanel');
      if (sp) sp.style.display = 'none';
      const ap = document.getElementById('addSubProjectTypeCard');
      if (ap) ap.style.display = 'none';
      const repCard = document.getElementById('subProjectTypeReportCard');
      if (repCard) repCard.style.display = 'none';
      const rateCard = document.getElementById('addSubProjectRateFormCard');
      if (rateCard) rateCard.style.display = 'none';
      const vendorCard = document.getElementById('addVendorCard');
      if (vendorCard) vendorCard.classList.remove('card-dimmed-blurred');
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
      showToast('Project Scope closed');
    });
  }

  const btnServiceTransportAdd = document.getElementById('btnServiceTransportScopeAddRow');
  if (btnServiceTransportAdd) {
    btnServiceTransportAdd.addEventListener('click', () => {
      const scopePanel = document.getElementById('vendorServiceTransportScopeSidePanel');
      if (scopePanel) scopePanel.classList.add('card-dimmed-blurred');

      const addVehCard = document.getElementById('addVehicleScopeCard');
      if (addVehCard) addVehCard.style.display = 'block';

      showToast('Add Vehicle form opened');
    });
  }

  // Close Add Vehicle form card
  const btnCloseAddVehicle = document.getElementById('btnCloseAddVehicleScopeCard');
  if (btnCloseAddVehicle) {
    btnCloseAddVehicle.addEventListener('click', () => {
      const addVehCard = document.getElementById('addVehicleScopeCard');
      if (addVehCard) addVehCard.style.display = 'none';
      const scopePanel = document.getElementById('vendorServiceTransportScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');
    });
  }

  // Save Vehicle via Bottom Save Button
  const btnSubmitVehicle = document.getElementById('btnSubmitVehicleScope');
  if (btnSubmitVehicle) {
    btnSubmitVehicle.addEventListener('click', () => {
      const vTypeVal = document.getElementById('selAddVehicleType')?.value || 'LCV';
      const vNumVal = document.getElementById('inpAddVehicleNumber')?.value || ('230510' + Math.floor(100 + Math.random() * 900));
      const fuelVal = document.getElementById('selAddVehicleFuelType')?.value || 'Petrol';
      const rangeVal = document.getElementById('inpAddVehicleRange')?.value || 'Project';
      const rentalVal = document.getElementById('selAddVehicleRentalType')?.value || 'Monthly';
      const isStatusActive = document.getElementById('inpAddVehicleStatusToggle')?.checked;
      const statusVal = isStatusActive ? 'Active' : 'In - Active';

      const newRec = {
        id: 'sts-' + Date.now(),
        vehicleType: vTypeVal,
        vehicleNumber: vNumVal,
        fuelType: fuelVal,
        range: rangeVal,
        rentalType: rentalVal,
        status: statusVal
      };

      vendorServiceTransportScopeData.push(newRec);
      renderVendorServiceTransportScopeTable();

      const addVehCard = document.getElementById('addVehicleScopeCard');
      if (addVehCard) addVehCard.style.display = 'none';
      const scopePanel = document.getElementById('vendorServiceTransportScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');

      showToast('New Vehicle added to Transport Scope!');
    });
  }

  // Vehicle Payment Report Table Data & Events
  renderVehicleReportTable();
  initCalendarPicker('btnVehicleRateFromCalendar', 'inpVehicleRateFrom', 'inpVehicleRateFromNative');
  initCalendarPicker('btnVehicleRateToCalendar', 'inpVehicleRateTo', 'inpVehicleRateToNative');

  // Vehicle Payment Report Icon Click (Opens Vehicle # Report Tab)
  const btnVehReport = document.getElementById('btnVehicleReportIcon');
  if (btnVehReport) {
    btnVehReport.addEventListener('click', () => {
      const addVehCard = document.getElementById('addVehicleScopeCard');
      if (addVehCard) addVehCard.classList.add('card-dimmed-blurred');

      const vNum = document.getElementById('inpAddVehicleNumber')?.value.trim();
      const reportTitle = document.getElementById('lblVehicleReportTitle');
      if (reportTitle) {
        reportTitle.textContent = vNum ? `Vehicle #: ${vNum}` : 'Vehicle #:';
      }

      const reportCard = document.getElementById('vehicleReportCard');
      if (reportCard) reportCard.style.display = 'block';

      renderVehicleReportTable();
      showToast('Vehicle Payment Report opened');
    });
  }

  // Close Vehicle Payment Report Tab
  const btnCloseVehReport = document.getElementById('btnCloseVehicleReportCard');
  if (btnCloseVehReport) {
    btnCloseVehReport.addEventListener('click', () => {
      const reportCard = document.getElementById('vehicleReportCard');
      if (reportCard) reportCard.style.display = 'none';
      const addRateCard = document.getElementById('addVehicleRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const addVehCard = document.getElementById('addVehicleScopeCard');
      if (addVehCard) addVehCard.classList.remove('card-dimmed-blurred');
    });
  }

  // Plus (+) icon in Vehicle Report Tab (Opens Add Vehicle Details Form)
  const btnVehReportAdd = document.getElementById('btnVehicleReportAddRow');
  if (btnVehReportAdd) {
    btnVehReportAdd.addEventListener('click', () => {
      const reportCard = document.getElementById('vehicleReportCard');
      if (reportCard) reportCard.classList.add('card-dimmed-blurred');

      const addRateCard = document.getElementById('addVehicleRateFormCard');
      if (addRateCard) addRateCard.style.display = 'block';

      showToast('Add Vehicle Details form opened');
    });
  }

  // Close Add Vehicle Details Form
  const btnCloseAddVehicleRate = document.getElementById('btnCloseAddVehicleRateCard');
  if (btnCloseAddVehicleRate) {
    btnCloseAddVehicleRate.addEventListener('click', () => {
      const addRateCard = document.getElementById('addVehicleRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const reportCard = document.getElementById('vehicleReportCard');
      if (reportCard) reportCard.classList.remove('card-dimmed-blurred');
    });
  }

  // Save Vehicle Rate Details via Bottom Save Button
  const btnSubmitVehRate = document.getElementById('btnSubmitVehicleRate');
  if (btnSubmitVehRate) {
    btnSubmitVehRate.addEventListener('click', () => {
      const fromVal = document.getElementById('inpVehicleRateFrom')?.value || '01 - 01 - 2026';
      const toVal = document.getElementById('inpVehicleRateTo')?.value || '01 - 01 - 2026';
      const rentVal = document.getElementById('inpVehicleRentalAmount')?.value || '2000.00';
      const haltVal = document.getElementById('inpVehicleHaltAmount')?.value || '2000.00';
      const isStatusActive = document.getElementById('inpVehicleRateStatusToggle')?.checked;
      const statusVal = isStatusActive ? 'Active' : 'In - Active';

      vehicleReportData.push({
        id: 'vr-' + Date.now(),
        from: fromVal,
        to: toVal,
        rentalAmount: rentVal,
        haltAmount: haltVal,
        status: statusVal
      });

      renderVehicleReportTable();

      const addRateCard = document.getElementById('addVehicleRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const reportCard = document.getElementById('vehicleReportCard');
      if (reportCard) reportCard.classList.remove('card-dimmed-blurred');

      showToast('New details added to Vehicle Report!');
    });
  }

  const btnCloseServiceTransportScope = document.getElementById('btnCloseServiceTransportScopePanel');
  if (btnCloseServiceTransportScope) {
    btnCloseServiceTransportScope.addEventListener('click', () => {
      const sp = document.getElementById('vendorServiceTransportScopeSidePanel');
      if (sp) sp.style.display = 'none';
      const addVehCard = document.getElementById('addVehicleScopeCard');
      if (addVehCard) addVehCard.style.display = 'none';
      const vehRepCard = document.getElementById('vehicleReportCard');
      if (vehRepCard) vehRepCard.style.display = 'none';
      const vehRateCard = document.getElementById('addVehicleRateFormCard');
      if (vehRateCard) vehRateCard.style.display = 'none';
      const vendorCard = document.getElementById('addVendorCard');
      if (vendorCard) vendorCard.classList.remove('card-dimmed-blurred');
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
      showToast('Transport Scope closed');
    });
  }

  // Service (Others) Scope Table Data & Events
  renderVendorServiceOthersScopeTable();
  initServiceOthersScopeTableFilters();

  const btnServiceOthersAdd = document.getElementById('btnServiceOthersScopeAddRow');
  if (btnServiceOthersAdd) {
    btnServiceOthersAdd.addEventListener('click', () => {
      const scopePanel = document.getElementById('vendorServiceOthersScopeSidePanel');
      if (scopePanel) scopePanel.classList.add('card-dimmed-blurred');

      const addOtherCard = document.getElementById('addOtherServiceScopeCard');
      if (addOtherCard) addOtherCard.style.display = 'block';

      showToast('Add Service form opened');
    });
  }

  // Close Add Other Service form card
  const btnCloseAddOtherService = document.getElementById('btnCloseAddOtherServiceScopeCard');
  if (btnCloseAddOtherService) {
    btnCloseAddOtherService.addEventListener('click', () => {
      const addOtherCard = document.getElementById('addOtherServiceScopeCard');
      if (addOtherCard) addOtherCard.style.display = 'none';
      const scopePanel = document.getElementById('vendorServiceOthersScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');
    });
  }

  // Save Other Service via Bottom Save Button
  const btnSubmitOtherService = document.getElementById('btnSubmitOtherServiceScope');
  if (btnSubmitOtherService) {
    btnSubmitOtherService.addEventListener('click', () => {
      const descVal = document.getElementById('selAddOtherServiceDesc')?.value || 'Petrol';
      const uomVal = document.getElementById('selAddOtherServiceUom')?.value || 'Project';
      const rateVal = document.getElementById('inpAddOtherServiceRate')?.value || '1500.00';
      const isStatusActive = document.getElementById('inpAddOtherServiceStatusToggle')?.checked;
      const statusVal = isStatusActive ? 'Active' : 'In - Active';
      const today = '01 - 01 - 2026';

      const newRec = {
        id: 'sot-' + Date.now(),
        from: today,
        to: today,
        description: descVal,
        uom: uomVal,
        status: statusVal
      };

      vendorServiceOthersScopeData.push(newRec);
      renderVendorServiceOthersScopeTable();

      const addOtherCard = document.getElementById('addOtherServiceScopeCard');
      if (addOtherCard) addOtherCard.style.display = 'none';
      const scopePanel = document.getElementById('vendorServiceOthersScopeSidePanel');
      if (scopePanel) scopePanel.classList.remove('card-dimmed-blurred');

      showToast('New Service added to Other Service Scope!');
    });
  }

  // Other Service Payment Report Table Data & Events
  renderOtherServiceReportTable();
  initCalendarPicker('btnOtherServiceRateFromCalendar', 'inpOtherServiceRateFrom', 'inpOtherServiceRateFromNative');
  initCalendarPicker('btnOtherServiceRateToCalendar', 'inpOtherServiceRateTo', 'inpOtherServiceRateToNative');

  // Other Service Payment Report Icon Click (Opens Service Description Report Tab)
  const btnOtherServiceReport = document.getElementById('btnOtherServiceReportIcon');
  if (btnOtherServiceReport) {
    btnOtherServiceReport.addEventListener('click', () => {
      const addOtherCard = document.getElementById('addOtherServiceScopeCard');
      if (addOtherCard) addOtherCard.classList.add('card-dimmed-blurred');

      const sDesc = document.getElementById('selAddOtherServiceDesc')?.value;
      const reportTitle = document.getElementById('lblOtherServiceReportTitle');
      if (reportTitle) {
        reportTitle.textContent = sDesc ? sDesc : 'Service Description';
      }

      const reportCard = document.getElementById('otherServiceReportCard');
      if (reportCard) reportCard.style.display = 'block';

      renderOtherServiceReportTable();
      showToast('Service Payment Report opened');
    });
  }

  // Close Other Service Payment Report Tab
  const btnCloseOtherServiceReport = document.getElementById('btnCloseOtherServiceReportCard');
  if (btnCloseOtherServiceReport) {
    btnCloseOtherServiceReport.addEventListener('click', () => {
      const reportCard = document.getElementById('otherServiceReportCard');
      if (reportCard) reportCard.style.display = 'none';
      const addRateCard = document.getElementById('addOtherServiceRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const addOtherCard = document.getElementById('addOtherServiceScopeCard');
      if (addOtherCard) addOtherCard.classList.remove('card-dimmed-blurred');
    });
  }

  // Plus (+) icon in Service Description Report Tab (Opens Add Service Details Form)
  const btnOtherServiceReportAdd = document.getElementById('btnOtherServiceReportAddRow');
  if (btnOtherServiceReportAdd) {
    btnOtherServiceReportAdd.addEventListener('click', () => {
      const reportCard = document.getElementById('otherServiceReportCard');
      if (reportCard) reportCard.classList.add('card-dimmed-blurred');

      const addRateCard = document.getElementById('addOtherServiceRateFormCard');
      if (addRateCard) addRateCard.style.display = 'block';

      showToast('Add Service Details form opened');
    });
  }

  // Close Add Other Service Details Form
  const btnCloseAddOtherServiceRate = document.getElementById('btnCloseAddOtherServiceRateCard');
  if (btnCloseAddOtherServiceRate) {
    btnCloseAddOtherServiceRate.addEventListener('click', () => {
      const addRateCard = document.getElementById('addOtherServiceRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const reportCard = document.getElementById('otherServiceReportCard');
      if (reportCard) reportCard.classList.remove('card-dimmed-blurred');
    });
  }

  // Save Other Service Rate Details via Bottom Save Button
  const btnSubmitOtherServiceRate = document.getElementById('btnSubmitOtherServiceRate');
  if (btnSubmitOtherServiceRate) {
    btnSubmitOtherServiceRate.addEventListener('click', () => {
      const fromVal = document.getElementById('inpOtherServiceRateFrom')?.value || '01 - 01 - 2026';
      const toVal = document.getElementById('inpOtherServiceRateTo')?.value || '01 - 01 - 2026';
      const rateVal = document.getElementById('inpOtherServiceRateAmount')?.value || '2000.00';
      const isStatusActive = document.getElementById('inpOtherServiceRateStatusToggle')?.checked;
      const statusVal = isStatusActive ? 'Active' : 'In - Active';

      otherServiceReportData.push({
        id: 'osr-' + Date.now(),
        from: fromVal,
        to: toVal,
        rate: rateVal,
        status: statusVal
      });

      renderOtherServiceReportTable();

      const addRateCard = document.getElementById('addOtherServiceRateFormCard');
      if (addRateCard) addRateCard.style.display = 'none';
      const reportCard = document.getElementById('otherServiceReportCard');
      if (reportCard) reportCard.classList.remove('card-dimmed-blurred');

      showToast('New details added to Service Report!');
    });
  }

  const btnCloseServiceOthersScope = document.getElementById('btnCloseServiceOthersScopePanel');
  if (btnCloseServiceOthersScope) {
    btnCloseServiceOthersScope.addEventListener('click', () => {
      const sp = document.getElementById('vendorServiceOthersScopeSidePanel');
      if (sp) sp.style.display = 'none';
      const addOtherCard = document.getElementById('addOtherServiceScopeCard');
      if (addOtherCard) addOtherCard.style.display = 'none';
      const osrCard = document.getElementById('otherServiceReportCard');
      if (osrCard) osrCard.style.display = 'none';
      const osrRateCard = document.getElementById('addOtherServiceRateFormCard');
      if (osrRateCard) osrRateCard.style.display = 'none';
      const vendorCard = document.getElementById('addVendorCard');
      if (vendorCard) vendorCard.classList.remove('card-dimmed-blurred');
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
      showToast('Other Service Scope closed');
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

      if (currentIndusSubpage === 'products') {
        const itemCode = document.getElementById('inpGbpaItemCode')?.value || "KTN";
        const productName = document.getElementById('inpGbpaProductName')?.value || "230510678";
        const productType = document.getElementById('inpGbpaProductType')?.value || "Capex";
        const productDescription = document.getElementById('inpGbpaProductDescription')?.value || "KTN";
        const uom = document.getElementById('inpGbpaUom')?.value || "Pcs";
        const hsnSacType = document.getElementById('inpGbpaHsnSac')?.value || "HSN";
        const hsnSacCode = document.getElementById('inpGbpaHsnSacCode')?.value || "R/RL-234567";
        const budgetPercent = document.getElementById('inpGbpaBudgetPercent')?.value || "95";
        const statusToggle = document.getElementById('inpGbpaStatusToggle');
        const status = (statusToggle && statusToggle.checked) ? "Active" : "In - Active";

        const newRecord = {
          id: `gbpa-${Date.now()}`,
          itemCode,
          productName,
          productType,
          productDescription,
          hsnSacType,
          hsnSacCode,
          activeRate: "11000.00",
          budgetPercent,
          budgetAmount: "11000.00",
          status
        };

        indusProductsData.push(newRecord);
        loadIndusDataset();
        applyFiltersAndRender();
        closeSideForm();
        showToast(`GBPA item ${itemCode} successfully saved & added to table!`);
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
      const expenseHead = document.getElementById('inpExpenseHead')?.value || "Project";
      const expenseCode = document.getElementById('inpExpenseCode')?.value || "";
      const sacCode = document.getElementById('inpExpenseSac')?.value || "";
      const expenseDescription = document.getElementById('inpExpenseDesc')?.value || "";
      const uom = document.getElementById('inpExpenseUom')?.value || "Pcs";
      const gstRate = document.getElementById('inpExpenseGstRate')?.value || "18%";
      const tdsRate = document.getElementById('inpExpenseTdsRate')?.value || "1%";
      const expenseRcmToggle = document.getElementById('inpExpenseRcmToggle');
      const rcm = (expenseRcmToggle && expenseRcmToggle.checked) ? "Yes" : "No";
      const expenseStatusToggle = document.getElementById('inpExpenseStatusToggle');
      const status = (expenseStatusToggle && expenseStatusToggle.checked) ? "Active" : "In - Active";

      const newRecord = {
        id: `exp-${Date.now()}`,
        expenseHead,
        expenseCode,
        sacCode,
        expenseDescription,
        uom,
        gstRate,
        tdsRate,
        rcm,
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
      const uom = document.getElementById('inpProductUom')?.value || "Pcs";
      const msq = document.getElementById('inpProductMsq')?.value || "";
      const moq = document.getElementById('inpProductMoq')?.value || "";
      const stockPrices = document.getElementById('inpProductStockPrices')?.value || "";
      const oh = document.getElementById('inpProductOh')?.value || "1%";
      const margin = document.getElementById('inpProductMargin')?.value || "1%";
      const gstRate = document.getElementById('inpProductGstRate')?.value || "18%";
      const productStatusToggle = document.getElementById('inpProductStatusToggle');
      const status = (productStatusToggle && productStatusToggle.checked) ? "Active" : "In - Active";

      const newRecord = {
        id: `prod-${Date.now()}`,
        productHead,
        productCode,
        hsnCode,
        productDescription,
        uom,
        msq,
        moq,
        stockPrices,
        oh,
        margin,
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
  const btnSubmitEmployee = document.getElementById('btnSubmitEmployee');
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
  if (btnSubmitEmployee) btnSubmitEmployee.addEventListener('click', handleFormSave);
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

  const btnCloseEmployeeForm = document.getElementById('btnCloseEmployeeForm');
  if (btnCloseEmployeeForm) btnCloseEmployeeForm.addEventListener('click', closeSideForm);

  // Photo Image Upload Handler
  const btnEmpPhoto = document.getElementById('btnEmpPhotoUpload');
  if (btnEmpPhoto) {
    btnEmpPhoto.addEventListener('click', () => {
      const imgInput = document.createElement('input');
      imgInput.type = 'file';
      imgInput.accept = 'image/*';
      imgInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          const photoPathInput = document.getElementById('inpEmpPhoto');
          if (photoPathInput) photoPathInput.value = files[0].name;
          showToast(`Selected photo: ${files[0].name}`);
        }
      });
      imgInput.click();
    });
  }

  // Qualification / PAN / Aadhar PDF Upload Handlers
  document.querySelectorAll('.btn-emp-pdf-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const pdfInput = document.createElement('input');
      pdfInput.type = 'file';
      pdfInput.accept = '.pdf,application/pdf';
      pdfInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          showToast(`Uploaded PDF: ${files[0].name}`);
        }
      });
      pdfInput.click();
    });
  });

  // Calendar Trigger Handlers (Opens date/month/year picker)
  document.querySelectorAll('.btn-emp-calendar-trigger, .btn-calendar-trigger, .input-pdf-badge[title*="Date"], .input-pdf-badge[title*="DOB"], .input-pdf-badge[title*="DOJ"]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      let input = null;
      if (trigger.getAttribute('for')) {
        input = document.getElementById(trigger.getAttribute('for'));
      }
      if (!input && trigger.parentElement) {
        input = trigger.parentElement.querySelector('input[type="date"], input');
      }
      if (input) {
        if (typeof input.showPicker === 'function') {
          try {
            input.showPicker();
          } catch(e) {
            input.focus();
          }
        } else {
          input.focus();
        }
      }
    });
  });
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
  if (btnVendorMessage) {
    btnVendorMessage.addEventListener('click', (e) => {
      e.stopPropagation();
      openVendorContactSidePanel();
    });
  }

  const btnVendorScope = document.getElementById('btnVendorCardScope');
  if (btnVendorScope) {
    btnVendorScope.addEventListener('click', (e) => {
      e.stopPropagation();
      const vendorType = document.getElementById('inpVendorType')?.value;
      const serviceType = document.getElementById('inpServiceType')?.value;

      if (vendorType === 'Service') {
        if (serviceType === 'Transport') {
          openVendorServiceTransportScopeSidePanel();
        } else if (serviceType === 'Others') {
          openVendorServiceOthersScopeSidePanel();
        } else {
          openVendorServiceProjectScopeSidePanel();
        }
      } else if (vendorType === 'Supply') {
        openVendorSupplyScopeSidePanel();
      } else {
        openVendorSupplyScopeSidePanel();
      }
    });
  }
  // --- ADD VENDOR: BUSINESS TYPE CONTROLLER (SHOW/HIDE TCS DEDUCTION & SERVICE FIELDS) ---
  function updateVendorBusinessTypeFields() {
    const vType = document.getElementById('inpVendorType')?.value;
    const rowServiceType = document.getElementById('rowVendorServiceType');
    const rowTdsDeduction = document.getElementById('rowVendorTdsDeduction');
    const rowTdsRate = document.getElementById('rowVendorTdsRate');
    const rowTcsDeduction = document.getElementById('rowVendorTcsDeduction');

    if (vType === 'Supply') {
      // Show TCS Deduction when Supply is selected
      if (rowTcsDeduction) rowTcsDeduction.style.display = 'flex';
      // Hide Service-only fields
      if (rowServiceType) rowServiceType.style.display = 'none';
      if (rowTdsDeduction) rowTdsDeduction.style.display = 'none';
      if (rowTdsRate) rowTdsRate.style.display = 'none';
    } else if (vType === 'Service') {
      // Hide TCS Deduction when Service is selected
      if (rowTcsDeduction) rowTcsDeduction.style.display = 'none';
      // Show Service-only fields
      if (rowServiceType) rowServiceType.style.display = 'flex';
      if (rowTdsDeduction) rowTdsDeduction.style.display = 'flex';
      if (rowTdsRate) rowTdsRate.style.display = 'flex';
    }
  }
  window.updateVendorBusinessTypeFields = updateVendorBusinessTypeFields;

  const inpVendorType = document.getElementById('inpVendorType');
  const inpTdsToggle = document.getElementById('inpTdsDeductionToggle');
  if (inpVendorType) {
    inpVendorType.addEventListener('change', updateVendorBusinessTypeFields);
  }
  if (inpTdsToggle) {
    inpTdsToggle.addEventListener('change', updateVendorBusinessTypeFields);
  }
  updateVendorBusinessTypeFields();

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

  const salaryPanel = document.getElementById('salaryDetailsSidePanel');
  const assetPanel = document.getElementById('assetDetailsSidePanel');
  const btnEmpSalary = document.getElementById('btnEmpSalaryDetails');
  const btnEmpAsset = document.getElementById('btnEmpAssetDetails');
  const btnCloseSalaryCard = document.getElementById('btnCloseSalaryCard');
  const btnCloseAssetCard = document.getElementById('btnCloseAssetCard');

  function updateCardDimmedState() {
    const holidayPanel = document.getElementById('holidaysSidePanel');
    const isAnyPopupOpen = 
      (bankPanel && bankPanel.style.display !== 'none' && bankPanel.style.display !== '') ||
      (holidayPanel && holidayPanel.style.display !== 'none' && holidayPanel.style.display !== '') ||
      (salaryPanel && salaryPanel.style.display !== 'none' && salaryPanel.style.display !== '') ||
      (assetPanel && assetPanel.style.display !== 'none' && assetPanel.style.display !== '') ||
      (contactPanel && contactPanel.style.display !== 'none' && contactPanel.style.display !== '') ||
      (locationPanel && locationPanel.style.display !== 'none' && locationPanel.style.display !== '');

    const cardsRow = document.querySelector('.side-form-cards-row');
    const empCard = document.getElementById('addEmployeeCard');
    const vendorCard = document.getElementById('addVendorCard');
    const customerCard = document.getElementById('addCustomerCard');
    const indusCard = document.getElementById('addIndusTowerCard');

    if (isAnyPopupOpen) {
      if (empCard && empCard.style.display !== 'none') empCard.classList.add('card-dimmed-blurred');
      if (vendorCard && vendorCard.style.display !== 'none') vendorCard.classList.add('card-dimmed-blurred');
      if (customerCard && customerCard.style.display !== 'none') customerCard.classList.add('card-dimmed-blurred');
      if (indusCard && indusCard.style.display !== 'none') indusCard.classList.add('card-dimmed-blurred');
      if (cardsRow) cardsRow.classList.add('has-dimmed-card');
    } else {
      if (empCard) empCard.classList.remove('card-dimmed-blurred');
      if (vendorCard) vendorCard.classList.remove('card-dimmed-blurred');
      if (customerCard) customerCard.classList.remove('card-dimmed-blurred');
      if (indusCard) indusCard.classList.remove('card-dimmed-blurred');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
    }
  }

  if (btnCloseBankCard && bankPanel) {
    btnCloseBankCard.addEventListener('click', () => {
      bankPanel.style.display = 'none';
      setBankEditableState(false);
      const indusCard = document.getElementById('addIndusTowerCard');
      if (indusCard) indusCard.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  const holidayPanel = document.getElementById('holidaysSidePanel');
  const btnCloseHolidaysCard = document.getElementById('btnCloseHolidaysCard');
  if (btnCloseHolidaysCard && holidayPanel) {
    btnCloseHolidaysCard.addEventListener('click', () => {
      holidayPanel.style.display = 'none';
      const indusCard = document.getElementById('addIndusTowerCard');
      if (indusCard) indusCard.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  const btnCloseLocationCard = document.getElementById('btnCloseLocationCard');
  if (btnCloseLocationCard && locationPanel) {
    btnCloseLocationCard.addEventListener('click', () => {
      locationPanel.style.display = 'none';
      const indusCard = document.getElementById('addIndusTowerCard');
      if (indusCard) indusCard.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  if (btnCloseSalaryCard && salaryPanel) {
    btnCloseSalaryCard.addEventListener('click', () => {
      salaryPanel.style.display = 'none';
      updateCardDimmedState();
    });
  }

  if (btnCloseAssetCard && assetPanel) {
    btnCloseAssetCard.addEventListener('click', () => {
      assetPanel.style.display = 'none';
      updateCardDimmedState();
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
  if (btnVendorBank) {
    btnVendorBank.addEventListener('click', (e) => {
      e.stopPropagation();
      openVendorBankSidePanel();
    });
  }

  const btnEmpBank = document.getElementById('btnEmpBankDetails');
  if (btnEmpBank && bankPanel) {
    btnEmpBank.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contactPanel) contactPanel.style.display = 'none';
      if (locationPanel) locationPanel.style.display = 'none';
      if (salaryPanel) salaryPanel.style.display = 'none';
      if (assetPanel) assetPanel.style.display = 'none';
      const isHidden = bankPanel.style.display === 'none' || bankPanel.style.display === '';
      bankPanel.style.display = isHidden ? 'flex' : 'none';
      updateCardDimmedState();
      if (isHidden) {
        showToast('Bank details opened');
      } else {
        showToast('Bank details closed');
      }
    });
  }

  if (btnEmpSalary && salaryPanel) {
    btnEmpSalary.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contactPanel) contactPanel.style.display = 'none';
      if (locationPanel) locationPanel.style.display = 'none';
      if (bankPanel) bankPanel.style.display = 'none';
      if (assetPanel) assetPanel.style.display = 'none';
      const isHidden = salaryPanel.style.display === 'none' || salaryPanel.style.display === '';
      salaryPanel.style.display = isHidden ? 'flex' : 'none';
      updateCardDimmedState();
      if (isHidden) {
        showToast('Salary Details opened');
      } else {
        showToast('Salary Details closed');
      }
    });
  }

  if (btnEmpAsset && assetPanel) {
    btnEmpAsset.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contactPanel) contactPanel.style.display = 'none';
      if (locationPanel) locationPanel.style.display = 'none';
      if (bankPanel) bankPanel.style.display = 'none';
      if (salaryPanel) salaryPanel.style.display = 'none';
      const isHidden = assetPanel.style.display === 'none' || assetPanel.style.display === '';
      assetPanel.style.display = isHidden ? 'flex' : 'none';
      updateCardDimmedState();
      if (isHidden) {
        showToast('Asset Details opened');
      } else {
        showToast('Asset Details closed');
      }
    });
  }

  const btnBankAddRow = document.getElementById('btnBankAddRow');
  const addBankCard = document.getElementById('addBankCard');
  const btnCloseAddBankCard = document.getElementById('btnCloseAddBankCard');
  const btnSubmitAddBank = document.getElementById('btnSubmitAddBank');

  if (btnBankAddRow && addBankCard && bankPanel) {
    btnBankAddRow.addEventListener('click', (e) => {
      e.stopPropagation();
      bankPanel.classList.add('card-dimmed-blurred');
      addBankCard.style.display = 'block';
      showToast('Add Bank Form opened');
    });
  }

  if (btnCloseAddBankCard && addBankCard && bankPanel) {
    btnCloseAddBankCard.addEventListener('click', () => {
      addBankCard.style.display = 'none';
      bankPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  if (btnSubmitAddBank && addBankCard && bankPanel) {
    btnSubmitAddBank.addEventListener('click', () => {
      const accName = document.getElementById('inpAddBankAccountName')?.value.trim() || 'ABC Private Ltd';
      const accNum = document.getElementById('inpAddBankAccountNumber')?.value.trim() || '12345678910';
      const bankName = document.getElementById('inpAddBankName')?.value.trim() || 'ABC Private Ltd';
      const ifsc = document.getElementById('inpAddBankIfsc')?.value.trim() || 'ABC Private';
      const responsible = document.getElementById('inpAddBankResponsible')?.value.trim() || 'ABC Private';
      const isStatusActive = document.getElementById('inpAddBankStatus')?.checked ?? true;

      const newRecord = {
        id: `cbank-${Date.now()}`,
        accountName: accName,
        accountNumber: accNum,
        bankName: bankName,
        ifscCode: ifsc,
        responsible: responsible,
        status: isStatusActive ? 'Active' : 'De-Active'
      };

      companyBankData.unshift(newRecord);
      renderCompanyBankTable();

      addBankCard.style.display = 'none';
      bankPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
      showToast(`Bank details for ${accName} added successfully!`);
    });
  }

  const btnHolidayAddRow = document.getElementById('btnHolidayAddRow');
  const addHolidayCard = document.getElementById('addHolidayCard');
  const btnCloseAddHolidayCard = document.getElementById('btnCloseAddHolidayCard');
  const btnSubmitAddHoliday = document.getElementById('btnSubmitAddHoliday');

  if (btnHolidayAddRow && addHolidayCard && holidayPanel) {
    btnHolidayAddRow.addEventListener('click', (e) => {
      e.stopPropagation();
      holidayPanel.classList.add('card-dimmed-blurred');
      addHolidayCard.style.display = 'block';
      const frm = document.getElementById('frmAddHoliday');
      if (frm) frm.reset();
      showToast('Add Holiday Form opened');
    });
  }

  if (btnCloseAddHolidayCard && addHolidayCard && holidayPanel) {
    btnCloseAddHolidayCard.addEventListener('click', () => {
      addHolidayCard.style.display = 'none';
      holidayPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  if (btnSubmitAddHoliday && addHolidayCard && holidayPanel) {
    btnSubmitAddHoliday.addEventListener('click', () => {
      const year = document.getElementById('inpAddHolidayYear')?.value.trim() || '2026';
      const month = document.getElementById('inpAddHolidayMonth')?.value.trim() || 'January';
      const date = document.getElementById('inpAddHolidayDate')?.value.trim() || '26';
      const day = document.getElementById('inpAddHolidayDay')?.value.trim() || 'Monday';
      const holidayName = document.getElementById('inpAddHolidayName')?.value.trim() || 'Republic Day';
      const isStatusActive = document.getElementById('inpAddHolidayStatus')?.checked ?? true;

      const newRecord = {
        id: `h-${Date.now()}`,
        year: year,
        month: month,
        date: date,
        day: day,
        holidayName: holidayName,
        status: isStatusActive ? 'Active' : 'In - Active'
      };

      companyHolidaysData.unshift(newRecord);
      renderCompanyHolidaysTable();

      addHolidayCard.style.display = 'none';
      holidayPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
      showToast(`Holiday "${holidayName}" added successfully!`);
    });
  }

  const btnLocationAddRow = document.getElementById('btnLocationAddRow');
  const addOfficeLocationCard = document.getElementById('addOfficeLocationCard');
  const btnCloseAddOfficeLocationCard = document.getElementById('btnCloseAddOfficeLocationCard');
  const btnSubmitAddOfficeLocation = document.getElementById('btnSubmitAddOfficeLocation');

  if (btnLocationAddRow && addOfficeLocationCard && locationPanel) {
    btnLocationAddRow.addEventListener('click', (e) => {
      e.stopPropagation();
      locationPanel.classList.add('card-dimmed-blurred');
      addOfficeLocationCard.style.display = 'block';
      const frm = document.getElementById('frmAddOfficeLocation');
      if (frm) frm.reset();
      showToast('Add Office Location Form opened');
    });
  }

  if (btnCloseAddOfficeLocationCard && addOfficeLocationCard && locationPanel) {
    btnCloseAddOfficeLocationCard.addEventListener('click', () => {
      addOfficeLocationCard.style.display = 'none';
      locationPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  if (btnSubmitAddOfficeLocation && addOfficeLocationCard && locationPanel) {
    btnSubmitAddOfficeLocation.addEventListener('click', () => {
      const code = document.getElementById('inpAddOfficeLocationCode')?.value.trim() || 'LOC-005';
      const name = document.getElementById('inpAddOfficeLocationName')?.value.trim() || 'Regional Office';
      const address = document.getElementById('inpAddOfficeLocationAddress')?.value.trim() || '';
      const lat = document.getElementById('inpAddOfficeLocationLat')?.value.trim() || '13.0827° N';
      const lng = document.getElementById('inpAddOfficeLocationLng')?.value.trim() || '80.2707° E';
      const incharge = document.getElementById('inpAddOfficeLocationIncharge')?.value.trim() || 'Manager';
      const llName = document.getElementById('inpAddOfficeLocationLLName')?.value.trim() || '';
      const llContact = document.getElementById('inpAddOfficeLocationLLContact')?.value.trim() || '';
      const rental = document.getElementById('inpAddOfficeLocationRental')?.value.trim() || '';
      const tdsDeduction = document.getElementById('inpAddOfficeLocationTDSDeduction')?.value.trim() || '';
      const tdsRate = document.getElementById('inpAddOfficeLocationTDSRate')?.value.trim() || '';
      const ebSc = document.getElementById('inpAddOfficeLocationEBSC')?.value.trim() || '';
      const isStatusActive = document.getElementById('inpAddOfficeLocationStatus')?.checked ?? true;

      const newRecord = {
        id: `loc-${Date.now()}`,
        officeCode: code,
        officeName: name,
        address: address,
        latitude: lat,
        longitude: lng,
        inCharge: incharge,
        llName: llName,
        llContact: llContact,
        rental: rental,
        tdsDeduction: tdsDeduction,
        tdsRate: tdsRate,
        ebSc: ebSc,
        status: isStatusActive ? 'Active' : 'In - Active'
      };

      companyLocationData.unshift(newRecord);
      renderCompanyLocationTable();

      addOfficeLocationCard.style.display = 'none';
      locationPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
      showToast(`Office "${name}" added successfully!`);
    });
  }

  // ==========================================================================
  // NEXUS INTERACTIVE CALENDAR DROPDOWN COMPONENT
  // ==========================================================================
  const calDropdown = document.getElementById('nexusCalendarDropdown');
  const calPrevBtn = document.getElementById('calPrevMonth');
  const calNextBtn = document.getElementById('calNextMonth');
  const calSelectMonth = document.getElementById('calSelectMonth');
  const calSelectYear = document.getElementById('calSelectYear');
  const calDaysGrid = document.getElementById('calDaysGrid');
  const calBtnToday = document.getElementById('calBtnToday');
  const calBtnClear = document.getElementById('calBtnClear');

  let calActiveInput = null;
  let calCurrentYear = new Date().getFullYear();
  let calCurrentMonth = new Date().getMonth(); // 0-11
  let calSelectedDate = null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function populateCalDropdowns() {
    if (!calSelectMonth || !calSelectYear) return;
    calSelectMonth.innerHTML = monthNames.map((m, idx) => `<option value="${idx}">${m.substring(0, 3)}</option>`).join('');

    const startYear = 1970;
    const endYear = 2050;
    let yearOptions = '';
    for (let y = startYear; y <= endYear; y++) {
      yearOptions += `<option value="${y}">${y}</option>`;
    }
    calSelectYear.innerHTML = yearOptions;

    calSelectMonth.addEventListener('change', () => {
      calCurrentMonth = parseInt(calSelectMonth.value, 10);
      renderCalendarDays();
    });

    calSelectYear.addEventListener('change', () => {
      calCurrentYear = parseInt(calSelectYear.value, 10);
      renderCalendarDays();
    });

    if (calPrevBtn) {
      calPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        calCurrentMonth--;
        if (calCurrentMonth < 0) {
          calCurrentMonth = 11;
          calCurrentYear--;
        }
        renderCalendarDays();
      });
    }

    if (calNextBtn) {
      calNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        calCurrentMonth++;
        if (calCurrentMonth > 11) {
          calCurrentMonth = 0;
          calCurrentYear++;
        }
        renderCalendarDays();
      });
    }

    if (calBtnToday) {
      calBtnToday.addEventListener('click', (e) => {
        e.stopPropagation();
        const now = new Date();
        selectCalendarDate(now.getFullYear(), now.getMonth(), now.getDate());
      });
    }

    if (calBtnClear) {
      calBtnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        if (calActiveInput) {
          calActiveInput.value = '';
          calActiveInput.dispatchEvent(new Event('input'));
          calActiveInput.dispatchEvent(new Event('change'));
        }
        closeNexusCalendar();
      });
    }
  }

  function renderCalendarDays() {
    if (!calDaysGrid || !calSelectMonth || !calSelectYear) return;
    calSelectMonth.value = calCurrentMonth;
    calSelectYear.value = calCurrentYear;

    const firstDayIndex = new Date(calCurrentYear, calCurrentMonth, 1).getDay(); // 0 is Sun
    const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    const today = new Date();

    let gridHtml = '';

    for (let i = 0; i < firstDayIndex; i++) {
      gridHtml += '<div class="cal-day-cell empty-day"></div>';
    }

    for (let day = 1; day <= totalDays; day++) {
      const isToday = today.getFullYear() === calCurrentYear && today.getMonth() === calCurrentMonth && today.getDate() === day;
      const isSelected = calSelectedDate &&
        calSelectedDate.getFullYear() === calCurrentYear &&
        calSelectedDate.getMonth() === calCurrentMonth &&
        calSelectedDate.getDate() === day;

      const classes = ['cal-day-cell'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');

      gridHtml += `<div class="${classes.join(' ')}" data-day="${day}">${day}</div>`;
    }

    calDaysGrid.innerHTML = gridHtml;

    calDaysGrid.querySelectorAll('.cal-day-cell:not(.empty-day)').forEach(cell => {
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        const day = parseInt(cell.getAttribute('data-day'), 10);
        selectCalendarDate(calCurrentYear, calCurrentMonth, day);
      });
    });
  }

  function selectCalendarDate(year, monthIndex, day) {
    if (calActiveInput) {
      const dd = String(day).padStart(2, '0');
      const mm = String(monthIndex + 1).padStart(2, '0');
      const formatted = `${dd} - ${mm} - ${year}`;
      calActiveInput.value = formatted;
      calActiveInput.dispatchEvent(new Event('input'));
      calActiveInput.dispatchEvent(new Event('change'));
    }
    closeNexusCalendar();
  }

  function openNexusCalendar(inputElement, triggerBtn) {
    if (!calDropdown) return;
    if (calActiveInput === inputElement && calDropdown.style.display === 'block') {
      closeNexusCalendar();
      return;
    }

    calActiveInput = inputElement;

    const val = (inputElement.value || '').trim();
    const parts = val.split('-').map(s => parseInt(s.trim(), 10));
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      let d, m, y;
      if (parts[0] > 1000) {
        y = parts[0]; m = parts[1] - 1; d = parts[2];
      } else {
        d = parts[0]; m = parts[1] - 1; y = parts[2];
      }
      calCurrentYear = y;
      calCurrentMonth = m;
      calSelectedDate = new Date(y, m, d);
    } else {
      const now = new Date();
      calCurrentYear = now.getFullYear();
      calCurrentMonth = now.getMonth();
      calSelectedDate = now;
    }

    renderCalendarDays();

    calDropdown.style.display = 'block';
    calDropdown.style.visibility = 'hidden';

    requestAnimationFrame(() => {
      const target = triggerBtn || inputElement;
      const rect = target.getBoundingClientRect();
      const dropWidth = calDropdown.offsetWidth || 280;
      const dropHeight = calDropdown.offsetHeight || 310;

      let top = rect.bottom + window.scrollY + 6;
      let left = rect.right - dropWidth + window.scrollX;

      if (left < 10) left = rect.left + window.scrollX;
      if (left + dropWidth > window.innerWidth - 10) {
        left = window.innerWidth - dropWidth - 14;
      }
      if (top + dropHeight > window.innerHeight + window.scrollY - 10) {
        top = rect.top + window.scrollY - dropHeight - 6;
      }

      calDropdown.style.top = `${Math.max(10, top)}px`;
      calDropdown.style.left = `${Math.max(10, left)}px`;
      calDropdown.style.visibility = 'visible';
    });
  }

  function closeNexusCalendar() {
    if (calDropdown) calDropdown.style.display = 'none';
    calActiveInput = null;
  }

  document.addEventListener('click', (e) => {
    if (calDropdown && calDropdown.style.display === 'block') {
      if (!calDropdown.contains(e.target) &&
          !e.target.closest('.btn-calendar-trigger') &&
          !e.target.closest('.nexus-cal-input') &&
          !e.target.closest('.btn-sub-project-calendar')) {
        closeNexusCalendar();
      }
    }
  });

  window.attachNexusCalendar = function(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (input) {
      input.addEventListener('click', (e) => {
        e.stopPropagation();
        openNexusCalendar(input, btn || input);
      });
    }
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openNexusCalendar(input || btn, btn);
      });
    }
  };

  populateCalDropdowns();

  // Attach to Salary and Asset inputs
  attachNexusCalendar('inpAddSalaryFrom', 'btnSalaryFromCalendar');
  attachNexusCalendar('inpAddSalaryTo', 'btnSalaryToCalendar');
  attachNexusCalendar('inpAddAssetDate', 'btnAssetDateCalendar');
  attachNexusCalendar('inpAddAssetExpiryDate', 'btnAssetExpiryDateCalendar');

  // Also attach to all Sub-Project, Vehicle, and Other Service Rate calendar fields
  attachNexusCalendar('inpSubProjectRateFrom', 'btnSubProjectRateFromCalendar');
  attachNexusCalendar('inpSubProjectRateTo', 'btnSubProjectRateToCalendar');
  attachNexusCalendar('inpVehicleRateFrom', 'btnVehicleRateFromCalendar');
  attachNexusCalendar('inpVehicleRateTo', 'btnVehicleRateToCalendar');
  attachNexusCalendar('inpOtherServiceRateFrom', 'btnOtherServiceRateFromCalendar');
  attachNexusCalendar('inpOtherServiceRateTo', 'btnOtherServiceRateToCalendar');

  const btnSalaryAddRow = document.getElementById('btnSalaryAddRow');
  const addSalaryCard = document.getElementById('addSalaryCard');
  const btnCloseAddSalaryCard = document.getElementById('btnCloseAddSalaryCard');
  const btnSubmitAddSalary = document.getElementById('btnSubmitAddSalary');

  if (btnSalaryAddRow && addSalaryCard && salaryPanel) {
    btnSalaryAddRow.addEventListener('click', (e) => {
      e.stopPropagation();
      salaryPanel.classList.add('card-dimmed-blurred');
      addSalaryCard.style.display = 'block';
      showToast('Add Salary Form opened');
    });
  }

  if (btnCloseAddSalaryCard && addSalaryCard && salaryPanel) {
    btnCloseAddSalaryCard.addEventListener('click', () => {
      addSalaryCard.style.display = 'none';
      closeNexusCalendar();
      salaryPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  function parseYearMonth(val, fallbackYear, fallbackMonth) {
    if (!val) return [fallbackYear, fallbackMonth];
    const parts = val.split('-').map(s => s.trim());
    if (parts.length === 3) {
      return parts[0].length === 4 ? [parts[0], parts[1]] : [parts[2] || fallbackYear, parts[1] || fallbackMonth];
    } else if (parts.length === 2) {
      return parts[0].length === 4 ? [parts[0], parts[1]] : [parts[1], parts[0]];
    }
    return [fallbackYear, fallbackMonth];
  }

  if (btnSubmitAddSalary && addSalaryCard && salaryPanel) {
    btnSubmitAddSalary.addEventListener('click', () => {
      const fromVal = document.getElementById('inpAddSalaryFrom')?.value.trim() || '01 - 01 - 2026';
      const toVal = document.getElementById('inpAddSalaryTo')?.value.trim() || '31 - 12 - 2026';
      const grossVal = parseFloat(document.getElementById('inpAddSalaryGross')?.value) || 42000;
      const epf = document.getElementById('inpAddSalaryEpf')?.value || '12%';
      const esi = document.getElementById('inpAddSalaryEsi')?.value || '0.75%';
      const isStatusActive = document.getElementById('inpAddSalaryStatus')?.checked ?? true;

      const [fromYear, fromMonth] = parseYearMonth(fromVal, '2026', '01');
      const [toYear, toMonth] = parseYearMonth(toVal, '2026', '12');
      const basic = (grossVal * 0.55).toFixed(2);
      const hra = (grossVal * 0.25).toFixed(2);
      const da = (grossVal * 0.12).toFixed(2);
      const sa = (grossVal * 0.08).toFixed(2);
      const total = grossVal.toFixed(2);

      const tbody = document.getElementById('tbodySalaryDetails');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-salary-year">${fromYear}</td>
          <td class="col-salary-month">${fromMonth}</td>
          <td class="col-salary-year">${toYear}</td>
          <td class="col-salary-month">${toMonth}</td>
          <td class="col-salary-sub col-salary-basic">${basic}</td>
          <td class="col-salary-sub col-salary-hra">${hra}</td>
          <td class="col-salary-sub col-salary-da">${da}</td>
          <td class="col-salary-sub col-salary-sa">${sa}</td>
          <td class="col-salary-sub col-salary-total">${total}</td>
          <td class="col-salary-status"><span class="status-badge ${isStatusActive ? 'status-active' : 'status-inactive'}">${isStatusActive ? 'Active' : 'De-Active'}</span></td>
        `;
        tbody.insertBefore(tr, tbody.firstChild);
      }

      addSalaryCard.style.display = 'none';
      closeNexusCalendar();
      salaryPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
      showToast('New Salary details saved successfully!');
    });
  }

  const btnAssetAddRow = document.getElementById('btnAssetAddRow');
  const addAssetCard = document.getElementById('addAssetCard');
  const btnCloseAddAssetCard = document.getElementById('btnCloseAddAssetCard');
  const btnSubmitAddAsset = document.getElementById('btnSubmitAddAsset');

  if (btnAssetAddRow && addAssetCard && assetPanel) {
    btnAssetAddRow.addEventListener('click', (e) => {
      e.stopPropagation();
      assetPanel.classList.add('card-dimmed-blurred');
      addAssetCard.style.display = 'block';
      showToast('Add Asset Form opened');
    });
  }

  if (btnCloseAddAssetCard && addAssetCard && assetPanel) {
    btnCloseAddAssetCard.addEventListener('click', () => {
      addAssetCard.style.display = 'none';
      closeNexusCalendar();
      assetPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
    });
  }

  if (btnSubmitAddAsset && addAssetCard && assetPanel) {
    btnSubmitAddAsset.addEventListener('click', () => {
      const date = document.getElementById('inpAddAssetDate')?.value.trim() || '01 - 01 - 2026';
      const details = document.getElementById('inpAddAssetDetails')?.value.trim() || 'Laptop Dell Latitude';
      const uom = document.getElementById('inpAddAssetUom')?.value || 'Nos';
      const qty = document.getElementById('inpAddAssetQty')?.value.trim() || '1';
      const rate = document.getElementById('inpAddAssetRate')?.value.trim() || '55000.00';
      const amount = document.getElementById('inpAddAssetAmount')?.value.trim() || (parseFloat(qty) * parseFloat(rate)).toFixed(2);
      const expiry = document.getElementById('inpAddAssetExpiryDate')?.value.trim() || '01 - 01 - 2027';

      const rateNum = parseFloat(rate) || 0;
      const amountNum = parseFloat(amount) || 0;

      const tbody = document.getElementById('tbodyAssetDetails');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="col-asset-date">${date}</td>
          <td class="col-asset-detail">${details}</td>
          <td class="col-asset-uom">${uom}</td>
          <td class="col-asset-qty">${qty}</td>
          <td class="col-asset-rate">${rateNum.toFixed(2)}</td>
          <td class="col-asset-amount">${amountNum.toFixed(2)}</td>
          <td class="col-asset-expiry">${expiry}</td>
        `;
        tbody.insertBefore(tr, tbody.firstChild);
      }

      addAssetCard.style.display = 'none';
      closeNexusCalendar();
      assetPanel.classList.remove('card-dimmed-blurred');
      updateCardDimmedState();
      showToast('New Asset details saved successfully!');
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
    let changed = false;
    if (contactPanel && contactPanel.style.display !== 'none' && contactPanel.style.display !== '') {
      const isInsideBtn = (btnMessage && btnMessage.contains(e.target)) || (btnInfraMessage && btnInfraMessage.contains(e.target)) || (btnVendorMessage && btnVendorMessage.contains(e.target));
      const excelDropdown = document.getElementById('excelFilterDropdown');
      const addContactCard = document.getElementById('addContactFormCard');
      const isInsideSub = (excelDropdown && excelDropdown.contains(e.target)) || (addContactCard && addContactCard.contains(e.target));
      if (!contactPanel.contains(e.target) && !isInsideBtn && !isInsideSub) {
        contactPanel.style.display = 'none';
        changed = true;
      }
    }
    if (locationPanel && locationPanel.style.display !== 'none' && locationPanel.style.display !== '') {
      if (!locationPanel.contains(e.target) && !btnLocation.contains(e.target)) {
        locationPanel.style.display = 'none';
        changed = true;
      }
    }
    if (bankPanel && bankPanel.style.display !== 'none' && bankPanel.style.display !== '') {
      if (!bankPanel.contains(e.target) && !(btnVendorBank && btnVendorBank.contains(e.target)) && !(btnEmpBank && btnEmpBank.contains(e.target))) {
        bankPanel.style.display = 'none';
        setBankEditableState(false);
        changed = true;
      }
    }
    if (salaryPanel && salaryPanel.style.display !== 'none' && salaryPanel.style.display !== '') {
      if (!salaryPanel.contains(e.target) && !(btnEmpSalary && btnEmpSalary.contains(e.target))) {
        salaryPanel.style.display = 'none';
        changed = true;
      }
    }
    if (assetPanel && assetPanel.style.display !== 'none' && assetPanel.style.display !== '') {
      if (!assetPanel.contains(e.target) && !(btnEmpAsset && btnEmpAsset.contains(e.target))) {
        assetPanel.style.display = 'none';
        changed = true;
      }
    }
    if (changed) {
      updateCardDimmedState();
    }
  });
}

function openSideForm() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const addEmployeeCard = document.getElementById('addEmployeeCard');
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
  const addGbpaCard = document.getElementById('addGbpaCard');
  const addIndusTowerCard = document.getElementById('addIndusTowerCard');

  if (addEmployeeCard) addEmployeeCard.style.display = 'none';
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
  if (addGbpaCard) addGbpaCard.style.display = 'none';
  if (addIndusTowerCard) addIndusTowerCard.style.display = 'none';

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
    } else if (currentIndusSubpage === 'products') {
      if (addGbpaCard) addGbpaCard.style.display = 'block';
    } else if (currentIndusSubpage === 'projects') {
      if (addProjectCard) {
        addProjectCard.style.display = 'block';
        const lblTitle = document.getElementById('lblProjectCardTitle');
        const btnEditToggle = document.getElementById('btnProjectCardEditToggle');
        const btnTransport = document.getElementById('btnProjectTransportIcon');
        const btnSurvey = document.getElementById('btnProjectSurveyIcon');
        const btnSaveWrap = document.querySelector('#frmAddProject .form-submit-inside-wrap');
        if (lblTitle) lblTitle.innerText = 'Add Project Type';
        if (btnEditToggle) btnEditToggle.style.display = 'none';
        if (btnTransport) btnTransport.style.display = 'none';
        if (btnSurvey) btnSurvey.style.display = 'none';
        if (btnSaveWrap) btnSaveWrap.style.display = 'flex';
        setProjectFormReadOnly(false);
        currentViewedProjectId = null;
        isProjectFormEditing = false;
      }
    } else if (currentIndusSubpage === 'infra') {
      if (addInfraCard) {
        addInfraCard.style.display = 'block';
        const lblTitle = document.getElementById('lblInfraCardTitle');
        const btnEditToggle = document.getElementById('btnInfraCardEditToggle');
        const btnSaveWrap = document.querySelector('#frmAddInfra .form-submit-inside-wrap');
        if (lblTitle) lblTitle.innerText = 'Add Infra';
        if (btnEditToggle) btnEditToggle.style.display = 'none';
        if (btnSaveWrap) btnSaveWrap.style.display = 'flex';
        setInfraFormReadOnly(false);
        currentViewedInfraId = null;
        isInfraFormEditing = false;
      }
    } else if (currentIndusSubpage === 'site') {
      if (addSiteCard) {
        addSiteCard.style.display = 'block';
        const lblTitle = document.getElementById('lblSiteCardTitle');
        const btnEditToggle = document.getElementById('btnSiteCardEditToggle');
        const btnSiteMsg = document.getElementById('btnSiteCardMessageIcon');
        const btnSaveWrap = document.querySelector('#frmAddSite .form-submit-inside-wrap');
        if (lblTitle) lblTitle.innerText = 'Add Sites';
        if (btnEditToggle) btnEditToggle.style.display = 'none';
        if (btnSiteMsg) btnSiteMsg.style.display = 'none';
        if (btnSaveWrap) btnSaveWrap.style.display = 'flex';
        setSiteFormReadOnly(false);
        currentViewedSiteId = null;
        isSiteFormEditing = false;
      }
    } else {
      if (addSiteCard) addSiteCard.style.display = 'block';
    }
  } else if (currentModule === 'master' && currentMasterSubpage === 'employee') {
    if (addEmployeeCard) {
      addEmployeeCard.style.display = 'block';
      const lblTitle = document.getElementById('lblEmployeeCardTitle');
      const btnEditToggle = document.getElementById('btnEmpCardEditToggle');
      const btnSaveWrap = document.querySelector('#frmAddEmployee .form-submit-inside-wrap');

      const btnEmpBank = document.getElementById('btnEmpBankDetails');
      const btnEmpAsset = document.getElementById('btnEmpAssetDetails');
      const btnEmpSalary = document.getElementById('btnEmpSalaryDetails');
      if (btnEmpBank) btnEmpBank.style.display = 'inline-flex';
      if (btnEmpAsset) btnEmpAsset.style.display = 'inline-flex';
      if (btnEmpSalary) btnEmpSalary.style.display = 'inline-flex';

      if (lblTitle) lblTitle.innerText = 'Add Employee';
      if (btnEditToggle) btnEditToggle.style.display = 'none';
      if (btnSaveWrap) btnSaveWrap.style.display = 'flex';

      setEmployeeFormReadOnly(false);
      currentViewedEmpId = null;
      isEmployeeFormEditing = false;
    }
  } else if (currentModule === 'master' && currentMasterSubpage === 'vendor') {
    if (addVendorCard) addVendorCard.style.display = 'block';
    if (typeof updateVendorBusinessTypeFields === 'function') updateVendorBusinessTypeFields();
  } else if (currentModule === 'master' && currentMasterSubpage === 'products') {
    if (addProductCard) {
      addProductCard.style.display = 'block';
      const lblTitle = document.getElementById('lblProductCardTitle');
      const btnEditToggle = document.getElementById('btnProductCardEditToggle');
      const btnSaveWrap = document.querySelector('#frmAddProduct .form-submit-inside-wrap');
      if (lblTitle) lblTitle.innerText = 'Add Product';
      if (btnEditToggle) btnEditToggle.style.display = 'none';
      if (btnSaveWrap) btnSaveWrap.style.display = 'flex';
      setProductFormReadOnly(false);
      currentViewedProductId = null;
      isProductFormEditing = false;
    }
  } else if (currentModule === 'master' && currentMasterSubpage === 'expenses') {
    if (addExpenseCard) {
      addExpenseCard.style.display = 'block';
      const lblTitle = document.getElementById('lblExpenseCardTitle');
      const btnEditToggle = document.getElementById('btnExpenseCardEditToggle');
      const btnSaveWrap = document.querySelector('#frmAddExpense .form-submit-inside-wrap');
      if (lblTitle) lblTitle.innerText = 'Add Expense';
      if (btnEditToggle) btnEditToggle.style.display = 'none';
      if (btnSaveWrap) btnSaveWrap.style.display = 'flex';
      setExpenseFormReadOnly(false);
      currentViewedExpenseId = null;
      isExpenseFormEditing = false;
    }
  } else {
    if (addCustomerCard) addCustomerCard.style.display = 'block';
  }

  // Reset all slidebar toggles to deactive stage (unchecked / OFF red) initially
  document.querySelectorAll('#sideFormOverlay input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });

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
  const holidayPanel = document.getElementById('holidaysSidePanel');
  if (holidayPanel) holidayPanel.style.display = 'none';
  const addHolidayCard = document.getElementById('addHolidayCard');
  if (addHolidayCard) addHolidayCard.style.display = 'none';
  const addOfficeLocationCard = document.getElementById('addOfficeLocationCard');
  if (addOfficeLocationCard) addOfficeLocationCard.style.display = 'none';
  const salaryPanel = document.getElementById('salaryDetailsSidePanel');
  if (salaryPanel) salaryPanel.style.display = 'none';
  const assetPanel = document.getElementById('assetDetailsSidePanel');
  if (assetPanel) assetPanel.style.display = 'none';
  const transportPanel = document.getElementById('transportDetailsSidePanel');
  if (transportPanel) transportPanel.style.display = 'none';
  const projectDocPanel = document.getElementById('projectTypeDocSidePanel');
  if (projectDocPanel) projectDocPanel.style.display = 'none';
  const vendorBankPanel = document.getElementById('vendorBankSideCard');
  if (vendorBankPanel) vendorBankPanel.style.display = 'none';
  const addContactCard = document.getElementById('addContactFormCard');
  if (addContactCard) addContactCard.style.display = 'none';
  const vendorSupplyScope = document.getElementById('vendorSupplyScopeSidePanel');
  if (vendorSupplyScope) vendorSupplyScope.style.display = 'none';
  const addProductScope = document.getElementById('addProductScopeCard');
  if (addProductScope) addProductScope.style.display = 'none';
  const addSubProjectTypeScope = document.getElementById('addSubProjectTypeCard');
  if (addSubProjectTypeScope) addSubProjectTypeScope.style.display = 'none';
  const subProjectTypeReportScope = document.getElementById('subProjectTypeReportCard');
  if (subProjectTypeReportScope) subProjectTypeReportScope.style.display = 'none';
  const addSubProjectRateScope = document.getElementById('addSubProjectRateFormCard');
  if (addSubProjectRateScope) addSubProjectRateScope.style.display = 'none';
  const addVehicleScope = document.getElementById('addVehicleScopeCard');
  if (addVehicleScope) addVehicleScope.style.display = 'none';
  const vehicleReportScope = document.getElementById('vehicleReportCard');
  if (vehicleReportScope) vehicleReportScope.style.display = 'none';
  const addVehicleRateScope = document.getElementById('addVehicleRateFormCard');
  if (addVehicleRateScope) addVehicleRateScope.style.display = 'none';
  const addOtherServiceScope = document.getElementById('addOtherServiceScopeCard');
  if (addOtherServiceScope) addOtherServiceScope.style.display = 'none';
  const otherServiceReportScope = document.getElementById('otherServiceReportCard');
  if (otherServiceReportScope) otherServiceReportScope.style.display = 'none';
  const addOtherServiceRateScope = document.getElementById('addOtherServiceRateFormCard');
  if (addOtherServiceRateScope) addOtherServiceRateScope.style.display = 'none';
  const vendorServiceProjectScope = document.getElementById('vendorServiceProjectScopeSidePanel');
  if (vendorServiceProjectScope) vendorServiceProjectScope.style.display = 'none';
  const vendorServiceTransportScope = document.getElementById('vendorServiceTransportScopeSidePanel');
  if (vendorServiceTransportScope) vendorServiceTransportScope.style.display = 'none';
  const vendorServiceOthersScope = document.getElementById('vendorServiceOthersScopeSidePanel');
  if (vendorServiceOthersScope) vendorServiceOthersScope.style.display = 'none';
  const notesModal = document.getElementById('projectPaymentNotesModal');
  if (notesModal) notesModal.style.display = 'none';
  const projectBankModal = document.getElementById('projectPaymentBankModal');
  if (projectBankModal) projectBankModal.style.display = 'none';
  const reportModal = document.getElementById('projectPaymentReportModal');
  if (reportModal) reportModal.style.display = 'none';
  const boqDetailModal = document.getElementById('boqDetailModal');
  if (boqDetailModal) boqDetailModal.style.display = 'none';
  // Remove blur from any dimmed cards and has-dimmed-card from row
  document.querySelectorAll('.card-dimmed-blurred').forEach(c => c.classList.remove('card-dimmed-blurred'));
  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
}

window.toggleSlideInput = function(toggleId, targetId) {
  const toggle = document.getElementById(toggleId);
  const target = document.getElementById(targetId);
  if (!toggle || !target) return;

  if (toggle.checked) {
    target.style.display = target.classList.contains('slide-dynamic-wrap') ? 'flex' : 'block';
    const textInput = target.tagName === 'INPUT' ? target : target.querySelector('input[type="text"]');
    if (textInput) textInput.focus();
  } else {
    target.style.display = 'none';
    const textInput = target.tagName === 'INPUT' ? target : target.querySelector('input[type="text"]');
    if (textInput) textInput.value = '';
  }
};

window.openContactDetailsSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const contactPanel = document.getElementById('contactDetailsSidePanel');
  if (contactPanel) {
    contactPanel.style.display = 'block';
  }

  renderVendorContactTable();
  overlay.style.display = 'flex';
  showToast('Opened Contact Details');
};

// Opens Contact Details panel as a child side tab next to Add Vendor card
window.openVendorContactSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim/blur the vendor card but keep it visible
  const vendorCard = document.getElementById('addVendorCard');
  if (vendorCard) vendorCard.classList.add('card-dimmed-blurred');

  // Mark the row for side panel layout
  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide other sub-panels
  ['locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard', 'vendorSupplyScopeSidePanel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const contactPanel = document.getElementById('contactDetailsSidePanel');
  if (contactPanel) {
    contactPanel.style.display = 'block';
  }

  renderVendorContactTable();
  overlay.style.display = 'flex';
  showToast('Contact Details opened');
};

// Opens Supply Scope panel as a child side tab next to Add Vendor card
window.openVendorSupplyScopeSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim/blur the parent vendor card
  const vendorCard = document.getElementById('addVendorCard');
  if (vendorCard) vendorCard.classList.add('card-dimmed-blurred');

  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide other sub-panels
  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard',
   'vendorServiceProjectScopeSidePanel', 'addSubProjectTypeCard', 'subProjectTypeReportCard',
   'addSubProjectRateFormCard', 'addVehicleScopeCard', 'vehicleReportCard', 'addVehicleRateFormCard',
   'vendorServiceOthersScopeSidePanel', 'addOtherServiceScopeCard', 'otherServiceReportCard', 'addOtherServiceRateFormCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const scopePanel = document.getElementById('vendorSupplyScopeSidePanel');
  if (scopePanel) {
    scopePanel.style.display = 'block';
  }

  // Dynamic ribbon title
  const vendorNameInput = document.getElementById('inpVendorName');
  const scopeTitle = document.getElementById('lblSupplyScopeTitle');
  if (scopeTitle) {
    const vName = vendorNameInput ? vendorNameInput.value.trim() : '';
    scopeTitle.textContent = vName ? `Supply ${vName}` : 'Supply Vendor Name';
  }

  renderVendorSupplyScopeTable();
  overlay.style.display = 'flex';
  showToast('Supply Scope details opened');
};

// Opens Project Vendor Scope panel as a child side tab next to Add Vendor card
window.openVendorServiceProjectScopeSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim/blur the parent vendor card
  const vendorCard = document.getElementById('addVendorCard');
  if (vendorCard) vendorCard.classList.add('card-dimmed-blurred');

  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide other sub-panels
  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard',
   'vendorSupplyScopeSidePanel', 'addProductScopeCard', 'addSubProjectTypeCard',
   'subProjectTypeReportCard', 'addSubProjectRateFormCard', 'addVehicleScopeCard',
   'vehicleReportCard', 'addVehicleRateFormCard',
   'vendorServiceTransportScopeSidePanel', 'vendorServiceOthersScopeSidePanel',
   'addOtherServiceScopeCard', 'otherServiceReportCard', 'addOtherServiceRateFormCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const scopePanel = document.getElementById('vendorServiceProjectScopeSidePanel');
  if (scopePanel) {
    scopePanel.style.display = 'block';
  }

  // Dynamic ribbon title
  const vendorNameInput = document.getElementById('inpVendorName');
  const scopeTitle = document.getElementById('lblServiceProjectScopeTitle');
  if (scopeTitle) {
    const vName = vendorNameInput ? vendorNameInput.value.trim() : '';
    scopeTitle.textContent = vName ? `Project ${vName}` : 'Project Vendor Name';
  }

  renderVendorServiceProjectScopeTable();
  overlay.style.display = 'flex';
  showToast('Project Scope details opened');
};

// Opens Service (Transport) Scope panel as a child side tab next to Add Vendor card
window.openVendorServiceTransportScopeSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const vendorCard = document.getElementById('addVendorCard');
  if (vendorCard) vendorCard.classList.add('card-dimmed-blurred');

  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard',
   'vendorSupplyScopeSidePanel', 'addProductScopeCard', 'addSubProjectTypeCard',
   'subProjectTypeReportCard', 'addSubProjectRateFormCard', 'addVehicleScopeCard',
   'vehicleReportCard', 'addVehicleRateFormCard',
   'vendorServiceProjectScopeSidePanel', 'vendorServiceOthersScopeSidePanel',
   'addOtherServiceScopeCard', 'otherServiceReportCard', 'addOtherServiceRateFormCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const scopePanel = document.getElementById('vendorServiceTransportScopeSidePanel');
  if (scopePanel) scopePanel.style.display = 'block';

  const vendorNameInput = document.getElementById('inpVendorName');
  const scopeTitle = document.getElementById('lblServiceTransportScopeTitle');
  if (scopeTitle) {
    const vName = vendorNameInput ? vendorNameInput.value.trim() : '';
    scopeTitle.textContent = vName ? `Transport ${vName}` : 'Transport Vendor Name';
  }

  renderVendorServiceTransportScopeTable();
  overlay.style.display = 'flex';
  showToast('Transport Scope details opened');
};

// Opens Service (Others) Scope panel as a child side tab next to Add Vendor card
window.openVendorServiceOthersScopeSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const vendorCard = document.getElementById('addVendorCard');
  if (vendorCard) vendorCard.classList.add('card-dimmed-blurred');

  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard',
   'vendorSupplyScopeSidePanel', 'addProductScopeCard', 'addSubProjectTypeCard',
   'subProjectTypeReportCard', 'addSubProjectRateFormCard', 'addVehicleScopeCard',
   'vehicleReportCard', 'addVehicleRateFormCard',
   'vendorServiceProjectScopeSidePanel', 'vendorServiceTransportScopeSidePanel',
   'addOtherServiceScopeCard', 'otherServiceReportCard', 'addOtherServiceRateFormCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const scopePanel = document.getElementById('vendorServiceOthersScopeSidePanel');
  if (scopePanel) scopePanel.style.display = 'block';

  const vendorNameInput = document.getElementById('inpVendorName');
  const scopeTitle = document.getElementById('lblServiceOthersScopeTitle');
  if (scopeTitle) {
    const vName = vendorNameInput ? vendorNameInput.value.trim() : '';
    scopeTitle.textContent = vName ? `Other Service ${vName}` : 'Other Service Vendor Name';
  }

  renderVendorServiceOthersScopeTable();
  overlay.style.display = 'flex';
  showToast('Other Service Scope details opened');
};

// Opens Transport Details panel as an overlay over the current View Project card
// The project card stays mounted in the DOM – no data is cleared
window.openTransportDetailsSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim/blur the project card but keep it visible (data stays intact)
  const projectCard = document.getElementById('addProjectCard');
  if (projectCard) projectCard.classList.add('card-dimmed-blurred');

  // Mark the row so the CSS overlay positioning kicks in
  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide any other popup panels that might be open
  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'projectTypeDocSidePanel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const transportPanel = document.getElementById('transportDetailsSidePanel');
  if (transportPanel) transportPanel.style.display = 'block';

  overlay.style.display = 'flex';
};

// Opens Project Type / Sub - Project Type Document panel as an overlay over the current View Project card
// The project card stays mounted in the DOM – no data is cleared or deleted
window.openProjectDocSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim/blur the project card but keep it visible (data stays intact)
  const projectCard = document.getElementById('addProjectCard');
  if (projectCard) projectCard.classList.add('card-dimmed-blurred');

  // Mark the row so the CSS overlay positioning kicks in
  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide any other popup panels that might be open
  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel', 'vendorBankSideCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const projectDocPanel = document.getElementById('projectTypeDocSidePanel');
  if (projectDocPanel) projectDocPanel.style.display = 'block';

  overlay.style.display = 'flex';
};

// Opens Vendor Bank Side Card as a child tab next to Add Vendor form
window.openVendorBankSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim/blur the vendor card but keep it visible
  const vendorCard = document.getElementById('addVendorCard');
  if (vendorCard) vendorCard.classList.add('card-dimmed-blurred');

  // Mark the row for side panel layout
  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide other sub-panels
  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const vendorBankCard = document.getElementById('vendorBankSideCard');
  if (vendorBankCard) {
    vendorBankCard.style.display = 'block';
  }

  // Set title to current vendor name if filled, else default
  const vendorNameInput = document.getElementById('inpVendorName');
  const vendorBankTitle = document.getElementById('lblVendorBankCardTitle');
  if (vendorBankTitle) {
    const vName = vendorNameInput ? vendorNameInput.value.trim() : '';
    vendorBankTitle.textContent = vName ? vName : 'Vendor Name';
  }

  // Reset to non-editing mode
  setVendorBankEditingState(false);
  overlay.style.display = 'flex';
  showToast('Vendor Bank details opened');
};

// Opens Company Bank Details panel as a child tab next to View Company card
window.openCompanyBankSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim the parent addIndusTowerCard
  const indusCard = document.getElementById('addIndusTowerCard');
  if (indusCard) indusCard.classList.add('card-dimmed-blurred');

  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide other sub-panels
  ['contactDetailsSidePanel', 'locationDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard',
   'vendorSupplyScopeSidePanel', 'addBankCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const bankPanel = document.getElementById('bankDetailsSidePanel');
  if (bankPanel) {
    bankPanel.classList.remove('card-dimmed-blurred');
    bankPanel.style.display = 'block';
  }

  renderCompanyBankTable();
  overlay.style.display = 'flex';
  showToast('Bank details opened');
};

// Opens Company Holidays Details panel as a child tab next to View Company card
window.openCompanyHolidaysSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim the parent addIndusTowerCard
  const indusCard = document.getElementById('addIndusTowerCard');
  if (indusCard) indusCard.classList.add('card-dimmed-blurred');

  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide other sub-panels
  ['contactDetailsSidePanel', 'locationDetailsSidePanel', 'bankDetailsSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard',
   'vendorSupplyScopeSidePanel', 'addBankCard', 'addHolidayCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const holidayPanel = document.getElementById('holidaysSidePanel');
  if (holidayPanel) {
    holidayPanel.classList.remove('card-dimmed-blurred');
    holidayPanel.style.display = 'block';
  }

  renderCompanyHolidaysTable();
  overlay.style.display = 'flex';
  showToast('Holidays opened');
};

// Opens Company Office Location Details panel as a child tab next to View Company card
window.openCompanyLocationSidePanel = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Dim the parent addIndusTowerCard
  const indusCard = document.getElementById('addIndusTowerCard');
  if (indusCard) indusCard.classList.add('card-dimmed-blurred');

  const cardsRow = document.querySelector('.side-form-cards-row');
  if (cardsRow) cardsRow.classList.add('has-dimmed-card');

  // Hide other sub-panels
  ['contactDetailsSidePanel', 'bankDetailsSidePanel', 'holidaysSidePanel',
   'salaryDetailsSidePanel', 'assetDetailsSidePanel', 'transportDetailsSidePanel',
   'projectTypeDocSidePanel', 'vendorBankSideCard', 'addContactFormCard',
   'vendorSupplyScopeSidePanel', 'addBankCard', 'addHolidayCard', 'addOfficeLocationCard'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const locPanel = document.getElementById('locationDetailsSidePanel');
  if (locPanel) {
    locPanel.classList.remove('card-dimmed-blurred');
    locPanel.style.display = 'block';
  }

  renderCompanyLocationTable();
  overlay.style.display = 'flex';
  showToast('Office Location opened');
};

let isIndusTowerEditing = false;

function setIndusTowerFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddIndusTower');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.type === 'checkbox' || input.type === 'file') return;
    if (isReadOnly) {
      if (input.tagName === 'SELECT') {
        input.setAttribute('disabled', 'true');
      } else {
        input.setAttribute('readonly', 'true');
      }
      input.style.backgroundColor = '#f8fafc';
    } else {
      if (input.tagName === 'SELECT') {
        input.removeAttribute('disabled');
      } else {
        input.removeAttribute('readonly');
      }
      input.style.backgroundColor = '#ffffff';
    }
  });

  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    t.disabled = isReadOnly;
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  });

  const uploadBadges = form.querySelectorAll('.input-pdf-badge, .btn-pdf-upload-badge, #btnIndusWcExpiryCalendar');
  uploadBadges.forEach(b => {
    b.style.pointerEvents = isReadOnly ? 'none' : 'auto';
    b.style.opacity = isReadOnly ? '0.65' : '1';
    b.style.cursor = isReadOnly ? 'default' : 'pointer';
  });

  const submitBtn = document.getElementById('btnSubmitIndusTower');
  if (submitBtn) {
    submitBtn.style.display = isReadOnly ? 'none' : 'flex';
  }
}

window.openIndusTowerPageCard = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Hide all side cards first
  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const indusCard = document.getElementById('addIndusTowerCard');
  if (indusCard) {
    indusCard.style.display = 'block';
    const lblTitle = document.getElementById('lblIndusTowerCardTitle');
    if (lblTitle) lblTitle.innerText = 'View Company Name';
    
    // Set to read-only view mode initially until edit button is clicked
    isIndusTowerEditing = false;
    setIndusTowerFormReadOnly(true);

    const imgIcon = document.getElementById('imgIndusTowerEditIcon');
    if (imgIcon) {
      imgIcon.src = 'icons/Edit.svg';
      imgIcon.title = 'Edit Info';
    }
  }

  overlay.style.display = 'flex';
  showToast('Opened View Company Name');
};

document.addEventListener('DOMContentLoaded', () => {
  const btnCloseIndusTower = document.getElementById('btnCloseIndusTowerForm');
  if (btnCloseIndusTower) {
    btnCloseIndusTower.addEventListener('click', closeSideForm);
  }

  const btnLogo = document.getElementById('btnIndusTowerLogo');
  const fileLogo = document.getElementById('inpIndusTowerLogoFile');
  const imgLogoPreview = document.getElementById('imgIndusTowerLogoPreview');
  const lblLogoFileName = document.getElementById('lblIndusTowerLogoFileName');

  if (btnLogo && fileLogo) {
    btnLogo.addEventListener('click', () => {
      if (isIndusTowerEditing) fileLogo.click();
    });

    fileLogo.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (lblLogoFileName) {
          lblLogoFileName.textContent = file.name;
          lblLogoFileName.style.display = 'inline';
        }
        if (file.type.startsWith('image/') && imgLogoPreview) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            imgLogoPreview.src = evt.target.result;
            imgLogoPreview.style.width = '30px';
            imgLogoPreview.style.height = '30px';
            imgLogoPreview.style.borderRadius = '4px';
            imgLogoPreview.style.objectFit = 'cover';
          };
          reader.readAsDataURL(file);
        }
        showToast('Logo uploaded: ' + file.name);
      }
    });
  }

  const btnEdit = document.getElementById('btnIndusTowerEdit');
  if (btnEdit) {
    btnEdit.addEventListener('click', (e) => {
      e.stopPropagation();
      const lblTitle = document.getElementById('lblIndusTowerCardTitle');
      const imgIcon = document.getElementById('imgIndusTowerEditIcon');

      if (!isIndusTowerEditing) {
        // ENTER EDIT MODE
        isIndusTowerEditing = true;
        setIndusTowerFormReadOnly(false);
        if (lblTitle) lblTitle.innerText = 'Edit Company Name';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('Company Name form is now editable');
      } else {
        // SAVE EDITS
        isIndusTowerEditing = false;
        setIndusTowerFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Company Name';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        showToast('Company details saved & updated successfully!');
      }
    });
  }

  const btnBank = document.getElementById('btnIndusTowerBank');
  if (btnBank) {
    btnBank.addEventListener('click', (e) => {
      e.stopPropagation();
      openCompanyBankSidePanel();
    });
  }

  const btnLoc = document.getElementById('btnIndusTowerLocation');
  if (btnLoc) {
    btnLoc.addEventListener('click', (e) => {
      e.stopPropagation();
      openCompanyLocationSidePanel();
    });
  }

  const btnAshoka = document.getElementById('btnIndusTowerAshokaChakra');
  if (btnAshoka) {
    btnAshoka.addEventListener('click', (e) => {
      e.stopPropagation();
      openCompanyHolidaysSidePanel();
    });
  }

  const btnWcCalendar = document.getElementById('btnIndusWcExpiryCalendar');
  const inpWcExpiry = document.getElementById('inpIndusWcExpiry');
  if (btnWcCalendar && inpWcExpiry) {
    btnWcCalendar.addEventListener('click', (e) => {
      e.preventDefault();
      if (!isIndusTowerEditing) return;
      if (typeof inpWcExpiry.showPicker === 'function') {
        inpWcExpiry.showPicker();
      } else {
        inpWcExpiry.focus();
      }
    });
  }

  const btnSubmitIndus = document.getElementById('btnSubmitIndusTower');
  if (btnSubmitIndus) {
    btnSubmitIndus.addEventListener('click', () => {
      isIndusTowerEditing = false;
      setIndusTowerFormReadOnly(true);
      const lblTitle = document.getElementById('lblIndusTowerCardTitle');
      if (lblTitle) lblTitle.innerText = 'View Company Name';
      const imgIcon = document.getElementById('imgIndusTowerEditIcon');
      if (imgIcon) {
        imgIcon.src = 'icons/Edit.svg';
        imgIcon.title = 'Edit Info';
      }
      closeSideForm();
      showToast('Company Name details saved successfully!');
    });
  }
});

// ==========================================================================
// 7. EXCEL-STYLE FILTER ENGINE
// ==========================================================================
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

// Global Company Bank Dataset & Filter State
let companyBankData = [
  {
    id: 'cbank-1',
    accountName: 'ABC Private Ltd',
    accountNumber: '12345678910',
    bankName: 'ABC Private Ltd',
    ifscCode: 'ABC Private',
    responsible: 'ABC Private',
    status: 'Active'
  },
  {
    id: 'cbank-2',
    accountName: 'Nexus Telecom Corp',
    accountNumber: '98765432101',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0001234',
    responsible: 'John Doe',
    status: 'Active'
  },
  {
    id: 'cbank-3',
    accountName: 'Nexus Infra Solutions',
    accountNumber: '45678912301',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0004567',
    responsible: 'Sarah Jenkins',
    status: 'De-Active'
  }
];
let activeCompanyBankFilters = {};
let currentCompanyBankFilterCol = null;

function renderCompanyBankTable() {
  const tbody = document.getElementById('tbodyBankDetails');
  if (!tbody) return;

  let filtered = companyBankData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeCompanyBankFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 18px;">No matching bank records found.</td></tr>`;
    updateCompanyBankFilterBtnStates();
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    const isInactive = (row.status || '').toLowerCase().includes('in') || (row.status || '').toLowerCase().includes('de');
    return `
      <tr data-bank-id="${row.id}">
        <td class="col-bank-acc-name">${row.accountName || ''}</td>
        <td class="col-bank-acc-num">
          <a href="#" class="req-link td-link-blue" onclick="showToast('Account Number: ${row.accountNumber}'); return false;">${row.accountNumber || ''}</a>
        </td>
        <td class="col-bank-name">${row.bankName || ''}</td>
        <td class="col-bank-ifsc">${row.ifscCode || ''}</td>
        <td class="col-bank-responsible">${row.responsible || ''}</td>
        <td class="col-bank-status">
          <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${isInactive ? 'De-Active' : 'Active'}</span>
        </td>
      </tr>
    `;
  }).join('');

  updateCompanyBankFilterBtnStates();
}

function updateCompanyBankFilterBtnStates() {
  document.querySelectorAll('#tblBankDetailsPopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeCompanyBankFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initCompanyBankTableFilters() {
  document.querySelectorAll('#tblBankDetailsPopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openCompanyBankFilter(colKey, btn);
    });
  });
}

function openCompanyBankFilter(colKey, triggerBtn) {
  currentCompanyBankFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(companyBankData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeCompanyBankFilters[colKey];

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

  dropdown.dataset.filterContext = 'companyBank';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Company Holidays Dataset & Filter State
let companyHolidaysData = [
  {
    id: 'h-1',
    year: '2026',
    month: 'January',
    date: '26',
    day: 'Monday',
    holidayName: 'Republic Day',
    status: 'Active'
  },
  {
    id: 'h-2',
    year: '2026',
    month: 'August',
    date: '15',
    day: 'Saturday',
    holidayName: 'Independence Day',
    status: 'Active'
  },
  {
    id: 'h-3',
    year: '2026',
    month: 'October',
    date: '02',
    day: 'Friday',
    holidayName: 'Gandhi Jayanti',
    status: 'Active'
  },
  {
    id: 'h-4',
    year: '2026',
    month: 'November',
    date: '08',
    day: 'Sunday',
    holidayName: 'Diwali',
    status: 'Active'
  },
  {
    id: 'h-5',
    year: '2026',
    month: 'December',
    date: '25',
    day: 'Friday',
    holidayName: 'Christmas Day',
    status: 'Active'
  }
];
let activeCompanyHolidaysFilters = {};
let currentCompanyHolidaysFilterCol = null;

function renderCompanyHolidaysTable() {
  const tbody = document.getElementById('tbodyHolidaysDetails');
  if (!tbody) return;

  let filtered = companyHolidaysData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeCompanyHolidaysFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 18px;">No matching holidays found.</td></tr>`;
    updateCompanyHolidaysFilterBtnStates();
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    const isInactive = (row.status || '').toLowerCase().includes('in') || (row.status || '').toLowerCase().includes('de');
    return `
      <tr data-holiday-id="${row.id}">
        <td class="col-holiday-year td-center">${row.year || ''}</td>
        <td class="col-holiday-month">${row.month || ''}</td>
        <td class="col-holiday-date td-center">${row.date || ''}</td>
        <td class="col-holiday-day">${row.day || ''}</td>
        <td class="col-holiday-name">${row.holidayName || ''}</td>
        <td class="col-holiday-status td-center">
          <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${isInactive ? 'In - Active' : 'Active'}</span>
        </td>
      </tr>
    `;
  }).join('');

  updateCompanyHolidaysFilterBtnStates();
}

function updateCompanyHolidaysFilterBtnStates() {
  document.querySelectorAll('#tblHolidaysPopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeCompanyHolidaysFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initCompanyHolidaysTableFilters() {
  document.querySelectorAll('#tblHolidaysPopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openCompanyHolidaysFilter(colKey, btn);
    });
  });
}

function openCompanyHolidaysFilter(colKey, triggerBtn) {
  currentCompanyHolidaysFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(companyHolidaysData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeCompanyHolidaysFilters[colKey];

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

  dropdown.dataset.filterContext = 'companyHolidays';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Company Office Location Dataset & Filter State
let companyLocationData = [
  {
    id: 'loc-1',
    officeCode: 'LOC-001',
    officeName: 'Headquarters - Chennai',
    latitude: '13.0827° N',
    longitude: '80.2707° E',
    inCharge: 'Rajesh Kumar',
    status: 'Active'
  },
  {
    id: 'loc-2',
    officeCode: 'LOC-002',
    officeName: 'Branch - Bengaluru',
    latitude: '12.9716° N',
    longitude: '77.5946° E',
    inCharge: 'Priya Sharma',
    status: 'Active'
  },
  {
    id: 'loc-3',
    officeCode: 'LOC-003',
    officeName: 'Regional - Mumbai',
    latitude: '19.0760° N',
    longitude: '72.8777° E',
    inCharge: 'Amit Patel',
    status: 'Active'
  },
  {
    id: 'loc-4',
    officeCode: 'LOC-004',
    officeName: 'Hub - Hyderabad',
    latitude: '17.3850° N',
    longitude: '78.4867° E',
    inCharge: 'Suresh Reddy',
    status: 'Active'
  }
];
let activeCompanyLocationFilters = {};
let currentCompanyLocationFilterCol = null;

function renderCompanyLocationTable() {
  const tbody = document.getElementById('tbodyLocationDetails');
  if (!tbody) return;

  let filtered = companyLocationData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeCompanyLocationFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 18px;">No matching office locations found.</td></tr>`;
    updateCompanyLocationFilterBtnStates();
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    const isInactive = (row.status || '').toLowerCase().includes('in') || (row.status || '').toLowerCase().includes('de');
    return `
      <tr data-location-id="${row.id}">
        <td class="col-loc-code td-center">${row.officeCode || ''}</td>
        <td class="col-loc-name">${row.officeName || ''}</td>
        <td class="col-loc-lat td-center">${row.latitude || ''}</td>
        <td class="col-loc-lng td-center">${row.longitude || ''}</td>
        <td class="col-loc-incharge">${row.inCharge || ''}</td>
        <td class="col-loc-status td-center">
          <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${isInactive ? 'In - Active' : 'Active'}</span>
        </td>
      </tr>
    `;
  }).join('');

  updateCompanyLocationFilterBtnStates();
}

function updateCompanyLocationFilterBtnStates() {
  document.querySelectorAll('#tblLocationPopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeCompanyLocationFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initCompanyLocationTableFilters() {
  document.querySelectorAll('#tblLocationPopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openCompanyLocationFilter(colKey, btn);
    });
  });
}

function openCompanyLocationFilter(colKey, triggerBtn) {
  currentCompanyLocationFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(companyLocationData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeCompanyLocationFilters[colKey];

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

  dropdown.dataset.filterContext = 'companyLocation';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Contact Dataset & Filter State
let vendorContactData = [
  { id: 'c-1', name: 'Indus', designation: '', phone: '', email: 'R/RL-234567', status: 'SGST' }
];
let activeContactFilters = {};
let currentContactFilterCol = null;

function renderVendorContactTable() {
  const tbody = document.getElementById('tbodyContactDetails');
  if (!tbody) return;

  let filtered = vendorContactData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeContactFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 18px;">No matching contact records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => `
    <tr data-contact-id="${row.id}">
      <td class="td-link-blue">${row.name || ''}</td>
      <td>${row.designation || ''}</td>
      <td>${row.phone || ''}</td>
      <td>${row.email || ''}</td>
      <td>${row.status || ''}</td>
    </tr>
  `).join('');

  document.querySelectorAll('#tblContactPopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeContactFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initContactTableFilters() {
  document.querySelectorAll('#tblContactPopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openContactFilter(colKey, btn);
    });
  });
}

function openContactFilter(colKey, triggerBtn) {
  currentContactFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(vendorContactData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeContactFilters[colKey];

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

  dropdown.dataset.filterContext = 'contact';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Supply Scope Dataset & Filter State
let vendorSupplyScopeData = [
  { id: 'ss-1', category: 'Service', productName: '230510678', uom: 'R/RL-234567', price: '15000.00', status: 'Active' },
  { id: 'ss-2', category: 'Supply', productName: '230510678', uom: 'R/RL-234567', price: '15000.00', status: 'In - Active' }
];
let activeSupplyScopeFilters = {};
let currentSupplyScopeFilterCol = null;

function renderVendorSupplyScopeTable() {
  const tbody = document.getElementById('tbodySupplyScopeDetails');
  if (!tbody) return;

  let filtered = vendorSupplyScopeData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeSupplyScopeFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 18px;">No matching records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => `
    <tr data-scope-id="${row.id}">
      <td>${row.category || ''}</td>
      <td>${row.productName || ''}</td>
      <td>${row.uom || ''}</td>
      <td>${row.price || ''}</td>
      <td>
        <span style="color: ${row.status === 'Active' ? '#16a34a' : '#ef4444'}; font-weight: 600;">
          ${row.status || ''}
        </span>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('#tblSupplyScopePopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeSupplyScopeFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initSupplyScopeTableFilters() {
  document.querySelectorAll('#tblSupplyScopePopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openSupplyScopeFilter(colKey, btn);
    });
  });
}

function openSupplyScopeFilter(colKey, triggerBtn) {
  currentSupplyScopeFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(vendorSupplyScopeData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeSupplyScopeFilters[colKey];

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

  dropdown.dataset.filterContext = 'supplyScope';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Service (Project) Scope Dataset & Filter State
let vendorServiceProjectScopeData = [
  { id: 'sps-1', subProjectType: 'Project', uom: 'LS', rate: '', status: 'Active' },
  { id: 'sps-2', subProjectType: 'Item Wise', uom: 'Meter', rate: '', status: 'In - Active' }
];
let activeServiceProjectScopeFilters = {};
let currentServiceProjectScopeFilterCol = null;

function renderVendorServiceProjectScopeTable() {
  const tbody = document.getElementById('tbodyServiceProjectScopeDetails');
  if (!tbody) return;

  let filtered = vendorServiceProjectScopeData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeServiceProjectScopeFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 18px;">No matching records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => `
    <tr data-scope-id="${row.id}">
      <td>${row.subProjectType || ''}</td>
      <td>${row.uom || ''}</td>
      <td>${row.rate || ''}</td>
      <td>
        <span style="color: ${row.status === 'Active' ? '#16a34a' : '#ef4444'}; font-weight: 600;">
          ${row.status || ''}
        </span>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('#tblServiceProjectScopePopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeServiceProjectScopeFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initServiceProjectScopeTableFilters() {
  document.querySelectorAll('#tblServiceProjectScopePopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openServiceProjectScopeFilter(colKey, btn);
    });
  });
}

function openServiceProjectScopeFilter(colKey, triggerBtn) {
  currentServiceProjectScopeFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(vendorServiceProjectScopeData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeServiceProjectScopeFilters[colKey];

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

  dropdown.dataset.filterContext = 'serviceProjectScope';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Service (Transport) Scope Dataset & Filter State
let vendorServiceTransportScopeData = [
  { id: 'sts-1', vehicleType: 'LCV', vehicleNumber: '230510678', fuelType: 'Petrol', range: 'Project', rentalType: 'Monthly', status: 'Active' },
  { id: 'sts-2', vehicleType: 'MCV', vehicleNumber: '230510678', fuelType: 'Diesel', range: 'Item Wise', rentalType: 'Daily', status: 'In - Active' }
];
let activeServiceTransportScopeFilters = {};
let currentServiceTransportScopeFilterCol = null;

function renderVendorServiceTransportScopeTable() {
  const tbody = document.getElementById('tbodyServiceTransportScopeDetails');
  if (!tbody) return;

  let filtered = vendorServiceTransportScopeData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeServiceTransportScopeFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b; padding: 18px;">No matching records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => `
    <tr data-scope-id="${row.id}">
      <td>${row.vehicleType || ''}</td>
      <td>${row.vehicleNumber || ''}</td>
      <td>${row.fuelType || ''}</td>
      <td>${row.range || ''}</td>
      <td>${row.rentalType || ''}</td>
      <td>
        <span style="color: ${row.status === 'Active' ? '#16a34a' : '#ef4444'}; font-weight: 600;">
          ${row.status || ''}
        </span>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('#tblServiceTransportScopePopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeServiceTransportScopeFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initServiceTransportScopeTableFilters() {
  document.querySelectorAll('#tblServiceTransportScopePopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openServiceTransportScopeFilter(colKey, btn);
    });
  });
}

function openServiceTransportScopeFilter(colKey, triggerBtn) {
  currentServiceTransportScopeFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(vendorServiceTransportScopeData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeServiceTransportScopeFilters[colKey];

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

  dropdown.dataset.filterContext = 'serviceTransportScope';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Service (Others) Scope Dataset & Filter State
let vendorServiceOthersScopeData = [
  { id: 'sot-1', from: '01 - 01 - 2026', to: '01 - 01 - 2026', description: 'Petrol', uom: 'Project', status: 'Active' },
  { id: 'sot-2', from: '01 - 01 - 2026', to: '01 - 01 - 2026', description: 'Diesel', uom: 'Item Wise', status: 'In - Active' }
];
let activeServiceOthersScopeFilters = {};
let currentServiceOthersScopeFilterCol = null;

function renderVendorServiceOthersScopeTable() {
  const tbody = document.getElementById('tbodyServiceOthersScopeDetails');
  if (!tbody) return;

  let filtered = vendorServiceOthersScopeData.filter(row => {
    for (const [colKey, allowedSet] of Object.entries(activeServiceOthersScopeFilters)) {
      const cellVal = String(row[colKey] !== undefined ? row[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 18px;">No matching records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => `
    <tr data-scope-id="${row.id}">
      <td>${row.from || ''}</td>
      <td>${row.to || ''}</td>
      <td>${row.description || ''}</td>
      <td>${row.uom || ''}</td>
      <td>
        <span style="color: ${row.status === 'Active' ? '#16a34a' : '#ef4444'}; font-weight: 600;">
          ${row.status || ''}
        </span>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('#tblServiceOthersScopePopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeServiceOthersScopeFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initServiceOthersScopeTableFilters() {
  document.querySelectorAll('#tblServiceOthersScopePopup .contact-th-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openServiceOthersScopeFilter(colKey, btn);
    });
  });
}

function openServiceOthersScopeFilter(colKey, triggerBtn) {
  currentServiceOthersScopeFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const uniqueValues = Array.from(new Set(vendorServiceOthersScopeData.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeServiceOthersScopeFilters[colKey];

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

  dropdown.dataset.filterContext = 'serviceOthersScope';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

// Global Sub - Project Type Payment Report Dataset
let subProjectTypeReportData = [
  { id: 'sptr-1', from: '01 - 01 - 2026', to: '01 - 01 - 2026', rate: '2000.00', status: 'Active' },
  { id: 'sptr-2', from: '01 - 01 - 2026', to: '01 - 01 - 2026', rate: '2000.00', status: 'In - Active' }
];

function renderSubProjectTypeReportTable() {
  const tbody = document.getElementById('tbodySubProjectTypeReportDetails');
  if (!tbody) return;

  tbody.innerHTML = subProjectTypeReportData.map(row => `
    <tr data-report-id="${row.id}">
      <td>${row.from || ''}</td>
      <td>${row.to || ''}</td>
      <td>${row.rate || ''}</td>
      <td>
        <span style="color: ${row.status === 'Active' ? '#16a34a' : '#ef4444'}; font-weight: 600;">
          ${row.status || ''}
        </span>
      </td>
    </tr>
  `).join('');
}

// Global Vehicle Payment Report Dataset
let vehicleReportData = [
  { id: 'vr-1', from: '01 - 01 - 2026', to: '01 - 01 - 2026', rentalAmount: '2000.00', haltAmount: '2000.00', status: 'Active' },
  { id: 'vr-2', from: '01 - 01 - 2026', to: '01 - 01 - 2026', rentalAmount: '2000.00', haltAmount: '2000.00', status: 'In - Active' }
];

function renderVehicleReportTable() {
  const tbody = document.getElementById('tbodyVehicleReportDetails');
  if (!tbody) return;

  tbody.innerHTML = vehicleReportData.map(row => `
    <tr data-report-id="${row.id}">
      <td>${row.from || ''}</td>
      <td>${row.to || ''}</td>
      <td>${row.rentalAmount || ''}</td>
      <td>${row.haltAmount || ''}</td>
      <td>
        <span style="color: ${row.status === 'Active' ? '#16a34a' : '#ef4444'}; font-weight: 600;">
          ${row.status || ''}
        </span>
      </td>
    </tr>
  `).join('');
}

// Global Other Service Payment Report Dataset
let otherServiceReportData = [
  { id: 'osr-1', from: '01 - 01 - 2026', to: '01 - 01 - 2026', rate: '2000.00', status: 'Active' },
  { id: 'osr-2', from: '01 - 01 - 2026', to: '01 - 01 - 2026', rate: '2000.00', status: 'In - Active' }
];

function renderOtherServiceReportTable() {
  const tbody = document.getElementById('tbodyOtherServiceReportDetails');
  if (!tbody) return;

  tbody.innerHTML = otherServiceReportData.map(row => `
    <tr data-report-id="${row.id}">
      <td>${row.from || ''}</td>
      <td>${row.to || ''}</td>
      <td>${row.rate || ''}</td>
      <td>
        <span style="color: ${row.status === 'Active' ? '#16a34a' : '#ef4444'}; font-weight: 600;">
          ${row.status || ''}
        </span>
      </td>
    </tr>
  `).join('');
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
    if (currentWorklistView === 'po') {
      btnDel.style.display = 'flex';
      btnDel.style.visibility = hasSelected ? 'visible' : 'hidden';
      btnDel.style.pointerEvents = hasSelected ? 'auto' : 'none';
    } else {
      btnDel.style.visibility = 'visible';
      btnDel.style.pointerEvents = 'auto';
      btnDel.style.display = hasSelected ? 'flex' : 'none';
    }
  }
}

window.handleReqClick = function(reqCode) {
  showToast(`Opening requisition details: ${reqCode}`);
};

let isProjectPaymentEditing = false;

window.openWorklistProjectPayment = function(reqCode, rowId) {
  isProjectPaymentEditing = false;
  currentModule = 'worklist';
  currentWorklistView = 'project_payment';
  selectedProjectPaymentReq = reqCode || 'R/RL-234567';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Opened Project Requisition: ${selectedProjectPaymentReq}`);
};

window.toggleProjectPaymentRowSelect = function(rowId) {
  const item = worklistProjectPaymentItems.find(i => i.id === rowId);
  if (item) {
    item.selected = !item.selected;
    applyFiltersAndRender();
  }
};

window.toggleProjectPaymentEditMode = function() {
  if (!isProjectPaymentEditing) {
    isProjectPaymentEditing = true;
    renderWorklistToolbar();
    applyFiltersAndRender();
    showToast('Project payment table is now editable');
  } else {
    // Save table input values
    const inputs = document.querySelectorAll('.project-table-edit-input');
    inputs.forEach(input => {
      const rowId = input.getAttribute('data-row-id');
      const field = input.getAttribute('data-field');
      const item = worklistProjectPaymentItems.find(i => i.id === rowId);
      if (item && field) {
        item[field] = input.value.trim();
      }
    });
    isProjectPaymentEditing = false;
    renderWorklistToolbar();
    applyFiltersAndRender();
    showToast('Project payment details saved successfully');
  }
};

let isProjectPaymentNotesEditing = false;

let worklistProjectPaymentNotes = [
  {
    id: "pnote-1",
    date: "12/08/2026",
    name: "R/RL-234567",
    remarks: "Initial requisition raised for approval",
    status: "RAISED"
  },
  {
    id: "pnote-2",
    date: "14/08/2026",
    name: "Supervisor",
    remarks: "Site inspection & DG check completed",
    status: "Approved"
  },
  {
    id: "pnote-3",
    date: "16/08/2026",
    name: "Accounts Desk",
    remarks: "Awaiting final invoice validation",
    status: "Pending"
  }
];

function renderProjectPaymentNotesTable() {
  const tbody = document.getElementById('tbodyProjectPaymentNotes');
  if (!tbody) return;

  const btnEdit = document.getElementById('btnProjectNotesEditToggle');
  const imgEdit = document.getElementById('imgProjectNotesEditIcon');
  if (btnEdit && imgEdit) {
    btnEdit.title = isProjectPaymentNotesEditing ? 'Save Changes' : 'Edit Details';
    imgEdit.src = isProjectPaymentNotesEditing ? 'icons/Save.svg' : 'icons/Edit.svg';
    imgEdit.alt = isProjectPaymentNotesEditing ? 'Save' : 'Edit';
  }

  if (isProjectPaymentNotesEditing) {
    tbody.innerHTML = worklistProjectPaymentNotes.map((note, idx) => `
      <tr data-note-id="${note.id || idx}">
        <td class="td-center" style="padding: 6px 8px;">
          <input type="text" class="project-notes-edit-input" data-note-id="${note.id}" data-field="date" value="${note.date || ''}" placeholder="Date" style="width: 100%; height: 30px; padding: 2px 6px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: center; cursor: text;">
        </td>
        <td style="padding: 6px 8px;">
          <input type="text" class="project-notes-edit-input" data-note-id="${note.id}" data-field="name" value="${note.name || ''}" placeholder="Name" style="width: 100%; height: 30px; padding: 2px 6px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; cursor: text;">
        </td>
        <td style="padding: 6px 8px;">
          <input type="text" class="project-notes-edit-input" data-note-id="${note.id}" data-field="remarks" value="${note.remarks || ''}" placeholder="Remarks" style="width: 100%; height: 30px; padding: 2px 6px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; cursor: text;">
        </td>
        <td class="td-center" style="padding: 6px 8px;">
          <select class="project-notes-edit-input project-note-status-dropdown" data-note-id="${note.id}" data-field="status" style="width: 100%; height: 30px; padding: 2px 6px; font-size: 0.85rem; font-weight: 600; color: #3730a3; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; cursor: pointer;">
            <option value="RAISED" ${note.status === 'RAISED' ? 'selected' : ''}>RAISED</option>
            <option value="Approved" ${note.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Pending" ${note.status === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = worklistProjectPaymentNotes.map((note, idx) => `
      <tr data-note-id="${note.id || idx}">
        <td class="td-center" style="white-space: nowrap; font-size: 0.88rem; padding: 8px 10px;">${note.date}</td>
        <td style="font-weight: 500; font-size: 0.88rem; padding: 8px 10px;">${note.name}</td>
        <td style="font-size: 0.88rem; padding: 8px 10px;">${note.remarks}</td>
        <td class="td-center" style="padding: 6px 10px;">
          <select class="project-note-status-dropdown" onchange="updateProjectPaymentNoteStatus('${note.id}', this.value)" style="width: 100%; height: 30px; padding: 2px 6px; font-size: 0.85rem; font-weight: 600; color: #3730a3; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; cursor: pointer;">
            <option value="RAISED" ${note.status === 'RAISED' ? 'selected' : ''}>RAISED</option>
            <option value="Approved" ${note.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Pending" ${note.status === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </td>
      </tr>
    `).join('');
  }
}

window.updateProjectPaymentNoteStatus = function(noteId, newStatus) {
  const note = worklistProjectPaymentNotes.find(n => n.id === noteId);
  if (note) {
    note.status = newStatus;
    showToast(`Status updated to ${newStatus}`);
  }
};

window.toggleProjectPaymentNotesEditMode = function() {
  if (!isProjectPaymentNotesEditing) {
    isProjectPaymentNotesEditing = true;
    renderProjectPaymentNotesTable();
    showToast('Notes & remarks table is now editable');
  } else {
    // Save table input values
    const inputs = document.querySelectorAll('.project-notes-edit-input');
    inputs.forEach(input => {
      const noteId = input.getAttribute('data-note-id');
      const field = input.getAttribute('data-field');
      const note = worklistProjectPaymentNotes.find(n => n.id === noteId);
      if (note && field) {
        note[field] = input.value.trim();
      }
    });
    isProjectPaymentNotesEditing = false;
    renderProjectPaymentNotesTable();
    showToast('Notes & remarks saved successfully');
  }
};

window.openProjectPaymentNotesModal = function() {
  isProjectPaymentNotesEditing = false;
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Hide other sub-panels
  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const notesModal = document.getElementById('projectPaymentNotesModal');
  if (notesModal) {
    notesModal.style.display = 'block';
  }

  renderProjectPaymentNotesTable();
  overlay.style.display = 'flex';
  showToast('Notes & Remarks opened');
};

document.addEventListener('click', (e) => {
  if (e.target.closest('#btnCloseProjectPaymentNotes')) {
    isProjectPaymentNotesEditing = false;
    const notesModal = document.getElementById('projectPaymentNotesModal');
    if (notesModal) notesModal.style.display = 'none';
    const overlay = document.getElementById('sideFormOverlay');
    if (overlay) overlay.style.display = 'none';
  }
  if (e.target.closest('#btnCloseProjectPaymentBankModal')) {
    isProjectPaymentBankEditing = false;
    const bankModal = document.getElementById('projectPaymentBankModal');
    if (bankModal) bankModal.style.display = 'none';
    const overlay = document.getElementById('sideFormOverlay');
    if (overlay) overlay.style.display = 'none';
  }
  if (e.target.closest('#btnCloseProjectPaymentReportModal')) {
    const reportModal = document.getElementById('projectPaymentReportModal');
    if (reportModal) reportModal.style.display = 'none';
    const overlay = document.getElementById('sideFormOverlay');
    if (overlay) overlay.style.display = 'none';
  }
  // Close BOQ filter menu when clicking outside
  if (!e.target.closest('#btnFilterHistoryBoq') && !e.target.closest('#historyBoqFilterMenu')) {
    const filterMenu = document.getElementById('historyBoqFilterMenu');
    if (filterMenu && filterMenu.style.display === 'block') {
      filterMenu.style.display = 'none';
    }
  }
});

let isProjectPaymentBankEditing = false;

let projectPaymentBankFields = [
  { id: "bank_acc_name", label: "Account Name", value: "Nexus Infra Pvt Ltd" },
  { id: "bank_acc_no", label: "Account Number", value: "987654321012" },
  { id: "bank_ifsc", label: "IFSC Code", value: "HDFC0001234" },
  { id: "bank_name", label: "Bank Name", value: "HDFC Bank" }
];

function renderProjectPaymentBankFields() {
  const container = document.getElementById('containerProjectPaymentBankFields');
  if (!container) return;

  const btnEdit = document.getElementById('btnProjectBankEditToggle');
  const imgEdit = document.getElementById('imgProjectBankEditIcon');
  if (btnEdit && imgEdit) {
    btnEdit.title = isProjectPaymentBankEditing ? 'Save Changes' : 'Edit Details';
    imgEdit.src = isProjectPaymentBankEditing ? 'icons/Save.svg' : 'icons/Edit.svg';
    imgEdit.alt = isProjectPaymentBankEditing ? 'Save' : 'Edit';
  }

  container.innerHTML = projectPaymentBankFields.map((field, idx) => `
    <div class="project-bank-field-row" data-field-id="${field.id}">
      <label class="project-bank-field-label" for="inpBankField_${field.id}">${field.label}</label>
      <input type="text" 
             class="project-bank-field-input ${isProjectPaymentBankEditing ? 'editing' : ''}" 
             id="inpBankField_${field.id}" 
             data-field-id="${field.id}" 
             value="${field.value || ''}" 
             placeholder="Enter ${field.label}"
             ${isProjectPaymentBankEditing ? '' : 'readonly'}
      >
    </div>
  `).join('');
}

window.toggleProjectPaymentBankEditMode = function() {
  if (!isProjectPaymentBankEditing) {
    isProjectPaymentBankEditing = true;
    renderProjectPaymentBankFields();
    showToast('Bank details are now editable');
  } else {
    // Save field values
    const inputs = document.querySelectorAll('.project-bank-field-input');
    inputs.forEach(inp => {
      const fieldId = inp.getAttribute('data-field-id');
      const f = projectPaymentBankFields.find(item => item.id === fieldId);
      if (f) {
        f.value = inp.value.trim();
      }
    });
    isProjectPaymentBankEditing = false;
    renderProjectPaymentBankFields();
    showToast('Bank details saved successfully');
  }
};

window.addProjectPaymentBankField = function() {
  const fieldName = prompt("Enter new field name (e.g. Branch Name, UPI ID):");
  if (!fieldName || !fieldName.trim()) return;

  const newId = 'field_' + Date.now();
  projectPaymentBankFields.push({
    id: newId,
    label: fieldName.trim(),
    value: ""
  });
  
  isProjectPaymentBankEditing = true;
  renderProjectPaymentBankFields();
  showToast(`Field "${fieldName.trim()}" added`);
  
  setTimeout(() => {
    const newInp = document.getElementById(`inpBankField_${newId}`);
    if (newInp) newInp.focus();
  }, 100);
};

window.openProjectPaymentBankModal = function() {
  isProjectPaymentBankEditing = false;
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Hide other sub-panels
  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const bankModal = document.getElementById('projectPaymentBankModal');
  if (bankModal) {
    bankModal.style.display = 'block';
  }

  renderProjectPaymentBankFields();
  overlay.style.display = 'flex';
  showToast('Bank details opened');
};

let paymentHistoryReportData = [
  {
    id: "hist-1",
    boqName: "25 X 3 Earth Strip",
    qty: "12",
    po: "50,000.00",
    budget: "60,000.00",
    used: "40,000.00",
    available: "20,000.00"
  },
  {
    id: "hist-2",
    boqName: "DG Connection 25KVA",
    qty: "1",
    po: "1,50,000.00",
    budget: "1,80,000.00",
    used: "1,20,000.00",
    available: "60,000.00"
  },
  {
    id: "hist-3",
    boqName: "Battery Bank 48V",
    qty: "2",
    po: "2,00,000.00",
    budget: "2,20,000.00",
    used: "1,80,000.00",
    available: "40,000.00"
  },
  {
    id: "hist-4",
    boqName: "Copper Earthing Cable",
    qty: "50",
    po: "75,000.00",
    budget: "90,000.00",
    used: "65,000.00",
    available: "25,000.00"
  }
];

let historySelectedBoqFilters = new Set();

function renderPaymentHistoryTable() {
  const tbody = document.getElementById('tbodyPaymentHistoryReport');
  if (!tbody) return;

  const filtered = paymentHistoryReportData.filter(item => {
    if (historySelectedBoqFilters.size === 0) return true;
    return historySelectedBoqFilters.has(item.boqName);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">No records match the selected filter</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => `
    <tr>
      <td style="padding: 8px 12px; font-weight: 500;">
        <a href="javascript:void(0)" style="color: #4338ca; text-decoration: underline; cursor: pointer; font-weight: 600;" onclick="openBoqDetailModal('${row.id}')">${row.boqName}</a>
      </td>
      <td class="td-center" style="padding: 8px 10px;">${row.qty}</td>
      <td class="td-amount" style="padding: 8px 10px; text-align: right;">${row.po}</td>
      <td class="td-amount" style="padding: 8px 10px; text-align: right;">${row.budget}</td>
      <td class="td-amount" style="padding: 8px 10px; text-align: right;">${row.used}</td>
      <td class="td-amount" style="padding: 8px 10px; text-align: right;">${row.available}</td>
    </tr>
  `).join('');
}

window.togglePaymentHistoryBoqFilter = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('historyBoqFilterMenu');
  if (!menu) return;

  if (menu.style.display === 'block') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'block';
    renderHistoryBoqCheckboxList();
  }
};

function renderHistoryBoqCheckboxList(searchQuery = '') {
  const container = document.getElementById('containerHistoryBoqCheckboxes');
  if (!container) return;

  const uniqueBoqNames = Array.from(new Set(paymentHistoryReportData.map(item => item.boqName)));
  const filteredNames = uniqueBoqNames.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()));

  container.innerHTML = filteredNames.map(name => {
    const isChecked = historySelectedBoqFilters.size === 0 || historySelectedBoqFilters.has(name);
    return `
      <label style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; cursor: pointer; color: #1e293b;">
        <input type="checkbox" class="chk-history-boq-item" value="${name}" ${isChecked ? 'checked' : ''}>
        <span>${name}</span>
      </label>
    `;
  }).join('');
}

window.filterHistoryBoqCheckboxList = function(val) {
  renderHistoryBoqCheckboxList(val);
};

window.applyHistoryBoqFilter = function(e) {
  if (e) e.stopPropagation();
  const checkboxes = document.querySelectorAll('.chk-history-boq-item');
  const allUniqueNames = Array.from(new Set(paymentHistoryReportData.map(item => item.boqName)));
  
  historySelectedBoqFilters.clear();
  let checkedCount = 0;
  checkboxes.forEach(chk => {
    if (chk.checked) {
      historySelectedBoqFilters.add(chk.value);
      checkedCount++;
    }
  });

  if (checkedCount === allUniqueNames.length || checkedCount === 0) {
    historySelectedBoqFilters.clear();
  }

  const menu = document.getElementById('historyBoqFilterMenu');
  if (menu) menu.style.display = 'none';

  renderPaymentHistoryTable();
  showToast(`Filter applied (${checkedCount} selected)`);
};

window.clearHistoryBoqFilter = function(e) {
  if (e) e.stopPropagation();
  historySelectedBoqFilters.clear();
  const menu = document.getElementById('historyBoqFilterMenu');
  if (menu) menu.style.display = 'none';

  renderPaymentHistoryTable();
  showToast('BOQ filter cleared');
};

window.openProjectPaymentReportModal = function() {
  historySelectedBoqFilters.clear();
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Hide other sub-panels
  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const reportModal = document.getElementById('projectPaymentReportModal');
  if (reportModal) {
    reportModal.style.display = 'block';
  }

  renderPaymentHistoryTable();
  overlay.style.display = 'flex';
  showToast('Payment History opened');
};

// BOQ Detail data keyed by history item id
let boqDetailData = {
  'hist-1': [
    { id: 'bd-1', selected: false, requestDate: '12-06-2025', requestBy: 'Rajesh K', expenseType: 'Parent', expenseDesc: 'Earth Strip 25x3mm', uom: 'Mtr', qty: '12', rate: '450.00', basic: '5,400.00', gst: '972.00', total: '6,372.00', transferTo: 'Site A', txnDate: '15-06-2025' },
    { id: 'bd-2', selected: false, requestDate: '14-06-2025', requestBy: 'Suresh M', expenseType: 'Child', expenseDesc: 'Installation charges', uom: 'Lot', qty: '1', rate: '2,000.00', basic: '2,000.00', gst: '360.00', total: '2,360.00', transferTo: 'Site A', txnDate: '16-06-2025' }
  ],
  'hist-2': [
    { id: 'bd-3', selected: false, requestDate: '01-07-2025', requestBy: 'Anil P', expenseType: 'Parent', expenseDesc: 'DG Connection 25KVA', uom: 'Nos', qty: '1', rate: '1,50,000.00', basic: '1,50,000.00', gst: '27,000.00', total: '1,77,000.00', transferTo: 'Site B', txnDate: '05-07-2025' }
  ],
  'hist-3': [
    { id: 'bd-4', selected: false, requestDate: '10-07-2025', requestBy: 'Deepak S', expenseType: 'Parent', expenseDesc: 'Battery Bank 48V', uom: 'Set', qty: '2', rate: '1,00,000.00', basic: '2,00,000.00', gst: '36,000.00', total: '2,36,000.00', transferTo: 'Site C', txnDate: '12-07-2025' },
    { id: 'bd-5', selected: false, requestDate: '11-07-2025', requestBy: 'Mohan R', expenseType: 'Child', expenseDesc: 'Battery wiring', uom: 'Mtr', qty: '20', rate: '250.00', basic: '5,000.00', gst: '900.00', total: '5,900.00', transferTo: 'Site C', txnDate: '13-07-2025' }
  ],
  'hist-4': [
    { id: 'bd-6', selected: false, requestDate: '20-07-2025', requestBy: 'Kiran V', expenseType: 'Parent', expenseDesc: 'Copper Earthing Cable', uom: 'Mtr', qty: '50', rate: '1,500.00', basic: '75,000.00', gst: '13,500.00', total: '88,500.00', transferTo: 'Site D', txnDate: '22-07-2025' }
  ]
};

function renderBoqDetailTable(historyId) {
  const tbody = document.getElementById('tbodyBoqDetail');
  if (!tbody) return;

  const rows = boqDetailData[historyId] || [];
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" style="text-align: center; padding: 24px; color: #94a3b8;">No detail records available</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(row => `
    <tr>
      <td class="td-center" style="padding: 6px 4px;"><input type="checkbox" class="chk-boq-detail-select" data-detail-id="${row.id}" ${row.selected ? 'checked' : ''}></td>
      <td class="td-center" style="padding: 6px 8px; white-space: nowrap; font-size: 0.85rem;">${row.requestDate}</td>
      <td style="padding: 6px 8px; font-size: 0.85rem;">${row.requestBy}</td>
      <td class="td-center" style="padding: 6px 8px; font-size: 0.85rem; font-weight: 600;">${row.expenseType}</td>
      <td style="padding: 6px 8px; font-size: 0.85rem;">${row.expenseDesc}</td>
      <td class="td-center" style="padding: 6px 8px; font-size: 0.85rem;">${row.uom}</td>
      <td class="td-center" style="padding: 6px 8px; font-size: 0.85rem;">${row.qty}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem;">${row.rate}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem;">${row.basic}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem;">${row.gst}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem; font-weight: 600;">${row.total}</td>
      <td style="padding: 6px 8px; font-size: 0.85rem;">${row.transferTo}</td>
      <td class="td-center" style="padding: 6px 8px; white-space: nowrap; font-size: 0.85rem;">${row.txnDate}</td>
    </tr>
  `).join('');
}

window.openBoqDetailModal = function(historyId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Find BOQ name from history data
  const historyItem = paymentHistoryReportData.find(item => item.id === historyId);
  const boqTitle = historyItem ? historyItem.boqName : 'BOQ Name';

  // Update title
  const lblTitle = document.getElementById('lblBoqDetailTitle');
  if (lblTitle) lblTitle.textContent = boqTitle;

  // Hide other sub-panels
  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const boqModal = document.getElementById('boqDetailModal');
  if (boqModal) {
    boqModal.style.display = 'block';
  }

  renderBoqDetailTable(historyId);
  overlay.style.display = 'flex';
};

// Close BOQ Detail handler
document.addEventListener('click', (e) => {
  if (e.target.closest('#btnCloseBoqDetailModal')) {
    const boqModal = document.getElementById('boqDetailModal');
    if (boqModal) boqModal.style.display = 'none';
    // Re-show Payment History modal
    const reportModal = document.getElementById('projectPaymentReportModal');
    if (reportModal) {
      reportModal.style.display = 'block';
    }
  }
});

let currentViewedEmpId = null;
let isEmployeeFormEditing = false;

function setEmployeeFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddEmployee');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.id === 'inpEmpPhoto') return;
    if (isReadOnly) {
      if (input.tagName === 'SELECT') {
        input.setAttribute('disabled', 'true');
      } else {
        input.setAttribute('readonly', 'true');
      }
      input.style.backgroundColor = '#f8fafc';
    } else {
      if (input.tagName === 'SELECT') {
        input.removeAttribute('disabled');
      } else {
        input.removeAttribute('readonly');
      }
      input.style.backgroundColor = '#ffffff';
    }
  });

  const badges = form.querySelectorAll('.input-pdf-badge');
  badges.forEach(b => {
    b.style.pointerEvents = isReadOnly ? 'none' : 'auto';
    b.style.opacity = isReadOnly ? '0.5' : '1';
  });
}

window.handleEmpClick = function(empId, empName) {
  const dataset = masterEmployeeData;
  let emp = dataset.find(e => e.id === empId || e.employeeName === empName || e.employeeId === empId);

  if (!emp) {
    emp = {
      id: empId || 'emp-1',
      employeeId: "230510678",
      employeeName: empName || "R/RL-234567",
      empType: "On-Roll",
      address: "123 Main Street, Tech Park",
      contactNumber: "9876543210",
      email: "test.employee@example.com",
      dob: "1995-05-15",
      bloodGroup: "A+",
      maritalStatus: "Single",
      qualification: "B.Tech / MCA",
      pan: "ABCDE1234F",
      aadhar: "1234-5678-9012",
      epfUan: "100123456789",
      esiCode: "31001234560000001",
      prevExp: "02 - 00",
      currentExp: "01 - 00",
      totalExp: "03 - 00",
      doj: "2023-01-10",
      designation: "Manager",
      status: "Active"
    };
  }

  currentViewedEmpId = emp.id;
  isEmployeeFormEditing = false;

  openSideForm();

  const card = document.getElementById('addEmployeeCard');
  if (card) card.style.display = 'block';

  // Update Header Title to View Employee
  const lblTitle = document.getElementById('lblEmployeeCardTitle');
  if (lblTitle) lblTitle.innerText = 'View Employee';

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

  // Populate form fields
  if (document.getElementById('inpEmpType')) document.getElementById('inpEmpType').value = emp.empType || 'On-Roll';
  if (document.getElementById('inpEmpAddress')) document.getElementById('inpEmpAddress').value = emp.address || '123 Main Street, Tech Park';
  if (document.getElementById('inpEmpMobile')) document.getElementById('inpEmpMobile').value = emp.contactNumber || '9876543210';
  if (document.getElementById('inpEmpEmail')) document.getElementById('inpEmpEmail').value = emp.email || 'test.employee@example.com';
  if (document.getElementById('inpEmpDob')) document.getElementById('inpEmpDob').value = emp.dob || '1995-05-15';
  if (document.getElementById('inpEmpBloodGroup')) document.getElementById('inpEmpBloodGroup').value = emp.bloodGroup || 'A+';
  if (document.getElementById('inpEmpMaritalStatus')) document.getElementById('inpEmpMaritalStatus').value = emp.maritalStatus || 'Single';
  if (document.getElementById('inpEmpQualification')) document.getElementById('inpEmpQualification').value = emp.qualification || 'B.Tech / MCA';
  if (document.getElementById('inpEmpPanNumber')) document.getElementById('inpEmpPanNumber').value = emp.pan || 'ABCDE1234F';
  if (document.getElementById('inpEmpAadharNumber')) document.getElementById('inpEmpAadharNumber').value = emp.aadhar || '1234-5678-9012';
  if (document.getElementById('inpEmpEpfUan')) document.getElementById('inpEmpEpfUan').value = emp.epfUan || '100123456789';
  if (document.getElementById('inpEmpEsiCode')) document.getElementById('inpEmpEsiCode').value = emp.esiCode || '31001234560000001';
  if (document.getElementById('inpEmpPrevExp')) document.getElementById('inpEmpPrevExp').value = emp.prevExp || '02 - 00';
  if (document.getElementById('inpEmpCurrExp')) document.getElementById('inpEmpCurrExp').value = emp.currentExp || '01 - 00';
  if (document.getElementById('inpEmpTotalExp')) document.getElementById('inpEmpTotalExp').value = emp.totalExp || '03 - 00';
  if (document.getElementById('inpEmpDoj')) document.getElementById('inpEmpDoj').value = emp.doj || '2023-01-10';
  if (document.getElementById('inpEmpDesignation')) document.getElementById('inpEmpDesignation').value = emp.designation || 'Manager';

  setEmployeeFormReadOnly(true);
  showToast(`Viewing details for employee: ${emp.employeeName}`);
};

// Wire btnEmpCardEditToggle
document.addEventListener('DOMContentLoaded', () => {
  const btnEmpCardEditToggle = document.getElementById('btnEmpCardEditToggle');
  if (btnEmpCardEditToggle) {
    btnEmpCardEditToggle.addEventListener('click', () => {
      const lblTitle = document.getElementById('lblEmployeeCardTitle');
      const imgIcon = document.getElementById('imgEmpCardEditIcon');

      if (!isEmployeeFormEditing) {
        // ENTER EDIT MODE
        isEmployeeFormEditing = true;
        setEmployeeFormReadOnly(false);
        if (lblTitle) lblTitle.innerText = 'Edit Employee';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('Employee form is now editable');
      } else {
        // SAVE EDITS
        isEmployeeFormEditing = false;
        
        if (currentViewedEmpId) {
          const emp = masterEmployeeData.find(e => e.id === currentViewedEmpId);
          if (emp) {
            emp.empType = document.getElementById('inpEmpType')?.value || emp.empType;
            emp.address = document.getElementById('inpEmpAddress')?.value || emp.address;
            emp.contactNumber = document.getElementById('inpEmpMobile')?.value || emp.contactNumber;
            emp.email = document.getElementById('inpEmpEmail')?.value || emp.email;
            emp.dob = document.getElementById('inpEmpDob')?.value || emp.dob;
            emp.bloodGroup = document.getElementById('inpEmpBloodGroup')?.value || emp.bloodGroup;
            emp.maritalStatus = document.getElementById('inpEmpMaritalStatus')?.value || emp.maritalStatus;
            emp.qualification = document.getElementById('inpEmpQualification')?.value || emp.qualification;
            emp.pan = document.getElementById('inpEmpPanNumber')?.value || emp.pan;
            emp.aadhar = document.getElementById('inpEmpAadharNumber')?.value || emp.aadhar;
            emp.epfUan = document.getElementById('inpEmpEpfUan')?.value || emp.epfUan;
            emp.esiCode = document.getElementById('inpEmpEsiCode')?.value || emp.esiCode;
            emp.prevExp = document.getElementById('inpEmpPrevExp')?.value || emp.prevExp;
            emp.currentExp = document.getElementById('inpEmpCurrExp')?.value || emp.currentExp;
            emp.totalExp = document.getElementById('inpEmpTotalExp')?.value || emp.totalExp;
            emp.doj = document.getElementById('inpEmpDoj')?.value || emp.doj;
            emp.designation = document.getElementById('inpEmpDesignation')?.value || emp.designation;
          }
          renderTable();
        }

        setEmployeeFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Employee';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        showToast('Employee details saved & updated successfully!');
      }
    });
  }

  // --- SITE CARD EDIT TOGGLE ---
  const btnSiteCardEditToggle = document.getElementById('btnSiteCardEditToggle');
  if (btnSiteCardEditToggle) {
    btnSiteCardEditToggle.addEventListener('click', () => {
      const lblTitle = document.getElementById('lblSiteCardTitle');
      const imgIcon = document.getElementById('imgSiteCardEditIcon');

      if (!isSiteFormEditing) {
        isSiteFormEditing = true;
        setSiteFormReadOnly(false);
        if (lblTitle) lblTitle.innerText = 'Edit Site';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('Site form is now editable');
      } else {
        isSiteFormEditing = false;
        if (currentViewedSiteId) {
          const site = indusSiteData.find(s => s.id === currentViewedSiteId);
          if (site) {
            site.circle = document.getElementById('inpSiteCircle')?.value || site.circle;
            site.siteId = document.getElementById('inpSiteId')?.value || site.siteId;
            site.whId = document.getElementById('inpSiteWhId')?.value || site.whId;
            site.siteName = document.getElementById('inpSiteName')?.value || site.siteName;
            site.district = document.getElementById('inpSiteDistrict')?.value || site.district;
            site.town = document.getElementById('inpSiteTown')?.value || site.town;
            site.address = document.getElementById('inpSiteAddress')?.value || site.address;
            site.latitude = document.getElementById('inpSiteLattitude')?.value || site.latitude;
            site.longitude = document.getElementById('inpSiteLongtitude')?.value || site.longitude;
            site.transportZone = document.getElementById('inpSiteTransportZone')?.value || site.transportZone;
          }
          renderTable();
        }
        setSiteFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Site';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        showToast('Site details saved & updated successfully!');
      }
    });
  }

  // --- INFRA CARD EDIT TOGGLE ---
  const btnInfraCardEditToggle = document.getElementById('btnInfraCardEditToggle');
  if (btnInfraCardEditToggle) {
    btnInfraCardEditToggle.addEventListener('click', () => {
      const lblTitle = document.getElementById('lblInfraCardTitle');
      const imgIcon = document.getElementById('imgInfraCardEditIcon');

      if (!isInfraFormEditing) {
        isInfraFormEditing = true;
        setInfraFormReadOnly(false);
        if (lblTitle) lblTitle.innerText = 'Edit Infra';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('Infra form is now editable');
      } else {
        isInfraFormEditing = false;
        if (currentViewedInfraId) {
          const infra = indusInfraData.find(i => i.id === currentViewedInfraId);
          if (infra) {
            infra.infraCategory = document.getElementById('inpInfraCategory')?.value || infra.infraCategory;
            infra.infraDescription = document.getElementById('inpInfraDescription')?.value || infra.infraDescription;
            infra.uom = document.getElementById('inpInfraUom')?.value || infra.uom;
            infra.make = document.getElementById('inpInfraMake')?.value || infra.make;
          }
          renderTable();
        }
        setInfraFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Infra';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        showToast('Infra details saved & updated successfully!');
      }
    });
  }

  // --- PROJECT CARD EDIT TOGGLE ---
  const btnProjectCardEditToggle = document.getElementById('btnProjectCardEditToggle');
  if (btnProjectCardEditToggle) {
    btnProjectCardEditToggle.addEventListener('click', () => {
      const lblTitle = document.getElementById('lblProjectCardTitle');
      const imgIcon = document.getElementById('imgProjectCardEditIcon');

      if (!isProjectFormEditing) {
        isProjectFormEditing = true;
        setProjectFormReadOnly(false);
        if (lblTitle) lblTitle.innerText = 'Edit Project';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('Project form is now editable');
      } else {
        isProjectFormEditing = false;
        if (currentViewedProjectId) {
          const proj = indusProjectsData.find(p => p.id === currentViewedProjectId);
          if (proj) {
            proj.projectType = document.getElementById('inpProjectType')?.value || proj.projectType;
            proj.subProjectType = document.getElementById('inpSubProjectType')?.value || proj.subProjectType;
            proj.tat = document.getElementById('inpProjectTat')?.value || proj.tat;
            proj.indusPm = document.getElementById('inpIndusPm')?.value || proj.indusPm;
            proj.indusScm = document.getElementById('inpIndusScm')?.value || proj.indusScm;
            proj.pm = document.getElementById('inpProjectPm')?.value || proj.pm;
          }
          renderTable();
        }
        setProjectFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Project';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        showToast('Project details saved & updated successfully!');
      }
    });
  }

  // Wire btnProductCardEditToggle
  const btnProductCardEditToggle = document.getElementById('btnProductCardEditToggle');
  if (btnProductCardEditToggle) {
    btnProductCardEditToggle.addEventListener('click', () => {
      const lblTitle = document.getElementById('lblProductCardTitle');
      const imgIcon = document.getElementById('imgProductCardEditIcon');

      if (!isProductFormEditing) {
        // ENTER EDIT MODE
        isProductFormEditing = true;
        setProductFormReadOnly(false);
        if (lblTitle) lblTitle.innerText = 'Edit Product';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('Product form is now editable');
      } else {
        // SAVE EDITS
        isProductFormEditing = false;
        if (currentViewedProductId) {
          const prod = masterProductsData.find(p => p.id === currentViewedProductId);
          if (prod) {
            prod.productHead = document.getElementById('inpProductHead')?.value || prod.productHead;
            prod.productCode = document.getElementById('inpProductCode')?.value || prod.productCode;
            prod.hsnCode = document.getElementById('inpProductHsn')?.value || prod.hsnCode;
            prod.productDescription = document.getElementById('inpProductDesc')?.value || prod.productDescription;
            prod.uom = document.getElementById('inpProductUom')?.value || prod.uom;
            prod.msq = document.getElementById('inpProductMsq')?.value || prod.msq;
            prod.moq = document.getElementById('inpProductMoq')?.value || prod.moq;
            prod.stockPrices = document.getElementById('inpProductStockPrices')?.value || prod.stockPrices;
            prod.oh = document.getElementById('inpProductOh')?.value || prod.oh;
            prod.margin = document.getElementById('inpProductMargin')?.value || prod.margin;
            prod.gstRate = document.getElementById('inpProductGstRate')?.value || prod.gstRate;
            const statusToggle = document.getElementById('inpProductStatusToggle');
            prod.status = (statusToggle && statusToggle.checked) ? "Active" : "In - Active";
          }
          currentDataset = [...masterProductsData];
          applyFiltersAndRender();
        }
        setProductFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Product';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        showToast('Product details saved & updated successfully!');
      }
    });
  }

  // Wire btnExpenseCardEditToggle
  const btnExpenseCardEditToggle = document.getElementById('btnExpenseCardEditToggle');
  if (btnExpenseCardEditToggle) {
    btnExpenseCardEditToggle.addEventListener('click', () => {
      const lblTitle = document.getElementById('lblExpenseCardTitle');
      const imgIcon = document.getElementById('imgExpenseCardEditIcon');

      if (!isExpenseFormEditing) {
        // ENTER EDIT MODE
        isExpenseFormEditing = true;
        setExpenseFormReadOnly(false);
        if (lblTitle) lblTitle.innerText = 'Edit Expense';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('Expense form is now editable');
      } else {
        // SAVE EDITS
        isExpenseFormEditing = false;
        if (currentViewedExpenseId) {
          const exp = masterExpensesData.find(e => e.id === currentViewedExpenseId);
          if (exp) {
            exp.expenseHead = document.getElementById('inpExpenseHead')?.value || exp.expenseHead;
            exp.expenseCode = document.getElementById('inpExpenseCode')?.value || exp.expenseCode;
            exp.sacCode = document.getElementById('inpExpenseSac')?.value || exp.sacCode;
            exp.expenseDescription = document.getElementById('inpExpenseDesc')?.value || exp.expenseDescription;
            exp.uom = document.getElementById('inpExpenseUom')?.value || exp.uom;
            exp.gstRate = document.getElementById('inpExpenseGstRate')?.value || exp.gstRate;
            exp.tdsRate = document.getElementById('inpExpenseTdsRate')?.value || exp.tdsRate;
            const rcmToggle = document.getElementById('inpExpenseRcmToggle');
            exp.rcm = (rcmToggle && rcmToggle.checked) ? "Yes" : "No";
            const statusToggle = document.getElementById('inpExpenseStatusToggle');
            exp.status = (statusToggle && statusToggle.checked) ? "Active" : "In - Active";
          }
          currentDataset = [...masterExpensesData];
          applyFiltersAndRender();
        }
        setExpenseFormReadOnly(true);
        if (lblTitle) lblTitle.innerText = 'View Expense';
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.title = 'Edit Info';
        }
        showToast('Expense details saved & updated successfully!');
      }
    });
  }

  const btnProjectTransportIcon = document.getElementById('btnProjectTransportIcon');
  if (btnProjectTransportIcon) {
    btnProjectTransportIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      openTransportDetailsSidePanel();
    });
  }

  // Close button for transport panel
  const btnCloseTransport = document.getElementById('btnCloseTransportPanel');
  if (btnCloseTransport) {
    btnCloseTransport.addEventListener('click', () => {
      const tp = document.getElementById('transportDetailsSidePanel');
      if (tp) tp.style.display = 'none';
      // Restore project card visibility
      const projectCard = document.getElementById('addProjectCard');
      if (projectCard) projectCard.classList.remove('card-dimmed-blurred');
      // Remove has-dimmed-card from row
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
    });
  }

  const btnProjectSurveyIcon = document.getElementById('btnProjectSurveyIcon');
  if (btnProjectSurveyIcon) {
    btnProjectSurveyIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      openProjectDocSidePanel();
    });
  }

  // Close button for project type doc panel
  const btnCloseProjectDoc = document.getElementById('btnCloseProjectDocPanel');
  if (btnCloseProjectDoc) {
    btnCloseProjectDoc.addEventListener('click', () => {
      const dp = document.getElementById('projectTypeDocSidePanel');
      if (dp) dp.style.display = 'none';
      // Restore project card visibility
      const projectCard = document.getElementById('addProjectCard');
      if (projectCard) projectCard.classList.remove('card-dimmed-blurred');
      // Remove has-dimmed-card from row
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
    });
  }

  // Vendor Bank Edit Toggle (switches to Save icon when editing)
  const btnVendorBankEditToggle = document.getElementById('btnVendorBankEditToggle');
  if (btnVendorBankEditToggle) {
    btnVendorBankEditToggle.addEventListener('click', () => {
      if (!isVendorBankEditing) {
        setVendorBankEditingState(true);
        document.getElementById('inpVendorBankAccountName')?.focus();
        showToast('Vendor Bank form is now editable');
      } else {
        setVendorBankEditingState(false);
        showToast('Vendor Bank details saved & updated successfully!');
      }
    });
  }

  // Close button for vendor bank side card
  const btnCloseVendorBank = document.getElementById('btnCloseVendorBankCard');
  if (btnCloseVendorBank) {
    btnCloseVendorBank.addEventListener('click', () => {
      const vb = document.getElementById('vendorBankSideCard');
      if (vb) vb.style.display = 'none';
      // Restore vendor card visibility
      const vendorCard = document.getElementById('addVendorCard');
      if (vendorCard) vendorCard.classList.remove('card-dimmed-blurred');
      // Remove has-dimmed-card from row
      const cardsRow = document.querySelector('.side-form-cards-row');
      if (cardsRow) cardsRow.classList.remove('has-dimmed-card');
      showToast('Vendor Bank tab closed');
    });
  }
});

// --- VENDOR BANK EDIT HANDLER ---
let isVendorBankEditing = false;

function setVendorBankEditingState(isEditing) {
  isVendorBankEditing = isEditing;
  const form = document.getElementById('frmVendorBank');
  if (!form) return;

  const textInputs = form.querySelectorAll('input[type="text"]');
  textInputs.forEach(inp => {
    if (isEditing) {
      inp.removeAttribute('readonly');
      inp.style.backgroundColor = '#ffffff';
    } else {
      inp.setAttribute('readonly', 'true');
      inp.style.backgroundColor = '#f8fafc';
    }
  });

  const selects = form.querySelectorAll('select');
  selects.forEach(sel => {
    if (isEditing) {
      sel.removeAttribute('disabled');
      sel.style.backgroundColor = '#ffffff';
    } else {
      sel.setAttribute('disabled', 'true');
      sel.style.backgroundColor = '#f8fafc';
    }
  });

  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    t.disabled = !isEditing;
  });

  const imgEditIcon = document.getElementById('imgVendorBankEditIcon');
  if (imgEditIcon) {
    if (isEditing) {
      imgEditIcon.src = 'icons/Save.svg';
      imgEditIcon.title = 'Save Changes';
    } else {
      imgEditIcon.src = 'icons/Edit.svg';
      imgEditIcon.title = 'Edit Info';
    }
  }
}

// --- SITE, INFRA, PROJECT VIEW HANDLERS ---
let currentViewedSiteId = null;
let isSiteFormEditing = false;

function setSiteFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddSite');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') return;
    if (isReadOnly) {
      if (input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
      else input.setAttribute('readonly', 'true');
      input.style.backgroundColor = '#f8fafc';
    } else {
      if (input.tagName === 'SELECT') input.removeAttribute('disabled');
      else input.removeAttribute('readonly');
      input.style.backgroundColor = '#ffffff';
    }
  });
  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    t.disabled = isReadOnly;
    if (isReadOnly) t.checked = false;
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  });
}

window.handleSiteClick = function(siteId, siteName) {
  let site = indusSiteData.find(s => s.id === siteId || s.siteName === siteName || s.siteId === siteId);
  if (!site) {
    site = {
      id: siteId || 'site-1',
      circle: "Chennai",
      siteId: "230510678",
      whId: "WH-101",
      siteName: siteName || "R/RL-234567",
      district: "Chennai",
      town: "Ambattur",
      address: "123 Industrial Area",
      latitude: "13.0827",
      longitude: "80.2707",
      transportZone: "A",
      status: "Active"
    };
  }

  currentViewedSiteId = site.id;
  isSiteFormEditing = false;
  openSideForm();

  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const card = document.getElementById('addSiteCard');
  if (card) card.style.display = 'block';

  const lblTitle = document.getElementById('lblSiteCardTitle');
  if (lblTitle) lblTitle.innerText = 'View Site';

  const btnEditToggle = document.getElementById('btnSiteCardEditToggle');
  const btnSiteMsg = document.getElementById('btnSiteCardMessageIcon');
  const imgEditIcon = document.getElementById('imgSiteCardEditIcon');
  if (btnEditToggle) btnEditToggle.style.display = 'flex';
  if (btnSiteMsg) btnSiteMsg.style.display = 'flex';
  if (imgEditIcon) {
    imgEditIcon.src = 'icons/Edit.svg';
    imgEditIcon.title = 'Edit Info';
  }

  const btnSaveWrap = document.querySelector('#frmAddSite .form-submit-inside-wrap');
  if (btnSaveWrap) btnSaveWrap.style.display = 'none';

  if (document.getElementById('inpSiteCircle')) document.getElementById('inpSiteCircle').value = site.circle || 'Chennai';
  if (document.getElementById('inpSiteId')) document.getElementById('inpSiteId').value = site.siteId || '230510678';
  if (document.getElementById('inpSiteWhId')) document.getElementById('inpSiteWhId').value = site.whId || 'WH-101';
  if (document.getElementById('inpSiteName')) document.getElementById('inpSiteName').value = site.siteName || 'R/RL-234567';
  if (document.getElementById('inpSiteDistrict')) document.getElementById('inpSiteDistrict').value = site.district || 'Chennai';
  if (document.getElementById('inpSiteTown')) document.getElementById('inpSiteTown').value = site.town || 'Ambattur';
  if (document.getElementById('inpSiteAddress')) document.getElementById('inpSiteAddress').value = site.address || '123 Industrial Area';
  if (document.getElementById('inpSiteLattitude')) document.getElementById('inpSiteLattitude').value = site.latitude || '13.0827';
  if (document.getElementById('inpSiteLongtitude')) document.getElementById('inpSiteLongtitude').value = site.longitude || '80.2707';
  if (document.getElementById('inpSiteTransportZone')) document.getElementById('inpSiteTransportZone').value = site.transportZone || 'A';
  
  // Keep slidebars in DEACTIVE state (unchecked / Red OFF) when viewing
  if (document.getElementById('inpSiteStatusToggle')) document.getElementById('inpSiteStatusToggle').checked = false;

  setSiteFormReadOnly(true);
  showToast(`Viewing site details: ${site.siteName}`);
};

let currentViewedInfraId = null;
let isInfraFormEditing = false;

function setInfraFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddInfra');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') return;
    if (isReadOnly) {
      if (input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
      else input.setAttribute('readonly', 'true');
      input.style.backgroundColor = '#f8fafc';
    } else {
      if (input.tagName === 'SELECT') input.removeAttribute('disabled');
      else input.removeAttribute('readonly');
      input.style.backgroundColor = '#ffffff';
    }
  });
  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    t.disabled = isReadOnly;
    if (isReadOnly) t.checked = false;
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  });
}

window.handleInfraClick = function(infraId, infraCat) {
  let infra = indusInfraData.find(i => i.id === infraId || i.infraCategory === infraCat);
  if (!infra) {
    infra = {
      id: infraId || 'infra-1',
      infraCategory: infraCat || "230510678",
      infraDescription: "Infra Description Details",
      uom: "Nos",
      make: "Dell",
      commissioning: "Yes",
      iMap: "Yes",
      status: "Active"
    };
  }

  currentViewedInfraId = infra.id;
  isInfraFormEditing = false;
  openSideForm();

  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const card = document.getElementById('addInfraCard');
  if (card) card.style.display = 'block';

  const lblTitle = document.getElementById('lblInfraCardTitle');
  if (lblTitle) lblTitle.innerText = 'View Infra';

  const btnEditToggle = document.getElementById('btnInfraCardEditToggle');
  const imgEditIcon = document.getElementById('imgInfraCardEditIcon');
  if (btnEditToggle) btnEditToggle.style.display = 'flex';
  if (imgEditIcon) {
    imgEditIcon.src = 'icons/Edit.svg';
    imgEditIcon.title = 'Edit Info';
  }

  const btnSaveWrap = document.querySelector('#frmAddInfra .form-submit-inside-wrap');
  if (btnSaveWrap) btnSaveWrap.style.display = 'none';

  if (document.getElementById('inpInfraCategory')) document.getElementById('inpInfraCategory').value = infra.infraCategory || '230510678';
  if (document.getElementById('inpInfraDescription')) document.getElementById('inpInfraDescription').value = infra.infraDescription || 'Infra Description Details';
  if (document.getElementById('inpInfraUom')) document.getElementById('inpInfraUom').value = infra.uom || 'Nos';
  if (document.getElementById('inpInfraMake')) document.getElementById('inpInfraMake').value = infra.make || 'Dell';
  
  // Keep slidebars in DEACTIVE state (unchecked / Red OFF) when viewing
  if (document.getElementById('inpInfraCommissioningToggle')) document.getElementById('inpInfraCommissioningToggle').checked = false;
  if (document.getElementById('inpInfraIMapToggle')) document.getElementById('inpInfraIMapToggle').checked = false;
  if (document.getElementById('inpInfraStatusToggle')) document.getElementById('inpInfraStatusToggle').checked = false;

  setInfraFormReadOnly(true);
  showToast(`Viewing infra details: ${infra.infraCategory}`);
};

let currentViewedProjectId = null;
let isProjectFormEditing = false;

function setProjectFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddProject');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') return;
    if (isReadOnly) {
      if (input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
      else input.setAttribute('readonly', 'true');
      input.style.backgroundColor = '#f8fafc';
    } else {
      if (input.tagName === 'SELECT') input.removeAttribute('disabled');
      else input.removeAttribute('readonly');
      input.style.backgroundColor = '#ffffff';
    }
  });
  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    t.disabled = isReadOnly;
    if (isReadOnly) t.checked = false;
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  });
}

window.handleProjectClick = function(projectId, projectType) {
  let proj = indusProjectsData.find(p => p.id === projectId || p.projectType === projectType);
  if (!proj) {
    proj = {
      id: projectId || 'proj-1',
      projectType: projectType || "KTN",
      subProjectType: "KTN",
      tat: "15 Days",
      indusPm: "R/RL-234567",
      indusScm: "R/RL-234567",
      pm: "R/RL-234567",
      mis: "R/RL-234567",
      survey: "Yes",
      additionalTransport: "Yes",
      status: "Active"
    };
  }

  currentViewedProjectId = proj.id;
  isProjectFormEditing = false;
  openSideForm();

  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const card = document.getElementById('addProjectCard');
  if (card) card.style.display = 'block';

  const lblTitle = document.getElementById('lblProjectCardTitle');
  if (lblTitle) lblTitle.innerText = 'View Project';

  const btnEditToggle = document.getElementById('btnProjectCardEditToggle');
  const btnTransport = document.getElementById('btnProjectTransportIcon');
  const btnSurvey = document.getElementById('btnProjectSurveyIcon');
  const imgEditIcon = document.getElementById('imgProjectCardEditIcon');
  if (btnEditToggle) btnEditToggle.style.display = 'flex';
  if (btnTransport) btnTransport.style.display = 'flex';
  if (btnSurvey) btnSurvey.style.display = 'flex';
  if (imgEditIcon) {
    imgEditIcon.src = 'icons/Edit.svg';
    imgEditIcon.title = 'Edit Info';
  }

  const btnSaveWrap = document.querySelector('#frmAddProject .form-submit-inside-wrap');
  if (btnSaveWrap) btnSaveWrap.style.display = 'none';

  if (document.getElementById('inpProjectType')) document.getElementById('inpProjectType').value = proj.projectType || 'KTN';
  if (document.getElementById('inpSubProjectType')) document.getElementById('inpSubProjectType').value = proj.subProjectType || 'KTN';
  if (document.getElementById('inpProjectTat')) document.getElementById('inpProjectTat').value = proj.tat || '15 Days';
  if (document.getElementById('inpIndusPm')) document.getElementById('inpIndusPm').value = proj.indusPm || 'R/RL-234567';
  if (document.getElementById('inpIndusScm')) document.getElementById('inpIndusScm').value = proj.indusScm || 'R/RL-234567';
  if (document.getElementById('inpProjectPm')) document.getElementById('inpProjectPm').value = proj.pm || 'R/RL-234567';

  // Keep slidebars in DEACTIVE state (unchecked / Red OFF) when viewing
  if (document.getElementById('inpProjectSurveyToggle')) document.getElementById('inpProjectSurveyToggle').checked = false;
  if (document.getElementById('inpProjectTransportToggle')) document.getElementById('inpProjectTransportToggle').checked = false;
  if (document.getElementById('inpProjectStatusToggle')) document.getElementById('inpProjectStatusToggle').checked = false;

  setProjectFormReadOnly(true);
  showToast(`Viewing project details: ${proj.projectType}`);
};

let currentViewedProductId = null;
let isProductFormEditing = false;

function setProductFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddProduct');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') return;
    if (isReadOnly) {
      if (input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
      else input.setAttribute('readonly', 'true');
      input.style.backgroundColor = '#f8fafc';
    } else {
      if (input.tagName === 'SELECT') input.removeAttribute('disabled');
      else input.removeAttribute('readonly');
      input.style.backgroundColor = '#ffffff';
    }
  });
  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    t.disabled = isReadOnly;
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  });
}

window.openViewProductCard = function(productId) {
  let prod = masterProductsData.find(p => p.id === productId || p.productHead === productId);
  if (!prod) {
    prod = {
      id: productId || 'prod-1',
      productHead: "Telecom Tower Mast",
      productCode: "PRD-TTM-001",
      hsnCode: "73082019",
      productDescription: "40M Galvanized Tubular Telecom Tower Mast Structure",
      uom: "Nos",
      msq: "10",
      moq: "2",
      stockPrices: "4,50,000.00",
      oh: "2%",
      margin: "10%",
      gstRate: "18%",
      status: "Active"
    };
  }

  currentViewedProductId = prod.id;
  isProductFormEditing = false;
  openSideForm();

  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const card = document.getElementById('addProductCard');
  if (card) card.style.display = 'block';

  const lblTitle = document.getElementById('lblProductCardTitle');
  if (lblTitle) lblTitle.innerText = 'View Product';

  const btnEditToggle = document.getElementById('btnProductCardEditToggle');
  const imgEditIcon = document.getElementById('imgProductCardEditIcon');
  if (btnEditToggle) btnEditToggle.style.display = 'flex';
  if (imgEditIcon) {
    imgEditIcon.src = 'icons/Edit.svg';
    imgEditIcon.title = 'Edit Info';
  }

  const btnSaveWrap = document.querySelector('#frmAddProduct .form-submit-inside-wrap');
  if (btnSaveWrap) btnSaveWrap.style.display = 'none';

  if (document.getElementById('inpProductHead')) document.getElementById('inpProductHead').value = prod.productHead || '';
  if (document.getElementById('inpProductCode')) document.getElementById('inpProductCode').value = prod.productCode || '';
  if (document.getElementById('inpProductHsn')) document.getElementById('inpProductHsn').value = prod.hsnCode || '';
  if (document.getElementById('inpProductDesc')) document.getElementById('inpProductDesc').value = prod.productDescription || '';
  if (document.getElementById('inpProductUom')) document.getElementById('inpProductUom').value = prod.uom || 'Pcs';
  if (document.getElementById('inpProductMsq')) document.getElementById('inpProductMsq').value = prod.msq || '';
  if (document.getElementById('inpProductMoq')) document.getElementById('inpProductMoq').value = prod.moq || '';
  if (document.getElementById('inpProductStockPrices')) document.getElementById('inpProductStockPrices').value = prod.stockPrices || '';
  if (document.getElementById('inpProductOh')) document.getElementById('inpProductOh').value = prod.oh || '1%';
  if (document.getElementById('inpProductMargin')) document.getElementById('inpProductMargin').value = prod.margin || '1%';
  if (document.getElementById('inpProductGstRate')) document.getElementById('inpProductGstRate').value = prod.gstRate || '18%';

  const statusToggle = document.getElementById('inpProductStatusToggle');
  if (statusToggle) {
    statusToggle.checked = (prod.status || '').toLowerCase() === 'active';
  }

  setProductFormReadOnly(true);
  showToast(`Viewing product details: ${prod.productHead}`);
};

let currentViewedExpenseId = null;
let isExpenseFormEditing = false;

function setExpenseFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddExpense');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.type === 'checkbox') return;
    if (isReadOnly) {
      if (input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
      else input.setAttribute('readonly', 'true');
      input.style.backgroundColor = '#f8fafc';
    } else {
      if (input.tagName === 'SELECT') input.removeAttribute('disabled');
      else input.removeAttribute('readonly');
      input.style.backgroundColor = '#ffffff';
    }
  });
  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    t.disabled = isReadOnly;
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  });
}

window.openViewExpenseCard = function(expenseId) {
  let exp = masterExpensesData.find(e => e.id === expenseId || e.expenseHead === expenseId);
  if (!exp) {
    exp = {
      id: expenseId || 'exp-1',
      expenseHead: "Project",
      expenseCode: "EXP-PRJ-001",
      sacCode: "998313",
      expenseDescription: "Site Infrastructure & Telecom Tower Installation",
      uom: "Pcs",
      gstRate: "18%",
      tdsRate: "1%",
      rcm: "No",
      status: "Active"
    };
  }

  currentViewedExpenseId = exp.id;
  isExpenseFormEditing = false;
  openSideForm();

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

  if (document.getElementById('inpExpenseHead')) document.getElementById('inpExpenseHead').value = exp.expenseHead || 'Project';
  if (document.getElementById('inpExpenseCode')) document.getElementById('inpExpenseCode').value = exp.expenseCode || '';
  if (document.getElementById('inpExpenseSac')) document.getElementById('inpExpenseSac').value = exp.sacCode || '';
  if (document.getElementById('inpExpenseDesc')) document.getElementById('inpExpenseDesc').value = exp.expenseDescription || '';
  if (document.getElementById('inpExpenseUom')) document.getElementById('inpExpenseUom').value = exp.uom || 'Pcs';
  if (document.getElementById('inpExpenseGstRate')) document.getElementById('inpExpenseGstRate').value = exp.gstRate || '18%';
  if (document.getElementById('inpExpenseTdsRate')) document.getElementById('inpExpenseTdsRate').value = exp.tdsRate || '1%';

  const rcmToggle = document.getElementById('inpExpenseRcmToggle');
  if (rcmToggle) {
    rcmToggle.checked = (exp.rcm || '').toLowerCase() === 'yes' || exp.rcm === true;
  }

  const statusToggle = document.getElementById('inpExpenseStatusToggle');
  if (statusToggle) {
    statusToggle.checked = (exp.status || '').toLowerCase() === 'active';
  }

  setExpenseFormReadOnly(true);
  showToast(`Viewing expense details: ${exp.expenseHead}`);
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

// ==========================================================================
// 10. CSV & PDF NATIVE FILE UPLOAD ENGINE (Filters strictly .csv and .pdf)
// ==========================================================================
function triggerCsvUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv, text/csv';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name;
      const ext = fileName.split('.').pop().toLowerCase();
      if (ext !== 'csv') {
        showToast('Invalid file format. Please select a .csv file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        showToast(`CSV File "${fileName}" uploaded successfully!`);
      };
      reader.readAsText(file);
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  setTimeout(() => {
    if (document.body.contains(fileInput)) {
      document.body.removeChild(fileInput);
    }
  }, 1000);
}

function triggerPdfUpload(targetInput) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.pdf, application/pdf';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name;
      const ext = fileName.split('.').pop().toLowerCase();
      if (ext !== 'pdf') {
        showToast('Invalid file format. Please select a .pdf file');
        return;
      }
      if (targetInput) {
        if (typeof targetInput === 'string') {
          const el = document.getElementById(targetInput);
          if (el) el.value = fileName;
        } else if (targetInput instanceof HTMLElement) {
          targetInput.value = fileName;
        }
      }
      showToast(`PDF Document "${fileName}" uploaded successfully!`);
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  setTimeout(() => {
    if (document.body.contains(fileInput)) {
      document.body.removeChild(fileInput);
    }
  }, 1000);
}

function triggerBulkUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.setAttribute('webkitdirectory', '');
  fileInput.setAttribute('directory', '');
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      showToast(`Bulk Upload: ${files.length} file(s) selected from folder successfully!`);
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  setTimeout(() => {
    if (document.body.contains(fileInput)) {
      document.body.removeChild(fileInput);
    }
  }, 1000);
}

// Global click delegation for PDF upload badges, CSV upload, and Bulk upload buttons
document.addEventListener('click', (e) => {
  const pdfBadge = e.target.closest('.input-pdf-badge');
  if (pdfBadge) {
    e.preventDefault();
    const parentWrap = pdfBadge.closest('.form-input-wrap');
    const associatedInput = parentWrap ? parentWrap.querySelector('input') : null;
    triggerPdfUpload(associatedInput);
    return;
  }

  const csvBtn = e.target.closest('.btn-csv-action, #btnIndusCsv, #btnMasterCsv, #btnCsvAction');
  if (csvBtn) {
    e.preventDefault();
    triggerCsvUpload();
    return;
  }

  const bulkBtn = e.target.closest('.btn-doc-upload-action, #btnIndusDocUpload, #btnMasterDocUpload');
  if (bulkBtn) {
    e.preventDefault();
    triggerBulkUpload();
    return;
  }
});
