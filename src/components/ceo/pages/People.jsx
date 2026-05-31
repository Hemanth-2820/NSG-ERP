import React from 'react';
import { 
  Users, UserPlus, UserMinus, ShieldAlert, 
  MapPin, Settings, Download, Filter, Target, Award
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const kpiData = [
  { label: "Total Headcount", value: "842", trend: "up", change: "+12", color: "#2563EB" },
  { label: "New Hires (YTD)", value: "124", trend: "up", change: "+5%", color: "#10B981" },
  { label: "Attrition Rate", value: "8.4%", trend: "down", change: "-1.2%", color: "#10B981" },
  { label: "Avg Attendance", value: "94%", trend: "flat", change: "0%", color: "#8B5CF6" },
  { label: "Top Performers", value: "18%", trend: "up", change: "+2%", color: "#F59E0B" },
  { label: "Engagement Score", value: "82/100", trend: "up", change: "+4", color: "#2563EB" },
];

const distributionData = [
  { dept: 'Engineering', count: 340 },
  { dept: 'Operations', count: 180 },
  { dept: 'Sales', count: 120 },
  { dept: 'Support', count: 95 },
  { dept: 'HR & Admin', count: 42 },
  { dept: 'Finance', count: 35 },
];

const talentRisks = [
  { name: 'Sarah Connor', role: 'VP Engineering', risk: 'High Flight Risk', impact: 'Critical' },
  { name: 'David Lee', role: 'Lead Architect', risk: 'Burnout Warning', impact: 'High' },
  { name: 'Operations Team APAC', role: 'Group', risk: 'Low Engagement', impact: 'Medium' },
];

export default function People() {
  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Workforce Intelligence</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Executive overview of human capital, organizational health, and talent retention.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="ceo-btn"><Filter size={16} /> Filter Dept</button>
          <button className="ceo-btn"><Download size={16} /> HR Report</button>
          <button className="ceo-btn ceo-btn-primary"><Settings size={16} /> Workforce Planning</button>
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
              <div className="ceo-typography-card-title"><Users size={18} color="var(--ceo-primary)" /> Global Headcount Distribution</div>
            </div>
            <div className="ceo-command-content" style={{ height: '300px', paddingRight: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ceo-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="dept" stroke="var(--ceo-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--ceo-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--ceo-border)' }} />
                  <Bar dataKey="count" fill="var(--ceo-primary)" barSize={20} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><Award size={18} color="var(--ceo-warning)" /> Executive Leadership Matrix</div>
              <button className="ceo-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Full Directory</button>
            </div>
            <div className="ceo-erp-table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="ceo-erp-table">
                <thead>
                  <tr>
                    <th>Executive Name</th>
                    <th>Role & Dept</th>
                    <th>Location</th>
                    <th style={{ textAlign: 'right' }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Michael Chen</td>
                    <td>Chief Operating Officer</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="var(--ceo-text-muted)" /> NY HQ</div></td>
                    <td style={{ textAlign: 'right' }}><span className="ceo-badge success">Exceeds Ex.</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Elena Rodriguez</td>
                    <td>Chief Financial Officer</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="var(--ceo-text-muted)" /> London</div></td>
                    <td style={{ textAlign: 'right' }}><span className="ceo-badge success">Exceeds Ex.</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>James Wilson</td>
                    <td>VP of Global Sales</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="var(--ceo-text-muted)" /> Singapore</div></td>
                    <td style={{ textAlign: 'right' }}><span className="ceo-badge warning">Meets Ex.</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="ceo-split-right">
          
          <div className="ceo-command-panel" style={{ borderTop: '4px solid var(--ceo-danger)' }}>
            <div className="ceo-command-header" style={{ borderBottom: 'none' }}>
              <div className="ceo-typography-card-title"><ShieldAlert size={18} color="var(--ceo-danger)" /> Key Talent Risks</div>
            </div>
            <div className="ceo-command-content" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {talentRisks.map((risk, i) => (
                <div key={i} style={{ padding: '16px', background: risk.impact === 'Critical' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${risk.impact === 'Critical' ? '#FECACA' : '#FDE68A'}`, borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>{risk.name}</span>
                    <span className={`ceo-badge ${risk.impact === 'Critical' ? 'critical' : 'warning'}`}>{risk.impact}</span>
                  </div>
                  <div className="ceo-typography-meta" style={{ marginBottom: '8px' }}>{risk.role}</div>
                  <div className="ceo-typography-body" style={{ color: risk.impact === 'Critical' ? '#B91C1C' : '#B45309', fontWeight: 600 }}>
                    {risk.risk}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
