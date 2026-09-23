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
    vendorName: "Apex Telecom Infrastructure",
    businessType: "Telecom",
    serviceType: "Project",
    vendorType: "Telecom",
    vendorId: "230510678",
    gstNumber: "33ASMPM8643F1Z5",
    panNumber: "ASMPM8643F",
    gstType: "SGST",
    status: "Active",
    tdsDeduction: true,
    tdsCode: "1027",
    tdsRate: "1%",
    address: "123 Telecom Tower Complex, Chennai",
    tcsDeduction: false
  },
  {
    id: "vend-2",
    vendorName: "Steel Infra Supplies Ltd",
    businessType: "Supply",
    serviceType: "Civil",
    vendorType: "Supply",
    vendorId: "230510679",
    gstNumber: "29AABCU9603R1ZM",
    panNumber: "AABCU9603R",
    gstType: "IGST",
    status: "In - Active",
    tdsDeduction: false,
    tdsCode: "1031",
    tdsRate: "2%",
    address: "45 Industrial Area, Bengaluru",
    tcsDeduction: true
  },
  {
    id: "vend-3",
    vendorName: "Express Logistics Services",
    businessType: "Logistics",
    serviceType: "Transport",
    vendorType: "Logistics",
    vendorId: "230510680",
    gstNumber: "36BKMPM4321K1Z3",
    panNumber: "BKMPM4321K",
    gstType: "SGST",
    status: "Active",
    tdsDeduction: true,
    tdsCode: "1023",
    tdsRate: "1%",
    address: "78 Transport Nagar, Hyderabad",
    tcsDeduction: false
  },
  {
    id: "vend-4",
    vendorName: "Schneider Electric India Pvt Ltd",
    businessType: "Electrical",
    serviceType: "Supply",
    vendorType: "Electrical",
    vendorId: "230510681",
    gstNumber: "27AAACS1234A1Z5",
    panNumber: "AAACS1234A",
    gstType: "IGST",
    status: "Active",
    tdsDeduction: true,
    tdsCode: "1027",
    tdsRate: "2%",
    address: "88 Andheri East, Mumbai",
    tcsDeduction: false
  },
  {
    id: "vend-5",
    vendorName: "Kirloskar Power Systems",
    businessType: "Power",
    serviceType: "O&M",
    vendorType: "Power",
    vendorId: "230510682",
    gstNumber: "27AAACK4321B1Z2",
    panNumber: "AAACK4321B",
    gstType: "IGST",
    status: "Active",
    tdsDeduction: true,
    tdsCode: "1028",
    tdsRate: "2%",
    address: "12 Kirloskar Road, Pune",
    tcsDeduction: false
  },
  {
    id: "vend-6",
    vendorName: "Larsen & Toubro Ltd",
    businessType: "Infra",
    serviceType: "Construction",
    vendorType: "Infra",
    vendorId: "230510683",
    gstNumber: "33AAACL9876E1Z3",
    panNumber: "AAACL9876E",
    gstType: "SGST",
    status: "In - Active",
    tdsDeduction: true,
    tdsCode: "1030",
    tdsRate: "1%",
    address: "Mount Poonamallee Road, Manapakkam, Chennai",
    tcsDeduction: true
  }
];

// Master -> Products Dataset (Matching Uploaded Mockup)
const masterProductsData = [
  {
    id: "prod-1",
    productName: "Telecom Tower Mast",
    productHead: "Telecom Tower Mast",
    productCategory: "Tower Infrastructure",
    productCode: "PRD-TTM-001",
    hsnCode: "73082019",
    gst: "18%",
    gstRate: "18%",
    price: "4,50,000.00",
    stockPrices: "4,50,000.00",
    productDescription: "40M Galvanized Tubular Telecom Tower Mast Structure",
    uom: "Nos",
    msq: "10",
    moq: "2",
    oh: "2%",
    margin: "10%",
    status: "Active"
  },
  {
    id: "prod-2",
    productName: "Optical Fiber Cable",
    productHead: "Optical Fiber Cable",
    productCategory: "Optical Cables",
    productCode: "PRD-OFC-002",
    hsnCode: "85447090",
    gst: "18%",
    gstRate: "18%",
    price: "85.00",
    stockPrices: "85.00",
    productDescription: "24-Core Armored Outdoor Single-Mode Fiber Cable",
    uom: "Mtr",
    msq: "5000",
    moq: "500",
    oh: "1%",
    margin: "5%",
    status: "Active"
  },
  {
    id: "prod-3",
    productName: "Power Distribution Unit",
    productHead: "Power Distribution Unit",
    productCategory: "Electrical Equipment",
    productCode: "PRD-PDU-003",
    hsnCode: "85371000",
    gst: "18%",
    gstRate: "18%",
    price: "32,000.00",
    stockPrices: "32,000.00",
    productDescription: "AC/DC Dual Power Distribution Panel with Surge Protection",
    uom: "Pcs",
    msq: "25",
    moq: "5",
    oh: "2%",
    margin: "8%",
    status: "In - Active"
  },
  {
    id: "prod-4",
    productName: "Diesel Generator 15kVA",
    productHead: "Diesel Generator 15kVA",
    productCategory: "Power Backup",
    productCode: "PRD-GEN-004",
    hsnCode: "85021100",
    gst: "28%",
    gstRate: "28%",
    price: "2,80,000.00",
    stockPrices: "2,80,000.00",
    productDescription: "15kVA Soundproof Silent Diesel Generator Set",
    uom: "Nos",
    msq: "5",
    moq: "1",
    oh: "2%",
    margin: "8%",
    status: "Active"
  },
  {
    id: "prod-5",
    productName: "Lithium-Ion Battery 48V",
    productHead: "Lithium-Ion Battery 48V",
    productCategory: "Energy Storage",
    productCode: "PRD-BAT-005",
    hsnCode: "85076000",
    gst: "18%",
    gstRate: "18%",
    price: "1,20,000.00",
    stockPrices: "1,20,000.00",
    productDescription: "48V 100Ah Telecom Grade LiFePO4 Battery Bank",
    uom: "Nos",
    msq: "12",
    moq: "2",
    oh: "1.5%",
    margin: "7%",
    status: "Active"
  },
  {
    id: "prod-6",
    productName: "Earthing Copper Strip",
    productHead: "Earthing Copper Strip",
    productCategory: "Earthing & Protection",
    productCode: "PRD-ETH-006",
    hsnCode: "74071010",
    gst: "18%",
    gstRate: "18%",
    price: "650.00",
    stockPrices: "650.00",
    productDescription: "25x3mm Pure Copper Earthing Flat Strip",
    uom: "Mtr",
    msq: "200",
    moq: "25",
    oh: "1%",
    margin: "6%",
    status: "Active"
  }
];

/// Master -> Expenses Dataset (Matching Uploaded Mockup)
const masterExpensesData = [
  {
    id: "exp-1",
    expenseName: "Site Infrastructure & Telecom Tower Installation",
    expenseCategory: "Direct Operations",
    expenseSubCategory: "Civil Works",
    expenseHead: "Capex",
    expenseCode: "EXP-PRJ-001",
    sacCode: "998313",
    expenseDescription: "Site Infrastructure & Telecom Tower Installation",
    tdsRate: "2%",
    gstRate: "18%",
    gst: "18%",
    depreciation: "15%",
    uom: "Pcs",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-2",
    expenseName: "Procurement of Cables, Hardware & Consumables",
    expenseCategory: "Material Procurement",
    expenseSubCategory: "Hardware Consumables",
    expenseHead: "Capex",
    expenseCode: "EXP-PUR-002",
    sacCode: "998719",
    expenseDescription: "Procurement of Cables, Hardware & Consumables",
    tdsRate: "1%",
    gstRate: "18%",
    gst: "18%",
    depreciation: "10%",
    uom: "Nos",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-3",
    expenseName: "Field Staff Allowances, Travel & Reimbursements",
    expenseCategory: "Human Resources",
    expenseSubCategory: "Travel Allowances",
    expenseHead: "Opex",
    expenseCode: "EXP-EMP-003",
    sacCode: "998519",
    expenseDescription: "Field Staff Allowances, Travel & Reimbursements",
    tdsRate: "10%",
    gstRate: "0%",
    gst: "0%",
    depreciation: "0%",
    uom: "Month",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-4",
    expenseName: "Logistics, Vehicle Freight & Heavy Cargo Dispatch",
    expenseCategory: "Logistics & Transport",
    expenseSubCategory: "Fuel & Freight",
    expenseHead: "Opex",
    expenseCode: "EXP-TRN-004",
    sacCode: "996511",
    expenseDescription: "Logistics, Vehicle Freight & Heavy Cargo Dispatch",
    tdsRate: "2%",
    gstRate: "5%",
    gst: "5%",
    depreciation: "25%",
    uom: "Nos",
    rcm: "Yes",
    status: "Active"
  },
  {
    id: "exp-5",
    expenseName: "Office Maintenance, Utilities & Facility Operations",
    expenseCategory: "Administrative Support",
    expenseSubCategory: "Office Utilities",
    expenseHead: "Opex",
    expenseCode: "EXP-ADM-005",
    sacCode: "998599",
    expenseDescription: "Office Maintenance, Utilities & Facility Operations",
    tdsRate: "10%",
    gstRate: "18%",
    gst: "18%",
    depreciation: "10%",
    uom: "Month",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-6",
    expenseName: "Statutory Audit, Legal & Financial Consultancy",
    expenseCategory: "Professional Services",
    expenseSubCategory: "Audit & Legal",
    expenseHead: "Opex",
    expenseCode: "EXP-ACC-006",
    sacCode: "998222",
    expenseDescription: "Statutory Audit, Legal & Financial Consultancy",
    tdsRate: "10%",
    gstRate: "18%",
    gst: "18%",
    depreciation: "0%",
    uom: "Nos",
    rcm: "No",
    status: "Active"
  },
  {
    id: "exp-7",
    expenseName: "Government Licensing, Spectrum & Municipal Filings",
    expenseCategory: "Regulatory Compliance",
    expenseSubCategory: "Licensing",
    expenseHead: "Opex",
    expenseCode: "EXP-STA-007",
    sacCode: "999112",
    expenseDescription: "Government Licensing, Spectrum & Municipal Filings",
    tdsRate: "0%",
    gstRate: "0%",
    gst: "0%",
    depreciation: "0%",
    uom: "Nos",
    rcm: "No",
    status: "Active"
  }
];

// Company HR Policies Datasets
const companyHrEpfData = [
  {
    id: "hr-epf-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Monthly",
    fillingDueDate: "15th of Every Month",
    sealingAmount: "15,000.00",
    employee: "12%",
    epf: "3.67%",
    eps: "8.33%",
    edli: "0.50%",
    adminCharges: "0.50%",
    status: "Active"
  },
  {
    id: "hr-epf-2",
    from: "01 - 04 - 2025",
    to: "31 - 03 - 2026",
    fillingFrequency: "Monthly",
    fillingDueDate: "15th of Every Month",
    sealingAmount: "15,000.00",
    employee: "12%",
    epf: "3.67%",
    eps: "8.33%",
    edli: "0.50%",
    adminCharges: "0.50%",
    status: "In - Active"
  }
];

const companyHrEsiData = [
  {
    id: "hr-esi-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Monthly",
    fillingDueDate: "15th of Every Month",
    sealingAmount: "21,000.00",
    employee: "0.75%",
    epf: "3.25%",
    eps: "0.00%",
    edli: "0.00%",
    adminCharges: "0.00%",
    status: "Active"
  }
];

const companyHrPtData = [
  {
    id: "hr-pt-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Half Yearly",
    fillingDueDate: "30th Sept / 31st Mar",
    sealingAmount: "30,000.00",
    employee: "200.00",
    epf: "0.00",
    eps: "0.00",
    edli: "0.00",
    adminCharges: "0.00",
    status: "Active"
  }
];

const companyHrLwfData = [
  {
    id: "hr-lwf-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Annually",
    fillingDueDate: "31st Dec",
    sealingAmount: "NA",
    employee: "20.00",
    epf: "40.00",
    eps: "0.00",
    edli: "0.00",
    adminCharges: "0.00",
    status: "Active"
  }
];

const companyHrTdsData = [
  {
    id: "hr-tds-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Quarterly",
    fillingDueDate: "31st of Following Month",
    sealingAmount: "50,000.00",
    employee: "10%",
    epf: "10%",
    eps: "0.00%",
    edli: "0.00%",
    adminCharges: "0.00%",
    status: "Active"
  }
];

const companyHrLeaveData = [
  {
    id: "hr-leave-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Yearly",
    fillingDueDate: "31st Dec",
    sealingAmount: "18 Days",
    employee: "1.5 / Mo",
    epf: "Earned",
    eps: "Sick",
    edli: "Casual",
    adminCharges: "0.00",
    status: "Active"
  }
];

const companyHrBonusData = [
  {
    id: "hr-bonus-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Annually",
    fillingDueDate: "30th Nov",
    sealingAmount: "21,000.00",
    employee: "8.33%",
    epf: "8.33%",
    eps: "20.00%",
    edli: "0.00%",
    adminCharges: "0.00%",
    status: "Active"
  }
];

const companyHrMedicalInsuranceData = [
  {
    id: "hr-med-1",
    from: "01 - 04 - 2026",
    to: "31 - 03 - 2027",
    fillingFrequency: "Annually",
    fillingDueDate: "31st March",
    sealingAmount: "5,00,000.00",
    employee: "0.00",
    epf: "100%",
    eps: "0.00",
    edli: "0.00",
    adminCharges: "0.00",
    status: "Active"
  }
];

// Worklist -> Project Payment Details Dataset (Matching Uploaded Mockup)
let selectedProjectPaymentReq = "R/RL-234567";
const worklistProjectPaymentItems = [
  {
    id: "wpp-1",
    selected: false,
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
    selected: false,
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
    selected: false,
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

// Projects Landing Page Dataset (Matching Uploaded User Mockup)
const projectsSummaryRow = {
  isSummary: true,
  customer: "25",
  projectId: "20",
  poNo: "10",
  poAgeing: "H",
  poStatus: "H",
  siteId: "12",
  siteName: "30",
  projectType: "H",
  subProjectType: "30",
  projectStatus: "H",
  task: "35",
  pendingWith: "30",
  supportRequired: "30",
  pendingWith2: "30"
};

const projectsMainData = [
  {
    id: "proj-1",
    customer: "Indus",
    projectId: "2305 1067 8",
    poNo: "",
    poAgeing: "R/RL-234567",
    poStatus: "",
    siteId: "IN-123456",
    siteName: "Guindy",
    projectType: "New Build",
    subProjectType: "With DG",
    projectStatus: "",
    task: "",
    pendingWith: "",
    supportRequired: "",
    pendingWith2: ""
  },
  {
    id: "proj-2",
    customer: "Ascend",
    projectId: "2305 1067 8",
    poNo: "",
    poAgeing: "R/RL-234567",
    poStatus: "",
    siteId: "IN-123456",
    siteName: "Guindy",
    projectType: "New Build",
    subProjectType: "With DG",
    projectStatus: "",
    task: "",
    pendingWith: "",
    supportRequired: "",
    pendingWith2: ""
  }
];

const projectsSupplyData = [
  {
    id: "proj-sup-1",
    customer: "Altis",
    orderId: "2305 1067 8",
    orderDate: "12/08/2026",
    orderAmount: "3,50,000.00",
    invoiceNumber: "INV-2026-4401",
    invoiceDate: "18/08/2026",
    invoiceAmount: "3,50,000.00",
    ageing: "24",
    paymentStatus: "Pending"
  },
  {
    id: "proj-sup-2",
    customer: "Ascend",
    orderId: "2305 1067 8",
    orderDate: "15/08/2026",
    orderAmount: "1,85,000.00",
    invoiceNumber: "INV-2026-4402",
    invoiceDate: "20/08/2026",
    invoiceAmount: "1,85,000.00",
    ageing: "22",
    paymentStatus: "Paid"
  },
  {
    id: "proj-sup-3",
    customer: "Indus Towers",
    orderId: "2305 1067 9",
    orderDate: "22/08/2026",
    orderAmount: "4,20,000.00",
    invoiceNumber: "INV-2026-4403",
    invoiceDate: "28/08/2026",
    invoiceAmount: "4,20,000.00",
    ageing: "14",
    paymentStatus: "Partial"
  },
  {
    id: "proj-sup-4",
    customer: "Reliance Jio",
    orderId: "2305 1068 0",
    orderDate: "01/09/2026",
    orderAmount: "6,75,000.00",
    invoiceNumber: "INV-2026-4404",
    invoiceDate: "05/09/2026",
    invoiceAmount: "6,75,000.00",
    ageing: "6",
    paymentStatus: "Pending"
  }
];

const supplyCustomerDetailData = {
  'proj-sup-1': [
    { id: 'sc-1', itemDescription: 'Optical Fiber Cable 24 Core Armoured', uom: 'MTR', qty: '1,200.00', rate: '250.00', amount: '3,00,000.00' },
    { id: 'sc-2', itemDescription: 'Outdoor Termination Box 24 Port IP65', uom: 'NOS', qty: '50.00', rate: '4,000.00', amount: '2,00,000.00' },
    { id: 'sc-3', itemDescription: 'Power Distribution Unit 3-Phase 32A', uom: 'SET', qty: '20.00', rate: '30,000.00', amount: '6,00,000.00' }
  ],
  'proj-sup-2': [
    { id: 'sc-4', itemDescription: 'Cat6 UTP Cable 305M Roll', uom: 'BOX', qty: '15.00', rate: '7,000.00', amount: '1,05,000.00' },
    { id: 'sc-5', itemDescription: 'Patch Panel 24 Port Loaded Cat6', uom: 'NOS', qty: '16.00', rate: '5,000.00', amount: '80,000.00' }
  ],
  'default': [
    { id: 'sc-def-1', itemDescription: 'Telecom Tower Mast Accessories', uom: 'SET', qty: '10.00', rate: '50,000.00', amount: '5,00,000.00' },
    { id: 'sc-def-2', itemDescription: 'Heavy Duty Grounding Copper Tape 25x3mm', uom: 'MTR', qty: '400.00', rate: '1,500.00', amount: '6,00,000.00' }
  ]
};

// Project Details -> Expenses Sub-Page Dataset (2 rows)
const projectExpensesData = [
  {
    id: "exp-1",
    expenseType: "Material",
    itemName: "Diesel Generator Set 15kVA Silent Type",
    uom: "NOS",
    qty: "1.00",
    po: "1,50,000.00",
    budget: "1,60,000.00",
    used: "1,50,000.00",
    available: "10,000.00"
  },
  {
    id: "exp-2",
    expenseType: "Service",
    itemName: "Site Survey, Soil Testing & Foundation",
    uom: "LOT",
    qty: "1.00",
    po: "45,000.00",
    budget: "50,000.00",
    used: "45,000.00",
    available: "5,000.00"
  }
];

// Project Details -> Material Sub-Page Dataset
const projectMaterialData = [
  {
    id: "mat-1",
    boqName: "Telecom Tower Mast Accessories 30M",
    uom: "SET",
    mir: "10.00",
    min: "10.00",
    mrr: "0.00",
    mrn: "0.00",
    net: "10.00",
    rate: "50,000.00",
    amount: "5,00,000.00"
  },
  {
    id: "mat-2",
    boqName: "4 Core 16 sq mm Armoured Copper Cable",
    uom: "MTR",
    mir: "120.00",
    min: "120.00",
    mrr: "0.00",
    mrn: "0.00",
    net: "120.00",
    rate: "450.00",
    amount: "54,000.00"
  },
  {
    id: "mat-3",
    boqName: "Chemical Earthing Electrode with Compound",
    uom: "SET",
    mir: "2.00",
    min: "2.00",
    mrr: "0.00",
    mrn: "0.00",
    net: "2.00",
    rate: "8,500.00",
    amount: "17,000.00"
  },
  {
    id: "mat-4",
    boqName: "Diesel Generator Set 15kVA Silent Type",
    uom: "NOS",
    mir: "1.00",
    min: "1.00",
    mrr: "0.00",
    mrn: "0.00",
    net: "1.00",
    rate: "1,50,000.00",
    amount: "1,50,000.00"
  },
  {
    id: "mat-5",
    boqName: "Galvanized Steel Fasteners & Clamps",
    uom: "PKT",
    mir: "25.00",
    min: "25.00",
    mrr: "0.00",
    mrn: "0.00",
    net: "25.00",
    rate: "1,200.00",
    amount: "30,000.00"
  }
];

// Project Details -> Infra Sub-Page Dataset (Matching User Mockup)
const projectInfraData = [
  {
    id: "infra-1",
    docType: "MIN",
    boqNo: "BOQ-234567-01",
    boqDate: "12/08/2026",
    category: "Tower",
    infraDescription: "Telecom Tower Mast Accessories 30M Galvanized Structure",
    qy: "1.00",
    status: "Active"
  },
  {
    id: "infra-2",
    docType: "MRN",
    boqNo: "BOQ-234567-02",
    boqDate: "15/08/2026",
    category: "Electrical",
    infraDescription: "Diesel Generator Set 15kVA Silent Type with AMF Panel",
    qy: "1.00",
    status: "Active"
  },
  {
    id: "infra-3",
    docType: "MIN",
    boqNo: "BOQ-234567-03",
    boqDate: "18/08/2026",
    category: "Civil",
    infraDescription: "25x6mm Hot Dip Galvanized Earth Strip & Chemical Pit",
    qy: "50.00",
    status: "Active"
  },
  {
    id: "infra-4",
    docType: "MRN",
    boqNo: "BOQ-234567-04",
    boqDate: "22/08/2026",
    category: "Security",
    infraDescription: "Outdoor CCTV Surveillance & Peripheral Security Fence",
    qy: "4.00",
    status: "Active"
  }
];

// Project Details -> DPR Sub-Page Dataset (Matching User Mockup)
const projectDprData = [
  {
    id: "dpr-1",
    date: "14/09/2026",
    activity: "Civil Foundation & Tower",
    status: "Approved",
    ptwType: "Height",
    ptwNumber: "PTW-88291",
    ptwStatus: "Closed",
    checkIn: "09:15 AM",
    checkOut: "06:30 PM",
    photoStart: "IMG_001.jpg",
    photoEnd: "IMG_002.jpg",
    updateBy: "Rajesh Kumar (FE)"
  },
  {
    id: "dpr-2",
    date: "13/09/2026",
    activity: "DG Set Cabling & Earth",
    status: "Completed",
    ptwType: "Electrical",
    ptwNumber: "PTW-88285",
    ptwStatus: "Closed",
    checkIn: "08:45 AM",
    checkOut: "05:15 PM",
    photoStart: "IMG_003.jpg",
    photoEnd: "IMG_004.jpg",
    updateBy: "Suresh Prabhu (Lead)"
  },
  {
    id: "dpr-3",
    date: "12/09/2026",
    activity: "Battery Bank & Controller",
    status: "In Progress",
    ptwType: "General",
    ptwNumber: "PTW-88270",
    ptwStatus: "Active",
    checkIn: "09:30 AM",
    checkOut: "07:00 PM",
    photoStart: "IMG_005.jpg",
    photoEnd: "IMG_006.jpg",
    updateBy: "Manoj Verma (Tech)"
  }
];

// Project Details -> BOQ Sub-Page Dataset (Matching User Mockup)
const projectBoqData = [
  {
    id: "boq-1",
    lineNo: "1",
    itemCode: "CIV-FND-001",
    itemDescription: "RCC Foundation Work (M25 Grade)",
    uom: "Cu.m",
    qty: "45.00",
    rate: "6,500.00",
    amount: "2,92,500.00"
  },
  {
    id: "boq-2",
    lineNo: "2",
    itemCode: "CIV-PLT-002",
    itemDescription: "Plinth & Boundary Wall Construction",
    uom: "R.mtr",
    qty: "120.00",
    rate: "2,100.00",
    amount: "2,52,000.00"
  },
  {
    id: "boq-3",
    lineNo: "3",
    itemCode: "ELE-CBL-003",
    itemDescription: "Electrical Power Cable Laying 4C x 50 sq.mm",
    uom: "Mtr",
    qty: "350.00",
    rate: "480.00",
    amount: "1,68,000.00"
  },
  {
    id: "boq-4",
    lineNo: "4",
    itemCode: "TWR-MST-004",
    itemDescription: "40M Galvanized Tubular Tower Erection & Painting",
    uom: "Set",
    qty: "1.00",
    rate: "3,87,500.00",
    amount: "3,87,500.00"
  }
];

// Project Additional Approvals Dataset
const projectApprovalsData = [
  {
    id: "appr-1",
    selected: false,
    requestDate: "15 - 08 - 2026",
    approvedDate: "18 - 08 - 2026",
    ageing: "3 Days",
    subject: "Additional DG Capacity Approval",
    status: "Approved"
  },
  {
    id: "appr-2",
    selected: false,
    requestDate: "10 - 08 - 2026",
    approvedDate: "-",
    ageing: "5 Days",
    subject: "Additional Budget for Civil Work",
    status: "Pending"
  },
  {
    id: "appr-3",
    selected: false,
    requestDate: "05 - 08 - 2026",
    approvedDate: "08 - 08 - 2026",
    ageing: "3 Days",
    subject: "Overtime Labour Approval",
    status: "Approved"
  },
  {
    id: "appr-4",
    selected: false,
    requestDate: "01 - 08 - 2026",
    approvedDate: "-",
    ageing: "14 Days",
    subject: "Extra Material Purchase Approval",
    status: "Pending"
  }
];

// Project Service Vendor Dataset
const projectServiceVendorData = [
  {
    id: "sv-1",
    serviceVendorName: "Sri Balaji Electricals",
    workType: "Electrical",
    basic: "2,50,000.00",
    gst: "45,000.00",
    totalAmount: "2,95,000.00",
    tdsDeduction: "5,000.00",
    paidAmount: "2,90,000.00",
    paidDate: "25 - 08 - 2026"
  },
  {
    id: "sv-2",
    serviceVendorName: "Apex Civil Constructions",
    workType: "Civil",
    basic: "4,80,000.00",
    gst: "86,400.00",
    totalAmount: "5,66,400.00",
    tdsDeduction: "9,600.00",
    paidAmount: "5,56,800.00",
    paidDate: "28 - 08 - 2026"
  }
];

// Project Service Vendor Detail Items Dataset
const projectServiceVendorItemsData = [
  {
    id: "sv-item-1",
    itemDescription: "Supply & Installation of 25kVA DG Set Soundproof Canopy with Base Frame",
    uom: "Nos",
    qty: "1.00",
    rate: "4,50,000.00",
    amount: "4,50,000.00"
  },
  {
    id: "sv-item-2",
    itemDescription: "Laying and Termination of 4C x 70 sq.mm Armoured Copper Power Cable",
    uom: "Mtr",
    qty: "120.00",
    rate: "2,500.00",
    amount: "3,00,000.00"
  },
  {
    id: "sv-item-3",
    itemDescription: "Chemical Earthing System with Copper Bonded Earth Electrodes & Chamber",
    uom: "Set",
    qty: "4.00",
    rate: "35,000.00",
    amount: "1,40,000.00"
  },
  {
    id: "sv-item-4",
    itemDescription: "Automatic Mains Failure (AMF) Control Panel with Auto Changeover Switch",
    uom: "Nos",
    qty: "1.00",
    rate: "2,10,000.00",
    amount: "2,10,000.00"
  }
];

// Inventory Dataset
const inventoryData = [
  {
    id: "inv-1",
    productDescription: "24 Port Patch Panel Loaded Cat 6 with Cable Management",
    whCode: "WH-DEL-01",
    productHead: "Passive Networking",
    productType: "Patch Panel",
    uom: "NOS",
    qty: "120.00",
    stockPrice: "1,250.00",
    stockValue: "1,50,000.00"
  },
  {
    id: "inv-2",
    productDescription: "6U Wall Mount Network Rack with Fan and PDU Complete Kit",
    whCode: "WH-MUM-02",
    productHead: "Racks & Enclosures",
    productType: "Rack System",
    uom: "NOS",
    qty: "45.00",
    stockPrice: "4,800.00",
    stockValue: "2,16,000.00"
  }
];

// Inventory Product Details Dataset
const inventoryProductDetailsData = [
  {
    id: "inv-det-1",
    invoiceNo: "INV-98231",
    vendorName: "Schneider Electric India Pvt Ltd",
    docDate: "12 - 08 - 2026",
    qtyDoc: "50.00",
    qtyStock: "50.00",
    qtyTotal: "100.00",
    purchasePrice: "1,150.00",
    transportation: "50.00",
    unloadingOther: "25.00",
    stockPrice: "1,225.00",
    newPrice: "1,250.00"
  },
  {
    id: "inv-det-2",
    invoiceNo: "INV-98232",
    vendorName: "D-Link India Limited",
    docDate: "15 - 08 - 2026",
    qtyDoc: "40.00",
    qtyStock: "35.00",
    qtyTotal: "75.00",
    purchasePrice: "1,180.00",
    transportation: "40.00",
    unloadingOther: "20.00",
    stockPrice: "1,240.00",
    newPrice: "1,260.00"
  },
  {
    id: "inv-det-3",
    invoiceNo: "INV-98240",
    vendorName: "CommScope Solutions India",
    docDate: "20 - 08 - 2026",
    qtyDoc: "30.00",
    qtyStock: "35.00",
    qtyTotal: "65.00",
    purchasePrice: "1,200.00",
    transportation: "30.00",
    unloadingOther: "15.00",
    stockPrice: "1,245.00",
    newPrice: "1,250.00"
  }
];

// Inventory Stock Price Details / Stock Ledger Dataset
const inventoryStockLedgerData = [
  {
    id: "stk-1",
    docDate: "12 - 08 - 2026",
    docType: "GRN",
    docNo: "GRN-2026-001",
    fromTo: "Schneider Electric India Pvt Ltd",
    uom: "NOS",
    qtyStock: "50.00",
    qtyDoc: "50.00",
    qtyBalance: "50.00",
    rate: "1,250.00",
    stockValue: "62,500.00"
  },
  {
    id: "stk-2",
    docDate: "15 - 08 - 2026",
    docType: "MIN",
    docNo: "MIN-2026-042",
    fromTo: "Project IN-123456 Guindy",
    uom: "NOS",
    qtyStock: "20.00",
    qtyDoc: "20.00",
    qtyBalance: "30.00",
    rate: "1,250.00",
    stockValue: "37,500.00"
  },
  {
    id: "stk-3",
    docDate: "18 - 08 - 2026",
    docType: "GRN",
    docNo: "GRN-2026-008",
    fromTo: "D-Link India Limited",
    uom: "NOS",
    qtyStock: "40.00",
    qtyDoc: "40.00",
    qtyBalance: "70.00",
    rate: "1,250.00",
    stockValue: "87,500.00"
  },
  {
    id: "stk-4",
    docDate: "22 - 08 - 2026",
    docType: "MRN",
    docNo: "MRN-2026-015",
    fromTo: "Project R/RL-234567",
    uom: "NOS",
    qtyStock: "10.00",
    qtyDoc: "10.00",
    qtyBalance: "80.00",
    rate: "1,250.00",
    stockValue: "1,00,000.00"
  }
];

// Purchase Dataset
const purchaseModuleData = [
  {
    id: "pur-1",
    prNo: "PR-2026-0891",
    requestBy: "Nivas Kumar",
    poNo: "PO-2026-1042",
    supplierName: "Schneider Electric India Pvt Ltd",
    poValue: "1,50,000.00",
    invoiceNo: "INV-98231",
    invoiceValue: "1,50,000.00",
    paymentStatus: "Paid",
    gstFilingStatus: "Filed"
  },
  {
    id: "pur-2",
    prNo: "PR-2026-0892",
    requestBy: "Praveen Raj",
    poNo: "PO-2026-1045",
    supplierName: "D-Link India Limited",
    poValue: "2,16,000.00",
    invoiceNo: "INV-98232",
    invoiceValue: "2,16,000.00",
    paymentStatus: "Partial",
    gstFilingStatus: "Pending"
  },
  {
    id: "pur-3",
    prNo: "PR-2026-0895",
    requestBy: "Suresh Prabhu",
    poNo: "PO-2026-1050",
    supplierName: "CommScope Solutions India",
    poValue: "3,80,000.00",
    invoiceNo: "INV-98240",
    invoiceValue: "3,80,000.00",
    paymentStatus: "Unpaid",
    gstFilingStatus: "Filed"
  },
  {
    id: "pur-4",
    prNo: "PR-2026-0898",
    requestBy: "Manoj Verma",
    poNo: "PO-2026-1058",
    supplierName: "Polycab Wires & Cables Ltd",
    poValue: "5,40,000.00",
    invoiceNo: "INV-98255",
    invoiceValue: "5,40,000.00",
    paymentStatus: "Paid",
    gstFilingStatus: "Filed"
  },
  {
    id: "pur-5",
    prNo: "PR-2026-0902",
    requestBy: "Deepak Sharma",
    poNo: "PO-2026-1064",
    supplierName: "Havells India Enterprise",
    poValue: "1,85,000.00",
    invoiceNo: "INV-98261",
    invoiceValue: "1,85,000.00",
    paymentStatus: "Paid",
    gstFilingStatus: "Filed"
  }
];

// Purchase Supplier Line Items Dataset (Per PO / Supplier)
const purchaseSupplierItemsData = {
  "pur-1": [
    { id: "psi-1", hsnCode: "8544", description: "Optical Fiber Cable 24 Core Armoured", uom: "Mtr", qty: "1,000", rate: "85.00", gst: "15,300.00", amount: "1,00,300.00" },
    { id: "psi-2", hsnCode: "8536", description: "Schneider Electric Miniature Circuit Breaker 63A", uom: "Nos", qty: "20", rate: "1,850.00", gst: "6,660.00", amount: "43,660.00" },
    { id: "psi-3", hsnCode: "8504", description: "Terminal Blocks & DIN Rail Mounts", uom: "Set", qty: "10", rate: "511.86", gst: "921.35", amount: "6,039.95" }
  ],
  "pur-2": [
    { id: "psi-4", hsnCode: "8517", description: "D-Link 24 Port Gigabit Managed Switch", uom: "Nos", qty: "12", rate: "15,000.00", gst: "32,400.00", amount: "2,12,400.00" },
    { id: "psi-5", hsnCode: "8544", description: "Cat6 UTP Patch Cord 2 Meter", uom: "Nos", qty: "60", rate: "50.85", gst: "549.15", amount: "3,600.00" }
  ],
  "pur-3": [
    { id: "psi-6", hsnCode: "8517", description: "CommScope High Performance Antenna Mounts", uom: "Set", qty: "8", rate: "40,000.00", gst: "57,600.00", amount: "3,77,600.00" },
    { id: "psi-7", hsnCode: "7326", description: "Galvanized Clamps & Hardware", uom: "Pcs", qty: "40", rate: "50.85", gst: "366.10", amount: "2,400.00" }
  ],
  "pur-4": [
    { id: "psi-8", hsnCode: "8504", description: "Polycab 3-Phase Power Distribution Panel", uom: "Nos", qty: "2", rate: "42,000.00", gst: "15,120.00", amount: "99,120.00" },
    { id: "psi-9", hsnCode: "8544", description: "Copper Armoured Cable 4CX16 Sqmm", uom: "Mtr", qty: "1,500", rate: "250.00", gst: "67,500.00", amount: "4,42,500.00" }
  ],
  "pur-5": [
    { id: "psi-10", hsnCode: "8536", description: "Havells Industrial Switchgear & Isolator 100A", uom: "Nos", qty: "15", rate: "10,800.00", gst: "29,160.00", amount: "1,91,160.00" }
  ]
};

// Admin Salary Dataset
const adminSalaryData = [
  {
    id: "adm-sal-1",
    year: "2026",
    month: "August",
    noOfEmployee: "48",
    salaryPaid: "14,50,000.00",
    epf: "1,74,000.00",
    esi: "43,500.00",
    pt: "9,600.00",
    lwf: "1,440.00"
  },
  {
    id: "adm-sal-2",
    year: "2026",
    month: "July",
    noOfEmployee: "48",
    salaryPaid: "14,50,000.00",
    epf: "1,74,000.00",
    esi: "43,500.00",
    pt: "9,600.00",
    lwf: "1,440.00"
  },
  {
    id: "adm-sal-3",
    year: "2026",
    month: "June",
    noOfEmployee: "46",
    salaryPaid: "13,90,000.00",
    epf: "1,66,800.00",
    esi: "41,700.00",
    pt: "9,200.00",
    lwf: "1,380.00"
  },
  {
    id: "adm-sal-4",
    year: "2026",
    month: "May",
    noOfEmployee: "45",
    salaryPaid: "13,60,000.00",
    epf: "1,63,200.00",
    esi: "40,800.00",
    pt: "9,000.00",
    lwf: "1,350.00"
  },
  {
    id: "adm-sal-5",
    year: "2026",
    month: "April",
    noOfEmployee: "45",
    salaryPaid: "13,60,000.00",
    epf: "1,63,200.00",
    esi: "40,800.00",
    pt: "9,000.00",
    lwf: "1,350.00"
  }
];

// Admin Attendance Dataset
const adminAttendanceData = [
  { id: "att-1", employeeName: "Aakash Verma", days: ["P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "26", lop: "0", holidays: "4", netSalaryDays: "30" },
  { id: "att-2", employeeName: "Deepak Sharma", days: ["P","P","P","A","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "25", lop: "1", holidays: "4", netSalaryDays: "29" },
  { id: "att-3", employeeName: "Karthik Subramanian", days: ["P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "26", lop: "0", holidays: "4", netSalaryDays: "30" },
  { id: "att-4", employeeName: "Meera Nambiar", days: ["P","P","A","A","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "24", lop: "2", holidays: "4", netSalaryDays: "28" },
  { id: "att-5", employeeName: "Naveen Kumar", days: ["P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "26", lop: "0", holidays: "4", netSalaryDays: "30" },
  { id: "att-6", employeeName: "Pooja Hegde", days: ["P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "26", lop: "0", holidays: "4", netSalaryDays: "30" },
  { id: "att-7", employeeName: "Rahul Dravid", days: ["P","P","P","P","WO","P","P","P","A","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "25", lop: "1", holidays: "4", netSalaryDays: "29" },
  { id: "att-8", employeeName: "Sanjay Singhania", days: ["P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "26", lop: "0", holidays: "4", netSalaryDays: "30" },
  { id: "att-9", employeeName: "Sneha Reddy", days: ["P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "26", lop: "0", holidays: "4", netSalaryDays: "30" },
  { id: "att-10", employeeName: "Vikram Rathore", days: ["P","A","A","A","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P","P","P","P","WO","P","P"], leave: "0", total: "30", worked: "23", lop: "3", holidays: "4", netSalaryDays: "27" }
];

// Admin Salary Detail Dataset
const adminSalaryDetailData = [
  {
    id: "asd-1",
    employeeName: "Aakash Verma",
    total: "30",
    worked: "26",
    lop: "0",
    holidays: "4",
    netSalaryDays: "30",
    gross: "35,000.00",
    earned: "35,000.00",
    epf: "3,600.00",
    esiMi: "900.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "30,270.00",
    tds: "0.00",
    advance: "0.00",
    netSalary: "30,270.00"
  },
  {
    id: "asd-2",
    employeeName: "Deepak Sharma",
    total: "30",
    worked: "25",
    lop: "1",
    holidays: "4",
    netSalaryDays: "29",
    gross: "32,000.00",
    earned: "30,933.33",
    epf: "3,600.00",
    esiMi: "800.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "26,303.33",
    tds: "0.00",
    advance: "0.00",
    netSalary: "26,303.33"
  },
  {
    id: "asd-3",
    employeeName: "Karthik Subramanian",
    total: "30",
    worked: "26",
    lop: "0",
    holidays: "4",
    netSalaryDays: "30",
    gross: "45,000.00",
    earned: "45,000.00",
    epf: "3,600.00",
    esiMi: "0.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "41,170.00",
    tds: "1,500.00",
    advance: "0.00",
    netSalary: "39,670.00"
  },
  {
    id: "asd-4",
    employeeName: "Meera Nambiar",
    total: "30",
    worked: "24",
    lop: "2",
    holidays: "4",
    netSalaryDays: "28",
    gross: "28,000.00",
    earned: "26,133.33",
    epf: "3,136.00",
    esiMi: "653.33",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "22,114.00",
    tds: "0.00",
    advance: "2,000.00",
    netSalary: "20,114.00"
  },
  {
    id: "asd-5",
    employeeName: "Naveen Kumar",
    total: "30",
    worked: "26",
    lop: "0",
    holidays: "4",
    netSalaryDays: "30",
    gross: "38,000.00",
    earned: "38,000.00",
    epf: "3,600.00",
    esiMi: "950.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "33,220.00",
    tds: "500.00",
    advance: "0.00",
    netSalary: "32,720.00"
  },
  {
    id: "asd-6",
    employeeName: "Pooja Hegde",
    total: "30",
    worked: "26",
    lop: "0",
    holidays: "4",
    netSalaryDays: "30",
    gross: "30,000.00",
    earned: "30,000.00",
    epf: "3,600.00",
    esiMi: "750.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "25,420.00",
    tds: "0.00",
    advance: "0.00",
    netSalary: "25,420.00"
  },
  {
    id: "asd-7",
    employeeName: "Rahul Dravid",
    total: "30",
    worked: "25",
    lop: "1",
    holidays: "4",
    netSalaryDays: "29",
    gross: "42,000.00",
    earned: "40,600.00",
    epf: "3,600.00",
    esiMi: "0.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "36,770.00",
    tds: "1,200.00",
    advance: "0.00",
    netSalary: "35,570.00"
  },
  {
    id: "asd-8",
    employeeName: "Sanjay Singhania",
    total: "30",
    worked: "26",
    lop: "0",
    holidays: "4",
    netSalaryDays: "30",
    gross: "50,000.00",
    earned: "50,000.00",
    epf: "3,600.00",
    esiMi: "0.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "46,170.00",
    tds: "2,500.00",
    advance: "0.00",
    netSalary: "43,670.00"
  },
  {
    id: "asd-9",
    employeeName: "Sneha Reddy",
    total: "30",
    worked: "26",
    lop: "0",
    holidays: "4",
    netSalaryDays: "30",
    gross: "34,000.00",
    earned: "34,000.00",
    epf: "3,600.00",
    esiMi: "850.00",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "29,320.00",
    tds: "0.00",
    advance: "0.00",
    netSalary: "29,320.00"
  },
  {
    id: "asd-10",
    employeeName: "Vikram Rathore",
    total: "30",
    worked: "23",
    lop: "3",
    holidays: "4",
    netSalaryDays: "27",
    gross: "25,000.00",
    earned: "22,500.00",
    epf: "2,700.00",
    esiMi: "562.50",
    pt: "200.00",
    lwf: "30.00",
    taxableSalary: "19,007.50",
    tds: "0.00",
    advance: "1,500.00",
    netSalary: "17,507.50"
  }
];

// Admin EPF Dataset
const adminEpfData = [
  {
    id: "epf-1",
    uan: "100982347182",
    employeeName: "Aakash Verma",
    grossSalary: "35,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-2",
    uan: "100874561293",
    employeeName: "Deepak Sharma",
    grossSalary: "32,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-3",
    uan: "100923485612",
    employeeName: "Karthik Subramanian",
    grossSalary: "45,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-4",
    uan: "100781294356",
    employeeName: "Meera Nambiar",
    grossSalary: "28,000.00",
    epfWages: "13,066.67",
    basicDaSa: "13,066.67",
    employeeContribution: "1,568.00",
    epf: "479.00",
    eps: "1,089.00",
    edli: "65.33",
    totalAmount: "3,201.33"
  },
  {
    id: "epf-5",
    uan: "100652398412",
    employeeName: "Naveen Kumar",
    grossSalary: "38,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-6",
    uan: "100945821367",
    employeeName: "Pooja Hegde",
    grossSalary: "30,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-7",
    uan: "100812349856",
    employeeName: "Rahul Dravid",
    grossSalary: "42,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-8",
    uan: "100734561289",
    employeeName: "Sanjay Singhania",
    grossSalary: "50,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-9",
    uan: "100984523167",
    employeeName: "Sneha Reddy",
    grossSalary: "34,000.00",
    epfWages: "15,000.00",
    basicDaSa: "15,000.00",
    employeeContribution: "1,800.00",
    epf: "550.00",
    eps: "1,250.00",
    edli: "75.00",
    totalAmount: "3,675.00"
  },
  {
    id: "epf-10",
    uan: "100612948375",
    employeeName: "Vikram Rathore",
    grossSalary: "25,000.00",
    epfWages: "11,250.00",
    basicDaSa: "11,250.00",
    employeeContribution: "1,350.00",
    epf: "412.50",
    eps: "937.50",
    edli: "56.25",
    totalAmount: "2,756.25"
  }
];

// Admin ESI Dataset
const adminEsiData = [
  {
    id: "esi-1",
    ipNumber: "312456789012",
    employeeName: "Aakash Verma",
    grossSalary: "21,000.00",
    esiWages: "21,000.00",
    noOfDaysWorked: "30",
    employeeContribution: "157.50",
    employerContribution: "682.50",
    totalAmount: "840.00"
  },
  {
    id: "esi-2",
    ipNumber: "312456789013",
    employeeName: "Deepak Sharma",
    grossSalary: "19,500.00",
    esiWages: "19,500.00",
    noOfDaysWorked: "28",
    employeeContribution: "146.25",
    employerContribution: "633.75",
    totalAmount: "780.00"
  },
  {
    id: "esi-3",
    ipNumber: "312456789014",
    employeeName: "Karthik Subramanian",
    grossSalary: "20,000.00",
    esiWages: "20,000.00",
    noOfDaysWorked: "30",
    employeeContribution: "150.00",
    employerContribution: "650.00",
    totalAmount: "800.00"
  },
  {
    id: "esi-4",
    ipNumber: "312456789015",
    employeeName: "Meera Nambiar",
    grossSalary: "18,000.00",
    esiWages: "18,000.00",
    noOfDaysWorked: "27",
    employeeContribution: "135.00",
    employerContribution: "585.00",
    totalAmount: "720.00"
  },
  {
    id: "esi-5",
    ipNumber: "312456789016",
    employeeName: "Naveen Kumar",
    grossSalary: "21,000.00",
    esiWages: "21,000.00",
    noOfDaysWorked: "30",
    employeeContribution: "157.50",
    employerContribution: "682.50",
    totalAmount: "840.00"
  },
  {
    id: "esi-6",
    ipNumber: "312456789017",
    employeeName: "Pooja Hegde",
    grossSalary: "19,000.00",
    esiWages: "19,000.00",
    noOfDaysWorked: "29",
    employeeContribution: "142.50",
    employerContribution: "617.50",
    totalAmount: "760.00"
  },
  {
    id: "esi-7",
    ipNumber: "312456789018",
    employeeName: "Rahul Dravid",
    grossSalary: "20,500.00",
    esiWages: "20,500.00",
    noOfDaysWorked: "30",
    employeeContribution: "153.75",
    employerContribution: "666.25",
    totalAmount: "820.00"
  },
  {
    id: "esi-8",
    ipNumber: "312456789019",
    employeeName: "Sanjay Singhania",
    grossSalary: "21,000.00",
    esiWages: "21,000.00",
    noOfDaysWorked: "30",
    employeeContribution: "157.50",
    employerContribution: "682.50",
    totalAmount: "840.00"
  },
  {
    id: "esi-9",
    ipNumber: "312456789020",
    employeeName: "Sneha Reddy",
    grossSalary: "18,500.00",
    esiWages: "18,500.00",
    noOfDaysWorked: "26",
    employeeContribution: "138.75",
    employerContribution: "601.25",
    totalAmount: "740.00"
  },
  {
    id: "esi-10",
    ipNumber: "312456789021",
    employeeName: "Vikram Rathore",
    grossSalary: "16,000.00",
    esiWages: "16,000.00",
    noOfDaysWorked: "25",
    employeeContribution: "120.00",
    employerContribution: "520.00",
    totalAmount: "640.00"
  }
];

// Admin Professional Tax (PT) Dataset
const adminPtData = [
  {
    id: "pt-1",
    employeeId: "EMP-2026-001",
    employeeName: "Aakash Verma",
    basic: "15,000.00",
    hra: "6,000.00",
    da: "4,500.00",
    sa: "3,500.00",
    grossWages: "29,000.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-2",
    employeeId: "EMP-2026-002",
    employeeName: "Deepak Sharma",
    basic: "14,000.00",
    hra: "5,500.00",
    da: "4,000.00",
    sa: "3,000.00",
    grossWages: "26,500.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-3",
    employeeId: "EMP-2026-003",
    employeeName: "Karthik Subramanian",
    basic: "18,000.00",
    hra: "7,000.00",
    da: "5,000.00",
    sa: "4,000.00",
    grossWages: "34,000.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-4",
    employeeId: "EMP-2026-004",
    employeeName: "Meera Nambiar",
    basic: "13,066.67",
    hra: "5,000.00",
    da: "3,500.00",
    sa: "2,500.00",
    grossWages: "24,066.67",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-5",
    employeeId: "EMP-2026-005",
    employeeName: "Naveen Kumar",
    basic: "16,000.00",
    hra: "6,500.00",
    da: "4,500.00",
    sa: "3,500.00",
    grossWages: "30,500.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-6",
    employeeId: "EMP-2026-006",
    employeeName: "Pooja Hegde",
    basic: "14,000.00",
    hra: "5,500.00",
    da: "4,000.00",
    sa: "3,000.00",
    grossWages: "26,500.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-7",
    employeeId: "EMP-2026-007",
    employeeName: "Rahul Dravid",
    basic: "17,000.00",
    hra: "6,800.00",
    da: "4,800.00",
    sa: "3,800.00",
    grossWages: "32,400.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-8",
    employeeId: "EMP-2026-008",
    employeeName: "Sanjay Singhania",
    basic: "20,000.00",
    hra: "8,000.00",
    da: "6,000.00",
    sa: "5,000.00",
    grossWages: "39,000.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-9",
    employeeId: "EMP-2026-009",
    employeeName: "Sneha Reddy",
    basic: "15,000.00",
    hra: "6,000.00",
    da: "4,200.00",
    sa: "3,200.00",
    grossWages: "28,400.00",
    payable: "200.00",
    deductedAmount: "200.00"
  },
  {
    id: "pt-10",
    employeeId: "EMP-2026-010",
    employeeName: "Vikram Rathore",
    basic: "11,250.00",
    hra: "4,500.00",
    da: "3,000.00",
    sa: "2,000.00",
    grossWages: "20,750.00",
    payable: "200.00",
    deductedAmount: "200.00"
  }
];

// Admin Labour Welfare Fund (LWF) Dataset
const adminLwfData = [
  {
    id: "lwf-1",
    employeeId: "EMP-2026-001",
    employeeName: "Aakash Verma",
    designation: "Project Manager",
    grossSalary: "35,000.00",
    state: "Tamil Nadu",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-2",
    employeeId: "EMP-2026-002",
    employeeName: "Deepak Sharma",
    designation: "Site Engineer",
    grossSalary: "32,000.00",
    state: "Karnataka",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-3",
    employeeId: "EMP-2026-003",
    employeeName: "Karthik Subramanian",
    designation: "Telecom Lead",
    grossSalary: "45,000.00",
    state: "Tamil Nadu",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-4",
    employeeId: "EMP-2026-004",
    employeeName: "Meera Nambiar",
    designation: "CAD Designer",
    grossSalary: "28,000.00",
    state: "Kerala",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-5",
    employeeId: "EMP-2026-005",
    employeeName: "Naveen Kumar",
    designation: "Site Supervisor",
    grossSalary: "38,000.00",
    state: "Telangana",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-6",
    employeeId: "EMP-2026-006",
    employeeName: "Pooja Hegde",
    designation: "HR Officer",
    grossSalary: "30,000.00",
    state: "Maharashtra",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-7",
    employeeId: "EMP-2026-007",
    employeeName: "Rahul Dravid",
    designation: "Operations Manager",
    grossSalary: "42,000.00",
    state: "Karnataka",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-8",
    employeeId: "EMP-2026-008",
    employeeName: "Sanjay Singhania",
    designation: "Director",
    grossSalary: "50,000.00",
    state: "Maharashtra",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-9",
    employeeId: "EMP-2026-009",
    employeeName: "Sneha Reddy",
    designation: "Quality Analyst",
    grossSalary: "34,000.00",
    state: "Andhra Pradesh",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  },
  {
    id: "lwf-10",
    employeeId: "EMP-2026-010",
    employeeName: "Vikram Rathore",
    designation: "Field Technician",
    grossSalary: "25,000.00",
    state: "Rajasthan",
    employeeContribution: "20.00",
    employerContribution: "40.00",
    employeeShare: "20.00",
    employerShare: "40.00",
    totalAmount: "60.00"
  }
];

const accountsSalesData = [
  {
    id: "acc-s-1",
    voucherNo: "VCH-1001",
    customerName: "Indus Towers Ltd",
    invoiceNo: "INV-2026-001",
    invoiceDate: "12 - 08 - 2026",
    invoiceAmount: "12,50,000.00",
    basicAmount: "10,59,322.03",
    cgst: "95,338.98",
    sgst: "95,338.98",
    igst: "0.00",
    deduction: "25,000.00",
    tds: "25,000.00",
    dn: "0.00",
    dnDetails: "N/A",
    tredsDiscountAmount: "0.00",
    tredsProcessingFee: "0.00",
    tredsGst: "0.00",
    receivedAmount: "12,25,000.00",
    paymentRecords: [
      { date: "13-09-2026", amount: "5,00,000.00", refNo: "UTR2026091301", receiptNo: "RCP-2026-101" },
      { date: "18-09-2026", amount: "4,00,000.00", refNo: "UTR2026091802", receiptNo: "RCP-2026-102" },
      { date: "24-09-2026", amount: "3,25,000.00", refNo: "UTR2026092403", receiptNo: "RCP-2026-103" }
    ]
  },
  {
    id: "acc-s-2",
    voucherNo: "VCH-1002",
    customerName: "Bharti Airtel Ltd",
    invoiceNo: "INV-2026-002",
    invoiceDate: "15 - 08 - 2026",
    invoiceAmount: "8,20,000.00",
    basicAmount: "6,94,915.25",
    cgst: "62,542.37",
    sgst: "62,542.37",
    igst: "0.00",
    deduction: "16,400.00",
    tds: "16,400.00",
    dn: "0.00",
    dnDetails: "N/A",
    tredsDiscountAmount: "0.00",
    tredsProcessingFee: "0.00",
    tredsGst: "0.00",
    receivedAmount: "8,03,600.00",
    paymentRecords: [
      { date: "15-09-2026", amount: "4,00,000.00", refNo: "NEFT202609151", receiptNo: "RCP-2026-104" },
      { date: "22-09-2026", amount: "4,03,600.00", refNo: "NEFT202609222", receiptNo: "RCP-2026-105" }
    ]
  },
  {
    id: "acc-s-3",
    voucherNo: "VCH-1003",
    customerName: "Reliance Jio Infocomm",
    invoiceNo: "INV-2026-003",
    invoiceDate: "18 - 08 - 2026",
    invoiceAmount: "15,40,000.00",
    basicAmount: "13,05,084.75",
    cgst: "0.00",
    sgst: "0.00",
    igst: "2,34,915.25",
    deduction: "30,800.00",
    tds: "30,800.00",
    dn: "0.00",
    dnDetails: "N/A",
    tredsDiscountAmount: "0.00",
    tredsProcessingFee: "0.00",
    tredsGst: "0.00",
    receivedAmount: "15,09,200.00",
    paymentRecords: [
      { date: "20-09-2026", amount: "10,00,000.00", refNo: "RTGS202609201", receiptNo: "RCP-2026-106" },
      { date: "26-09-2026", amount: "5,09,200.00", refNo: "RTGS202609262", receiptNo: "RCP-2026-107" }
    ]
  },
  {
    id: "acc-s-4",
    voucherNo: "VCH-1004",
    customerName: "Vodafone Idea Ltd",
    invoiceNo: "INV-2026-004",
    invoiceDate: "22 - 08 - 2026",
    invoiceAmount: "6,75,000.00",
    basicAmount: "5,72,033.90",
    cgst: "51,483.05",
    sgst: "51,483.05",
    igst: "0.00",
    deduction: "13,500.00",
    tds: "10,000.00",
    dn: "2,500.00",
    dnDetails: "DN-2026-088",
    tredsDiscountAmount: "800.00",
    tredsProcessingFee: "169.49",
    tredsGst: "30.51",
    receivedAmount: "6,61,500.00",
    paymentRecords: [
      { date: "25-09-2026", amount: "3,30,750.00", refNo: "UTR2026092501", receiptNo: "RCP-2026-108" },
      { date: "28-09-2026", amount: "3,30,750.00", refNo: "UTR2026092802", receiptNo: "RCP-2026-109" }
    ]
  },
  {
    id: "acc-s-5",
    voucherNo: "VCH-1005",
    customerName: "ATC Telecom Infrastructure",
    invoiceNo: "INV-2026-005",
    invoiceDate: "25 - 08 - 2026",
    invoiceAmount: "9,80,000.00",
    basicAmount: "8,30,508.47",
    cgst: "74,745.76",
    sgst: "74,745.76",
    igst: "0.00",
    deduction: "19,600.00",
    tds: "19,600.00",
    dn: "0.00",
    dnDetails: "N/A",
    tredsDiscountAmount: "0.00",
    tredsProcessingFee: "0.00",
    tredsGst: "0.00",
    receivedAmount: "9,60,400.00",
    paymentRecords: [
      { date: "27-09-2026", amount: "5,00,000.00", refNo: "NEFT202609270", receiptNo: "RCP-2026-110" },
      { date: "30-09-2026", amount: "4,60,400.00", refNo: "NEFT202609301", receiptNo: "RCP-2026-111" }
    ]
  }
];

const accountsGstData = [
  {
    id: "gst-1",
    month: "April",
    gstr1aBasic: "15,00,000.00",
    gstr1aCgst: "1,35,000.00",
    gstr1aSgst: "1,35,000.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "12,00,000.00",
    gstr2bCgst: "1,08,000.00",
    gstr2bSgst: "1,08,000.00",
    gstr2bIgst: "0.00",
    rcmBasic: "50,000.00",
    rcmCgst: "4,500.00",
    rcmSgst: "4,500.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-2",
    month: "May",
    gstr1aBasic: "18,50,000.00",
    gstr1aCgst: "1,66,500.00",
    gstr1aSgst: "1,66,500.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "14,20,000.00",
    gstr2bCgst: "1,27,800.00",
    gstr2bSgst: "1,27,800.00",
    gstr2bIgst: "0.00",
    rcmBasic: "65,000.00",
    rcmCgst: "5,850.00",
    rcmSgst: "5,850.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-3",
    month: "June",
    gstr1aBasic: "22,00,000.00",
    gstr1aCgst: "1,98,000.00",
    gstr1aSgst: "1,98,000.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "16,80,000.00",
    gstr2bCgst: "1,51,200.00",
    gstr2bSgst: "1,51,200.00",
    gstr2bIgst: "0.00",
    rcmBasic: "45,000.00",
    rcmCgst: "4,050.00",
    rcmSgst: "4,050.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-4",
    month: "July",
    gstr1aBasic: "19,80,000.00",
    gstr1aCgst: "1,78,200.00",
    gstr1aSgst: "1,78,200.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "15,50,000.00",
    gstr2bCgst: "1,39,500.00",
    gstr2bSgst: "1,39,500.00",
    gstr2bIgst: "0.00",
    rcmBasic: "55,000.00",
    rcmCgst: "4,950.00",
    rcmSgst: "4,950.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-5",
    month: "August",
    gstr1aBasic: "25,40,000.00",
    gstr1aCgst: "2,28,600.00",
    gstr1aSgst: "2,28,600.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "20,10,000.00",
    gstr2bCgst: "1,80,900.00",
    gstr2bSgst: "1,80,900.00",
    gstr2bIgst: "0.00",
    rcmBasic: "70,000.00",
    rcmCgst: "6,300.00",
    rcmSgst: "6,300.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-6",
    month: "September",
    gstr1aBasic: "21,00,000.00",
    gstr1aCgst: "1,89,000.00",
    gstr1aSgst: "1,89,000.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "17,30,000.00",
    gstr2bCgst: "1,55,700.00",
    gstr2bSgst: "1,55,700.00",
    gstr2bIgst: "0.00",
    rcmBasic: "40,000.00",
    rcmCgst: "3,600.00",
    rcmSgst: "3,600.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-7",
    month: "October",
    gstr1aBasic: "24,50,000.00",
    gstr1aCgst: "2,20,500.00",
    gstr1aSgst: "2,20,500.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "19,00,000.00",
    gstr2bCgst: "1,71,000.00",
    gstr2bSgst: "1,71,000.00",
    gstr2bIgst: "0.00",
    rcmBasic: "60,000.00",
    rcmCgst: "5,400.00",
    rcmSgst: "5,400.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-8",
    month: "November",
    gstr1aBasic: "20,20,000.00",
    gstr1aCgst: "1,81,800.00",
    gstr1aSgst: "1,81,800.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "16,40,000.00",
    gstr2bCgst: "1,47,600.00",
    gstr2bSgst: "1,47,600.00",
    gstr2bIgst: "0.00",
    rcmBasic: "48,000.00",
    rcmCgst: "4,320.00",
    rcmSgst: "4,320.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-9",
    month: "December",
    gstr1aBasic: "27,00,000.00",
    gstr1aCgst: "2,43,000.00",
    gstr1aSgst: "2,43,000.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "21,50,000.00",
    gstr2bCgst: "1,93,500.00",
    gstr2bSgst: "1,93,500.00",
    gstr2bIgst: "0.00",
    rcmBasic: "75,000.00",
    rcmCgst: "6,750.00",
    rcmSgst: "6,750.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-10",
    month: "January",
    gstr1aBasic: "23,10,000.00",
    gstr1aCgst: "2,07,900.00",
    gstr1aSgst: "2,07,900.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "18,20,000.00",
    gstr2bCgst: "1,63,800.00",
    gstr2bSgst: "1,63,800.00",
    gstr2bIgst: "0.00",
    rcmBasic: "52,000.00",
    rcmCgst: "4,680.00",
    rcmSgst: "4,680.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-11",
    month: "February",
    gstr1aBasic: "21,80,000.00",
    gstr1aCgst: "1,96,200.00",
    gstr1aSgst: "1,96,200.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "17,60,000.00",
    gstr2bCgst: "1,58,400.00",
    gstr2bSgst: "1,58,400.00",
    gstr2bIgst: "0.00",
    rcmBasic: "46,000.00",
    rcmCgst: "4,140.00",
    rcmSgst: "4,140.00",
    rcmIgst: "0.00"
  },
  {
    id: "gst-12",
    month: "March",
    gstr1aBasic: "30,00,000.00",
    gstr1aCgst: "2,70,000.00",
    gstr1aSgst: "2,70,000.00",
    gstr1aIgst: "0.00",
    gstr2bBasic: "24,00,000.00",
    gstr2bCgst: "2,16,000.00",
    gstr2bSgst: "2,16,000.00",
    gstr2bIgst: "0.00",
    rcmBasic: "80,000.00",
    rcmCgst: "7,200.00",
    rcmSgst: "7,200.00",
    rcmIgst: "0.00"
  }
];

const accountsBankData = [
  {
    id: "bank-1",
    date: "12 - 08 - 2026",
    bankName: "HDFC Bank - 50200012345",
    particulars: "Payment received from Indus Towers Ltd",
    refNo: "NEFT/2608123456",
    withdrawal: "0.00",
    deposit: "12,25,000.00",
    balance: "25,40,000.00"
  },
  {
    id: "bank-2",
    date: "14 - 08 - 2026",
    bankName: "HDFC Bank - 50200012345",
    particulars: "Vendor Payment - Steel Infra Supplies",
    refNo: "RTGS/2608789012",
    withdrawal: "3,50,000.00",
    deposit: "0.00",
    balance: "21,90,000.00"
  },
  {
    id: "bank-3",
    date: "16 - 08 - 2026",
    bankName: "ICICI Bank - 00040501234",
    particulars: "Payment received from Bharti Airtel Ltd",
    refNo: "NEFT/2608345678",
    withdrawal: "0.00",
    deposit: "8,03,600.00",
    balance: "29,93,600.00"
  },
  {
    id: "bank-4",
    date: "18 - 08 - 2026",
    bankName: "HDFC Bank - 50200012345",
    particulars: "Electricity Bill Payment - Site Operations",
    refNo: "UPI/623456789012",
    withdrawal: "45,000.00",
    deposit: "0.00",
    balance: "29,48,600.00"
  },
  {
    id: "bank-5",
    date: "20 - 08 - 2026",
    bankName: "State Bank of India - 300123456",
    particulars: "Payment received from Reliance Jio Infocomm",
    refNo: "RTGS/2608901234",
    withdrawal: "0.00",
    deposit: "15,09,200.00",
    balance: "44,57,800.00"
  },
  {
    id: "bank-6",
    date: "22 - 08 - 2026",
    bankName: "State Bank of India - 300123456",
    particulars: "Office Rent Payment - Chennai Hub",
    refNo: "CHQ/002341",
    withdrawal: "85,000.00",
    deposit: "0.00",
    balance: "43,72,800.00"
  }
];

const accountsReceiptData = [
  {
    id: "rec-1",
    receiptNo: "REC-2026-001",
    date: "12 - 08 - 2026",
    customerName: "Indus Towers Ltd",
    receivedBank: "HDFC Bank - 50200012345",
    amount: "12,25,000.00",
    particulars: "Payment towards Invoice INV-2026-001",
    paymentRefNo: "NEFT/2608123456"
  },
  {
    id: "rec-2",
    receiptNo: "REC-2026-002",
    date: "15 - 08 - 2026",
    customerName: "Bharti Airtel Ltd",
    receivedBank: "ICICI Bank - 00040501234",
    amount: "8,03,600.00",
    particulars: "Payment towards Invoice INV-2026-002",
    paymentRefNo: "NEFT/2608345678"
  },
  {
    id: "rec-3",
    receiptNo: "REC-2026-003",
    date: "18 - 08 - 2026",
    customerName: "Reliance Jio Infocomm",
    receivedBank: "State Bank of India - 300123456",
    amount: "15,09,200.00",
    particulars: "Payment towards Invoice INV-2026-003",
    paymentRefNo: "RTGS/2608901234"
  },
  {
    id: "rec-4",
    receiptNo: "REC-2026-004",
    date: "20 - 08 - 2026",
    customerName: "Vodafone Idea Ltd",
    receivedBank: "HDFC Bank - 50200012345",
    amount: "6,61,500.00",
    particulars: "Payment towards Invoice INV-2026-004",
    paymentRefNo: "UPI/623456789012"
  },
  {
    id: "rec-5",
    receiptNo: "REC-2026-005",
    date: "25 - 08 - 2026",
    customerName: "ATC Telecom Infrastructure",
    receivedBank: "State Bank of India - 300123456",
    amount: "9,60,400.00",
    particulars: "Payment towards Invoice INV-2026-005",
    paymentRefNo: "RTGS/2608789012"
  }
];

const accountsPaymentData = [
  {
    id: "acc-pay-1",
    transferredTo: "Schneider Electric India Pvt Ltd",
    requestNo: "REQ-2026-101",
    invoiceNo: "INV-2026-8812",
    expenseHead: "Supply of Electrical Components",
    transferredFrom: "HDFC Bank - 50200012345",
    requested: "12,50,000.00",
    approved: "12,00,000.00",
    transferred: "10,00,000.00",
    payable: "2,00,000.00",
    bankDetails: {
      accountName: "Schneider Electric India Pvt Ltd",
      accountNumber: "50200012345678",
      ifscCode: "HDFC0000123",
      bankName: "HDFC Bank"
    },
    paymentDetailsList: [
      {
        paymentDate: "12-08-2026",
        amount: "6,00,000.00",
        paymentRefNo: "NEFT/2608123456",
        receiptNumber: "REC-2026-001"
      },
      {
        paymentDate: "18-08-2026",
        amount: "4,00,000.00",
        paymentRefNo: "RTGS/2608901234",
        receiptNumber: "REC-2026-003"
      }
    ],
    items: [
      {
        requestDate: "10-08-2026",
        requestBy: "Rajesh Kumar",
        expenseCategory: "Electrical Equipment",
        expenseName: "33KV Transformer Unit",
        uom: "Nos",
        qty: "2",
        rate: "4,00,000.00",
        gst: "18%",
        amount: "9,44,000.00"
      },
      {
        requestDate: "11-08-2026",
        requestBy: "Rajesh Kumar",
        expenseCategory: "Electrical Cables",
        expenseName: "Armoured Power Cable 240sqmm",
        uom: "Mtr",
        qty: "500",
        rate: "434.00",
        gst: "18%",
        amount: "2,56,000.00"
      }
    ]
  },
  {
    id: "acc-pay-2",
    transferredTo: "Larsen & Toubro Ltd",
    requestNo: "REQ-2026-102",
    invoiceNo: "INV-2026-7734",
    expenseHead: "Civil Site Construction Services",
    transferredFrom: "State Bank of India - 300123456",
    requested: "8,20,000.00",
    approved: "8,00,000.00",
    transferred: "6,50,000.00",
    payable: "1,50,000.00",
    bankDetails: {
      accountName: "Larsen & Toubro Ltd",
      accountNumber: "30012345678901",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India"
    },
    paymentDetailsList: [
      {
        paymentDate: "14-08-2026",
        amount: "3,50,000.00",
        paymentRefNo: "NEFT/2608456789",
        receiptNumber: "REC-2026-012"
      },
      {
        paymentDate: "20-08-2026",
        amount: "3,00,000.00",
        paymentRefNo: "RTGS/2608567890",
        receiptNumber: "REC-2026-015"
      }
    ],
    items: [
      {
        requestDate: "12-08-2026",
        requestBy: "Suresh Raina",
        expenseCategory: "Civil Construction",
        expenseName: "Foundation Concrete Pouring",
        uom: "Cu.M",
        qty: "120",
        rate: "5,650.00",
        gst: "18%",
        amount: "8,00,000.00"
      }
    ]
  },
  {
    id: "acc-pay-3",
    transferredTo: "Indus Towers Ltd",
    requestNo: "REQ-2026-103",
    invoiceNo: "INV-2026-5512",
    expenseHead: "Project Capex Telecom Infra",
    transferredFrom: "ICICI Bank - 00040501234",
    requested: "15,00,000.00",
    approved: "14,50,000.00",
    transferred: "14,50,000.00",
    payable: "0.00",
    bankDetails: {
      accountName: "Indus Towers Ltd",
      accountNumber: "00040501234567",
      ifscCode: "ICIC0000004",
      bankName: "ICICI Bank"
    },
    paymentDetailsList: [
      {
        paymentDate: "15-08-2026",
        amount: "8,50,000.00",
        paymentRefNo: "RTGS/2608678901",
        receiptNumber: "REC-2026-021"
      },
      {
        paymentDate: "22-08-2026",
        amount: "6,00,000.00",
        paymentRefNo: "NEFT/2608789012",
        receiptNumber: "REC-2026-024"
      }
    ],
    items: [
      {
        requestDate: "14-08-2026",
        requestBy: "Anil Sharma",
        expenseCategory: "Tower Infrastructure",
        expenseName: "Galvanized Lattice Mast 30M",
        uom: "Nos",
        qty: "3",
        rate: "4,10,000.00",
        gst: "18%",
        amount: "14,50,000.00"
      }
    ]
  },
  {
    id: "acc-pay-4",
    transferredTo: "Vijay Transport Logistics",
    requestNo: "REQ-2026-104",
    invoiceNo: "INV-2026-3390",
    expenseHead: "Material Logistics & Freight",
    transferredFrom: "HDFC Bank - 50200012345",
    requested: "4,50,000.00",
    approved: "4,20,000.00",
    transferred: "3,80,000.00",
    payable: "40,000.00",
    bankDetails: {
      accountName: "Vijay Transport Logistics",
      accountNumber: "50200098765432",
      ifscCode: "HDFC0000123",
      bankName: "HDFC Bank"
    },
    paymentDetailsList: [
      {
        paymentDate: "17-08-2026",
        amount: "3,80,000.00",
        paymentRefNo: "UPI/623456789012",
        receiptNumber: "REC-2026-031"
      }
    ],
    items: [
      {
        requestDate: "16-08-2026",
        requestBy: "Karthik Raja",
        expenseCategory: "Logistics & Freight",
        expenseName: "Heavy Equipment Transport",
        uom: "Trips",
        qty: "4",
        rate: "89,000.00",
        gst: "18%",
        amount: "4,20,000.00"
      }
    ]
  },
  {
    id: "acc-pay-5",
    transferredTo: "Tata Communications Ltd",
    requestNo: "REQ-2026-105",
    invoiceNo: "INV-2026-2219",
    expenseHead: "Fiber Optic Line Maintenance",
    transferredFrom: "State Bank of India - 300123456",
    requested: "9,80,000.00",
    approved: "9,50,000.00",
    transferred: "7,00,000.00",
    payable: "2,50,000.00",
    bankDetails: {
      accountName: "Tata Communications Ltd",
      accountNumber: "30012398765432",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India"
    },
    paymentDetailsList: [
      {
        paymentDate: "19-08-2026",
        amount: "4,00,000.00",
        paymentRefNo: "NEFT/2608890123",
        receiptNumber: "REC-2026-041"
      },
      {
        paymentDate: "25-08-2026",
        amount: "3,00,000.00",
        paymentRefNo: "RTGS/2608901234",
        receiptNumber: "REC-2026-045"
      }
    ],
    items: [
      {
        requestDate: "18-08-2026",
        requestBy: "Manoj Verma",
        expenseCategory: "Fiber Optics",
        expenseName: "Optical Ground Wire & Splicing",
        uom: "Km",
        qty: "15",
        rate: "53,672.00",
        gst: "18%",
        amount: "9,50,000.00"
      }
    ]
  }
];

const accountsPurchaseData = [
  {
    id: "acc-pur-1",
    voucherNo: "PUR-2026-001",
    voucherDate: "10 - 08 - 2026",
    vendorName: "Schneider Electric India Pvt Ltd",
    invoiceNo: "INV-2026-8812",
    invoiceDate: "08 - 08 - 2026",
    invoiceAmount: "12,50,000.00",
    paidAmount: "10,00,000.00",
    payableAmount: "2,50,000.00",
    basicAmount: "10,59,322.03",
    cgst: "95,338.98",
    sgst: "95,338.98",
    igst: "0.00",
    payments: [
      { paymentDate: "13-09-2026", amount: "5,00,000.00", paymentRefNo: "", receiptNumber: "" },
      { paymentDate: "13-09-2026", amount: "3,00,000.00", paymentRefNo: "", receiptNumber: "" },
      { paymentDate: "13-09-2026", amount: "2,00,000.00", paymentRefNo: "", receiptNumber: "" }
    ]
  },
  {
    id: "acc-pur-2",
    voucherNo: "PUR-2026-002",
    voucherDate: "14 - 08 - 2026",
    vendorName: "Larsen & Toubro Ltd",
    invoiceNo: "INV-2026-9041",
    invoiceDate: "12 - 08 - 2026",
    invoiceAmount: "8,20,000.00",
    paidAmount: "6,50,000.00",
    payableAmount: "1,70,000.00",
    basicAmount: "6,94,915.25",
    cgst: "62,542.37",
    sgst: "62,542.37",
    igst: "0.00",
    payments: [
      { paymentDate: "13-09-2026", amount: "4,00,000.00", paymentRefNo: "", receiptNumber: "" },
      { paymentDate: "13-09-2026", amount: "2,50,000.00", paymentRefNo: "", receiptNumber: "" }
    ]
  },
  {
    id: "acc-pur-3",
    voucherNo: "PUR-2026-003",
    voucherDate: "18 - 08 - 2026",
    vendorName: "Vijay Transport Logistics",
    invoiceNo: "INV-2026-9215",
    invoiceDate: "16 - 08 - 2026",
    invoiceAmount: "4,50,000.00",
    paidAmount: "3,80,000.00",
    payableAmount: "70,000.00",
    basicAmount: "3,81,355.93",
    cgst: "34,322.03",
    sgst: "34,322.03",
    igst: "0.00",
    payments: [
      { paymentDate: "13-09-2026", amount: "3,80,000.00", paymentRefNo: "", receiptNumber: "" }
    ]
  },
  {
    id: "acc-pur-4",
    voucherNo: "PUR-2026-004",
    voucherDate: "21 - 08 - 2026",
    vendorName: "Tata Communications Ltd",
    invoiceNo: "INV-2026-9530",
    invoiceDate: "19 - 08 - 2026",
    invoiceAmount: "9,80,000.00",
    paidAmount: "7,00,000.00",
    payableAmount: "2,80,000.00",
    basicAmount: "8,30,508.47",
    cgst: "74,745.76",
    sgst: "74,745.76",
    igst: "0.00",
    payments: [
      { paymentDate: "13-09-2026", amount: "7,00,000.00", paymentRefNo: "", receiptNumber: "" }
    ]
  },
  {
    id: "acc-pur-5",
    voucherNo: "PUR-2026-005",
    voucherDate: "25 - 08 - 2026",
    vendorName: "Steel Infra Supplies Ltd",
    invoiceNo: "INV-2026-9764",
    invoiceDate: "23 - 08 - 2026",
    invoiceAmount: "15,00,000.00",
    paidAmount: "15,00,000.00",
    payableAmount: "0.00",
    basicAmount: "12,71,186.44",
    cgst: "0.00",
    sgst: "0.00",
    igst: "2,28,813.56",
    payments: [
      { paymentDate: "13-09-2026", amount: "5,00,000.00", paymentRefNo: "", receiptNumber: "" },
      { paymentDate: "13-09-2026", amount: "5,00,000.00", paymentRefNo: "", receiptNumber: "" },
      { paymentDate: "13-09-2026", amount: "5,00,000.00", paymentRefNo: "", receiptNumber: "" }
    ]
  }
];

let currentTdsBottomTab = 'receivable'; // 'payable' or 'receivable'

const accountsTdsData = [
  {
    id: "tds-q1-2026",
    year: "2026",
    quarter: "Q1",
    tdsReceivable: "9,78,000.00",
    tdsCreditAvailable: "8,50,000.00",
    months: [
      {
        id: "acc-tds-1",
        year: "2026",
        quarter: "Q1",
        month: "April",
        taxableAmountReceivable: "22,80,000.00",
        tdsAmountReceivable: "2,28,000.00",
        taxableAmountPayable: "15,40,000.00",
        deductedAmount: "1,54,000.00",
        paidAmount: "1,54,000.00",
        items: [
          {
            tdsType: "Collected",
            tdsCode: "94C - Contractor (10%)",
            panNumber: "AAACB1234D",
            panName: "Schneider Electric India Pvt Ltd",
            taxable: "6,50,000.00",
            tds: "65,000.00",
            details: [
              { paymentDate: "12-04-2026", tdsType: "Collected", panNumber: "AAACB1234D", panName: "Schneider Electric India Pvt Ltd", invoiceNumber: "INV-2026-8812", invoiceDate: "08-04-2026", taxableAmount: "3,50,000.00", tdsCode: "10%", taxAmount: "35,000.00" },
              { paymentDate: "24-04-2026", tdsType: "Collected", panNumber: "AAACB1234D", panName: "Schneider Electric India Pvt Ltd", invoiceNumber: "INV-2026-8845", invoiceDate: "20-04-2026", taxableAmount: "3,00,000.00", tdsCode: "10%", taxAmount: "30,000.00" }
            ]
          },
          {
            tdsType: "Debited",
            tdsCode: "94J - Professional (10%)",
            panNumber: "BBBCB5678E",
            panName: "Larsen & Toubro Ltd",
            taxable: "4,20,000.00",
            tds: "42,000.00",
            details: [
              { paymentDate: "15-04-2026", tdsType: "Debited", panNumber: "BBBCB5678E", panName: "Larsen & Toubro Ltd", invoiceNumber: "INV-2026-9041", invoiceDate: "11-04-2026", taxableAmount: "4,20,000.00", tdsCode: "10%", taxAmount: "42,000.00" }
            ]
          },
          {
            tdsType: "Collected",
            tdsCode: "94I - Plant & Machinery (10%)",
            panNumber: "CCCCD9012F",
            panName: "Indus Towers Ltd",
            taxable: "3,10,000.00",
            tds: "31,000.00",
            details: [
              { paymentDate: "18-04-2026", tdsType: "Collected", panNumber: "CCCCD9012F", panName: "Indus Towers Ltd", invoiceNumber: "INV-2026-9210", invoiceDate: "14-04-2026", taxableAmount: "3,10,000.00", tdsCode: "10%", taxAmount: "31,000.00" }
            ]
          },
          {
            tdsType: "Debited",
            tdsCode: "94Q - Purchase of Goods (10%)",
            panNumber: "DDDDD3456G",
            panName: "Vijay Transport Logistics",
            taxable: "1,60,000.00",
            tds: "16,000.00",
            details: [
              { paymentDate: "28-04-2026", tdsType: "Debited", panNumber: "DDDDD3456G", panName: "Vijay Transport Logistics", invoiceNumber: "INV-2026-9502", invoiceDate: "25-04-2026", taxableAmount: "1,60,000.00", tdsCode: "10%", taxAmount: "16,000.00" }
            ]
          }
        ]
      },
      {
        id: "acc-tds-2",
        year: "2026",
        quarter: "Q1",
        month: "May",
        taxableAmountReceivable: "25,50,000.00",
        tdsAmountReceivable: "2,55,000.00",
        taxableAmountPayable: "18,20,000.00",
        deductedAmount: "1,82,000.00",
        paidAmount: "1,82,000.00",
        items: [
          {
            tdsType: "Collected",
            tdsCode: "94C - Contractor (10%)",
            panNumber: "AAACB1234D",
            panName: "Schneider Electric India Pvt Ltd",
            taxable: "7,80,000.00",
            tds: "78,000.00",
            details: [
              { paymentDate: "10-05-2026", tdsType: "Collected", panNumber: "AAACB1234D", panName: "Schneider Electric India Pvt Ltd", invoiceNumber: "INV-2026-9601", invoiceDate: "05-05-2026", taxableAmount: "7,80,000.00", tdsCode: "10%", taxAmount: "78,000.00" }
            ]
          },
          {
            tdsType: "Debited",
            tdsCode: "94J - Professional (10%)",
            panNumber: "BBBCB5678E",
            panName: "Larsen & Toubro Ltd",
            taxable: "5,40,000.00",
            tds: "54,000.00",
            details: [
              { paymentDate: "16-05-2026", tdsType: "Debited", panNumber: "BBBCB5678E", panName: "Larsen & Toubro Ltd", invoiceNumber: "INV-2026-9720", invoiceDate: "12-05-2026", taxableAmount: "5,40,000.00", tdsCode: "10%", taxAmount: "54,000.00" }
            ]
          },
          {
            tdsType: "Collected",
            tdsCode: "94I - Plant & Machinery (10%)",
            panNumber: "EEEEF7890H",
            panName: "Tata Communications Ltd",
            taxable: "5,00,000.00",
            tds: "50,000.00",
            details: [
              { paymentDate: "22-05-2026", tdsType: "Collected", panNumber: "EEEEF7890H", panName: "Tata Communications Ltd", invoiceNumber: "INV-2026-9811", invoiceDate: "19-05-2026", taxableAmount: "5,00,000.00", tdsCode: "10%", taxAmount: "50,000.00" }
            ]
          }
        ]
      },
      {
        id: "acc-tds-3",
        year: "2026",
        quarter: "Q1",
        month: "June",
        taxableAmountReceivable: "19,40,000.00",
        tdsAmountReceivable: "1,94,000.00",
        taxableAmountPayable: "12,90,000.00",
        deductedAmount: "1,29,000.00",
        paidAmount: "1,29,000.00",
        items: [
          {
            tdsType: "Collected",
            tdsCode: "94C - Contractor (10%)",
            panNumber: "AAACB1234D",
            panName: "Schneider Electric India Pvt Ltd",
            taxable: "5,20,000.00",
            tds: "52,000.00",
            details: [
              { paymentDate: "12-06-2026", tdsType: "Collected", panNumber: "AAACB1234D", panName: "Schneider Electric India Pvt Ltd", invoiceNumber: "INV-2026-9901", invoiceDate: "08-06-2026", taxableAmount: "5,20,000.00", tdsCode: "10%", taxAmount: "52,000.00" }
            ]
          },
          {
            tdsType: "Debited",
            tdsCode: "94J - Professional (10%)",
            panNumber: "BBBCB5678E",
            panName: "Larsen & Toubro Ltd",
            taxable: "4,10,000.00",
            tds: "41,000.00",
            details: [
              { paymentDate: "19-06-2026", tdsType: "Debited", panNumber: "BBBCB5678E", panName: "Larsen & Toubro Ltd", invoiceNumber: "INV-2026-9945", invoiceDate: "15-06-2026", taxableAmount: "4,10,000.00", tdsCode: "10%", taxAmount: "41,000.00" }
            ]
          },
          {
            tdsType: "Collected",
            tdsCode: "94Q - Purchase of Goods (10%)",
            panNumber: "DDDDD3456G",
            panName: "Vijay Transport Logistics",
            taxable: "3,60,000.00",
            tds: "36,000.00",
            details: [
              { paymentDate: "26-06-2026", tdsType: "Collected", panNumber: "DDDDD3456G", panName: "Vijay Transport Logistics", invoiceNumber: "INV-2026-9988", invoiceDate: "22-06-2026", taxableAmount: "3,60,000.00", tdsCode: "10%", taxAmount: "36,000.00" }
            ]
          }
        ]
      },
      {
        id: "acc-tds-4",
        year: "2026",
        quarter: "Q1",
        month: "July",
        taxableAmountReceivable: "30,10,000.00",
        tdsAmountReceivable: "3,01,000.00",
        taxableAmountPayable: "21,60,000.00",
        deductedAmount: "2,16,000.00",
        paidAmount: "2,16,000.00",
        items: [
          {
            tdsType: "Collected",
            tdsCode: "94C - Contractor (10%)",
            panNumber: "AAACB1234D",
            panName: "Schneider Electric India Pvt Ltd",
            taxable: "9,50,000.00",
            tds: "95,000.00",
            details: [
              { paymentDate: "11-07-2026", tdsType: "Collected", panNumber: "AAACB1234D", panName: "Schneider Electric India Pvt Ltd", invoiceNumber: "INV-2026-1011", invoiceDate: "07-07-2026", taxableAmount: "9,50,000.00", tdsCode: "10%", taxAmount: "95,000.00" }
            ]
          },
          {
            tdsType: "Debited",
            tdsCode: "94J - Professional (10%)",
            panNumber: "BBBCB5678E",
            panName: "Larsen & Toubro Ltd",
            taxable: "6,80,000.00",
            tds: "68,000.00",
            details: [
              { paymentDate: "17-07-2026", tdsType: "Debited", panNumber: "BBBCB5678E", panName: "Larsen & Toubro Ltd", invoiceNumber: "INV-2026-1025", invoiceDate: "13-07-2026", taxableAmount: "6,80,000.00", tdsCode: "10%", taxAmount: "68,000.00" }
            ]
          },
          {
            tdsType: "Collected",
            tdsCode: "94I - Plant & Machinery (10%)",
            panNumber: "CCCCD9012F",
            panName: "Indus Towers Ltd",
            taxable: "5,30,000.00",
            tds: "53,000.00",
            details: [
              { paymentDate: "24-07-2026", tdsType: "Collected", panNumber: "CCCCD9012F", panName: "Indus Towers Ltd", invoiceNumber: "INV-2026-1050", invoiceDate: "20-07-2026", taxableAmount: "5,30,000.00", tdsCode: "10%", taxAmount: "53,000.00" }
            ]
          }
        ]
      }
    ]
  }
];

const accountsTdsPayableData = [
  {
    id: "tds-pay-1",
    year: "2026",
    quarter: "Q1",
    panName: "Schneider Electric India Pvt Ltd",
    panNumber: "AAACB1234D",
    tdsCode: "94C - Payment to Contractors and Sub-contractors (10%)",
    taxableAmount: "6,50,000.00",
    tdsRate: "10%",
    deductedAmount: "65,000.00",
    paidAmount: "65,000.00"
  },
  {
    id: "tds-pay-2",
    year: "2026",
    quarter: "Q1",
    panName: "Larsen & Toubro Ltd",
    panNumber: "BBBCB5678E",
    tdsCode: "94J - Fees for Professional or Technical Services (10%)",
    taxableAmount: "4,20,000.00",
    tdsRate: "10%",
    deductedAmount: "42,000.00",
    paidAmount: "42,000.00"
  },
  {
    id: "tds-pay-3",
    year: "2026",
    quarter: "Q1",
    panName: "Indus Towers Ltd",
    panNumber: "CCCCD9012F",
    tdsCode: "94I - Rent for Plant, Machinery or Equipment (10%)",
    taxableAmount: "3,10,000.00",
    tdsRate: "10%",
    deductedAmount: "31,000.00",
    paidAmount: "31,000.00"
  },
  {
    id: "tds-pay-4",
    year: "2026",
    quarter: "Q1",
    panName: "Vijay Transport Logistics",
    panNumber: "DDDDD3456G",
    tdsCode: "94Q - Purchase of Goods exceeding 50 Lakhs (10%)",
    taxableAmount: "1,60,000.00",
    tdsRate: "10%",
    deductedAmount: "16,000.00",
    paidAmount: "16,000.00"
  },
  {
    id: "tds-pay-5",
    year: "2026",
    quarter: "Q1",
    panName: "Tata Communications Ltd",
    panNumber: "EEEEF7890H",
    tdsCode: "94J - Fees for Professional or Technical Services (10%)",
    taxableAmount: "5,00,000.00",
    tdsRate: "10%",
    deductedAmount: "50,000.00",
    paidAmount: "50,000.00"
  },
  {
    id: "tds-pay-6",
    year: "2026",
    quarter: "Q1",
    panName: "ABB India Ltd",
    panNumber: "FFFFG1234I",
    tdsCode: "94C - Payment to Contractors and Sub-contractors (10%)",
    taxableAmount: "3,80,000.00",
    tdsRate: "10%",
    deductedAmount: "38,000.00",
    paidAmount: "38,000.00"
  },
  {
    id: "tds-pay-7",
    year: "2026",
    quarter: "Q1",
    panName: "Siemens Healthcare Pvt Ltd",
    panNumber: "GGGGH5678J",
    tdsCode: "94I - Rent for Land, Building or Furniture (10%)",
    taxableAmount: "2,40,000.00",
    tdsRate: "10%",
    deductedAmount: "24,000.00",
    paidAmount: "24,000.00"
  }
];

const accountsTdsReceivableData = [
  {
    id: "tds-rec-1",
    paymentDate: "12-04-2026",
    panName: "Reliance Jio Infocomm Ltd",
    panNumber: "AAACR1234K",
    tdsCode: "194C - Payment to Contractors and Sub-contractors (2%)",
    taxableAmount: "12,50,000.00",
    tdsRate: "2%",
    tdsAmount: "25,000.00"
  },
  {
    id: "tds-rec-2",
    paymentDate: "18-04-2026",
    panName: "Bharti Airtel Ltd",
    panNumber: "BBBCB5678L",
    tdsCode: "194J - Fees for Professional or Technical Services (10%)",
    taxableAmount: "8,20,000.00",
    tdsRate: "10%",
    tdsAmount: "82,000.00"
  },
  {
    id: "tds-rec-3",
    paymentDate: "24-04-2026",
    panName: "Vodafone Idea Ltd",
    panNumber: "CCCCD9012M",
    tdsCode: "194I - Rent for Plant, Machinery or Equipment (2%)",
    taxableAmount: "5,40,000.00",
    tdsRate: "2%",
    tdsAmount: "10,800.00"
  },
  {
    id: "tds-rec-4",
    paymentDate: "05-05-2026",
    panName: "Sterlite Technologies Ltd",
    panNumber: "DDDDD3456N",
    tdsCode: "194Q - Purchase of Goods exceeding 50 Lakhs (0.1%)",
    taxableAmount: "15,00,000.00",
    tdsRate: "0.1%",
    tdsAmount: "1,500.00"
  },
  {
    id: "tds-rec-5",
    paymentDate: "14-05-2026",
    panName: "Indus Towers Ltd",
    panNumber: "EEEEF7890P",
    tdsCode: "194C - Payment to Contractors and Sub-contractors (2%)",
    taxableAmount: "9,60,000.00",
    tdsRate: "2%",
    tdsAmount: "19,200.00"
  },
  {
    id: "tds-rec-6",
    paymentDate: "22-05-2026",
    panName: "Tata Communications Ltd",
    panNumber: "FFFFG1234Q",
    tdsCode: "194J - Fees for Professional or Technical Services (10%)",
    taxableAmount: "7,80,000.00",
    tdsRate: "10%",
    tdsAmount: "78,000.00"
  },
  {
    id: "tds-rec-7",
    paymentDate: "08-06-2026",
    panName: "Schneider Electric India Pvt Ltd",
    panNumber: "GGGGH5678R",
    tdsCode: "194I - Rent for Land, Building or Furniture (10%)",
    taxableAmount: "4,50,000.00",
    tdsRate: "10%",
    tdsAmount: "45,000.00"
  }
];

// ==========================================================================
// STATE MANAGEMENT (Default landing page: Worklist -> Payment)
// ==========================================================================
let currentModule = 'worklist'; // 'worklist' as default on login, or 'master', 'projects', 'inventory', 'purchase', 'accounts', 'admin'
let currentAccountsView = 'main'; // 'main', 'gst', 'bank', 'receipt', 'payment', 'purchase', or 'tds'
let currentAccountsSubpage = 'sales'; // 'sales', 'purchase', 'payment', 'receipt', 'bank', 'tds', 'gst'
let currentAdminView = 'salary'; // 'salary', 'attendance', 'salary_detail', 'epf', 'esi', 'pt', or 'lwf'
let selectedAdminMonth = 'April';
let selectedAdminYear = '2026';
let currentPurchaseView = 'main'; // 'main' or 'supplier_detail'
let selectedPurchaseSupplierId = 'pur-1';
let selectedPurchaseSupplierName = 'Schneider Electric India Pvt Ltd';
let selectedPurchasePoNo = 'PO-2026-1042';
let currentWorklistView = 'payment'; // 'payment' or 'po'
let currentMasterSubpage = 'employee'; // 'employee', 'customer', 'vendor', 'products', 'expenses'
let currentProjectsSubpage = 'projects'; // 'projects' or 'supply'
let currentProjectsView = 'main'; // 'main', 'details', 'project_expenses', or 'supply_details'
let currentInventorySubpage = 'inventory';
let currentInventoryView = 'main';
let selectedInventoryProductId = 'inv-1';
let selectedInventoryProductName = 'Product Description';
let selectedProjectCustomer = 'Altis';
let selectedProjectId = 'proj-1';
let selectedSupplyCustomerId = 'proj-sup-1';
let selectedSupplyCustomerName = 'Customer Name';
let selectedServiceVendorName = 'Service Vendor Name';
let currentProjectDetailTab = ''; // 'expenses', 'materials', 'infra', 'dpr', 'boq', 'additional_approve', 'service_vendor', 'member'

let currentMasterView = 'main'; // 'main' | 'hr_policies'
let currentCompanyHrTab = 'epf'; // 'epf' | 'esi' | 'pt' | 'lwf' | 'tds' | 'leave' | 'bonus' | 'medical_insurance'

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
  const tabParam = params.get('tab');

  if (moduleParam === 'master') {
    currentModule = 'master';
    if (viewParam === 'hr_policies') {
      currentMasterView = 'hr_policies';
      currentCompanyHrTab = subpageParam || 'epf';
    } else {
      currentMasterView = 'main';
      currentMasterSubpage = subpageParam || 'employee';
    }
  } else if (moduleParam === 'indus_towers') {
    currentModule = 'indus_towers';
    if (subpageParam) {
      currentIndusSubpage = subpageParam;
    } else {
      currentIndusSubpage = 'site';
    }
  } else if (moduleParam === 'projects') {
    currentModule = 'projects';
    if (viewParam === 'project_expenses') {
      currentProjectsView = 'project_expenses';
    } else if (viewParam === 'project_material') {
      currentProjectsView = 'project_material';
    } else if (viewParam === 'project_infra') {
      currentProjectsView = 'project_infra';
    } else if (viewParam === 'project_dpr') {
      currentProjectsView = 'project_dpr';
    } else if (viewParam === 'project_boq') {
      currentProjectsView = 'project_boq';
    } else if (viewParam === 'project_approvals' || viewParam === 'project_additional_approve') {
      currentProjectsView = 'project_approvals';
    } else if (viewParam === 'project_service_vendor' || viewParam === 'service_vendor') {
      currentProjectsView = 'project_service_vendor';
    } else if (viewParam === 'project_service_vendor_detail' || viewParam === 'service_vendor_detail') {
      currentProjectsView = 'project_service_vendor_detail';
      selectedServiceVendorName = params.get('vendor') || 'Service Vendor Name';
    } else if (viewParam === 'supply_details') {
      currentProjectsSubpage = 'supply';
      currentProjectsView = 'supply_details';
      selectedSupplyCustomerName = params.get('customer') || 'Customer Name';
      const foundItem = projectsSupplyData.find(s => s.customer === selectedSupplyCustomerName);
      if (foundItem) selectedSupplyCustomerId = foundItem.id;
    } else if (viewParam === 'details') {
      currentProjectsView = 'details';
      currentProjectDetailTab = tabParam || '';
    } else {
      currentProjectsView = 'main';
      if (subpageParam) {
        currentProjectsSubpage = subpageParam;
      } else {
        currentProjectsSubpage = 'projects';
      }
    }
  } else if (moduleParam === 'inventory') {
    currentModule = 'inventory';
    currentInventorySubpage = 'inventory';
    if (viewParam === 'product_details') {
      currentInventoryView = 'product_details';
      selectedInventoryProductName = params.get('product') || 'Product Description';
    } else if (viewParam === 'stock_price' || viewParam === 'stock_ledger') {
      currentInventoryView = viewParam;
      selectedInventoryProductName = params.get('product') || 'Product Description';
    } else {
      currentInventoryView = 'main';
    }
  } else if (moduleParam === 'purchase') {
    currentModule = 'purchase';
    if (viewParam === 'supplier_detail' || viewParam === 'supplier_details') {
      currentPurchaseView = 'supplier_detail';
      selectedPurchaseSupplierId = params.get('supplier_id') || 'pur-1';
      selectedPurchaseSupplierName = params.get('supplier') || 'Schneider Electric India Pvt Ltd';
      selectedPurchasePoNo = params.get('po') || 'PO-2026-1042';
    } else {
      currentPurchaseView = 'main';
    }
  } else if (moduleParam === 'admin') {
    currentModule = 'admin';
    if (viewParam === 'attendance') {
      currentAdminView = 'attendance';
      selectedAdminMonth = params.get('month') || 'April';
      selectedAdminYear = params.get('year') || '2026';
    } else if (viewParam === 'salary_detail') {
      currentAdminView = 'salary_detail';
      selectedAdminMonth = params.get('month') || 'April';
      selectedAdminYear = params.get('year') || '2026';
    } else if (viewParam === 'epf') {
      currentAdminView = 'epf';
      selectedAdminMonth = params.get('month') || 'April';
      selectedAdminYear = params.get('year') || '2026';
    } else if (viewParam === 'esi') {
      currentAdminView = 'esi';
      selectedAdminMonth = params.get('month') || 'April';
      selectedAdminYear = params.get('year') || '2026';
    } else if (viewParam === 'pt') {
      currentAdminView = 'pt';
      selectedAdminMonth = params.get('month') || 'April';
      selectedAdminYear = params.get('year') || '2026';
    } else if (viewParam === 'lwf') {
      currentAdminView = 'lwf';
      selectedAdminMonth = params.get('month') || 'April';
      selectedAdminYear = params.get('year') || '2026';
    } else {
      currentAdminView = 'salary';
    }
  } else if (moduleParam === 'accounts') {
    currentModule = 'accounts';
    if (viewParam === 'gst') {
      currentAccountsView = 'gst';
    } else if (viewParam === 'bank') {
      currentAccountsView = 'bank';
    } else if (viewParam === 'receipt') {
      currentAccountsView = 'receipt';
    } else if (viewParam === 'payment') {
      currentAccountsView = 'payment';
    } else if (viewParam === 'purchase') {
      currentAccountsView = 'purchase';
    } else if (viewParam === 'tds') {
      currentAccountsView = 'tds';
    } else if (viewParam === 'tds_payable') {
      currentAccountsView = 'tds_payable';
    } else if (viewParam === 'tds_receivable') {
      currentAccountsView = 'tds_receivable';
    } else {
      currentAccountsView = 'main';
      currentAccountsSubpage = subpageParam || 'sales';
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
      if (targetModule) {
        switchModule(targetModule);
      }
    });
  });
}

function switchModule(moduleName) {
  if (currentModule === moduleName) return;

  currentModule = moduleName;
  activeColumnFilters = {};

  if (moduleName === 'master') {
    currentMasterView = 'main';
    currentMasterSubpage = 'employee';
  } else if (moduleName === 'indus_towers') {
    currentIndusSubpage = 'site';
  } else if (moduleName === 'worklist') {
    currentWorklistView = 'payment';
  } else if (moduleName === 'projects') {
    currentProjectsSubpage = 'projects';
    currentProjectsView = 'main';
  } else if (moduleName === 'inventory') {
    currentInventorySubpage = 'inventory';
    currentInventoryView = 'main';
  } else if (moduleName === 'purchase') {
    currentPurchaseView = 'main';
  } else if (moduleName === 'accounts') {
    currentAccountsView = 'main';
    currentAccountsSubpage = 'sales';
  } else if (moduleName === 'admin') {
    currentAdminView = 'salary';
  }

  updateURL();
  renderApp();

  const moduleTitles = {
    master: 'Master',
    indus_towers: 'Telecom',
    worklist: 'Worklist',
    projects: 'Projects',
    inventory: 'Inventory',
    purchase: 'Purchase',
    accounts: 'Accounts',
    admin: 'Admin',
    profile: 'Profile'
  };
  showToast(`Navigated to ${moduleTitles[moduleName] || moduleName}`);
}

function updateURL() {
  const url = new URL(window.location.href);
  url.searchParams.set('module', currentModule);

  if (currentModule === 'master') {
    if (currentMasterView === 'hr_policies') {
      url.searchParams.set('view', 'hr_policies');
      url.searchParams.set('subpage', currentCompanyHrTab);
    } else {
      url.searchParams.set('subpage', currentMasterSubpage);
      url.searchParams.delete('view');
    }
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
  } else if (currentModule === 'indus_towers') {
    url.searchParams.set('subpage', currentIndusSubpage);
    url.searchParams.delete('view');
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
  } else if (currentModule === 'projects') {
    if (currentProjectsView === 'project_expenses') {
      url.searchParams.set('view', 'project_expenses');
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    } else if (currentProjectsView === 'project_material') {
      url.searchParams.set('view', 'project_material');
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    } else if (currentProjectsView === 'project_infra') {
      url.searchParams.set('view', 'project_infra');
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    } else if (currentProjectsView === 'project_dpr') {
      url.searchParams.set('view', 'project_dpr');
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    } else if (currentProjectsView === 'project_boq') {
      url.searchParams.set('view', 'project_boq');
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    } else if (currentProjectsView === 'project_approvals') {
      url.searchParams.set('view', 'project_approvals');
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    } else if (currentProjectsView === 'project_service_vendor') {
      url.searchParams.set('view', 'project_service_vendor');
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
      url.searchParams.delete('vendor');
    } else if (currentProjectsView === 'project_service_vendor_detail') {
      url.searchParams.set('view', 'project_service_vendor_detail');
      url.searchParams.set('vendor', selectedServiceVendorName);
      url.searchParams.delete('subpage');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    } else if (currentProjectsView === 'supply_details') {
      url.searchParams.set('subpage', 'supply');
      url.searchParams.set('view', 'supply_details');
      url.searchParams.set('customer', selectedSupplyCustomerName);
      url.searchParams.delete('tab');
    } else if (currentProjectsView === 'details') {
      url.searchParams.set('view', 'details');
      url.searchParams.set('tab', currentProjectDetailTab);
      url.searchParams.delete('subpage');
      url.searchParams.delete('customer');
    } else {
      url.searchParams.set('subpage', currentProjectsSubpage);
      url.searchParams.delete('view');
      url.searchParams.delete('tab');
      url.searchParams.delete('customer');
    }
  } else if (currentModule === 'inventory') {
    if (currentInventoryView === 'product_details' || currentInventoryView === 'stock_price' || currentInventoryView === 'stock_ledger') {
      url.searchParams.set('view', currentInventoryView);
      if (selectedInventoryProductName) {
        url.searchParams.set('product', selectedInventoryProductName);
      }
    } else {
      url.searchParams.delete('view');
      url.searchParams.delete('product');
    }
    url.searchParams.delete('subpage');
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
  } else if (currentModule === 'purchase') {
    if (currentPurchaseView === 'supplier_detail') {
      url.searchParams.set('view', currentPurchaseView);
      if (selectedPurchaseSupplierId) url.searchParams.set('supplier_id', selectedPurchaseSupplierId);
      if (selectedPurchaseSupplierName) url.searchParams.set('supplier', selectedPurchaseSupplierName);
      if (selectedPurchasePoNo) url.searchParams.set('po', selectedPurchasePoNo);
    } else {
      url.searchParams.delete('view');
      url.searchParams.delete('supplier_id');
      url.searchParams.delete('supplier');
      url.searchParams.delete('po');
    }
    url.searchParams.delete('subpage');
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
    url.searchParams.delete('product');
  } else if (currentModule === 'admin') {
    if (currentAdminView === 'attendance' || currentAdminView === 'salary_detail' || currentAdminView === 'epf' || currentAdminView === 'esi' || currentAdminView === 'pt' || currentAdminView === 'lwf') {
      url.searchParams.set('view', currentAdminView);
      url.searchParams.set('month', selectedAdminMonth);
      url.searchParams.set('year', selectedAdminYear);
    } else {
      url.searchParams.delete('view');
      url.searchParams.delete('month');
      url.searchParams.delete('year');
    }
    url.searchParams.delete('subpage');
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
  } else if (currentModule === 'accounts') {
    if (currentAccountsView === 'gst' || currentAccountsView === 'bank' || currentAccountsView === 'receipt' || currentAccountsView === 'payment' || currentAccountsView === 'purchase' || currentAccountsView === 'tds' || currentAccountsView === 'tds_payable' || currentAccountsView === 'tds_receivable') {
      url.searchParams.set('view', currentAccountsView);
      url.searchParams.delete('subpage');
    } else {
      url.searchParams.delete('view');
      url.searchParams.set('subpage', currentAccountsSubpage);
    }
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
    url.searchParams.delete('product');
  } else if (currentModule === 'worklist') {
    url.searchParams.set('view', currentWorklistView);
    url.searchParams.delete('subpage');
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
  } else {
    url.searchParams.delete('view');
    url.searchParams.delete('subpage');
    url.searchParams.delete('tab');
    url.searchParams.delete('customer');
  }

  window.history.replaceState({}, '', url.toString());
}

// ==========================================================================
// 2. MAIN APPLICATION RENDERER & BACK NAVIGATION
// ==========================================================================
function goBackSubpage() {
  if (currentModule === 'admin') {
    if (currentAdminView === 'attendance' || currentAdminView === 'salary_detail' || currentAdminView === 'epf' || currentAdminView === 'esi' || currentAdminView === 'pt' || currentAdminView === 'lwf') {
      closeAdminSalaryDetailPage();
      return;
    }
  } else if (currentModule === 'accounts') {
    if (currentAccountsView === 'tds_payable' || currentAccountsView === 'tds_receivable') {
      openAccountsTdsPage();
      return;
    }
    if (currentAccountsView === 'gst' || currentAccountsView === 'bank' || currentAccountsView === 'receipt' || currentAccountsView === 'payment' || currentAccountsView === 'purchase' || currentAccountsView === 'tds') {
      currentAccountsView = 'main';
      currentAccountsSubpage = 'sales';
      showToast('Returned to Accounts');
    } else {
      currentModule = 'worklist';
      currentWorklistView = 'payment';
      showToast('Returned to Worklist');
    }
  } else if (currentModule === 'purchase') {
    if (currentPurchaseView === 'supplier_detail') {
      currentPurchaseView = 'main';
      showToast('Returned to Purchase');
    }
  } else if (currentModule === 'projects') {
    if (currentProjectsView === 'project_service_vendor_detail') {
      currentProjectsView = 'project_service_vendor';
      showToast('Returned to Service Vendor');
    } else if (currentProjectsView === 'project_expenses' || currentProjectsView === 'project_material' || currentProjectsView === 'project_infra' || currentProjectsView === 'project_dpr' || currentProjectsView === 'project_boq' || currentProjectsView === 'project_approvals' || currentProjectsView === 'project_service_vendor') {
      currentProjectsView = 'details';
      showToast('Returned to Project Details');
    } else if (currentProjectsView === 'supply_details') {
      currentProjectsView = 'main';
      currentProjectsSubpage = 'supply';
      showToast('Returned to Supply Page');
    } else if (currentProjectsView === 'details') {
      currentProjectsView = 'main';
      currentProjectsSubpage = 'projects';
      showToast('Returned to Projects List');
    } else {
      currentModule = 'worklist';
      currentWorklistView = 'payment';
      showToast('Returned to Worklist');
    }
  } else if (currentModule === 'inventory') {
    if (currentInventoryView === 'stock_price' || currentInventoryView === 'stock_ledger') {
      currentInventoryView = 'main';
      showToast('Returned to Inventory');
    } else if (currentInventoryView === 'product_details') {
      currentInventoryView = 'main';
      showToast('Returned to Inventory');
    } else {
      currentModule = 'projects';
      currentProjectsSubpage = 'projects';
      currentProjectsView = 'main';
      showToast('Returned to Projects');
    }
  } else if (currentModule === 'indus_towers') {
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
    if (currentWorklistView === 'po_rfq_compare') {
      currentWorklistView = 'po_supplier';
      showToast('Returned to Supplier Details');
    } else if (currentWorklistView === 'po_supplier') {
      isPoSupplierEditing = false;
      currentWorklistView = 'po';
      showToast('Returned to PO Page');
    } else if (currentWorklistView === 'project_payment' || currentWorklistView === 'purchase_payment' || currentWorklistView === 'employee_payment' || currentWorklistView === 'transport_payment' || currentWorklistView === 'accounts_payment' || currentWorklistView === 'admin_payment' || currentWorklistView === 'statutory_payment') {
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
    if (currentMasterView === 'hr_policies') {
      if (bannerTitle) bannerTitle.innerHTML = `<span>Company Name</span>`;
      loadCompanyHrDataset();
      renderCompanyHrToolbar();
      renderCompanyHrTableHead();
      renderCompanyHrFooter();
    } else {
      if (bannerTitle) bannerTitle.innerHTML = `<a href="#" class="banner-title-link banner-title-underline" onclick="openIndusTowerPageCard(); return false;" title="View Company Name">Company Name</a>`;
      loadMasterDataset();
      renderMasterToolbar();
      renderMasterTableHead();
      renderMasterFooter();
    }
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
      } else if (currentWorklistView === 'purchase_payment') {
        const purchaseInfo = purchaseDetailData[selectedPurchasePayId || 'pay-2'] || purchaseDetailData['pay-2'];
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">${purchaseInfo.supplier || 'Supplier Name'}</div>
            <div class="banner-center-title">PO No : ${purchaseInfo.poNo || ''}</div>
            <div class="banner-right-title">Invoice No: ${purchaseInfo.invoiceNo || ''}</div>
          </div>
        `;
      } else if (currentWorklistView === 'employee_payment') {
        const empInfo = employeeDetailData[selectedEmployeePayId || 'pay-3'] || employeeDetailData['pay-3'];
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">${empInfo.employeeName || 'Employee Name'}</div>
          </div>
        `;
      } else if (currentWorklistView === 'transport_payment') {
        const transInfo = transportDetailData[selectedTransportPayId || 'pay-4'] || transportDetailData['pay-4'];
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">${transInfo.transporterName || 'Transporter Name'}</div>
          </div>
        `;
      } else if (currentWorklistView === 'accounts_payment') {
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">Accounts</div>
          </div>
        `;
      } else if (currentWorklistView === 'admin_payment') {
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">Admin</div>
          </div>
        `;
      } else if (currentWorklistView === 'statutory_payment') {
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">Statutory</div>
          </div>
        `;
      } else if (currentWorklistView === 'po_supplier') {
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">${selectedPoSupplierName || 'Supplier Name'}</div>
            <div class="banner-right-title">${selectedPoNo || 'PO #'}</div>
          </div>
        `;
      } else if (currentWorklistView === 'po_rfq_compare') {
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content">
            <div class="banner-left-title">${selectedRfqNo || 'RFQ # :'}</div>
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
  } else if (currentModule === 'projects') {
    if (bannerTitle) {
      if (currentProjectsView === 'supply_details') {
        bannerTitle.innerHTML = `
          <div class="project-payment-banner-content" style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
            <div class="banner-left-title" style="font-weight: 700; color: #ffffff; font-size: 1.15rem;">${selectedSupplyCustomerName || 'Customer Name'}</div>
            <div class="banner-right-title" style="font-weight: 700; color: #ffffff; font-size: 1.05rem; text-decoration: underline;">Invoice # : 21001</div>
          </div>
        `;
      } else if (currentProjectsView === 'project_service_vendor_detail') {
        bannerTitle.innerHTML = `
          <div class="project-details-banner-bar" style="width: 100%; display: flex; justify-content: flex-start; align-items: center; padding: 0 4px;">
            <div style="font-weight: 700; color: #ffffff; font-size: 1.15rem;">${selectedServiceVendorName || 'Service Vendor Name'}</div>
          </div>
        `;
      } else if (currentProjectsView === 'details' || currentProjectsView === 'project_expenses' || currentProjectsView === 'project_material' || currentProjectsView === 'project_infra' || currentProjectsView === 'project_dpr' || currentProjectsView === 'project_boq' || currentProjectsView === 'project_approvals' || currentProjectsView === 'project_service_vendor') {
        bannerTitle.innerHTML = `
          <div class="project-details-banner-bar" style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <div class="banner-item-with-copy" style="display: flex; align-items: center; gap: 10px;">
              <a href="#" onclick="openProjectInfoModal(); return false;" class="banner-clickable-link banner-title-underline" style="text-decoration: underline; text-underline-offset: 3px; font-weight: 700; color: #ffffff; font-size: 1.12rem; cursor: pointer;" title="Open Details">R/RL-234567 / New Build / With DG</a>
              <button type="button" class="btn-banner-copy" onclick="copyBannerText('R/RL-234567 / New Build / With DG', event)" title="Copy" style="background: transparent; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center;">
                <img src="icons/Copy (1).svg" alt="Copy" style="filter: brightness(0) invert(1); width: 22px; height: 22px; display: block;">
              </button>
            </div>
            <div class="banner-item-with-copy" style="display: flex; align-items: center; gap: 10px;">
              <a href="#" onclick="openPoCapexModal('PO No - Revision No (Capex)'); return false;" class="banner-clickable-link banner-title-underline" style="text-decoration: underline; text-underline-offset: 3px; font-weight: 700; color: #ffffff; font-size: 1.12rem; cursor: pointer;" title="Open Capex PO Details">230510678 / ( 0 - Capex )</a>
              <button type="button" class="btn-banner-copy" onclick="copyBannerText('230510678 / ( 0 - Capex )', event)" title="Copy" style="background: transparent; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center;">
                <img src="icons/Copy (1).svg" alt="Copy" style="filter: brightness(0) invert(1); width: 22px; height: 22px; display: block;">
              </button>
            </div>
            <div class="banner-item-with-copy" style="display: flex; align-items: center; gap: 10px;">
              <a href="#" onclick="openSiteInfoModal('Site ID / Site Name'); return false;" class="banner-clickable-link banner-title-underline" style="text-decoration: underline; text-underline-offset: 3px; font-weight: 700; color: #ffffff; font-size: 1.12rem; cursor: pointer;" title="Open Site Details">IN-123456 / Guindy</a>
              <button type="button" class="btn-banner-copy" onclick="copyBannerText('IN-123456 / Guindy', event)" title="Copy" style="background: transparent; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center;">
                <img src="icons/Copy (1).svg" alt="Copy" style="filter: brightness(0) invert(1); width: 22px; height: 22px; display: block;">
              </button>
            </div>
          </div>
        `;
      } else {
        bannerTitle.textContent = "Projects";
      }
    }
    loadProjectsDataset();
    renderProjectsToolbar();
    renderProjectsTableHead();
    renderProjectsFooter();
  } else if (currentModule === 'inventory') {
    if (bannerTitle) {
      if (currentInventoryView === 'product_details' || currentInventoryView === 'stock_price' || currentInventoryView === 'stock_ledger') {
        bannerTitle.innerHTML = `<span class="banner-title-underline" style="font-weight: 700; color: #ffffff; font-size: 1.15rem;">${selectedInventoryProductName || 'Product Description'}</span>`;
      } else {
        bannerTitle.textContent = "Inventory";
      }
    }
    loadInventoryDataset();
    renderInventoryToolbar();
    renderInventoryTableHead();
    renderInventoryFooter();
  } else if (currentModule === 'purchase') {
    if (bannerTitle) {
      if (currentPurchaseView === 'supplier_detail') {
        bannerTitle.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="font-weight: 700; color: #ffffff; font-size: 1.15rem; letter-spacing: 0.3px;">
              Supplier Name : ${selectedPurchaseSupplierName || ''}
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="font-weight: 700; color: #ffffff; font-size: 1.15rem; letter-spacing: 0.3px;">
                <span style="text-decoration: underline;">PO # :</span> ${selectedPurchasePoNo || ''}
              </div>
            </div>
          </div>
        `;
      } else {
        bannerTitle.textContent = "Purchase";
      }
    }
    loadPurchaseDataset();
    renderPurchaseToolbar();
    renderPurchaseTableHead();
    renderPurchaseFooter();
  } else if (currentModule === 'admin') {
    if (bannerTitle) {
      if (currentAdminView === 'attendance') {
        bannerTitle.textContent = `${selectedAdminMonth} ${selectedAdminYear} - Attendance`;
      } else if (currentAdminView === 'salary_detail') {
        bannerTitle.textContent = `${selectedAdminMonth} ${selectedAdminYear} - Salary`;
      } else if (currentAdminView === 'epf') {
        const monthNumMap = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        const monthEndDayMap = {
          'January': '31', 'February': '28', 'March': '31', 'April': '30',
          'May': '31', 'June': '30', 'July': '31', 'August': '31',
          'September': '30', 'October': '31', 'November': '30', 'December': '31'
        };
        const mm = monthNumMap[selectedAdminMonth] || '04';
        const endDd = monthEndDayMap[selectedAdminMonth] || '30';
        const yyyy = selectedAdminYear || '2026';
        bannerTitle.textContent = `EPF - 01 - ${mm} - ${yyyy} To ${endDd} - ${mm} - ${yyyy}`;
      } else if (currentAdminView === 'esi') {
        const monthNumMap = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        const monthEndDayMap = {
          'January': '31', 'February': '28', 'March': '31', 'April': '30',
          'May': '31', 'June': '30', 'July': '31', 'August': '31',
          'September': '30', 'October': '31', 'November': '30', 'December': '31'
        };
        const mm = monthNumMap[selectedAdminMonth] || '04';
        const endDd = monthEndDayMap[selectedAdminMonth] || '30';
        const yyyy = selectedAdminYear || '2026';
        bannerTitle.textContent = `ESI Details - 01 - ${mm} - ${yyyy} To ${endDd} - ${mm} - ${yyyy}`;
      } else if (currentAdminView === 'pt') {
        const monthNumMap = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        const monthEndDayMap = {
          'January': '31', 'February': '28', 'March': '31', 'April': '30',
          'May': '31', 'June': '30', 'July': '31', 'August': '31',
          'September': '30', 'October': '31', 'November': '30', 'December': '31'
        };
        const mm = monthNumMap[selectedAdminMonth] || '04';
        const endDd = monthEndDayMap[selectedAdminMonth] || '30';
        const yyyy = selectedAdminYear || '2026';
        bannerTitle.textContent = `Professional Tax - 01 - ${mm} - ${yyyy} To ${endDd} - ${mm} - ${yyyy}`;
      } else if (currentAdminView === 'lwf') {
        const monthNumMap = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04',
          'May': '05', 'June': '06', 'July': '07', 'August': '08',
          'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };
        const monthEndDayMap = {
          'January': '31', 'February': '28', 'March': '31', 'April': '30',
          'May': '31', 'June': '30', 'July': '31', 'August': '31',
          'September': '30', 'October': '31', 'November': '30', 'December': '31'
        };
        const mm = monthNumMap[selectedAdminMonth] || '04';
        const endDd = monthEndDayMap[selectedAdminMonth] || '30';
        const yyyy = selectedAdminYear || '2026';
        bannerTitle.textContent = `LWF- 01 - ${mm} - ${yyyy} To ${endDd} - ${mm} - ${yyyy}`;
      } else {
        bannerTitle.textContent = "Admin";
      }
    }
    loadAdminDataset();
    renderAdminToolbar();
    renderAdminTableHead();
    renderAdminFooter();
  } else if (currentModule === 'accounts') {
    if (currentAccountsView === 'gst') {
      if (bannerTitle) bannerTitle.textContent = 'GST';
    } else if (currentAccountsView === 'bank') {
      if (bannerTitle) bannerTitle.textContent = 'Bank';
    } else if (currentAccountsView === 'receipt') {
      if (bannerTitle) bannerTitle.textContent = 'Receipt';
    } else if (currentAccountsView === 'payment') {
      if (bannerTitle) bannerTitle.textContent = 'Payment';
    } else if (currentAccountsView === 'purchase') {
      if (bannerTitle) bannerTitle.textContent = 'Purchase';
    } else if (currentAccountsView === 'tds' || currentAccountsView === 'tds_payable' || currentAccountsView === 'tds_receivable') {
      if (bannerTitle) bannerTitle.textContent = 'TDS';
    } else {
      const accountsTitles = {
        sales: 'Sales',
        purchase: 'Purchase',
        payment: 'Payment',
        receipt: 'Receipt',
        bank: 'Bank',
        tds: 'TDS',
        gst: 'GST'
      };
      if (bannerTitle) bannerTitle.textContent = accountsTitles[currentAccountsSubpage] || 'Sales';
    }
    loadAccountsDataset();
    renderAccountsToolbar();
    renderAccountsTableHead();
    renderAccountsFooter();
  } else {
    const titleMap = {
      accounts: 'Accounts',
      admin: 'Admin',
      profile: 'Profile'
    };
    if (bannerTitle) bannerTitle.textContent = titleMap[currentModule] || (currentModule.charAt(0).toUpperCase() + currentModule.slice(1));
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

  footer.style.display = 'flex';
  footer.style.justifyContent = 'flex-start';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';
  footer.style.marginTop = 'auto';
  footer.style.padding = '24px';

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
    // Vendor Table Headers: Vendor Name (30ch), Business Type (15ch), Service Type (15ch), GST Number (20ch), PAN Number (15ch), GST Type (10ch), Status (10ch) - all headers centered
    thead.innerHTML = `
      <tr class="master-view-header">
        <th style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
            <span>Vendor Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorName'] ? 'has-active-filter' : ''}" data-filter-col="vendorName" title="Filter Vendor Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
            <span>Business Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['businessType'] ? 'has-active-filter' : ''}" data-filter-col="businessType" title="Filter Business Type">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
            <span>Service Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['serviceType'] ? 'has-active-filter' : ''}" data-filter-col="serviceType" title="Filter Service Type">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>GST Number</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>PAN Number</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>GST Type</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
            <span>Status</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['status'] ? 'has-active-filter' : ''}" data-filter-col="status" title="Filter Status">&#9660;</button>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  } else if (currentMasterSubpage === 'products') {
    // Products Table Headers (Product Name 40ch, Product Category 20ch, Product Code 15ch, HSN Code 10ch, GST 10ch, Price 10ch)
    thead.innerHTML = `
      <tr class="master-view-header">
        <th style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Product Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['productName'] ? 'has-active-filter' : ''}" data-filter-col="productName" title="Filter Product Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Product Category</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Product Code</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>HSN Code</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>GST</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Price</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['price'] ? 'has-active-filter' : ''}" data-filter-col="price" title="Filter Price">&#9660;</button>
          </div>
        </th>
      </tr>
    `;
  } else if (currentMasterSubpage === 'expenses') {
    // Expenses Table Headers: Expense Name 40ch, Expense Category 20ch, Expense Head 20ch, GST 10ch, Status 10ch (All headers centered)
    thead.innerHTML = `
      <tr class="master-view-header">
        <th style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
            <span>Expense Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseName'] ? 'has-active-filter' : ''}" data-filter-col="expenseName" title="Filter Expense Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
            <span>Expense Category</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseCategory'] ? 'has-active-filter' : ''}" data-filter-col="expenseCategory" title="Filter Expense Category">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
            <span>Expense Head</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseHead'] ? 'has-active-filter' : ''}" data-filter-col="expenseHead" title="Filter Expense Head">&#9660;</button>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>GST</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px; position: relative;">
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

  footer.style.display = 'flex';
  footer.style.justifyContent = 'flex-start';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';
  footer.style.marginTop = 'auto';
  footer.style.padding = '24px';

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

function loadCompanyHrDataset() {
  if (currentCompanyHrTab === 'epf') {
    currentDataset = [...companyHrEpfData];
  } else if (currentCompanyHrTab === 'esi') {
    currentDataset = [...companyHrEsiData];
  } else if (currentCompanyHrTab === 'pt') {
    currentDataset = [...companyHrPtData];
  } else if (currentCompanyHrTab === 'lwf') {
    currentDataset = [...companyHrLwfData];
  } else if (currentCompanyHrTab === 'tds') {
    currentDataset = [...companyHrTdsData];
  } else if (currentCompanyHrTab === 'leave') {
    currentDataset = [...companyHrLeaveData];
  } else if (currentCompanyHrTab === 'bonus') {
    currentDataset = [...companyHrBonusData];
  } else if (currentCompanyHrTab === 'medical_insurance') {
    currentDataset = [...companyHrMedicalInsuranceData];
  } else {
    currentDataset = [...companyHrEpfData];
  }
}

function renderCompanyHrToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  toolbar.innerHTML = `
    <div class="toolbar-left">
      <button type="button" class="toolbar-icon-btn btn-back-action" id="btnCompanyHrBack" title="Back to Master">
        <img src="icons/Backward.svg" alt="Back" class="toolbar-icon-img" width="30" height="30">
      </button>
    </div>
    <div class="toolbar-right">
      <button type="button" class="toolbar-icon-btn btn-add-action" id="btnCompanyHrAdd" data-tooltip="Add Record" aria-label="Add Record">
        <img src="icons/Add.svg" alt="Add" class="toolbar-icon-img" width="30" height="30">
      </button>
    </div>
  `;

  document.getElementById('btnCompanyHrBack')?.addEventListener('click', () => {
    currentMasterView = 'main';
    activeColumnFilters = {};
    updateURL();
    renderApp();
    showToast('Returned to Master');
  });

  document.getElementById('btnCompanyHrAdd')?.addEventListener('click', () => {
    if (currentCompanyHrTab === 'epf') {
      openCompanyHrEpfModal();
    } else {
      showToast(`Add New ${(currentCompanyHrTab || 'epf').toUpperCase()} Record`);
    }
  });
}

function renderCompanyHrTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentCompanyHrTab === 'epf') {
    thead.innerHTML = `
      <tr class="master-view-header company-hr-header">
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>From</span>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>To</span>
        </th>
        <th rowspan="2" style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>Filling Frequency</span>
        </th>
        <th rowspan="2" style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>Filling Due Date</span>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>Sealing Amount</span>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>Employee</span>
        </th>
        <th colspan="4" style="text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-bottom: 1.5px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>Employer</span>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>Status</span>
        </th>
      </tr>
      <tr class="master-view-header company-hr-header tr-sub-headers">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>EPF</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>EPS</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>EDLI</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; padding: 8px 6px; white-space: nowrap;">
          <span>Admin Charges</span>
        </th>
      </tr>
    `;
  } else {
    thead.innerHTML = `
      <tr class="master-view-header company-hr-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">From</th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">To</th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">Filling Frequency</th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">Filling Due Date</th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">Sealing Amount</th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">Employee</th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">EPF</th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">EPS</th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">EDLI</th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">Admin Charges</th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 8px 6px;">Status</th>
      </tr>
    `;
  }
}

function renderCompanyHrFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;

  footer.style.display = 'flex';
  footer.style.justifyContent = 'flex-start';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';
  footer.style.marginTop = 'auto';
  footer.style.padding = '24px';

  const hrSubpages = [
    { key: 'epf', label: 'EPF' },
    { key: 'esi', label: 'ESI' },
    { key: 'pt', label: 'PT' },
    { key: 'lwf', label: 'LWF' },
    { key: 'tds', label: 'TDS' },
    { key: 'leave', label: 'Leave' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'medical_insurance', label: 'Medical Insurance' }
  ];

  footer.innerHTML = `
    <div class="segmented-toggle-group master-segmented-group">
      ${hrSubpages.map((sp, idx) => `
        <button type="button" class="segmented-btn ${currentCompanyHrTab === sp.key ? 'active' : ''}" data-hr-tab="${sp.key}">
          ${sp.label}
        </button>
        ${idx < hrSubpages.length - 1 ? '<div class="segmented-divider"></div>' : ''}
      `).join('')}
    </div>
  `;

  footer.querySelectorAll('.segmented-btn[data-hr-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-hr-tab');
      if (currentCompanyHrTab !== tabKey) {
        currentCompanyHrTab = tabKey;
        activeColumnFilters = {};
        updateURL();
        renderApp();
        showToast(`Switched to Company HR Policies • ${btn.textContent.trim()}`);
      }
    });
  });
}

window.openCompanyHrPoliciesPage = function(tab) {
  closeSideForm();
  currentModule = 'master';
  currentMasterView = 'hr_policies';
  currentCompanyHrTab = tab || 'epf';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Opened Company HR Policies • ${(currentCompanyHrTab || 'epf').toUpperCase()}`);
};

let isCompanyHrEpfEditing = false;

function setCompanyHrEpfReadOnly(isReadOnly) {
  const form = document.getElementById('frmCompanyHrEpf');
  if (!form) return;

  const inputs = form.querySelectorAll('input:not([type="checkbox"])');
  inputs.forEach(inp => {
    inp.readOnly = isReadOnly;
    inp.style.backgroundColor = '#ffffff';
    inp.style.cursor = isReadOnly ? 'default' : 'text';
  });

  const calTriggers = form.querySelectorAll('.btn-calendar-trigger');
  calTriggers.forEach(b => {
    b.style.pointerEvents = isReadOnly ? 'none' : 'auto';
    b.style.opacity = isReadOnly ? '0.65' : '1';
    b.style.cursor = isReadOnly ? 'default' : 'pointer';
  });

  const toggle = document.getElementById('inpEpfStatusToggle');
  if (toggle) {
    toggle.disabled = isReadOnly;
    const parentSwitch = toggle.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  }
}

window.openCompanyHrEpfModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'companyHrEpfCard') card.style.display = 'none';
  });

  const row = (rowId && (typeof companyHrEpfData !== 'undefined') && companyHrEpfData.find(r => r.id === rowId)) || 
              ((typeof companyHrEpfData !== 'undefined') && companyHrEpfData[0]) || {
                from: "01 - 04 - 2026",
                to: "31 - 03 - 2027",
                fillingDueDate: "15 - 05 - 2026",
                sealingAmount: "15,000.00",
                employee: "12%",
                epf: "3.67%",
                eps: "8.33%",
                edli: "0.50%",
                adminCharges: "0.50%",
                status: "Active"
              };

  const inpFrom = document.getElementById('inpEpfFromDate');
  if (inpFrom) inpFrom.value = row.from || '';

  const inpTo = document.getElementById('inpEpfToDate');
  if (inpTo) inpTo.value = row.to || '';

  const inpDue = document.getElementById('inpEpfFillingDueDate');
  if (inpDue) inpDue.value = row.fillingDueDate || '';

  const inpSealing = document.getElementById('inpEpfSealingAmount');
  if (inpSealing) inpSealing.value = String(row.sealingAmount || '').replace('₹', '').trim();

  const inpEmp = document.getElementById('inpEpfEmpContribution');
  if (inpEmp) inpEmp.value = String(row.employee || '').replace('%', '').trim();

  const inpEpf = document.getElementById('inpEpfEmployerContribution');
  if (inpEpf) inpEpf.value = String(row.epf || '').replace('%', '').trim();

  const inpEps = document.getElementById('inpEpsEmployerContribution');
  if (inpEps) inpEps.value = String(row.eps || '').replace('%', '').trim();

  const inpEdli = document.getElementById('inpEdliEmployerContribution');
  if (inpEdli) inpEdli.value = String(row.edli || '').replace('%', '').trim();

  const inpAdmin = document.getElementById('inpEpfAdminCharges');
  if (inpAdmin) inpAdmin.value = String(row.adminCharges || '').replace('%', '').trim();

  const inpStatus = document.getElementById('inpEpfStatusToggle');
  if (inpStatus) inpStatus.checked = !((row.status || '').toLowerCase().includes('in'));

  isCompanyHrEpfEditing = true;
  setCompanyHrEpfReadOnly(false);

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
};

window.closeCompanyHrEpfModal = function() {
  const modal = document.getElementById('companyHrEpfCard');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

// ==========================================================================
// 3B. PROJECTS MODULE RENDERERS
// ==========================================================================
window.copyBannerText = function(text, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied: ${text}`);
    }).catch(() => {
      showToast(`Copied: ${text}`);
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(`Copied: ${text}`);
    } catch (err) {
      showToast(`Copied: ${text}`);
    }
    document.body.removeChild(textarea);
  }
};

window.openProjectInfoModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'projectInfoModal') card.style.display = 'none';
  });

  const modal = document.getElementById('projectInfoModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeProjectInfoModal = function() {
  const modal = document.getElementById('projectInfoModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openPoCapexModal = function(titleText) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'poCapexModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblPoCapexTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const modal = document.getElementById('poCapexModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closePoCapexModal = function() {
  const modal = document.getElementById('poCapexModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openSiteInfoModal = function(titleText) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'siteInfoModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblSiteInfoTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const modal = document.getElementById('siteInfoModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeSiteInfoModal = function() {
  const modal = document.getElementById('siteInfoModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openExpensesSummaryModal = function(titleText) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'expensesSummaryModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblExpensesSummaryTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const modal = document.getElementById('expensesSummaryModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeExpensesSummaryModal = function() {
  const modal = document.getElementById('expensesSummaryModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openExpenseRequestDetailModal = function(requestBy, expenseDate) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'expenseRequestDetailModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblExpenseRequestDetailTitle');
  if (titleBadge) {
    if (requestBy && expenseDate) {
      titleBadge.textContent = `${requestBy} - ${expenseDate}`;
    } else if (requestBy) {
      titleBadge.textContent = requestBy;
    } else {
      titleBadge.textContent = 'Request By - Expense Date';
    }
  }

  const tbody = document.getElementById('tbodyExpenseRequestDetail');
  if (tbody) {
    let items = [];
    if (requestBy === 'Praveen Raj') {
      items = [
        { desc: 'Tower Erection Structure & Rigging Work', uom: 'Sq.Ft', qty: '150.00', rate: '2,200.00', basic: '3,30,000.00', gst: '50,000.00', total: '3,80,000.00' },
        { desc: 'Earthing & Lightning Protection Systems', uom: 'Mtr', qty: '320.00', rate: '375.00', basic: '1,20,000.00', gst: '20,000.00', total: '1,40,000.00' },
        { desc: 'Safety Audit, Testing & Commissioning Fee', uom: 'Nos', qty: '2.00', rate: '34,000.00', basic: '68,000.00', gst: '12,000.00', total: '80,000.00' }
      ];
    } else {
      items = [
        { desc: 'Civil Foundation Work & Excavation', uom: 'Sq.Ft', qty: '120.00', rate: '2,500.00', basic: '3,00,000.00', gst: '54,000.00', total: '3,54,000.00' },
        { desc: 'Electrical Cabling & Termination', uom: 'Mtr', qty: '450.00', rate: '350.00', basic: '1,57,500.00', gst: '28,350.00', total: '1,85,850.00' },
        { desc: 'Site Diesel Generator Fuel & Transport', uom: 'Ltr', qty: '650.00', rate: '92.50', basic: '60,125.00', gst: '0.00', total: '60,150.00' }
      ];
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">
          <a href="#" onclick="openBoqExpenseDetailModal('${item.desc.replace(/'/g, "\\'")}', '${(requestBy || '').replace(/'/g, "\\'")}'); return false;" class="clickable-expense-desc-link" style="color: #0454e4; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; cursor: pointer;">${item.desc}</a>
        </td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.uom}</td>
        <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.qty}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.rate}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.basic}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.gst}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; font-weight: 600; color: #1e293b; font-size: 0.95rem;">${item.total}</td>
      </tr>
    `).join('');
  }

  const modal = document.getElementById('expenseRequestDetailModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeExpenseRequestDetailModal = function() {
  const modal = document.getElementById('expenseRequestDetailModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  const expSummary = document.getElementById('expensesSummaryModal');
  if (expSummary) {
    expSummary.style.display = 'block';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
};

window.openBoqExpenseDetailModal = function(boqName, reqBy) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'boqExpenseDetailModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblBoqExpenseDetailTitle');
  if (titleBadge) {
    titleBadge.textContent = boqName || 'BOQ Name';
  }

  const tbody = document.getElementById('tbodyBoqExpenseDetail');
  if (tbody) {
    const rBy = reqBy || 'Nivas Kumar';
    let items = [];
    if (boqName && boqName.includes('Electrical')) {
      items = [
        { reqDate: '12/08/2026', reqBy: rBy, desc: 'Electrical Cabling & Termination', uom: 'Mtr', qty: '450.00', rate: '350.00', basic: '1,57,500.00', gst: '28,350.00', total: '1,85,850.00', transferTo: 'SBI - 4092109281', txnDate: '14/08/2026' }
      ];
    } else if (boqName && boqName.includes('Diesel')) {
      items = [
        { reqDate: '12/08/2026', reqBy: rBy, desc: 'Site Diesel Generator Fuel & Transport', uom: 'Ltr', qty: '650.00', rate: '92.50', basic: '60,125.00', gst: '0.00', total: '60,150.00', transferTo: 'SBI - 4092109281', txnDate: '14/08/2026' }
      ];
    } else {
      items = [
        { reqDate: '12/08/2026', reqBy: rBy, desc: boqName || 'Civil Foundation Work & Excavation', uom: 'Sq.Ft', qty: '120.00', rate: '2,500.00', basic: '3,00,000.00', gst: '54,000.00', total: '3,54,000.00', transferTo: 'SBI - 4092109281', txnDate: '14/08/2026' }
      ];
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.reqDate}</td>
        <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.reqBy}</td>
        <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.desc}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.uom}</td>
        <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.qty}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.rate}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.basic}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.gst}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; font-weight: 600; color: #1e293b; font-size: 0.95rem;">${item.total}</td>
        <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.transferTo}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.txnDate}</td>
      </tr>
    `).join('');
  }

  const modal = document.getElementById('boqExpenseDetailModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeBoqExpenseDetailModal = function() {
  const modal = document.getElementById('boqExpenseDetailModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  const reqDetail = document.getElementById('expenseRequestDetailModal');
  if (reqDetail) {
    reqDetail.style.display = 'block';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
};

window.openExpenseBankDetailsModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'expenseBankDetailsModal') card.style.display = 'none';
  });

  const modal = document.getElementById('expenseBankDetailsModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeExpenseBankDetailsModal = function() {
  const modal = document.getElementById('expenseBankDetailsModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  const reqDetail = document.getElementById('expenseRequestDetailModal');
  if (reqDetail) {
    reqDetail.style.display = 'block';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
};

window.openExpenseApprovalDetailModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'expenseApprovalDetailModal') card.style.display = 'none';
  });

  const modal = document.getElementById('expenseApprovalDetailModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeExpenseApprovalDetailModal = function() {
  const modal = document.getElementById('expenseApprovalDetailModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  const reqDetail = document.getElementById('expenseRequestDetailModal');
  if (reqDetail) {
    reqDetail.style.display = 'block';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
};

window.openPaymentReceiptModal = function(titleText, amountColLabel = 'Received Amount') {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'paymentReceiptModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblPaymentReceiptTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const colHeader = document.getElementById('lblPaymentReceiptAmountCol');
  if (colHeader) {
    colHeader.textContent = amountColLabel;
  }

  const modal = document.getElementById('paymentReceiptModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closePaymentReceiptModal = function() {
  const modal = document.getElementById('paymentReceiptModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openMinMrnModal = function(titleText) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'minMrnModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblMinMrnTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const modal = document.getElementById('minMrnModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeMinMrnModal = function() {
  const modal = document.getElementById('minMrnModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openInfraDocModal = function(titleText) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'infraDocModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblInfraDocTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const modal = document.getElementById('infraDocModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeInfraDocModal = function() {
  const modal = document.getElementById('infraDocModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openBoqMaterialDetailModal = function(titleText) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'boqMaterialDetailModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblBoqMaterialDetailTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const modal = document.getElementById('boqMaterialDetailModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeBoqMaterialDetailModal = function() {
  const modal = document.getElementById('boqMaterialDetailModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.openEmailApprovalModal = function(titleText) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'emailApprovalModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblEmailApprovalTitle');
  if (titleBadge && titleText) {
    titleBadge.textContent = titleText;
  }

  const modal = document.getElementById('emailApprovalModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeEmailApprovalModal = function() {
  const modal = document.getElementById('emailApprovalModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

window.renderInventoryStockLedgerTable = function() {
  const tbody = document.getElementById('tbodyInventoryStockLedger');
  if (!tbody) return;

  tbody.innerHTML = inventoryStockLedgerData.map(row => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.docDate || ''}</td>
      <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.docType || ''}</td>
      <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.docNo || ''}</td>
      <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis;" title="${(row.fromTo || '').replace(/"/g, '&quot;')}">${row.fromTo || ''}</td>
      <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.uom || ''}</td>
      <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.qtyStock || ''}</td>
      <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.qtyDoc || ''}</td>
      <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.qtyBalance || ''}</td>
      <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${row.rate || ''}</td>
      <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; font-weight: 600; color: #1e293b; font-size: 0.95rem;">${row.stockValue || ''}</td>
    </tr>
  `).join('');
};

window.openInventoryStockLedgerModal = function(productId, productName) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'inventoryStockLedgerModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblInventoryStockLedgerTitle');
  if (titleBadge) {
    titleBadge.textContent = productName || selectedInventoryProductName || 'Product Description';
  }

  if (window.renderInventoryStockLedgerTable) {
    window.renderInventoryStockLedgerTable();
  }

  const modal = document.getElementById('inventoryStockLedgerModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeInventoryStockLedgerModal = function() {
  const modal = document.getElementById('inventoryStockLedgerModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openProjectDetailPage = function(projId, customerName) {
  currentModule = 'projects';
  currentProjectsView = 'details';
  selectedProjectId = projId || 'proj-1';
  selectedProjectCustomer = customerName || 'Indus';
  currentProjectDetailTab = ''; // Landing page is empty until user clicks Expenses or other button
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Opened Project: ${selectedProjectCustomer}`);
};

window.openProjectExpensesPage = function() {
  currentModule = 'projects';
  currentProjectsView = 'project_expenses';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Project Expenses Page');
};

window.openProjectMaterialPage = function() {
  currentModule = 'projects';
  currentProjectsView = 'project_material';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Project Material Page');
};

window.openProjectInfraPage = function() {
  currentModule = 'projects';
  currentProjectsView = 'project_infra';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Project Infra Page');
};

window.openProjectDprPage = function() {
  currentModule = 'projects';
  currentProjectsView = 'project_dpr';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Project DPR Page');
};

window.openProjectBoqPage = function() {
  currentModule = 'projects';
  currentProjectsView = 'project_boq';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Project BOQ Page');
};

window.openProjectApprovalsPage = function() {
  currentModule = 'projects';
  currentProjectsView = 'project_approvals';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Additional Approvals Page');
};

window.openProjectServiceVendorPage = function() {
  currentModule = 'projects';
  currentProjectsView = 'project_service_vendor';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Service Vendor Page');
};

window.openServiceVendorItems = function(vendorName) {
  currentModule = 'projects';
  currentProjectsView = 'project_service_vendor_detail';
  selectedServiceVendorName = vendorName || 'Service Vendor Name';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Opened ${selectedServiceVendorName} Items`);
};

window.toggleApprovalRowSelect = function(id) {
  projectApprovalsData.forEach(d => {
    d.selected = (d.id === id) ? !d.selected : false;
  });
  renderApp();
};

window.openSupplyCustomerDetailsPage = function(customerId, customerName) {
  currentModule = 'projects';
  currentProjectsSubpage = 'supply';
  currentProjectsView = 'supply_details';
  selectedSupplyCustomerId = customerId || 'proj-sup-1';
  selectedSupplyCustomerName = customerName || 'Customer Name';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Opened Supply Details for ${selectedSupplyCustomerName}`);
};

function loadProjectsDataset() {
  if (currentProjectsView === 'project_expenses') {
    currentDataset = [...projectExpensesData];
  } else if (currentProjectsView === 'project_material') {
    currentDataset = [...projectMaterialData];
  } else if (currentProjectsView === 'project_infra') {
    currentDataset = [...projectInfraData];
  } else if (currentProjectsView === 'project_dpr') {
    currentDataset = [...projectDprData];
  } else if (currentProjectsView === 'project_boq') {
    currentDataset = [...projectBoqData];
  } else if (currentProjectsView === 'project_approvals') {
    currentDataset = [...projectApprovalsData];
  } else if (currentProjectsView === 'project_service_vendor') {
    currentDataset = [...projectServiceVendorData];
  } else if (currentProjectsView === 'project_service_vendor_detail') {
    currentDataset = [...projectServiceVendorItemsData];
  } else if (currentProjectsView === 'supply_details') {
    const items = supplyCustomerDetailData[selectedSupplyCustomerId] || supplyCustomerDetailData['default'] || [];
    currentDataset = [...items];
  } else if (currentProjectsView === 'details') {
    currentDataset = [];
  } else if (currentProjectsSubpage === 'supply') {
    currentDataset = [...projectsSupplyData];
  } else {
    currentDataset = [...projectsMainData];
  }
}

function renderProjectsToolbar() {
  const toolbar = document.getElementById('worklistToolbar') || document.getElementById('pageToolbar');
  if (!toolbar) return;
  if (currentProjectsView === 'project_service_vendor_detail') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
        <div style="display: flex; align-items: center; gap: 36px; padding-left: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;" title="Total Amount">
            <img src="icons/summation.svg" alt="Summation" style="width: 28px; height: 28px; display: block;">
            <span style="color: #0454e4; font-weight: 700; font-size: 1.15rem; font-family: inherit;">11,00,000.00</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="openPaymentReceiptModal('Payment Receipt', 'Paid Amount'); return false;" title="Paid / Received">
            <img src="icons/Paid _ Received.svg" alt="Paid / Received" style="width: 28px; height: 28px; display: block; cursor: pointer;">
            <a href="#" onclick="openPaymentReceiptModal('Payment Receipt', 'Paid Amount'); return false;" class="clickable-green-amount-link" style="color: #008744; font-weight: 700; font-size: 1.15rem; font-family: inherit; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; cursor: pointer;">11,00,000.00</a>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;" title="Payable">
            <img src="icons/Payable.svg" alt="Payable" style="width: 28px; height: 28px; display: block;">
            <span style="color: #d62d20; font-weight: 700; font-size: 1.15rem; font-family: inherit;">11,00,000.00</span>
          </div>
        </div>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn btn-export-pdf" id="btnExportServiceVendorPdf" title="Upload / View PDF" style="background: transparent; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center;" onclick="showToast('PDF Upload / View opened'); return false;">
          <img src="icons/PDF Upload.svg" alt="PDF" style="width: 28px; height: 28px; display: block;">
        </button>
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'project_service_vendor';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Service Vendor');
    });
    toolbar.querySelector('#btnExportServiceVendorPdf')?.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('PDF Upload / View opened');
    });
    return;
  }
  if (currentProjectsView === 'project_service_vendor') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'details';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Project Details');
    });
    return;
  }
  if (currentProjectsView === 'project_approvals') {
    const hasSelectedRow = projectApprovalsData.some(d => d.selected);
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        ${hasSelectedRow ? `
          <button type="button" class="tool-btn" id="btnApprovalsChart" title="E - Mail Approval" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openEmailApprovalModal('E - Mail Approval'); return false;">
            <img src="icons/approval.svg?v=${Date.now()}" alt="Approval" style="width: 28px; height: 28px; display: block; object-fit: contain;">
          </button>
        ` : ''}
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'details';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Project Details');
    });
    if (hasSelectedRow) {
      toolbar.querySelector('#btnApprovalsChart')?.addEventListener('click', (e) => {
        e.preventDefault();
        openEmailApprovalModal('E - Mail Approval');
      });
    }
    return;
  }
  if (currentProjectsView === 'project_boq') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Summation" style="width: 26px; height: 26px; display: block; object-fit: contain;">
          <span style="color: #0454e4; font-weight: 700; font-size: 1.15rem; font-family: inherit; line-height: 1;">11,00,000.00</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-left: 16px;">
          <img src="icons/Payable.svg" alt="Payable" style="width: 26px; height: 26px; display: block; object-fit: contain;">
          <span style="color: #d62d20; font-weight: 700; font-size: 1.15rem; font-family: inherit; line-height: 1;">11,00,000.00</span>
        </div>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnBoqWcc" title="WCC / Green Invoice" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openBoqWccModal(); return false;">
          <img src="icons/wcc.svg?v=20260915" alt="WCC" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnBoqInvoice" title="Invoice / Blue Invoice" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openBoqInvoiceModal(); return false;">
          <img src="icons/invoice.svg?v=20260915" alt="Invoice" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnBoqUploadCsv" title="Upload CSV / Excel" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerBoqFileUpload(); return false;">
          <img src="icons/CSV upload.svg?v=20260915" alt="CSV Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'details';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Project Details');
    });
    toolbar.querySelector('#btnBoqWcc')?.addEventListener('click', (e) => {
      e.preventDefault();
      openBoqWccModal();
    });
    toolbar.querySelector('#btnBoqInvoice')?.addEventListener('click', (e) => {
      e.preventDefault();
      openBoqInvoiceModal();
    });
    toolbar.querySelector('#btnBoqUploadCsv')?.addEventListener('click', (e) => {
      e.preventDefault();
      triggerBoqFileUpload();
    });
    return;
  }
  if (currentProjectsView === 'project_dpr') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnDprApprovalHistory" title="Approval History" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openDprSurveyReportModal(); return false;">
          <img src="icons/Approval History.svg" alt="Approval History" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnDprContact" title="Members" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openDprMembersModal(); return false;">
          <img src="icons/Members.svg" alt="Members" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnDprAttendance" title="Attendance" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openDprAttendanceModal(); return false;">
          <img src="icons/Attendance.svg" alt="Attendance" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnDprDocuments" title="Documents" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openDprDocumentsModal(); return false;">
          <img src="icons/Documents.svg" alt="Documents" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'details';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Project Details');
    });
    toolbar.querySelector('#btnDprApprovalHistory')?.addEventListener('click', (e) => {
      e.preventDefault();
      openDprSurveyReportModal();
    });
    toolbar.querySelector('#btnDprContact')?.addEventListener('click', (e) => {
      e.preventDefault();
      openDprMembersModal();
    });
    toolbar.querySelector('#btnDprAttendance')?.addEventListener('click', (e) => {
      e.preventDefault();
      openDprAttendanceModal();
    });
    toolbar.querySelector('#btnDprDocuments')?.addEventListener('click', (e) => {
      e.preventDefault();
      openDprDocumentsModal();
    });
    return;
  }
  if (currentProjectsView === 'project_infra') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center;">
        <button type="button" class="tool-btn btn-export-pdf" id="btnExportInfraPdf" title="Upload / View PDF" style="background: transparent; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center;" onclick="openInfraDocModal('DOC / STATUS'); return false;">
          <img src="icons/PDF Upload.svg" alt="PDF" style="width: 28px; height: 28px; display: block;">
        </button>
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'details';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Project Details');
    });
    toolbar.querySelector('#btnExportInfraPdf')?.addEventListener('click', (e) => {
      e.preventDefault();
      openInfraDocModal('STN / SRN / CAM');
    });
    return;
  }
  if (currentProjectsView === 'project_material') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
        <div style="display: flex; align-items: center; gap: 10px; padding-left: 12px; cursor: pointer;" onclick="" title="Total Material Amount">
          <img src="icons/summation.svg" alt="Summation" style="width: 28px; height: 28px; display: block;">
          <span style="color: #0454e4; font-weight: 700; font-size: 1.15rem; font-family: inherit;">12,00,000.00</span>
        </div>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center;">
        <button type="button" class="tool-btn btn-export-pdf" id="btnExportMaterialPdf" title="MIN / MRN" style="background: transparent; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center;" onclick="openMinMrnModal('MIN / MRN'); return false;">
          <img src="icons/PDF Upload.svg" alt="PDF" style="width: 28px; height: 28px; display: block;">
        </button>
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'details';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Project Details');
    });
    toolbar.querySelector('#btnExportMaterialPdf')?.addEventListener('click', (e) => {
      e.preventDefault();
      openMinMrnModal('MIN / MRN');
    });
    return;
  }
  if (currentProjectsView === 'project_expenses') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
        <div style="display: flex; align-items: center; gap: 36px; padding-left: 12px;">
          <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="openExpensesSummaryModal('Expenses Summarry'); return false;" title="Open Expenses Summary">
            <img src="icons/summation.svg" alt="Summation" style="width: 28px; height: 28px; display: block; cursor: pointer;">
            <a href="#" onclick="openExpensesSummaryModal('Expenses Summarry'); return false;" class="clickable-blue-amount-link" style="color: #0454e4; font-weight: 700; font-size: 1.15rem; font-family: inherit; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; text-decoration-color: #0454e4; cursor: pointer;">12,00,000.00</a>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="icons/Paid _ Received.svg" alt="Paid / Received" style="width: 28px; height: 28px; display: block;">
            <span style="color: #008744; font-weight: 700; font-size: 1.15rem; font-family: inherit;">12,00,000.00</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="icons/Payable.svg" alt="Payable" style="width: 28px; height: 28px; display: block;">
            <span style="color: #d62d20; font-weight: 700; font-size: 1.15rem; font-family: inherit;">12,00,000.00</span>
          </div>
        </div>
      </div>
      <div class="toolbar-right"></div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'details';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Project Details');
    });
    return;
  }
  if (currentProjectsView === 'supply_details') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
        <div style="display: flex; align-items: center; gap: 36px; padding-left: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="icons/summation.svg" alt="Summation" style="width: 28px; height: 28px; display: block;">
            <span style="color: #0454e4; font-weight: 700; font-size: 1.15rem; font-family: inherit;">11,00,000.00</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="openPaymentReceiptModal('Payment Receipt', 'Received Amount'); return false;" title="Open Payment Receipt">
            <img src="icons/Paid _ Received.svg" alt="Paid / Received" style="width: 28px; height: 28px; display: block; cursor: pointer;">
            <a href="#" onclick="openPaymentReceiptModal('Payment Receipt', 'Received Amount'); return false;" class="clickable-green-amount-link" style="color: #008744; font-weight: 700; font-size: 1.15rem; font-family: inherit; text-decoration: underline; cursor: pointer;">11,00,000.00</a>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="icons/Payable.svg" alt="Payable" style="width: 28px; height: 28px; display: block;">
            <span style="color: #d62d20; font-weight: 700; font-size: 1.15rem; font-family: inherit;">11,00,000.00</span>
          </div>
        </div>
      </div>
      <div class="toolbar-right"></div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentProjectsView = 'main';
      currentProjectsSubpage = 'supply';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Supply page');
    });
    return;
  }
  if (currentProjectsView === 'details') {
    toolbar.innerHTML = `
      <div class="toolbar-left">${universalBackBtnHtml}</div>
      <div class="toolbar-right">
        <button type="button" class="tool-btn" id="btnProjectsDashboard" title="Dashboard" style="background: transparent; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center;">
          <img src="icons/Dash board.svg" alt="Dashboard" style="width: 28px; height: 28px; display: block;">
        </button>
      </div>
    `;
  } else {
    toolbar.innerHTML = `
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <button type="button" class="tool-btn" id="btnProjectsDashboard" title="Dashboard" style="background: transparent; border: none; cursor: pointer; padding: 4px; display: inline-flex; align-items: center;">
          <img src="icons/Dash board.svg" alt="Dashboard" style="width: 28px; height: 28px; display: block;">
        </button>
      </div>
    `;
  }
  document.getElementById('btnProjectsDashboard')?.addEventListener('click', () => {
    showToast('Dashboard opened');
  });
}

function renderProjectsTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentProjectsView === 'project_service_vendor_detail') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Item Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['itemDescription'] ? 'has-active-filter' : ''}" data-filter-col="itemDescription" title="Filter Item Description">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Uom</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Qty</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Rate</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'project_service_vendor') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Service Vendor Name</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Work Type</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Basic</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>GST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Total Amount</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>TDS Deduction</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Paid Amount</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Paid Date</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'project_approvals') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th style="width: 60px; min-width: 60px; max-width: 60px; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Select</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Request Date</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Approved Date</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Ageing</span>
        </th>
        <th style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Subject</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Status</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'project_boq') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Line No</span>
        </th>
        <th style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Item Code</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['itemCode'] ? 'has-active-filter' : ''}" data-filter-col="itemCode" title="Filter Item Code">&#9660;</button>
          </div>
        </th>
        <th style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Item Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['itemDescription'] ? 'has-active-filter' : ''}" data-filter-col="itemDescription" title="Filter Item Description">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Uom</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Qty</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Rate</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'project_dpr') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Date</span>
        </th>
        <th rowspan="2" style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding-left: 14px !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: flex-start; gap: 6px;">
            <span>Activity</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['activity'] ? 'has-active-filter' : ''}" data-filter-col="activity" title="Filter Activity">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Status</span>
        </th>
        <th colspan="3" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>PTW</span>
        </th>
        <th colspan="2" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>I - Map</span>
        </th>
        <th colspan="2" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>Photo</span>
        </th>
        <th rowspan="2" style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-left: 1px solid #ffffff !important; vertical-align: middle;">
          <span>Update By</span>
        </th>
      </tr>
      <tr class="master-view-header projects-view-header">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Type</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Number</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Status</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Check - In</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Check - Out</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Start</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>End</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'project_infra') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Doc Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['docType'] ? 'has-active-filter' : ''}" data-filter-col="docType" title="Filter Doc Type">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>BOQ No</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>BOQ Date</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding-left: 12px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: flex-start; gap: 6px;">
            <span>Category</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['category'] ? 'has-active-filter' : ''}" data-filter-col="category" title="Filter Category">&#9660;</button>
          </div>
        </th>
        <th style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding-left: 12px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: flex-start; gap: 6px;">
            <span>Infra Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['infraDescription'] ? 'has-active-filter' : ''}" data-filter-col="infraDescription" title="Filter Infra Description">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Qty</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Status</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['status'] ? 'has-active-filter' : ''}" data-filter-col="status" title="Filter Status">&#9660;</button>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'project_material') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th rowspan="2" style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>BOQ Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['boqName'] ? 'has-active-filter' : ''}" data-filter-col="boqName" title="Filter BOQ Name">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Uom</span>
        </th>
        <th colspan="5" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>Qty</span>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-left: 1px solid #ffffff !important; vertical-align: middle;">
          <span>Rate</span>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Amount</span>
        </th>
      </tr>
      <tr class="master-view-header projects-view-header">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>MIR</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>MIN</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>MRR</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>MRN</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Net</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'project_expenses') {
    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Expense Type</span>
        </th>
        <th rowspan="2" style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Item Name</span>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Uom</span>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Qty</span>
        </th>
        <th colspan="4" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>Amount</span>
        </th>
      </tr>
      <tr class="master-view-header projects-view-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>PO</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Budget</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Used</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
          <span>Available</span>
        </th>
      </tr>
    `;
    return;
  }

  if (currentProjectsView === 'supply_details') {
    const detailCols = [
      { key: 'itemDescription', label: 'Item Description', width: '' },
      { key: 'uom', label: 'Uom', width: '15ch' },
      { key: 'qty', label: 'Qty', width: '15ch' },
      { key: 'rate', label: 'Rate', width: '15ch' },
      { key: 'amount', label: 'Amount', width: '15ch' }
    ];

    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        ${detailCols.map(c => `
          <th style="${c.width ? `width: ${c.width}; min-width: ${c.width}; max-width: ${c.width};` : ''} text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
            <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>${c.label}</span>
              ${c.key === 'itemDescription' ? `<button type="button" class="filter-funnel-btn ${activeColumnFilters[c.key] ? 'has-active-filter' : ''}" data-filter-col="${c.key}" title="Filter ${c.label}">&#9660;</button>` : ''}
            </div>
          </th>
        `).join('')}
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentProjectsView === 'details') {
    if (!currentProjectDetailTab) {
      thead.innerHTML = '';
      return;
    }
    thead.innerHTML = `
      <tr class="master-view-header">
        <th style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Item Description</th>
        <th style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Category</th>
        <th style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Amount</th>
        <th style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Status</th>
      </tr>
    `;
    return;
  }

  if (currentProjectsSubpage === 'supply') {
    const supplyCols = [
      { key: 'customer', label: 'Customer', width: '25ch' },
      { key: 'orderId', label: 'Order ID', width: '20ch' },
      { key: 'orderDate', label: 'Order Date', width: '15ch' },
      { key: 'orderAmount', label: 'Order Amount', width: '15ch' },
      { key: 'invoiceNumber', label: 'Invoice Number', width: '20ch' },
      { key: 'invoiceDate', label: 'Invoice Date', width: '15ch' },
      { key: 'invoiceAmount', label: 'Invoice Amount', width: '15ch' },
      { key: 'ageing', label: 'Ageing', width: '10ch' },
      { key: 'paymentStatus', label: 'Payment Status', width: '15ch' }
    ];

    thead.innerHTML = `
      <tr class="master-view-header projects-view-header">
        ${supplyCols.map(c => `
          <th style="${c.width ? `width: ${c.width}; min-width: ${c.width}; max-width: ${c.width};` : ''} text-align: center; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff;">
            <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>${c.label}</span>
              <button type="button" class="filter-funnel-btn ${activeColumnFilters[c.key] ? 'has-active-filter' : ''}" data-filter-col="${c.key}" title="Filter ${c.label}">&#9660;</button>
            </div>
          </th>
        `).join('')}
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  const cols = [
    { key: 'customer', label: 'Customer', width: '25ch' },
    { key: 'projectId', label: 'Project ID', width: '20ch' },
    { key: 'poNo', label: 'PO No', width: '10ch' },
    { key: 'poAgeing', label: 'PO Ageing' },
    { key: 'poStatus', label: 'PO Status' },
    { key: 'siteId', label: 'Site ID', width: '12ch' },
    { key: 'siteName', label: 'Site Name', width: '30ch' },
    { key: 'projectType', label: 'Project Type' },
    { key: 'subProjectType', label: 'Sub-Project Type', width: '30ch' },
    { key: 'projectStatus', label: 'Project Status' },
    { key: 'task', label: 'Task', width: '35ch' },
    { key: 'pendingWith', label: 'Pending With', width: '30ch' },
    { key: 'supportRequired', label: 'Support Required', width: '30ch' },
    { key: 'pendingWith2', label: 'Pending With', width: '30ch' }
  ];

  thead.innerHTML = `
    <tr class="master-view-header projects-view-header">
      ${cols.map(c => `
        <th style="${c.width ? `width: ${c.width}; min-width: ${c.width}; max-width: ${c.width};` : ''}">
          <div class="th-content-wrap">
            <span>${c.label}</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters[c.key] ? 'has-active-filter' : ''}" data-filter-col="${c.key}" title="Filter ${c.label}">&#9660;</button>
          </div>
        </th>
      `).join('')}
    </tr>
  `;
  rebindFilterButtons();
}

function renderProjectsFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;

  if (currentProjectsView === 'project_expenses' || currentProjectsView === 'project_material' || currentProjectsView === 'project_infra' || currentProjectsView === 'project_dpr' || currentProjectsView === 'project_boq' || currentProjectsView === 'project_approvals' || currentProjectsView === 'project_service_vendor' || currentProjectsView === 'project_service_vendor_detail' || currentProjectsView === 'supply_details') {
    footer.innerHTML = '';
    footer.style.display = 'none';
    return;
  }

  if (currentProjectsView === 'details') {
    const detailTabs = [
      { key: 'expenses', label: 'Expenses' },
      { key: 'material', label: 'Material' },
      { key: 'infra', label: 'Infra' },
      { key: 'dpr', label: 'DPR' },
      { key: 'boq', label: 'BOQ' },
      { key: 'additional_approve', label: 'Additional Approve' },
      { key: 'service_vendor', label: 'Service vendor' }
    ];

    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-start';
    footer.style.alignItems = 'center';
    footer.style.width = '100%';
    footer.style.marginTop = 'auto';
    footer.style.padding = '24px';
    footer.innerHTML = `
      <div class="segmented-toggle-group">
        ${detailTabs.map((tab, idx) => `
          <button type="button" class="segmented-btn ${currentProjectDetailTab === tab.key ? 'active' : ''}" data-project-tab="${tab.key}">
            ${tab.label}
          </button>
          ${idx < detailTabs.length - 1 ? '<div class="segmented-divider"></div>' : ''}
        `).join('')}
      </div>
    `;

    footer.querySelectorAll('.segmented-btn[data-project-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-project-tab');
        if (tabKey === 'expenses') {
          openProjectExpensesPage();
          return;
        }
        if (tabKey === 'material' || tabKey === 'materials') {
          openProjectMaterialPage();
          return;
        }
        if (tabKey === 'infra') {
          openProjectInfraPage();
          return;
        }
        if (tabKey === 'dpr') {
          openProjectDprPage();
          return;
        }
        if (tabKey === 'boq') {
          openProjectBoqPage();
          return;
        }
        if (tabKey === 'additional_approve' || tabKey === 'approvals' || tabKey === 'additional_approvals') {
          openProjectApprovalsPage();
          return;
        }
        if (tabKey === 'service_vendor' || tabKey === 'service_vendors') {
          openProjectServiceVendorPage();
          return;
        }
        if (currentProjectDetailTab !== tabKey) {
          currentProjectDetailTab = tabKey;
          activeColumnFilters = {};
          updateURL();
          renderApp();
          showToast(`Switched to ${btn.textContent.trim()} Tab`);
        }
      });
    });
    return;
  }

  footer.style.display = 'flex';
  footer.style.justifyContent = 'flex-start';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';
  footer.style.marginTop = 'auto';
  footer.style.padding = '24px';
  footer.innerHTML = `
    <div class="segmented-toggle-group">
      <button type="button" class="segmented-btn ${currentProjectsSubpage === 'projects' ? 'active' : ''}" id="btnToggleProjectsSubpage">
        Projects
      </button>
      <div class="segmented-divider"></div>
      <button type="button" class="segmented-btn ${currentProjectsSubpage === 'supply' ? 'active' : ''}" id="btnToggleSupplySubpage">
        Supply
      </button>
    </div>
  `;

  document.getElementById('btnToggleProjectsSubpage')?.addEventListener('click', () => {
    if (currentProjectsSubpage !== 'projects') {
      currentProjectsSubpage = 'projects';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Switched to Projects View');
    }
  });

  document.getElementById('btnToggleSupplySubpage')?.addEventListener('click', () => {
    if (currentProjectsSubpage !== 'supply') {
      currentProjectsSubpage = 'supply';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Switched to Supply View');
    }
  });
}

// ==========================================================================
// 3B. INVENTORY MODULE RENDERERS
// ==========================================================================
function loadInventoryDataset() {
  if (currentInventoryView === 'stock_price' || currentInventoryView === 'stock_ledger') {
    currentDataset = [...inventoryStockLedgerData];
  } else if (currentInventoryView === 'product_details') {
    currentDataset = [...inventoryProductDetailsData];
  } else {
    currentDataset = [...inventoryData];
  }
}

function openInventoryProductDetails(productId, productName) {
  currentModule = 'inventory';
  currentInventoryView = 'product_details';
  selectedInventoryProductId = productId || 'inv-1';
  selectedInventoryProductName = productName || 'Product Description';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Product Details');
}

function openInventoryStockPricePage(productId, productName) {
  currentModule = 'inventory';
  currentInventoryView = 'stock_price';
  selectedInventoryProductId = productId || 'inv-1';
  selectedInventoryProductName = productName || 'Product Description';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Stock Price Details');
}
window.openInventoryStockPricePage = openInventoryStockPricePage;

function renderInventoryToolbar() {
  const toolbar = document.getElementById('worklistToolbar') || document.getElementById('pageToolbar');
  if (!toolbar) return;

  if (currentInventoryView === 'stock_price' || currentInventoryView === 'stock_ledger' || currentInventoryView === 'product_details') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
        <button type="button" class="toolbar-icon-btn" id="btnInventorySigma" title="Summation" style="background: transparent; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
          <img src="icons/summation.svg" alt="Summation" width="28" height="28" style="display: block; object-fit: contain;">
        </button>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentInventoryView = 'main';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Inventory');
    });
    return;
  }

  toolbar.innerHTML = `
    <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
      <button type="button" class="toolbar-icon-btn" id="btnInventorySigma" title="Summation" style="background: transparent; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
        <img src="icons/summation.svg" alt="Summation" width="28" height="28" style="display: block; object-fit: contain;">
      </button>
    </div>
    <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
    </div>
  `;
}

function renderInventoryTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentInventoryView === 'stock_price' || currentInventoryView === 'stock_ledger') {
    thead.innerHTML = `
      <tr class="master-view-header inventory-view-header inventory-stock-header">
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Doc. Date</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['docDate'] ? 'has-active-filter' : ''}" data-filter-col="docDate" title="Filter Doc. Date">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Doc. Type</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['docType'] ? 'has-active-filter' : ''}" data-filter-col="docType" title="Filter Doc. Type">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Doc.No</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['docNo'] ? 'has-active-filter' : ''}" data-filter-col="docNo" title="Filter Doc.No">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>From / To</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['fromTo'] ? 'has-active-filter' : ''}" data-filter-col="fromTo" title="Filter From / To">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Uom</span>
        </th>
        <th colspan="3" class="th-qty-group" style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-bottom: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Qty</span>
        </th>
        <th rowspan="2" class="th-rate-col" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-left: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Rate</span>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Stock Value</span>
        </th>
      </tr>
      <tr class="master-view-header inventory-view-header inventory-stock-header">
        <th class="th-sub-qty" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Stock</span>
        </th>
        <th class="th-sub-qty" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Doc</span>
        </th>
        <th class="th-sub-qty" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Balance</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentInventoryView === 'product_details') {
    thead.innerHTML = `
      <tr class="master-view-header inventory-view-header">
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Invoice No</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceNo'] ? 'has-active-filter' : ''}" data-filter-col="invoiceNo" title="Filter Invoice No">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 35ch; min-width: 35ch; max-width: 35ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Vendor Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorName'] ? 'has-active-filter' : ''}" data-filter-col="vendorName" title="Filter Vendor Name">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Doc Date</span>
        </th>
        <th colspan="3" class="th-qty-group" style="width: 36ch; min-width: 36ch; max-width: 36ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-bottom: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Qty</span>
        </th>
        <th colspan="5" class="th-rate-group" style="width: 73ch; min-width: 73ch; max-width: 73ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-bottom: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Rate</span>
        </th>
      </tr>
      <tr class="master-view-header inventory-view-header">
        <th class="th-sub-qty" style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Doc</span>
        </th>
        <th class="th-sub-qty" style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Stock</span>
        </th>
        <th class="th-sub-qty" style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Total</span>
        </th>
        <th class="th-sub-rate" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Purchase Price</span>
        </th>
        <th class="th-sub-rate" style="width: 14ch; min-width: 14ch; max-width: 14ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Transportation</span>
        </th>
        <th class="th-sub-rate" style="width: 16ch; min-width: 16ch; max-width: 16ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Unloading & Other</span>
        </th>
        <th class="th-sub-rate" style="width: 14ch; min-width: 14ch; max-width: 14ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; border-right: 1.5px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Stock Price</span>
        </th>
        <th class="th-sub-rate" style="width: 14ch; min-width: 14ch; max-width: 14ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; border-top: 1.5px solid #ffffff !important; border-bottom: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>New Price</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  thead.innerHTML = `
    <tr class="master-view-header inventory-view-header">
      <th style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Product Description</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['productDescription'] ? 'has-active-filter' : ''}" data-filter-col="productDescription" title="Filter Product Description">&#9660;</button>
        </div>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>WH Code</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['whCode'] ? 'has-active-filter' : ''}" data-filter-col="whCode" title="Filter WH Code">&#9660;</button>
        </div>
      </th>
      <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Product Head</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['productHead'] ? 'has-active-filter' : ''}" data-filter-col="productHead" title="Filter Product Head">&#9660;</button>
        </div>
      </th>
      <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Product Type</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['productType'] ? 'has-active-filter' : ''}" data-filter-col="productType" title="Filter Product Type">&#9660;</button>
        </div>
      </th>
      <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <span>Uom</span>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <span>Qty</span>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <span>Stock Price</span>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <span>Stock Value</span>
      </th>
    </tr>
  `;
  rebindFilterButtons();
}

function renderInventoryFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;
  footer.innerHTML = '';
  footer.style.display = 'none';
}

// ==========================================================================
// 3C. PURCHASE MODULE RENDERERS
// ==========================================================================
function loadPurchaseDataset() {
  if (currentPurchaseView === 'supplier_detail') {
    const items = purchaseSupplierItemsData[selectedPurchaseSupplierId] || purchaseSupplierItemsData['pur-1'] || [];
    currentDataset = [...items];
  } else {
    currentDataset = [...purchaseModuleData];
  }
}

function openPurchaseSupplierDetails(supplierId, supplierName, poNo) {
  currentModule = 'purchase';
  currentPurchaseView = 'supplier_detail';
  selectedPurchaseSupplierId = supplierId || 'pur-1';
  selectedPurchaseSupplierName = supplierName || 'Supplier Name';
  selectedPurchasePoNo = poNo || 'PO-2026-1042';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Supplier Details');
}
window.openPurchaseSupplierDetails = openPurchaseSupplierDetails;

function renderPurchaseToolbar() {
  const toolbar = document.getElementById('worklistToolbar') || document.getElementById('pageToolbar');
  if (!toolbar) return;

  if (currentPurchaseView === 'supplier_detail') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
        <button type="button" class="toolbar-icon-btn" id="btnPurchaseSigma" title="Summation" style="background: transparent; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
          <img src="icons/summation.svg" alt="Summation" width="28" height="28" style="display: block; object-fit: contain;">
        </button>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentPurchaseView = 'main';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Purchase');
    });
    return;
  }

  toolbar.innerHTML = `
    <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
      <button type="button" class="toolbar-icon-btn" id="btnPurchaseSigma" title="Summation" style="background: transparent; border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
        <img src="icons/summation.svg" alt="Summation" width="28" height="28" style="display: block; object-fit: contain;">
      </button>
    </div>
    <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
    </div>
  `;
}

function renderPurchaseTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentPurchaseView === 'supplier_detail') {
    thead.innerHTML = `
      <tr class="master-view-header purchase-view-header purchase-supplier-header">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>HSN Code</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['hsnCode'] ? 'has-active-filter' : ''}" data-filter-col="hsnCode" title="Filter HSN Code">&#9660;</button>
          </div>
        </th>
        <th style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Description</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['description'] ? 'has-active-filter' : ''}" data-filter-col="description" title="Filter Description">&#9660;</button>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Uom</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['uom'] ? 'has-active-filter' : ''}" data-filter-col="uom" title="Filter Uom">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Qty</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Rate</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>GST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff !important; padding: 6px 10px; white-space: nowrap;">
          <span>Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  thead.innerHTML = `
    <tr class="master-view-header purchase-view-header">
      <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <span>PR No</span>
      </th>
      <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Request By</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['requestBy'] ? 'has-active-filter' : ''}" data-filter-col="requestBy" title="Filter Request By">&#9660;</button>
        </div>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>PO #</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['poNo'] ? 'has-active-filter' : ''}" data-filter-col="poNo" title="Filter PO #">&#9660;</button>
        </div>
      </th>
      <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Supplier Name</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['supplierName'] ? 'has-active-filter' : ''}" data-filter-col="supplierName" title="Filter Supplier Name">&#9660;</button>
        </div>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <span>PO Value</span>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <span>Invoice #</span>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <span>Invoice Value</span>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Payment Status</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['paymentStatus'] ? 'has-active-filter' : ''}" data-filter-col="paymentStatus" title="Filter Payment Status">&#9660;</button>
        </div>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>GST Filling Status</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['gstFilingStatus'] ? 'has-active-filter' : ''}" data-filter-col="gstFilingStatus" title="Filter GST Filling Status">&#9660;</button>
        </div>
      </th>
    </tr>
  `;
  rebindFilterButtons();
}

function renderPurchaseFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;
  footer.innerHTML = '';
  footer.style.display = 'none';
}

// ==========================================================================
// ADMIN MODULE RENDERERS
// ==========================================================================
function openAdminAttendancePage(month, year) {
  currentModule = 'admin';
  currentAdminView = 'attendance';
  selectedAdminMonth = month || 'April';
  selectedAdminYear = year || '2026';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to ${selectedAdminMonth} ${selectedAdminYear} Attendance`);
}

function closeAdminAttendancePage() {
  currentModule = 'admin';
  currentAdminView = 'salary';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Returned to Admin Salary');
}

function openAdminSalaryDetailPage(month, year) {
  currentModule = 'admin';
  currentAdminView = 'salary_detail';
  selectedAdminMonth = month || 'April';
  selectedAdminYear = year || '2026';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to ${selectedAdminMonth} ${selectedAdminYear} Salary Details`);
}

function closeAdminSalaryDetailPage() {
  currentModule = 'admin';
  currentAdminView = 'salary';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Returned to Admin Salary');
}

function openAdminEpfPage(month, year) {
  currentModule = 'admin';
  currentAdminView = 'epf';
  selectedAdminMonth = month || 'April';
  selectedAdminYear = year || '2026';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to ${selectedAdminMonth} ${selectedAdminYear} EPF Details`);
}
window.openAdminEpfPage = openAdminEpfPage;

function closeAdminEpfPage() {
  currentModule = 'admin';
  currentAdminView = 'salary';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Returned to Admin Salary');
}
window.closeAdminEpfPage = closeAdminEpfPage;

function openAdminEsiPage(month, year) {
  currentModule = 'admin';
  currentAdminView = 'esi';
  selectedAdminMonth = month || 'April';
  selectedAdminYear = year || '2026';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to ${selectedAdminMonth} ${selectedAdminYear} ESI Details`);
}
window.openAdminEsiPage = openAdminEsiPage;

function closeAdminEsiPage() {
  currentModule = 'admin';
  currentAdminView = 'salary';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Returned to Admin Salary');
}
window.closeAdminEsiPage = closeAdminEsiPage;

function openAdminPtPage(month, year) {
  currentModule = 'admin';
  currentAdminView = 'pt';
  selectedAdminMonth = month || 'April';
  selectedAdminYear = year || '2026';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to ${selectedAdminMonth} ${selectedAdminYear} Professional Tax Details`);
}
window.openAdminPtPage = openAdminPtPage;

function closeAdminPtPage() {
  currentModule = 'admin';
  currentAdminView = 'salary';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Returned to Admin Salary');
}
window.closeAdminPtPage = closeAdminPtPage;

function openAdminLwfPage(month, year) {
  currentModule = 'admin';
  currentAdminView = 'lwf';
  selectedAdminMonth = month || 'April';
  selectedAdminYear = year || '2026';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to ${selectedAdminMonth} ${selectedAdminYear} LWF Details`);
}
window.openAdminLwfPage = openAdminLwfPage;

function closeAdminLwfPage() {
  currentModule = 'admin';
  currentAdminView = 'salary';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Returned to Admin Salary');
}
window.closeAdminLwfPage = closeAdminLwfPage;

function loadAdminDataset() {
  if (currentAdminView === 'attendance') {
    currentDataset = [...adminAttendanceData];
  } else if (currentAdminView === 'salary_detail') {
    currentDataset = [...adminSalaryDetailData];
  } else if (currentAdminView === 'epf') {
    currentDataset = [...adminEpfData];
  } else if (currentAdminView === 'esi') {
    currentDataset = [...adminEsiData];
  } else if (currentAdminView === 'pt') {
    currentDataset = [...adminPtData];
  } else if (currentAdminView === 'lwf') {
    currentDataset = [...adminLwfData];
  } else {
    currentDataset = [...adminSalaryData];
  }
}

function renderAdminToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  if (currentAdminView === 'attendance' || currentAdminView === 'salary_detail' || currentAdminView === 'epf' || currentAdminView === 'esi' || currentAdminView === 'pt' || currentAdminView === 'lwf') {
    const isSummationSubpage = (currentAdminView === 'salary_detail' || currentAdminView === 'epf' || currentAdminView === 'esi' || currentAdminView === 'pt' || currentAdminView === 'lwf');
    const toolbarLeftHtml = isSummationSubpage
      ? `<div class="toolbar-left" style="display: flex; align-items: center; gap: 14px;">
          ${universalBackBtnHtml}
          <img src="icons/summation.svg" alt="Summation" style="width: 32px; height: 32px; border-radius: 4px; display: inline-block; vertical-align: middle;">
        </div>`
      : `<div class="toolbar-left">${universalBackBtnHtml}</div>`;

    toolbar.innerHTML = `
      ${toolbarLeftHtml}
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <!-- Hidden File Input for PDF -->
        <input type="file" id="adminPdfInput" accept=".pdf, application/pdf" style="display: none;">
        <!-- Hidden File Input for CSV / Excel -->
        <input type="file" id="adminFileInput" accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display: none;">
        
        <!-- PDF Upload Button -->
        <button type="button" class="toolbar-icon-btn btn-pdf-action" id="btnAdminPdf" data-tooltip="Upload PDF" aria-label="Upload PDF">
          <img src="icons/PDF Upload.svg" alt="Upload PDF" class="toolbar-icon-img" width="30" height="30">
        </button>
        <!-- CSV / Excel Upload Button -->
        <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnAdminCsv" data-tooltip="Upload CSV / Excel" aria-label="Upload CSV / Excel">
          <img src="icons/CSV upload.svg" alt="Upload CSV / Excel" class="toolbar-icon-img" width="30" height="30">
        </button>
      </div>
    `;

    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      currentAdminView = 'salary';
      activeColumnFilters = {};
      updateURL();
      renderApp();
      showToast('Returned to Admin Overview');
    });

    document.getElementById('btnAdminPdf')?.addEventListener('click', () => {
      const input = document.getElementById('adminPdfInput');
      if (input) {
        input.value = '';
        input.click();
      }
    });

    document.getElementById('adminPdfInput')?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        showToast(`PDF selected: ${file.name}`);
      }
    });

    document.getElementById('btnAdminCsv')?.addEventListener('click', () => {
      const input = document.getElementById('adminFileInput');
      if (input) {
        input.value = '';
        input.click();
      }
    });

    document.getElementById('adminFileInput')?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        showToast(`File selected: ${file.name}`);
      }
    });
    return;
  }

  toolbar.innerHTML = `
    <div class="toolbar-left"></div>
    <div class="toolbar-right">
      <!-- Hidden File Input for CSV / Excel (restricted to csv, xlsx, xls) -->
      <input type="file" id="adminFileInput" accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display: none;">
      <!-- CSV / Excel Upload Button -->
      <button type="button" class="toolbar-icon-btn btn-csv-action" id="btnAdminCsv" data-tooltip="Upload CSV / Excel" aria-label="Upload CSV / Excel">
        <img src="icons/CSV upload.svg" alt="Upload" class="toolbar-icon-img" width="30" height="30">
      </button>
    </div>
  `;

  const btnAdminCsv = document.getElementById('btnAdminCsv');
  const adminFileInput = document.getElementById('adminFileInput');

  if (btnAdminCsv && adminFileInput) {
    btnAdminCsv.addEventListener('click', () => {
      adminFileInput.value = '';
      adminFileInput.click();
    });

    adminFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        showToast(`File selected: ${file.name}`);
      }
    });
  }
}

function renderAdminTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentAdminView === 'lwf') {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee ID</span>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeName'] ? 'has-active-filter' : ''}" data-filter-col="employeeName" title="Filter Employee Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Designation</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Gross Salary</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>State</span>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; white-space: nowrap;">
            <span>Employee Share</span>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; white-space: nowrap;">
            <span>Employer Share</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Total Amount</span>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAdminView === 'pt') {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee ID</span>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeName'] ? 'has-active-filter' : ''}" data-filter-col="employeeName" title="Filter Employee Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Basic</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>HRA</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>DA</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>SA</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Gross Wages</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Payable</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Deducted Amount</span>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAdminView === 'esi') {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>IP Number</span>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeName'] ? 'has-active-filter' : ''}" data-filter-col="employeeName" title="Filter Employee Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Gross Salary</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>ESI Wages</span>
          </div>
        </th>
        <th style="width: 18ch; min-width: 18ch; max-width: 18ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>No of Days Worked</span>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Employee Contribution</span>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Employer Contribution</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Total Amount</span>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAdminView === 'epf') {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th rowspan="2" style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>UAN</span>
          </div>
        </th>
        <th rowspan="2" style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeName'] ? 'has-active-filter' : ''}" data-filter-col="employeeName" title="Filter Employee Name">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Gross Salary</span>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>EPF Wages</span>
          </div>
        </th>
        <th rowspan="2" style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Employee Contribution</span>
          </div>
        </th>
        <th colspan="3" style="text-align: center !important; border-bottom: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Employer Contribution</span>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; border-left: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Total Amount</span>
          </div>
        </th>
      </tr>
      <tr class="master-view-header tr-sub-headers">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>EPF</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>EPS</span>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>EDLI</span>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAdminView === 'salary_detail') {
    thead.innerHTML = `
      <tr class="master-view-header">
        <th rowspan="2" style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeName'] ? 'has-active-filter' : ''}" data-filter-col="employeeName" title="Filter Employee Name">&#9660;</button>
          </div>
        </th>
        <th colspan="5" style="text-align: center !important; border-bottom: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Days</span>
          </div>
        </th>
        <th colspan="2" style="text-align: center !important; border-bottom: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Salary</span>
          </div>
        </th>
        <th colspan="6" style="text-align: center !important; border-bottom: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Deduction</span>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; vertical-align: middle; border-left: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Net Salary</span>
          </div>
        </th>
      </tr>
      <tr class="master-view-header tr-sub-headers">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Total</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Worked</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>LOP</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Holidays</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Net Salary Days</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Gross</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Earned</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>EPF</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>ESI / MI</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>PT</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>LWF</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>TDS</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Advance</span>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAdminView === 'attendance') {
    let daysTh = '';
    for (let d = 1; d <= 31; d++) {
      daysTh += `<th style="width: 4ch; min-width: 4ch; max-width: 4ch; text-align: center !important; padding: 6px 2px;"><div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;"><span>${d}</span></div></th>`;
    }
    thead.innerHTML = `
      <tr class="master-view-header">
        <th rowspan="2" style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Employee Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['employeeName'] ? 'has-active-filter' : ''}" data-filter-col="employeeName" title="Filter Employee Name">&#9660;</button>
          </div>
        </th>
        <th colspan="31" style="text-align: center !important; border-bottom: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Date</span>
          </div>
        </th>
        <th colspan="6" style="text-align: center !important; border-bottom: 1px solid #ffffff !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Salary Days</span>
          </div>
        </th>
      </tr>
      <tr class="master-view-header tr-sub-headers">
        ${daysTh}
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Total</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Worked</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Leave</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>LOP</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Holidays</span>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center;">
            <span>Net Salary Days</span>
          </div>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  thead.innerHTML = `
    <tr class="master-view-header">
      <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Year</span>
        </div>
      </th>
      <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Month</span>
          <button type="button" class="filter-funnel-btn ${activeColumnFilters['month'] ? 'has-active-filter' : ''}" data-filter-col="month" title="Filter Month">&#9660;</button>
        </div>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>No of Employee</span>
        </div>
      </th>
      <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Salary Paid</span>
        </div>
      </th>
      <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>EPF</span>
        </div>
      </th>
      <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>ESI</span>
        </div>
      </th>
      <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>PT</span>
        </div>
      </th>
      <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important;">
        <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>LWF</span>
        </div>
      </th>
    </tr>
  `;
  rebindFilterButtons();
}

function renderAdminFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;
  footer.innerHTML = '';
  footer.style.display = 'none';
}

// ==========================================================================
// ACCOUNTS MODULE RENDERERS
// ==========================================================================
function openAccountsPage(subpage) {
  currentModule = 'accounts';
  currentAccountsView = 'main';
  currentAccountsSubpage = subpage || 'sales';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Navigated to Accounts`);
}

function openAccountsGstPage() {
  currentModule = 'accounts';
  currentAccountsView = 'gst';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to GST Page');
}

function openAccountsBankPage() {
  currentModule = 'accounts';
  currentAccountsView = 'bank';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to Bank Page');
}

function openAccountsReceiptPage() {
  currentModule = 'accounts';
  currentAccountsView = 'receipt';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to Receipt Page');
}

function openAccountsPaymentPage() {
  currentModule = 'accounts';
  currentAccountsView = 'payment';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to Payment Page');
}

function openAccountsPurchasePage() {
  currentModule = 'accounts';
  currentAccountsView = 'purchase';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to Purchase Page');
}

function openAccountsTdsPage() {
  currentModule = 'accounts';
  currentAccountsView = 'tds';
  currentTdsBottomTab = 'receivable';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to TDS Page');
}
window.openAccountsTdsPage = openAccountsTdsPage;

function openAccountsTdsPayablePage() {
  currentModule = 'accounts';
  currentAccountsView = 'tds_payable';
  currentTdsBottomTab = 'payable';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to TDS Payable Page');
}
window.openAccountsTdsPayablePage = openAccountsTdsPayablePage;

function openAccountsTdsReceivablePage() {
  currentModule = 'accounts';
  currentAccountsView = 'tds_receivable';
  currentTdsBottomTab = 'receivable';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Navigated to TDS Receivable Page');
}
window.openAccountsTdsReceivablePage = openAccountsTdsReceivablePage;

function loadAccountsDataset() {
  if (currentAccountsView === 'gst') {
    currentDataset = [...accountsGstData];
  } else if (currentAccountsView === 'bank') {
    currentDataset = [...accountsBankData];
  } else if (currentAccountsView === 'receipt') {
    currentDataset = [...accountsReceiptData];
  } else if (currentAccountsView === 'payment') {
    currentDataset = [...accountsPaymentData];
  } else if (currentAccountsView === 'purchase') {
    currentDataset = [...accountsPurchaseData];
  } else if (currentAccountsView === 'tds') {
    currentDataset = [...accountsTdsData];
  } else if (currentAccountsView === 'tds_payable') {
    currentDataset = [...accountsTdsPayableData];
  } else if (currentAccountsView === 'tds_receivable') {
    currentDataset = [...accountsTdsReceivableData];
  } else if (currentAccountsSubpage === 'sales') {
    currentDataset = [...accountsSalesData];
  } else {
    currentDataset = [];
  }
}

function renderAccountsToolbar() {
  const toolbar = document.getElementById('worklistToolbar');
  if (!toolbar) return;

  if (currentAccountsView === 'tds_receivable') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnAccountsTdsReceivablePdf" title="PDF Download" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsPdfUpload(); return false;">
          <img src="icons/PDF Download.svg" alt="PDF Download" style="width: 28px; height: 28px; display: block; object-fit: contain;" onerror="this.src='icons/PDF Upload.svg';">
        </button>
        <button type="button" class="tool-btn" id="btnAccountsTdsReceivableCsv" title="CSV Download" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
          <img src="icons/CSV download.svg" alt="CSV Download" style="width: 28px; height: 28px; display: block; object-fit: contain;" onerror="this.src='icons/CSV upload.svg';">
        </button>
        <button type="button" class="tool-btn" id="btnAccountsTdsReceivableClose" title="Close" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="openAccountsTdsPage(); return false;">
          <img src="icons/Cancel.svg" alt="Close" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      openAccountsTdsPage();
    });
    return;
  }

  if (currentAccountsView === 'tds_payable') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnAccountsTdsPayablePdf" title="PDF Download" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsPdfUpload(); return false;">
          <img src="icons/PDF Download.svg" alt="PDF Download" style="width: 28px; height: 28px; display: block; object-fit: contain;" onerror="this.src='icons/PDF Upload.svg';">
        </button>
        <button type="button" class="tool-btn" id="btnAccountsTdsPayableCsv" title="CSV Download" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
          <img src="icons/CSV download.svg" alt="CSV Download" style="width: 28px; height: 28px; display: block; object-fit: contain;" onerror="this.src='icons/CSV upload.svg';">
        </button>
      </div>
    `;
    toolbar.querySelector('.btn-universal-back')?.addEventListener('click', () => {
      openAccountsTdsPage();
    });
    return;
  }

  if (currentAccountsView === 'tds') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        ${universalBackBtnHtml}
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnAccountsTdsDashboard" title="Dashboard" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="showToast('TDS Dashboard opened'); return false;">
          <img src="icons/Dash board.svg" alt="Dashboard" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnAccountsTdsPdfUpload" title="PDF Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsPdfUpload(); return false;">
          <img src="icons/PDF Upload.svg" alt="PDF Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnAccountsTdsCsvUpload" title="CSV Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
          <img src="icons/CSV upload.svg" alt="CSV Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    return;
  }

  if (currentAccountsView === 'purchase') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;"></div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnAccountsPurchaseCsvUpload" title="CSV Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
          <img src="icons/CSV upload.svg" alt="CSV Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    return;
  }

  if (currentAccountsView === 'payment') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;"></div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;"></div>
    `;
    return;
  }

  if (currentAccountsView === 'gst') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;"></div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnAccountsGstPdfUpload" title="PDF Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: none; align-items: center; justify-content: center;" onclick="triggerAccountsPdfUpload(); return false;">
          <img src="icons/PDF Upload.svg" alt="PDF Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
        <button type="button" class="tool-btn" id="btnAccountsGstCsvUpload" title="CSV Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
          <img src="icons/CSV upload.svg" alt="CSV Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    return;
  }

  if (currentAccountsView === 'bank') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;"></div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnAccountsBankCsvUpload" title="CSV Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
          <img src="icons/CSV upload.svg" alt="CSV Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    return;
  }

  if (currentAccountsView === 'receipt') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;"></div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
        <button type="button" class="tool-btn" id="btnAccountsReceiptCsvUpload" title="CSV Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
          <img src="icons/CSV upload.svg" alt="CSV Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
        </button>
      </div>
    `;
    return;
  }

  toolbar.innerHTML = `
    <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;"></div>
    <div class="toolbar-right" style="display: flex; align-items: center; gap: 14px;">
      <button type="button" class="tool-btn" id="btnAccountsDashboard" title="Dashboard" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="showToast('Dashboard opened'); return false;">
        <img src="icons/Dash board.svg" alt="Dashboard" style="width: 28px; height: 28px; display: block; object-fit: contain;">
      </button>
      <button type="button" class="tool-btn" id="btnAccountsCsvUpload" title="CSV Upload" style="background: transparent; border: none; cursor: pointer; padding: 0; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;" onclick="triggerAccountsCsvUpload(); return false;">
        <img src="icons/CSV upload.svg" alt="CSV Upload" style="width: 28px; height: 28px; display: block; object-fit: contain;">
      </button>
    </div>
  `;
}

function renderAccountsTableHead() {
  const thead = document.getElementById('worklistTableHead');
  if (!thead) return;

  if (currentAccountsView === 'tds_receivable') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Payment Date</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['paymentDate'] ? 'has-active-filter' : ''}" data-filter-col="paymentDate" title="Filter Payment Date">&#9660;</button>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>PAN Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['panName'] ? 'has-active-filter' : ''}" data-filter-col="panName" title="Filter PAN Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>PAN Number</span>
        </th>
        <th style="width: 52ch; min-width: 52ch; max-width: 52ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>TDS Code</span>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>Taxable Amount</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>TDS Rate (%)</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>TDS Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsView === 'tds_payable') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Year</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['year'] ? 'has-active-filter' : ''}" data-filter-col="year" title="Filter Year">&#9660;</button>
          </div>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Quater</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['quarter'] ? 'has-active-filter' : ''}" data-filter-col="quarter" title="Filter Quarter">&#9660;</button>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>PAN Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['panName'] ? 'has-active-filter' : ''}" data-filter-col="panName" title="Filter PAN Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>PAN Number</span>
        </th>
        <th style="width: 52ch; min-width: 52ch; max-width: 52ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>TDS Code</span>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>Taxable Amount</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>TDS Rate (%)</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>Deducted Amount</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 8px;">
          <span>Paid Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsView === 'tds') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 8px 6px;">
          <span>Year</span>
        </th>
        <th rowspan="2" style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 8px 6px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Quater</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['quarter'] ? 'has-active-filter' : ''}" data-filter-col="quarter" title="Filter Quarter">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: center !important; vertical-align: middle; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 8px 6px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Month</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['month'] ? 'has-active-filter' : ''}" data-filter-col="month" title="Filter Month">&#9660;</button>
          </div>
        </th>
        <th colspan="4" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>TDS Receivable</span>
        </th>
        <th colspan="3" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>TDS Payable</span>
        </th>
      </tr>
      <tr class="master-view-header accounts-view-header tr-sub-headers">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>Taxable Amount</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>TDS Amount</span>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>TDS Receivable</span>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>TDS Credit Available</span>
        </th>
        <th style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>Taxable Amount</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>Deducted Amount</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 8px 6px;">
          <span>Paid Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsView === 'purchase') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Voucher No</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['voucherNo'] ? 'has-active-filter' : ''}" data-filter-col="voucherNo" title="Filter Voucher No">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Voucher Date</span>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Vendor Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorName'] ? 'has-active-filter' : ''}" data-filter-col="vendorName" title="Filter Vendor Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Invoice No</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceNo'] ? 'has-active-filter' : ''}" data-filter-col="invoiceNo" title="Filter Invoice No">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Invoice Date</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceDate'] ? 'has-active-filter' : ''}" data-filter-col="invoiceDate" title="Filter Invoice Date">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Invoice Amount</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceAmount'] ? 'has-active-filter' : ''}" data-filter-col="invoiceAmount" title="Filter Invoice Amount">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Paid Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsView === 'payment') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th rowspan="2" style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Transferred To</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['transferredTo'] ? 'has-active-filter' : ''}" data-filter-col="transferredTo" title="Filter Transferred To">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Request No</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['requestNo'] ? 'has-active-filter' : ''}" data-filter-col="requestNo" title="Filter Request No">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Expense Head</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['expenseHead'] ? 'has-active-filter' : ''}" data-filter-col="expenseHead" title="Filter Expense Head">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px; vertical-align: middle;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Transferred From</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['transferredFrom'] ? 'has-active-filter' : ''}" data-filter-col="transferredFrom" title="Filter Transferred From">&#9660;</button>
          </div>
        </th>
        <th colspan="3" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important; padding: 6px 10px;">
          <span>Amount</span>
        </th>
      </tr>
      <tr class="master-view-header accounts-view-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 6px 10px;">
          <span>Requested</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 6px 10px;">
          <span>Approved</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important; padding: 6px 10px;">
          <span>Transferred</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsView === 'receipt') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Receipt No</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Date</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['date'] ? 'has-active-filter' : ''}" data-filter-col="date" title="Filter Date">&#9660;</button>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Customer Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['customerName'] ? 'has-active-filter' : ''}" data-filter-col="customerName" title="Filter Customer Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Received Bank</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Amount</span>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Particulars</span>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Payment Reference No</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsView === 'bank') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Date</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['date'] ? 'has-active-filter' : ''}" data-filter-col="date" title="Filter Date">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Bank Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['bankName'] ? 'has-active-filter' : ''}" data-filter-col="bankName" title="Filter Bank Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 35ch; min-width: 35ch; max-width: 35ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Particulars</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['particulars'] ? 'has-active-filter' : ''}" data-filter-col="particulars" title="Filter Particulars">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Ref.No</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Withdrawal (Dr)</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Deposit (Cr)</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Balance</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsView === 'gst') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th rowspan="2" style="width: 60px; min-width: 60px; max-width: 60px; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Select</span>
        </th>
        <th rowspan="2" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; vertical-align: middle;">
          <span>Month</span>
        </th>
        <th colspan="4" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>GSTR 1A</span>
        </th>
        <th colspan="4" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>GSTR 2B</span>
        </th>
        <th colspan="4" style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-bottom: 1px solid #ffffff !important;">
          <span>RCM</span>
        </th>
      </tr>
      <tr class="master-view-header accounts-view-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Basic</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>CGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>SGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>IGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Basic</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>CGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>SGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>IGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>Basic</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>CGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>SGST</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; border-top: 1px solid #ffffff !important;">
          <span>IGST</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  if (currentAccountsSubpage === 'sales' || currentAccountsView === 'main') {
    thead.innerHTML = `
      <tr class="master-view-header accounts-view-header">
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Voucher No</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['voucherNo'] ? 'has-active-filter' : ''}" data-filter-col="voucherNo" title="Filter Voucher No">&#9660;</button>
          </div>
        </th>
        <th style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Customer Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['customerName'] ? 'has-active-filter' : ''}" data-filter-col="customerName" title="Filter Customer Name">&#9660;</button>
          </div>
        </th>
        <th style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Invoice No</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceNo'] ? 'has-active-filter' : ''}" data-filter-col="invoiceNo" title="Filter Invoice No">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Invoice Date</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceDate'] ? 'has-active-filter' : ''}" data-filter-col="invoiceDate" title="Filter Invoice Date">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <div class="th-content-wrap" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>Invoice Amount</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['invoiceAmount'] ? 'has-active-filter' : ''}" data-filter-col="invoiceAmount" title="Filter Invoice Amount">&#9660;</button>
          </div>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Deduction</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Receivable Amount</span>
        </th>
        <th style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
          <span>Received Amount</span>
        </th>
      </tr>
    `;
    rebindFilterButtons();
    return;
  }

  thead.innerHTML = `
    <tr class="master-view-header accounts-view-header">
      <th style="text-align: center !important; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; border: 1px solid #ffffff; padding: 6px 10px;">
        <span>${currentAccountsSubpage.toUpperCase()} Details</span>
      </th>
    </tr>
  `;
}

function renderAccountsFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;

  if (currentAccountsView === 'tds_payable' || currentAccountsView === 'tds_receivable') {
    footer.style.display = 'none';
    return;
  }

  if (currentAccountsView === 'tds') {
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-start';
    footer.style.alignItems = 'center';
    footer.style.width = '100%';
    footer.style.marginTop = 'auto';
    footer.style.padding = '24px';
    footer.innerHTML = `
      <div class="segmented-toggle-group accounts-segmented-group" style="display: inline-flex;">
        <button type="button" class="segmented-btn" data-tds-bottom-tab="payable">
          Payable
        </button>
        <div class="segmented-divider"></div>
        <button type="button" class="segmented-btn" data-tds-bottom-tab="receivable">
          Receivable
        </button>
      </div>
    `;

    footer.querySelectorAll('.segmented-btn[data-tds-bottom-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tds-bottom-tab');
        if (tab === 'payable') {
          openAccountsTdsPayablePage();
        } else {
          openAccountsTdsReceivablePage();
        }
      });
    });
    return;
  }

  const subpages = [
    { key: 'sales', label: 'Sales' },
    { key: 'purchase', label: 'Purchase' },
    { key: 'payment', label: 'Payment' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'bank', label: 'Bank' },
    { key: 'tds', label: 'TDS' },
    { key: 'gst', label: 'GST' }
  ];

  const currentActiveKey = (currentAccountsView === 'main' ? (currentAccountsSubpage || 'sales') : currentAccountsView);

  footer.style.display = 'flex';
  footer.style.justifyContent = 'flex-start';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';
  footer.style.marginTop = 'auto';
  footer.style.padding = '24px';
  footer.innerHTML = `
    <div class="segmented-toggle-group accounts-segmented-group">
      ${subpages.map((sp, idx) => `
        <button type="button" class="segmented-btn ${currentActiveKey === sp.key ? 'active' : ''}" data-accounts-subpage="${sp.key}">
          ${sp.label}
        </button>
        ${idx < subpages.length - 1 ? '<div class="segmented-divider"></div>' : ''}
      `).join('')}
    </div>
  `;

  footer.querySelectorAll('.segmented-btn[data-accounts-subpage]').forEach(btn => {
    btn.addEventListener('click', () => {
      const spKey = btn.getAttribute('data-accounts-subpage');
      if (spKey === 'sales') {
        currentModule = 'accounts';
        currentAccountsView = 'main';
        currentAccountsSubpage = 'sales';
        activeColumnFilters = {};
        updateURL();
        renderApp();
        showToast('Switched to Accounts • Sales Page');
        return;
      }
      if (spKey === 'tds') {
        openAccountsTdsPage();
        return;
      }
      if (spKey === 'purchase') {
        openAccountsPurchasePage();
        return;
      }
      if (spKey === 'payment') {
        openAccountsPaymentPage();
        return;
      }
      if (spKey === 'gst') {
        openAccountsGstPage();
        return;
      }
      if (spKey === 'bank') {
        openAccountsBankPage();
        return;
      }
      if (spKey === 'receipt') {
        openAccountsReceiptPage();
        return;
      }
      if (currentAccountsSubpage !== spKey) {
        currentAccountsSubpage = spKey;
        activeColumnFilters = {};
        updateURL();
        renderApp();
        showToast(`Switched to Accounts &bull; ${btn.textContent.trim()} Page`);
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
  } else if (currentWorklistView === 'purchase_payment') {
    const detail = purchaseDetailData[selectedPurchasePayId || 'pay-2'] || purchaseDetailData['pay-2'];
    currentDataset = detail.lineItems || [];
  } else if (currentWorklistView === 'employee_payment') {
    const empDetail = employeeDetailData[selectedEmployeePayId || 'pay-3'] || employeeDetailData['pay-3'];
    currentDataset = empDetail.lineItems || [];
  } else if (currentWorklistView === 'transport_payment') {
    const transDetail = transportDetailData[selectedTransportPayId || 'pay-4'] || transportDetailData['pay-4'];
    currentDataset = transDetail.lineItems || [];
  } else if (currentWorklistView === 'accounts_payment') {
    const accDetail = accountsDetailData[selectedAccountsPayId || 'pay-6'] || accountsDetailData['pay-6'];
    currentDataset = accDetail.lineItems || [];
  } else if (currentWorklistView === 'admin_payment') {
    const adminDetail = adminDetailData[selectedAdminPayId || 'pay-5'] || adminDetailData['pay-5'];
    currentDataset = adminDetail.lineItems || [];
  } else if (currentWorklistView === 'statutory_payment') {
    const statutoryDetail = statutoryDetailData[selectedStatutoryPayId || 'pay-7'] || statutoryDetailData['pay-7'];
    currentDataset = statutoryDetail.lineItems || [];
  } else if (currentWorklistView === 'po_supplier') {
    currentDataset = poSupplierItems;
  } else if (currentWorklistView === 'po_rfq_compare') {
    currentDataset = poRfqCompareItems;
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
          <span style="font-size: 15px; font-weight: 700; color: #0454e4; letter-spacing: 0.3px;">12,00,000.00</span>
        </div>

        <!-- Stat 2: Validated / Paid -->
        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">10,00,000.00</span>
        </div>

        <!-- Stat 3: Balance / Payable (Red Payable) placed on left side near Green Paid -->
        <div class="metric-item metric-balance" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Payable.svg" alt="Payable" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #dc2626; letter-spacing: 0.3px;">2,00,000.00</span>
        </div>
      </div>

      <!-- Right Action Icons Group: Bank icon static, and when row selected: Edit, Approve, Notes -->
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        <button type="button" class="toolbar-icon-btn" title="Bank Details" onclick="openProjectPaymentBankModal()">
          <img src="icons/Bank.svg" alt="Bank" width="28" height="28">
        </button>
        ${hasSelected ? `
        <button type="button" class="toolbar-icon-btn btn-project-payment-edit" id="btnProjectPaymentEdit" title="${isProjectPaymentEditing ? 'Save Changes' : 'Edit Details'}" onclick="toggleProjectPaymentEditMode()">
          <img src="${isProjectPaymentEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isProjectPaymentEditing ? 'Save' : 'Edit'}" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="approveSelectedProjectPaymentRows()">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Notes & Remarks" onclick="openProjectPaymentNotesModal()">
          <img src="icons/Notes _ Remarks 2.svg" alt="Notes" width="28" height="28">
        </button>
        ` : ''}
      </div>
    `;
    return;
  } else if (currentWorklistView === 'purchase_payment') {
    const detail = purchaseDetailData[selectedPurchasePayId || 'pay-2'] || purchaseDetailData['pay-2'];
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>

        <!-- Stat 1: Summation Total -->
        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #0454e4; letter-spacing: 0.3px;">${detail.totalAmt || '12,00,000.00'}</span>
        </div>

        <!-- Stat 2: Validated / Paid -->
        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">${detail.paidAmt || '10,00,000.00'}</span>
        </div>
      </div>

      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
      </div>
    `;
    return;
  } else if (currentWorklistView === 'employee_payment') {
    const empDetail = employeeDetailData[selectedEmployeePayId || 'pay-3'] || employeeDetailData['pay-3'];
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>

        <!-- Stat 1: Summation Total -->
        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #0454e4; letter-spacing: 0.3px;">${empDetail.totalAmt || '12,00,000.00'}</span>
        </div>

        <!-- Stat 2: Validated / Paid -->
        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">${empDetail.paidAmt || '10,00,000.00'}</span>
        </div>

        <!-- Stat 3: Balance / Payable (Red Payable) placed on left side near Green Paid -->
        <div class="metric-item metric-balance" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Payable.svg" alt="Payable" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #dc2626; letter-spacing: 0.3px;">${empDetail.payableAmt || '2,00,000.00'}</span>
        </div>
      </div>

      <!-- Right Side: Only Edit, Tick (Approve), Remarks when row is selected -->
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        ${hasSelected ? `
        <button type="button" class="toolbar-icon-btn btn-subpage-edit" title="${isSubpageEditing ? 'Save Changes' : 'Edit Details'}" onclick="toggleSubpageEditMode()">
          <img src="${isSubpageEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isSubpageEditing ? 'Save' : 'Edit'}" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="approveSelectedSubpageRows()">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Notes & Remarks" onclick="openProjectPaymentNotesModal()">
          <img src="icons/Notes _ Remarks 2.svg" alt="Notes" width="28" height="28">
        </button>
        ` : ''}
      </div>
    `;
    return;
  } else if (currentWorklistView === 'transport_payment') {
    const transDetail = transportDetailData[selectedTransportPayId || 'pay-4'] || transportDetailData['pay-4'];
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>

        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #0454e4; letter-spacing: 0.3px;">${transDetail.totalAmt || '12,00,000.00'}</span>
        </div>

        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">${transDetail.paidAmt || '10,00,000.00'}</span>
        </div>

        <div class="metric-item metric-balance" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Payable.svg" alt="Payable" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #dc2626; letter-spacing: 0.3px;">${transDetail.payableAmt || '2,00,000.00'}</span>
        </div>
      </div>

      <!-- Right Side: Only Edit, Tick (Approve), Remarks when row is selected -->
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        ${hasSelected ? `
        <button type="button" class="toolbar-icon-btn btn-subpage-edit" title="${isSubpageEditing ? 'Save Changes' : 'Edit Details'}" onclick="toggleSubpageEditMode()">
          <img src="${isSubpageEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isSubpageEditing ? 'Save' : 'Edit'}" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="approveSelectedSubpageRows()">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Notes & Remarks" onclick="openProjectPaymentNotesModal()">
          <img src="icons/Notes _ Remarks 2.svg" alt="Notes" width="28" height="28">
        </button>
        ` : ''}
      </div>
    `;
    return;
  } else if (currentWorklistView === 'accounts_payment') {
    const accDetail = accountsDetailData[selectedAccountsPayId || 'pay-6'] || accountsDetailData['pay-6'];
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>
        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #0454e4; letter-spacing: 0.3px;">${accDetail.totalAmt || '12,00,000.00'}</span>
        </div>
        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">${accDetail.paidAmt || '10,00,000.00'}</span>
        </div>
        <div class="metric-item metric-balance" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Payable.svg" alt="Payable" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #dc2626; letter-spacing: 0.3px;">${accDetail.payableAmt || '2,00,000.00'}</span>
        </div>
      </div>
      <!-- Right Side: Only Edit, Tick (Approve), Remarks when row is selected -->
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        ${hasSelected ? `
        <button type="button" class="toolbar-icon-btn btn-subpage-edit" title="${isSubpageEditing ? 'Save Changes' : 'Edit Details'}" onclick="toggleSubpageEditMode()">
          <img src="${isSubpageEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isSubpageEditing ? 'Save' : 'Edit'}" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="approveSelectedSubpageRows()">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Notes & Remarks" onclick="openProjectPaymentNotesModal()">
          <img src="icons/Notes _ Remarks 2.svg" alt="Notes" width="28" height="28">
        </button>
        ` : ''}
      </div>
    `;
    return;
  } else if (currentWorklistView === 'admin_payment') {
    const adminDetail = adminDetailData[selectedAdminPayId || 'pay-5'] || adminDetailData['pay-5'];
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>
        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #0454e4; letter-spacing: 0.3px;">${adminDetail.totalAmt || '12,00,000.00'}</span>
        </div>
        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">${adminDetail.paidAmt || '10,00,000.00'}</span>
        </div>
        <div class="metric-item metric-balance" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Payable.svg" alt="Payable" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #dc2626; letter-spacing: 0.3px;">${adminDetail.payableAmt || '2,00,000.00'}</span>
        </div>
      </div>
      <!-- Right Side: Only Edit, Tick (Approve), Remarks when row is selected -->
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        ${hasSelected ? `
        <button type="button" class="toolbar-icon-btn btn-subpage-edit" title="${isSubpageEditing ? 'Save Changes' : 'Edit Details'}" onclick="toggleSubpageEditMode()">
          <img src="${isSubpageEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isSubpageEditing ? 'Save' : 'Edit'}" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="approveSelectedSubpageRows()">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Notes & Remarks" onclick="openProjectPaymentNotesModal()">
          <img src="icons/Notes _ Remarks 2.svg" alt="Notes" width="28" height="28">
        </button>
        ` : ''}
      </div>
    `;
    return;
  } else if (currentWorklistView === 'statutory_payment') {
    const statutoryDetail = statutoryDetailData[selectedStatutoryPayId || 'pay-7'] || statutoryDetailData['pay-7'];
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>
        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #0454e4; letter-spacing: 0.3px;">${statutoryDetail.totalAmt || '12,00,000.00'}</span>
        </div>
        <div class="metric-item metric-validated" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Paid _ Received.svg" alt="Paid" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #16a34a; letter-spacing: 0.3px;">${statutoryDetail.paidAmt || '10,00,000.00'}</span>
        </div>
        <div class="metric-item metric-balance" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/Payable.svg" alt="Payable" width="28" height="28" style="vertical-align: middle;">
          <span style="font-size: 15px; font-weight: 700; color: #dc2626; letter-spacing: 0.3px;">${statutoryDetail.payableAmt || '2,00,000.00'}</span>
        </div>
      </div>
      <!-- Right Side: Only Edit, Tick (Approve), Remarks when row is selected -->
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        ${hasSelected ? `
        <button type="button" class="toolbar-icon-btn btn-subpage-edit" title="${isSubpageEditing ? 'Save Changes' : 'Edit Details'}" onclick="toggleSubpageEditMode()">
          <img src="${isSubpageEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isSubpageEditing ? 'Save' : 'Edit'}" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="approveSelectedSubpageRows()">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Notes & Remarks" onclick="openProjectPaymentNotesModal()">
          <img src="icons/Notes _ Remarks 2.svg" alt="Notes" width="28" height="28">
        </button>
        ` : ''}
      </div>
    `;
    return;
  } else if (currentWorklistView === 'po_supplier') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>
        <div class="metric-item metric-total" style="display: flex; align-items: center; gap: 8px;">
          <img src="icons/summation.svg" alt="Total Sum" width="28" height="28" style="vertical-align: middle;">
        </div>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        <img src="icons/sync.svg" alt="Sync" width="26" height="26" class="icon-blue-filter" style="cursor: pointer;" onclick="openWorklistPoRfqCompare()" title="Compare RFQ / Vendors">
        ${hasSelected ? `
        <button type="button" class="toolbar-icon-btn" id="btnPoSupplierEditToggle" onclick="togglePoSupplierEditMode()" title="${isPoSupplierEditing ? 'Save' : 'Edit'}" aria-label="${isPoSupplierEditing ? 'Save' : 'Edit'}">
          <img src="${isPoSupplierEditing ? 'icons/Save.svg' : 'icons/Edit.svg'}" alt="${isPoSupplierEditing ? 'Save' : 'Edit'}" class="toolbar-icon-img" width="28" height="28">
        </button>
        <button type="button" class="toolbar-icon-btn" title="Approve" onclick="approveSelectedPoSupplierRows()">
          <img src="icons/Approve.svg" alt="Approve" width="28" height="28">
        </button>
        ` : ''}
      </div>
    `;
    return;
  } else if (currentWorklistView === 'po_rfq_compare') {
    toolbar.innerHTML = `
      <div class="toolbar-left" style="display: flex; align-items: center; gap: 24px;">
        <div style="display: inline-flex; align-items: center;">
          ${universalBackBtnHtml}
        </div>
      </div>
      <div class="toolbar-right" style="display: flex; align-items: center; gap: 16px;">
        <button type="button" class="toolbar-icon-btn" title="Edit" onclick="showToast('RFQ Comparison Edit mode')">
          <img src="icons/Edit.svg" alt="Edit" width="24" height="24">
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

function renderWorklistFooter() {
  const footer = document.getElementById('worklistFooterBar');
  if (!footer) return;

  if (currentWorklistView === 'po_rfq_compare') {
    footer.innerHTML = '';
    footer.style.display = 'none';
    return;
  }

  if (currentWorklistView === 'po_supplier') {
    footer.style.display = 'flex';
    footer.style.justifyContent = 'center';
    footer.style.alignItems = 'center';
    footer.style.width = '100%';
    footer.style.setProperty('margin-top', '12px', 'important');
    footer.style.setProperty('padding', '12px 0 16px 0', 'important');
    footer.innerHTML = `
      <button type="button" class="toolbar-icon-btn btn-submit-action" id="btnPoSupplierSubmit" aria-label="Submit" onclick="submitPoSupplier()" style="cursor: pointer; background: transparent; border: none; padding: 6px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        <img src="icons/Submit.svg" alt="Submit" width="32" height="32">
      </button>
    `;
    return;
  }

  if ((currentWorklistView.endsWith('_payment') && currentWorklistView !== 'payment') || currentWorklistView === 'project_payment' || currentWorklistView === 'purchase_payment' || currentWorklistView === 'employee_payment' || currentWorklistView === 'transport_payment' || currentWorklistView === 'accounts_payment' || currentWorklistView === 'admin_payment' || currentWorklistView === 'statutory_payment') {
    footer.style.display = 'flex';
    footer.style.justifyContent = 'center';
    footer.style.alignItems = 'center';
    footer.style.width = '100%';
    footer.style.setProperty('margin-top', '12px', 'important');
    footer.style.setProperty('padding', '12px 0 16px 0', 'important');
    footer.innerHTML = `
      <button type="button" class="toolbar-icon-btn btn-submit-action" id="btnPaymentSubpageSubmit" aria-label="Submit" onclick="openTransferDetailsModal()" style="cursor: pointer; background: transparent; border: none; padding: 6px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        <img src="icons/Submit.svg" alt="Submit" width="32" height="32">
      </button>
    `;
    return;
  }

  footer.style.display = 'flex';
  footer.style.justifyContent = 'flex-start';
  footer.style.alignItems = 'center';
  footer.style.width = '100%';
  footer.style.marginTop = 'auto';
  footer.style.padding = '24px';
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
  } else if (currentWorklistView === 'purchase_payment') {
    thead.innerHTML = `
      <tr class="project-payment-header-row1">
        <th style="width: 90px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">HSN Code</th>
        <th style="width: 200px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Description</th>
        <th style="width: 65px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Uom</th>
        <th style="width: 70px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">PO Qty</th>
        <th style="width: 90px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Invoice Qty</th>
        <th style="width: 90px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">GRN Qty</th>
        <th style="width: 80px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Rate</th>
        <th style="width: 110px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Basic Amount</th>
        <th style="width: 100px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">GST Amount</th>
        <th style="width: 110px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Total Amount</th>
      </tr>
    `;
  } else if (currentWorklistView === 'employee_payment') {
    thead.innerHTML = `
      <tr class="project-payment-header-row1">
        <th rowspan="2" style="width: 70px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Select</th>
        <th rowspan="2" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 12px;">Description</th>
        <th colspan="3" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Amount</th>
      </tr>
      <tr class="project-payment-header-row2">
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Request</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Validated</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Approved</th>
      </tr>
    `;
  } else if (currentWorklistView === 'transport_payment') {
    thead.innerHTML = `
      <tr class="project-payment-header-row1">
        <th rowspan="2" style="width: 70px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Select</th>
        <th rowspan="2" style="width: 100px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Vehicle Type</th>
        <th rowspan="2" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 12px;">Description</th>
        <th rowspan="2" style="width: 25ch; max-width: 25ch; min-width: 25ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">From</th>
        <th rowspan="2" style="width: 25ch; max-width: 25ch; min-width: 25ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">To</th>
        <th colspan="3" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Amount</th>
      </tr>
      <tr class="project-payment-header-row2">
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Request</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Validated</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Approved</th>
      </tr>
    `;
  } else if (currentWorklistView === 'accounts_payment' || currentWorklistView === 'admin_payment' || currentWorklistView === 'statutory_payment') {
    thead.innerHTML = `
      <tr class="project-payment-header-row1">
        <th rowspan="2" style="width: 70px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Select</th>
        <th rowspan="2" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 12px;">Description</th>
        <th colspan="3" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Amount</th>
      </tr>
      <tr class="project-payment-header-row2">
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Request</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Validated</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Approved</th>
      </tr>
    `;
  } else if (currentWorklistView === 'po_supplier') {
    thead.innerHTML = `
      <tr class="project-payment-header-row1">
        <th rowspan="2" style="width: 70px; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Select</th>
        <th rowspan="2" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 12px;">Material Description</th>
        <th rowspan="2" style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Uom</th>
        <th colspan="2" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Qty</th>
        <th colspan="2" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Rate</th>
        <th colspan="3" style="background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff;">Amount</th>
      </tr>
      <tr class="project-payment-header-row2">
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Stock</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">PR</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Existing</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">New</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Basic</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">GST</th>
        <th style="width: 15ch; max-width: 15ch; min-width: 15ch; background-color: #8c9399 !important; color: #ffffff !important; font-weight: 700; text-align: center !important; border: 1px solid #ffffff; padding: 6px 10px; white-space: nowrap;">Total</th>
      </tr>
    `;
  } else if (currentWorklistView === 'po_rfq_compare') {
    thead.innerHTML = `
      <tr class="project-payment-header-row1">
        <th rowspan="2" style="width: 180px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; vertical-align: middle; border: 1px solid #ffffff; text-align: center;">Material Description</th>
        <th rowspan="2" style="width: 60px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; vertical-align: middle; border: 1px solid #ffffff; text-align: center;">Uom</th>
        <th colspan="4" style="background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Vendor 1 Name</th>
        <th colspan="4" style="background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Vendor 2 Name</th>
        <th colspan="4" style="background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Vendor 3 Name</th>
      </tr>
      <tr class="project-payment-header-row2">
        <th style="width: 80px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Rate</th>
        <th style="width: 90px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Amount</th>
        <th style="width: 70px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">GST</th>
        <th style="width: 90px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Total</th>
        <th style="width: 80px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Rate</th>
        <th style="width: 90px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Amount</th>
        <th style="width: 70px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">GST</th>
        <th style="width: 90px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Total</th>
        <th style="width: 80px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Rate</th>
        <th style="width: 90px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Amount</th>
        <th style="width: 70px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">GST</th>
        <th style="width: 90px; background-color: #9e9e9e !important; color: #ffffff !important; font-weight: 700; text-align: center; border: 1px solid #ffffff;">Total</th>
      </tr>
    `;
  } else if (currentWorklistView === 'po') {
    thead.innerHTML = `
      <tr class="po-view-header">
        <th class="th-select">Select</th>
        <th>
          <div class="th-content-wrap">
            <span>Vendor Name</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['vendorName'] ? 'has-active-filter' : ''}" data-filter-col="vendorName" title="Filter Vendor Name">&#9660;</button>
          </div>
        </th>
        <th>Submission Date</th>
        <th>
          <div class="th-content-wrap">
            <span>Submitted BY</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['submittedBy'] ? 'has-active-filter' : ''}" data-filter-col="submittedBy" title="Filter Submitted BY">&#9660;</button>
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
        <th rowspan="2" style="width: 30ch; max-width: 30ch; min-width: 30ch; text-align: left !important;">
          <div class="th-content-wrap" style="justify-content: flex-start;">
            <span>Submit By</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['submitBy'] ? 'has-active-filter' : ''}" data-filter-col="submitBy" title="Filter Submit By">&#9660;</button>
          </div>
        </th>
        <th rowspan="2" style="white-space: nowrap; width: 140px; text-align: center;">Submission Date</th>
        <th rowspan="2" style="width: 30ch; max-width: 30ch; min-width: 30ch; text-align: left !important;">
          <div class="th-content-wrap" style="justify-content: flex-start;">
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
        <th rowspan="2" style="width: 30ch; max-width: 30ch; min-width: 30ch; text-align: left !important;">
          <div class="th-content-wrap" style="justify-content: flex-start;">
            <span>Transfer To</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['transferTo'] ? 'has-active-filter' : ''}" data-filter-col="transferTo" title="Filter Transfer To">&#9660;</button>
          </div>
        </th>
        <th colspan="3" class="th-amount-group" style="text-align: center;">Amount</th>
        <th rowspan="2">
          <div class="th-content-wrap">
            <span>Ageing</span>
            <button type="button" class="filter-funnel-btn ${activeColumnFilters['ageing'] ? 'has-active-filter' : ''}" data-filter-col="ageing" title="Filter Ageing">&#9660;</button>
          </div>
        </th>
      </tr>
      <tr class="tr-sub-headers payment-view-header">
        <th style="text-align: right !important; padding-right: 14px;">Approved</th>
        <th style="text-align: right !important; padding-right: 14px;">Transferred</th>
        <th style="text-align: right !important; padding-right: 14px;">Payable</th>
      </tr>
    `;
  }
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

  if (currentWorklistView === 'po_rfq_compare') {
    tbody.innerHTML = `
      <tr>
        <td style="height: 38px;">&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `;
    return;
  }

  if (filteredDataset.length === 0) {
    const colSpan = currentModule === 'admin'
      ? (currentAdminView === 'salary_detail' ? 16 : (currentAdminView === 'epf' ? 9 : (currentAdminView === 'pt' ? 9 : (currentAdminView === 'lwf' ? 8 : (currentAdminView === 'esi' ? 8 : (currentAdminView === 'attendance' ? 38 : 8))))))
      : (currentModule === 'accounts'
        ? (currentAccountsView === 'gst' ? 14 : (currentAccountsView === 'tds_payable' ? 9 : (currentAccountsView === 'tds_receivable' ? 7 : (currentAccountsView === 'tds' ? 10 : (currentAccountsView === 'purchase' ? 8 : (currentAccountsView === 'payment' ? 8 : (currentAccountsView === 'receipt' ? 7 : (currentAccountsView === 'bank' ? 7 : 8))))))))
        : (currentModule === 'inventory'
          ? 8
          : (currentModule === 'purchase'
            ? 9
            : (currentModule === 'projects'
              ? 14
              : (currentModule === 'indus_towers'
                ? (currentIndusSubpage === 'projects' ? 8 : 10)
                : (currentModule === 'master' ? (currentMasterView === 'hr_policies' ? 11 : (currentMasterSubpage === 'customer' ? 7 : 6)) : (currentWorklistView === 'po' ? 6 : 10)))))));
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
    if (currentMasterView === 'hr_policies') {
      if (currentCompanyHrTab === 'epf') {
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}" onclick="openCompanyHrEpfModal('${row.id}')" style="border-bottom: 1px solid #e2e8f0; cursor: pointer;">
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.from || ''}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.to || ''}</td>
              <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.fillingFrequency || ''}</td>
              <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.fillingDueDate || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.sealingAmount || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employee || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.epf || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.eps || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.edli || ''}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.adminCharges || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap;">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status || 'Active'}</span>
              </td>
            </tr>
          `;
        }).join('');
        return;
      } else {
        tbody.innerHTML = filteredDataset.map(row => {
          const isInactive = (row.status || '').toLowerCase().includes('in');
          return `
            <tr data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.from || ''}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.to || ''}</td>
              <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.fillingFrequency || ''}</td>
              <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.fillingDueDate || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.sealingAmount || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employee || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.epf || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.eps || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.edli || ''}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.adminCharges || ''}</td>
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap;">
                <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status || 'Active'}</span>
              </td>
            </tr>
          `;
        }).join('');
        return;
      }
    }
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
      // Render Vendor Rows: Vendor Name (30ch&left), Business Type (15ch&center), Service Type (15ch&center), GST Number (20ch&center), PAN Number (15ch&center), GST Type (10ch&center), Status (10ch&center)
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        const vName = row.vendorName || '';
        return `
          <tr data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
            <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${vName.replace(/"/g, '&quot;')}">
              <a href="#" class="req-link td-link-blue" onclick="openViewVendorCard('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${vName}</a>
            </td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.businessType || row.vendorType || '').replace(/"/g, '&quot;')}">${row.businessType || row.vendorType || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.serviceType || '').replace(/"/g, '&quot;')}">${row.serviceType || ''}</td>
            <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500; font-family: monospace;">${row.gstNumber || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500; font-family: monospace;">${row.panNumber || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstType || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap;">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status || 'Active'}</span>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentMasterSubpage === 'products') {
      // Render Products Rows: Product Name 40ch, Product Category 20ch, Product Code 15ch, HSN Code 10ch, GST 10ch, Price 10ch
      tbody.innerHTML = filteredDataset.map(row => {
        return `
          <tr data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
            <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.productName || row.productHead || '').replace(/"/g, '&quot;')}">
              <a href="#" class="req-link td-link-blue" onclick="openViewProductCard('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.productName || row.productHead || ''}</a>
            </td>
            <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.productCategory || row.category || 'Telecom').replace(/"/g, '&quot;')}">${row.productCategory || row.category || 'Telecom'}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500; font-family: monospace;">${row.productCode || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.hsnCode || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gst || row.gstRate || '18%'}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 10px; white-space: nowrap; color: #0454e4; font-weight: 500;">
              <a href="#" class="req-link td-link-blue" onclick="openProductPriceTab('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.price || row.stockPrices || ''}</a>
            </td>
          </tr>
        `;
      }).join('');
    } else if (currentMasterSubpage === 'expenses') {
      // Render Expenses Rows: Expense Name 40ch&left, Expense Category 20ch&center, Expense Head 20ch&center, GST 10ch&center, Status 10ch&center
      tbody.innerHTML = filteredDataset.map(row => {
        const isInactive = (row.status || '').toLowerCase().includes('in');
        const expTitle = row.expenseName || row.expenseDescription || row.expenseHead || '';
        return `
          <tr data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
            <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${expTitle.replace(/"/g, '&quot;')}">
              <a href="#" class="req-link td-link-blue" onclick="openViewExpenseCard('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${expTitle}</a>
            </td>
            <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.expenseCategory || 'Direct Operations').replace(/"/g, '&quot;')}">${row.expenseCategory || 'Direct Operations'}</td>
            <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.expenseHead || '').replace(/"/g, '&quot;')}">${row.expenseHead || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gst || row.gstRate || '18%'}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap;">
              <span class="status-badge ${isInactive ? 'status-inactive' : 'status-active'}">${row.status || 'Active'}</span>
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
        const isApproved = row.approved && isSelected;
        const rowClass = 'project-payment-row' + (isApproved ? ' row-approved-permanently' : (isSelected ? ' row-selected' : ''));
        if (isProjectPaymentEditing) {
          return `
            <tr class="${rowClass}" data-row-id="${row.id || idx}">
              <td class="td-select td-center">
                <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="toggleProjectPaymentRowSelect('${row.id}')" aria-label="Select row"></div>
              </td>
              <td class="td-center" style="font-weight: 500;">${row.expenseType || ''}</td>
              <td>
                ${row.boqName ? `<a href="#" class="boq-link" onclick="showToast('BOQ: ${row.boqName}'); return false;">${row.boqName}</a>` : ''}
              </td>
              <td class="td-center">${row.uom || ''}</td>
              <td class="td-center">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="qty" value="${row.qty || ''}" placeholder="Qty" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: center; cursor: text;">
              </td>
              <td class="td-amount">${row.rateRequested || ''}</td>
              <td class="td-amount">${row.rateValidated || ''}</td>
              <td class="td-amount">
                <input type="text" class="project-table-edit-input" data-row-id="${row.id}" data-field="rateApproved" value="${row.rateApproved || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              </td>
              <td class="td-amount">${row.amountBasic || ''}</td>
              <td class="td-amount">${row.amountGst || ''}</td>
              <td class="td-amount">${row.amountTotal || ''}</td>
            </tr>
          `;
        } else {
          return `
            <tr class="${rowClass}" data-row-id="${row.id || idx}">
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
    } else if (currentWorklistView === 'purchase_payment') {
      const validItems = (filteredDataset || []).filter(item => (item.description && item.description.trim() !== '') || (item.hsnCode && item.hsnCode.trim() !== ''));
      if (validItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 24px; color: #94a3b8;">No line items available</td></tr>`;
      } else {
        tbody.innerHTML = validItems.map(item => {
          return `
          <tr data-row-id="${item.id}">
            <td class="td-center" style="padding: 8px 10px;">${item.hsnCode || ''}</td>
            <td style="padding: 8px 12px; font-weight: 500; color: #4338ca; text-align: left;">
              ${item.description || ''}
            </td>
            <td class="td-center" style="padding: 8px 10px;">${item.uom || ''}</td>
            <td class="td-center" style="padding: 8px 10px;">${item.poQty || ''}</td>
            <td class="td-center" style="padding: 8px 10px;">${item.invoiceQty || ''}</td>
            <td class="td-center" style="padding: 8px 10px;">${item.grnQty || ''}</td>
            <td class="td-amount" style="padding: 8px 10px; text-align: right !important;">${item.rate || ''}</td>
            <td class="td-amount" style="padding: 8px 10px; text-align: right !important;">${item.basicAmt || ''}</td>
            <td class="td-amount" style="padding: 8px 10px; text-align: right !important;">${item.gstAmt || ''}</td>
            <td class="td-amount" style="padding: 8px 10px; text-align: right !important; font-weight: 600;">${item.totalAmt || ''}</td>
          </tr>
        `;
        }).join('');
      }
    } else if (currentWorklistView === 'employee_payment') {
      const empItems = (filteredDataset || []).filter(item => (item.description && item.description.trim() !== ''));
      if (empItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: #94a3b8;">No line items available</td></tr>`;
      } else {
        tbody.innerHTML = empItems.map(item => {
          const isSelected = item.selected;
          return `
          <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${item.id}">
            <td class="td-select td-center">
              <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="toggleSubpageRowSelect('${item.id}')" aria-label="Select row"></div>
            </td>
            <td style="padding: 8px 12px; font-weight: 500; color: #4338ca; text-align: left;">${item.description || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtRequest || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtValidated || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtApproved || ''}</td>
          </tr>
        `;
        }).join('');
      }
    } else if (currentWorklistView === 'transport_payment') {
      const transItems = (filteredDataset || []).filter(item => (item.description && item.description.trim() !== '') || (item.vehicleType && item.vehicleType.trim() !== ''));
      if (transItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8;">No line items available</td></tr>`;
      } else {
        tbody.innerHTML = transItems.map(item => {
          const isSelected = item.selected;
          return `
          <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${item.id}">
            <td class="td-select td-center">
              <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="toggleSubpageRowSelect('${item.id}')" aria-label="Select row"></div>
            </td>
            <td class="td-center" style="padding: 8px 10px;">${item.vehicleType || ''}</td>
            <td style="padding: 8px 12px; font-weight: 500; color: #4338ca; text-align: left;">${item.description || ''}</td>
            <td style="width: 25ch; max-width: 25ch; min-width: 25ch; padding: 8px 10px; text-align: left !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.from || ''}</td>
            <td style="width: 25ch; max-width: 25ch; min-width: 25ch; padding: 8px 10px; text-align: left !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.to || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtRequest || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtValidated || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtApproved || ''}</td>
          </tr>
        `;
        }).join('');
      }
    } else if (currentWorklistView === 'accounts_payment' || currentWorklistView === 'admin_payment' || currentWorklistView === 'statutory_payment') {
      const subItems = (filteredDataset || []).filter(item => (item.description && item.description.trim() !== '') || (item.expenseType && item.expenseType.trim() !== ''));
      if (subItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: #94a3b8;">No line items available</td></tr>`;
      } else {
        tbody.innerHTML = subItems.map(item => {
          const isSelected = item.selected;
          return `
          <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${item.id}">
            <td class="td-select td-center">
              <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="toggleSubpageRowSelect('${item.id}')" aria-label="Select row"></div>
            </td>
            <td style="padding: 8px 12px; font-weight: 500; color: #4338ca; text-align: left;">${item.description || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtRequest || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtValidated || ''}</td>
            <td class="td-amount" style="width: 15ch; max-width: 15ch; min-width: 15ch; padding: 8px 10px; text-align: right !important; white-space: nowrap;">${item.amtApproved || ''}</td>
          </tr>
        `;
        }).join('');
      }
    } else if (currentWorklistView === 'po_supplier') {
      tbody.innerHTML = filteredDataset.map((row, idx) => {
        const isSelected = row.selected;
        return `
          <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${row.id || idx}">
            <td class="td-select td-center">
              <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="togglePoSupplierRowSelect('${row.id}')" aria-label="Select row"></div>
            </td>
            <td style="padding: 8px 12px; font-weight: 500; text-align: left !important;">${row.materialDescription || ''}</td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">${row.uom || ''}</td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">${row.stock || ''}</td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">
              ${isPoSupplierEditing ? `
                <input type="text" class="po-supplier-edit-input" data-row-id="${row.id}" data-field="pr" value="${row.pr || ''}" placeholder="0" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              ` : `${row.pr || ''}`}
            </td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">${row.existing || ''}</td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">
              ${isPoSupplierEditing ? `
                <input type="text" class="po-supplier-edit-input" data-row-id="${row.id}" data-field="newRate" value="${row.newRate || ''}" placeholder="0.00" style="width: 100%; height: 30px; padding: 3px 8px; font-size: 0.88rem; font-family: inherit; color: #000000; background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 4px !important; outline: none !important; box-shadow: none !important; box-sizing: border-box; text-align: right; cursor: text;">
              ` : `${row.newRate || ''}`}
            </td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">${row.basic || ''}</td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">${row.gst || ''}</td>
            <td style="width: 15ch; max-width: 15ch; min-width: 15ch; text-align: right !important; padding: 8px 10px; white-space: nowrap;">${row.total || ''}</td>
          </tr>
        `;
      }).join('');
    } else if (currentWorklistView === 'po_rfq_compare') {
      tbody.innerHTML = `
        <tr>
          <td style="height: 38px;">&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      `;
    } else if (currentWorklistView === 'po') {
      tbody.innerHTML = filteredDataset.map(row => {
        const isSelected = row.selected;
        return `
          <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${row.id}">
            <td class="td-select">
              <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="selectRow('${row.id}')" aria-label="Select row"></div>
            </td>
            <td>
              <a href="#" class="req-link td-link-blue" onclick="openWorklistPoSupplier('${row.vendorName}', '${row.poNo}'); return false;">${row.vendorName}</a>
            </td>
            <td class="td-center">${row.submissionDate}</td>
            <td style="color: #000000; font-weight: 400;">${row.submittedBy}</td>
            <td class="td-center">${row.poNo}</td>
            <td class="td-amount">${row.poAmount}</td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = filteredDataset.map(row => {
        const isSelected = row.selected;
        const isProject = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'project');
        const isPurchase = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'purchase');
        const isEmployee = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'employee');
        const isTransport = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'transport');
        const isAccounts = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'accounts');
        const isAdmin = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'admin');
        const isStatutory = (row.expenseHead && row.expenseHead.trim().toLowerCase() === 'statutory');
        return `
          <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${row.id}">
            <td class="td-select">
              <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="selectRow('${row.id}')" aria-label="Select row"></div>
            </td>
            <td style="width: 30ch; max-width: 30ch; min-width: 30ch; text-align: left !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${isProject 
                ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistProjectPayment('${row.submitBy}', '${row.id}'); return false;">${row.submitBy}</a>`
                : isPurchase
                  ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistPurchasePayment('${row.id}'); return false;">${row.submitBy}</a>`
                  : isEmployee
                    ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistEmployeePayment('${row.id}'); return false;">${row.submitBy}</a>`
                    : isTransport
                      ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistTransportPayment('${row.id}'); return false;">${row.submitBy}</a>`
                      : isAccounts
                        ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistAccountsPayment('${row.id}'); return false;">${row.submitBy}</a>`
                        : isAdmin
                          ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistAdminPayment('${row.id}'); return false;">${row.submitBy}</a>`
                          : isStatutory
                            ? `<a href="#" class="req-link clickable-project-link" onclick="openWorklistStatutoryPayment('${row.id}'); return false;">${row.submitBy}</a>`
                            : `<span>${row.submitBy}</span>`
              }
            </td>
            <td class="td-center" style="white-space: nowrap; width: 140px;">${row.submissionDate}</td>
            <td style="width: 30ch; max-width: 30ch; min-width: 30ch; text-align: left !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${row.approvedBy}</td>
            <td>${row.expenseHead}</td>
            <td style="width: 30ch; max-width: 30ch; min-width: 30ch; text-align: left !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${row.transferTo}</td>
            <td class="td-amount" style="text-align: right !important; padding-right: 14px;">${row.approvedAmount || ''}</td>
            <td class="td-amount" style="text-align: right !important; padding-right: 14px;">${row.transferredAmount || ''}</td>
            <td class="td-amount" style="text-align: right !important; padding-right: 14px;">${row.payableAmount || ''}</td>
            <td class="td-center">${row.ageing}</td>
          </tr>
        `;
      }).join('');
    }
  } else if (currentModule === 'projects') {
    if (currentProjectsView === 'project_service_vendor_detail') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">${row.itemDescription || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px;">${row.uom || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.qty || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.rate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.amount || ''}</td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'project_service_vendor') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; font-weight: 500;">
            <a href="#" class="clickable-project-link" onclick="openServiceVendorItems('${(row.serviceVendorName || 'Service Vendor Name').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; cursor: pointer;">${row.serviceVendorName || ''}</a>
          </td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px;">${row.workType || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.basic || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.gst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.totalAmount || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.tdsDeduction || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.paidAmount || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.paidDate || ''}</td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'project_approvals') {
      tbody.innerHTML = filteredDataset.map(row => {
        const statusLower = (row.status || '').toLowerCase();
        const isApproved = statusLower.includes('approved');
        const isPending = statusLower.includes('pending');
        const statusStyle = isApproved ? 'color: #008744; font-weight: 600;' : (isPending ? 'color: #d62d20; font-weight: 600;' : 'color: #1e293b; font-weight: 500;');
        return `
          <tr class="projects-data-row" data-row-id="${row.id}">
            <td class="td-select" style="width: 60px; min-width: 60px; max-width: 60px; text-align: center !important; padding: 10px 14px;">
              <div class="radio-select-indicator ${row.selected ? 'selected' : ''}" onclick="toggleApprovalRowSelect('${row.id}')" aria-label="Select row"></div>
            </td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.requestDate || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.approvedDate || ''}</td>
            <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">${row.ageing || ''}</td>
            <td style="text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">${row.subject || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; ${statusStyle}">${row.status || ''}</td>
          </tr>
        `;
      }).join('');
    } else if (currentProjectsView === 'project_boq') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">${row.lineNo || ''}</td>
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: center !important; padding: 10px 14px;">${row.itemCode || ''}</td>
          <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">${row.itemDescription || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px;">${row.uom || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.qty || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.rate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.amount || ''}</td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'project_dpr') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.date || ''}</td>
          <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px;">
            <a href="#" class="req-link td-link-blue" onclick="showToast('Activity: ${(row.activity || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500;">${row.activity || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.status || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">${row.ptwType || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.ptwNumber || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px;">${row.ptwStatus || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">${row.checkIn || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">${row.checkOut || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.photoStart || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.photoEnd || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; border-left: 1px solid #e2e8f0;">${row.updateBy || ''}</td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'project_infra') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">${row.docType || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.boqNo || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.boqDate || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px;">${row.category || ''}</td>
          <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">${row.infraDescription || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.qy || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">
            <span class="status-badge status-active">${row.status || 'Active'}</span>
          </td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'project_material') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">
            <a href="#" class="req-link td-link-blue clickable-boq-item-link" onclick="openBoqMaterialDetailModal('${(row.boqName || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: none; cursor: pointer; font-weight: 600;">${row.boqName || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px;">${row.uom || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px;">${row.mir || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px;">${row.min || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px;">${row.mrr || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px;">${row.mrn || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px;">${row.net || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; border-left: 1px solid #e2e8f0;">${row.rate || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.amount || ''}</td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'project_expenses') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.expenseType || ''}</td>
          <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">${row.itemName || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px;">${row.uom || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.qty || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.po || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.budget || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.used || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.available || ''}</td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'supply_details') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">${row.itemDescription || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.uom || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.qty || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.rate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.amount || ''}</td>
        </tr>
      `).join('');
    } else if (currentProjectsView === 'details') {
      if (!currentProjectDetailTab) {
        tbody.innerHTML = '';
      } else if (currentProjectDetailTab === 'expenses') {
        tbody.innerHTML = `
          <tr>
            <td style="text-align: left; padding: 10px 14px;">Site Survey & Logistics</td>
            <td style="text-align: center; padding: 10px 14px;">Travel & Survey</td>
            <td style="text-align: right; padding: 10px 14px;">₹ 12,500.00</td>
            <td style="text-align: center; padding: 10px 14px;"><span style="color: #10b981; font-weight: 600;">Approved</span></td>
          </tr>
          <tr>
            <td style="text-align: left; padding: 10px 14px;">DG Installation Support</td>
            <td style="text-align: center; padding: 10px 14px;">Operations</td>
            <td style="text-align: right; padding: 10px 14px;">₹ 45,000.00</td>
            <td style="text-align: center; padding: 10px 14px;"><span style="color: #10b981; font-weight: 600;">Approved</span></td>
          </tr>
        `;
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 48px 16px; color: #64748b; font-size: 0.95rem;">
              ${currentProjectDetailTab.replace('_', ' ').toUpperCase()} content will be configured here.
            </td>
          </tr>
        `;
      }
    } else if (currentProjectsSubpage === 'supply') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px;">
            <a href="#" class="td-link-blue" onclick="openSupplyCustomerDetailsPage('${row.id}', '${row.customer}'); return false;" style="color: #2563eb; font-weight: 500; text-decoration: underline;">${row.customer || ''}</a>
          </td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center;">${row.orderId || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center;">${row.orderDate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center;">${row.orderAmount || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center;">${row.invoiceNumber || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center;">${row.invoiceDate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center;">${row.invoiceAmount || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center;">${row.ageing || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center;">${row.paymentStatus || ''}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="projects-data-row" data-row-id="${row.id}">
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch;">
            ${row.customer === 'Indus' ? `
              <a href="#" class="td-link-blue" onclick="openProjectDetailPage('${row.id}', '${row.customer}'); return false;" style="color: #2563eb; font-weight: 500; text-decoration: underline;">${row.customer || ''}</a>
            ` : `
              <span style="color: #1e293b; font-weight: 400;">${row.customer || ''}</span>
            `}
          </td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; line-height: 1.3;">${row.projectId || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch;">${row.poNo || ''}</td>
          <td>${row.poAgeing || ''}</td>
          <td>${row.poStatus || ''}</td>
          <td style="width: 12ch; min-width: 12ch; max-width: 12ch;">${row.siteId || ''}</td>
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch;">${row.siteName || ''}</td>
          <td>${row.projectType || ''}</td>
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch;">${row.subProjectType || ''}</td>
          <td>${row.projectStatus || ''}</td>
          <td style="width: 35ch; min-width: 35ch; max-width: 35ch;">${row.task || ''}</td>
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch;">${row.pendingWith || ''}</td>
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch;">${row.supportRequired || ''}</td>
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch;">${row.pendingWith2 || ''}</td>
        </tr>
      `).join('');
    }
  } else if (currentModule === 'inventory') {
    if (currentInventoryView === 'stock_price' || currentInventoryView === 'stock_ledger') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="inventory-data-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.docDate || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.docType || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.docNo || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; overflow: hidden; text-overflow: ellipsis;" title="${(row.fromTo || '').replace(/"/g, '&quot;')}">${row.fromTo || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.uom || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.qtyStock || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.qtyDoc || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.qtyBalance || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.rate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; font-weight: 600; color: #1e293b;">${row.stockValue || ''}</td>
        </tr>
      `).join('');
    } else if (currentInventoryView === 'product_details') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="inventory-data-row" data-row-id="${row.id}">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; font-weight: 500;">${row.invoiceNo || ''}</td>
          <td style="width: 35ch; min-width: 35ch; max-width: 35ch; text-align: left !important; padding: 10px 14px;">${row.vendorName || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.docDate || ''}</td>
          <td style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: right !important; padding: 10px 14px;">${row.qtyDoc || ''}</td>
          <td style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: right !important; padding: 10px 14px;">${row.qtyStock || ''}</td>
          <td style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: right !important; padding: 10px 14px;">${row.qtyTotal || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.purchasePrice || ''}</td>
          <td style="width: 14ch; min-width: 14ch; max-width: 14ch; text-align: right !important; padding: 10px 14px;">${row.transportation || ''}</td>
          <td style="width: 16ch; min-width: 16ch; max-width: 16ch; text-align: right !important; padding: 10px 14px;">${row.unloadingOther || ''}</td>
          <td style="width: 14ch; min-width: 14ch; max-width: 14ch; text-align: right !important; padding: 10px 14px;">${row.stockPrice || ''}</td>
          <td style="width: 14ch; min-width: 14ch; max-width: 14ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.newPrice || ''}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="inventory-data-row" data-row-id="${row.id}">
          <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; font-weight: 500; color: #1e293b;">
            <a href="#" onclick="openInventoryProductDetails('${row.id}', '${(row.productDescription || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; cursor: pointer; font-weight: 500;">${row.productDescription || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px;">${row.whCode || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px;">${row.productHead || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px;">${row.productType || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px;">${row.uom || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">${row.qty || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px;">
            <a href="#" onclick="openInventoryStockPricePage('${row.id}', '${(row.productDescription || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.stockPrice || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; font-weight: 600;">${row.stockValue || ''}</td>
        </tr>
      `).join('');
    }
  } else if (currentModule === 'purchase') {
    if (currentPurchaseView === 'supplier_detail') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="purchase-supplier-item-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.hsnCode || ''}</td>
          <td style="width: 40ch; min-width: 40ch; max-width: 40ch; text-align: left !important; padding: 10px 14px; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${(row.description || '').replace(/"/g, '&quot;')}">${row.description || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.uom || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.qty || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.rate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.gst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; font-weight: 600; color: #1e293b;">${row.amount || ''}</td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="purchase-data-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.prNo || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; overflow: hidden; text-overflow: ellipsis;" title="${(row.requestBy || '').replace(/"/g, '&quot;')}">${row.requestBy || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.poNo || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; overflow: hidden; text-overflow: ellipsis;" title="${(row.supplierName || '').replace(/"/g, '&quot;')}">
            <a href="#" onclick="openPurchaseSupplierDetails('${row.id}', '${(row.supplierName || '').replace(/'/g, "\\'")}', '${(row.poNo || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.supplierName || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.poValue || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.invoiceNo || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; font-weight: 600; color: #1e293b;">${row.invoiceValue || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.paymentStatus || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b;">${row.gstFilingStatus || ''}</td>
        </tr>
      `).join('');
    }
  } else if (currentModule === 'admin') {
    if (currentAdminView === 'lwf') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="admin-lwf-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeId || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeName || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.designation || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.grossSalary || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.state || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeContribution || row.employeeShare || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employerContribution || row.employerShare || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.totalAmount || ''}</td>
        </tr>
      `).join('');
    } else if (currentAdminView === 'pt') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="admin-pt-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeId || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeName || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.basic || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.hra || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.da || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.sa || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.grossWages || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.payable || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.deductedAmount || ''}</td>
        </tr>
      `).join('');
    } else if (currentAdminView === 'esi') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="admin-esi-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.ipNumber || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeName || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.grossSalary || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.esiWages || row.grossSalary || ''}</td>
          <td style="width: 18ch; min-width: 18ch; max-width: 18ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.noOfDaysWorked || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeContribution || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employerContribution || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.totalAmount || ''}</td>
        </tr>
      `).join('');
    } else if (currentAdminView === 'epf') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="admin-epf-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.uan || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeName || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.grossSalary || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.epfWages || row.basicDaSa || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeContribution || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.epf || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.eps || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.edli || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500; border-left: 1px solid #e2e8f0;">${row.totalAmount || ''}</td>
        </tr>
      `).join('');
    } else if (currentAdminView === 'salary_detail') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="admin-salary-detail-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeName || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.total || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.worked || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.lop || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.holidays || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.netSalaryDays || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gross || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.earned || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.epf || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.esiMi || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.pt || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.lwf || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.tds || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.advance || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.netSalary || ''}</td>
        </tr>
      `).join('');
    } else if (currentAdminView === 'attendance') {
      tbody.innerHTML = filteredDataset.map(row => {
        let daysTd = '';
        const dayVals = Array.isArray(row.days) ? row.days : Array(31).fill('P');
        for (let i = 0; i < 31; i++) {
          const val = dayVals[i] !== undefined ? dayVals[i] : 'P';
          daysTd += `<td style="width: 4ch; min-width: 4ch; max-width: 4ch; text-align: center !important; padding: 10px 2px; white-space: nowrap; color: #1e293b; font-weight: 500;">${val}</td>`;
        }
        return `
          <tr class="admin-attendance-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
            <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.employeeName || ''}</td>
            ${daysTd}
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.total || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.worked || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.leave || '0'}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.lop || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.holidays || ''}</td>
            <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.netSalaryDays || ''}</td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="admin-data-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.year || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" onclick="openAdminAttendancePage('${(row.month || '').replace(/'/g, "\\'")}', '${(row.year || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.month || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.noOfEmployee || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" onclick="openAdminSalaryDetailPage('${(row.month || '').replace(/'/g, "\\'")}', '${(row.year || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.salaryPaid || ''}</a>
          </td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" onclick="openAdminEpfPage('${(row.month || '').replace(/'/g, "\\'")}', '${(row.year || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.epf || ''}</a>
          </td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" onclick="openAdminEsiPage('${(row.month || '').replace(/'/g, "\\'")}', '${(row.year || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.esi || ''}</a>
          </td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" onclick="openAdminPtPage('${(row.month || '').replace(/'/g, "\\'")}', '${(row.year || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.pt || ''}</a>
          </td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" onclick="openAdminLwfPage('${(row.month || '').replace(/'/g, "\\'")}', '${(row.year || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; font-weight: 500; cursor: pointer;">${row.lwf || ''}</a>
          </td>
        </tr>
      `).join('');
    }
  } else if (currentModule === 'accounts') {
    if (currentAccountsView === 'tds') {
      let rowsHtml = '';
      accountsTdsData.forEach(q => {
        const rowCount = q.months ? q.months.length : 1;
        (q.months || []).forEach((m, idx) => {
          rowsHtml += `
            <tr class="accounts-tds-row" data-row-id="${m.id}" style="border-bottom: 1px solid #e2e8f0;">
              ${idx === 0 ? `
                <td rowspan="${rowCount}" style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; vertical-align: middle; padding: 10px 6px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${q.year}</td>
                <td rowspan="${rowCount}" style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: center !important; vertical-align: middle; padding: 10px 6px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${q.quarter}</td>
              ` : ''}
              <td style="width: 12ch; min-width: 12ch; max-width: 12ch; text-align: center !important; padding: 10px 6px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${m.month}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${m.taxableAmountReceivable || ''}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${m.tdsAmountReceivable || ''}</td>
              ${idx === 0 ? `
                <td rowspan="${rowCount}" style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; vertical-align: middle; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${q.tdsReceivable || ''}</td>
                <td rowspan="${rowCount}" style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; vertical-align: middle; padding: 10px 10px; white-space: nowrap; color: #0454e4; font-weight: 500; border-right: 1px solid #e2e8f0;">
                  <span style="color: #0454e4; text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 600;">${q.tdsCreditAvailable || ''}</span>
                </td>
              ` : ''}
              <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${m.taxableAmountPayable || ''}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 10px; white-space: nowrap; color: #1e293b; font-weight: 500; border-right: 1px solid #e2e8f0;">${m.deductedAmount || ''}</td>
              <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 10px; white-space: nowrap; color: #0454e4; font-weight: 500;">
                <span style="color: #0454e4; text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 600;">${m.paidAmount || ''}</span>
              </td>
            </tr>
          `;
        });
      });
      tbody.innerHTML = rowsHtml;
    } else if (currentAccountsView === 'tds_receivable') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="accounts-tds-receivable-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.paymentDate || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 12px; white-space: nowrap; color: #0454e4; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.panName || '').replace(/"/g, '&quot;')}">
            <a href="#" class="td-link-blue" onclick="openAccountsTdsDetailsModal('acc-tds-rec', '${(row.panNumber || '').replace(/'/g, "\\'")}', '${(row.panName || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.panName || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500; font-family: monospace;">${row.panNumber || ''}</td>
          <td style="width: 52ch; min-width: 52ch; max-width: 52ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.tdsCode || '').replace(/"/g, '&quot;')}">${row.tdsCode || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.taxableAmount || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.tdsRate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.tdsAmount || ''}</td>
        </tr>
      `).join('');
    } else if (currentAccountsView === 'tds_payable') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="accounts-tds-payable-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.year || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.quarter || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 12px; white-space: nowrap; color: #0454e4; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.panName || '').replace(/"/g, '&quot;')}">
            <a href="#" class="td-link-blue" onclick="openAccountsTdsDetailsModal('acc-tds-1', '${(row.panNumber || '').replace(/'/g, "\\'")}', '${(row.panName || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.panName || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500; font-family: monospace;">${row.panNumber || ''}</td>
          <td style="width: 52ch; min-width: 52ch; max-width: 52ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.tdsCode || '').replace(/"/g, '&quot;')}">${row.tdsCode || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.taxableAmount || ''}</td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.tdsRate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.deductedAmount || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 12px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <span style="color: #0454e4; text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 600;">${row.paidAmount || ''}</span>
          </td>
        </tr>
      `).join('');
    } else if (currentAccountsView === 'purchase') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="accounts-purchase-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.voucherNo || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.voucherDate || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.vendorName || '').replace(/"/g, '&quot;')}">${row.vendorName || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <span style="text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 500; color: #0454e4;">${row.invoiceNo || ''}</span>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.invoiceDate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" class="td-link-blue" onclick="openAccountsPurchaseInvoiceModal('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.invoiceAmount || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" class="td-link-blue" onclick="openAccountsPurchasePaymentDetailsModal('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.paidAmount || ''}</a>
          </td>
        </tr>
      `).join('');
    } else if (currentAccountsView === 'payment') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="accounts-payment-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.transferredTo || '').replace(/"/g, '&quot;')}">
            <a href="#" class="td-link-blue" onclick="openAccountsPaymentTransferToModal('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.transferredTo || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.requestNo || ''}</td>
          <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.expenseHead || '').replace(/"/g, '&quot;')}">${row.expenseHead || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.transferredFrom || '').replace(/"/g, '&quot;')}">${row.transferredFrom || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.requested || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.approved || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.transferred || ''}</td>
        </tr>
      `).join('');
    } else if (currentAccountsView === 'receipt') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="accounts-receipt-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.receiptNo || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.date || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.customerName || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.receivedBank || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.amount || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(row.particulars || 'Payment towards Invoice').replace(/"/g, '&quot;')}">${row.particulars || 'Payment towards Invoice'}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.paymentRefNo || ''}</td>
        </tr>
      `).join('');
    } else if (currentAccountsView === 'bank') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="accounts-bank-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.date || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.bankName || ''}</td>
          <td style="width: 35ch; min-width: 35ch; max-width: 35ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.particulars || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.refNo || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.withdrawal || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.deposit || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.balance || ''}</td>
        </tr>
      `).join('');
    } else if (currentAccountsView === 'gst') {
      tbody.innerHTML = filteredDataset.map((row) => `
        <tr class="accounts-gst-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 60px; min-width: 60px; max-width: 60px; text-align: center !important; padding: 10px 14px; vertical-align: middle;">
            <input type="radio" name="gstSelectRow" value="${row.id}" onchange="handleGstRowSelection(this)" style="cursor: pointer; width: 16px; height: 16px; accent-color: #008744;">
          </td>
          <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.month || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr1aBasic || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr1aCgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr1aSgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr1aIgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr2bBasic || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr2bCgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr2bSgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.gstr2bIgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.rcmBasic || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.rcmCgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.rcmSgst || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.rcmIgst || ''}</td>
        </tr>
      `).join('');
    } else if (currentAccountsSubpage === 'sales' || currentAccountsView === 'main') {
      tbody.innerHTML = filteredDataset.map(row => `
        <tr class="accounts-sales-row" data-row-id="${row.id}" style="border-bottom: 1px solid #e2e8f0;">
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.voucherNo || ''}</td>
          <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.customerName || ''}</td>
          <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <span style="text-decoration: underline; text-decoration-color: #0454e4; text-underline-offset: 3px; font-weight: 500; color: #0454e4;">${row.invoiceNo || ''}</span>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.invoiceDate || ''}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" class="td-link-blue" onclick="openAccountsSalesInvoiceModal('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.invoiceAmount || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" class="td-link-blue" onclick="openAccountsSalesDeductionModal('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.deduction || ''}</a>
          </td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-weight: 500;">${row.receivableAmount || '₹ 0.00'}</td>
          <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-weight: 500;">
            <a href="#" class="td-link-blue" onclick="openAccountsSalesPaymentModal('${row.id}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${row.receivedAmount || ''}</a>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-data-row" style="text-align: center; padding: 32px; color: #64748b;">No records available for ${currentAccountsSubpage.toUpperCase()}.</td>
        </tr>
      `;
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
      const expenseName = document.getElementById('inpExpenseName')?.value || "Office Supplies & Maintenance";
      const expenseCategory = document.getElementById('inpExpenseCategory')?.value || "Administrative Support";
      const expenseSubCategory = document.getElementById('inpExpenseSubCategory')?.value || "Office Utilities";
      const expenseHead = document.getElementById('inpExpenseHead')?.value || "Opex";
      const gst = document.getElementById('inpExpenseGst')?.value || "18%";
      const depreciation = document.getElementById('inpExpenseDepreciation')?.value || "10%";
      const expenseRcmToggle = document.getElementById('inpExpenseRcmToggle');
      const rcm = (expenseRcmToggle && expenseRcmToggle.checked) ? "Yes" : "No";
      const expenseStatusToggle = document.getElementById('inpExpenseStatusToggle');
      const status = (expenseStatusToggle && expenseStatusToggle.checked) ? "Active" : "In - Active";

      const newRecord = {
        id: `exp-${Date.now()}`,
        expenseName,
        expenseCategory,
        expenseSubCategory,
        expenseHead,
        gst,
        gstRate: gst,
        depreciation,
        rcm,
        status
      };

      masterExpensesData.push(newRecord);
      currentDataset = [...masterExpensesData];
      applyFiltersAndRender();
      closeSideForm();
      showToast(`Expense ${expenseName} successfully saved & added to table!`);
      return;
    }

    if (currentModule === 'master' && currentMasterSubpage === 'products') {
      const productName = document.getElementById('inpProductName')?.value || document.getElementById('inpProductHead')?.value || "Telecom Tower Mast";
      const productCategory = document.getElementById('inpProductCategory')?.value || "Tower Infrastructure";
      const productCode = document.getElementById('inpProductCode')?.value || `PRD-${Date.now().toString().slice(-4)}`;
      const hsnCode = document.getElementById('inpProductHsn')?.value || "73082019";
      const uom = document.getElementById('inpProductUom')?.value || "Nos";
      const saleUom = document.getElementById('inpProductSaleUom')?.value || "Nos";
      const ucf = document.getElementById('inpProductUcf')?.value || "";
      const gstRate = document.getElementById('inpProductGstRate')?.value || "18%";
      const msq = document.getElementById('inpProductMsq')?.value || "";
      const moq = document.getElementById('inpProductMoq')?.value || "";
      const inflation = document.getElementById('inpProductInflation')?.value || "";
      const margin = document.getElementById('inpProductMargin')?.value || "5%";
      const oh = document.getElementById('inpProductOh')?.value || "2%";
      const productStatusToggle = document.getElementById('inpProductStatusToggle');
      const status = (productStatusToggle && productStatusToggle.checked) ? "Active" : "In - Active";

      const newRecord = {
        id: `prod-${Date.now()}`,
        productName,
        productHead: productName,
        productCategory,
        productCode,
        hsnCode,
        uom,
        saleUom,
        ucf,
        gst: gstRate,
        gstRate,
        msq,
        moq,
        inflation,
        margin,
        oh,
        price: "1,50,000.00",
        stockPrices: "1,50,000.00",
        status
      };

      masterProductsData.push(newRecord);
      currentDataset = [...masterProductsData];
      applyFiltersAndRender();
      closeSideForm();
      showToast(`Product ${productName} successfully saved & added to table!`);
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
    const rowTcsDeduction = document.getElementById('rowVendorTcsDeduction');
    const rowTdsDeduction = document.getElementById('rowVendorTdsDeduction');
    const rowTdsCode = document.getElementById('rowVendorTdsCode');
    const rowTdsRate = document.getElementById('rowVendorTdsRate');

    // Ensure TDS fields are always visible
    if (rowTdsDeduction) rowTdsDeduction.style.display = 'flex';
    if (rowTdsCode) rowTdsCode.style.display = 'flex';
    if (rowTdsRate) rowTdsRate.style.display = 'flex';

    if (vType === 'Supply') {
      // Show TCS Deduction when Supply is selected
      if (rowTcsDeduction) rowTcsDeduction.style.display = 'flex';
      // Hide Service Type field
      if (rowServiceType) rowServiceType.style.display = 'none';
    } else if (vType === 'Service') {
      // Hide TCS Deduction when Service is selected
      if (rowTcsDeduction) rowTcsDeduction.style.display = 'none';
      // Show Service Type field
      if (rowServiceType) rowServiceType.style.display = 'flex';
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
  window.openNexusCalendar = openNexusCalendar;

  // Attach to Company HR Policies EPF calendar inputs
  attachNexusCalendar('inpEpfFromDate', 'btnEpfFromDateCalendar');
  attachNexusCalendar('inpEpfToDate', 'btnEpfToDateCalendar');
  attachNexusCalendar('inpEpfFillingDueDate', 'btnEpfFillingDueDateCalendar');

  const btnCompanyHrEpfEditToggle = document.getElementById('btnCompanyHrEpfEditToggle');
  if (btnCompanyHrEpfEditToggle) {
    btnCompanyHrEpfEditToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgIcon = document.getElementById('imgCompanyHrEpfEditIcon');
      if (!isCompanyHrEpfEditing) {
        isCompanyHrEpfEditing = true;
        setCompanyHrEpfReadOnly(false);
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.className = 'icon-green';
          imgIcon.title = 'Save';
        }
        showToast('EPF form is now editable');
      } else {
        isCompanyHrEpfEditing = false;
        setCompanyHrEpfReadOnly(true);
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.className = 'icon-blue';
          imgIcon.title = 'Edit Info';
        }
        showToast('EPF details saved successfully!');
      }
    });
  }

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

  // Vendor Form Event Listeners
  document.getElementById('inpVendorType')?.addEventListener('change', updateVendorConditionalFields);
  document.getElementById('inpServiceType')?.addEventListener('change', updateVendorConditionalFields);
  document.getElementById('inpVendorGstToggle')?.addEventListener('change', updateVendorConditionalFields);

  const btnVendorCardEditToggle = document.getElementById('btnVendorCardEditToggle');
  if (btnVendorCardEditToggle) {
    btnVendorCardEditToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgIcon = document.getElementById('imgVendorCardEditIcon');
      if (!isVendorFormEditing) {
        isVendorFormEditing = true;
        setVendorFormReadOnly(false, true);
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.className = 'icon-green';
          imgIcon.title = 'Save';
        }
        showToast('Vendor form is now editable');
      } else {
        isVendorFormEditing = false;
        // Save changes to current viewed vendor
        if (currentViewedVendorId) {
          const vIndex = masterVendorData.findIndex(v => v.id === currentViewedVendorId || v.vendorId === currentViewedVendorId);
          if (vIndex !== -1) {
            const isGstOn = document.getElementById('inpVendorGstToggle')?.checked || false;
            masterVendorData[vIndex].address = document.getElementById('inpVendorAddress')?.value.trim() || '';
            masterVendorData[vIndex].gstEnabled = isGstOn;
            masterVendorData[vIndex].gstType = isGstOn ? (document.getElementById('inpVendorGstType')?.value || 'SGST') : 'NA';
            masterVendorData[vIndex].gstNumber = isGstOn ? (document.getElementById('inpVendorGstNumber')?.value.trim() || '') : 'NA';
            masterVendorData[vIndex].tdsDeduction = document.getElementById('inpTdsDeductionToggle')?.checked || false;
            masterVendorData[vIndex].tdsCode = document.getElementById('inpTdsCode')?.value || '';
            masterVendorData[vIndex].tdsRate = document.getElementById('inpTdsRate')?.value || '1%';
            masterVendorData[vIndex].status = document.getElementById('inpVendorStatusToggle')?.checked ? 'Active' : 'In - Active';
          }
          if (currentMasterSubpage === 'vendor') {
            loadMasterDataset();
            applyFiltersAndRender();
          }
        }
        setVendorFormReadOnly(true);
        if (imgIcon) {
          imgIcon.src = 'icons/Edit.svg';
          imgIcon.className = 'icon-blue';
          imgIcon.title = 'Edit Info';
        }
        showToast('Vendor details saved successfully!');
      }
    });
  }

  const btnSubmitVendorCustomEl = document.getElementById('btnSubmitVendor');
  if (btnSubmitVendorCustomEl) {
    btnSubmitVendorCustomEl.addEventListener('click', (e) => {
      e.preventDefault();
      const vName = document.getElementById('inpVendorName')?.value.trim();
      if (!vName) {
        showToast('Please enter a Vendor Name');
        return;
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

      const newVendor = {
        id: `vend-${Date.now()}`,
        vendorName: vName,
        entityType: entityType,
        businessType: bType,
        vendorType: bType,
        serviceType: sType,
        contractType: contractType,
        vendorId: String(Math.floor(100000000 + Math.random() * 900000000)),
        address: address,
        panNumber: pan,
        gstEnabled: isGstOn,
        gstType: isGstOn ? gstType : 'NA',
        gstNumber: gstNumber,
        tdsDeduction: isTdsOn,
        tdsCode: tdsCode,
        tdsRate: tdsRate,
        status: status
      };

      masterVendorData.unshift(newVendor);
      if (currentMasterSubpage === 'vendor') {
        loadMasterDataset();
        applyFiltersAndRender();
      }
      closeSideForm();
      showToast(`Vendor ${vName} added successfully!`);
    });
  }

  const btnVendorGstProcess = document.getElementById('btnVendorGstProcess');
  if (btnVendorGstProcess) {
    btnVendorGstProcess.addEventListener('click', (e) => {
      e.preventDefault();
      const gstVal = document.getElementById('inpVendorGstNumber')?.value.trim();
      if (!gstVal) {
        showToast('Please enter a GST Number to process');
        return;
      }
      showToast(`Processing GST: ${gstVal}...`);
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
  if (document.getElementById('productPriceCard')) document.getElementById('productPriceCard').style.display = 'none';
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
    if (addVendorCard) {
      addVendorCard.style.display = 'block';
      const lblTitle = document.getElementById('lblVendorCardTitle');
      const btnEditToggle = document.getElementById('btnVendorCardEditToggle');
      const btnSaveWrap = document.querySelector('#frmAddVendor .form-submit-inside-wrap');
      if (lblTitle) lblTitle.innerText = 'Add Vendor';
      if (btnEditToggle) btnEditToggle.style.display = 'none';
      if (btnSaveWrap) btnSaveWrap.style.display = 'flex';
      const btnBank = document.getElementById('btnVendorCardBank');
      const btnMessage = document.getElementById('btnVendorCardMessage');
      const btnScope = document.getElementById('btnVendorCardScope');
      if (btnBank) btnBank.style.display = 'inline-flex';
      if (btnMessage) btnMessage.style.display = 'inline-flex';
      if (btnScope) btnScope.style.display = 'inline-flex';

      setVendorFormReadOnly(false);
      currentViewedVendorId = null;
      isVendorFormEditing = false;
      const frm = document.getElementById('frmAddVendor');
      if (frm) frm.reset();
      const statusToggle = document.getElementById('inpVendorStatusToggle');
      if (statusToggle) statusToggle.checked = true;
      const gstToggle = document.getElementById('inpVendorGstToggle');
      if (gstToggle) gstToggle.checked = false;
      updateVendorConditionalFields();
    }
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
      const frm = document.getElementById('frmAddProduct');
      if (frm) frm.reset();
      const statusToggle = document.getElementById('inpProductStatusToggle');
      if (statusToggle) statusToggle.checked = true;
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
      const frm = document.getElementById('frmAddExpense');
      if (frm) frm.reset();
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

  // Default active toggles for Add Product & Add Expense
  const prodStatus = document.getElementById('inpProductStatusToggle');
  if (prodStatus && currentMasterSubpage === 'products') prodStatus.checked = true;
  const expStatus = document.getElementById('inpExpenseStatusToggle');
  if (expStatus && currentMasterSubpage === 'expenses') expStatus.checked = true;

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
  const purchaseDetailModal = document.getElementById('purchaseDetailModal');
  if (purchaseDetailModal) purchaseDetailModal.style.display = 'none';
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

  const btnHrPolicies = document.getElementById('btnIndusTowerHrPolicies');
  if (btnHrPolicies) {
    btnHrPolicies.addEventListener('click', (e) => {
      e.stopPropagation();
      openCompanyHrPoliciesPage('epf');
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
      if (dropdown.dataset.filterContext === 'tdsSummary') {
        if (currentTdsSummaryFilterCol) {
          delete activeTdsSummaryFilters[currentTdsSummaryFilterCol];
          renderAccountsTdsSummaryTable();
        }
        closeExcelFilter();
        showToast('TDS filter cleared');
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
    submissionDate: "Submission Date",
    approvedBy: "Approved By",
    transferTo: "Transfer To",
    ageing: "Ageing",
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
    itemDescription: "Item Description",
    expenseType: "Expense Type",
    itemName: "Item Name",
    po: "PO",
    budget: "Budget",
    used: "Used",
    available: "Available",
    boqName: "BOQ Name",
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
    qy: "Qy"
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

let selectedPurchasePayId = 'pay-2';

let purchaseDetailData = {
  'pay-2': {
    supplier: 'Supplier Name',
    poNo: '230510678',
    invoiceNo: 'INV-98765',
    totalAmt: '12,00,000.00',
    paidAmt: '10,00,000.00',
    payableAmt: '2,00,000.00',
    lineItems: [
      { id: 'pur-li-1', selected: false, approved: false, hsnCode: '8544', description: 'Power Cable 4CX16 Sqmm', uom: 'Mtr', poQty: '500', invoiceQty: '500', grnQty: '500', rate: '240.00', basicAmt: '1,20,000.00', gstAmt: '21,600.00', totalAmt: '1,41,600.00' }
    ]
  },
  'pay-9': {
    supplier: 'Supplier Name',
    poNo: '',
    invoiceNo: '',
    totalAmt: '12,00,000.00',
    paidAmt: '10,00,000.00',
    payableAmt: '2,00,000.00',
    lineItems: [
      { id: 'pur-li-2', selected: false, approved: false, hsnCode: '', description: 'JCB Charges', uom: '', poQty: '', invoiceQty: '', grnQty: '', rate: '', basicAmt: '', gstAmt: '', totalAmt: '' }
    ]
  }
};

let isSubpageEditing = false;

window.openWorklistPurchasePayment = function(payId) {
  isSubpageEditing = false;
  currentModule = 'worklist';
  currentWorklistView = 'purchase_payment';
  selectedPurchasePayId = payId || 'pay-2';
  const detail = purchaseDetailData[selectedPurchasePayId] || purchaseDetailData['pay-2'];
  if (detail && detail.lineItems) detail.lineItems.forEach(i => { i.selected = false; });
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Purchase Requisition Page');
};

// ========================================================================
// EMPLOYEE PAYMENT PAGE (from Payment Worklist - Submit By / Employee)
// ========================================================================

let selectedEmployeePayId = 'pay-3';

let employeeDetailData = {
  'pay-3': {
    employeeName: 'Employee Name',
    totalAmt: '12,00,000.00',
    paidAmt: '10,00,000.00',
    payableAmt: '2,00,000.00',
    lineItems: [
      { id: 'emp-li-1', selected: false, approved: false, description: 'JCB Charges', amtRequest: '', amtValidated: '', amtApproved: '' }
    ]
  }
};

window.openWorklistEmployeePayment = function(payId) {
  isSubpageEditing = false;
  currentModule = 'worklist';
  currentWorklistView = 'employee_payment';
  selectedEmployeePayId = payId || 'pay-3';
  const detail = employeeDetailData[selectedEmployeePayId] || employeeDetailData['pay-3'];
  if (detail && detail.lineItems) detail.lineItems.forEach(i => { i.selected = false; });
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Employee Requisition Page');
};

// ========================================================================
// TRANSPORT PAYMENT PAGE (from Payment Worklist - Submit By / Transport)
// ========================================================================

let selectedTransportPayId = 'pay-4';

let transportDetailData = {
  'pay-4': {
    transporterName: 'Transporter Name',
    totalAmt: '12,00,000.00',
    paidAmt: '10,00,000.00',
    payableAmt: '2,00,000.00',
    lineItems: [
      { id: 'trans-li-1', selected: false, approved: false, vehicleType: '', description: 'JCB Charges', from: '', to: '', amtRequest: '', amtValidated: '', amtApproved: '' }
    ]
  }
};

window.openWorklistTransportPayment = function(payId) {
  isSubpageEditing = false;
  currentModule = 'worklist';
  currentWorklistView = 'transport_payment';
  selectedTransportPayId = payId || 'pay-4';
  const detail = transportDetailData[selectedTransportPayId] || transportDetailData['pay-4'];
  if (detail && detail.lineItems) detail.lineItems.forEach(i => { i.selected = false; });
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Transport Requisition Page');
};

// ========================================================================
// ACCOUNTS PAYMENT PAGE (from Payment Worklist - Submit By / Accounts)
// ========================================================================

let selectedAccountsPayId = 'pay-6';

let accountsDetailData = {
  'pay-6': {
    totalAmt: '12,00,000.00',
    paidAmt: '10,00,000.00',
    payableAmt: '2,00,000.00',
    lineItems: [
      { id: 'acc-li-1', selected: false, approved: false, expenseType: '', description: 'JCB Charges', amtRequest: '', amtValidated: '', amtApproved: '' }
    ]
  }
};

window.openWorklistAccountsPayment = function(payId) {
  isSubpageEditing = false;
  currentModule = 'worklist';
  currentWorklistView = 'accounts_payment';
  selectedAccountsPayId = payId || 'pay-6';
  const detail = accountsDetailData[selectedAccountsPayId] || accountsDetailData['pay-6'];
  if (detail && detail.lineItems) detail.lineItems.forEach(i => { i.selected = false; });
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Accounts Requisition Page');
};

// ========================================================================
// ADMIN PAYMENT PAGE (from Payment Worklist - Submit By / Admin)
// ========================================================================

let selectedAdminPayId = 'pay-5';

let adminDetailData = {
  'pay-5': {
    totalAmt: '12,00,000.00',
    paidAmt: '10,00,000.00',
    payableAmt: '2,00,000.00',
    lineItems: [
      { id: 'adm-li-1', selected: false, approved: false, expenseType: '', description: 'JCB Charges', amtRequest: '', amtValidated: '', amtApproved: '' }
    ]
  }
};

window.openWorklistAdminPayment = function(payId) {
  isSubpageEditing = false;
  currentModule = 'worklist';
  currentWorklistView = 'admin_payment';
  selectedAdminPayId = payId || 'pay-5';
  const detail = adminDetailData[selectedAdminPayId] || adminDetailData['pay-5'];
  if (detail && detail.lineItems) detail.lineItems.forEach(i => { i.selected = false; });
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Admin Requisition Page');
};

// ========================================================================
// STATUTORY PAYMENT PAGE (from Payment Worklist - Submit By / Statutory)
// ========================================================================

let selectedStatutoryPayId = 'pay-7';

let statutoryDetailData = {
  'pay-7': {
    totalAmt: '12,00,000.00',
    paidAmt: '10,00,000.00',
    payableAmt: '2,00,000.00',
    lineItems: [
      { id: 'stat-li-1', selected: false, approved: false, expenseType: '', description: 'JCB Charges', amtRequest: '', amtValidated: '', amtApproved: '' }
    ]
  }
};

window.openWorklistStatutoryPayment = function(payId) {
  isSubpageEditing = false;
  currentModule = 'worklist';
  currentWorklistView = 'statutory_payment';
  selectedStatutoryPayId = payId || 'pay-7';
  const detail = statutoryDetailData[selectedStatutoryPayId] || statutoryDetailData['pay-7'];
  if (detail && detail.lineItems) detail.lineItems.forEach(i => { i.selected = false; });
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast('Opened Statutory Requisition Page');
};

window.toggleSubpageRowSelect = function(rowId) {
  loadWorklistDataset();
  const item = (currentDataset || []).find(i => i.id === rowId);
  if (item) {
    item.selected = !item.selected;
    if (!item.selected) {
      item.approved = false;
    }
    renderWorklistToolbar();
    applyFiltersAndRender();
  }
};

window.approveSelectedSubpageRows = function() {
  loadWorklistDataset();
  const selectedRows = (currentDataset || []).filter(i => i.selected);
  if (selectedRows.length === 0) {
    showToast('Please select a row to approve');
    return;
  }
  selectedRows.forEach(item => {
    item.approved = true;
  });
  applyFiltersAndRender();
  showToast(`${selectedRows.length} row(s) approved & highlighted`);
};

window.toggleSubpageEditMode = function() {
  if (!isSubpageEditing) {
    isSubpageEditing = true;
    renderWorklistToolbar();
    applyFiltersAndRender();
    showToast('Subpage table is now in edit mode');
  } else {
    isSubpageEditing = false;
    renderWorklistToolbar();
    applyFiltersAndRender();
    showToast('Subpage details saved successfully');
  }
};

window.toggleProjectPaymentRowSelect = function(rowId) {
  const item = worklistProjectPaymentItems.find(i => i.id === rowId);
  if (item) {
    item.selected = !item.selected;
    if (!item.selected) {
      item.approved = false;
    }
    renderWorklistToolbar();
    applyFiltersAndRender();
  }
};

window.approveSelectedProjectPaymentRows = function() {
  const selectedRows = worklistProjectPaymentItems.filter(i => i.selected);
  if (selectedRows.length === 0) {
    showToast('Please select a row to approve');
    return;
  }
  selectedRows.forEach(item => {
    item.approved = true;
  });
  applyFiltersAndRender();
  showToast(`${selectedRows.length} row(s) approved & highlighted permanently`);
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

let worklistProjectPaymentNotes = [];

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

  if (!worklistProjectPaymentNotes || worklistProjectPaymentNotes.length === 0) {
    tbody.innerHTML = '';
    return;
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
  { id: "bank_acc_name", label: "Account Name", value: "" },
  { id: "bank_acc_no", label: "Account Number", value: "" },
  { id: "bank_ifsc", label: "IFSC Code", value: "" },
  { id: "bank_name", label: "Bank Name", value: "" }
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
      <td style="padding: 8px 12px; font-weight: 500; text-align: left !important;">
        <a href="javascript:void(0)" style="color: #4338ca; text-decoration: none; cursor: pointer; font-weight: 600; text-align: left !important; display: block; width: 100%;" onclick="openBoqDetailModal('${row.id}')">${row.boqName}</a>
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

// ========================================================================
// PURCHASE DETAIL MODAL (from Payment Worklist - Submit By / Purchase)
// ========================================================================

// Track which payment row opened the purchase detail (for back-navigation)
let currentPurchasePaymentId = null;

function renderPurchaseDetailTable(payId) {
  const tbody = document.getElementById('tbodyPurchaseDetail');
  if (!tbody) return;

  const detail = purchaseDetailData[payId] || { lineItems: [] };
  const validItems = (detail.lineItems || []).filter(item => (item.description && item.description.trim() !== '') || (item.hsnCode && item.hsnCode.trim() !== ''));
  if (validItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: #94a3b8;">No line items available</td></tr>`;
    return;
  }

  tbody.innerHTML = validItems.map(item => `
    <tr>
      <td class="td-center" style="padding: 6px 8px; font-size: 0.85rem;">${item.hsnCode || ''}</td>
      <td style="padding: 6px 8px; font-size: 0.85rem; color: #4338ca; font-weight: 500;">${item.description || ''}</td>
      <td class="td-center" style="padding: 6px 8px; font-size: 0.85rem;">${item.uom || ''}</td>
      <td class="td-center" style="padding: 6px 8px; font-size: 0.85rem;">${item.poQty || ''}</td>
      <td class="td-center" style="padding: 6px 8px; font-size: 0.85rem;">${item.invoiceQty || ''}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem;">${item.rate || ''}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem;">${item.basicAmt || ''}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem;">${item.gstAmt || ''}</td>
      <td class="td-amount" style="padding: 6px 8px; text-align: right; font-size: 0.85rem; font-weight: 600;">${item.totalAmt || ''}</td>
    </tr>
  `).join('');
}

window.openPurchaseDetailModal = function(payId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  currentPurchasePaymentId = payId;

  // Get detail data or create default
  const detail = purchaseDetailData[payId] || {
    supplier: 'Supplier Name',
    poNo: '',
    invoiceNo: '',
    totalAmt: '0.00',
    paidAmt: '0.00',
    payableAmt: '0.00',
    lineItems: [
      { hsnCode: '', description: '', uom: '', poQty: '', invoiceQty: '', rate: '', basicAmt: '', gstAmt: '', totalAmt: '' },
      { hsnCode: '', description: '', uom: '', poQty: '', invoiceQty: '', rate: '', basicAmt: '', gstAmt: '', totalAmt: '' },
      { hsnCode: '', description: '', uom: '', poQty: '', invoiceQty: '', rate: '', basicAmt: '', gstAmt: '', totalAmt: '' },
      { hsnCode: '', description: '', uom: '', poQty: '', invoiceQty: '', rate: '', basicAmt: '', gstAmt: '', totalAmt: '' },
      { hsnCode: '', description: '', uom: '', poQty: '', invoiceQty: '', rate: '', basicAmt: '', gstAmt: '', totalAmt: '' }
    ]
  };

  // Update header labels
  const lblSupplier = document.getElementById('lblPurchaseSupplier');
  if (lblSupplier) lblSupplier.textContent = detail.supplier;
  const lblPONo = document.getElementById('lblPurchasePONo');
  if (lblPONo) lblPONo.textContent = detail.poNo;
  const lblInvNo = document.getElementById('lblPurchaseInvoiceNo');
  if (lblInvNo) lblInvNo.textContent = detail.invoiceNo;

  // Update amounts
  const lblTotal = document.getElementById('lblPurchaseTotalAmt');
  if (lblTotal) lblTotal.textContent = detail.totalAmt;
  const lblPaid = document.getElementById('lblPurchasePaidAmt');
  if (lblPaid) lblPaid.textContent = detail.paidAmt;
  const lblPayable = document.getElementById('lblPurchasePayableAmt');
  if (lblPayable) lblPayable.textContent = detail.payableAmt;

  // Hide other sub-panels
  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const purchaseModal = document.getElementById('purchaseDetailModal');
  if (purchaseModal) {
    purchaseModal.style.display = 'block';
  }

  renderPurchaseDetailTable(payId);
  overlay.style.display = 'flex';
};

// Close Purchase Detail handler
document.addEventListener('click', (e) => {
  if (e.target.closest('#btnClosePurchaseDetailModal')) {
    const purchaseModal = document.getElementById('purchaseDetailModal');
    if (purchaseModal) purchaseModal.style.display = 'none';
    // Close the entire overlay since we came from the main table
    const overlay = document.getElementById('sideFormOverlay');
    if (overlay) overlay.style.display = 'none';
    currentPurchasePaymentId = null;
  }
});

// Open Notes tab from Purchase Detail
window.openPurchaseNotesTab = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Hide purchase modal, show notes modal
  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const notesModal = document.getElementById('projectPaymentNotesModal');
  if (notesModal) {
    notesModal.style.display = 'block';
  }
  overlay.style.display = 'flex';
};

// Open Bank tab from Purchase Detail
window.openPurchaseBankTab = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  // Hide purchase modal, show bank modal
  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const bankModal = document.getElementById('projectPaymentBankModal');
  if (bankModal) {
    bankModal.style.display = 'block';
  }

  renderProjectPaymentBankFields();
  overlay.style.display = 'flex';
};

let currentViewedEmpId = null;
let isEmployeeFormEditing = false;

function setEmployeeFormReadOnly(isReadOnly) {
  const form = document.getElementById('frmAddEmployee');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.id === 'inpEmpPhoto') return;
    if (input.type === 'checkbox') {
      input.disabled = isReadOnly;
      const parentSwitch = input.closest('.toggle-slide-switch') || input.closest('label');
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
        parentSwitch.style.opacity = isReadOnly ? '0.7' : '1';
      }
    } else {
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
        // ENTER EDIT MODE (Only HSN Code, GST Rate, MSQ, MOQ, Inflation, Margin, OH, Status editable)
        isProductFormEditing = true;
        setProductFormReadOnly(false, true);
        if (lblTitle) lblTitle.innerText = 'Edit Product';
        if (imgIcon) {
          imgIcon.src = 'icons/Save.svg';
          imgIcon.title = 'Save Changes';
        }
        showToast('HSN Code, GST Rate, MSQ, MOQ, Inflation, Margin, OH, Status are now editable');
      } else {
        // SAVE EDITS
        isProductFormEditing = false;
        if (currentViewedProductId) {
          const prod = masterProductsData.find(p => p.id === currentViewedProductId);
          if (prod) {
            prod.productName = document.getElementById('inpProductName')?.value || prod.productName;
            prod.productHead = prod.productName;
            prod.productCategory = document.getElementById('inpProductCategory')?.value || prod.productCategory;
            prod.productCode = document.getElementById('inpProductCode')?.value || prod.productCode;
            prod.hsnCode = document.getElementById('inpProductHsn')?.value || prod.hsnCode;
            prod.uom = document.getElementById('inpProductUom')?.value || prod.uom;
            prod.saleUom = document.getElementById('inpProductSaleUom')?.value || prod.saleUom;
            prod.ucf = document.getElementById('inpProductUcf')?.value || prod.ucf;
            prod.gstRate = document.getElementById('inpProductGstRate')?.value || prod.gstRate;
            prod.gst = prod.gstRate;
            prod.msq = document.getElementById('inpProductMsq')?.value || prod.msq;
            prod.moq = document.getElementById('inpProductMoq')?.value || prod.moq;
            prod.inflation = document.getElementById('inpProductInflation')?.value || prod.inflation;
            prod.margin = document.getElementById('inpProductMargin')?.value || prod.margin;
            prod.oh = document.getElementById('inpProductOh')?.value || prod.oh;
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
        setExpenseFormReadOnly(false, true);
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
            exp.expenseName = document.getElementById('inpExpenseName')?.value || exp.expenseName || exp.expenseDescription;
            exp.expenseCategory = document.getElementById('inpExpenseCategory')?.value || exp.expenseCategory;
            exp.expenseSubCategory = document.getElementById('inpExpenseSubCategory')?.value || exp.expenseSubCategory;
            exp.expenseHead = document.getElementById('inpExpenseHead')?.value || exp.expenseHead;
            exp.gst = document.getElementById('inpExpenseGst')?.value || exp.gst || exp.gstRate;
            exp.gstRate = exp.gst;
            exp.depreciation = document.getElementById('inpExpenseDepreciation')?.value || exp.depreciation;
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

let currentViewedVendorId = null;
let isVendorFormEditing = false;

function setVendorFormReadOnly(isReadOnly, isEditModeOnly = false) {
  const form = document.getElementById('frmAddVendor');
  if (!form) return;

  const isEdit = !isReadOnly && (isEditModeOnly || isVendorFormEditing);

  // 1. Text Inputs
  const inpAddress = document.getElementById('inpVendorAddress');
  const inpGstNum = document.getElementById('inpVendorGstNumber');
  const otherInputs = form.querySelectorAll('#inpVendorName, #inpVendorPanNumber');

  if (isReadOnly) {
    if (inpAddress) { inpAddress.setAttribute('readonly', 'true'); inpAddress.style.backgroundColor = '#f8fafc'; }
    if (inpGstNum) { inpGstNum.setAttribute('readonly', 'true'); inpGstNum.style.backgroundColor = '#f8fafc'; }
    otherInputs.forEach(inp => { inp.setAttribute('readonly', 'true'); inp.style.backgroundColor = '#f8fafc'; });
  } else if (isEdit) {
    // Address is always editable
    if (inpAddress) { inpAddress.removeAttribute('readonly'); inpAddress.style.backgroundColor = '#ffffff'; }
    // GST Number editable only if GST toggle is active
    const isGstOn = document.getElementById('inpVendorGstToggle')?.checked === true;
    if (inpGstNum) {
      if (isGstOn) {
        inpGstNum.removeAttribute('readonly');
        inpGstNum.style.backgroundColor = '#ffffff';
      } else {
        inpGstNum.setAttribute('readonly', 'true');
        inpGstNum.style.backgroundColor = '#f8fafc';
      }
    }
    // Other inputs remain read-only
    otherInputs.forEach(inp => { inp.setAttribute('readonly', 'true'); inp.style.backgroundColor = '#f8fafc'; });
  } else {
    // Full Add mode
    if (inpAddress) { inpAddress.removeAttribute('readonly'); inpAddress.style.backgroundColor = '#ffffff'; }
    if (inpGstNum) { inpGstNum.removeAttribute('readonly'); inpGstNum.style.backgroundColor = '#ffffff'; }
    otherInputs.forEach(inp => { inp.removeAttribute('readonly'); inp.style.backgroundColor = '#ffffff'; });
  }

  // 2. Select Dropdowns
  const inpTdsCode = document.getElementById('inpTdsCode');
  const inpTdsRate = document.getElementById('inpTdsRate');
  const inpGstType = document.getElementById('inpVendorGstType');
  const otherSelects = form.querySelectorAll('#inpVendorEntityType, #inpVendorType, #inpServiceType, #inpVendorContractType');

  if (isReadOnly) {
    if (inpTdsCode) { inpTdsCode.setAttribute('disabled', 'true'); inpTdsCode.style.backgroundColor = '#f8fafc'; }
    if (inpTdsRate) { inpTdsRate.setAttribute('disabled', 'true'); inpTdsRate.style.backgroundColor = '#f8fafc'; }
    if (inpGstType) { inpGstType.setAttribute('disabled', 'true'); inpGstType.style.backgroundColor = '#f8fafc'; }
    otherSelects.forEach(sel => { sel.setAttribute('disabled', 'true'); sel.style.backgroundColor = '#f8fafc'; });
  } else if (isEdit) {
    // TDS Code and TDS Rate are editable
    if (inpTdsCode) { inpTdsCode.removeAttribute('disabled'); inpTdsCode.style.backgroundColor = '#ffffff'; }
    if (inpTdsRate) { inpTdsRate.removeAttribute('disabled'); inpTdsRate.style.backgroundColor = '#ffffff'; }
    // GST Type is editable if GST toggle is active
    const isGstOn = document.getElementById('inpVendorGstToggle')?.checked === true;
    if (inpGstType) {
      if (isGstOn) {
        inpGstType.removeAttribute('disabled');
        inpGstType.style.backgroundColor = '#ffffff';
      } else {
        inpGstType.setAttribute('disabled', 'true');
        inpGstType.style.backgroundColor = '#f8fafc';
      }
    }
    // Other selects remain disabled
    otherSelects.forEach(sel => { sel.setAttribute('disabled', 'true'); sel.style.backgroundColor = '#f8fafc'; });
  } else {
    // Full Add mode
    if (inpTdsCode) { inpTdsCode.removeAttribute('disabled'); inpTdsCode.style.backgroundColor = '#ffffff'; }
    if (inpTdsRate) { inpTdsRate.removeAttribute('disabled'); inpTdsRate.style.backgroundColor = '#ffffff'; }
    if (inpGstType) { inpGstType.removeAttribute('disabled'); inpGstType.style.backgroundColor = '#ffffff'; }
    otherSelects.forEach(sel => { sel.removeAttribute('disabled'); sel.style.backgroundColor = '#ffffff'; });
  }

  // 3. Slidebar Toggles
  const editableToggleIds = ['inpVendorGstToggle', 'inpTdsDeductionToggle', 'inpVendorStatusToggle'];
  const toggles = form.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(t => {
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (isReadOnly) {
      t.disabled = true;
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = 'none';
        parentSwitch.style.opacity = '0.65';
      }
    } else if (isEdit) {
      if (editableToggleIds.includes(t.id)) {
        t.disabled = false;
        if (parentSwitch) {
          parentSwitch.style.pointerEvents = 'auto';
          parentSwitch.style.opacity = '1';
        }
      } else {
        t.disabled = true;
        if (parentSwitch) {
          parentSwitch.style.pointerEvents = 'none';
          parentSwitch.style.opacity = '0.65';
        }
      }
    } else {
      // Full Add mode
      t.disabled = false;
      if (parentSwitch) {
        parentSwitch.style.pointerEvents = 'auto';
        parentSwitch.style.opacity = '1';
      }
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
  } else if (isEdit) {
    const isGstOn = document.getElementById('inpVendorGstToggle')?.checked === true;
    if (gstProcessBadge) {
      gstProcessBadge.style.pointerEvents = isGstOn ? 'auto' : 'none';
      gstProcessBadge.style.opacity = isGstOn ? '1' : '0.5';
      gstProcessBadge.style.cursor = isGstOn ? 'pointer' : 'default';
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
  // When business type is Supply -> hide Service Type and Contract Type
  // When business type is Service -> show Service Type
  if (bType.toLowerCase() === 'service') {
    if (rowServiceType) rowServiceType.style.setProperty('display', 'flex', 'important');
    // When service type is Project -> show Contract Type, otherwise hide
    if (sType.toLowerCase() === 'project') {
      if (rowContractType) rowContractType.style.setProperty('display', 'flex', 'important');
    } else {
      if (rowContractType) rowContractType.style.setProperty('display', 'none', 'important');
    }
  } else {
    // Supply
    if (rowServiceType) rowServiceType.style.setProperty('display', 'none', 'important');
    if (rowContractType) rowContractType.style.setProperty('display', 'none', 'important');
  }

  // 2. GST Slidebar logic:
  // When user enables GST -> show GST Number and GST Type
  // When GST is disabled -> hide GST Number and GST Type
  if (isGstOn) {
    if (rowGstType) rowGstType.style.setProperty('display', 'flex', 'important');
    if (rowGstNumber) rowGstNumber.style.setProperty('display', 'flex', 'important');
  } else {
    if (rowGstType) rowGstType.style.setProperty('display', 'none', 'important');
    if (rowGstNumber) rowGstNumber.style.setProperty('display', 'none', 'important');
  }

  // In edit mode, also update editable state of GST Number and GST Process badge
  if (isVendorFormEditing) {
    const inpGstNum = document.getElementById('inpVendorGstNumber');
    const inpGstTypeSel = document.getElementById('inpVendorGstType');
    const gstProcessBadge = document.querySelector('#rowVendorGstNumber .input-process-badge, #rowVendorGstNumber .input-pdf-badge');
    if (isGstOn) {
      if (inpGstNum) {
        inpGstNum.removeAttribute('readonly');
        inpGstNum.style.backgroundColor = '#ffffff';
      }
      if (inpGstTypeSel) {
        inpGstTypeSel.removeAttribute('disabled');
        inpGstTypeSel.style.backgroundColor = '#ffffff';
      }
      if (gstProcessBadge) {
        gstProcessBadge.style.pointerEvents = 'auto';
        gstProcessBadge.style.opacity = '1';
        gstProcessBadge.style.cursor = 'pointer';
      }
    } else {
      if (inpGstNum) {
        inpGstNum.setAttribute('readonly', 'true');
        inpGstNum.style.backgroundColor = '#f8fafc';
      }
      if (inpGstTypeSel) {
        inpGstTypeSel.setAttribute('disabled', 'true');
        inpGstTypeSel.style.backgroundColor = '#f8fafc';
      }
      if (gstProcessBadge) {
        gstProcessBadge.style.pointerEvents = 'none';
        gstProcessBadge.style.opacity = '0.5';
        gstProcessBadge.style.cursor = 'default';
      }
    }
  }
}
window.updateVendorConditionalFields = updateVendorConditionalFields;
window.updateVendorBusinessTypeFields = updateVendorConditionalFields;

window.openViewVendorCard = function(vendorId) {
  let vend = masterVendorData.find(v => v.id === vendorId || v.vendorName === vendorId || v.vendorId === vendorId);
  if (!vend) {
    vend = {
      id: vendorId || 'vend-1',
      vendorName: "Apex Telecom Infrastructure",
      entityType: "Private Limited",
      businessType: "Service",
      vendorType: "Service",
      serviceType: "Project",
      contractType: "B2B",
      vendorId: "230510678",
      gstEnabled: true,
      gstType: "SGST",
      gstNumber: "33ASMPM8643F1Z5",
      address: "123 Telecom Tower Complex, Chennai",
      panNumber: "ASMPM8643F",
      tdsDeduction: true,
      tdsCode: "1027",
      tdsRate: "1%",
      status: "Active"
    };
  }

  currentViewedVendorId = vend.id;
  isVendorFormEditing = false;
  openSideForm();

  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const card = document.getElementById('addVendorCard');
  if (card) card.style.display = 'block';

  const lblTitle = document.getElementById('lblVendorCardTitle');
  if (lblTitle) lblTitle.innerText = 'View Vendor';

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
  if (btnBank) btnBank.style.display = 'none';
  if (btnMessage) btnMessage.style.display = 'none';
  if (btnScope) btnScope.style.display = 'none';

  const btnSaveWrap = document.querySelector('#frmAddVendor .form-submit-inside-wrap');
  if (btnSaveWrap) btnSaveWrap.style.display = 'none';

  if (document.getElementById('inpVendorName')) document.getElementById('inpVendorName').value = vend.vendorName || '';
  if (document.getElementById('inpVendorEntityType')) document.getElementById('inpVendorEntityType').value = vend.entityType || 'Proprietorship';
  if (document.getElementById('inpVendorType')) document.getElementById('inpVendorType').value = (vend.businessType || vend.vendorType || 'Supply');
  if (document.getElementById('inpServiceType')) document.getElementById('inpServiceType').value = vend.serviceType || 'Project';
  if (document.getElementById('inpVendorContractType')) document.getElementById('inpVendorContractType').value = vend.contractType || 'B2B';
  if (document.getElementById('inpVendorAddress')) document.getElementById('inpVendorAddress').value = vend.address || '';
  if (document.getElementById('inpVendorPanNumber')) document.getElementById('inpVendorPanNumber').value = vend.panNumber || '';

  const chkGst = document.getElementById('inpVendorGstToggle');
  if (chkGst) {
    chkGst.checked = (vend.gstEnabled !== undefined) ? vend.gstEnabled : (vend.gstNumber && vend.gstNumber !== 'NA' && vend.gstNumber !== '');
  }

  if (document.getElementById('inpVendorGstType')) document.getElementById('inpVendorGstType').value = vend.gstType || 'SGST';
  if (document.getElementById('inpVendorGstNumber')) document.getElementById('inpVendorGstNumber').value = vend.gstNumber || '';

  const chkTds = document.getElementById('inpTdsDeductionToggle');
  if (chkTds) chkTds.checked = vend.tdsDeduction === true;

  if (document.getElementById('inpTdsCode')) document.getElementById('inpTdsCode').value = vend.tdsCode || '';
  if (document.getElementById('inpTdsRate')) document.getElementById('inpTdsRate').value = vend.tdsRate || '1%';

  const statusToggle = document.getElementById('inpVendorStatusToggle');
  if (statusToggle) {
    statusToggle.checked = (vend.status || '').toLowerCase() === 'active';
  }

  updateVendorConditionalFields();

  setVendorFormReadOnly(true);
  showToast(`Viewing vendor details: ${vend.vendorName}`);
};

let currentViewedProductId = null;
let isProductFormEditing = false;

function setProductFormReadOnly(isReadOnly, isEditModeOnly = false) {
  const form = document.getElementById('frmAddProduct');
  if (!form) return;

  const editableInEditModeIds = [
    'inpProductHsn',
    'inpProductGstRate',
    'inpProductMsq',
    'inpProductMoq',
    'inpProductInflation',
    'inpProductMargin',
    'inpProductOh'
  ];

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

  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'flex';

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

  if (document.getElementById('inpProductName')) document.getElementById('inpProductName').value = prod.productName || prod.productHead || '';
  if (document.getElementById('inpProductHead')) document.getElementById('inpProductHead').value = prod.productName || prod.productHead || '';
  if (document.getElementById('inpProductCategory')) document.getElementById('inpProductCategory').value = prod.productCategory || 'Tower Infrastructure';
  if (document.getElementById('inpProductCode')) document.getElementById('inpProductCode').value = prod.productCode || '';
  if (document.getElementById('inpProductHsn')) document.getElementById('inpProductHsn').value = prod.hsnCode || '';
  if (document.getElementById('inpProductUom')) document.getElementById('inpProductUom').value = prod.uom || 'Nos';
  if (document.getElementById('inpProductSaleUom')) document.getElementById('inpProductSaleUom').value = prod.saleUom || prod.uom || 'Nos';
  if (document.getElementById('inpProductUcf')) document.getElementById('inpProductUcf').value = prod.ucf || '';
  if (document.getElementById('inpProductGstRate')) document.getElementById('inpProductGstRate').value = prod.gstRate || prod.gst || '18%';
  if (document.getElementById('inpProductMsq')) document.getElementById('inpProductMsq').value = prod.msq || '';
  if (document.getElementById('inpProductMoq')) document.getElementById('inpProductMoq').value = prod.moq || '';
  if (document.getElementById('inpProductInflation')) document.getElementById('inpProductInflation').value = prod.inflation || '';
  if (document.getElementById('inpProductMargin')) document.getElementById('inpProductMargin').value = prod.margin || '5%';
  if (document.getElementById('inpProductOh')) document.getElementById('inpProductOh').value = prod.oh || '2%';

  const statusToggle = document.getElementById('inpProductStatusToggle');
  if (statusToggle) {
    statusToggle.checked = (prod.status || '').toLowerCase() === 'active';
  }

  setProductFormReadOnly(true);
  showToast(`Viewing product details: ${prod.productHead}`);
};

const defaultProductPriceHistory = {
  'prod-1': [
    { date: '12-08-2026', vendorName: 'Apex Telecom Ltd', rate: '4,50,000.00' },
    { date: '18-07-2026', vendorName: 'Indus Steel Fab', rate: '4,45,000.00' },
    { date: '05-06-2026', vendorName: 'Bharat Infra Works', rate: '4,60,000.00' },
    { date: '22-04-2026', vendorName: 'Zenith Towers Ltd', rate: '4,52,000.00' },
    { date: '10-02-2026', vendorName: 'Apex Telecom Ltd', rate: '4,48,000.00' }
  ],
  'prod-2': [
    { date: '14-08-2026', vendorName: 'Sterlite Tech Ltd', rate: '1,25,000.00' },
    { date: '02-07-2026', vendorName: 'Optic Fiber Corp', rate: '1,22,000.00' },
    { date: '19-05-2026', vendorName: 'Bharat Fiber Line', rate: '1,28,000.00' }
  ],
  'prod-3': [
    { date: '20-08-2026', vendorName: 'Kirloskar Power', rate: '8,75,000.00' },
    { date: '11-06-2026', vendorName: 'Cummins India', rate: '8,60,000.00' },
    { date: '15-03-2026', vendorName: 'Mahindra Powerol', rate: '8,80,000.00' }
  ],
  'prod-4': [
    { date: '25-08-2026', vendorName: 'Exide Industries', rate: '3,20,000.00' },
    { date: '09-07-2026', vendorName: 'Amara Raja Energy', rate: '3,15,000.00' },
    { date: '14-04-2026', vendorName: 'HBL Power Systems', rate: '3,25,000.00' }
  ],
  'prod-5': [
    { date: '05-09-2026', vendorName: 'Delta Electronics', rate: '2,80,000.00' },
    { date: '18-07-2026', vendorName: 'Vertiv Energy Ltd', rate: '2,75,000.00' },
    { date: '29-05-2026', vendorName: 'Eltek Power Ltd', rate: '2,85,000.00' }
  ]
};

window.openProductPriceTab = function(productId) {
  let prod = masterProductsData.find(p => p.id === productId || p.productName === productId || p.productHead === productId);
  if (!prod && productId && typeof productId === 'string' && productId.startsWith('prod-')) {
    prod = masterProductsData[0];
  }
  const productName = prod ? (prod.productName || prod.productHead || 'Product Name') : 'Product Name';
  const priceVal = prod ? (prod.price || prod.stockPrices || '4,50,000.00') : '4,50,000.00';

  const lblTitle = document.getElementById('lblProductPriceCardTitle');
  if (lblTitle) lblTitle.innerText = productName;

  const history = (defaultProductPriceHistory[productId] && defaultProductPriceHistory[productId].length > 0)
    ? defaultProductPriceHistory[productId]
    : defaultProductPriceHistory['prod-1'];

  const tbody = document.getElementById('tbodyProductPriceHistory');
  if (tbody) {
    tbody.innerHTML = history.map((item, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 10px; color: #475569; font-weight: normal; font-size: 13px;">${item.date}</td>
        <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 10px; color: #1e293b; font-weight: 500; font-size: 13px;">${item.vendorName}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 10px; color: #1e293b; font-weight: 500; font-size: 13px;">${item.rate}</td>
      </tr>
    `).join('');
  }

  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'flex';

  const cards = document.querySelectorAll('.side-form-card');
  cards.forEach(c => c.style.display = 'none');

  const card = document.getElementById('productPriceCard');
  if (card) card.style.display = 'block';

  showToast(`Viewing price history: ${productName}`);
};

let currentViewedExpenseId = null;
let isExpenseFormEditing = false;

function setExpenseFormReadOnly(isReadOnly, isEditModeOnly = false) {
  const form = document.getElementById('frmAddExpense');
  if (!form) return;
  const editableInEditModeIds = [
    'inpExpenseCategory',
    'inpExpenseSubCategory',
    'inpExpenseHead',
    'inpExpenseGst',
    'inpExpenseDepreciation'
  ];
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
    const parentSwitch = t.closest('.toggle-slide-switch');
    if (parentSwitch) {
      parentSwitch.style.pointerEvents = isReadOnly ? 'none' : 'auto';
      parentSwitch.style.opacity = isReadOnly ? '0.65' : '1';
    }
  });
}

window.openViewExpenseCard = function(expenseId) {
  let exp = masterExpensesData.find(e => e.id === expenseId || e.expenseHead === expenseId || e.expenseName === expenseId);
  if (!exp) {
    exp = masterExpensesData[0] || {
      id: expenseId || 'exp-1',
      expenseName: "Site Infrastructure & Telecom Tower Installation",
      expenseCategory: "Direct Operations",
      expenseSubCategory: "Civil Works",
      expenseHead: "Capex",
      gst: "18%",
      depreciation: "15%",
      rcm: "No",
      status: "Active"
    };
  }

  currentViewedExpenseId = exp.id;
  isExpenseFormEditing = false;

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

  if (document.getElementById('inpExpenseName')) document.getElementById('inpExpenseName').value = exp.expenseName || exp.expenseDescription || exp.expenseHead || '';
  if (document.getElementById('inpExpenseCategory')) document.getElementById('inpExpenseCategory').value = exp.expenseCategory || 'Direct Operations';
  if (document.getElementById('inpExpenseSubCategory')) document.getElementById('inpExpenseSubCategory').value = exp.expenseSubCategory || 'Civil Works';
  if (document.getElementById('inpExpenseHead')) document.getElementById('inpExpenseHead').value = exp.expenseHead || 'Capex';
  if (document.getElementById('inpExpenseGst')) document.getElementById('inpExpenseGst').value = exp.gst || exp.gstRate || '18%';
  if (document.getElementById('inpExpenseDepreciation')) document.getElementById('inpExpenseDepreciation').value = exp.depreciation || '10%';

  const rcmToggle = document.getElementById('inpExpenseRcmToggle');
  if (rcmToggle) {
    rcmToggle.checked = (exp.rcm || '').toLowerCase() === 'yes' || exp.rcm === true;
  }

  const statusToggle = document.getElementById('inpExpenseStatusToggle');
  if (statusToggle) {
    statusToggle.checked = (exp.status || '').toLowerCase() === 'active';
  }

  setExpenseFormReadOnly(true);
  showToast(`Viewing expense details: ${exp.expenseName || exp.expenseHead}`);
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
      headers = ["Vendor Name", "Business Type", "Service Type", "GST Number", "PAN Number", "GST Type", "Status"];
      rows = filteredDataset.map(r => [r.vendorName, r.businessType || r.vendorType, r.serviceType, r.gstNumber, r.panNumber, r.gstType, r.status]);
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

// ==========================================================================
// 11. WORKLIST PO SUPPLIER DETAIL VIEW & EDITING ENGINE
// ==========================================================================
let isPoSupplierEditing = false;
let selectedPoSupplierName = 'Supplier Name';
let selectedPoNo = 'PO #';
let selectedRfqNo = 'RFQ # :';

let poSupplierItems = [
  { id: 'pos-1', selected: false, materialDescription: 'PO', uom: 'Nos', stock: '10', pr: '5', existing: '1500.00', newRate: '1500.00', basic: '15000.00', gst: '2700.00', total: '17700.00' },
  { id: 'pos-2', selected: false, materialDescription: 'Non - PO', uom: 'LS', stock: '2', pr: '1', existing: '5000.00', newRate: '5000.00', basic: '5000.00', gst: '900.00', total: '5900.00' },
  { id: 'pos-3', selected: false, materialDescription: 'Service', uom: 'Nos', stock: '0', pr: '2', existing: '2500.00', newRate: '2500.00', basic: '5000.00', gst: '900.00', total: '5900.00' }
];

let poRfqCompareItems = [];

window.openWorklistPoSupplier = function(vendorName, poNo) {
  isPoSupplierEditing = false;
  poSupplierItems.forEach(item => item.selected = false);
  currentModule = 'worklist';
  currentWorklistView = 'po_supplier';
  selectedPoSupplierName = vendorName || 'Supplier Name';
  selectedPoNo = poNo || 'PO #';
  activeColumnFilters = {};
  updateURL();
  renderApp();
  showToast(`Opened Supplier Details: ${selectedPoSupplierName}`);
};

function updatePoRfqCompareTotals() {
  const tbody = document.getElementById('poRfqCompareModalTbody');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  let v1Total = 0;
  let v2Total = 0;
  let v3Total = 0;

  rows.forEach(r => {
    const cells = r.querySelectorAll('td');
    if (cells.length >= 14) {
      const v1 = parseFloat(cells[5].textContent.replace(/,/g, '').trim()) || 0;
      const v2 = parseFloat(cells[9].textContent.replace(/,/g, '').trim()) || 0;
      const v3 = parseFloat(cells[13].textContent.replace(/,/g, '').trim()) || 0;
      v1Total += v1;
      v2Total += v2;
      v3Total += v3;
    }
  });

  const totals = [
    { id: 'rfqTotalVendor1', val: v1Total },
    { id: 'rfqTotalVendor2', val: v2Total },
    { id: 'rfqTotalVendor3', val: v3Total }
  ];

  const sorted = [...totals].sort((a, b) => a.val - b.val);
  const minVal = sorted[0].val;
  const maxVal = sorted[sorted.length - 1].val;

  totals.forEach(t => {
    const el = document.getElementById(t.id);
    if (!el) return;
    el.textContent = t.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (t.val === minVal) {
      el.style.color = '#16a34a'; // Green (Low)
    } else if (t.val === maxVal) {
      el.style.color = '#dc2626'; // Red (High)
    } else {
      el.style.color = '#ea580c'; // Orange (Mid)
    }
  });
}

window.openWorklistPoRfqCompare = function(rfqNo) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const allCards = overlay.querySelectorAll('.side-form-card');
  allCards.forEach(c => c.style.display = 'none');

  const modal = document.getElementById('poRfqCompareModal');
  if (modal) {
    modal.style.display = 'block';
  }
  updatePoRfqCompareTotals();
  overlay.style.display = 'flex';
  showToast('Opened RFQ Comparison Tab');
};

window.closePoRfqCompareModal = function() {
  const modal = document.getElementById('poRfqCompareModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.togglePoSupplierRowSelect = function(rowId) {
  const item = poSupplierItems.find(i => i.id === rowId);
  if (item) {
    item.selected = !item.selected;
    if (!item.selected) {
      item.approved = false;
    }
    renderWorklistToolbar();
    applyFiltersAndRender();
  }
};

window.approveSelectedPoSupplierRows = function() {
  const selectedRows = poSupplierItems.filter(i => i.selected);
  if (selectedRows.length === 0) {
    showToast('Please select a row to approve');
    return;
  }
  selectedRows.forEach(item => {
    item.approved = true;
  });
  applyFiltersAndRender();
  showToast(`${selectedRows.length} row(s) approved & highlighted`);
};

window.togglePoSupplierEditMode = function() {
  if (!isPoSupplierEditing) {
    isPoSupplierEditing = true;
    renderWorklistToolbar();
    applyFiltersAndRender();
    showToast('PR and New columns are now editable');
  } else {
    const inputs = document.querySelectorAll('.po-supplier-edit-input');
    inputs.forEach(input => {
      const rowId = input.getAttribute('data-row-id');
      const field = input.getAttribute('data-field');
      const item = poSupplierItems.find(i => i.id === rowId);
      if (item && field) {
        item[field] = input.value.trim();
      }
    });

    // Recalculate basic, gst, total amounts based on PR * New
    poSupplierItems.forEach(item => {
      const prVal = parseFloat(item.pr) || 0;
      const newRateVal = parseFloat(item.newRate) || 0;
      if (prVal >= 0 && newRateVal >= 0) {
        const basicAmt = prVal * newRateVal;
        const gstAmt = basicAmt * 0.18;
        const totalAmt = basicAmt + gstAmt;
        item.basic = basicAmt.toFixed(2);
        item.gst = gstAmt.toFixed(2);
        item.total = totalAmt.toFixed(2);
      }
    });

    isPoSupplierEditing = false;
    renderWorklistToolbar();
    applyFiltersAndRender();
    showToast('Supplier PO details saved successfully!');
  }
};

window.openRfqCompareModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  document.querySelectorAll('#sideFormOverlay .side-form-card').forEach(card => {
    if (card.id !== 'rfqCompareModal') card.style.display = 'none';
  });
  const modal = document.getElementById('rfqCompareModal');
  if (modal) modal.style.display = 'block';
  if (overlay) overlay.style.display = 'block';
  showToast('RFQ Comparison modal opened');
};

window.closeRfqCompareModal = function() {
  const modal = document.getElementById('rfqCompareModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (modal) modal.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
};

// ==========================================================================
// 12. TRANSFER DETAILS MODAL (PAYMENT SUBPAGES SUBMIT ACTION)
// ==========================================================================

window.openTransferDetailsModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'transferDetailsModal') card.style.display = 'none';
  });

  const modal = document.getElementById('transferDetailsModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';

    // Reset fields to default (all slidebars in deactive state)
    const chkPartial = document.getElementById('chkPartialPayment');
    if (chkPartial) chkPartial.checked = false;
    const rowProcess = document.getElementById('rowProcessPayment');
    if (rowProcess) rowProcess.style.display = 'none';
    const inpProcess = document.getElementById('inpProcessPayment');
    if (inpProcess) inpProcess.value = '';
    const selBank = document.getElementById('selTransferBank');
    if (selBank) selBank.selectedIndex = 0;
    const chkImps = document.getElementById('chkImpsTransfer');
    if (chkImps) chkImps.checked = false;
    const chkWhatsapp = document.getElementById('chkWhatsappReceipt');
    if (chkWhatsapp) chkWhatsapp.checked = false;
  }
};

window.closeTransferDetailsModal = function() {
  const modal = document.getElementById('transferDetailsModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';

  if (currentWorklistView !== 'payment') {
    currentWorklistView = 'payment';
    activeColumnFilters = {};
    updateURL();
    renderApp();
  }
};

window.togglePartialPaymentField = function(isChecked) {
  const rowProcess = document.getElementById('rowProcessPayment');
  if (rowProcess) {
    rowProcess.style.display = isChecked ? 'flex' : 'none';
    if (isChecked) {
      const inpProcess = document.getElementById('inpProcessPayment');
      if (inpProcess) inpProcess.focus();
    }
  }
};

window.submitTransferDetails = function() {
  const chkPartial = document.getElementById('chkPartialPayment');
  const inpProcess = document.getElementById('inpProcessPayment');

  if (chkPartial && chkPartial.checked && inpProcess && !inpProcess.value.trim()) {
    showToast('Please enter Process payment amount');
    inpProcess.focus();
    return;
  }

  showToast('Transfer Details Submitted Successfully!');
  closeTransferDetailsModal();
};

window.submitPoSupplier = function() {
  showToast('PO Details Submitted Successfully!');
};

window.openDprMembersModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'dprMembersModal') card.style.display = 'none';
  });

  const modal = document.getElementById('dprMembersModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeDprMembersModal = function() {
  const modal = document.getElementById('dprMembersModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openDprAttendanceModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'dprAttendanceModal') card.style.display = 'none';
  });

  const modal = document.getElementById('dprAttendanceModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeDprAttendanceModal = function() {
  const modal = document.getElementById('dprAttendanceModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openDprDocumentsModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'dprDocumentsModal') card.style.display = 'none';
  });

  const modal = document.getElementById('dprDocumentsModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeDprDocumentsModal = function() {
  const modal = document.getElementById('dprDocumentsModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openDprSurveyReportModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'dprSurveyReportModal') card.style.display = 'none';
  });

  const modal = document.getElementById('dprSurveyReportModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeDprSurveyReportModal = function() {
  const modal = document.getElementById('dprSurveyReportModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.triggerBoqFileUpload = function() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name;
      const ext = fileName.split('.').pop().toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
        showToast('Invalid file format. Please select a .csv or .xlsx file');
        return;
      }
      showToast(`File "${fileName}" uploaded successfully!`);
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();
  setTimeout(() => {
    if (document.body.contains(fileInput)) {
      document.body.removeChild(fileInput);
    }
  }, 1000);
};

window.openBoqWccModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'boqWccModal') card.style.display = 'none';
  });

  const modal = document.getElementById('boqWccModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeBoqWccModal = function() {
  const modal = document.getElementById('boqWccModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openBoqInvoiceModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'boqInvoiceModal') card.style.display = 'none';
  });

  const modal = document.getElementById('boqInvoiceModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeBoqInvoiceModal = function() {
  const modal = document.getElementById('boqInvoiceModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openPaymentReceiptModal = function(title = 'Payment Receipt', amountColLabel = 'Received Amount') {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'paymentReceiptModal') card.style.display = 'none';
  });

  const modal = document.getElementById('paymentReceiptModal');
  if (modal) {
    const lblTitle = document.getElementById('lblPaymentReceiptTitle');
    if (lblTitle) lblTitle.innerText = title;

    const colHeader = document.getElementById('lblPaymentReceiptAmountCol');
    if (colHeader) colHeader.innerText = amountColLabel;

    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closePaymentReceiptModal = function() {
  const modal = document.getElementById('paymentReceiptModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsSalesInvoiceModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsSalesInvoiceModal') card.style.display = 'none';
  });

  const row = (typeof accountsSalesData !== 'undefined' && accountsSalesData.find(r => r.id === rowId)) || 
              (typeof accountsSalesData !== 'undefined' && accountsSalesData[0]) || {
                customerName: 'Indus Towers Ltd',
                invoiceNo: 'INV-2026-001',
                basicAmount: '10,59,322.03',
                cgst: '95,338.98',
                sgst: '95,338.98',
                igst: '0.00'
              };

  const lblTitle = document.getElementById('lblAccountsSalesInvoiceTitle');
  if (lblTitle) {
    lblTitle.innerText = `${row.customerName || 'Customer'} - ${row.invoiceNo || 'Invoice'}`;
  }

  const lblSumVal = document.getElementById('lblAccountsSalesInvoiceSumVal');
  if (lblSumVal) {
    lblSumVal.innerText = row.invoiceAmount || '12,50,000.00';
  }

  const inpBasic = document.getElementById('inpSalesInvoiceBasic');
  if (inpBasic) inpBasic.value = row.basicAmount || '10,59,322.03';

  const inpCgst = document.getElementById('inpSalesInvoiceCgst');
  if (inpCgst) inpCgst.value = row.cgst || '95,338.98';

  const inpSgst = document.getElementById('inpSalesInvoiceSgst');
  if (inpSgst) inpSgst.value = row.sgst || '95,338.98';

  const inpIgst = document.getElementById('inpSalesInvoiceIgst');
  if (inpIgst) inpIgst.value = row.igst || '0.00';

  const modal = document.getElementById('accountsSalesInvoiceModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsSalesInvoiceModal = function() {
  const modal = document.getElementById('accountsSalesInvoiceModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsSalesDeductionModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsSalesDeductionModal') card.style.display = 'none';
  });

  const row = (typeof accountsSalesData !== 'undefined' && accountsSalesData.find(r => r.id === rowId)) || 
              (typeof accountsSalesData !== 'undefined' && accountsSalesData[0]) || {
                invoiceNo: 'INV-2026-001',
                deduction: '25,000.00',
                tds: '25,000.00',
                dn: '0.00',
                dnDetails: 'N/A',
                tredsDiscountAmount: '0.00',
                tredsProcessingFee: '0.00',
                tredsGst: '0.00'
              };

  const lblTitle = document.getElementById('lblAccountsSalesDeductionTitle');
  if (lblTitle) {
    lblTitle.innerText = `Deduction Details - ${row.invoiceNo || 'Invoice'}`;
  }

  const lblSumVal = document.getElementById('lblAccountsSalesDeductionSumVal');
  if (lblSumVal) {
    lblSumVal.innerText = row.deduction || '10,00,000.00';
  }

  const inpTds = document.getElementById('inpSalesDeductionTds');
  if (inpTds) inpTds.value = row.tds || row.deduction || '25,000.00';

  const inpDn = document.getElementById('inpSalesDeductionDn');
  if (inpDn) inpDn.value = row.dn || '0.00';

  const inpDnDetails = document.getElementById('inpSalesDeductionDnDetails');
  if (inpDnDetails) inpDnDetails.value = row.dnDetails || 'N/A';

  const inpTredsDiscount = document.getElementById('inpSalesDeductionTredsDiscount');
  if (inpTredsDiscount) inpTredsDiscount.value = row.tredsDiscountAmount || '0.00';

  const inpTredsFee = document.getElementById('inpSalesDeductionTredsFee');
  if (inpTredsFee) inpTredsFee.value = row.tredsProcessingFee || '0.00';

  const inpTredsGst = document.getElementById('inpSalesDeductionTredsGst');
  if (inpTredsGst) inpTredsGst.value = row.tredsGst || '0.00';

  const modal = document.getElementById('accountsSalesDeductionModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsSalesDeductionModal = function() {
  const modal = document.getElementById('accountsSalesDeductionModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsSalesPaymentModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsSalesPaymentModal') card.style.display = 'none';
  });

  const row = (typeof accountsSalesData !== 'undefined' && accountsSalesData.find(r => r.id === rowId)) || 
              (typeof accountsSalesData !== 'undefined' && accountsSalesData[0]) || {
                invoiceNo: 'INV-2026-001',
                receivedAmount: '12,25,000.00',
                paymentRecords: [
                  { date: "13-09-2026", amount: "12,25,000.00", refNo: "UTR2026091301", receiptNo: "RCP-2026-101" }
                ]
              };

  const lblTitle = document.getElementById('lblAccountsSalesPaymentTitle');
  if (lblTitle) {
    lblTitle.innerText = `Payment Details - ${row.invoiceNo || 'Invoice'}`;
  }

  const tbody = document.getElementById('tbodyAccountsSalesPayment');
  if (tbody) {
    const list = (row.paymentRecords && row.paymentRecords.length > 0) ? row.paymentRecords : [
      { date: "13-09-2026", amount: row.receivedAmount || "12,25,000.00", refNo: "UTR2026091301", receiptNo: "RCP-2026-101" }
    ];
    tbody.innerHTML = list.map((item, idx) => `
      <tr style="${idx !== list.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''}">
        <td style="width: 18ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.date || ''}</td>
        <td style="width: 20ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${item.amount || ''}</td>
        <td style="width: 22ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #475569; font-size: 0.95rem;">${item.refNo || ''}</td>
        <td style="width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #475569; font-size: 0.95rem;">${item.receiptNo || ''}</td>
      </tr>
    `).join('');
  }

  const modal = document.getElementById('accountsSalesPaymentModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsSalesPaymentModal = function() {
  const modal = document.getElementById('accountsSalesPaymentModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsSalesSummaryModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsSalesSummaryModal') card.style.display = 'none';
  });

  const titleBadge = document.getElementById('lblAccountsSalesSummaryTitle');
  if (titleBadge) {
    titleBadge.innerText = 'Sales From 12 - 08 - 2026 To 25 - 08 - 2026';
  }

  // Populate dynamic summary values
  let totalInv = 0;
  let totalRec = 0;
  let totalGst = 0;

  if (typeof accountsSalesData !== 'undefined' && Array.isArray(accountsSalesData)) {
    accountsSalesData.forEach(r => {
      const invAmt = parseFloat(String(r.invoiceAmount || '0').replace(/,/g, '')) || 0;
      const recAmt = parseFloat(String(r.receivedAmount || '0').replace(/,/g, '')) || 0;
      const cgst = parseFloat(String(r.cgst || '0').replace(/,/g, '')) || 0;
      const sgst = parseFloat(String(r.sgst || '0').replace(/,/g, '')) || 0;
      const igst = parseFloat(String(r.igst || '0').replace(/,/g, '')) || 0;
      totalInv += invAmt;
      totalRec += recAmt;
      totalGst += (cgst + sgst + igst);
    });
  }

  if (totalInv === 0) {
    totalInv = 5265000;
    totalRec = 5159700;
    totalGst = 803135.57;
  }

  const receivableInv = Math.max(0, totalInv - totalRec);
  const recRatio = totalInv > 0 ? (totalRec / totalInv) : 1;
  const receivedGst = totalGst * recRatio;
  const receivableGst = Math.max(0, totalGst - receivedGst);

  const formatCurrency = (num) => num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const elTotalInv = document.getElementById('valSalesSummaryTotalInvoice');
  if (elTotalInv) elTotalInv.innerText = formatCurrency(totalInv);

  const elTotalGst = document.getElementById('valSalesSummaryTotalGst');
  if (elTotalGst) elTotalGst.innerText = formatCurrency(totalGst);

  const elRecInv = document.getElementById('valSalesSummaryReceivedInvoice');
  if (elRecInv) elRecInv.innerText = formatCurrency(totalRec);

  const elRecGst = document.getElementById('valSalesSummaryReceivedGst');
  if (elRecGst) elRecGst.innerText = formatCurrency(receivedGst);

  const elRecvbleInv = document.getElementById('valSalesSummaryReceivableInvoice');
  if (elRecvbleInv) elRecvbleInv.innerText = formatCurrency(receivableInv);

  const elRecvbleGst = document.getElementById('valSalesSummaryReceivableGst');
  if (elRecvbleGst) elRecvbleGst.innerText = formatCurrency(receivableGst);

  const modal = document.getElementById('accountsSalesSummaryModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsSalesSummaryModal = function() {
  const modal = document.getElementById('accountsSalesSummaryModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

let currentPaymentModalRowId = 'acc-pay-1';

window.openAccountsPaymentTransferToModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  currentPaymentModalRowId = rowId || 'acc-pay-1';

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsPaymentTransferToModal') card.style.display = 'none';
  });

  const row = (typeof accountsPaymentData !== 'undefined' && accountsPaymentData.find(r => r.id === currentPaymentModalRowId)) || 
              (typeof accountsPaymentData !== 'undefined' && accountsPaymentData[0]) || {
                transferredTo: "Schneider Electric India Pvt Ltd",
                approved: "12,00,000.00",
                transferred: "10,00,000.00",
                payable: "2,00,000.00",
                items: [
                  {
                    requestDate: "10-08-2026",
                    requestBy: "Rajesh Kumar",
                    expenseCategory: "Electrical Equipment",
                    expenseName: "33KV Transformer Unit",
                    uom: "Nos",
                    qty: "2",
                    rate: "4,00,000.00",
                    gst: "18%",
                    amount: "9,44,000.00"
                  },
                  {
                    requestDate: "11-08-2026",
                    requestBy: "Rajesh Kumar",
                    expenseCategory: "Electrical Cables",
                    expenseName: "Armoured Power Cable 240sqmm",
                    uom: "Mtr",
                    qty: "500",
                    rate: "434.00",
                    gst: "18%",
                    amount: "2,56,000.00"
                  }
                ]
              };

  const titleBadge = document.getElementById('lblAccountsPaymentTransferToTitle');
  if (titleBadge) {
    titleBadge.innerText = `Transfer To`;
  }

  const elSum = document.getElementById('valPaymentTransferToSummation');
  if (elSum) elSum.innerText = row.approved || '12,00,000.00';

  const elPaid = document.getElementById('valPaymentTransferToPaid');
  if (elPaid) elPaid.innerText = row.transferred || '10,00,000.00';

  const elPayable = document.getElementById('valPaymentTransferToPayable');
  if (elPayable) elPayable.innerText = row.payable || '2,00,000.00';

  const tbody = document.getElementById('tbodyAccountsPaymentTransferTo');
  if (tbody) {
    const list = (row.items && row.items.length > 0) ? row.items : [
      {
        requestDate: "10-08-2026",
        requestBy: "Rajesh Kumar",
        expenseCategory: "Electrical Equipment",
        expenseName: "33KV Transformer Unit",
        uom: "Nos",
        qty: "2",
        rate: "4,00,000.00",
        gst: "18%",
        amount: row.approved || "12,00,000.00"
      }
    ];

    tbody.innerHTML = list.map((item, idx) => `
      <tr style="${idx !== list.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''}">
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.requestDate || ''}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.requestBy || ''}</td>
        <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis;" title="${(item.expenseCategory || '').replace(/"/g, '&quot;')}">${item.expenseCategory || ''}</td>
        <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis;" title="${(item.expenseName || '').replace(/"/g, '&quot;')}">${item.expenseName || ''}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.uom || ''}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.qty || ''}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.rate || ''}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.gst || ''}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${item.amount || ''}</td>
      </tr>
    `).join('');
  }

  const modal = document.getElementById('accountsPaymentTransferToModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsPaymentTransferToModal = function() {
  const modal = document.getElementById('accountsPaymentTransferToModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsPaymentBankDetailsModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const targetId = rowId || currentPaymentModalRowId || 'acc-pay-1';
  const row = (typeof accountsPaymentData !== 'undefined' && accountsPaymentData.find(r => r.id === targetId)) || 
              (typeof accountsPaymentData !== 'undefined' && accountsPaymentData[0]) || {
                transferredTo: "Schneider Electric India Pvt Ltd",
                bankDetails: {
                  accountName: "Schneider Electric India Pvt Ltd",
                  accountNumber: "50200012345678",
                  ifscCode: "HDFC0000123",
                  bankName: "HDFC Bank"
                }
              };

  const bank = row.bankDetails || {
    accountName: row.transferredTo || "Schneider Electric India Pvt Ltd",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0000123",
    bankName: "HDFC Bank"
  };

  const inpAccName = document.getElementById('inpBankDetailsAccountName');
  if (inpAccName) inpAccName.value = bank.accountName || row.transferredTo || '';

  const inpAccNo = document.getElementById('inpBankDetailsAccountNumber');
  if (inpAccNo) inpAccNo.value = bank.accountNumber || '';

  const inpIfsc = document.getElementById('inpBankDetailsIfscCode');
  if (inpIfsc) inpIfsc.value = bank.ifscCode || '';

  const inpBankName = document.getElementById('inpBankDetailsBankName');
  if (inpBankName) inpBankName.value = bank.bankName || '';

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsPaymentBankDetailsModal') card.style.display = 'none';
  });

  const modal = document.getElementById('accountsPaymentBankDetailsModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsPaymentBankDetailsModal = function() {
  const bankModal = document.getElementById('accountsPaymentBankDetailsModal');
  if (bankModal) bankModal.style.display = 'none';

  // Return smoothly to Transfer To modal
  const transferModal = document.getElementById('accountsPaymentTransferToModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (transferModal && currentPaymentModalRowId) {
    transferModal.style.display = 'block';
    if (overlay) overlay.style.display = 'flex';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
};

window.openAccountsPaymentDetailsModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const targetId = rowId || currentPaymentModalRowId || 'acc-pay-1';
  const row = (typeof accountsPaymentData !== 'undefined' && accountsPaymentData.find(r => r.id === targetId)) || 
              (typeof accountsPaymentData !== 'undefined' && accountsPaymentData[0]) || {
                transferredTo: "Schneider Electric India Pvt Ltd",
                requestNo: "REQ-2026-101",
                invoiceNo: "INV-2026-8812",
                transferred: "10,00,000.00"
              };

  const titleBadge = document.getElementById('lblAccountsPaymentDetailsTitle');
  if (titleBadge) {
    const invLabel = row.invoiceNo || row.requestNo || 'Invoice Number';
    titleBadge.innerText = `Payment Details - ${invLabel}`;
  }

  const tbody = document.getElementById('tbodyAccountsPaymentDetails');
  if (tbody) {
    const list = (row.paymentDetailsList && row.paymentDetailsList.length > 0) ? row.paymentDetailsList : [
      {
        paymentDate: "12-08-2026",
        amount: "6,00,000.00",
        paymentRefNo: "NEFT/2608123456",
        receiptNumber: "REC-2026-001"
      },
      {
        paymentDate: "18-08-2026",
        amount: "4,00,000.00",
        paymentRefNo: "RTGS/2608901234",
        receiptNumber: "REC-2026-003"
      }
    ];

    tbody.innerHTML = list.map((item, idx) => `
      <tr style="${idx !== list.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''}">
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.paymentDate || ''}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${item.amount || ''}</td>
        <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.paymentRefNo || ''}</td>
        <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${item.receiptNumber || ''}</td>
      </tr>
    `).join('');
  }

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsPaymentDetailsModal') card.style.display = 'none';
  });

  const modal = document.getElementById('accountsPaymentDetailsModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsPaymentDetailsModal = function() {
  const detailsModal = document.getElementById('accountsPaymentDetailsModal');
  if (detailsModal) detailsModal.style.display = 'none';

  // Return smoothly to Transfer To modal
  const transferModal = document.getElementById('accountsPaymentTransferToModal');
  const overlay = document.getElementById('sideFormOverlay');
  if (transferModal && currentPaymentModalRowId) {
    transferModal.style.display = 'block';
    if (overlay) overlay.style.display = 'flex';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
};

let currentTdsSummaryRowId = 'acc-tds-1';
let activeTdsSummaryFilters = {};
let currentTdsSummaryFilterCol = null;

function getTdsMonthRow(rowId) {
  if (typeof accountsTdsData === 'undefined') return { month: "April", items: [] };
  let found = null;
  accountsTdsData.forEach(q => {
    (q.months || []).forEach(m => {
      if (m.id === rowId || m.month === rowId) found = m;
    });
  });
  if (!found && accountsTdsData[0] && accountsTdsData[0].months && accountsTdsData[0].months[0]) {
    found = accountsTdsData[0].months[0];
  }
  return found || { month: "April", items: [] };
}

function renderAccountsTdsSummaryTable() {
  const tbody = document.getElementById('tbodyAccountsTdsSummary');
  if (!tbody) return;

  const row = getTdsMonthRow(currentTdsSummaryRowId);
  const list = (row.items && row.items.length > 0) ? row.items : [];

  let filtered = list.filter(item => {
    for (const [colKey, allowedSet] of Object.entries(activeTdsSummaryFilters)) {
      const cellVal = String(item[colKey] !== undefined ? item[colKey] : '');
      if (!allowedSet.has(cellVal)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 18px;">No matching TDS records found.</td></tr>`;
    updateTdsSummaryFilterBtnStates();
    return;
  }

  tbody.innerHTML = filtered.map((item, idx) => `
    <tr style="${idx !== filtered.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''}">
      <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${item.tdsType || ''}</td>
      <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-family: monospace; font-weight: 500;">${item.panNumber || ''}</td>
      <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #0454e4; font-size: 0.95rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis;" title="${(item.panName || '').replace(/"/g, '&quot;')}">
        <a href="#" class="td-link-blue" onclick="openAccountsTdsDetailsModal('${row.id}', '${(item.panNumber || '').replace(/'/g, "\\'")}', '${(item.panName || '').replace(/'/g, "\\'")}'); return false;" style="color: #0454e4; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; cursor: pointer;">${item.panName || ''}</a>
      </td>
      <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${item.taxable || ''}</td>
      <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 12px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${item.tds || ''}</td>
    </tr>
  `).join('');

  updateTdsSummaryFilterBtnStates();
}

function updateTdsSummaryFilterBtnStates() {
  document.querySelectorAll('#tblAccountsTdsSummaryPopup .filter-funnel-btn, #tblAccountsTdsSummaryPopup .contact-th-filter-btn').forEach(btn => {
    const col = btn.getAttribute('data-filter-col');
    if (activeTdsSummaryFilters[col]) {
      btn.classList.add('has-active-filter');
    } else {
      btn.classList.remove('has-active-filter');
    }
  });
}

function initTdsSummaryTableFilters() {
  document.querySelectorAll('#tblAccountsTdsSummaryPopup .filter-funnel-btn, #tblAccountsTdsSummaryPopup .contact-th-filter-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const colKey = btn.getAttribute('data-filter-col');
      openTdsSummaryFilter(colKey, btn);
    };
  });
}

function openTdsSummaryFilter(colKey, triggerBtn) {
  currentTdsSummaryFilterCol = colKey;
  const dropdown = document.getElementById('excelFilterDropdown');
  const searchInput = document.getElementById('filterSearchInput');
  const chkList = document.getElementById('filterCheckboxList');
  const chkSelectAll = document.getElementById('chkFilterSelectAll');

  if (!dropdown) return;
  if (searchInput) searchInput.value = '';

  const row = getTdsMonthRow(currentTdsSummaryRowId);
  const items = row.items || [];

  const uniqueValues = Array.from(new Set(items.map(r => String(r[colKey] !== undefined ? r[colKey] : ''))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const activeSet = activeTdsSummaryFilters[colKey];

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

  dropdown.dataset.filterContext = 'tdsSummary';
  dropdown.style.display = 'flex';
  dropdown.style.top = `${rect.bottom + window.scrollY + 6}px`;
  dropdown.style.left = `${Math.max(12, leftPos)}px`;

  if (searchInput) searchInput.focus();
}

window.handleGstRowSelection = function(radio) {
  const pdfBtn = document.getElementById('btnAccountsGstPdfUpload');
  if (pdfBtn) {
    pdfBtn.style.display = (radio && radio.checked) ? 'inline-flex' : 'none';
  }
};

window.openAccountsTdsSummaryModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  currentTdsSummaryRowId = rowId || 'acc-tds-1';
  activeTdsSummaryFilters = {};

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsTdsSummaryModal') card.style.display = 'none';
  });

  const row = getTdsMonthRow(currentTdsSummaryRowId);

  const titleBadge = document.getElementById('lblAccountsTdsSummaryTitle');
  if (titleBadge) {
    titleBadge.innerText = `TDS Summary Report for the Month of ${row.month || 'April'} 2026`;
  }

  renderAccountsTdsSummaryTable();
  initTdsSummaryTableFilters();

  const modal = document.getElementById('accountsTdsSummaryModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsTdsSummaryModal = function() {
  const modal = document.getElementById('accountsTdsSummaryModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsTdsDetailsModal = function(rowId, panNumber, panName) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const targetRowId = rowId || currentTdsSummaryRowId || 'acc-tds-1';
  const monthRow = getTdsMonthRow(targetRowId);

  let detailList = [];
  let resolvedPanName = panName || '';
  let resolvedPanNumber = panNumber || '';

  if (monthRow && monthRow.items) {
    if (panNumber || panName) {
      const matchItem = monthRow.items.find(it => (panNumber && it.panNumber === panNumber) || (panName && it.panName === panName));
      if (matchItem) {
        if (matchItem.details) detailList = matchItem.details;
        resolvedPanName = matchItem.panName || resolvedPanName;
        resolvedPanNumber = matchItem.panNumber || resolvedPanNumber;
      }
    }
    if (detailList.length === 0) {
      monthRow.items.forEach(it => {
        if (it.details) detailList.push(...it.details);
      });
      if (!resolvedPanName && monthRow.items[0]) {
        resolvedPanName = monthRow.items[0].panName;
        resolvedPanNumber = monthRow.items[0].panNumber;
      }
    }
  }

  if (detailList.length === 0) {
    resolvedPanName = resolvedPanName || "Schneider Electric India Pvt Ltd";
    resolvedPanNumber = resolvedPanNumber || "AAACB1234D";
    detailList = [
      { paymentDate: "12-04-2026", particulars: "Supply of Telecom Electrical Parts", taxableAmount: "3,50,000.00", tdsRate: "10%", deductedAmount: "35,000.00" },
      { paymentDate: "24-04-2026", particulars: "Maintenance & AMC Services", taxableAmount: "3,00,000.00", tdsRate: "10%", deductedAmount: "30,000.00" }
    ];
  }

  const titleBadge = document.getElementById('lblAccountsTdsDetailsTitle');
  if (titleBadge) {
    if (resolvedPanName && resolvedPanNumber) {
      titleBadge.innerText = `${resolvedPanName} - ${resolvedPanNumber}`;
    } else {
      titleBadge.innerText = resolvedPanName || resolvedPanNumber || 'PAN Name - PAN Number';
    }
  }

  const tbody = document.getElementById('tbodyAccountsTdsDetails');
  if (tbody) {
    tbody.innerHTML = detailList.map((d, idx) => `
      <tr style="${idx !== detailList.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''}">
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem;">${d.paymentDate || ''}</td>
        <td style="width: 30ch; min-width: 30ch; max-width: 30ch; text-align: left !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis;" title="${(d.particulars || 'Payment towards Services').replace(/"/g, '&quot;')}">${d.particulars || 'Payment towards Services'}</td>
        <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${d.taxableAmount || ''}</td>
        <td style="width: 10ch; min-width: 10ch; max-width: 10ch; text-align: center !important; padding: 10px 6px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${d.tdsRate || d.tdsCode || '10%'}</td>
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: right !important; padding: 10px 8px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${d.deductedAmount || d.taxAmount || ''}</td>
      </tr>
    `).join('');
  }

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsTdsDetailsModal') card.style.display = 'none';
  });

  const modal = document.getElementById('accountsTdsDetailsModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsTdsDetailsModal = function() {
  const detailsModal = document.getElementById('accountsTdsDetailsModal');
  if (detailsModal) detailsModal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsPurchaseInvoiceModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const row = (typeof accountsPurchaseData !== 'undefined' && accountsPurchaseData.find(r => r.id === rowId)) || 
              (typeof accountsPurchaseData !== 'undefined' && accountsPurchaseData[0]) || {
                vendorName: "Schneider Electric India Pvt Ltd",
                invoiceNo: "INV-2026-8812",
                basicAmount: "10,59,322.03",
                cgst: "95,338.98",
                sgst: "95,338.98",
                igst: "0.00"
              };

  const titleBadge = document.getElementById('lblAccountsPurchaseInvoiceTitle');
  if (titleBadge) {
    titleBadge.innerText = `${row.vendorName || ''} – ${row.invoiceNo || ''}`;
  }

  const lblSumVal = document.getElementById('lblPurchaseInvoiceSumVal');
  if (lblSumVal) {
    lblSumVal.innerText = row.invoiceAmount || '12,50,000.00';
  }

  const inpBasic = document.getElementById('inpPurchaseModalBasic');
  if (inpBasic) inpBasic.value = row.basicAmount || '10,59,322.03';

  const inpCgst = document.getElementById('inpPurchaseModalCgst');
  if (inpCgst) inpCgst.value = row.cgst || '95,338.98';

  const inpSgst = document.getElementById('inpPurchaseModalSgst');
  if (inpSgst) inpSgst.value = row.sgst || '95,338.98';

  const inpIgst = document.getElementById('inpPurchaseModalIgst');
  if (inpIgst) inpIgst.value = row.igst || '0.00';

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsPurchaseInvoiceModal') card.style.display = 'none';
  });

  const modal = document.getElementById('accountsPurchaseInvoiceModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsPurchaseInvoiceModal = function() {
  const modal = document.getElementById('accountsPurchaseInvoiceModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsPurchasePaymentDetailsModal = function(rowId) {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const row = (typeof accountsPurchaseData !== 'undefined' && accountsPurchaseData.find(r => r.id === rowId)) || 
              (typeof accountsPurchaseData !== 'undefined' && accountsPurchaseData[0]) || {
                vendorName: "Schneider Electric India Pvt Ltd",
                invoiceNo: "INV-2026-8812",
                paidAmount: "10,00,000.00",
                payments: [
                  { paymentDate: "13-09-2026", amount: "5,00,000.00", paymentRefNo: "", receiptNumber: "" },
                  { paymentDate: "13-09-2026", amount: "3,00,000.00", paymentRefNo: "", receiptNumber: "" },
                  { paymentDate: "13-09-2026", amount: "2,00,000.00", paymentRefNo: "", receiptNumber: "" }
                ]
              };

  const titleBadge = document.getElementById('lblAccountsPurchasePaymentDetailsTitle');
  if (titleBadge) {
    titleBadge.innerText = `Payment Details - ${row.invoiceNo || ''}`;
  }

  const tbody = document.getElementById('tbodyAccountsPurchasePaymentDetails');
  if (tbody) {
    const list = (row.payments && row.payments.length > 0) ? row.payments : [
      { paymentDate: "13-09-2026", amount: row.paidAmount || "10,00,000.00", paymentRefNo: "", receiptNumber: "" }
    ];

    tbody.innerHTML = list.map((p, idx) => `
      <tr style="${idx !== list.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''}">
        <td style="width: 15ch; min-width: 15ch; max-width: 15ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${p.paymentDate || ''}</td>
        <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: right !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-weight: 500;">${p.amount || ''}</td>
        <td style="width: 25ch; min-width: 25ch; max-width: 25ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-family: monospace; font-weight: 500;">${p.paymentRefNo || ''}</td>
        <td style="width: 20ch; min-width: 20ch; max-width: 20ch; text-align: center !important; padding: 10px 14px; white-space: nowrap; color: #1e293b; font-size: 0.95rem; font-family: monospace; font-weight: 500;">${p.receiptNumber || ''}</td>
      </tr>
    `).join('');
  }

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsPurchasePaymentDetailsModal') card.style.display = 'none';
  });

  const modal = document.getElementById('accountsPurchasePaymentDetailsModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsPurchasePaymentDetailsModal = function() {
  const modal = document.getElementById('accountsPurchasePaymentDetailsModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.openAccountsPurchaseSummaryModal = function() {
  const overlay = document.getElementById('sideFormOverlay');
  if (!overlay) return;

  const titleBadge = document.getElementById('lblAccountsPurchaseSummaryTitle');
  if (titleBadge) {
    titleBadge.innerText = 'Purchase From DD - MM - YYYY To DD - MM - YYYY';
  }

  const cTotalBasic = document.getElementById('cellPurchaseSummaryTotalBasic');
  const cTotalGst = document.getElementById('cellPurchaseSummaryTotalGst');
  const cPaidBasic = document.getElementById('cellPurchaseSummaryPaidBasic');
  const cPaidGst = document.getElementById('cellPurchaseSummaryPaidGst');
  const cPayableBasic = document.getElementById('cellPurchaseSummaryPayableBasic');
  const cPayableGst = document.getElementById('cellPurchaseSummaryPayableGst');

  if (cTotalBasic) cTotalBasic.innerText = '150000000.00';
  if (cTotalGst) cTotalGst.innerText = '150000000.00';
  if (cPaidBasic) cPaidBasic.innerText = '150000000.00';
  if (cPaidGst) cPaidGst.innerText = '150000000.00';
  if (cPayableBasic) cPayableBasic.innerText = '150000000.00';
  if (cPayableGst) cPayableGst.innerText = '150000000.00';

  const cards = overlay.querySelectorAll('.side-form-card, .side-contact-popup');
  cards.forEach(card => {
    if (card.id !== 'accountsPurchaseSummaryModal') card.style.display = 'none';
  });

  const modal = document.getElementById('accountsPurchaseSummaryModal');
  if (modal) {
    modal.style.display = 'block';
    overlay.style.display = 'flex';
  }
};

window.closeAccountsPurchaseSummaryModal = function() {
  const modal = document.getElementById('accountsPurchaseSummaryModal');
  if (modal) modal.style.display = 'none';
  const overlay = document.getElementById('sideFormOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.triggerAccountsCsvUpload = function() {
  const fileInput = document.getElementById('accountsCsvFileInput');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  } else {
    showToast('CSV / Excel file upload triggered');
  }
};

window.triggerAccountsPdfUpload = function() {
  const fileInput = document.getElementById('accountsPdfFileInput');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  } else {
    showToast('PDF file upload triggered');
  }
};















