// ─── CATEGORY COLORS & EMOJIS ───
const CAT_EMOJI = {
    Food: '🍔', Transport: '🚌', School: '📚',
    Entertainment: '🎮', Health: '💊', Shopping: '🛍️', Others: '📦'
};

const CAT_COLORS = {
    Food: '#4ade80', Transport: '#60a5fa', School: '#f472b6',
    Entertainment: '#a78bfa', Health: '#fb923c', Shopping: '#fbbf24', Others: '#94a3b8'
};

// ─── CURRENT USER ───
let currentUser = null;

function getUsers() {
    return JSON.parse(localStorage.getItem('spendwise_users') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('spendwise_users', JSON.stringify(users));
}

function getCurrentData() {
    const users = getUsers();
    return users[currentUser] || { expenses: [], budget: 5000, name: currentUser };
}

function saveCurrentData(data) {
    const users = getUsers();
    users[currentUser] = data;
    saveUsers(users);
}


// ══ SIDEBAR CONTROLS ══

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle  = document.getElementById('sidebar-toggle');

    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        toggle.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle  = document.getElementById('sidebar-toggle');

    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
});


// ══ AUTH FUNCTIONS ══

function showTab(tab) {
    document.getElementById('login-form').style.display    = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const remember = document.getElementById('rememberMe').checked;
    const errEl    = document.getElementById('login-error');

    if (!username || !password) {
        errEl.textContent = 'Please fill in all fields.';
        showAuthModal('⚠️', 'Missing Fields', 'Please fill in both username and password.', 'warning');
        return;
    }

    const users = getUsers();

    if (!users[username]) {
        errEl.textContent = 'Username not found.';
        showAuthModal('❌', 'Login Failed', 'Username not found. Please check your username or register a new account.', 'error');
        return;
    }

    if (users[username].password !== password) {
        errEl.textContent = 'Wrong password.';
        showAuthModal('🔒', 'Wrong Password', 'The password you entered is incorrect. Please try again.', 'error');
        return;
    }

    errEl.textContent = '';
    currentUser = username;

    if (remember) {
        localStorage.setItem('spendwise_remember', username);
    } else {
        localStorage.removeItem('spendwise_remember');
    }

    const displayName = users[username].name.split(' ')[0];
    showAuthModal('✅', 'Welcome Back!', `Good to see you again, ${displayName}! Redirecting to your dashboard...`, 'success', () => {
        startApp();
    });
}

function register() {
    const name     = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const budget   = parseFloat(document.getElementById('reg-budget').value) || 5000;
    const password = document.getElementById('reg-password').value.trim();
    const errEl    = document.getElementById('reg-error');

    if (!name || !username || !password) {
        errEl.textContent = 'Please fill in all fields.';
        showAuthModal('⚠️', 'Missing Fields', 'Please fill in all required fields before registering.', 'warning');
        return;
    }
    if (password.length < 4) {
        errEl.textContent = 'Password must be at least 4 characters.';
        showAuthModal('⚠️', 'Weak Password', 'Your password must be at least 4 characters long.', 'warning');
        return;
    }

    const users = getUsers();
    if (users[username]) {
        errEl.textContent = 'Username already taken.';
        showAuthModal('❌', 'Username Taken', `"${username}" is already in use. Please choose a different username.`, 'error');
        return;
    }

    users[username] = { name, password, budget, expenses: [] };
    saveUsers(users);

    errEl.textContent = '';
    currentUser = username;

    showAuthModal('🎉', 'Account Created!', `Welcome to SpendWise, ${name.split(' ')[0]}! Your account is ready. Let's start tracking!`, 'success', () => {
        startApp();
    });
}

function logout() {
    const data        = getCurrentData();
    const displayName = data.name.split(' ')[0];

    showAuthModal('👋', 'Logged Out', `See you later, ${displayName}! Your data has been saved.`, 'success', () => {
        currentUser = null;
        localStorage.removeItem('spendwise_remember');

        document.getElementById('app').style.display        = 'none';
        document.getElementById('auth-screen').style.display = 'flex';

        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('rememberMe').checked   = false;

        showTab('login');
    });
}


// ─── AUTH MODAL ───
function showAuthModal(icon, title, msg, type = 'success', onClose = null) {
    const existing = document.getElementById('auth-modal-overlay');
    if (existing) existing.remove();

    const colorMap    = { success: '#4ade80', error: '#f87171', warning: '#fbbf24' };
    const accentColor = colorMap[type] || '#4ade80';

    const overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.7);
        display:flex;align-items:center;justify-content:center;
        z-index:9999;backdrop-filter:blur(6px);
        animation:authModalFadeIn 0.2s ease;
    `;

    overlay.innerHTML = `
        <style>
            @keyframes authModalFadeIn{from{opacity:0}to{opacity:1}}
            @keyframes authModalSlideUp{
                from{opacity:0;transform:translateY(24px) scale(0.97)}
                to{opacity:1;transform:translateY(0) scale(1)}
            }
            #auth-modal-box{
                background:#161922;border:1px solid #272b3d;
                border-top:3px solid ${accentColor};border-radius:20px;
                padding:40px 32px 32px;text-align:center;
                max-width:360px;width:90%;
                animation:authModalSlideUp 0.3s ease;
                box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px ${accentColor}18;
            }
            #auth-modal-icon{font-size:52px;margin-bottom:16px;display:block;}
            #auth-modal-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#e8eaf2;margin-bottom:10px;}
            #auth-modal-msg{color:#7b80a0;font-size:14px;line-height:1.6;margin-bottom:28px;}
            #auth-modal-btn{
                background:${accentColor};color:#0f1117;border:none;
                border-radius:10px;padding:13px 32px;font-size:15px;
                font-weight:700;cursor:pointer;font-family:inherit;
                transition:opacity 0.15s,transform 0.15s;width:100%;
            }
            #auth-modal-btn:hover{opacity:0.88;transform:translateY(-1px);}
        </style>
        <div id="auth-modal-box">
            <span id="auth-modal-icon">${icon}</span>
            <div id="auth-modal-title">${title}</div>
            <p id="auth-modal-msg">${msg}</p>
            <button id="auth-modal-btn">Got it!</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
        overlay.style.opacity    = '0';
        overlay.style.transition = 'opacity 0.2s';
        setTimeout(() => { overlay.remove(); if (typeof onClose === 'function') onClose(); }, 200);
    };

    overlay.querySelector('#auth-modal-btn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}


// ══ APP STARTUP ══

function startApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display         = 'flex';

    const data        = getCurrentData();
    const initial     = data.name.charAt(0).toUpperCase();
    const displayName = data.name.split(' ')[0];

    document.getElementById('user-avatar').textContent       = initial;
    document.getElementById('user-name-display').textContent = displayName;
    document.getElementById('sidebar-avatar').textContent    = initial;
    document.getElementById('sidebar-name').textContent      = data.name;

    const hour  = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    document.getElementById('greeting').textContent = `${greet}, ${displayName}! 👋`;

    document.getElementById('header-date').textContent = new Date().toLocaleDateString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    document.getElementById('exp-date').value = new Date().toISOString().split('T')[0];

    showPage('dashboard');
}


// ══ NAVIGATION ══

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('page-' + page).classList.add('active-page');
    const navEl = document.getElementById('nav-' + page);
    if (navEl) navEl.classList.add('active');

    if (page === 'dashboard') renderDashboard();
    if (page === 'recent')    renderRecent();
    if (page === 'budget')    renderBudget();
    if (page === 'analytics') renderAnalytics();
}


// ══ ADD EXPENSE ══

function addExpense() {
    const desc     = document.getElementById('exp-desc').value.trim();
    const amount   = parseFloat(document.getElementById('exp-amount').value);
    const category = document.getElementById('exp-category').value;
    const date     = document.getElementById('exp-date').value;
    const note     = document.getElementById('exp-note').value.trim();

    if (!desc)               { showModal('⚠️', 'Missing Field',   'Please enter a description.');    return; }
    if (!amount || amount<=0){ showModal('⚠️', 'Invalid Amount',  'Please enter a valid amount.');    return; }
    if (!date)               { showModal('⚠️', 'Missing Field',   'Please select a date.');           return; }

    const data       = getCurrentData();
    const totalSpent = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const newTotal   = totalSpent + amount;

    if (newTotal > data.budget) {
        const overAmount = newTotal - data.budget;
        showModal('🚨', 'Budget Exceeded!',
            `You are going over your budget by ₱${overAmount.toLocaleString('en-PH')}.\n\n` +
            `Budget: ₱${data.budget.toLocaleString('en-PH')}\n` +
            `Current Spent: ₱${totalSpent.toLocaleString('en-PH')}\n\n` +
            `Suggestion: Paniwang napod dili kay sigig kaon.`
        );
        return;
    }

    if (newTotal >= data.budget * 0.9) {
        showModal('⚠️', 'Almost at Budget Limit',
            `You are at ${((newTotal / data.budget) * 100).toFixed(1)}% of your budget.\n\nBe careful with your spending.`
        );
    }

    data.expenses.unshift({ id: Date.now(), desc, amount, category, date, note });
    saveCurrentData(data);

    document.getElementById('exp-desc').value   = '';
    document.getElementById('exp-amount').value = '';
    document.getElementById('exp-note').value   = '';
    document.getElementById('exp-date').value   = new Date().toISOString().split('T')[0];

    showModal('✅', 'Expense Saved!', `₱${Math.round(amount)} has been recorded.`);
}


// ══ DASHBOARD ══

function renderDashboard() {
    const data       = getCurrentData();
    const totalSpent = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining  = data.budget - totalSpent;
    const pct        = Math.min((totalSpent / data.budget) * 100, 100).toFixed(1);

    document.getElementById('dash-budget').textContent    = '₱' + data.budget.toLocaleString();
    document.getElementById('dash-spent').textContent     = '₱' + totalSpent.toFixed(2);
    document.getElementById('dash-remaining').textContent = '₱' + remaining.toFixed(2);
    document.getElementById('dash-count').textContent     = data.expenses.length;

    const bar = document.getElementById('budget-bar');
    bar.style.width = pct + '%';
    bar.className   = 'progress-bar' + (pct >= 80 ? ' danger' : '');

    document.getElementById('progress-spent-label').textContent = `₱${totalSpent.toFixed(2)} spent`;
    document.getElementById('progress-pct-label').textContent   = pct + '%';

    const catTotals = getCategoryTotals(data.expenses);
    const breakdown = document.getElementById('category-breakdown');
    breakdown.innerHTML = '';

    if (Object.keys(catTotals).length === 0) {
        breakdown.innerHTML = '<p style="color:var(--text2);font-size:14px;">No expenses yet. Start adding!</p>';
        return;
    }

    const maxVal = Math.max(...Object.values(catTotals));
    Object.entries(catTotals).sort((a, b) => b[1] - a[1]).forEach(([cat, val]) => {
        const pctCat = ((val / maxVal) * 100).toFixed(1);
        const row    = document.createElement('div');
        row.className = 'cat-row';
        row.innerHTML = `
            <div class="cat-label">${CAT_EMOJI[cat] || '📦'} ${cat}</div>
            <div class="cat-bar-wrap">
                <div class="cat-bar" style="width:${pctCat}%;background:${CAT_COLORS[cat]};"></div>
            </div>
            <div class="cat-amount">₱${val.toFixed(2)}</div>
        `;
        breakdown.appendChild(row);
    });
}


// ══ RECENT EXPENSES ══

function renderRecent() {
    const data      = getCurrentData();
    const filterCat = document.getElementById('filter-category').value;
    const listEl    = document.getElementById('recent-list');
    listEl.innerHTML = '';

    let filtered = data.expenses;
    if (filterCat !== 'All') filtered = data.expenses.filter(e => e.category === filterCat);

    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🫙</div>
                <p>No expenses found.</p>
            </div>`;
        return;
    }

    filtered.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="exp-emoji">${CAT_EMOJI[expense.category] || '📦'}</div>
            <div class="exp-info">
                <div class="exp-desc">${expense.desc}</div>
                <div class="exp-meta">${expense.date}${expense.note ? ' · ' + expense.note : ''}</div>
            </div>
            <div class="exp-cat-badge">${expense.category}</div>
            <div class="exp-amount">-₱${expense.amount.toFixed(2)}</div>
            <button class="exp-delete" title="Delete" onclick="confirmDelete(${expense.id})">🗑️</button>
        `;
        listEl.appendChild(item);
    });
}

let pendingDeleteId = null;

function confirmDelete(id) {
    pendingDeleteId = id;
    document.getElementById('delete-overlay').style.display = 'flex';
    document.getElementById('confirm-delete-btn').onclick   = () => deleteExpense(pendingDeleteId);
}

function closeDeleteModal() {
    document.getElementById('delete-overlay').style.display = 'none';
    pendingDeleteId = null;
}

function deleteExpense(id) {
    const data = getCurrentData();
    data.expenses = data.expenses.filter(e => e.id !== id);
    saveCurrentData(data);
    closeDeleteModal();
    renderRecent();
    showModal('🗑️', 'Deleted!', 'The expense has been removed.');
}


// ══ BUDGET GOALS ══

function renderBudget() {
    const data = getCurrentData();
    document.getElementById('new-budget').value = data.budget;

    const catTotals = getCategoryTotals(data.expenses);
    const goalsEl   = document.getElementById('goals-list');
    goalsEl.innerHTML = '';

    ['Food', 'Transport', 'School', 'Entertainment', 'Health', 'Shopping', 'Others'].forEach(cat => {
        const spent        = catTotals[cat] || 0;
        const suggestLimit = data.budget * 0.2;
        const pct          = Math.min((spent / suggestLimit) * 100, 100).toFixed(0);

        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `
            <div class="goal-emoji">${CAT_EMOJI[cat]}</div>
            <div class="goal-label">${cat}</div>
            <div class="goal-amount" style="color:${CAT_COLORS[cat]}">₱${spent.toFixed(2)}</div>
            <div class="progress-bar-wrap" style="margin-bottom:6px;">
                <div class="progress-bar" style="width:${pct}%;background:${CAT_COLORS[cat]};"></div>
            </div>
            <div style="font-size:12px;color:var(--text2);">${pct}% of suggested limit</div>
        `;
        goalsEl.appendChild(card);
    });
}

function updateBudget() {
    const val = parseFloat(document.getElementById('new-budget').value);
    if (!val || val <= 0) { showModal('⚠️', 'Invalid Budget', 'Please enter a valid budget amount.'); return; }
    const data = getCurrentData();
    data.budget = val;
    saveCurrentData(data);
    showModal('🎯', 'Budget Updated!', `Your monthly budget is now set to ₱${val.toLocaleString()}.`);
}


// ══ ANALYTICS ══

function renderAnalytics() {
    const data      = getCurrentData();
    const expenses  = data.expenses;
    const catTotals = getCategoryTotals(expenses);

    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('top-category').textContent = topCat
        ? `${CAT_EMOJI[topCat[0]]} ${topCat[0]} (₱${topCat[1].toFixed(2)})` : 'No data yet';

    const uniqueDays = [...new Set(expenses.map(e => e.date))].length || 1;
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    document.getElementById('avg-daily').textContent = `₱${(totalSpent / uniqueDays).toFixed(2)}`;

    const biggest = expenses.reduce((max, e) => e.amount > (max?.amount || 0) ? e : max, null);
    document.getElementById('biggest-expense').textContent = biggest
        ? `₱${biggest.amount.toFixed(2)} – ${biggest.desc}` : 'No data yet';

    const pct    = ((totalSpent / data.budget) * 100).toFixed(1);
    const riskEl = document.getElementById('budget-risk');
    riskEl.textContent  = `${pct}%`;
    riskEl.style.color  = pct >= 80 ? 'var(--danger)' : pct >= 50 ? 'var(--accent4)' : 'var(--accent)';

    const chartEl = document.getElementById('bar-chart');
    chartEl.innerHTML = '';

    if (Object.keys(catTotals).length === 0) {
        chartEl.innerHTML = '<p style="color:var(--text2);font-size:14px;">No data to display.</p>';
        return;
    }

    const maxVal = Math.max(...Object.values(catTotals));
    Object.entries(catTotals).sort((a, b) => b[1] - a[1]).forEach(([cat, val]) => {
        const pctBar = ((val / maxVal) * 100).toFixed(1);
        const row    = document.createElement('div');
        row.className = 'chart-row';
        row.innerHTML = `
            <div class="chart-label">${CAT_EMOJI[cat]} ${cat}</div>
            <div class="chart-bar-outer">
                <div class="chart-bar-inner" style="width:${pctBar}%;background:${CAT_COLORS[cat]};">${pctBar}%</div>
            </div>
            <div class="chart-val">₱${val.toFixed(2)}</div>
        `;
        chartEl.appendChild(row);
    });
}


// ══ MODAL ══

function showModal(icon, title, msg) {
    document.getElementById('modal-icon').textContent       = icon;
    document.getElementById('modal-title').textContent      = title;
    document.getElementById('modal-msg').textContent        = msg;
    document.getElementById('modal-overlay').style.display  = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}


// ══ UTILITIES ══

function getCategoryTotals(expenses) {
    const totals = {};
    expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return totals;
}

document.addEventListener('DOMContentLoaded', () => {
    const rememberedUser = localStorage.getItem('spendwise_remember');
    if (rememberedUser) {
        const users = getUsers();
        if (users[rememberedUser]) {
            currentUser = rememberedUser;
            startApp();
        } else {
            localStorage.removeItem('spendwise_remember');
        }
    }
});