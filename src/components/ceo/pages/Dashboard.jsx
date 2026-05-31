import React from 'react';
import { 
  IndianRupee, TrendingUp, AlertTriangle, ShieldCheck, Download, 
  Settings, Filter, ArrowRight, BarChart2, CheckCircle, Clock 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Line
} from 'recharts';
import '../CEO.css';

// ==========================================
// DATA
// ==========================================
const kpiData = [
  { label: "Net Revenue (YTD)", value: "₹84.2M", trend: "up", change: "12%", color: "#2563EB" },
  { label: "Operating Profit", value: "₹22.5M", trend: "up", change: "8%", color: "#10B981" },
  { label: "Free Cash Flow", value: "₹14.8M", trend: "down", change: "2%", color: "#EF4444" },
  { label: "Active Enterprise Projects", value: "34", trend: "flat", change: "0%", color: "#8B5CF6" },
  { label: "Total Headcount", value: "842", trend: "up", change: "4%", color: "#F59E0B" },
  { label: "CSAT Score", value: "4.8/5", trend: "up", change: "0.2", color: "#10B981" },
];

const revenueData = [
  { name: 'Q1', revenue: 14000, target: 12000, profit: 4200 },
  { name: 'Q2', revenue: 18500, target: 16000, profit: 5800 },
  { name: 'Q3', revenue: 22400, target: 21000, profit: 7100 },
  { name: 'Q4 (Est)', revenue: 29300, target: 28000, profit: 9500 },
];

const projectHealth = [
  { name: "ERP Migration V2", status: "Healthy", progress: 85, owner: "Sarah C." },
  { name: "Q3 Marketing Campaign", status: "At Risk", progress: 42, owner: "Mike R." },
  { name: "Data Center Upgrade", status: "Warning", progress: 60, owner: "David L." },
];

const alerts = [
  { title: "Compliance Audit Deadline Approaching", type: "Warning", date: "2 Days" },
  { title: "Server Overload in APAC Region", type: "Critical", date: "Immediate" },
];

// ==========================================
// COMPONENT
// ==========================================
export default function Dashboard() {
  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Executive Command Center</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Real-time enterprise telemetry and strategic performance overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="ceo-btn"><Filter size={16} /> Filter View</button>
          <button className="ceo-btn"><Download size={16} /> Export Board Report</button>
          <button className="ceo-btn ceo-btn-primary"><Settings size={16} /> Dashboard Settings</button>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI STRIP */}
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

      {/* 3. MAIN BUSINESS CONTENT - SPLIT LAYOUT */}
      <div className="ceo-split-layout">
        
        {/* LEFT COLUMN */}
        <div className="ceo-split-left">
          
          {/* Revenue & Profit Analytics */}
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><IndianRupee size={18} color="var(--ceo-primary)" /> Revenue & Profit Trajectory</div>
              <div style={{ display: 'flex', gap: '16px' }} className="ceo-typography-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 12, background: 'var(--ceo-primary)', borderRadius: 2 }}></div> Revenue</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 12, background: 'var(--ceo-success)', borderRadius: 2 }}></div> Profit</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 2, background: 'var(--ceo-text-muted)' }}></div> Target</span>
              </div>
            </div>
            <div className="ceo-command-content" style={{ height: '350px', paddingRight: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--ceo-primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--ceo-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ceo-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip cursor={{ fill: 'var(--ceo-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--ceo-border)', boxShadow: 'var(--ceo-shadow)' }} />
                  <Area type="monotone" dataKey="revenue" fillOpacity={1} fill="url(#colorRev)" stroke="var(--ceo-primary)" strokeWidth={3} />
                  <Bar dataKey="profit" fill="var(--ceo-success)" barSize={32} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="target" stroke="var(--ceo-text-muted)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department & Project Health Table */}
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><BarChart2 size={18} color="var(--ceo-purple)" /> Strategic Initiative Health</div>
              <button className="ceo-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>View All Portfolios</button>
            </div>
            <div className="ceo-erp-table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="ceo-erp-table">
                <thead>
                  <tr>
                    <th>Initiative Name</th>
                    <th>Executive Sponsor</th>
                    <th>Progress</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectHealth.map((proj, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{proj.name}</td>
                      <td>{proj.owner}</td>
                      <td style={{ width: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--ceo-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${proj.progress}%`, height: '100%', background: proj.status === 'At Risk' ? 'var(--ceo-danger)' : proj.status === 'Warning' ? 'var(--ceo-warning)' : 'var(--ceo-success)' }}></div>
                          </div>
                          <span className="ceo-typography-meta" style={{ minWidth: '30px' }}>{proj.progress}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`ceo-badge ${proj.status === 'At Risk' ? 'critical' : proj.status === 'Warning' ? 'warning' : 'success'}`}>
                          {proj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="ceo-split-right">
          
          {/* Executive Alerts */}
          <div className="ceo-command-panel" style={{ borderTop: '4px solid var(--ceo-danger)' }}>
            <div className="ceo-command-header" style={{ borderBottom: 'none' }}>
              <div className="ceo-typography-card-title"><AlertTriangle size={18} color="var(--ceo-danger)" /> Executive Alerts</div>
            </div>
            <div className="ceo-command-content" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {alerts.map((alert, i) => (
                <div key={i} style={{ padding: '16px', background: alert.type === 'Critical' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${alert.type === 'Critical' ? '#FECACA' : '#FDE68A'}`, borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={`ceo-badge ${alert.type === 'Critical' ? 'critical' : 'warning'}`}>{alert.type}</span>
                    <span className="ceo-typography-meta">{alert.date}</span>
                  </div>
                  <div className="ceo-typography-body" style={{ color: alert.type === 'Critical' ? '#B91C1C' : '#B45309', fontWeight: 600 }}>
                    {alert.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Timeline */}
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><Clock size={18} color="var(--ceo-warning)" /> Pending Executive Decisions</div>
            </div>
            <div className="ceo-command-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--ceo-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>Capex Approval</span>
                  <span className="ceo-typography-meta" style={{ color: 'var(--ceo-danger)' }}>High Priority</span>
                </div>
                <div className="ceo-typography-body" style={{ marginBottom: '12px' }}>Approve ₹4.5M for IT Infrastructure Upgrade across APAC regions.</div>
                <button className="ceo-btn ceo-btn-primary" style={{ width: '100%' }}>Review Request</button>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid var(--ceo-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>Policy Override</span>
                  <span className="ceo-typography-meta">Standard</span>
                </div>
                <div className="ceo-typography-body" style={{ marginBottom: '12px' }}>Approve WFH policy exception for the London Operations Team.</div>
                <button className="ceo-btn" style={{ width: '100%' }}>Review Request</button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
