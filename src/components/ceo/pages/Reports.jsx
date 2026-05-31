import React, { useState } from 'react';
import { 
  FileText, Download, Share2, Calendar, 
  Settings, Filter, Search, Eye, Plus, Folder, Briefcase, Users, Activity, BarChart2
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const categories = [
  { id: 'financial', label: 'Financial', icon: <BarChart2 size={16} /> },
  { id: 'projects', label: 'Projects', icon: <Briefcase size={16} /> },
  { id: 'hr', label: 'Human Resources', icon: <Users size={16} /> },
  { id: 'ops', label: 'Operations', icon: <Activity size={16} /> },
  { id: 'sales', label: 'Sales & Market', icon: <BarChart2 size={16} /> },
  { id: 'custom', label: 'Custom Reports', icon: <Folder size={16} /> },
];

const reports = [
  { id: 1, title: 'Q3 P&L Statement', category: 'financial', owner: 'Elena Rodriguez (CFO)', freq: 'Quarterly', status: 'Ready', lastGen: 'Today, 08:00 AM' },
  { id: 2, title: 'Global Headcount & Attrition', category: 'hr', owner: 'HR Analytics', freq: 'Monthly', status: 'Ready', lastGen: 'Oct 01, 2023' },
  { id: 3, title: 'Enterprise Project Health', category: 'projects', owner: 'PMO Office', freq: 'Weekly', status: 'Processing', lastGen: 'Pending' },
  { id: 4, title: 'CapEx Utilization', category: 'financial', owner: 'Finance Team', freq: 'Monthly', status: 'Ready', lastGen: 'Oct 05, 2023' },
];

export default function Reports() {
  const [activeCat, setActiveCat] = useState('financial');

  const filteredReports = reports.filter(r => r.category === activeCat);

  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Executive Report Center</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Central repository for scheduled and generated board-level analytics.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="text" placeholder="Search reports..." className="ceo-form-input" style={{ paddingLeft: '32px', width: '250px' }} />
          </div>
          <button className="ceo-btn"><Filter size={16} /> Filter</button>
          <button className="ceo-btn ceo-btn-primary"><Plus size={16} /> New Custom Report</button>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT */}
      <div className="ceo-split-layout">
        
        {/* LEFT COLUMN - NAV */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title">Report Categories</div>
            </div>
            <div className="ceo-command-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => setActiveCat(cat.id)}
                  style={{
                    padding: '12px 16px', borderRadius: 'var(--ceo-radius-btn)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: activeCat === cat.id ? 'var(--ceo-hover)' : 'transparent',
                    color: activeCat === cat.id ? 'var(--ceo-primary)' : 'var(--ceo-text-secondary)',
                    fontWeight: activeCat === cat.id ? 600 : 500,
                    borderLeft: activeCat === cat.id ? '3px solid var(--ceo-primary)' : '3px solid transparent'
                  }}
                >
                  {cat.icon}
                  <span style={{ fontSize: '14px' }}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="ceo-layout-grid" style={{ gap: '24px', gridTemplateColumns: '1fr 1fr', display: 'grid' }}>
            {filteredReports.map((report) => (
              <div key={report.id} className="ceo-command-panel">
                <div className="ceo-command-header" style={{ padding: '16px 24px' }}>
                  <div className="ceo-typography-card-title" style={{ alignItems: 'flex-start' }}>
                    <FileText size={20} color="var(--ceo-primary)" style={{ marginTop: '2px' }} />
                    <div>
                      {report.title}
                      <div className="ceo-typography-meta" style={{ marginTop: '4px', fontWeight: 500 }}>{report.freq} Generation</div>
                    </div>
                  </div>
                  <span className={`ceo-badge ${report.status === 'Ready' ? 'success' : 'warning'}`}>
                    {report.status}
                  </span>
                </div>
                
                <div className="ceo-command-content" style={{ padding: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <div className="ceo-typography-meta">Data Owner</div>
                      <div className="ceo-typography-body">{report.owner}</div>
                    </div>
                    <div>
                      <div className="ceo-typography-meta">Last Generated</div>
                      <div className="ceo-typography-body">{report.lastGen}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="ceo-btn" style={{ flex: 1, padding: '8px' }}><Eye size={16} /> Preview</button>
                    <button className="ceo-btn ceo-btn-primary" style={{ flex: 1, padding: '8px' }} disabled={report.status !== 'Ready'}><Download size={16} /> Download</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button className="ceo-btn" style={{ flex: 1, padding: '8px' }}><Calendar size={16} /> Schedule</button>
                    <button className="ceo-btn" style={{ flex: 1, padding: '8px' }}><Share2 size={16} /> Share</button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredReports.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', background: 'var(--ceo-card-bg)', borderRadius: '16px', border: '1px solid var(--ceo-border)' }}>
                <Folder size={48} color="var(--ceo-border)" style={{ margin: '0 auto 16px auto' }} />
                <h3 className="ceo-typography-card-title" style={{ justifyContent: 'center' }}>No Reports Found</h3>
                <p className="ceo-typography-body">There are no reports configured for this category.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
