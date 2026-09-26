/**
 * Monit AED - Smart UAE Expense Tracker & Dashboard
 * Core Application Logic
 */

(function () {
  'use strict';

  // Constants & Storage Keys
  const STORAGE_KEY_EXPENSES = 'monit_aed_expenses';
  const STORAGE_KEY_BUDGET = 'monit_aed_budget';
  const STORAGE_KEY_THEME = 'monit_aed_theme';

  // Categories configuration with icons and colors
  const CATEGORIES = {
    food: { label: 'Food & Dining', icon: '🍔', color: '#f97316' },
    groceries: { label: 'Groceries', icon: '🛒', color: '#10b981' },
    transport: { label: 'Transport & Fuel', icon: '🚗', color: '#06b6d4' },
    shopping: { label: 'Shopping', icon: '🛍️', color: '#ec4899' },
    bills: { label: 'Bills & Utilities', icon: '💡', color: '#f59e0b' },
    health: { label: 'Healthcare', icon: '💊', color: '#ef4444' },
    entertainment: { label: 'Leisure & Fun', icon: '🎬', color: '#8b5cf6' },
    other: { label: 'Other', icon: '📦', color: '#64748b' }
  };

  // Realistic sample data for first-time or demo load
  const SAMPLE_EXPENSES = [
    {
      id: 'tx_sample_1',
      amount: 145.50,
      item: 'ENOC Petrol Full Tank',
      category: 'transport',
      date: getRelativeDate(0), // today
      paymentMethod: 'Apple Pay',
      notes: 'Special 95 at Al Barsha',
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'tx_sample_2',
      amount: 284.75,
      item: 'Carrefour Weekly Groceries',
      category: 'groceries',
      date: getRelativeDate(0), // today
      paymentMethod: 'Credit Card',
      notes: 'Fruits, veggies and essentials',
      createdAt: Date.now() - 3600000 * 4
    },
    {
      id: 'tx_sample_3',
      amount: 6.00,
      item: 'Karak Chai & Samosa',
      category: 'food',
      date: getRelativeDate(1), // yesterday
      paymentMethod: 'Cash',
      notes: 'Evening tea with friend',
      createdAt: Date.now() - 3600000 * 26
    },
    {
      id: 'tx_sample_4',
      amount: 100.00,
      item: 'Salik Account Auto-Recharge',
      category: 'transport',
      date: getRelativeDate(2),
      paymentMethod: 'Debit Card',
      notes: 'Toll balance top up',
      createdAt: Date.now() - 3600000 * 50
    },
    {
      id: 'tx_sample_5',
      amount: 420.00,
      item: 'DEWA Monthly Electricity & Water',
      category: 'bills',
      date: getRelativeDate(4),
      paymentMethod: 'Bank Transfer',
      notes: 'Apartment bill',
      createdAt: Date.now() - 3600000 * 95
    },
    {
      id: 'tx_sample_6',
      amount: 85.00,
      item: 'Deliveroo Dinner Burger Box',
      category: 'food',
      date: getRelativeDate(5),
      paymentMethod: 'Apple Pay',
      notes: 'Friday night meal',
      createdAt: Date.now() - 3600000 * 120
    }
  ];

  // Helper to generate ISO date string (YYYY-MM-DD)
  function getRelativeDate(daysAgo = 0) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  // Application State
  const state = {
    expenses: [],
    budget: 5000,
    analyticsPeriod: 'all', // 'all', 'month', 'week'
    searchQuery: '',
    filterCategory: 'all',
    sortOrder: 'newest'
  };

  // DOM Elements
  const DOM = {
    // Header & Budget
    headerBudgetVal: document.getElementById('headerBudgetVal'),
    headerBudgetFill: document.getElementById('headerBudgetFill'),
    budgetChip: document.getElementById('budgetChip'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIconSun: document.getElementById('themeIconSun'),
    themeIconMoon: document.getElementById('themeIconMoon'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    
    // Form Inputs
    expenseForm: document.getElementById('expenseForm'),
    amountInput: document.getElementById('amountInput'),
    itemInput: document.getElementById('itemInput'),
    categoryInput: document.getElementById('categoryInput'),
    categoryPicker: document.getElementById('categoryPicker'),
    dateInput: document.getElementById('dateInput'),
    paymentMethodSelect: document.getElementById('paymentMethodSelect'),
    notesInput: document.getElementById('notesInput'),
    clearAmountBtn: document.getElementById('clearAmountBtn'),
    suggestionTags: document.getElementById('suggestionTags'),
    quickSampleBtn: document.getElementById('quickSampleBtn'),
    
    // KPIs
    kpiTotalAmount: document.getElementById('kpiTotalAmount'),
    kpiTotalSubtext: document.getElementById('kpiTotalSubtext'),
    kpiMonthAmount: document.getElementById('kpiMonthAmount'),
    kpiMonthComparison: document.getElementById('kpiMonthComparison'),
    kpiTodayAmount: document.getElementById('kpiTodayAmount'),
    kpiTodayCount: document.getElementById('kpiTodayCount'),
    kpiTopCategory: document.getElementById('kpiTopCategory'),
    kpiTopCategoryAmount: document.getElementById('kpiTopCategoryAmount'),

    // Analytics Breakdown
    analyticsFilterTabs: document.getElementById('analyticsFilterTabs'),
    categoryStackedBar: document.getElementById('categoryStackedBar'),
    categoryBreakdownList: document.getElementById('categoryBreakdownList'),

    // Transactions List & Controls
    txCountBadge: document.getElementById('txCountBadge'),
    txSearchInput: document.getElementById('txSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    txFilterCategory: document.getElementById('txFilterCategory'),
    txSortSelect: document.getElementById('txSortSelect'),
    txListContainer: document.getElementById('txListContainer'),
    emptyLoadDemoBtn: document.getElementById('emptyLoadDemoBtn'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModalBtn: document.getElementById('closeSettingsModalBtn'),
    modalBudgetInput: document.getElementById('modalBudgetInput'),
    saveBudgetBtn: document.getElementById('saveBudgetBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    importJsonInput: document.getElementById('importJsonInput'),
    clearAllDataBtn: document.getElementById('clearAllDataBtn'),

    // Edit Modal
    editTxModal: document.getElementById('editTxModal'),
    closeEditModalBtn: document.getElementById('closeEditModalBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    editTxForm: document.getElementById('editTxForm'),
    editTxId: document.getElementById('editTxId'),
    editAmount: document.getElementById('editAmount'),
    editItem: document.getElementById('editItem'),
    editCategory: document.getElementById('editCategory'),
    editDate: document.getElementById('editDate'),
    editPayment: document.getElementById('editPayment'),
    editNotes: document.getElementById('editNotes'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // --- INITIALIZATION ---
  function init() {
    loadSettings();
    loadExpenses();
    setupDefaultDate();
    setupEventListeners();
    applyTheme(localStorage.getItem(STORAGE_KEY_THEME) || 'dark');
    renderAll();
  }

  // --- STORAGE & STATE MANAGEMENT ---
  function loadExpenses() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (data) {
        state.expenses = JSON.parse(data);
      } else {
        // Start with clean state; user can easily click demo data
        state.expenses = [];
      }
    } catch (e) {
      console.error('Failed to load expenses:', e);
      state.expenses = [];
    }
  }

  function saveExpenses() {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(state.expenses));
    } catch (e) {
      console.error('Failed to save expenses:', e);
      showToast('Storage full or error saving data', 'error');
    }
  }

  function loadSettings() {
    const savedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);
    if (savedBudget) {
      state.budget = parseFloat(savedBudget) || 5000;
    }
    if (DOM.modalBudgetInput) {
      DOM.modalBudgetInput.value = state.budget;
    }
  }

  function saveBudget(newBudget) {
    state.budget = newBudget;
    localStorage.setItem(STORAGE_KEY_BUDGET, newBudget);
    renderBudget();
    renderKPIs();
    showToast(`Monthly budget set to ${formatCurrency(newBudget)} AED`, 'success');
  }

  function setupDefaultDate() {
    if (DOM.dateInput) {
      DOM.dateInput.value = getRelativeDate(0);
    }
  }

  // --- NUMBER & CURRENCY FORMATTING ---
  function formatCurrency(num) {
    if (isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today - date;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }

  // --- UI RENDERING ---
  function renderAll() {
    renderBudget();
    renderKPIs();
    renderAnalyticsBreakdown();
    renderTransactionList();
  }

  // 1. Budget Display in Header
  function renderBudget() {
    const currentMonthExpenses = getCurrentMonthTotal();
    const percent = Math.min(100, Math.round((currentMonthExpenses / state.budget) * 100));

    if (DOM.headerBudgetVal) {
      DOM.headerBudgetVal.textContent = `${formatCurrency(currentMonthExpenses)} / ${formatCurrency(state.budget)} AED`;
    }

    if (DOM.headerBudgetFill) {
      DOM.headerBudgetFill.style.width = `${percent}%`;
      DOM.headerBudgetFill.className = 'budget-fill-mini';
      if (percent >= 90) {
        DOM.headerBudgetFill.classList.add('danger');
      } else if (percent >= 70) {
        DOM.headerBudgetFill.classList.add('warning');
      }
    }
  }

  function getCurrentMonthTotal() {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return state.expenses
      .filter(tx => tx.date && tx.date.startsWith(yearMonth))
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }

  // 2. Overview KPI Cards
  function renderKPIs() {
    // Total Spent (All time)
    const totalSpent = state.expenses.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    DOM.kpiTotalAmount.textContent = formatCurrency(totalSpent);
    DOM.kpiTotalSubtext.textContent = `${state.expenses.length} spending${state.expenses.length === 1 ? '' : 's'} recorded`;

    // This Month
    const monthSpent = getCurrentMonthTotal();
    DOM.kpiMonthAmount.textContent = formatCurrency(monthSpent);
    const budgetPct = state.budget > 0 ? Math.round((monthSpent / state.budget) * 100) : 0;
    DOM.kpiMonthComparison.textContent = `${budgetPct}% of ${formatCurrency(state.budget)} AED budget`;

    // Today's Spend
    const todayStr = getRelativeDate(0);
    const todayTxs = state.expenses.filter(tx => tx.date === todayStr);
    const todaySpent = todayTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    DOM.kpiTodayAmount.textContent = formatCurrency(todaySpent);
    DOM.kpiTodayCount.textContent = `${todayTxs.length} transaction${todayTxs.length === 1 ? '' : 's'} today`;

    // Top Category
    const catTotals = {};
    state.expenses.forEach(tx => {
      const cat = tx.category || 'other';
      catTotals[cat] = (catTotals[cat] || 0) + Number(tx.amount || 0);
    });

    let topCategory = null;
    let topCatAmount = 0;
    Object.keys(catTotals).forEach(cat => {
      if (catTotals[cat] > topCatAmount) {
        topCatAmount = catTotals[cat];
        topCategory = cat;
      }
    });

    if (topCategory && topCatAmount > 0) {
      const catMeta = CATEGORIES[topCategory] || CATEGORIES.other;
      DOM.kpiTopCategory.textContent = `${catMeta.icon} ${catMeta.label}`;
      DOM.kpiTopCategoryAmount.textContent = `${formatCurrency(topCatAmount)} AED total`;
    } else {
      DOM.kpiTopCategory.textContent = 'None yet';
      DOM.kpiTopCategoryAmount.textContent = '0.00 AED spent';
    }
  }

  // 3. Category Breakdown & Visual Distribution
  function renderAnalyticsBreakdown() {
    // Filter expenses by selected period
    let filtered = [...state.expenses];
    const now = new Date();

    if (state.analyticsPeriod === 'month') {
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      filtered = filtered.filter(tx => tx.date && tx.date.startsWith(yearMonth));
    } else if (state.analyticsPeriod === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      const weekStr = oneWeekAgo.toISOString().split('T')[0];
      filtered = filtered.filter(tx => tx.date && tx.date >= weekStr);
    }

    const totalPeriodSpend = filtered.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    // Group by category
    const catMap = {};
    filtered.forEach(tx => {
      const c = tx.category || 'other';
      catMap[c] = (catMap[c] || 0) + Number(tx.amount || 0);
    });

    // Sort categories descending by amount
    const sortedCats = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]);

    // Render Stacked Bar
    DOM.categoryStackedBar.innerHTML = '';
    if (totalPeriodSpend <= 0 || sortedCats.length === 0) {
      DOM.categoryStackedBar.innerHTML = `<div class="bar-segment" style="width: 100%; background: rgba(255,255,255,0.06);" title="No expenses in this period"></div>`;
    } else {
      sortedCats.forEach(catKey => {
        const amt = catMap[catKey];
        const pct = ((amt / totalPeriodSpend) * 100).toFixed(1);
        const meta = CATEGORIES[catKey] || CATEGORIES.other;

        const segment = document.createElement('div');
        segment.className = 'bar-segment';
        segment.style.width = `${pct}%`;
        segment.style.backgroundColor = meta.color;
        segment.title = `${meta.label}: ${formatCurrency(amt)} AED (${pct}%)`;
        DOM.categoryStackedBar.appendChild(segment);
      });
    }

    // Render Category Cards List
    DOM.categoryBreakdownList.innerHTML = '';
    if (totalPeriodSpend <= 0 || sortedCats.length === 0) {
      DOM.categoryBreakdownList.innerHTML = `
        <div class="empty-state-mini">
          <p>No spendings recorded for the selected period.</p>
        </div>
      `;
      return;
    }

    sortedCats.forEach(catKey => {
      const amt = catMap[catKey];
      const pct = Math.round((amt / totalPeriodSpend) * 100);
      const meta = CATEGORIES[catKey] || CATEGORIES.other;

      const itemEl = document.createElement('div');
      itemEl.className = 'cat-breakdown-item';
      itemEl.innerHTML = `
        <div class="cat-item-left">
          <div class="cat-item-indicator" style="background-color: ${meta.color}"></div>
          <div>
            <div class="cat-item-label">${meta.icon} ${meta.label}</div>
            <div class="cat-item-pct">${pct}% of period spending</div>
          </div>
        </div>
        <div class="cat-item-amount">${formatCurrency(amt)} <span class="currency-tag">AED</span></div>
      `;
      DOM.categoryBreakdownList.appendChild(itemEl);
    });
  }

  // 4. Transaction List
  function renderTransactionList() {
    let list = [...state.expenses];

    // Search query filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(tx => 
        (tx.item && tx.item.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q)) ||
        (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (state.filterCategory !== 'all') {
      list = list.filter(tx => tx.category === state.filterCategory);
    }

    // Sorting
    list.sort((a, b) => {
      if (state.sortOrder === 'newest') {
        return (new Date(b.date).getTime() - new Date(a.date).getTime()) || (b.createdAt - a.createdAt);
      } else if (state.sortOrder === 'oldest') {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) || (a.createdAt - b.createdAt);
      } else if (state.sortOrder === 'highest') {
        return b.amount - a.amount;
      } else if (state.sortOrder === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });

    // Update count badge
    DOM.txCountBadge.textContent = list.length;

    // Render list or empty state
    DOM.txListContainer.innerHTML = '';
    if (list.length === 0) {
      if (state.expenses.length === 0) {
        DOM.txListContainer.innerHTML = `
          <div class="empty-state-large">
            <div class="empty-icon-wrap">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <h3>No Spendings Recorded Yet</h3>
            <p>Type your expense amount in AED and the item name above to get started tracking your money!</p>
            <button type="button" class="btn-secondary-action" id="emptyLoadDemoBtnInner">
              <span>Load Sample UAE Expenses</span>
            </button>
          </div>
        `;
        document.getElementById('emptyLoadDemoBtnInner')?.addEventListener('click', loadSampleExpenses);
      } else {
        DOM.txListContainer.innerHTML = `
          <div class="empty-state-large">
            <p>No transactions match your current search or category filter.</p>
            <button type="button" class="btn-ghost-sm" id="resetFiltersBtn">Reset Filters</button>
          </div>
        `;
        document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
          state.searchQuery = '';
          state.filterCategory = 'all';
          DOM.txSearchInput.value = '';
          DOM.txFilterCategory.value = 'all';
          DOM.clearSearchBtn.classList.add('hidden');
          renderTransactionList();
        });
      }
      return;
    }

    list.forEach(tx => {
      const catMeta = CATEGORIES[tx.category] || CATEGORIES.other;
      const txEl = document.createElement('div');
      txEl.className = 'tx-item';
      txEl.dataset.id = tx.id;

      txEl.innerHTML = `
        <div class="tx-left">
          <div class="tx-cat-badge" style="border: 1px solid ${catMeta.color}33; background: ${catMeta.color}18;" title="${catMeta.label}">
            ${catMeta.icon}
          </div>
          <div class="tx-details">
            <div class="tx-item-title">${escapeHtml(tx.item)}</div>
            <div class="tx-meta">
              <span>${formatDateDisplay(tx.date)}</span>
              <span class="tx-meta-sep">•</span>
              <span>${escapeHtml(tx.paymentMethod || 'Apple Pay')}</span>
              ${tx.notes ? `<span class="tx-meta-sep">•</span><span class="tx-notes-tag" title="${escapeHtml(tx.notes)}">${escapeHtml(tx.notes)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="tx-right">
          <div class="tx-amount-wrap">
            <span class="tx-amount">${formatCurrency(tx.amount)}</span>
            <span class="tx-currency">AED</span>
          </div>
          <div class="tx-actions">
            <button type="button" class="btn-action-icon edit-tx-btn" title="Edit this spending" aria-label="Edit spending">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" class="btn-action-icon delete-btn delete-tx-btn" title="Delete spending" aria-label="Delete spending">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      `;

      // Attach actions
      txEl.querySelector('.edit-tx-btn').addEventListener('click', () => openEditModal(tx.id));
      txEl.querySelector('.delete-tx-btn').addEventListener('click', () => deleteExpense(tx.id));

      DOM.txListContainer.appendChild(txEl);
    });
  }

  // --- ACTIONS & HANDLERS ---
  function addExpense(data) {
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      amount: parseFloat(data.amount),
      item: data.item.trim(),
      category: data.category,
      date: data.date,
      paymentMethod: data.paymentMethod,
      notes: data.notes ? data.notes.trim() : '',
      createdAt: Date.now()
    };

    state.expenses.unshift(newTx);
    saveExpenses();
    renderAll();

    showToast(`Added ${escapeHtml(newTx.item)} for ${formatCurrency(newTx.amount)} AED`, 'success');
  }

  function updateExpense(id, updatedData) {
    const index = state.expenses.findIndex(tx => tx.id === id);
    if (index === -1) return;

    state.expenses[index] = {
      ...state.expenses[index],
      amount: parseFloat(updatedData.amount),
      item: updatedData.item.trim(),
      category: updatedData.category,
      date: updatedData.date,
      paymentMethod: updatedData.paymentMethod,
      notes: updatedData.notes ? updatedData.notes.trim() : ''
    };

    saveExpenses();
    renderAll();
    showToast('Spending updated successfully', 'success');
  }

  function deleteExpense(id) {
    const tx = state.expenses.find(t => t.id === id);
    if (!tx) return;

    if (!confirm(`Delete "${tx.item}" (${formatCurrency(tx.amount)} AED)?`)) {
      return;
    }

    state.expenses = state.expenses.filter(t => t.id !== id);
    saveExpenses();
    renderAll();
    showToast(`Deleted ${escapeHtml(tx.item)}`, 'info');
  }

  function loadSampleExpenses() {
    state.expenses = JSON.parse(JSON.stringify(SAMPLE_EXPENSES));
    saveExpenses();
    renderAll();
    showToast('Sample UAE expenses loaded!', 'success');
  }

  // Edit Modal Handling
  function openEditModal(id) {
    const tx = state.expenses.find(t => t.id === id);
    if (!tx) return;

    DOM.editTxId.value = tx.id;
    DOM.editAmount.value = tx.amount;
    DOM.editItem.value = tx.item;
    DOM.editCategory.value = tx.category;
    DOM.editDate.value = tx.date;
    DOM.editPayment.value = tx.paymentMethod || 'Apple Pay';
    DOM.editNotes.value = tx.notes || '';

    DOM.editTxModal.showModal();
  }

  function closeEditModal() {
    DOM.editTxModal.close();
  }

  // --- DATA EXPORT & IMPORT ---
  function exportCSV() {
    if (state.expenses.length === 0) {
      showToast('No spendings to export', 'error');
      return;
    }

    const headers = ['ID', 'Date', 'Item', 'Amount_AED', 'Category', 'Payment_Method', 'Notes'];
    const rows = state.expenses.map(tx => [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${(tx.item || '').replace(/"/g, '""')}"`,
      tx.amount,
      `"${tx.category}"`,
      `"${tx.paymentMethod || ''}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Monit_AED_Expenses_${getRelativeDate(0)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Export downloaded', 'success');
  }

  function exportJSON() {
    if (state.expenses.length === 0) {
      showToast('No spendings to backup', 'error');
      return;
    }

    const backupData = {
      version: 1,
      appName: 'Monit AED',
      exportDate: new Date().toISOString(),
      budget: state.budget,
      expenses: state.expenses
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Monit_AED_Backup_${getRelativeDate(0)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('JSON Backup downloaded', 'success');
  }

  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.expenses && Array.isArray(parsed.expenses)) {
          state.expenses = parsed.expenses;
          if (parsed.budget && Number(parsed.budget) > 0) {
            state.budget = Number(parsed.budget);
            localStorage.setItem(STORAGE_KEY_BUDGET, state.budget);
          }
          saveExpenses();
          renderAll();
          DOM.settingsModal.close();
          showToast(`Successfully imported ${parsed.expenses.length} expenses!`, 'success');
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch (err) {
        console.error('Import error:', err);
        showToast('Error parsing JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
  }

  // --- THEME TOGGLE ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'light') {
      DOM.themeIconSun.classList.add('hidden');
      DOM.themeIconMoon.classList.remove('hidden');
    } else {
      DOM.themeIconSun.classList.remove('hidden');
      DOM.themeIconMoon.classList.add('hidden');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'info') icon = 'ℹ';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Theme toggle
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Form submission
    DOM.expenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amountVal = parseFloat(DOM.amountInput.value);
      const itemVal = DOM.itemInput.value.trim();

      if (!amountVal || amountVal <= 0) {
        showToast('Please enter a valid amount in AED', 'error');
        DOM.amountInput.focus();
        return;
      }
      if (!itemVal) {
        showToast('Please specify what item you spent on', 'error');
        DOM.itemInput.focus();
        return;
      }

      addExpense({
        amount: amountVal,
        item: itemVal,
        category: DOM.categoryInput.value || 'food',
        date: DOM.dateInput.value || getRelativeDate(0),
        paymentMethod: DOM.paymentMethodSelect.value,
        notes: DOM.notesInput.value
      });

      // Reset form fields
      DOM.amountInput.value = '';
      DOM.itemInput.value = '';
      DOM.notesInput.value = '';
      DOM.amountInput.focus();
    });

    // Quick AED pills
    document.querySelectorAll('.quick-pill[data-add]').forEach(pill => {
      pill.addEventListener('click', () => {
        const toAdd = parseFloat(pill.dataset.add) || 0;
        const current = parseFloat(DOM.amountInput.value) || 0;
        DOM.amountInput.value = (current + toAdd).toFixed(2);
      });
    });

    DOM.clearAmountBtn.addEventListener('click', () => {
      DOM.amountInput.value = '';
      DOM.amountInput.focus();
    });

    // Category Picker chips
    DOM.categoryPicker.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.categoryPicker.querySelectorAll('.cat-chip').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-checked', 'true');
        DOM.categoryInput.value = chip.dataset.category;
      });
    });

    // Quick suggestion tags
    DOM.suggestionTags.querySelectorAll('.sugg-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const item = tag.dataset.item;
        const cat = tag.dataset.cat;
        DOM.itemInput.value = item;

        // Auto select category
        DOM.categoryPicker.querySelectorAll('.cat-chip').forEach(c => {
          if (c.dataset.category === cat) {
            c.classList.add('active');
            c.setAttribute('aria-checked', 'true');
          } else {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          }
        });
        DOM.categoryInput.value = cat;
        DOM.amountInput.focus();
      });
    });

    // Demo Data button in card header
    DOM.quickSampleBtn.addEventListener('click', loadSampleExpenses);

    // Period filter tabs (All Time / Month / Week)
    DOM.analyticsFilterTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.analyticsFilterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.analyticsPeriod = btn.dataset.period;
        renderAnalyticsBreakdown();
      });
    });

    // Transactions Search & Filters
    DOM.txSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.searchQuery) {
        DOM.clearSearchBtn.classList.remove('hidden');
      } else {
        DOM.clearSearchBtn.classList.add('hidden');
      }
      renderTransactionList();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.txSearchInput.value = '';
      DOM.clearSearchBtn.classList.add('hidden');
      renderTransactionList();
    });

    DOM.txFilterCategory.addEventListener('change', (e) => {
      state.filterCategory = e.target.value;
      renderTransactionList();
    });

    DOM.txSortSelect.addEventListener('change', (e) => {
      state.sortOrder = e.target.value;
      renderTransactionList();
    });

    // Settings Modal
    DOM.budgetChip.addEventListener('click', () => DOM.settingsModal.showModal());
    DOM.openSettingsBtn.addEventListener('click', () => DOM.settingsModal.showModal());
    DOM.closeSettingsModalBtn.addEventListener('click', () => DOM.settingsModal.close());

    // Save budget
    DOM.saveBudgetBtn.addEventListener('click', () => {
      const val = parseFloat(DOM.modalBudgetInput.value);
      if (val && val > 0) {
        saveBudget(val);
      } else {
        showToast('Please enter a valid monthly budget', 'error');
      }
    });

    // CSV & JSON export
    DOM.exportCsvBtn.addEventListener('click', exportCSV);
    DOM.exportJsonBtn.addEventListener('click', exportJSON);

    // JSON import
    DOM.importJsonInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importJSON(e.target.files[0]);
      }
    });

    // Clear all data
    DOM.clearAllDataBtn.addEventListener('click', () => {
      if (confirm('Are you absolutely sure you want to delete ALL expenses? This cannot be undone.')) {
        state.expenses = [];
        saveExpenses();
        renderAll();
        DOM.settingsModal.close();
        showToast('All expense data cleared', 'info');
      }
    });

    // Edit Transaction Modal
    DOM.closeEditModalBtn.addEventListener('click', closeEditModal);
    DOM.cancelEditBtn.addEventListener('click', closeEditModal);
    DOM.editTxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = DOM.editTxId.value;
      updateExpense(id, {
        amount: DOM.editAmount.value,
        item: DOM.editItem.value,
        category: DOM.editCategory.value,
        date: DOM.editDate.value,
        paymentMethod: DOM.editPayment.value,
        notes: DOM.editNotes.value
      });
      closeEditModal();
    });

    // Close modals on clicking backdrop
    [DOM.settingsModal, DOM.editTxModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          modal.close();
        }
      });
    });
  }

  // Boot app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
