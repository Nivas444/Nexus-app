/**
 * NEXUS WORK LIST INTERACTIVE ENGINE
 * Manages PO & Payment worklist tables, row selection, CSV export, and view toggling.
 */

// PO (Purchase Order) Worklist Dataset
const poData = [
  {
    id: "po-1",
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
    id: "po-2",
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
    id: "po-3",
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

// Payment Worklist Dataset
const paymentData = [
  {
    id: "pay-1",
    submitBy: "PAY/REQ-982104",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    approvedBy: "FIN/APP-409112",
    expenseHead: "Vendor Settlement",
    transferTo: "HDFC Bank",
    approvedAmount: "35000.00",
    transferredAmount: "35000.00",
    payableAmount: "0.00",
    ageing: 3,
    selected: true
  },
  {
    id: "pay-2",
    submitBy: "PAY/REQ-982115",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    approvedBy: "FIN/APP-409112",
    expenseHead: "Logistics Advance",
    transferTo: "SBI Corporate",
    approvedAmount: "18500.00",
    transferredAmount: "10000.00",
    payableAmount: "8500.00",
    ageing: 7,
    selected: false
  },
  {
    id: "pay-3",
    submitBy: "PAY/REQ-982130",
    submissionDate: "DD/MM/YYYY HH:mm:ss",
    approvedBy: "FIN/APP-510204",
    expenseHead: "Utility Services",
    transferTo: "ICICI Escrow",
    approvedAmount: "9200.00",
    transferredAmount: "",
    payableAmount: "9200.00",
    ageing: 12,
    selected: false
  }
];

let currentView = 'po'; // 'po' or 'payment'
let currentDataset = [...poData];

document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameter if present
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view');
  if (viewParam === 'payment' || viewParam === 'po') {
    currentView = viewParam;
  }

  initViewToggles();
  initToolbarActions();
  renderWorklistTable();
});

/* --------------------------------------------------------------------------
   1. VIEW TOGGLES (PO vs Payment)
   -------------------------------------------------------------------------- */
function initViewToggles() {
  const btnPO = document.getElementById('btnTogglePO');
  const btnPayment = document.getElementById('btnTogglePayment');

  function updateToggleUI() {
    if (currentView === 'po') {
      btnPO.classList.add('active');
      btnPayment.classList.remove('active');
      currentDataset = [...poData];
    } else {
      btnPayment.classList.add('active');
      btnPO.classList.remove('active');
      currentDataset = [...paymentData];
    }
    renderWorklistTable();
  }

  if (btnPO) {
    btnPO.addEventListener('click', () => {
      if (currentView !== 'po') {
        currentView = 'po';
        updateURLParam('po');
        updateToggleUI();
        showToast('Switched to PO (Purchase Order) Worklist');
      }
    });
  }

  if (btnPayment) {
    btnPayment.addEventListener('click', () => {
      if (currentView !== 'payment') {
        currentView = 'payment';
        updateURLParam('payment');
        updateToggleUI();
        showToast('Switched to Payment Worklist');
      }
    });
  }

  updateToggleUI();
}

function updateURLParam(viewName) {
  const url = new URL(window.location.href);
  url.searchParams.set('view', viewName);
  window.history.replaceState({}, '', url);
}

/* --------------------------------------------------------------------------
   2. TABLE RENDERING
   -------------------------------------------------------------------------- */
function renderWorklistTable() {
  const tbody = document.getElementById('worklistTableBody');
  if (!tbody) return;

  if (currentDataset.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-data-row">No records found in this worklist.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = currentDataset.map((row, index) => {
    const isSelected = row.selected;
    return `
      <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${row.id}">
        <!-- Select Radio Indicator -->
        <td class="td-select">
          <div class="radio-select-indicator ${isSelected ? 'selected' : ''}" onclick="selectRow('${row.id}')" aria-label="Select row"></div>
        </td>
        
        <!-- Submit By (Clickable Link) -->
        <td>
          <a href="#" class="req-link" onclick="handleReqClick('${row.submitBy}'); return false;">${row.submitBy}</a>
        </td>

        <!-- Submission Date -->
        <td class="td-center">${row.submissionDate}</td>

        <!-- Approved By -->
        <td>${row.approvedBy}</td>

        <!-- Expense Head -->
        <td>${row.expenseHead}</td>

        <!-- Transfer To -->
        <td>${row.transferTo}</td>

        <!-- Amount: Approved -->
        <td class="td-amount">${row.approvedAmount || ''}</td>

        <!-- Amount: Transferred -->
        <td class="td-amount">${row.transferredAmount || ''}</td>

        <!-- Amount: Payable -->
        <td class="td-amount">${row.payableAmount || ''}</td>

        <!-- Ageing -->
        <td class="td-center">${row.ageing}</td>
      </tr>
    `;
  }).join('');
}

/* --------------------------------------------------------------------------
   3. ROW SELECTION
   -------------------------------------------------------------------------- */
window.selectRow = function(rowId) {
  currentDataset = currentDataset.map(row => {
    return {
      ...row,
      selected: row.id === rowId
    };
  });
  renderWorklistTable();
};

window.handleReqClick = function(reqCode) {
  showToast(`Opening requisition details for: ${reqCode}`);
};

/* --------------------------------------------------------------------------
   4. TOOLBAR ACTIONS
   -------------------------------------------------------------------------- */
function initToolbarActions() {
  const btnSigma = document.getElementById('btnSigmaSummary');
  const btnInfo = document.getElementById('btnInfoAction');
  const btnDelete = document.getElementById('btnDeleteAction');
  const btnCsv = document.getElementById('btnCsvAction');

  if (btnSigma) {
    btnSigma.addEventListener('click', () => {
      let totalApproved = 0;
      currentDataset.forEach(r => {
        const val = parseFloat(r.approvedAmount);
        if (!isNaN(val)) totalApproved += val;
      });
      showToast(`Total Approved Amount: ₹${totalApproved.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${currentDataset.length} Records)`);
    });
  }

  if (btnInfo) {
    btnInfo.addEventListener('click', () => {
      const selected = currentDataset.find(r => r.selected);
      if (selected) {
        showToast(`Selected Record: ${selected.submitBy} | Department: ${selected.expenseHead} | Amount: ₹${selected.approvedAmount}`);
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
        renderWorklistTable();
        showToast(`Deleted record: ${deleted.submitBy}`);
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
  const headers = ["Submit By", "Submission Date", "Approved By", "Expense Head", "Transfer To", "Approved Amount", "Transferred Amount", "Payable Amount", "Ageing"];
  const rows = currentDataset.map(r => [
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
   5. TOAST NOTIFICATIONS
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
