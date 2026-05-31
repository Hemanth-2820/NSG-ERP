import React from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, AlertTriangle, 
  Settings, Filter, Download, Plus, Search, PieChart, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const kpiData = [
  { label: "Net Revenue", value: "₹42.5M", trend: "up", change: "+12%", color: "#2563EB" },
  { label: "Operating Profit", value: "₹12.8M", trend: "up", change: "+8%", color: "#10B981" },
  { label: "Total Expenses", value: "₹29.7M", trend: "down", change: "-4%", color: "#EF4444" },
  { label: "Free Cash Flow", value: "₹8.4M", trend: "flat", change: "0%", color: "#8B5CF6" },
  { label: "Accounts Receivable", value: "₹3.2M", trend: "up", change: "+2%", color: "#F59E0B" },
  { label: "Accounts Payable", value: "₹1.8M", trend: "down", change: "-1%", color: "#10B981" },
];

const cashFlowData = [
  { month: 'Jan', in: 1200, out: 900 },
  { month: 'Feb', in: 1350, out: 1000 },
  { month: 'Mar', in: 1100, out: 1200 },
  { month: 'Apr', in: 1500, out: 1100 },
  { month: 'May', in: 1800, out: 1300 },
];

const spendData = [
  { dept: 'Payroll & Benefits', amount: 45 },
  { dept: 'Infrastructure', amount: 20 },
  { dept: 'Marketing', amount: 15 },
  { dept: 'R&D', amount: 12 },
  { dept: 'Operations', amount: 8 },
];

export default function Finance() {
  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">CFO Dashboard</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Executive visibility into revenue, margins, cash flow, and financial risk.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="ceo-btn"><Filter size={16} /> Filter Date Range</button>
          <button className="ceo-btn"><Download size={16} /> Export Financials</button>
          <button className="ceo-btn ceo-btn-primary"><Settings size={16} /> Budget Config</button>
        </div>
      </div>

      {/* 2. KPI STRIP */}
      <div className="ceo-kpi-strip">
        {kpiData.map((kpi, i) => (
          <div key={i} className="ceo-kpi-strip-item">
            <span className="ceo-typography-meta" style={{ textTransform: 'uppercase' }}>{kpi.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <span className="ceo-kpi-value">{kpi.value}</span>
              <span className="ceo-badge neutral" style={{ color: kpi.color, background: `${kpi.color}15`, border: 'none' }}>
                {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'} {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. SPLIT LAYOUT */}
      <div className="ceo-split-layout">
        
        {/* LEFT COLUMN */}
        <div className="ceo-split-left">
          
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><Activity size={18} color="var(--ceo-primary)" /> Cash Flow vs Forecast (₹M)</div>
            </div>
            <div className="ceo-command-content" style={{ height: '300px', paddingRight: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ceo-success)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--ceo-success)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ceo-danger)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--ceo-danger)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ceo-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip cursor={{ fill: 'var(--ceo-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--ceo-border)' }} />
                  <Area type="monotone" dataKey="in" stroke="var(--ceo-success)" fill="url(#colorIn)" strokeWidth={2} />
                  <Area type="monotone" dataKey="out" stroke="var(--ceo-danger)" fill="url(#colorOut)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><PieChart size={18} color="var(--ceo-warning)" /> Variance Analysis (Budget vs Actuals)</div>
            </div>
            <div className="ceo-erp-table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="ceo-erp-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Q2 Budget (₹)</th>
                    <th>Actual Spend (₹)</th>
                    <th style={{ textAlign: 'right' }}>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Engineering</td>
                    <td>1,200,000</td>
                    <td>1,150,000</td>
                    <td style={{ textAlign: 'right' }}><span className="ceo-badge success">-4.2% (Under)</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Marketing</td>
                    <td>800,000</td>
                    <td>920,000</td>
                    <td style={{ textAlign: 'right' }}><span className="ceo-badge critical">+15.0% (Over)</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Operations</td>
                    <td>450,000</td>
                    <td>455,000</td>
                    <td style={{ textAlign: 'right' }}><span className="ceo-badge warning">+1.1% (Near)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="ceo-split-right">
          
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><IndianRupee size={18} color="var(--ceo-primary)" /> Department Spend (%)</div>
            </div>
            <div className="ceo-command-content" style={{ height: '250px', paddingRight: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendData} layout="vertical" margin={{ top: 0, right: 0, left: 50, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ceo-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="dept" stroke="var(--ceo-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--ceo-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--ceo-border)' }} />
                  <Bar dataKey="amount" fill="var(--ceo-primary)" barSize={20} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ceo-command-panel" style={{ borderTop: '4px solid var(--ceo-danger)' }}>
            <div className="ceo-command-header" style={{ borderBottom: 'none' }}>
              <div className="ceo-typography-card-title"><AlertTriangle size={18} color="var(--ceo-danger)" /> Financial Risk Center</div>
            </div>
            <div className="ceo-command-content" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>A/R Aging Over 90 Days</span>
                  <span className="ceo-badge critical">High Risk</span>
                </div>
                <div className="ceo-typography-body" style={{ color: '#B91C1C', fontWeight: 600 }}>₹1.2M locked in uncollected invoices from Enterprise clients in APAC.</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
