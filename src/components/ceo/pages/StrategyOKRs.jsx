import React from 'react';
import { 
  Target, Crosshair, Flag, Settings, ChevronRight, Activity, 
  AlertOctagon, Plus, Search, Filter, TrendingUp, Compass
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const kpiData = [
  { label: "Strategic Score", value: "88/100", trend: "up", change: "+4", color: "#8B5CF6" },
  { label: "Alignment Score", value: "92%", trend: "up", change: "+2%", color: "#2563EB" },
  { label: "On Track OKRs", value: "24", trend: "flat", change: "0", color: "#10B981" },
  { label: "At Risk OKRs", value: "3", trend: "up", change: "+1", color: "#F59E0B" },
  { label: "Blocked OKRs", value: "1", trend: "down", change: "-1", color: "#EF4444" },
];

const alignmentData = [
  { dept: 'Sales', score: 95 },
  { dept: 'Engineering', score: 92 },
  { dept: 'Marketing', score: 88 },
  { dept: 'Operations', score: 85 },
];

const objectives = [
  { 
    id: 'OBJ-01', 
    title: 'Achieve Market Leadership in Enterprise ERP', 
    owner: 'Vivek C. (CEO)', 
    progress: 75, 
    status: 'On Track',
    keyResults: [
      { title: 'Increase Enterprise Market Share by 15%', progress: 80 },
      { title: 'Launch AI-Powered Analytics Module', progress: 100 },
      { title: 'Reduce Customer Churn to < 2%', progress: 45 }
    ]
  },
  { 
    id: 'OBJ-02', 
    title: 'Operational Excellence & Margin Expansion', 
    owner: 'Elena R. (CFO)', 
    progress: 42, 
    status: 'At Risk',
    keyResults: [
      { title: 'Reduce Cloud Infrastructure Costs by 20%', progress: 30 },
      { title: 'Automate 80% of Manual Finance Workflows', progress: 55 }
    ]
  }
];

export default function StrategyOKRs() {
  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Strategy & OKRs</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Executive alignment, objective tracking, and strategic goal progression.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="text" placeholder="Search objectives..." className="ceo-form-input" style={{ paddingLeft: '32px', width: '250px' }} />
          </div>
          <button className="ceo-btn"><Filter size={16} /> Filter Dept</button>
          <button className="ceo-btn ceo-btn-primary"><Plus size={16} /> New Objective</button>
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
              <div className="ceo-typography-card-title"><Target size={18} color="var(--ceo-primary)" /> Corporate Objectives</div>
            </div>
            <div className="ceo-command-content" style={{ padding: 0 }}>
              {objectives.map((obj, i) => (
                <div key={obj.id} style={{ padding: '24px', borderBottom: i === objectives.length - 1 ? 'none' : '1px solid var(--ceo-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div className="ceo-typography-meta" style={{ fontFamily: 'monospace', marginBottom: '4px' }}>{obj.id}</div>
                      <div className="ceo-typography-section-title">{obj.title}</div>
                      <div className="ceo-typography-body" style={{ marginTop: '4px' }}>Owner: {obj.owner}</div>
                    </div>
                    <span className={`ceo-badge ${obj.status === 'At Risk' ? 'warning' : 'success'}`}>
                      {obj.status}
                    </span>
                  </div>

                  {/* Objective Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'var(--ceo-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${obj.progress}%`, height: '100%', background: 'var(--ceo-primary)' }}></div>
                    </div>
                    <span className="ceo-typography-meta" style={{ fontWeight: 600 }}>{obj.progress}% Overall</span>
                  </div>

                  {/* Key Results */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px', borderLeft: '2px solid var(--ceo-border)' }}>
                    {obj.keyResults.map((kr, k) => (
                      <div key={k}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="ceo-typography-body" style={{ fontSize: '13px' }}>{kr.title}</span>
                          <span className="ceo-typography-meta">{kr.progress}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--ceo-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${kr.progress}%`, height: '100%', background: kr.progress === 100 ? 'var(--ceo-success)' : 'var(--ceo-info)' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="ceo-split-right">
          
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><Compass size={18} color="var(--ceo-purple)" /> Vision & Mission</div>
            </div>
            <div className="ceo-command-content">
              <h4 className="ceo-typography-meta" style={{ textTransform: 'uppercase', marginBottom: '4px' }}>Vision</h4>
              <p className="ceo-typography-body" style={{ marginBottom: '16px', color: 'var(--ceo-text-primary)' }}>To be the undisputed global leader in AI-driven enterprise planning.</p>
              
              <h4 className="ceo-typography-meta" style={{ textTransform: 'uppercase', marginBottom: '4px' }}>Mission</h4>
              <p className="ceo-typography-body" style={{ color: 'var(--ceo-text-primary)' }}>Empower Fortune 500 companies with real-time operational telemetry and flawless execution capabilities.</p>
            </div>
          </div>

          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title"><Crosshair size={18} color="var(--ceo-primary)" /> Department Alignment</div>
            </div>
            <div className="ceo-command-content" style={{ height: '250px', paddingRight: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alignmentData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ceo-border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--ceo-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="dept" stroke="var(--ceo-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--ceo-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--ceo-border)' }} />
                  <Bar dataKey="score" fill="var(--ceo-primary)" barSize={20} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ceo-command-panel" style={{ borderTop: '4px solid var(--ceo-danger)' }}>
            <div className="ceo-command-header" style={{ borderBottom: 'none' }}>
              <div className="ceo-typography-card-title"><AlertOctagon size={18} color="var(--ceo-danger)" /> Blocked Objectives</div>
            </div>
            <div className="ceo-command-content" style={{ paddingTop: 0 }}>
              <div style={{ padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>OBJ-04</span>
                  <span className="ceo-badge critical">Blocked</span>
                </div>
                <div className="ceo-typography-body" style={{ color: '#B91C1C', fontWeight: 600 }}>Launch EU Operations. Blocked due to pending regulatory clearance.</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
