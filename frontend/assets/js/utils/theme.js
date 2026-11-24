/**
 * Nexus ERP Dynamic Platform Theme Engine
 * Applies the company's configured hex_color_code across the login page and all ERP pages.
 */
(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'nexus_company_theme_hex';
  const DEFAULT_BANNER_GREEN = '#00cba0';
  const DEFAULT_PRIMARY_GREEN = '#00bfa5';
  const DEFAULT_PRIMARY_DARK = '#00a884';
  const DEFAULT_PRIMARY_DEEP = '#00796b';
  const DEFAULT_PRIMARY_LIGHT = '#e0f2f1';
  const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

  function normalizeHex(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let trimmed = hex.trim();
    if (!HEX_RE.test(trimmed)) return null;
    if (trimmed.length === 4) {
      trimmed = '#' + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3];
    }
    return trimmed.toLowerCase();
  }

  function hexToRgb(hex) {
    const clean = hex.slice(1);
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return (
      '#' +
      [clamp(r), clamp(g), clamp(b)]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('')
    );
  }

  function mixHex(hex, targetRgb, weight) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(
      r + (targetRgb.r - r) * weight,
      g + (targetRgb.g - g) * weight,
      b + (targetRgb.b - b) * weight
    );
  }

  function ensureDynamicStyleTag(cssText) {
    let styleEl = document.getElementById('nexusDynamicThemeStyle');
    if (!cssText) {
      if (styleEl) styleEl.remove();
      return;
    }
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'nexusDynamicThemeStyle';
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = cssText;
  }

  function applyPlatformThemeColor(colorHex, options) {
    const opts = options || {};
    const persist = opts.persist !== false;
    const silent = Boolean(opts.silent);
    const normalized = normalizeHex(colorHex);
    const root = document.documentElement;

    if (!normalized || normalized === DEFAULT_BANNER_GREEN) {
      root.style.removeProperty('--banner-green');
      root.style.removeProperty('--primary-green');
      root.style.removeProperty('--primary-green-dark');
      root.style.removeProperty('--primary-green-deep');
      root.style.removeProperty('--primary-green-light');
      root.style.removeProperty('--primary-glow');
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--accent-emerald');
      ensureDynamicStyleTag('');
      if (persist) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
      }
      if (!silent && typeof window.showToast === 'function') {
        window.showToast('Platform theme color reset to default (' + DEFAULT_BANNER_GREEN + ')');
      }
      return DEFAULT_BANNER_GREEN;
    }

    const darkShade = mixHex(normalized, { r: 0, g: 0, b: 0 }, 0.16);
    const deepShade = mixHex(normalized, { r: 0, g: 0, b: 0 }, 0.30);
    const lightTint = mixHex(normalized, { r: 255, g: 255, b: 255 }, 0.86);
    const { r, g, b } = hexToRgb(normalized);

    root.style.setProperty('--banner-green', normalized);
    root.style.setProperty('--primary-green', normalized);
    root.style.setProperty('--primary-green-dark', darkShade);
    root.style.setProperty('--primary-green-deep', deepShade);
    root.style.setProperty('--primary-green-light', lightTint);
    root.style.setProperty('--primary-glow', `rgba(${r}, ${g}, ${b}, 0.2)`);
    root.style.setProperty('--brand-primary', normalized);
    root.style.setProperty('--accent-emerald', normalized);

    // Override inline #00cba0 / #00bfa5 styles on modal badges, banners, active pills, and toggles
    ensureDynamicStyleTag(`
      .side-form-title-badge,
      .worklist-banner-bar,
      .banner-bar,
      .segmented-btn.active,
      .toggle-slide-switch input:checked + .toggle-slide-slider,
      .form-input-control:focus,
      .form-select-control:focus {
        --nexus-theme-active: ${normalized};
      }
      .side-form-title-badge[style*="#00cba0"],
      .side-form-title-badge[style*="rgb(0, 203, 160)"],
      .side-form-title-badge {
        background-color: ${normalized} !important;
      }
      .worklist-banner-bar,
      .banner-bar {
        background: ${normalized} !important;
      }
      .segmented-btn.active {
        background: ${normalized} !important;
        border-color: ${normalized} !important;
      }
      .toggle-slide-switch input:checked + .toggle-slide-slider {
        background-color: ${normalized} !important;
      }
      .split-side-right {
        background: linear-gradient(145deg, ${normalized} 0%, ${darkShade} 60%, ${deepShade} 100%) !important;
      }
    `);

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, normalized);
      } catch (e) {}
    }

    if (!silent && typeof window.showToast === 'function') {
      window.showToast('Platform theme color updated to ' + normalized.toUpperCase());
    }
    return normalized;
  }

  function getThemeApiUrl() {
    if (window.API_BASE_URL) {
      return window.API_BASE_URL.replace(/\/+$/, '') + '/auth/theme';
    }
    const loc = window.location;
    const isLocalDiffPort =
      loc &&
      (loc.protocol === 'file:' ||
        ((loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') &&
          loc.port !== '8000' &&
          loc.port !== ''));
    return isLocalDiffPort ? 'http://127.0.0.1:8000/api/v1/auth/theme' : '/api/v1/auth/theme';
  }

  async function loadPlatformThemeFromServer() {
    try {
      const res = await window.fetch(getThemeApiUrl(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      const serverHex = data && data.hex_color_code ? normalizeHex(data.hex_color_code) : null;
      applyPlatformThemeColor(serverHex, { persist: true, silent: true });
      return serverHex;
    } catch (e) {
      return null;
    }
  }

  // Apply cached theme synchronously on load to prevent green flash
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (cached) {
      applyPlatformThemeColor(cached, { persist: false, silent: true });
    }
  } catch (e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadPlatformThemeFromServer();
    });
  } else {
    loadPlatformThemeFromServer();
  }

  window.DEFAULT_PLATFORM_GREEN = DEFAULT_BANNER_GREEN;
  window.applyPlatformThemeColor = applyPlatformThemeColor;
  window.loadPlatformThemeFromServer = loadPlatformThemeFromServer;
})(window, document);
