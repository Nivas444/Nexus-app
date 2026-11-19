/**
 * Nexus ERP On-Demand Module Lazy Loader
 * Loads non-essential module JavaScript bundles only when their module is opened,
 * ensuring each script is fetched and executed at most once.
 */
(function(window) {
  'use strict';

  const MODULE_SCRIPTS = {
    master: [
      'assets/js/modules/master/master-vendors.js?v=20261012_01',
      'assets/js/modules/master/master-customers.js?v=20261012_01',
      'assets/js/modules/master/master-employees.js?v=20261012_01',
      'assets/js/modules/master/master-expenses.js?v=20261012_01',
      'assets/js/modules/master/master-hr-policies.js?v=20261012_01'
    ],
    indus_towers: [
      'assets/js/modules/indus/indus-towers.js?v=20261012_01'
    ]
  };

  const _loadedScripts = new Set();
  const _inflightScripts = new Map();
  const _loadedModules = new Set();

  function loadScriptOnce(src) {
    if (_loadedScripts.has(src)) {
      return Promise.resolve();
    }
    if (_inflightScripts.has(src)) {
      return _inflightScripts.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        _loadedScripts.add(src);
        _inflightScripts.delete(src);
        resolve();
      };
      script.onerror = (err) => {
        _inflightScripts.delete(src);
        console.error('Failed to lazy-load module script:', src, err);
        reject(err);
      };
      document.body.appendChild(script);
    });

    _inflightScripts.set(src, promise);
    return promise;
  }

  async function loadModule(moduleName) {
    const scripts = MODULE_SCRIPTS[moduleName];
    if (!scripts || scripts.length === 0) {
      return;
    }
    if (_loadedModules.has(moduleName)) {
      return;
    }

    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    await Promise.all(scripts.map(loadScriptOnce));
    _loadedModules.add(moduleName);

    if (window.NexusPerf && typeof window.NexusPerf.mark === 'function') {
      const elapsed = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
      window.NexusPerf.mark(`lazy_module_${moduleName}`, elapsed);
    }
  }

  function isModuleLoaded(moduleName) {
    return !MODULE_SCRIPTS[moduleName] || _loadedModules.has(moduleName);
  }

  window.NexusModuleLoader = {
    loadModule,
    isModuleLoaded,
    MODULE_SCRIPTS
  };
})(window);
