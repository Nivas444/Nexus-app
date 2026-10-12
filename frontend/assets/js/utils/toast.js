/**
 * Nexus ERP - Toast & Notification Utilities
 * Encapsulates standard toast notifications and SVG modal alert dialogs.
 */
(function(window) {
  'use strict';

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

  let svgErrorPopupAutoCloseTimer = null;
  function showSvgErrorPopup(message, title = "Error Message!") {
    const overlay = document.getElementById('nexusErrorPopupOverlay');
    if (!overlay) return;

    if (svgErrorPopupAutoCloseTimer) {
      clearTimeout(svgErrorPopupAutoCloseTimer);
      svgErrorPopupAutoCloseTimer = null;
    }

    const titleEl = document.getElementById('svgErrorPopupTitle');
    if (titleEl) {
      titleEl.textContent = title || "Error Message!";
    }

    const line1 = document.getElementById('svgErrorPopupLine1');
    const line2 = document.getElementById('svgErrorPopupLine2');
    const line3 = document.getElementById('svgErrorPopupLine3');

    if (line1) line1.textContent = '';
    if (line2) line2.textContent = '';
    if (line3) line3.textContent = '';

    let cleanMsg = '';
    if (typeof message === 'string') {
      cleanMsg = message;
    } else if (message && typeof message === 'object') {
      cleanMsg = message.detail || message.message || JSON.stringify(message);
    } else {
      cleanMsg = "An unexpected error occurred.";
    }

    // Wrap text cleanly into tspans
    if (cleanMsg.length <= 40) {
      if (line1) line1.textContent = cleanMsg;
    } else {
      const words = cleanMsg.split(' ');
      let lineA = '';
      let lineB = '';
      let lineC = '';

      for (const w of words) {
        if ((lineA + ' ' + w).trim().length <= 38) {
          lineA = (lineA + ' ' + w).trim();
        } else if ((lineB + ' ' + w).trim().length <= 38) {
          lineB = (lineB + ' ' + w).trim();
        } else {
          lineC = (lineC + ' ' + w).trim();
        }
      }

      if (line1 && lineA) line1.textContent = lineA;
      if (line2 && lineB) line2.textContent = lineB;
      if (line3 && lineC) line3.textContent = lineC;
    }

    overlay.style.display = 'flex';

    // Auto-dismiss after 3 seconds without user interruption
    svgErrorPopupAutoCloseTimer = setTimeout(() => {
      closeSvgErrorPopup();
    }, 3000);
  }

  function closeSvgErrorPopup() {
    if (svgErrorPopupAutoCloseTimer) {
      clearTimeout(svgErrorPopupAutoCloseTimer);
      svgErrorPopupAutoCloseTimer = null;
    }
    const overlay = document.getElementById('nexusErrorPopupOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    if (typeof updateCardDimmedState === 'function') {
      updateCardDimmedState();
    }
  }

  let svgSuccessPopupAutoCloseTimer = null;
  let currentSuccessPopupCallback = null;

  function showSvgSuccessPopup(message, title = "Task Completed", onContinue = null) {
    const overlay = document.getElementById('nexusSuccessPopupOverlay');
    if (!overlay) return;

    if (svgSuccessPopupAutoCloseTimer) {
      clearTimeout(svgSuccessPopupAutoCloseTimer);
      svgSuccessPopupAutoCloseTimer = null;
    }

    currentSuccessPopupCallback = (typeof onContinue === 'function') ? onContinue : null;

    const titleEl = document.getElementById('svgSuccessPopupTitle');
    if (titleEl) {
      titleEl.textContent = title || "Task Completed";
    }

    const line1 = document.getElementById('svgSuccessPopupLine1');
    const line2 = document.getElementById('svgSuccessPopupLine2');
    const line3 = document.getElementById('svgSuccessPopupLine3');

    if (line1) line1.textContent = '';
    if (line2) line2.textContent = '';
    if (line3) line3.textContent = '';

    let cleanMsg = '';
    if (typeof message === 'string') {
      cleanMsg = message;
    } else if (message && typeof message === 'object') {
      cleanMsg = message.detail || message.message || JSON.stringify(message);
    } else {
      cleanMsg = "Operation completed successfully!";
    }

    if (cleanMsg.length <= 40) {
      if (line1) line1.textContent = cleanMsg;
    } else {
      const words = cleanMsg.split(' ');
      let lineA = '';
      let lineB = '';
      let lineC = '';

      for (const w of words) {
        if ((lineA + ' ' + w).trim().length <= 38) {
          lineA = (lineA + ' ' + w).trim();
        } else if ((lineB + ' ' + w).trim().length <= 38) {
          lineB = (lineB + ' ' + w).trim();
        } else {
          lineC = (lineC + ' ' + w).trim();
        }
      }

      if (line1 && lineA) line1.textContent = lineA;
      if (line2 && lineB) line2.textContent = lineB;
      if (line3 && lineC) line3.textContent = lineC;
    }

    overlay.style.display = 'flex';

    svgSuccessPopupAutoCloseTimer = setTimeout(() => {
      closeSvgSuccessPopup();
    }, 3000);
  }

  function closeSvgSuccessPopup() {
    if (svgSuccessPopupAutoCloseTimer) {
      clearTimeout(svgSuccessPopupAutoCloseTimer);
      svgSuccessPopupAutoCloseTimer = null;
    }
    const overlay = document.getElementById('nexusSuccessPopupOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    if (typeof updateCardDimmedState === 'function') {
      updateCardDimmedState();
    }
    if (typeof currentSuccessPopupCallback === 'function') {
      const cb = currentSuccessPopupCallback;
      currentSuccessPopupCallback = null;
      cb();
    }
  }

  // Expose globally
  window.showToast = showToast;
  window.showSvgErrorPopup = showSvgErrorPopup;
  window.closeSvgErrorPopup = closeSvgErrorPopup;
  window.showSvgSuccessPopup = showSvgSuccessPopup;
  window.closeSvgSuccessPopup = closeSvgSuccessPopup;

})(window);
