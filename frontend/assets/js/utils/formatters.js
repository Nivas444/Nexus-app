/**
 * Nexus ERP - Formatter Utilities
 * Encapsulates date and currency/numeric formatters.
 */
(function(window) {
  'use strict';

  function formatHrDateToUI(dateStr) {
    if (!dateStr) return '';
    const dStr = String(dateStr).trim();
    const m = dStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return `${m[3]} - ${m[2]} - ${m[1]}`;
    }
    return dStr;
  }

  function formatHrAmount(val) {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  window.formatHrDateToUI = formatHrDateToUI;
  window.formatHrAmount = formatHrAmount;

})(window);
