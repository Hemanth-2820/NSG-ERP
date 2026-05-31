import React from 'react';
import { 
  Briefcase, Activity, Target, ShieldAlert, 
  ChevronRight, Settings, Filter, Download, Plus, Search, CheckCircle, Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const kpiData = [
  { label: "Active Portfolios", value: "8", trend: "flat", change: "0", color: "#8B5CF6" },
  { label: "Enterprise Projects", value: "34", trend: "up", change: "+2", color: "#2563EB" },
  { label: "Capital Allocation", value: "₹18.5M", trend: "up", change: "+1.2M", color: "#10B981" },
  { label: "Budget Variance", value: "-2.4%", trend: "down", change: "0.4%", color: "#F59E0B" },
  { label: "Projects At Risk", value: "3", trend: "up", change: "+1", color: "#EF4444" },
  { label: "On-Time Delivery", value: "92%", trend: "up", change: "+4%", color: "#10B981" },
];

const allocationData = [
  { dept: 'IT Systems', budget: 8.5 },
  { dept: 'Marketing', budget: 4.2 },
  { dept: 'R&D', budget: 3.8 },
  { dept: 'Operations', budget: 2.0 },
];

const projects = [
  { name: 'Global ERP Migration', sponsor: 'Elena Rodriguez', phase: 'Execution', budget: '₹4.5M', status: 'Healthy', progress: 68 },
  { name: 'APAC Data Center', sponsor: 'Michael Chen', phase: 'Planning', budget: '₹2.8M', status: 'Warning', progress: 15 },
  { name: 'Q3 Brand Campaign', sponsor: 'James Wilson', phase: 'Execution', budget: '₹1.2M', status: 'At Risk', progress: 42 },
  { name: 'Security Audit V2', sponsor: 'Sarah Connor', phase: 'Closure', budget: '₹0.5M', status: 'Healthy', progress: 95 },
];

export default function Projects() {
  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Portfolio Management</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Executive visibility into strategic initiatives, capital allocation, and delivery risks.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="text" placeholder="Search portfolios..." className="ceo-form-input" style={{ paddingLeft: '32px', width: '250px' }} />
          </div>
          <button className="ceo-btn"><Filter size={16} /> Filter</button>
          <button className="ceo-btn"><Download size={16} /> Export</button>
          <button className="ceo-btn ceo-btn-primary"><Plus size={16} /> New Portfolio</button>
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
              <div className="ceo-typography-card-title"><Briefcase size={18} color="var(--ceo-primary)" /> Strategic Project Matrix</div>
              <button className="ceo-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>View Full Matrix</button>
            </div>
            <div className="ceo-erp-table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="ceo-erp-table">
                <thead>
                  <tr>
                    <th>Initiative Name</th>
                    <th>Exec. Sponsor</th>
                    <th>Phase</th>
                    <th>Budget</th>
                    <th>Progress</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{proj.name}</td>
                      <td>{proj.sponsor}</td>
                      <td><span className="ceo-typography-meta">{proj.phase}</span></td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{proj.budget}</td>
                      <td style={{ width: '150px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><Activity size={18} color="var(--ceo-primary)" /> Capital Allocation (₹M)</div>
            </div>
            <div className="ceo-command-content" style={{ height: '250px', paddingRight: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ceo-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="dept" stroke="var(--ceo-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--ceo-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--ceo-border)' }} />
                  <Bar dataKey="budget" fill="var(--ceo-primary)" barSize={20} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ceo-command-panel" style={{ borderTop: '4px solid var(--ceo-danger)' }}>
            <div className="ceo-command-header" style={{ borderBottom: 'none' }}>
              <div className="ceo-typography-card-title"><ShieldAlert size={18} color="var(--ceo-danger)" /> Risk Matrix</div>
            </div>
            <div className="ceo-command-content" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>Q3 Brand Campaign</span>
                  <span className="ceo-badge critical">Critical Risk</span>
                </div>
                <div className="ceo-typography-body" style={{ color: '#B91C1C', fontWeight: 600 }}>Budget overrun by 15% due to agency fees. Needs sponsor intervention.</div>
              </div>
              <div style={{ padding: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>APAC Data Center</span>
                  <span className="ceo-badge warning">Schedule Delay</span>
                </div>
                <div className="ceo-typography-body" style={{ color: '#B45309', fontWeight: 600 }}>Hardware procurement delayed by 3 weeks. Buffer consumed.</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
