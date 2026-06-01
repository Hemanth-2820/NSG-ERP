import React, { useState } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, AlertTriangle, 
  Plus, Check, X, Calculator, Settings, Clock, CheckCircle,
  FileText, Landmark, BarChart3, Activity, Briefcase, ShieldAlert, AlertCircle, ArrowUpRight, ArrowDownRight, Wallet, Users
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart
} from 'recharts';
import '../CEO.css';

// ==========================================
// MOCK DATA 
// ==========================================
const kpiData = {
  revenue: { val: '₹12.4M', trend: '+14%', up: true },
  grossProfit: { val: '₹4.8M', trend: '+8%', up: true },
  netProfit: { val: '₹2.1M', trend: '+5%', up: true },
  opex: { val: '₹3.6M', trend: '-2%', up: false }, // lower is good for opex but we'll show neutral
  cash: { val: '₹8.5M', trend: '+11%', up: true },
  burnRate: { val: '₹1.2M/mo', trend: 'Stable', up: null }
};

const revenueTrend = [
  { month: 'Jan', revenue: 8.2, profit: 2.1 },
  { month: 'Feb', revenue: 9.1, profit: 2.3 },
  { month: 'Mar', revenue: 10.5, profit: 3.0 },
  { month: 'Apr', revenue: 11.2, profit: 3.2 },
  { month: 'May', revenue: 12.4, profit: 3.5 },
];

const cashFlowData = [
  { month: 'Jan', in: 9, out: 7 },
  { month: 'Feb', in: 10, out: 8 },
  { month: 'Mar', in: 11, out: 8.5 },
  { month: 'Apr', in: 12, out: 9 },
  { month: 'May', in: 13, out: 10 },
];

const mockBudgets = [
  { id: 1, dept: 'Marketing', title: 'Q3 Global Campaign', amount: '₹2,500,000', reqBy: 'David L.', status: 'pending', variance: '+15% vs Last Qtr' },
  { id: 2, dept: 'IT Infrastructure', title: 'AWS Enterprise Renewal', amount: '₹1,850,000', reqBy: 'Sarah C.', status: 'pending', variance: 'Within Limits' },
  { id: 3, dept: 'Sales', title: 'CRM Upgrade', amount: '₹400,000', reqBy: 'Amit P.', status: 'approved', variance: '-5% vs Last Qtr' },
];

const executiveApprovals = [
  { id: 1, type: 'CapEx', title: 'New Bangalore R&D Office Lease', amount: '₹14,000,000', status: 'pending', risk: 'High' },
  { id: 2, type: 'Vendor Contract', title: 'Salesforce 3-Year Deal', amount: '₹4,500,000', status: 'pending', risk: 'Medium' },
];

const arData = [
  { client: 'Acme Corp', invoice: 'INV-2041', amount: '₹1,200,000', daysOverdue: 14, status: 'Overdue' },
  { client: 'Global Tech', invoice: 'INV-2045', amount: '₹850,000', daysOverdue: 0, status: 'Pending' },
  { client: 'Nexus Retail', invoice: 'INV-2030', amount: '₹4,300,000', daysOverdue: 45, status: 'High Risk' },
];

const apData = [
  { vendor: 'AWS India', ref: 'AWS-MAY-26', amount: '₹950,000', dueDate: '15 Jun 2026', status: 'Upcoming' },
  { vendor: 'WeWork', ref: 'WW-Q3', amount: '₹2,100,000', dueDate: '01 Jul 2026', status: 'Upcoming' },
];

const riskData = [
  { category: 'Cash Flow', level: 'Low', desc: 'Operating runway > 18 months.' },
  { category: 'Collections', level: 'High', desc: '₹4.3M stuck > 45 days (Nexus Retail).' },
  { category: 'Budget', level: 'Medium', desc: 'Marketing exceeding Q2 budget by 12%.' },
  { category: 'Compliance', level: 'Low', desc: 'All statutory payments cleared.' },
];



const mockPayroll = [
  { id: 1, name: 'Alice Smith', dept: 'Engineering', gross: '₹1,50,000', net: '₹1,37,500', status: 'Processed' },
  { id: 2, name: 'Rahul Verma', dept: 'Marketing', gross: '₹85,000', net: '₹76,800', status: 'Processed' },
];

const mockStatutory = [
  { id: 1, type: 'Provident Fund (PF)', amount: '₹4,50,000', month: 'May 2026', dueDate: '15 Jun 2026', status: 'Paid' },
  { id: 2, type: 'TDS', amount: '₹8,20,000', month: 'May 2026', dueDate: '07 Jun 2026', status: 'Paid' },
];

const SUBTABS = [
  { id: 'overview', label: 'Executive Overview' },
  { id: 'governance', label: 'Governance & Approvals' },
  { id: 'arap', label: 'AR / AP Center' },
  { id: 'operations', label: 'Payroll & Operations' }
];

// ==========================================
// SUB-COMPONENTS (TABS)
// ==========================================

const KpiCard = ({ title, value, trend, up }) => (
  <div style={{ background: '#FFF', border: '1px solid var(--ceo-border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ color: 'var(--ceo-text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ceo-text-primary)' }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: up === true ? 'var(--ceo-success)' : up === false ? 'var(--ceo-danger)' : 'var(--ceo-text-secondary)' }}>
      {up === true ? <ArrowUpRight size={14} /> : up === false ? <ArrowDownRight size={14} /> : null}
      {trend} vs Last Month
    </div>
  </div>
);

const OverviewTab = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    {/* SECTION 1: KPI STRIP */}
    <div className="ceo-grid-6">
      <KpiCard title="Total Revenue" value={kpiData.revenue.val} trend={kpiData.revenue.trend} up={kpiData.revenue.up} />
      <KpiCard title="Gross Profit" value={kpiData.grossProfit.val} trend={kpiData.grossProfit.trend} up={kpiData.grossProfit.up} />
      <KpiCard title="Net Profit" value={kpiData.netProfit.val} trend={kpiData.netProfit.trend} up={kpiData.netProfit.up} />
      <KpiCard title="Operating Exp" value={kpiData.opex.val} trend={kpiData.opex.trend} up={kpiData.opex.up} />
      <KpiCard title="Cash Position" value={kpiData.cash.val} trend={kpiData.cash.trend} up={kpiData.cash.up} />
      <KpiCard title="Burn Rate" value={kpiData.burnRate.val} trend={kpiData.burnRate.trend} up={kpiData.burnRate.up} />
    </div>

    {/* SECTION 2 & 5: PERFORMANCE & REVENUE INTELLIGENCE */}
    <div className="ceo-grid-2-1">
      <div className="ceo-command-panel">
        <div className="ceo-command-header"><div className="ceo-typography-card-title">Revenue & Profitability Intelligence (M)</div></div>
        <div className="ceo-command-content" style={{ padding: '24px', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--ceo-primary)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--ceo-primary)" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ceo-border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v) => `₹${v}`} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--ceo-primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              <Area type="monotone" dataKey="profit" name="Net Profit" stroke="var(--ceo-success)" fill="transparent" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* SECTION 2 RIGHT: HEALTH SCORES */}
      <div className="ceo-command-panel">
        <div className="ceo-command-header"><div className="ceo-typography-card-title">Financial Health Panel</div></div>
        <div className="ceo-command-content" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Cash Health Score', score: '92/100', status: 'Excellent', color: 'var(--ceo-success)' },
            { label: 'Budget Adherence', score: '88/100', status: 'Good', color: 'var(--ceo-primary)' },
            { label: 'Profit Margin Score', score: '78/100', status: 'Monitor', color: 'var(--ceo-warning)' },
            { label: 'Compliance Score', score: '100/100', status: 'Perfect', color: 'var(--ceo-success)' }
          ].map(h => (
            <div key={h.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--ceo-divider)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ceo-text-secondary)' }}>{h.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ceo-text-primary)', marginTop: '4px' }}>{h.score}</div>
              </div>
              <div style={{ padding: '4px 12px', background: `${h.color}20`, color: h.color, borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                {h.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* SECTION 3: CASH FLOW CONTROL CENTER */}
    <div className="ceo-command-panel">
      <div className="ceo-command-header"><div className="ceo-typography-card-title">Cash Flow Control Center (M)</div></div>
      <div className="ceo-command-content" style={{ padding: '24px', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ceo-border)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
            <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v) => `₹${v}`} />
            <Tooltip cursor={{fill: '#F8FAFC'}} />
            <Bar dataKey="in" name="Cash Inflow" fill="var(--ceo-success)" radius={[4,4,0,0]} barSize={32} />
            <Bar dataKey="out" name="Cash Outflow" fill="var(--ceo-danger)" radius={[4,4,0,0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const GovernanceTab = ({ budgets, setBudgets }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    
    {/* SECTION 10: FINANCIAL RISK MONITORING */}
    <div className="ceo-command-panel">
      <div className="ceo-command-header"><div className="ceo-typography-card-title"><ShieldAlert size={18} color="var(--ceo-danger)" /> Financial Risk Monitoring</div></div>
      <div className="ceo-command-content ceo-grid-4" style={{ padding: '24px' }}>
        {riskData.map(r => (
          <div key={r.category} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--ceo-border)', background: r.level === 'High' ? '#FEF2F2' : '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.category}</span>
              <span className={`ceo-badge ${r.level === 'High' ? 'danger' : r.level === 'Medium' ? 'warning' : 'success'}`}>{r.level} Risk</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ceo-text-secondary)', margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* SECTION 9: EXECUTIVE APPROVAL CENTER */}
    <div className="ceo-command-panel">
      <div className="ceo-command-header"><div className="ceo-typography-card-title"><Briefcase size={18} color="var(--ceo-primary)" /> Executive Approval Center (CapEx & Contracts)</div></div>
      <div className="ceo-command-content" style={{ padding: 0 }}>
        <table className="ceo-erp-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Request Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Risk Assessment</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {executiveApprovals.map(ex => (
              <tr key={ex.id}>
                <td style={{ paddingLeft: '24px', fontWeight: 600 }}>{ex.type}</td>
                <td>{ex.title}</td>
                <td style={{ fontWeight: 700 }}>{ex.amount}</td>
                <td><span className={`ceo-badge ${ex.risk === 'High' ? 'danger' : 'warning'}`}>{ex.risk}</span></td>
                <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                  <button className="ceo-btn ceo-btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* SECTION 4: BUDGET GOVERNANCE */}
    <div className="ceo-command-panel">
      <div className="ceo-command-header"><div className="ceo-typography-card-title"><IndianRupee size={18} color="var(--ceo-primary)" /> Department Budget Governance</div></div>
      <div className="ceo-command-content" style={{ padding: 0 }}>
        <table className="ceo-erp-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Department</th>
              <th>Request Title</th>
              <th>Variance Analysis</th>
              <th>Amount</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(b => (
              <tr key={b.id} style={{ opacity: b.status === 'approved' ? 0.6 : 1 }}>
                <td style={{ paddingLeft: '24px', fontWeight: 600 }}>{b.dept}</td>
                <td>
                  <div>{b.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ceo-text-muted)' }}>Req by: {b.reqBy}</div>
                </td>
                <td style={{ color: b.variance.includes('+') ? 'var(--ceo-danger)' : 'var(--ceo-text-secondary)' }}>{b.variance}</td>
                <td style={{ fontWeight: 700 }}>{b.amount}</td>
                <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                  {b.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="ceo-btn ceo-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setBudgets(budgets.map(x => x.id === b.id ? {...x, status: 'approved'} : x))}>Approve</button>
                      <button className="ceo-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#FFF' }}>Reject</button>
                    </div>
                  ) : (
                    <span className="ceo-badge success">Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ArApTab = () => (
  <div className="ceo-grid-2">
    
    {/* SECTION 7: ACCOUNTS RECEIVABLE */}
    <div className="ceo-command-panel">
      <div className="ceo-command-header"><div className="ceo-typography-card-title">Accounts Receivable (Incoming Cash)</div></div>
      <div className="ceo-command-content" style={{ padding: 0 }}>
        <table className="ceo-erp-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Client & Invoice</th>
              <th>Amount</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {arData.map(ar => (
              <tr key={ar.invoice}>
                <td style={{ paddingLeft: '24px' }}>
                  <div style={{ fontWeight: 600 }}>{ar.client}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ceo-text-muted)' }}>{ar.invoice}</div>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--ceo-success)' }}>{ar.amount}</td>
                <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                  <span className={`ceo-badge ${ar.status === 'High Risk' ? 'danger' : ar.status === 'Overdue' ? 'warning' : 'neutral'}`}>
                    {ar.status} {ar.daysOverdue > 0 ? `(${ar.daysOverdue}d)` : ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* SECTION 8: ACCOUNTS PAYABLE */}
    <div className="ceo-command-panel">
      <div className="ceo-command-header"><div className="ceo-typography-card-title">Accounts Payable (Outgoing Cash)</div></div>
      <div className="ceo-command-content" style={{ padding: 0 }}>
        <table className="ceo-erp-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '24px' }}>Vendor & Ref</th>
              <th>Amount</th>
              <th style={{ paddingRight: '24px', textAlign: 'right' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {apData.map(ap => (
              <tr key={ap.ref}>
                <td style={{ paddingLeft: '24px' }}>
                  <div style={{ fontWeight: 600 }}>{ap.vendor}</div>
                  <div style={{ fontSize: '12px', color: 'var(--ceo-text-muted)' }}>{ap.ref}</div>
                </td>
                <td style={{ fontWeight: 700 }}>{ap.amount}</td>
                <td style={{ paddingRight: '24px', textAlign: 'right', fontSize: '13px', color: 'var(--ceo-text-secondary)' }}>
                  {ap.dueDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);



const OperationsTab = ({ components, setComponents, editingId, setEditingId }) => {
  const updateComponent = (id, field, val) => setComponents(components.map(c => c.id === id ? { ...c, [field]: val } : c));
  const removeComponent = (id) => setComponents(components.filter(c => c.id !== id));
  const addComponent = () => {
    const newId = Date.now();
    setComponents([...components, { id: newId, name: '', type: 'Fixed', calc: 'Flat', value: 0, tax: true }]);
    setEditingId(newId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTION 11: PAYROLL SUMMARY */}
      <div className="ceo-command-panel">
        <div className="ceo-command-header">
          <div className="ceo-typography-card-title"><Users size={18} color="var(--ceo-primary)" /> Payroll Register Summary</div>
        </div>
        <div className="ceo-command-content" style={{ padding: 0 }}>
          <table className="ceo-erp-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>Employee Name</th>
                <th>Department</th>
                <th>Gross Salary</th>
                <th>Net Pay</th>
                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPayroll.map(pay => (
                <tr key={pay.id}>
                  <td style={{ paddingLeft: '24px', fontWeight: 500 }}>{pay.name}</td>
                  <td style={{ color: 'var(--ceo-text-secondary)', fontSize: '13px' }}>{pay.dept}</td>
                  <td style={{ fontSize: '14px', fontWeight: 500 }}>{pay.gross}</td>
                  <td style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ceo-success)' }}>{pay.net}</td>
                  <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                    <span className="ceo-badge success">{pay.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ceo-grid-2">
        {/* SECTION 13: STATUTORY */}
        <div className="ceo-command-panel">
          <div className="ceo-command-header"><div className="ceo-typography-card-title"><Landmark size={18} color="var(--ceo-primary)" /> Compliance & Statutory</div></div>
          <div className="ceo-command-content" style={{ padding: 0 }}>
            <table className="ceo-erp-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {mockStatutory.map(stat => (
                  <tr key={stat.id}>
                    <td style={{ paddingLeft: '24px', fontWeight: 500 }}>{stat.type}</td>
                    <td style={{ fontWeight: 600 }}>{stat.amount}</td>
                    <td style={{ fontSize: '13px', color: 'var(--ceo-text-secondary)' }}>{stat.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 12: SALARY BUILDER (Admin) */}
        <div className="ceo-command-panel">
          <div className="ceo-command-header">
            <div className="ceo-typography-card-title"><Calculator size={18} color="var(--ceo-primary)" /> Salary Structure (Admin)</div>
            <button className="ceo-btn" onClick={addComponent} style={{ padding: '4px 12px', fontSize: '12px' }}><Plus size={14} /> Add</button>
          </div>
          <div className="ceo-command-content" style={{ padding: 0 }}>
            <table className="ceo-erp-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Component</th>
                  <th>Value</th>
                  <th style={{ paddingRight: '24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {components.map(comp => (
                  <tr key={comp.id}>
                    <td style={{ paddingLeft: '24px' }}>
                      {editingId === comp.id ? <input className="ceo-form-input" value={comp.name} onChange={e => updateComponent(comp.id, 'name', e.target.value)} /> : comp.name || '(Unnamed)'}
                    </td>
                    <td>
                      {editingId === comp.id ? <input type="number" className="ceo-form-input" style={{ width: '80px' }} value={comp.value} onChange={e => updateComponent(comp.id, 'value', Number(e.target.value))} /> : (comp.calc === 'Flat' ? `₹${comp.value}` : `${comp.value}%`)}
                    </td>
                    <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                      {editingId === comp.id ? (
                        <button className="ceo-btn" onClick={() => setEditingId(null)} style={{ background: 'var(--ceo-success)', color: 'white', padding: '4px 8px', fontSize: '12px' }}>Save</button>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="ceo-btn" onClick={() => setEditingId(comp.id)} style={{ padding: '4px', border: 'none' }}><Settings size={14} /></button>
                          <button className="ceo-btn" onClick={() => removeComponent(comp.id)} style={{ padding: '4px', border: 'none' }}><X size={14} color="var(--ceo-danger)"/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// MAIN COMPONENT
// ==========================================
export default function Finance() {
  const [activeTab, setActiveTab] = useState('overview');

  // Shared States (Lifted)
  const [budgets, setBudgets] = useState(mockBudgets);
  const [components, setComponents] = useState([
    { id: 1, name: 'Basic Salary', type: 'Fixed', calc: 'Flat', value: 45000, tax: true },
    { id: 2, name: 'HRA', type: 'Fixed', calc: '% of Basic', value: 50, tax: false }
  ]);
  const [editingId, setEditingId] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '32px' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="ceo-typography-page-title">Executive Finance Command Center</h1>
        <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Monitor financial health, approve capital expenditures, and analyze cash flow intelligence.</p>
      </div>

      {/* CLEAN SUBTABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--ceo-divider)', marginBottom: '24px' }}>
        {SUBTABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0 0 12px 0',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--ceo-primary)' : 'var(--ceo-text-muted)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--ceo-primary)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              marginBottom: '-1px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DYNAMIC TAB RENDERING */}
      <div style={{ flex: 1 }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'governance' && <GovernanceTab budgets={budgets} setBudgets={setBudgets} />}
        {activeTab === 'arap' && <ArApTab />}

        {activeTab === 'operations' && <OperationsTab components={components} setComponents={setComponents} editingId={editingId} setEditingId={setEditingId} />}
      </div>
      
    </div>
  );
}
