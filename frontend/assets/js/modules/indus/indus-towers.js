/**
 * Indus Towers Domain Module
 * Extracted from home.js
 * Handles Indus Towers sites, GBPA (products), Infra, Projects, and ESH datasets,
 * navigation, dataset loading, and form persistence.
 */
(function(window) {
  'use strict';

  window.currentIndusSubpage = window.currentIndusSubpage || 'site';
  window.currentIndusProductSubpage = window.currentIndusProductSubpage || 'materials';
  window.selectedProductName = window.selectedProductName || 'Product Name';
  window.indusSiteData = window.indusSiteData || [];
  window.indusProductsData = window.indusProductsData || [];
  window.indusInfraData = window.indusInfraData || [];
  window.indusProjectsData = window.indusProjectsData || [];
  window.indusEshData = window.indusEshData || [];
  window.indusProductMaterialsData = window.indusProductMaterialsData || [];
  window.indusProductExpensesData = window.indusProductExpensesData || [];
  window.indusProductInfraData = window.indusProductInfraData || [];
  window.indusProjectTransportData = window.indusProjectTransportData || [];
  window.indusProjectSurveyData = window.indusProjectSurveyData || [];

  async function fetchIndusProjects(renderAfter = true) {
    if (typeof NexusApi === 'undefined' || !NexusApi.indusProjects) return [];
    try {
      const resp = await NexusApi.indusProjects.getAll({
        company_name: 'Indus Tower Ltd',
        page: 1,
        page_size: 500
      });
      const items = (resp && (resp.items || resp)) || [];
      indusProjectsData = items.map(item => ({
        id: item.project_type_id || item.id,
        projectType: item.project_type || '',
        subProjectType: item.sub_project_type || '',
        upgradationType: item.upgradation_type || 'Major',
        tat: item.tat || '',
        indusPm: item.indus_pm || '',
        indusScm: item.indus_scm || '',
        pm: item.pm || '',
        survey: item.survey || 'Yes',
        additionalTransport: item.additional_transport || 'Yes',
        status: item.status || 'Active'
      }));
      if (currentIndusSubpage === 'projects') {
        currentDataset = [...indusProjectsData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusProjectsData;
    } catch (err) {
      console.warn('Error fetching Indus projects:', err);
      return [];
    }
  }
  
  let currentIndusProductSubpage = 'materials';
  let selectedProductName = 'Product Name';
  
  let indusProductMaterialsData = [];
  let indusProductExpensesData = [];
  let indusProductInfraData = [];
  
  function getActiveGbpaCustomerName() {
    if (window.currentCustomerName && String(window.currentCustomerName).trim()) {
      return String(window.currentCustomerName).trim();
    }
    if (window.currentCustomerContext) {
      const c = window.currentCustomerContext;
      const name = c.customerName || c.customer_name || c.legalName || c.name;
      if (name && String(name).trim()) return String(name).trim();
    }
    return 'Indus Tower Ltd';
  }
  window.getActiveGbpaCustomerName = getActiveGbpaCustomerName;
  
  async function fetchGbpaMaterials(renderAfter = true) {
    try {
      if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaMaterials) {
        const resp = await NexusApi.indusGbpaMaterials.getAll({
          customer_name: getActiveGbpaCustomerName(),
          page: 1,
          page_size: 500
        });
        indusProductMaterialsData = (resp && resp.items) ? resp.items : [];
      }
      if (currentModule === 'indus_towers' && currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'materials') {
        currentDataset = [...indusProductMaterialsData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusProductMaterialsData;
    } catch (err) {
      console.error('Failed to fetch GBPA materials:', err);
      indusProductMaterialsData = [];
      if (currentModule === 'indus_towers' && currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'materials') {
        currentDataset = [];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(err.message || 'Failed to retrieve GBPA materials from database.', 'Database Error');
      }
      return [];
    }
  }
  window.fetchGbpaMaterials = fetchGbpaMaterials;
  
  async function fetchGbpaExpenses(renderAfter = true) {
    try {
      if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaExpenses) {
        const resp = await NexusApi.indusGbpaExpenses.getAll({
          customer_name: getActiveGbpaCustomerName(),
          page: 1,
          page_size: 500
        });
        indusProductExpensesData = (resp && resp.items) ? resp.items : [];
      }
      if (currentModule === 'indus_towers' && currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'expenses') {
        currentDataset = [...indusProductExpensesData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusProductExpensesData;
    } catch (err) {
      console.error('Failed to fetch GBPA expenses:', err);
      indusProductExpensesData = [];
      if (currentModule === 'indus_towers' && currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'expenses') {
        currentDataset = [];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(err.message || 'Failed to retrieve GBPA expenses from database.', 'Database Error');
      }
      return [];
    }
  }
  window.fetchGbpaExpenses = fetchGbpaExpenses;
  
  async function fetchGbpaInfra(renderAfter = true) {
    try {
      if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaInfra) {
        const resp = await NexusApi.indusGbpaInfra.getAll({
          customer_name: getActiveGbpaCustomerName(),
          page: 1,
          page_size: 500
        });
        indusProductInfraData = (resp && resp.items) ? resp.items : [];
      }
      if (currentModule === 'indus_towers' && currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'infra') {
        currentDataset = [...indusProductInfraData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusProductInfraData;
    } catch (err) {
      console.error('Failed to fetch GBPA infrastructure:', err);
      indusProductInfraData = [];
      if (currentModule === 'indus_towers' && currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'infra') {
        currentDataset = [];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(err.message || 'Failed to retrieve GBPA infrastructure from database.', 'Database Error');
      }
      return [];
    }
  }
  window.fetchGbpaInfra = fetchGbpaInfra;
  


  async function fetchIndusSites(renderAfter = true) {
    try {
      const resp = await NexusApi.indusSites.getAll({ page: 1, page_size: 500 });
      indusSiteData = (resp && resp.items) ? resp.items : [];
      if (currentIndusSubpage === 'site') {
        currentDataset = [...indusSiteData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusSiteData;
    } catch (err) {
      console.error('Failed to fetch Indus sites:', err);
      indusSiteData = [];
      if (currentIndusSubpage === 'site') {
        currentDataset = [];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(err.message || 'Failed to retrieve site details from database.', 'Database Error');
      }
      return [];
    }
  }
  window.fetchIndusSites = fetchIndusSites;
  
  async function fetchIndusGbpa(renderAfter = true) {
    try {
      if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpa) {
        const resp = await NexusApi.indusGbpa.getAll({ page: 1, page_size: 500 });
        indusProductsData = (resp && resp.items) ? resp.items : [];
      }
      if (currentIndusSubpage === 'products') {
        currentDataset = [...indusProductsData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusProductsData;
    } catch (err) {
      console.error('Failed to fetch Indus GBPA items:', err);
      indusProductsData = [];
      if (currentIndusSubpage === 'products') {
        currentDataset = [];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(err.message || 'Failed to retrieve GBPA records from database.', 'Database Error');
      }
      return [];
    }
  }
  window.fetchIndusGbpa = fetchIndusGbpa;
  
  async function fetchIndusInfra(renderAfter = true) {
    try {
      if (typeof NexusApi !== 'undefined' && NexusApi.indusInfra) {
        const resp = await NexusApi.indusInfra.getAll({ customer_name: 'Indus Tower Ltd', page: 1, page_size: 500 });
        indusInfraData = (resp && resp.items) ? resp.items : [];
      }
      if (currentIndusSubpage === 'infra') {
        currentDataset = [...indusInfraData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusInfraData;
    } catch (err) {
      console.error('Failed to fetch Indus Infra items:', err);
      indusInfraData = [];
      if (currentIndusSubpage === 'infra') {
        currentDataset = [];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(err.message || 'Failed to retrieve infrastructure details from database.', 'Database Error');
      }
      return [];
    }
  }
  window.fetchIndusInfra = fetchIndusInfra;
  
  async function fetchIndusEsh(renderAfter = true) {
    try {
      if (typeof NexusApi !== 'undefined' && NexusApi.indusEsh) {
        const resp = await NexusApi.indusEsh.getAll({ company_name: 'Indus Tower Ltd', page: 1, page_size: 500 });
        indusEshData = (resp && resp.items) ? resp.items : [];
      }
      if (currentIndusSubpage === 'esh') {
        currentDataset = [...indusEshData];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      return indusEshData;
    } catch (err) {
      console.error('Failed to fetch Indus ESH items:', err);
      indusEshData = [];
      if (currentIndusSubpage === 'esh') {
        currentDataset = [];
        if (renderAfter && typeof applyFiltersAndRender === 'function') {
          applyFiltersAndRender();
        }
      }
      if (typeof showSvgErrorPopup === 'function') {
        showSvgErrorPopup(err.message || 'Failed to retrieve ESH records from database.', 'Database Error');
      }
      return [];
    }
  }
  window.fetchIndusEsh = fetchIndusEsh;
  
  function openIndusTowersPage() {
    currentModule = 'indus_towers';
    currentIndusSubpage = 'site';
    activeColumnFilters = {};
    updateURL();
    renderApp();
    fetchIndusSites(true);
    showToast('Navigated to Indus Towers Ltd');
  }
  
  function loadIndusDataset() {
    if (currentIndusSubpage === 'site') {
      currentDataset = [...indusSiteData];
      // Trigger async refresh if indusSiteData is empty or needs refresh
      if (typeof NexusApi !== 'undefined' && NexusApi.indusSites) {
        NexusApi.indusSites.getAll({ page: 1, page_size: 500 }).then(resp => {
          if (resp && resp.items) {
            indusSiteData = resp.items;
            if (currentIndusSubpage === 'site') {
              currentDataset = [...indusSiteData];
              if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
            }
          }
        }).catch(err => {
          console.warn('Async loadIndusDataset fetch error:', err);
        });
      }
    } else if (currentIndusSubpage === 'products') {
      currentDataset = [...indusProductsData];
      if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpa) {
        NexusApi.indusGbpa.getAll({ page: 1, page_size: 500 }).then(resp => {
          if (resp && resp.items) {
            indusProductsData = resp.items;
            if (currentIndusSubpage === 'products') {
              currentDataset = [...indusProductsData];
              if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
            }
          }
        }).catch(err => {
          console.warn('Async loadIndusDataset GBPA fetch error:', err);
        });
      }
    } else if (currentIndusSubpage === 'infra') {
      currentDataset = [...indusInfraData];
      if (typeof NexusApi !== 'undefined' && NexusApi.indusInfra) {
        NexusApi.indusInfra.getAll({ customer_name: 'Indus Tower Ltd', page: 1, page_size: 500 }).then(resp => {
          if (resp && resp.items) {
            indusInfraData = resp.items;
            if (currentIndusSubpage === 'infra') {
              currentDataset = [...indusInfraData];
              if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
            }
          }
        }).catch(err => {
          console.warn('Async loadIndusDataset Infra fetch error:', err);
        });
      }
    } else if (currentIndusSubpage === 'projects') {
      currentDataset = [...indusProjectsData];
      if (typeof fetchIndusProjects === 'function') {
        fetchIndusProjects(true);
      }
    } else if (currentIndusSubpage === 'esh') {
      currentDataset = [...indusEshData];
      if (typeof NexusApi !== 'undefined' && NexusApi.indusEsh) {
        NexusApi.indusEsh.getAll({ company_name: 'Indus Tower Ltd', page: 1, page_size: 500 }).then(resp => {
          if (resp && resp.items) {
            indusEshData = resp.items;
            if (currentIndusSubpage === 'esh') {
              currentDataset = [...indusEshData];
              if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
            }
          }
        }).catch(err => {
          console.warn('Async loadIndusDataset ESH fetch error:', err);
        });
      }
    } else if (currentIndusSubpage === 'project_type_details') {
      if (currentIndusProjectTypeSubpage === 'transport') {
        currentDataset = [...indusProjectTransportData];
      } else {
        currentDataset = [...indusProjectSurveyData];
      }
    } else if (currentIndusSubpage === 'product_details') {
      if (currentIndusProductSubpage === 'materials') {
        currentDataset = [...indusProductMaterialsData];
        if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaMaterials) {
          NexusApi.indusGbpaMaterials.getAll({ customer_name: getActiveGbpaCustomerName(), page: 1, page_size: 500 }).then(resp => {
            if (resp && resp.items) {
              indusProductMaterialsData = resp.items;
              if (currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'materials') {
                currentDataset = [...indusProductMaterialsData];
                if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
              }
            }
          }).catch(err => console.warn('Async loadIndusDataset Materials fetch error:', err));
        }
      } else if (currentIndusProductSubpage === 'expenses') {
        currentDataset = [...indusProductExpensesData];
        if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaExpenses) {
          NexusApi.indusGbpaExpenses.getAll({ customer_name: getActiveGbpaCustomerName(), page: 1, page_size: 500 }).then(resp => {
            if (resp && resp.items) {
              indusProductExpensesData = resp.items;
              if (currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'expenses') {
                currentDataset = [...indusProductExpensesData];
                if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
              }
            }
          }).catch(err => console.warn('Async loadIndusDataset Expenses fetch error:', err));
        }
      } else if (currentIndusProductSubpage === 'infra') {
        currentDataset = [...indusProductInfraData];
        if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaInfra) {
          NexusApi.indusGbpaInfra.getAll({ customer_name: getActiveGbpaCustomerName(), page: 1, page_size: 500 }).then(resp => {
            if (resp && resp.items) {
              indusProductInfraData = resp.items;
              if (currentIndusSubpage === 'product_details' && currentIndusProductSubpage === 'infra') {
                currentDataset = [...indusProductInfraData];
                if (typeof applyFiltersAndRender === 'function') applyFiltersAndRender();
              }
            }
          }).catch(err => console.warn('Async loadIndusDataset Infra fetch error:', err));
        }
      } else if (currentIndusProductSubpage === 'rate') {
        currentDataset = [...indusProductRateData];
      }
    }
  }
  


  // Save Indus Towers Form Record
  window.saveIndusTowersRecord = async function() {
        if (currentIndusSubpage === 'projects') {
          const projectType = document.getElementById('inpProjectType')?.value?.trim();
          const subProjectType = document.getElementById('inpSubProjectType')?.value?.trim();
          const upgradationType = document.getElementById('inpProjectUpgradationType')?.value?.trim() || "Major";
          const tat = document.getElementById('inpProjectTat')?.value?.trim() || "30 Days";
          const indusPm = document.getElementById('inpIndusPm')?.value?.trim() || "";
          const indusScm = document.getElementById('inpIndusScm')?.value?.trim() || "";
          const pm = document.getElementById('inpProjectPm')?.value?.trim() || "";
          const surveyToggle = document.getElementById('inpProjectSurveyToggle');
          const survey = (surveyToggle && surveyToggle.checked) ? "Yes" : "No";
          const transportToggle = document.getElementById('inpProjectTransportToggle');
          const additionalTransport = (transportToggle && transportToggle.checked) ? "Yes" : "No";
          const statusToggle = document.getElementById('inpProjectStatusToggle');
          const status = (statusToggle && statusToggle.checked) ? "Active" : "In - Active";
  
          if (!projectType) {
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup('Please select Project Type', 'Validation Error');
            } else {
              showToast('Please select Project Type');
            }
            return;
          }
  
          if (!subProjectType) {
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup('Please select Sub - Project Type', 'Validation Error');
            } else {
              showToast('Please select Sub - Project Type');
            }
            return;
          }
  
          const payload = {
            company_name: 'Indus Tower Ltd',
            customer_name: 'Indus Tower Ltd',
            project_type: projectType,
            sub_project_type: subProjectType,
            upgradation_type: upgradationType,
            tat: tat,
            indus_pm: indusPm,
            indus_scm: indusScm,
            pm: pm,
            survey: survey,
            additional_transport: additionalTransport,
            status: status
          };
  
          if (typeof NexusApi !== 'undefined' && NexusApi.indusProjects) {
            try {
              await NexusApi.indusProjects.create(payload);
              await fetchIndusProjects(true);
              closeSideForm();
              if (typeof showSvgSuccessPopup === 'function') {
                showSvgSuccessPopup('Project added successfully!', 'Task Completed');
              } else {
                showToast(`Project ${projectType} successfully saved & added to table!`);
              }
            } catch (err) {
              console.error('Failed to save project:', err);
              if (typeof showSvgErrorPopup === 'function') {
                showSvgErrorPopup(err.message || 'Failed to save project', 'Error');
              } else {
                showToast('Failed to save project');
              }
            }
          } else {
            const newRecord = {
              id: `indus-proj-${Date.now()}`,
              ...payload,
              projectType,
              subProjectType,
              upgradationType,
              additionalTransport
            };
            indusProjectsData.unshift(newRecord);
            loadIndusDataset();
            applyFiltersAndRender();
            closeSideForm();
            showToast(`Project ${projectType} successfully saved & added to table!`);
          }
          return;
        }
  
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
            const infraCode = document.getElementById('inpProdInfraCode')?.value?.trim() || '';
            const infraCategory = document.getElementById('inpProdInfraCategory')?.value?.trim() || '';
            const infraDescription = document.getElementById('inpProdInfraDescription')?.value?.trim() || '';
            const typeSelect = document.getElementById('inpProdInfraType');
            const type = (typeSelect && typeSelect.value !== "Parent / Child") ? typeSelect.value : "Parent";
            const prodInfraStatusToggle = document.getElementById('inpProdInfraStatusToggle');
            const status = (prodInfraStatusToggle && prodInfraStatusToggle.checked) ? "Active" : "In - Active";
  
            if (!infraCode) {
              if (typeof showSvgErrorPopup === 'function') {
                showSvgErrorPopup('Please enter Infra Code.', 'Validation Error');
              } else {
                showToast('Please enter Infra Code');
              }
              return;
            }
  
            if (!infraCategory) {
              if (typeof showSvgErrorPopup === 'function') {
                showSvgErrorPopup('Please enter Infra Category.', 'Validation Error');
              } else {
                showToast('Please enter Infra Category');
              }
              return;
            }
  
            const payload = {
              customer_name: getActiveGbpaCustomerName(),
              infra_code: infraCode,
              infra_category: infraCategory,
              infra_description: infraDescription,
              infra_type: type,
              status: status,
              item_name: selectedProductName || null
            };
  
            try {
              if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaInfra) {
                await NexusApi.indusGbpaInfra.create(payload);
              }
              await fetchGbpaInfra(true);
              closeSideForm();
              if (typeof showSvgSuccessPopup === 'function') {
                showSvgSuccessPopup('GBPA infrastructure added successfully!', 'Task Completed');
              } else {
                showToast('GBPA infrastructure added successfully!');
              }
            } catch (err) {
              console.error('Failed to create GBPA infrastructure:', err);
              const isConflict = err.isConflict || (err.statusCode === 409) || (err.message && err.message.toLowerCase().includes('already exists'));
              const errMsg = isConflict
                ? 'This Infra Code already exists. Please use a unique Infra Code.'
                : (err.detail || err.message || 'Failed to save GBPA infrastructure.');
              if (typeof showSvgErrorPopup === 'function') {
                showSvgErrorPopup(errMsg, isConflict ? 'Validation Error' : 'Database Error');
              } else {
                showToast(errMsg);
              }
            }
            return;
          }
  
          if (currentIndusProductSubpage === 'expenses') {
            const expenseHead = document.getElementById('inpProdExpenseHead')?.value?.trim() || '';
            const expenseCategory = document.getElementById('inpProdExpenseCategory')?.value?.trim() || '';
            const expenseDescription = document.getElementById('inpProdExpenseDescription')?.value?.trim() || '';
            const typeSelect = document.getElementById('inpProdExpenseType');
            const type = (typeSelect && typeSelect.value !== "Parent / Child") ? typeSelect.value : "Parent";
            const prodExpenseStatusToggle = document.getElementById('inpProdExpenseStatusToggle');
            const status = (prodExpenseStatusToggle && prodExpenseStatusToggle.checked) ? "Active" : "In - Active";
  
            if (!expenseHead) {
              if (typeof showSvgErrorPopup === 'function') {
                showSvgErrorPopup('Please enter Expense Head.', 'Validation Error');
              } else {
                showToast('Please enter Expense Head');
              }
              return;
            }
  
            if (!expenseCategory) {
              if (typeof showSvgErrorPopup === 'function') {
                showSvgErrorPopup('Please enter Expense Category.', 'Validation Error');
              } else {
                showToast('Please enter Expense Category');
              }
              return;
            }
  
            const payload = {
              customer_name: getActiveGbpaCustomerName(),
              expense_head: expenseHead,
              expense_category: expenseCategory,
              expense_description: expenseDescription,
              expense_type: type,
              status: status,
              item_name: selectedProductName || null,
              expense_code: expenseHead
            };
  
            try {
              if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaExpenses) {
                await NexusApi.indusGbpaExpenses.create(payload);
              }
              await fetchGbpaExpenses(true);
              closeSideForm();
              if (typeof showSvgSuccessPopup === 'function') {
                showSvgSuccessPopup('GBPA expense added successfully!', 'Task Completed');
              } else {
                showToast('GBPA expense added successfully!');
              }
            } catch (err) {
              console.error('Failed to create GBPA expense:', err);
              const errMsg = err.detail || err.message || 'Failed to save GBPA expense.';
              if (typeof showSvgErrorPopup === 'function') {
                showSvgErrorPopup(errMsg, 'Database Error');
              } else {
                showToast(errMsg);
              }
            }
            return;
          }
  
          const materialHead = document.getElementById('inpMaterialHead')?.value?.trim() || '';
          const materialCategory = document.getElementById('inpMaterialCategory')?.value?.trim() || '';
          const materialDescription = document.getElementById('inpMaterialDescription')?.value?.trim() || '';
          const make = document.getElementById('inpMaterialMake')?.value?.trim() || '';
          const typeSelect = document.getElementById('inpMaterialType');
          const type = (typeSelect && typeSelect.value !== "Parent / Child") ? typeSelect.value : "Parent";
          const ucf = document.getElementById('inpMaterialUcf')?.value?.trim() || '';
          const materialStatusToggle = document.getElementById('inpMaterialStatusToggle');
          const status = (materialStatusToggle && materialStatusToggle.checked) ? "Active" : "In - Active";
  
          if (!materialHead) {
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup('Please enter Material Head.', 'Validation Error');
            } else {
              showToast('Please enter Material Head');
            }
            return;
          }
  
          if (!materialCategory) {
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup('Please enter Material Category.', 'Validation Error');
            } else {
              showToast('Please enter Material Category');
            }
            return;
          }
  
          const payload = {
            customer_name: getActiveGbpaCustomerName(),
            material_head: materialHead,
            material_category: materialCategory,
            material_description: materialDescription,
            material_type: type,
            uom: ucf,
            status: status,
            company_name: make || null,
            item_name: selectedProductName || null,
            material_code: materialHead
          };
  
          try {
            if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpaMaterials) {
              await NexusApi.indusGbpaMaterials.create(payload);
            }
            await fetchGbpaMaterials(true);
            closeSideForm();
            if (typeof showSvgSuccessPopup === 'function') {
              showSvgSuccessPopup('GBPA material added successfully!', 'Task Completed');
            } else {
              showToast('GBPA material added successfully!');
            }
          } catch (err) {
            console.error('Failed to create GBPA material:', err);
            const errMsg = err.detail || err.message || 'Failed to save GBPA material.';
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(errMsg, 'Database Error');
            } else {
              showToast(errMsg);
            }
          }
          return;
        }
  
        if (currentIndusSubpage === 'infra') {
          const infraCategory = document.getElementById('inpInfraCategory')?.value?.trim() || "";
          const infraDescription = document.getElementById('inpInfraDescription')?.value?.trim() || "";
          const uom = document.getElementById('inpInfraUom')?.value?.trim() || "";
          const make = document.getElementById('inpInfraMake')?.value?.trim() || "";
          const commissioningToggle = document.getElementById('inpInfraCommissioningToggle');
          const commissioning = (commissioningToggle && commissioningToggle.checked) ? "Yes" : "No";
          const iMapToggle = document.getElementById('inpInfraIMapToggle');
          const iMap = (iMapToggle && iMapToggle.checked) ? "Yes" : "No";
          const infraStatusToggle = document.getElementById('inpInfraStatusToggle');
          const status = (infraStatusToggle && infraStatusToggle.checked) ? "Active" : "In - Active";
  
          if (!infraCategory) {
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup('Infra Category is required.', 'Validation Error');
            } else {
              showToast('Infra Category is required.');
            }
            return;
          }
  
          const payload = {
            customerName: 'Indus Tower Ltd',
            companyName: 'Nexus',
            infraCategory,
            infraDescription,
            uom,
            make,
            commissioning,
            iMap,
            status
          };
  
          try {
            if (typeof NexusApi !== 'undefined' && NexusApi.indusInfra) {
              const created = await NexusApi.indusInfra.create(payload);
              await fetchIndusInfra(true);
              closeSideForm();
              const frm = document.getElementById('frmAddInfra');
              if (frm) frm.reset();
              if (typeof showSvgSuccessPopup === 'function') {
                showSvgSuccessPopup('Infrastructure details added successfully!', 'Task Completed');
              } else {
                showToast('Infrastructure details added successfully!');
              }
            } else {
              throw new Error('API client not available');
            }
          } catch (err) {
            console.error('Failed to create infra record:', err);
            const errMsg = err.detail || err.message || 'Failed to add infrastructure details. Please try again.';
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(errMsg, 'Database Error');
            } else {
              showToast(errMsg);
            }
          }
          return;
        }
  
        if (currentIndusSubpage === 'products') {
          const itemCode = document.getElementById('inpGbpaItemCode')?.value?.trim() || '';
          const productName = document.getElementById('inpGbpaProductName')?.value?.trim() || '';
          const productType = document.getElementById('inpGbpaProductType')?.value?.trim() || 'Capex';
          const productDescription = document.getElementById('inpGbpaProductDescription')?.value?.trim() || '';
          const uom = document.getElementById('inpGbpaUom')?.value?.trim() || 'Pcs';
          const rate = document.getElementById('inpGbpaRate')?.value?.trim() || '0.00';
          const hsnSacType = document.getElementById('inpGbpaHsnSac')?.value?.trim() || 'HSN';
          const hsnSacCode = document.getElementById('inpGbpaHsnSacCode')?.value?.trim() || '';
          const budgetPercent = document.getElementById('inpGbpaBudgetPercent')?.value?.trim() || '';
          const budgetAmount = document.getElementById('inpGbpaBudgetAmount')?.value?.trim() || '';
          const statusToggle = document.getElementById('inpGbpaStatusToggle');
          const status = (statusToggle && statusToggle.checked) ? 'Active' : 'In - Active';
  
          if (!itemCode) {
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup('Please enter Item Code.', 'Validation Error');
            } else {
              showToast('Please enter Item Code');
            }
            return;
          }
  
          if (!productName) {
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup('Please enter Item Name.', 'Validation Error');
            } else {
              showToast('Please enter Item Name');
            }
            return;
          }
  
          const payload = {
            company_name: 'Nexus',
            customer_name: 'Indus Tower Ltd',
            item_code: itemCode,
            item_name: productName,
            item_description: productDescription,
            item_type: productType,
            hsn_sac: hsnSacType,
            hsn_sac_code: hsnSacCode,
            uom: uom,
            rate: rate,
            budget_percentage: budgetPercent,
            budget_amount: budgetAmount,
            status: status
          };
  
          try {
            if (typeof NexusApi !== 'undefined' && NexusApi.indusGbpa) {
              await NexusApi.indusGbpa.create(payload);
            }
            await fetchIndusGbpa(true);
            closeSideForm();
            if (typeof showSvgSuccessPopup === 'function') {
              showSvgSuccessPopup('GBPA record added successfully!', 'Task Completed');
            } else {
              showToast('GBPA record added successfully!');
            }
          } catch (err) {
            console.error('Failed to create GBPA item:', err);
            const errMsg = err.detail || err.message || 'Failed to save GBPA item.';
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(errMsg, 'Error Message!');
            } else {
              showToast(errMsg);
            }
          }
          return;
        }
  
  
        const siteCodeVal = document.getElementById('inpSiteId')?.value?.trim() || '';
        const whIdVal = document.getElementById('inpSiteWhId')?.value?.trim() || '';
        const siteNameVal = document.getElementById('inpSiteName')?.value?.trim() || '';
        const towerTypeVal = document.getElementById('inpSiteTowerType')?.value?.trim() || 'GBT';
        const districtVal = document.getElementById('inpSiteDistrict')?.value?.trim() || '';
        const townVal = document.getElementById('inpSiteTown')?.value?.trim() || '';
        const addressVal = document.getElementById('inpSiteAddress')?.value?.trim() || '';
        const latVal = document.getElementById('inpSiteLattitude')?.value?.trim() || '';
        const longVal = document.getElementById('inpSiteLongtitude')?.value?.trim() || '';
        const transportZoneVal = document.getElementById('inpSiteTransportZone')?.value?.trim() || '';
        const siteStatusToggle = document.getElementById('inpSiteStatusToggle');
        const statusVal = (siteStatusToggle && siteStatusToggle.checked) ? 'Active' : 'In - Active';
  
        if (!siteCodeVal) {
          if (typeof showSvgErrorPopup === 'function') {
            showSvgErrorPopup('Please enter Site ID.', 'Error Message!');
          } else {
            showToast('Please enter Site ID');
          }
          return;
        }
        if (!siteNameVal) {
          if (typeof showSvgErrorPopup === 'function') {
            showSvgErrorPopup('Please enter Site Name.', 'Error Message!');
          } else {
            showToast('Please enter Site Name');
          }
          return;
        }
  
        const payload = {
          site_code: siteCodeVal,
          site_name: siteNameVal,
          wh_id: whIdVal || null,
          tower_type: towerTypeVal || 'GBT',
          district: districtVal || null,
          town: townVal || null,
          address: addressVal || null,
          latitude: latVal || null,
          longitude: longVal || null,
          transport_zone: transportZoneVal || null,
          status: statusVal,
          contacts: (typeof draftSiteContacts !== 'undefined' && draftSiteContacts.length > 0) ? draftSiteContacts : []
        };
  
        if (typeof NexusApi !== 'undefined' && NexusApi.indusSites) {
          try {
            const savedSite = await NexusApi.indusSites.create(payload);
            await fetchIndusSites(true);
            if (typeof draftSiteContacts !== 'undefined') draftSiteContacts = [];
            closeSideForm();
            if (typeof showSvgSuccessPopup === 'function') {
              showSvgSuccessPopup('Site added successfully!', 'Task Completed');
            } else {
              showToast('Site added successfully!');
            }
          } catch (err) {
            console.error('Failed to create site:', err);
            const errMsg = err.detail || err.message || 'Failed to save site details.';
            if (typeof showSvgErrorPopup === 'function') {
              showSvgErrorPopup(errMsg, 'Error Message!');
            } else {
              showToast(errMsg);
            }
          }
        }
        return;

  };

  window.fetchIndusSites = typeof fetchIndusSites !== 'undefined' ? fetchIndusSites : window.fetchIndusSites;
  window.fetchIndusGbpa = typeof fetchIndusGbpa !== 'undefined' ? fetchIndusGbpa : window.fetchIndusGbpa;
  window.fetchIndusInfra = typeof fetchIndusInfra !== 'undefined' ? fetchIndusInfra : window.fetchIndusInfra;
  window.fetchIndusEsh = typeof fetchIndusEsh !== 'undefined' ? fetchIndusEsh : window.fetchIndusEsh;
  window.fetchIndusProjects = typeof fetchIndusProjects !== 'undefined' ? fetchIndusProjects : window.fetchIndusProjects;
  window.fetchGbpaMaterials = typeof fetchGbpaMaterials !== 'undefined' ? fetchGbpaMaterials : window.fetchGbpaMaterials;
  window.fetchGbpaExpenses = typeof fetchGbpaExpenses !== 'undefined' ? fetchGbpaExpenses : window.fetchGbpaExpenses;
  window.fetchGbpaInfra = typeof fetchGbpaInfra !== 'undefined' ? fetchGbpaInfra : window.fetchGbpaInfra;
  window.openIndusTowersPage = typeof openIndusTowersPage !== 'undefined' ? openIndusTowersPage : window.openIndusTowersPage;
  window.loadIndusDataset = typeof loadIndusDataset !== 'undefined' ? loadIndusDataset : window.loadIndusDataset;
  window.getActiveGbpaCustomerName = typeof getActiveGbpaCustomerName !== 'undefined' ? getActiveGbpaCustomerName : window.getActiveGbpaCustomerName;
})(window);
