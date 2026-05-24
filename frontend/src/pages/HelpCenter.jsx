import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const HELP_CATEGORIES = [
  {
    id: 'start',
    icon: '📘',
    label: 'Getting Started Guide',
    desc: 'Learn how to begin tracking expenses, configure budgets, and activate AI tools.',
    meta: 'Beginner Friendly • 3 min read',
    steps: [
      { num: '1️⃣', title: 'Add Your First Transaction', text: 'Go to Expenses → Add Expense, or upload a receipt image for OCR scanning.' },
      { num: '2️⃣', title: 'Create Budget Limits', text: 'Set spending limits for Food, Travel, Utilities, and more. Automatic alerts trigger at 80%.' },
      { num: '3️⃣', title: 'Activate AI Insights', text: 'Open AI Assistant to detect anomalies, forecast spending, and analyze savings.' }
    ]
  },
  {
    id: 'dashboard',
    icon: '📊',
    label: 'Dashboard Guide',
    desc: 'Understand balance indicators, interactive charts, and quick-action widgets.',
    meta: 'Beginner Friendly • 5 min read',
    steps: [
      { num: '1️⃣', title: 'Main Balance Cards', text: 'Shows real-time Total Income, Total Expenses, and Net Savings aggregates.' },
      { num: '2️⃣', title: 'Category Spending Charts', text: 'Interactive pie charts reflecting which categories exhaust most of your income.' },
      { num: '3️⃣', title: 'Alert Badges', text: 'Gives real-time warnings whenever budget cap thresholds are crossed.' }
    ]
  },
  {
    id: 'expenses',
    icon: '💸',
    label: 'Expense Management',
    desc: 'Learn how to record expenses, edit category transactions, and scan receipts.',
    meta: 'Intermediate • 4 min read',
    steps: [
      { num: '1️⃣', title: 'Create & Edit Transactions', text: 'Add details like merchant name, price tag, category, notes, and tags.' },
      { num: '2️⃣', title: 'OCR Receipt Scanner', text: 'Upload or snap invoice images to extract pricing and details automatically.' },
      { num: '3️⃣', title: 'Category Tagging', text: 'Label transactions carefully to let Gemini classify and audit them later.' }
    ]
  },
  {
    id: 'budgeting',
    icon: '📈',
    label: 'Budgeting Help',
    desc: 'Set up category limits, overspending indicators, and budget cap warnings.',
    meta: 'Intermediate • 3 min read',
    steps: [
      { num: '1️⃣', title: 'Set Category Limits', text: 'Establish monthly targets for utilities, shopping, and dining.' },
      { num: '2️⃣', title: '80% Cap Notifications', text: 'Alerts trigger immediately on your dashboard to help avoid overspending.' },
      { num: '3️⃣', title: 'Optimization Tips', text: 'Review AI suggestions inside the assistant to prune category leaks.' }
    ]
  },
  {
    id: 'ai',
    icon: '🤖',
    label: 'AI Assistant Guide',
    desc: 'Understand anomaly alerts, spending forecasts, and health score calculations.',
    meta: 'Advanced • 6 min read',
    steps: [
      { num: '1️⃣', title: 'Autonomous Anomaly Detection', text: 'Gemini audits transaction logs to instantly catch double charges or atypically high charges.' },
      { num: '2️⃣', title: 'Spending Forecast Dials', text: 'Calculates a 7-day future forecast of upcoming billings using 14-day history regression.' },
      { num: '3️⃣', title: 'Compound Scenario Simulator', text: 'Drag target amount sliders to instantly simulate monthly goals and savings projections.' }
    ]
  },
  {
    id: 'analytics',
    icon: '📄',
    label: 'Analytics & Reports',
    desc: 'Configure customized date filters and export clean CSV/PDF statements.',
    meta: 'Intermediate • 4 min read',
    steps: [
      { num: '1️⃣', title: 'Dynamic Date Range Selectors', text: 'Filter ledgers by specific calendar dates, weekly digests, or monthly reports.' },
      { num: '2️⃣', title: 'One-Click CSV Export', text: 'Download complete tabular transaction sheets for easy import into Excel.' },
      { num: '3️⃣', title: 'Download PDF Invoices', text: 'Generate styled transaction logs to save locally or print.' }
    ]
  },
  {
    id: 'subscriptions',
    icon: '🔁',
    label: 'Subscription Tracking',
    desc: 'Automate tracking recurring renewals from providers like Netflix or AWS.',
    meta: 'Intermediate • 2 min read',
    steps: [
      { num: '1️⃣', title: 'Recurring Detection rules', text: 'The AI automatically identifies recurring payments from services like Netflix, Spotify, AWS, and utility providers.' },
      { num: '2️⃣', title: 'Avoid Renewal Spikes', text: 'Detected subscriptions appear in alerts to help users avoid unexpected renewals.' },
      { num: '3️⃣', title: 'Prune Inactive Logs', text: 'Deactivate subscriptions you no longer use directly inside the helper dashboard.' }
    ]
  },
  {
    id: 'trouble',
    icon: '🛠',
    label: 'Troubleshooting Guide',
    desc: 'Find instant solutions for bank sync errors, missing reports, or loading issues.',
    meta: 'Troubleshooting • 5 min read',
    steps: [
      { num: '1️⃣', title: 'Transaction Update Missing', text: 'Try logging out, clearing browser storage caches, and re-logging in.' },
      { num: '2️⃣', title: 'Gemini Assistant Offline', text: 'Check that your server env holds healthy credentials and has active internet access.' },
      { num: '3️⃣', title: 'Receipt Upload OCR Failure', text: 'Ensure the image files are under 5MB, flat, and photographed under clear ambient light.' }
    ]
  }
];

const HELP_TABS = [
  { id: 'faqs', icon: '❔', label: 'FAQs Accordion' },
  { id: 'support', icon: '📧', label: 'Contact Support' },
  { id: 'bug', icon: '🐞', label: 'Report a Bug' },
  { id: 'features', icon: '💡', label: 'Feature Suggestions' },
  { id: 'status', icon: '📡', label: 'System Health Status' },
  { id: 'safety', icon: '🔐', label: 'Privacy & Safety Tips' }
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };

  // Core Help states
  const [activeSpecialTab, setActiveSpecialTab] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Expanded FAQ Index state
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Bug Report Form state
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugPriority, setBugPriority] = useState('Medium');
  const [bugSuccess, setBugSuccess] = useState(false);

  // Feature Request state
  const [reqTitle, setReqTitle] = useState('');
  const [reqVotes, setReqVotes] = useState([
    { id: 1, title: 'Splitwise Automated Sync Integration', votes: 142, userVoted: false },
    { id: 2, title: 'Crypto Wallet & Ledger Tracking', votes: 98, userVoted: false },
    { id: 3, title: 'Multi-Member Family Shared Wallets', votes: 64, userVoted: false }
  ]);

  // Support AI conversational drawer states
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { id: 1, sender: 'ai', text: `Hello ${user.name}! I am your FinTrack Support AI. Ask me why reports are missing, how recurring billing works, or how to resolve sync errors!` }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Recently Viewed tracker
  const [recentViews, setRecentViews] = useState([
    { id: 'ai', label: 'AI Forecasting Guide', icon: '🤖' },
    { id: 'subscriptions', label: 'Subscription Detection', icon: '🔁' }
  ]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenGuide = (category) => {
    setSelectedGuide(category);
    // Add to recently viewed list
    setRecentViews(prev => {
      const filtered = prev.filter(item => item.id !== category.id);
      return [{ id: category.id, label: category.label, icon: category.icon }, ...filtered].slice(0, 2);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Submit Bug Ticket
  const handleSubmitBug = (e) => {
    e.preventDefault();
    if (!bugTitle || !bugDesc) {
      showToast('Please fill all fields', 'error');
      return;
    }
    showToast('Submitting bug ticket to DevOps team...');
    setTimeout(() => {
      setBugSuccess(true);
      setBugTitle('');
      setBugDesc('');
      showToast('Bug reported successfully! Ticket ID: FT-' + Math.floor(Math.random() * 9000 + 1000));
    }, 1000);
  };

  // Submit Suggestion
  const handleAddFeatureRequest = (e) => {
    e.preventDefault();
    if (!reqTitle) return;
    setReqVotes(prev => [
      ...prev,
      { id: Date.now(), title: reqTitle, votes: 1, userVoted: true }
    ]);
    setReqTitle('');
    showToast('Feature request posted successfully!');
  };

  // Vote on suggestion
  const handleVote = (id) => {
    setReqVotes(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          votes: item.userVoted ? item.votes - 1 : item.votes + 1,
          userVoted: !item.userVoted
        };
      }
      return item;
    }));
    showToast('Feedback logged!');
  };

  // AI Support autonomous Q&A responses
  const handleAiHelpSubmit = (e) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;

    const userText = aiQuery.trim();
    setAiMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setAiQuery('');
    setAiLoading(true);

    setTimeout(() => {
      let aiText = "I apologize, I'm researching our support indices. Try asking about 'missing reports', 'recurring billing', or 'sync errors'.";
      const q = userText.toLowerCase();

      if (q.includes('report') || q.includes('miss') || q.includes('find')) {
        aiText = "📄 If reports or statement summaries are missing, navigate to the Reports Page, select a valid date range, and click Generate Statement. Ensure at least one expense entry exists in that duration.";
      } else if (q.includes('billing') || q.includes('recurring') || q.includes('subscription')) {
        aiText = "🔁 Recurring billing is traced by matching periodic merchant withdrawals. Tapping Subscription Tracing guides you to enable bill alert notification preferences.";
      } else if (q.includes('sync') || q.includes('error') || q.includes('bank')) {
        aiText = "📡 Bank sync errors can occur if sandbox login keys expire. Go to Connected Portals in Settings and click 'Reconnect' next to PayPal or HDFC.";
      } else if (q.includes('forecast') || q.includes('predict')) {
        aiText = "📊 AI Spending Forecasts are generated using 14-day history regression to map upcoming billing frequencies.";
      } else if (q.includes('warning') || q.includes('limit')) {
        aiText = "⚠️ Warnings trigger immediately at 80% category budget cap thresholds.";
      }

      setAiMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
      setAiLoading(false);
    }, 800);
  };

  const triggerAiQuickHelp = (prompt) => {
    setAiQuery(prompt);
    setTimeout(() => {
      const btn = document.getElementById('ai-help-submit-btn');
      if (btn) btn.click();
    }, 50);
  };

  // Search filter across category cards
  const filteredCategories = HELP_CATEGORIES.filter(cat => 
    cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex relative">
      
      {/* Toast popup */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[120] px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
        }`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-64 glass border-r border-slate-800/40 p-6 flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          <div className="mb-10 text-2xl font-bold text-gradient">FinTrack AI</div>
          <div className="flex items-center space-x-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-850 mb-6">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                {user.name ? user.name.substring(0, 2).toUpperCase() : 'ME'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0B0F19] rounded-full animate-pulse" title="Online Client"></span>
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {user.name || 'Meenakshi'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Premium Master Tier
              </div>
            </div>
          </div>
          <nav className="space-y-1">
            <Link to="/dashboard" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>📊</span><span>Dashboard</span>
            </Link>
            <Link to="/expenses" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>💸</span><span>Expenses</span>
            </Link>
            <Link to="/budgets" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>🎯</span><span>Budgets</span>
            </Link>
            <Link to="/analytics" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>📈</span><span>Analytics</span>
            </Link>
            <Link to="/ai-assistant" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>🤖</span><span>AI Assistant</span>
            </Link>
            <Link to="/reports" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>📋</span><span>Reports</span>
            </Link>
            <Link to="/subscriptions" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>🔁</span><span>Subscriptions</span>
            </Link>
            <Link to="/notifications" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>🔔</span><span>Notifications</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 text-slate-400 hover:text-white p-2.5 hover:bg-slate-850/40 rounded-xl transition-all">
              <span>⚙️</span><span>Settings</span>
            </Link>
            <a href="#" className="flex items-center space-x-3 text-indigo-400 font-medium p-2.5 bg-slate-850/50 rounded-xl mt-4">
              <span>❓</span><span>Help Center</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-red-400 hover:text-red-300 p-2.5 hover:bg-red-900/20 rounded-xl transition-all mt-6"
              onClick={e => { e.preventDefault(); handleLogout(); }}>
              <span>🚪</span><span>Logout</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto w-full">
        
        {/* Banner with refined search text */}
        <header className="mb-6 border-b border-slate-800/40 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              ❓ Help Center
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              Browse guides, troubleshoot issues, monitor system health, and get support instantly.
            </p>
          </div>
          
          {/* Quick back buttons */}
          <Link to="/dashboard" className="btn-gradient text-xs px-4 py-2 flex items-center gap-2 rounded-xl shadow-lg shrink-0">
            🏠 Dashboard
          </Link>
        </header>

        {/* 1. Search Bar */}
        <div className="max-w-xl mb-8 relative">
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-10 text-xs py-3 focus:ring-1 focus:ring-indigo-500"
          />
          <span className="absolute left-3.5 top-3 text-slate-500 text-xs">🔍</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 text-slate-400 hover:text-white text-xs">
              ×
            </button>
          )}
        </div>

        {/* 2.⚡ Quick Actions - Horizontal Cards Grid */}
        <section className="mb-8 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveSpecialTab('bug');
                setSelectedGuide(null);
              }}
              className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>🐞</span> Bug Ticket
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSpecialTab('support');
                setSelectedGuide(null);
              }}
              className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>📧</span> Ask Support
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSpecialTab('status');
                setSelectedGuide(null);
              }}
              className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>📡</span> Live Status
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSpecialTab('faqs');
                setSelectedGuide(null);
              }}
              className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>❔</span> Accordion FAQs
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSpecialTab('safety');
                setSelectedGuide(null);
              }}
              className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>🔐</span> Safety Tips
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSpecialTab('features');
                setSelectedGuide(null);
              }}
              className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 duration-200"
            >
              <span>💡</span> Suggestions
            </button>
          </div>
        </section>

        {/* 3. 🔥 Popular Articles */}
        <section className="mb-8 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🔥 Popular Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'ai', label: 'How AI detects overspending', desc: 'Detailed look at Gemini background anomalies checkups' },
              { id: 'analytics', label: 'Exporting monthly reports', desc: 'Guide to downloading clean CSV/PDF statements' },
              { id: 'trouble', label: 'Fixing bank sync issues', desc: 'Troubleshoot sandbox connectivity expired tokens' },
              { id: 'ai', label: 'Understanding financial scores', desc: 'How our assistant calculates balance quotients' }
            ].map((art, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const matched = HELP_CATEGORIES.find(c => c.id === art.id);
                  if (matched) handleOpenGuide(matched);
                }}
                className="p-4 bg-slate-900/30 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl text-left space-y-1 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="text-xs font-bold text-white hover:text-indigo-400 transition-colors">⚡ {art.label}</div>
                <div className="text-[10px] text-slate-400 leading-normal">{art.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 4. 📚 Help Categories Grid (2-Column Desktop Grid with Uniform min-h-[200px]) */}
        <section className="mb-8 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📚 Help Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(cat => (
                <div
                  key={cat.id}
                  className="p-5 bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl min-h-[200px] flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 duration-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                      <span className="bg-indigo-950 text-indigo-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/10">
                        {cat.meta.split('•')[0].trim()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-850/40 flex justify-between items-center mt-3">
                    <span className="text-[10px] text-slate-500">{cat.meta}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenGuide(cat)}
                      className="px-3.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/20 text-indigo-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Open Guide →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-slate-950/40 p-6 border border-slate-900 rounded-2xl text-center space-y-3">
                <div className="text-xs text-slate-400 italic">No matching categories found matching your keyword.</div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 5. 🕘 Recently Viewed */}
        <section className="mb-8 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">🕘 Recently Viewed</h3>
          <div className="flex flex-wrap gap-3">
            {recentViews.map(view => (
              <button
                key={view.id}
                type="button"
                onClick={() => {
                  const matched = HELP_CATEGORIES.find(c => c.id === view.id);
                  if (matched) handleOpenGuide(matched);
                }}
                className="px-4 py-2.5 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>{view.icon}</span>
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 6. 📄 Selected Guide Viewer Overlay Modal */}
        {selectedGuide && (
          <div className="fixed inset-0 z-[110] bg-[#07090e]/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-scale-in">
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="absolute right-4 top-4 text-slate-500 hover:text-white text-xl cursor-pointer"
              >
                ×
              </button>
              
              <div className="border-b border-slate-800/80 pb-4">
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedGuide.icon}</span>
                  <span>{selectedGuide.label}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedGuide.desc}</p>
                <div className="flex gap-2 mt-3">
                  <span className="bg-indigo-950 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded border border-indigo-500/10">Active</span>
                  <span className="bg-slate-900 text-slate-500 text-[8px] font-semibold px-2 py-0.5 rounded">{selectedGuide.meta}</span>
                </div>
              </div>

              {/* Spaced Guide Steps */}
              <div className="space-y-4 pt-1">
                {selectedGuide.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-900/20 p-3 rounded-xl border border-slate-850/60">
                    <span className="text-sm shrink-0">{step.num}</span>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">{step.title}</div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedGuide(null)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done Reading
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. Special Tab Viewer Panel (FAQs, Bug, support, Status, etc.) */}
        {activeSpecialTab && (
          <div className="fixed inset-0 z-[110] bg-[#07090e]/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-scale-in">
              <button
                type="button"
                onClick={() => {
                  setActiveSpecialTab(null);
                  setBugSuccess(false);
                }}
                className="absolute right-4 top-4 text-slate-500 hover:text-white text-xl cursor-pointer"
              >
                ×
              </button>

              {/* ACCORDION FAQS */}
              {activeSpecialTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">❔ Expandable FAQ Accordion</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Click questions to view resolution details</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { q: "❓ How does AI forecasting work?", a: "AI analyzes historical spending patterns and aggregates 14-day history to calculate a predictive linear model of your upcoming week's billing spikes." },
                      { q: "❓ Can I restore a deleted expense entry?", a: "Currently, expense entries deleted are wiped completely from our MongoDB records. Back up your settings daily in Settings to keep safe history logs." },
                      { q: "❓ Are my bank sync credentials safe?", a: "Yes, we integrate secure sandbox bank links powered by Plaid, securing credential storage through industry-grade SSL encryption." }
                    ].map((faq, idx) => (
                      <div key={idx} className="bg-slate-900/40 border border-slate-850 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="w-full p-4 text-left font-bold text-xs text-white flex justify-between items-center cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <span className="text-[10px] text-slate-500">{expandedFaq === idx ? '▲' : '▼'}</span>
                        </button>
                        {expandedFaq === idx && (
                          <div className="px-4 pb-4 text-[10px] text-slate-400 leading-normal border-t border-slate-850/60 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REPORT BUG */}
              {activeSpecialTab === 'bug' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">🐞 Report a Bug</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Submit bug reports directly to our engineers</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Avg Resolution: <span className="text-indigo-400 font-bold">4–6 Hours</span>
                    </div>
                  </div>

                  {bugSuccess ? (
                    <div className="bg-emerald-950/30 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-2">
                      <div className="text-2xl">🎉</div>
                      <div className="text-xs font-bold text-emerald-400">Bug Ticket Submitted Successfully!</div>
                      <p className="text-[10px] text-slate-400">DevOps engineers are assessing the issue. We will email updates to you within 4–6 hours.</p>
                      <button
                        type="button"
                        onClick={() => setBugSuccess(false)}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Submit Another Bug Report
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitBug} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-semibold">Issue Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Receipt scan failing on low light receipts"
                          className="w-full glass-input text-xs py-2"
                          value={bugTitle}
                          onChange={e => setBugTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold">Severity Priority</label>
                          <select
                            className="w-full glass-input text-xs py-2 focus:ring-1 focus:ring-indigo-500"
                            value={bugPriority}
                            onChange={e => setBugPriority(e.target.value)}
                          >
                            <option value="Low">Low - Cosmetic</option>
                            <option value="Medium">Medium - Feature Bug</option>
                            <option value="High">High - Application Crash</option>
                            <option value="Critical">🔴 Critical - Blocking Payments</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase font-semibold">Attach Screenshot</label>
                          <div className="w-full p-2 bg-slate-900/30 border border-slate-800 text-center text-[10px] text-slate-400 rounded-xl cursor-pointer hover:border-slate-700">
                            📸 mock_receipt_error.png
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-semibold">Description of Failure</label>
                        <textarea
                          required
                          rows="3"
                          placeholder="Detail step-by-step failures or console logs..."
                          className="w-full glass-input text-xs p-2.5"
                          value={bugDesc}
                          onChange={e => setBugDesc(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="w-full btn-gradient py-2 rounded-xl text-xs font-bold shadow-lg cursor-pointer">
                        Submit Bug Report
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* CONTACT SUPPORT */}
              {activeSpecialTab === 'support' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">📧 Help Desk Support Channels</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Submit help requests to our operations desk</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-2xl text-center space-y-2">
                      <span className="text-2xl">💬</span>
                      <div className="text-xs font-bold text-white">Interactive Live Chat</div>
                      <span className="bg-emerald-950 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block">Online</span>
                      <p className="text-[9px] text-slate-400 leading-normal mt-1 font-medium">Talk to live operators immediately inside the client.</p>
                    </div>

                    <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-2xl text-center space-y-2">
                      <span className="text-2xl">📧</span>
                      <div className="text-xs font-bold text-white">Email Help Desk</div>
                      <span className="bg-indigo-950 text-indigo-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block">Response &lt; 2h</span>
                      <p className="text-[9px] text-slate-400 leading-normal mt-1 font-medium">Submit statement queries to support@fintrack.ai.</p>
                    </div>

                    <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-2xl text-center space-y-2">
                      <span className="text-2xl">📞</span>
                      <div className="text-xs font-bold text-white">Phone Support</div>
                      <span className="bg-purple-950 text-purple-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block">Mon-Fri Priority</span>
                      <p className="text-[9px] text-slate-400 leading-normal mt-1 font-medium">Dedicated helpline lines for Premium account owners.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SYSTEM STATUS */}
              {activeSpecialTab === 'status' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">📡 Real-Time System Status</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Monitor current health metrics and platform microservices</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "🤖 AI Engine Operational", status: "Operational", color: "bg-emerald-500", sub: "Gemini 1.5 API responses at 142ms latency" },
                      { name: "☁️ Database & Cloud Sync Running", status: "Operational", color: "bg-emerald-500", sub: "MongoDB Atlas cluster online, sync healthy" },
                      { name: "⚠️ Delayed Bank Sync", status: "Degraded", color: "bg-amber-500", sub: "Plaid sandbox transactions currently experiencing lag" }
                    ].map((srv, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${srv.color} animate-pulse`}></span>
                            <span>{srv.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-500">{srv.sub}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wide border uppercase ${
                          srv.status === 'Operational' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                        }`}>
                          {srv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRIVACY & SAFETY */}
              {activeSpecialTab === 'safety' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">🔐 Privacy & Shielding Guidelines</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Secure banking credentials and private transactional safety tips</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      { title: "Never Disclose Verification OTPs", desc: "No executive or engineer at FinTrack will ever request your verification pins or transaction authentication OTPs." },
                      { title: "Avoid Auditing on Public Wi-Fi", desc: "Always route banking synchronization checks over cellular connections or encrypted VPN paths." },
                      { title: "Verify Autopay Webhooks Carefully", desc: "Configure billing notification warnings prior to active subscription renewals to keep control of automated deductions." }
                    ].map((tip, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                        <div className="font-bold text-white flex items-center gap-2">🛡️ {tip.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1 pl-6 leading-normal font-medium">{tip.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FEATURE REQUESTS */}
              {activeSpecialTab === 'features' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-bold text-white">💡 Suggest & Vote Features</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Upvote requests or submit new features to our roadmap</p>
                  </div>

                  <div className="space-y-3">
                    {reqVotes.map(item => (
                      <div key={item.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <span className="text-[9px] text-slate-500">{item.votes} upvotes from community</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVote(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            item.userVoted 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-750'
                          }`}
                        >
                          ▲ Upvote
                        </button>
                      </div>
                    ))}

                    <form onSubmit={handleAddFeatureRequest} className="pt-2 flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Integrate automatic Splitwise bill shares..."
                        className="flex-1 glass-input text-xs py-2.5"
                        value={reqTitle}
                        onChange={e => setReqTitle(e.target.value)}
                      />
                      <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer">
                        Post Idea
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSpecialTab(null);
                    setBugSuccess(false);
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 13. "STILL NEED HELP?" FOOTER BANNER */}
        <footer className="mt-12 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <div className="text-xs font-bold text-white">Still need help?</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Talk directly to our operations engineers or support coaches</div>
          </div>
          <div className="flex gap-2">
            <a href="mailto:support@fintrack.ai" className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-white rounded-lg flex items-center gap-1.5 transition-colors">
              📧 support@fintrack.ai
            </a>
            <button type="button" onClick={() => setShowAiDrawer(true)} className="px-3.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/20 text-[10px] font-bold text-indigo-400 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
              💬 Start Live Chat
            </button>
          </div>
        </footer>

      </div>

      {/* 8. AI SUPPORT CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        
        {/* Help Assistant Drawer overlay */}
        {showAiDrawer && (
          <div className="w-80 md:w-96 bg-slate-900/95 border border-slate-800/90 rounded-2xl shadow-2xl flex flex-col h-[420px] mb-3 relative overflow-hidden animate-fade-in animate-slide-up">
            
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-xs text-white">💬 Ask Support AI</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAiDrawer(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Messages box */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/20 text-xs">
              {aiMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/30'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-850 p-2.5 rounded-xl rounded-tl-none flex items-center space-x-1 border border-slate-800">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Predetermined queries including user requested */}
            <div className="p-2 border-t border-slate-800/40 bg-slate-900/40 flex gap-1.5 overflow-x-auto whitespace-nowrap shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => triggerAiQuickHelp("Why are my reports missing?")}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-750 text-[9px] text-slate-300 cursor-pointer font-medium"
              >
                💡 Missing reports?
              </button>
              <button
                type="button"
                onClick={() => triggerAiQuickHelp("How does recurring billing work?")}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-750 text-[9px] text-slate-300 cursor-pointer font-medium"
              >
                🔁 Recurring billing?
              </button>
              <button
                type="button"
                onClick={() => triggerAiQuickHelp("Why is my bank sync delayed?")}
                className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-750 text-[9px] text-slate-300 cursor-pointer font-medium"
              >
                📡 Sync error?
              </button>
            </div>

            {/* Input field */}
            <form onSubmit={handleAiHelpSubmit} className="p-3 bg-slate-950/40 border-t border-slate-800 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask Support AI a question..."
                className="flex-1 glass-input text-xs py-1.5"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
              />
              <button
                id="ai-help-submit-btn"
                type="submit"
                className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Floating trigger widget button */}
        <button
          type="button"
          onClick={() => setShowAiDrawer(!showAiDrawer)}
          className="flex items-center space-x-2 px-4.5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-indigo-400/20"
        >
          <span>💬</span>
          <span>Ask Support AI</span>
        </button>

      </div>

    </div>
  );
};

export default HelpCenter;
