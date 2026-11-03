import { useEffect, useMemo, useState } from 'react'
import {
  Wallet, LayoutDashboard, PiggyBank, Receipt, ChartNoAxesCombined,
  Users, Settings, LogOut, Plus, Trash2, Menu, X, ArrowUpRight,
  ArrowDownRight, IndianRupee, CalendarDays, ShieldCheck, UserRound,
  CircleHelp, TrendingUp, Target, CreditCard, Download
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const DB_KEY = 'budgetPlannerDB_v1'
const SESSION_KEY = 'budgetPlannerSession_v1'
const ADMIN = { email: 'admin@budgetplanner.com', password: 'Admin@123', name: 'Administrator', role: 'admin' }
const COLORS = ['#6d5dfc', '#18a999', '#f4a340', '#ef6b73', '#4299e1', '#a78bfa', '#e879c5']

const readDB = () => {
  try {
    const value = JSON.parse(localStorage.getItem(DB_KEY))
    if (value && Array.isArray(value.users)) return value
  } catch {}
  return { users: [], budgets: {}, transactions: {} }
}
const writeDB = db => localStorage.setItem(DB_KEY, JSON.stringify(db))
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0)
const today = () => new Date().toISOString().slice(0, 10)
const monthKey = () => today().slice(0, 7)
const categories = ['Food', 'Rent', 'Transport', 'Education', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other']

function App() {
  const [db, setDb] = useState(readDB)
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [page, setPage] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => writeDB(db), [db])
  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  }, [session])

  const logout = () => { setSession(null); setPage('overview'); setMobileOpen(false) }

  const login = (email, password) => {
    if (email.toLowerCase() === ADMIN.email && password === ADMIN.password) {
      setSession({ email: ADMIN.email, name: ADMIN.name, role: 'admin' }); setAuthError(''); return
    }
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!user) { setAuthError('Incorrect email or password. Please try again.'); return }
    setSession({ email: user.email, name: user.name, role: 'user' }); setAuthError('')
  }

  const signup = (name, email, password) => {
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setAuthError('An account with this email already exists.'); return
    }
    if (email.toLowerCase() === ADMIN.email) { setAuthError('This email is reserved for the administrator.'); return }
    const user = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), name, email, password, createdAt: today() }
    setDb(old => ({ ...old, users: [...old.users, user], budgets: { ...old.budgets, [email]: { income: 0, plans: {} } }, transactions: { ...old.transactions, [email]: [] } }))
    setSession({ email, name, role: 'user' }); setAuthError('')
  }

  if (!session) return <AuthScreen mode={authMode} setMode={m => { setAuthMode(m); setAuthError('') }} onLogin={login} onSignup={signup} error={authError} />
  if (session.role === 'admin') return <AdminApp db={db} onLogout={logout} />
  return <UserApp db={db} setDb={setDb} session={session} page={page} setPage={setPage} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
}

function AuthScreen({ mode, setMode, onLogin, onSignup, error }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const submit = e => {
    e.preventDefault()
    if (mode === 'signup') {
      if (name.trim().length < 2) return
      if (password.length < 6) return
      onSignup(name.trim(), email.trim(), password)
    } else onLogin(email.trim(), password)
  }
  return <main className="auth-shell">
    <section className="auth-visual">
      <div className="brand brand-light"><span className="brand-mark"><Wallet size={22}/></span><span>pocket<span className="brand-accent">wise</span></span></div>
      <div className="visual-copy">
        <span className="eyebrow">YOUR MONEY, IN FOCUS</span>
        <h1>Make every rupee<br/>work smarter.</h1>
        <p>Plan your monthly budget, track spending and build better money habits — all in one place.</p>
        <div className="visual-stats"><div><strong>Plan</strong><span>Set clear budgets</span></div><div><strong>Track</strong><span>Know every expense</span></div><div><strong>Save</strong><span>Reach your goals</span></div></div>
      </div>
      <div className="visual-orb orb-one"/><div className="visual-orb orb-two"/>
    </section>
    <section className="auth-panel">
      <form className="auth-card" onSubmit={submit}>
        <div className="mobile-brand brand"><span className="brand-mark"><Wallet size={21}/></span><span>pocket<span className="brand-accent">wise</span></span></div>
        <span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span>
        <h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
        <p className="muted">{mode === 'login' ? 'Enter your details to continue to your dashboard.' : 'Create an account to start planning your budget.'}</p>
        {mode === 'signup' && <label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required minLength="2"/></label>}
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='signup'?'At least 6 characters':'Enter your password'} required minLength={mode==='signup'?6:1}/></label>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn btn-primary btn-full" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17}/></button>
        <p className="switch-auth">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button type="button" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Sign up':'Sign in'}</button></p>
        <div className="demo-note"><ShieldCheck size={16}/><span>Admin demo: <b>admin@budgetplanner.com</b> / <b>Admin@123</b></span></div>
        <p className="tiny muted">Demo project only. Do not enter real financial or sensitive information.</p>
      </form>
    </section>
  </main>
}

function Sidebar({ active, setActive, onLogout, role='user', mobileOpen, setMobileOpen }) {
  const userItems = [
    { id:'overview', label:'Overview', icon:LayoutDashboard },
    { id:'budget', label:'Budget planner', icon:PiggyBank },
    { id:'transactions', label:'Transactions', icon:Receipt },
    { id:'reports', label:'Reports & insights', icon:ChartNoAxesCombined }
  ]
  const adminItems = [
    { id:'admin-overview', label:'Overview', icon:LayoutDashboard },
    { id:'admin-users', label:'Registered users', icon:Users },
    { id:'admin-finances', label:'Budget monitoring', icon:IndianRupee }
  ]
  const items = role === 'admin' ? adminItems : userItems
  return <>
    {mobileOpen && <div className="mobile-overlay" onClick={()=>setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen?'sidebar-open':''}`}>
      <div className="sidebar-brand"><span className="brand-mark"><Wallet size={21}/></span><span>pocket<span className="brand-accent">wise</span></span><button className="icon-btn mobile-close" onClick={()=>setMobileOpen(false)}><X size={19}/></button></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{items.map(item=><button key={item.id} className={`nav-item ${active===item.id?'nav-active':''}`} onClick={()=>{setActive(item.id);setMobileOpen(false)}}><item.icon size={18}/><span>{item.label}</span>{active===item.id&&<span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><CircleHelp size={18}/><b>Need a hand?</b><span>Keep your budget up to date for clearer insights.</span></div>
        <button className="nav-item logout-item" onClick={onLogout}><LogOut size={18}/><span>Log out</span></button>
        <div className="sidebar-foot">POCKETWISE · BUDGET PLANNER</div>
      </div>
    </aside>
  </>
}

function Header({ title, subtitle, session, onMenu }) {
  return <header className="topbar"><div className="topbar-title"><button className="icon-btn menu-btn" onClick={onMenu}><Menu size={21}/></button><div><h1>{title}</h1><p>{subtitle}</p></div></div><div className="topbar-user"><div className="avatar">{(session.name||'U').slice(0,1).toUpperCase()}</div><div className="user-meta"><b>{session.name}</b><span>{session.role==='admin'?'Administrator':'Personal account'}</span></div></div></header>
}

function UserApp({ db, setDb, session, page, setPage, onLogout, mobileOpen, setMobileOpen }) {
  const email = session.email
  const budget = db.budgets[email] || { income:0, plans:{} }
  const transactions = db.transactions[email] || []
  const currentTx = transactions.filter(t=>t.date?.startsWith(monthKey()))
  const expenses = currentTx.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
  const incomeTx = currentTx.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
  const income = Number(budget.income||0) + incomeTx
  const planned = Object.values(budget.plans||{}).reduce((s,v)=>s+Number(v||0),0)
  const remaining = income - expenses
  const savings = Math.max(remaining,0)
  const updateBudget = patch => setDb(old=>({...old,budgets:{...old.budgets,[email]:{...(old.budgets[email]||{income:0,plans:{}}),...patch}}}))
  const addTransaction = tx => setDb(old=>({...old,transactions:{...old.transactions,[email]:[tx,...(old.transactions[email]||[])]}}))
  const removeTransaction = id => setDb(old=>({...old,transactions:{...old.transactions,[email]:(old.transactions[email]||[]).filter(t=>t.id!==id)}}))
  const titleMap = {overview:'Overview',budget:'Budget planner',transactions:'Transactions','reports':'Reports & insights'}
  const subtitleMap = {overview:'Here’s your financial snapshot for this month.',budget:'Give every rupee a plan.',transactions:'Keep track of money coming in and going out.',reports:'Understand your spending patterns.'}
  return <div className="app-shell">
    <Sidebar active={page} setActive={setPage} onLogout={onLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
    <main className="main-area"><Header title={titleMap[page]} subtitle={subtitleMap[page]} session={session} onMenu={()=>setMobileOpen(true)}/>
      <div className="page-content">
        {page==='overview'&&<Overview budget={budget} income={income} expenses={expenses} planned={planned} remaining={remaining} savings={savings} transactions={currentTx} setPage={setPage}/>}
        {page==='budget'&&<BudgetPage budget={budget} expenses={expenses} updateBudget={updateBudget} transactions={currentTx}/>}
        {page==='transactions'&&<TransactionsPage transactions={transactions} addTransaction={addTransaction} removeTransaction={removeTransaction}/>}
        {page==='reports'&&<ReportsPage transactions={transactions} income={income} expenses={expenses} budget={budget}/>}
      </div>
      <footer className="app-footer">Pocketwise Budget Planner <span>·</span> Your data stays in this browser</footer>
    </main>
  </div>
}

function StatCard({ label, value, note, icon:Icon, tone='purple', trend }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={18}/></span></div><strong>{money(value)}</strong><div className="stat-note">{trend && <span className={trend==='up'?'positive':'negative'}>{trend==='up'?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}</span>}{note}</div></div>
}

function Overview({ budget, income, expenses, planned, remaining, savings, transactions, setPage }) {
  const spentByCategory = categories.map(name=>({name,value:transactions.filter(t=>t.type==='expense'&&t.category===name).reduce((s,t)=>s+Number(t.amount),0)})).filter(x=>x.value>0)
  const recent = transactions.slice(0,5)
  const pct = income>0?Math.min(100,Math.round(expenses/income*100)):0
  return <>
    <div className="welcome-row"><div><span className="eyebrow">MONTHLY SUMMARY</span><h2>Your money at a glance<span className="wave">✦</span></h2><p className="muted">A little clarity today can make a big difference tomorrow.</p></div><button className="btn btn-primary" onClick={()=>setPage('transactions')}><Plus size={17}/> Add transaction</button></div>
    <div className="stats-grid">
      <StatCard label="Total income" value={income} note="This month" icon={TrendingUp} tone="green" trend="up"/>
      <StatCard label="Total expenses" value={expenses} note="This month" icon={CreditCard} tone="orange" trend="down"/>
      <StatCard label="Remaining balance" value={remaining} note="Income minus expenses" icon={Wallet} tone="purple"/>
      <StatCard label="Available savings" value={savings} note="Potential savings this month" icon={PiggyBank} tone="blue"/>
    </div>
    <div className="content-grid">
      <section className="panel spending-panel"><div className="panel-heading"><div><h3>Spending overview</h3><p className="muted">Expenses compared with your income</p></div><span className="period-chip"><CalendarDays size={14}/> This month</span></div>
        <div className="spend-summary"><div><strong>{pct}%</strong><span>of income spent</span></div><div className="progress-wrap"><div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`}}/></div><div className="progress-labels"><span>{money(expenses)} spent</span><span>{money(income)} income</span></div></div></div>
        <div className="mini-divider"/>
        <div className="budget-mini"><div><span className="mini-dot purple-dot"/><span>Planned budget</span></div><b>{money(planned)}</b></div>
        <div className="budget-mini"><div><span className="mini-dot green-dot"/><span>Actual expenses</span></div><b>{money(expenses)}</b></div>
        <div className="budget-mini"><div><span className="mini-dot orange-dot"/><span>Budget left (income − expenses)</span></div><b className={remaining<0?'negative':''}>{money(remaining)}</b></div>
        <button className="text-link" onClick={()=>setPage('budget')}>Manage your budget <ArrowUpRight size={15}/></button>
      </section>
      <section className="panel"><div className="panel-heading"><div><h3>Where it goes</h3><p className="muted">Expense breakdown by category</p></div></div>
        {spentByCategory.length?<><div className="chart-box donut-box"><ResponsiveContainer width="100%" height="190"><PieChart><Pie data={spentByCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3}>{spentByCategory.map((x,i)=><Cell key={x.name} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer></div><div className="legend-list">{spentByCategory.slice(0,4).map((x,i)=><div key={x.name}><span><i style={{background:COLORS[i%COLORS.length]}}/>{x.name}</span><b>{money(x.value)}</b></div>)}</div></>:<div className="empty-state small-empty"><div className="empty-icon"><ChartNoAxesCombined size={22}/></div><b>No spending data yet</b><span>Add an expense to see your breakdown.</span></div>}
      </section>
    </div>
    <section className="panel recent-panel"><div className="panel-heading"><div><h3>Recent transactions</h3><p className="muted">Your latest money movements</p></div><button className="text-link" onClick={()=>setPage('transactions')}>View all <ArrowUpRight size={15}/></button></div>
      {recent.length?<TransactionTable transactions={recent}/>:<div className="empty-state compact-empty"><span>No transactions yet. Add your first income or expense.</span><button className="btn btn-outline btn-small" onClick={()=>setPage('transactions')}>Add transaction</button></div>}
    </section>
  </>
}

function BudgetPage({ budget, expenses, updateBudget, transactions }) {
  const [income,setIncome] = useState(budget.income||'')
  const [plans,setPlans] = useState(budget.plans||{})
  const [saved,setSaved] = useState(false)
  useEffect(()=>{setIncome(budget.income||'');setPlans(budget.plans||{})},[budget])
  const planned = Object.values(plans).reduce((s,v)=>s+Number(v||0),0)
  const save = e => {e.preventDefault();updateBudget({income:Number(income)||0,plans:Object.fromEntries(Object.entries(plans).map(([k,v])=>[k,Number(v)||0]))});setSaved(true);setTimeout(()=>setSaved(false),2500)}
  const actualFor = cat => transactions.filter(t=>t.type==='expense'&&t.category===cat).reduce((s,t)=>s+Number(t.amount),0)
  return <>
    <div className="welcome-row"><div><span className="eyebrow">PLAN WITH PURPOSE</span><h2>Build your monthly budget</h2><p className="muted">Set your income and decide how much to allocate to each category.</p></div></div>
    <form onSubmit={save}>
      <section className="panel income-panel"><div className="section-icon"><IndianRupee size={20}/></div><div className="income-input-copy"><h3>Monthly income</h3><p className="muted">Enter your salary or total expected monthly income.</p></div><div className="income-field"><span>₹</span><input type="number" min="0" step="1" value={income} onChange={e=>setIncome(e.target.value)} placeholder="e.g. 30000"/></div></section>
      <section className="panel allocation-panel"><div className="panel-heading"><div><h3>Category allocations</h3><p className="muted">Compare your planned amount with actual spending.</p></div><span className="period-chip">Monthly plan</span></div>
        <div className="allocation-head"><span>CATEGORY</span><span>PLANNED AMOUNT</span><span>ACTUAL SPENT</span><span>STATUS</span></div>
        {categories.map((cat,i)=>{const plan=Number(plans[cat]||0),actual=actualFor(cat),over=actual>plan&&plan>0;return <div className="allocation-row" key={cat}><div className="category-name"><span className="category-symbol" style={{background:`${COLORS[i%COLORS.length]}18`,color:COLORS[i%COLORS.length]}}>{cat.slice(0,1)}</span><b>{cat}</b></div><div className="allocation-input"><span>₹</span><input type="number" min="0" value={plans[cat]??''} onChange={e=>setPlans(old=>({...old,[cat]:e.target.value}))} placeholder="0"/></div><div className="actual-value">{money(actual)}</div><div>{over?<span className="status-pill status-over">Over plan</span>:<span className="status-pill status-ok">{plan===0?'Not set':'On track'}</span>}</div></div>})}
        <div className="allocation-total"><span>Total planned budget</span><strong>{money(planned)}</strong></div>
        <div className="allocation-foot"><span>{money(Math.max((Number(income)||0)-planned,0))} unallocated</span><span>{planned>(Number(income)||0)?'Your plan is higher than income.':'You are within your income.'}</span></div>
        <div className="form-actions"><span className="muted tiny">{saved?'Budget saved successfully.':'Changes are saved when you click Save budget.'}</span><button className="btn btn-primary" type="submit">Save budget <ArrowUpRight size={16}/></button></div>
      </section>
    </form>
    <div className="info-banner"><Target size={19}/><div><b>Smart budget tip</b><span>If actual spending exceeds a category plan, the app flags it as “Over plan”. Review your allocations and save an updated plan. Remaining balance is calculated from income minus actual expenses.</span></div></div>
  </>
}

function TransactionsPage({ transactions, addTransaction, removeTransaction }) {
  const [type,setType] = useState('expense')
  const [amount,setAmount] = useState('')
  const [category,setCategory] = useState('Food')
  const [date,setDate] = useState(today())
  const [note,setNote] = useState('')
  const [error,setError] = useState('')
  const submit = e => {
    e.preventDefault()
    if(Number(amount)<=0){setError('Enter an amount greater than zero.');return}
    addTransaction({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),type,amount:Number(amount),category:type==='income'?'Income':category,date,note:note.trim()})
    setAmount('');setNote('');setError('')
  }
  return <>
    <div className="welcome-row"><div><span className="eyebrow">MONEY MOVEMENT</span><h2>Transactions</h2><p className="muted">Record income and expenses as they happen.</p></div></div>
    <div className="content-grid transaction-layout">
      <section className="panel add-tx-panel"><div className="panel-heading"><div><h3>Add transaction</h3><p className="muted">Fill in the details below.</p></div></div>
        <form className="tx-form" onSubmit={submit}>
          <div className="segmented"><button type="button" className={type==='expense'?'selected':''} onClick={()=>setType('expense')}>Expense</button><button type="button" className={type==='income'?'selected income-selected':''} onClick={()=>setType('income')}>Income</button></div>
          <label>Amount (₹)<input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount" required/></label>
          {type==='expense'&&<label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>}
          <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label>
          <label>Note <span className="optional">(optional)</span><input value={note} onChange={e=>setNote(e.target.value)} placeholder="What was this for?"/></label>
          {error&&<div className="error-msg">{error}</div>}
          <button className="btn btn-primary btn-full" type="submit"><Plus size={17}/> Save transaction</button>
        </form>
      </section>
      <section className="panel all-tx-panel"><div className="panel-heading"><div><h3>All transactions</h3><p className="muted">{transactions.length} recorded entries</p></div></div>
        {transactions.length?<div className="table-scroll"><table><thead><tr><th>DETAIL</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td><div className="tx-detail"><span className={`tx-icon ${t.type}`} >{t.type==='income'?<ArrowDownRight size={16}/>:<ArrowUpRight size={16}/>}</span><div><b>{t.category}</b><small>{t.note||t.type}</small></div></div></td><td>{t.date}</td><td className={t.type==='income'?'positive':'negative'}>{t.type==='income'?'+':'−'}{money(t.amount)}</td><td><button className="icon-btn danger-btn" title="Delete transaction" onClick={()=>removeTransaction(t.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>:<div className="empty-state"><div className="empty-icon"><Receipt size={24}/></div><b>No transactions recorded</b><span>Your income and expenses will appear here.</span></div>}
      </section>
    </div>
  </>
}

function TransactionTable({ transactions }) {
  return <div className="table-scroll"><table><thead><tr><th>DETAIL</th><th>DATE</th><th>AMOUNT</th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td><div className="tx-detail"><span className={`tx-icon ${t.type}`}>{t.type==='income'?<ArrowDownRight size={16}/>:<ArrowUpRight size={16}/>}</span><div><b>{t.category}</b><small>{t.note||t.type}</small></div></div></td><td>{t.date}</td><td className={t.type==='income'?'positive':'negative'}>{t.type==='income'?'+':'−'}{money(t.amount)}</td></tr>)}</tbody></table></div>
}

function ReportsPage({ transactions, income, expenses, budget }) {
  const monthData = useMemo(()=>Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-(5-i));const key=d.toISOString().slice(0,7);const label=d.toLocaleString('en-IN',{month:'short'});const rows=transactions.filter(t=>t.date?.startsWith(key));return {month:label,income:rows.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0),expenses:rows.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)}}),[transactions])
  const byCat=categories.map(name=>({name,amount:transactions.filter(t=>t.type==='expense'&&t.category===name).reduce((s,t)=>s+Number(t.amount),0)})).filter(x=>x.amount>0).sort((a,b)=>b.amount-a.amount)
  const exportCSV=()=>{const rows=[['Date','Type','Category','Amount','Note'],...transactions.map(t=>[t.date,t.type,t.category,t.amount,t.note||''])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='budget-transactions.csv';a.click();URL.revokeObjectURL(a.href)}
  return <>
    <div className="welcome-row"><div><span className="eyebrow">YOUR FINANCIAL STORY</span><h2>Reports & insights</h2><p className="muted">A clearer view of your money habits.</p></div><button className="btn btn-outline" onClick={exportCSV}><Download size={16}/> Export CSV</button></div>
    <div className="stats-grid two-stats"><StatCard label="Current month income" value={income} note="Budget income + added income" icon={TrendingUp} tone="green"/><StatCard label="Current month expenses" value={expenses} note="Recorded expenses" icon={CreditCard} tone="orange"/></div>
    <div className="content-grid">
      <section className="panel"><div className="panel-heading"><div><h3>Income vs expenses</h3><p className="muted">Last six months of recorded transactions</p></div></div><div className="chart-box"><ResponsiveContainer width="100%" height={270}><BarChart data={monthData} margin={{top:10,right:8,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f5"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${v/1000}k`:v}/><Tooltip formatter={v=>money(v)}/><Legend/><Bar dataKey="income" name="Income" fill="#18a999" radius={[5,5,0,0]}/><Bar dataKey="expenses" name="Expenses" fill="#f4a340" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></section>
      <section className="panel"><div className="panel-heading"><div><h3>Top spending categories</h3><p className="muted">All recorded expenses</p></div></div>{byCat.length?<div className="category-report">{byCat.map((x,i)=><div key={x.name}><div className="category-report-label"><span>{x.name}</span><b>{money(x.amount)}</b></div><div className="progress-track"><div className="progress-fill" style={{width:`${Math.max(3,x.amount/Math.max(...byCat.map(y=>y.amount))*100)}%`,background:COLORS[i%COLORS.length]}}/></div></div>)}</div>:<div className="empty-state small-empty"><span>No expenses to report yet.</span></div>}</section>
    </div>
    <div className="info-banner"><ChartNoAxesCombined size={19}/><div><b>Keep your records consistent</b><span>Reports are based on the transactions you record in this browser. The six-month chart includes months with recorded entries.</span></div></div>
  </>
}

function AdminApp({ db, onLogout }) {
  const [page,setPage] = useState('admin-overview')
  const [mobileOpen,setMobileOpen] = useState(false)
  const allTx=Object.entries(db.transactions||{}).flatMap(([email,items])=>items.map(t=>({...t,email})))
  const totalIncome=Object.values(db.budgets||{}).reduce((s,b)=>s+Number(b.income||0),0)+allTx.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
  const totalExpenses=allTx.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
  const title=page==='admin-users'?'Registered users':page==='admin-finances'?'Budget monitoring':'Admin overview'
  return <div className="app-shell"><Sidebar active={page} setActive={setPage} onLogout={onLogout} role="admin" mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/><main className="main-area"><Header title={title} subtitle="Application-wide budget and user overview." session={{name:'Administrator',role:'admin'}} onMenu={()=>setMobileOpen(true)}/><div className="page-content">
    {page==='admin-overview'&&<><div className="welcome-row"><div><span className="eyebrow">ADMIN CONTROL CENTER</span><h2>Application overview</h2><p className="muted">A high-level view of registered accounts and recorded finances.</p></div></div><div className="stats-grid"><StatCard label="Registered users" value={db.users.length} note="Created accounts" icon={Users} tone="purple"/><StatCard label="Total recorded income" value={totalIncome} note="Across all demo accounts" icon={TrendingUp} tone="green"/><StatCard label="Total recorded expenses" value={totalExpenses} note="Across all demo accounts" icon={CreditCard} tone="orange"/><StatCard label="Total transactions" value={allTx.length} note="Income and expense entries" icon={Receipt} tone="blue"/></div><div className="content-grid"><section className="panel"><div className="panel-heading"><div><h3>Recently registered users</h3><p className="muted">Latest accounts created</p></div><button className="text-link" onClick={()=>setPage('admin-users')}>View all <ArrowUpRight size={15}/></button></div><UserTable users={db.users.slice(-5).reverse()}/></section><section className="panel admin-note"><div className="section-icon"><ShieldCheck size={20}/></div><h3>Admin access</h3><p className="muted">Use this module to review registered demo users and their recorded budget activity. Do not use this Local Storage demo for real financial data.</p><div className="admin-note-stat"><span>Accounts</span><b>{db.users.length}</b></div><div className="admin-note-stat"><span>Transactions</span><b>{allTx.length}</b></div></section></div></>}
    {page==='admin-users'&&<><div className="welcome-row"><div><span className="eyebrow">ACCOUNT DIRECTORY</span><h2>Registered users</h2><p className="muted">Users who created an account in this browser.</p></div></div><section className="panel"><UserTable users={[...db.users].reverse()} emptyText="No users have signed up yet."/></section></>}
    {page==='admin-finances'&&<><div className="welcome-row"><div><span className="eyebrow">FINANCIAL MONITORING</span><h2>Budget monitoring</h2><p className="muted">Income, planned budgets and actual expenses by user.</p></div></div><section className="panel"><div className="table-scroll"><table><thead><tr><th>USER</th><th>MONTHLY INCOME</th><th>PLANNED BUDGET</th><th>ALL EXPENSES</th><th>TRANSACTIONS</th></tr></thead><tbody>{db.users.map(u=>{const b=db.budgets[u.email]||{income:0,plans:{}};const tx=db.transactions[u.email]||[];const exp=tx.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);const plan=Object.values(b.plans||{}).reduce((s,v)=>s+Number(v||0),0);return <tr key={u.email}><td><div className="tx-detail"><span className="avatar small-avatar">{u.name.slice(0,1).toUpperCase()}</span><div><b>{u.name}</b><small>{u.email}</small></div></div></td><td>{money(b.income)}</td><td>{money(plan)}</td><td className="negative">{money(exp)}</td><td>{tx.length}</td></tr>})}</tbody></table></div>{db.users.length===0&&<div className="empty-state"><span>No user budget data available.</span></div>}</section></>}
  </div><footer className="app-footer">Pocketwise Admin <span>·</span> Demo administration module</footer></main></div>
}

function UserTable({ users, emptyText='No registered users yet.' }) {
  return users.length?<div className="table-scroll"><table><thead><tr><th>USER</th><th>JOINED</th><th>ACCOUNT TYPE</th></tr></thead><tbody>{users.map(u=><tr key={u.email}><td><div className="tx-detail"><span className="avatar small-avatar">{u.name.slice(0,1).toUpperCase()}</span><div><b>{u.name}</b><small>{u.email}</small></div></div></td><td>{u.createdAt||'—'}</td><td><span className="status-pill status-ok">User</span></td></tr>)}</tbody></table></div>:<div className="empty-state"><div className="empty-icon"><Users size={24}/></div><b>{emptyText}</b><span>New signups will appear here.</span></div>
}

export default App
