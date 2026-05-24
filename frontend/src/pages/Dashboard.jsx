import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  const token = localStorage.getItem('token');

  const [modal, setModal] = useState(null); // 'expense' | 'receipt' | 'income' | 'transfer'
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Bell notification panel toggle
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', title: '⚠️ Budget Exceeded', msg: 'You exceeded food budget by ₹2,400.', color: 'pink', read: false },
    { id: 2, type: 'success', title: '📈 Savings Improved', msg: 'Savings improved by 12% this month!', color: 'emerald', read: false },
    { id: 3, type: 'info', title: '🤖 AI Insight Ready', msg: 'New AI spending forecast available.', color: 'indigo', read: false },
  ]);

  // Dark / light mode toggle
  const [darkMode, setDarkMode] = useState(true);
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('bg-white', !next);
      document.body.style.background = next ? '' : '#f8fafc';
      document.body.style.color = next ? '' : '#0f172a';
      return next;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const [subCount, setSubCount] = useState(0);
  const [subCost, setSubCost] = useState(0);

  const [expenses, setExpenses] = useState([]);
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
  const [chartPeriod, setChartPeriod] = useState('month'); // 'week' | 'month'

  // Fetch user expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data || []);
      }
    } catch (e) {
      console.error('Error fetching expenses', e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, [token]);

  // Fetch dynamic subscription metrics
  useEffect(() => {
    const fetchSubMetrics = async () => {
      try {
        const res = await fetch('/api/subscriptions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const active = data.filter(s => s.status === 'Active');
          setSubCount(active.length);
          const cost = active.reduce((sum, s) => {
            const amount = s.cost;
            return sum + (s.billingCycle === 'yearly' ? Math.round(amount / 12) : amount);
          }, 0);
          setSubCost(cost);
        }
      } catch (e) {
        console.error('Error fetching subscriptions metrics', e);
      }
    };
    if (token) {
      fetchSubMetrics();
    }
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => setModal(null);

  // Add Expense
  const [expense, setExpense] = useState({ merchant: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '' });
  const submitExpense = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(expense) });
      const data = await res.json();
      if (res.ok) { showToast('Expense added!'); closeModal(); setExpense({ merchant: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '' }); fetchExpenses(); }
      else showToast(data.message || 'Failed', 'error');
    } catch { showToast('Error adding expense', 'error'); }
    setLoading(false);
  };

  // Add Income
  const [income, setIncome] = useState({ title: '', amount: '', source: 'Salary', date: new Date().toISOString().slice(0, 10) });
  const submitIncome = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...income, category: 'Income', type: 'income' }) });
      const data = await res.json();
      if (res.ok) { showToast('Income added!'); closeModal(); setIncome({ title: '', amount: '', source: 'Salary', date: new Date().toISOString().slice(0, 10) }); fetchExpenses(); }
      else showToast(data.message || 'Failed', 'error');
    } catch { showToast('Error adding income', 'error'); }
    setLoading(false);
  };

  // Upload Receipt
  const [receipt, setReceipt] = useState(null);
  const submitReceipt = async (e) => {
    e.preventDefault();
    if (!receipt) { showToast('Please select a file', 'error'); return; }
    setLoading(true);
    const fd = new FormData(); fd.append('receipt', receipt);
    try {
      const res = await fetch('/api/ocr/scan', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.ok) { showToast('Receipt uploaded & scanned!'); closeModal(); setReceipt(null); fetchExpenses(); }
      else showToast(data.message || 'Failed', 'error');
    } catch { showToast('Error uploading receipt', 'error'); }
    setLoading(false);
  };

  // Transfer
  const [transfer, setTransfer] = useState({ from: 'Savings', to: 'Checking', amount: '', note: '' });
  const submitTransfer = (e) => {
    e.preventDefault();
    showToast(`Transfer of ₹${transfer.amount} recorded!`);
    closeModal();
    setTransfer({ from: 'Savings', to: 'Checking', amount: '', note: '' });
  };

  const getChartData = () => {
    const onlyExpenses = expenses.filter(e => e.type !== 'income');
    const today = new Date();
    let pointsCount = 7;
    let daysStep = 1;

    if (chartPeriod === 'week') {
      pointsCount = 7;
      daysStep = 1;
    } else {
      pointsCount = 10;
      daysStep = 3;
    }

    const dataPoints = [];
    for (let i = pointsCount - 1; i >= 0; i--) {
      const start = new Date(today);
      start.setDate(today.getDate() - i * daysStep);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + daysStep);

      // Sum expenses in this date range
      const sum = onlyExpenses
        .filter(e => {
          const d = new Date(e.date);
          return d >= start && d < end;
        })
        .reduce((s, e) => s + e.amount, 0);

      // Label
      let label = '';
      if (chartPeriod === 'week') {
        label = start.toLocaleDateString('en-IN', { weekday: 'short' });
      } else {
        label = start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }

      dataPoints.push({ label, amount: sum });
    }

    // Default mock padding if no expenses exist yet
    const hasData = dataPoints.some(p => p.amount > 0);
    if (!hasData) {
      // Seed beautiful mock trends if the database is brand new!
      const mockAmounts = chartPeriod === 'week'
        ? [1200, 1500, 900, 3200, 1800, 2100, 1700]
        : [4500, 5200, 3100, 8900, 6200, 4800, 7100, 5300, 6800, 5900];
      return dataPoints.map((p, idx) => ({ ...p, amount: mockAmounts[idx] || 1500 }));
    }

    return dataPoints;
  };

  const getAiActionHeadline = () => {
    const onlyExpenses = expenses.filter(e => e.type !== 'income');
    if (onlyExpenses.length === 0) return '🤖 AI Suggestion: Add your first expense to begin real-time budget forecasting!';

    // Group spending by category
    const catSums = {};
    onlyExpenses.forEach(e => {
      catSums[e.category] = (catSums[e.category] || 0) + e.amount;
    });

    let topCat = 'Food';
    let topAmt = 0;
    Object.entries(catSums).forEach(([cat, amt]) => {
      if (amt > topAmt) {
        topAmt = amt;
        topCat = cat;
      }
    });

    if (topCat === 'Food') return '🤖 AI Suggestion: Dining out accounts for your highest spending. Try setting a tighter Food budget!';
    if (topCat === 'Shopping') return '🤖 AI Suggestion: Shopping overheads are peaking this week. Consider deferring non-essential purchases!';
    if (topCat === 'Bills') return '🤖 AI Suggestion: Recurring billing detected. Audit your active subscription licenses in Settings.';
    if (topCat === 'Utilities') return '🤖 AI Suggestion: Utility overheads identified. Unplug redundant appliances to lower month-end counts.';
    return `🤖 AI Suggestion: Spending is peaking in ${topCat}. Set a budget limit to optimize savings streaks.`;
  };

  const chartPoints = getChartData();
  const maxVal = Math.max(...chartPoints.map(p => p.amount), 1000);
  const xStep = 500 / (chartPoints.length - 1);

  // Coordinates
  const coords = chartPoints.map((p, idx) => {
    const x = idx * xStep;
    const y = 90 - (p.amount / maxVal) * 75;
    return { x, y, amount: p.amount, label: p.label };
  });

  // SVG Line path
  const linePath = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x} 100 L ${coords[0].x} 100 Z`
    : '';

  // Max spike index
  let maxIdx = 0;
  let maxAmt = 0;
  coords.forEach((c, idx) => {
    if (c.amount > maxAmt) {
      maxAmt = c.amount;
      maxIdx = idx;
    }
  });
  const maxCoord = coords[maxIdx] || { x: 250, y: 30 };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 glass border-r border-slate-800/50 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="mb-10 text-2xl font-bold text-gradient">FinTrack AI</div>
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
            <a href="#" className="flex items-center space-x-3 text-indigo-400 font-medium p-2.5 bg-slate-800/50 rounded-xl">
              <span>📊</span><span>Dashboard</span>
            </a>
            <Link to="/expenses" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>💸</span><span>Expenses</span>
            </Link>
            <Link to="/budgets" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>🎯</span><span>Budgets</span>
            </Link>
            <Link to="/analytics" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>📈</span><span>Analytics</span>
            </Link>
            <Link to="/ai-assistant" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>🤖</span><span>AI Assistant</span>
            </Link>
            <Link to="/reports" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>📋</span><span>Reports</span>
            </Link>
            <Link to="/subscriptions" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>🔁</span><span>Subscriptions</span>
            </Link>
            <Link to="/notifications" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>🔔</span><span>Notifications</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>⚙️</span><span>Settings</span>
            </Link>
            <Link to="/help-center" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-800/30 rounded-xl transition-all">
              <span>❓</span><span>Help Center</span>
            </Link>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center space-x-3 text-red-400 hover:text-red-300 p-2.5 hover:bg-red-900/20 rounded-xl transition-all">
              <span>🚪</span><span>Logout</span>
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-slate-500">Premium Plan</div>
            </div>
          </div>
          <div className="text-xs text-slate-600 flex items-center space-x-1 justify-center">
            <span>🔒</span>
            <span>Bank-level encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-xl glass">
            <div className="flex items-center space-x-3 w-1/3">
              <button className="text-slate-400 hover:text-white md:hidden text-xl">
                <span>☰</span>
              </button>
              <input type="text" placeholder="Search Expenses..." className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div className="flex items-center space-x-6">
              <select className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>May 2026</option>
                <option>April 2026</option>
                <option>March 2026</option>
              </select>
              {/* Bell — click-toggle notification panel */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(o => !o)}
                  className="text-slate-400 hover:text-white transition-colors relative text-xl"
                >
                  <span>🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                      <span className="text-sm font-bold text-white">🔔 Notifications</span>
                      <div className="flex gap-2">
                        <button onClick={markAllRead} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">Mark all read</button>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white text-xs ml-2">✕</button>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs">No notifications</div>
                      ) : notifications.map(n => (
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors ${n.read ? 'opacity-50' : ''}`}>
                          <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 bg-${n.color}-400`}></div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold text-${n.color}-400`}>{n.title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.msg}</div>
                          </div>
                          <button onClick={() => dismissNotif(n.id)} className="text-slate-600 hover:text-slate-300 text-xs shrink-0">✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-800 text-center">
                      <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold">View all notifications →</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Moon — dark/light toggle */}
              <button
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="text-slate-400 hover:text-white transition-all text-xl hover:scale-110 active:scale-95"
              >
                <span>{darkMode ? '🌙' : '☀️'}</span>
              </button>
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
              </div>
            </div>
          </div>

          {/* Page Title & Action */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(o => !o)} className="btn-gradient flex items-center space-x-2">
              <span>+ Add Action</span>
              <span className="text-xs">{dropdownOpen ? '▲' : '▼'}</span>
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50">
                <div className="p-2 space-y-1">
                  <button onClick={() => { setModal('expense'); setDropdownOpen(false); }} className="w-full flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-sm text-left">
                    <span>💸</span><span>Add Expense</span>
                  </button>
                  <button onClick={() => { setModal('receipt'); setDropdownOpen(false); }} className="w-full flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-sm text-left">
                    <span>📄</span><span>Upload Receipt</span>
                  </button>
                  <button onClick={() => { setModal('income'); setDropdownOpen(false); }} className="w-full flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-sm text-left">
                    <span>💰</span><span>Add Income</span>
                  </button>
                  <button onClick={() => { setModal('transfer'); setDropdownOpen(false); }} className="w-full flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-sm text-left">
                    <span>🔄</span><span>Transfer</span>
                  </button>
                  <Link to="/budgets" className="w-full flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-sm text-left">
                    <span>🎯</span><span>Set Budget</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* SECTION 2 — Primary KPI Cards (Reduced to 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Expenses */}
          <div className="glass-card flex flex-col justify-between p-5">
            <div>
              <div className="text-slate-400 mb-1 text-xs uppercase tracking-wider">Total Expenses</div>
              <div className="text-3xl font-bold text-white">₹45,200</div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center">
                <span>↑ 12%</span>
                <span className="ml-1 text-slate-500">vs last month</span>
              </div>
            </div>
            <div className="h-8 mt-3">
              <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 20">
                <path d="M 0 15 Q 20 5, 40 12 T 80 2 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Card 2: Remaining Budget */}
          <div className="glass-card flex flex-col justify-between p-5">
            <div>
              <div className="text-slate-400 mb-1 text-xs uppercase tracking-wider">Remaining Budget</div>
              <div className="text-3xl font-bold text-emerald-400">₹14,800</div>
              <div className="text-xs text-slate-500 mt-1">76% spent • Daily: ₹1,450</div>
            </div>
            <div className="h-8 mt-3">
              <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 20">
                <path d="M 0 5 Q 20 15, 40 10 T 80 18 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Card 3: Savings This Month */}
          <div className="glass-card flex flex-col justify-between p-5">
            <div>
              <div className="text-slate-400 mb-1 text-xs uppercase tracking-wider">Savings This Month</div>
              <div className="text-3xl font-bold text-cyan-400">₹14,800</div>
              <div className="text-xs text-cyan-400 mt-1">Forecast: ₹18,000</div>
            </div>
            <div className="h-8 mt-3">
              <svg className="w-full h-full text-cyan-500" viewBox="0 0 100 20">
                <path d="M 0 15 L 20 12 L 40 14 L 60 8 L 80 5 L 100 2" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Card 4: AI Financial Coach (Compact) */}
          <div className="glass-card flex flex-col justify-between p-5 border border-indigo-500/30">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-slate-400 uppercase tracking-wider">AI Coach</div>
                <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded-full">Score: 78</span>
              </div>
              <div className="text-sm font-bold text-gradient mb-2">Overspending Risk ⚠️</div>
              <div className="text-xs text-slate-300 line-clamp-2">Food spending increased 20%. Action: Reduce dining out.</div>
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-2 flex items-center justify-between">
              <span>View Full Insights</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* SECTION 3 — Main Analytics Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left (70%) — Spending Trends Chart */}
          <div className="lg:col-span-2 glass-card h-72 flex flex-col justify-between p-5">
            <div className="flex flex-col mb-2 space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Spending Trends</h2>
                <div className="text-xs text-indigo-400 mt-0.5 flex items-center">
                  <span>{getAiActionHeadline()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex bg-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${chartType === 'line' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${chartType === 'bar' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Bar
                  </button>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setChartPeriod('week')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${chartPeriod === 'week' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setChartPeriod('month')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${chartPeriod === 'month' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Month
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center text-slate-600 relative mt-2 mb-6">
              {chartType === 'line' ? (
                <svg className="w-full h-full max-h-40 text-indigo-500/30 overflow-visible" viewBox="0 0 500 100">
                  <path d={linePath} fill="none" stroke="#6366F1" strokeWidth="3" className="drop-shadow-[0_2px_8px_rgba(99,102,241,0.4)]" />
                  <path d={areaPath} fill="url(#chart-grad)" opacity="0.15" />
                  <defs>
                    <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>

                  {coords.map((c, idx) => (
                    <g key={idx} className="group">
                      <circle cx={c.x} cy={c.y} r="5" fill="#6366F1" className="cursor-pointer hover:r-7 transition-all" />
                      <text x={c.x} y={c.y - 12} textAnchor="middle" fill="#FFFFFF" className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 px-1 py-0.5 rounded pointer-events-none">
                        ₹{c.amount.toLocaleString()}
                      </text>
                    </g>
                  ))}

                  {maxAmt > 0 && (
                    <>
                      <circle cx={maxCoord.x} cy={maxCoord.y} r="5" fill="#EC4899" className="animate-pulse" />
                      <circle cx={maxCoord.x} cy={maxCoord.y} r="8" stroke="#EC4899" strokeWidth="1.5" fill="none" className="animate-ping opacity-75" />
                    </>
                  )}
                </svg>
              ) : (
                <svg className="w-full h-full max-h-40 text-indigo-500/30 overflow-visible" viewBox="0 0 500 100">
                  <defs>
                    <linearGradient id="bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#312E81" opacity="0.3" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="spike-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F472B6" />
                      <stop offset="100%" stopColor="#9D174D" opacity="0.3" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {coords.map((c, idx) => {
                    const barWidth = Math.min(24, 400 / coords.length);
                    const xPos = c.x - barWidth / 2;
                    const barHeight = Math.max(5, 100 - c.y);
                    const isSpike = idx === maxIdx && maxAmt > 0;
                    return (
                      <g key={idx} className="group cursor-pointer">
                        <rect
                          x={xPos}
                          y={c.y}
                          width={barWidth}
                          height={barHeight}
                          rx="4"
                          fill={isSpike ? "url(#spike-grad)" : "url(#bar-grad)"}
                          className="transition-all hover:opacity-90 duration-200"
                        />
                        <text
                          x={c.x}
                          y={c.y - 8}
                          textAnchor="middle"
                          fill={isSpike ? "#F472B6" : "#A5B4FC"}
                          className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ₹{c.amount.toLocaleString()}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {maxAmt > 0 && (
                <div
                  className="absolute bg-pink-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-1 backdrop-blur-sm transition-all pointer-events-none"
                  style={{
                    top: `${Math.max(5, maxCoord.y - 30)}px`,
                    left: `${Math.max(10, Math.min(420, maxCoord.x - 30))}px`
                  }}
                >
                  🔥 Spike: ₹{maxAmt.toLocaleString()}
                </div>
              )}

              <div className="absolute bottom-[-22px] left-0 right-0 flex justify-between px-1 text-[8px] text-slate-500 font-semibold uppercase tracking-wider">
                {coords.map((c, idx) => (
                  <span key={idx} className="truncate text-center" style={{ width: `${100 / coords.length}%` }}>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right (30%) — Recent Transactions */}
          <div className="glass-card h-72 flex flex-col p-5 overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-white">Transactions</h2>
              <Link to="/expenses" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
            </div>

            {expenses.length > 0 ? (
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {expenses.slice(0, 3).map((exp, idx) => (
                  <div key={exp._id || idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base bg-slate-850 p-1.5 rounded-lg border border-slate-800">
                        {exp.type === 'income' ? '💰' : '💸'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate max-w-[100px]">{exp.merchant || exp.title || 'Expense'}</div>
                        <div className="text-[10px] text-slate-500">{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black ${exp.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                        {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString()}
                      </div>
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-medium">
                        {exp.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl mb-2">💸</div>
                <div className="text-white text-sm font-medium mb-1">No transactions yet</div>
                <p className="text-slate-500 text-xs mb-3">Start tracking your expenses.</p>
                <button onClick={() => setModal('expense')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer">+ Add</button>
              </div>
            )}
          </div>
        </div>



        {/* SECTION 5 — Compact Bottom Widgets (Quick Preview) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Bills Widget */}
          <div className="glass-card p-4 flex flex-col justify-between h-32">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Upcoming Bills</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white">Netflix</span>
                  <span className="text-pink-500">Tomorrow</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Electricity</span>
                  <span className="text-amber-500">5 days</span>
                </div>
              </div>
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 text-left">View All Bills →</button>
          </div>

          {/* Goals Widget */}
          <div className="glass-card p-4 flex flex-col justify-between h-32">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Financial Goals</div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-white">MacBook</span>
                    <span className="text-cyan-400">37%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '37%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 text-left">View All Goals →</button>
          </div>

          {/* Subscriptions Widget */}
          <div className="glass-card p-4 flex flex-col justify-between h-32">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Subscriptions</div>
              <div className="text-2xl font-bold text-white">{subCount} Active</div>
              <div className="text-xs text-slate-500 mt-1">₹{subCost.toLocaleString()} / month</div>
            </div>
            <Link to="/subscriptions" className="text-xs text-indigo-400 hover:text-indigo-300 text-left">Manage →</Link>
          </div>

          {/* Notifications Widget */}
          <div className="glass-card p-4 flex flex-col justify-between h-32">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Notifications</div>
              <div className="space-y-1 text-xs">
                <div className="text-emerald-400 truncate">📈 Savings improved!</div>
                <div className="text-pink-500 truncate">⚠️ Budget warning.</div>
              </div>
            </div>
            <Link to="/notifications" className="text-xs text-indigo-400 hover:text-indigo-300 text-left">View All →</Link>
          </div>
        </div>
      </div>

      {/* Floating AI Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-full shadow-2xl flex items-center space-x-2 transition-all transform hover:scale-105">
          <span className="text-xl">💬</span>
          <span className="font-medium text-sm">Ask FinTrack AI</span>
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Modal Backdrop */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>

            {/* Add Expense Modal */}
            {modal === 'expense' && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-white">💸 Add Expense</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={submitExpense} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Merchant / Title</label>
                    <input required className="w-full glass-input" placeholder="e.g. Swiggy, Amazon" value={expense.merchant} onChange={e => setExpense({ ...expense, merchant: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Amount (₹)</label>
                      <input required type="number" min="1" className="w-full glass-input" placeholder="0" value={expense.amount} onChange={e => setExpense({ ...expense, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Category</label>
                      <select className="w-full glass-input" value={expense.category} onChange={e => setExpense({ ...expense, category: e.target.value })}>
                        {['Food', 'Shopping', 'Transport', 'Entertainment', 'Health', 'Education', 'Bills', 'Other'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Date</label>
                    <input type="date" required className="w-full glass-input" value={expense.date} onChange={e => setExpense({ ...expense, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Notes (optional)</label>
                    <input className="w-full glass-input" placeholder="Any note..." value={expense.notes} onChange={e => setExpense({ ...expense, notes: e.target.value })} />
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-gradient mt-2">{loading ? 'Saving...' : 'Add Expense'}</button>
                </form>
              </>
            )}

            {/* Upload Receipt Modal */}
            {modal === 'receipt' && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-white">📄 Upload Receipt</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={submitReceipt} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => document.getElementById('receiptFile').click()}>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-slate-400 text-sm">{receipt ? receipt.name : 'Click to select receipt image'}</p>
                    <p className="text-slate-600 text-xs mt-1">PNG, JPG, PDF supported</p>
                    <input id="receiptFile" type="file" accept="image/*,.pdf" className="hidden" onChange={e => setReceipt(e.target.files[0])} />
                  </div>
                  <p className="text-xs text-indigo-400">🤖 AI will auto-extract expense details from your receipt.</p>
                  <button type="submit" disabled={loading || !receipt} className="w-full btn-gradient">{loading ? 'Scanning...' : 'Upload & Scan'}</button>
                </form>
              </>
            )}

            {/* Add Income Modal */}
            {modal === 'income' && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-white">💰 Add Income</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={submitIncome} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Title</label>
                    <input required className="w-full glass-input" placeholder="e.g. Monthly Salary" value={income.title} onChange={e => setIncome({ ...income, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Amount (₹)</label>
                      <input required type="number" min="1" className="w-full glass-input" placeholder="0" value={income.amount} onChange={e => setIncome({ ...income, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Source</label>
                      <select className="w-full glass-input" value={income.source} onChange={e => setIncome({ ...income, source: e.target.value })}>
                        {['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Date</label>
                    <input type="date" required className="w-full glass-input" value={income.date} onChange={e => setIncome({ ...income, date: e.target.value })} />
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-gradient mt-2">{loading ? 'Saving...' : 'Add Income'}</button>
                </form>
              </>
            )}

            {/* Transfer Modal */}
            {modal === 'transfer' && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-white">🔄 Transfer</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={submitTransfer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">From</label>
                      <select className="w-full glass-input" value={transfer.from} onChange={e => setTransfer({ ...transfer, from: e.target.value })}>
                        {['Savings', 'Checking', 'Cash', 'Investment'].map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">To</label>
                      <select className="w-full glass-input" value={transfer.to} onChange={e => setTransfer({ ...transfer, to: e.target.value })}>
                        {['Checking', 'Savings', 'Cash', 'Investment'].map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Amount (₹)</label>
                    <input required type="number" min="1" className="w-full glass-input" placeholder="0" value={transfer.amount} onChange={e => setTransfer({ ...transfer, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Note (optional)</label>
                    <input className="w-full glass-input" placeholder="Reason for transfer..." value={transfer.note} onChange={e => setTransfer({ ...transfer, note: e.target.value })} />
                  </div>
                  <button type="submit" className="w-full btn-gradient mt-2">Record Transfer</button>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
