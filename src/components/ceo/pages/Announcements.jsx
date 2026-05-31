import React, { useState } from 'react';
import { 
  Megaphone, Send, Calendar, Save, 
  Settings, Filter, Search, Plus, Eye, List
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const kpiData = [
  { label: "Published Broadcasts", value: "142", trend: "up", change: "+5", color: "#2563EB" },
  { label: "Scheduled Drafts", value: "3", trend: "flat", change: "0", color: "#F59E0B" },
  { label: "Drafts in Review", value: "2", trend: "down", change: "-1", color: "#8B5CF6" },
  { label: "Global Read Rate", value: "94%", trend: "up", change: "+2%", color: "#10B981" },
];

const announcements = [
  { id: 'BRD-01', title: 'Q3 Financial Performance Overview', audience: 'All Employees', priority: 'High', status: 'Published', views: '2,450', date: 'Oct 14, 2023' },
  { id: 'BRD-02', title: 'New Enterprise Travel Policy', audience: 'Management', priority: 'Medium', status: 'Scheduled', views: '-', date: 'Oct 18, 2023' },
  { id: 'BRD-03', title: 'Leadership Offsite Outcomes', audience: 'All Employees', priority: 'Standard', status: 'Draft', views: '-', date: '-' },
  { id: 'BRD-04', title: 'Critical Security Infrastructure Update', audience: 'Engineering', priority: 'Critical', status: 'Published', views: '450', date: 'Oct 10, 2023' },
];

export default function Announcements() {
  const [view, setView] = useState('list'); // 'list' or 'create'

  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Executive Broadcast Center</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Official enterprise communications, policy updates, and corporate announcements.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {view === 'create' ? (
            <button className="ceo-btn" onClick={() => setView('list')}><List size={16} /> View Broadcasts</button>
          ) : (
            <>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input type="text" placeholder="Search broadcasts..." className="ceo-form-input" style={{ paddingLeft: '32px', width: '250px' }} />
              </div>
              <button className="ceo-btn"><Filter size={16} /> Filter</button>
              <button className="ceo-btn ceo-btn-primary" onClick={() => setView('create')}><Plus size={16} /> New Broadcast</button>
            </>
          )}
        </div>
      </div>

      {/* 2. KPI STRIP */}
      {view === 'list' && (
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
      )}

      {/* 3. CONTENT AREA */}
      {view === 'list' ? (
        <div className="ceo-command-panel">
          <div className="ceo-command-header">
            <div className="ceo-typography-card-title"><Megaphone size={18} color="var(--ceo-primary)" /> Broadcast Ledger</div>
          </div>
          <div className="ceo-erp-table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="ceo-erp-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Audience</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th style={{ textAlign: 'right' }}>Publish Date</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{ann.title}</td>
                    <td>{ann.audience}</td>
                    <td>
                      <span className={`ceo-badge ${ann.priority === 'Critical' ? 'critical' : ann.priority === 'High' ? 'warning' : 'neutral'}`}>
                        {ann.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`ceo-badge ${ann.status === 'Published' ? 'success' : ann.status === 'Scheduled' ? 'warning' : 'neutral'}`}>
                        {ann.status}
                      </span>
                    </td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} color="var(--ceo-text-muted)" /> {ann.views}</div></td>
                    <td style={{ textAlign: 'right' }} className="ceo-typography-meta">{ann.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="ceo-split-layout">
          <div className="ceo-command-panel" style={{ flex: 2 }}>
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title">Compose Enterprise Broadcast</div>
            </div>
            <div className="ceo-command-content" style={{ padding: '32px' }}>
              <div className="ceo-form-group">
                <label>Broadcast Title</label>
                <input type="text" className="ceo-form-input" placeholder="e.g. Q3 Financial Performance Overview" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="ceo-form-group">
                  <label>Target Audience</label>
                  <select className="ceo-form-input">
                    <option>All Global Employees</option>
                    <option>Management & Executives</option>
                    <option>Engineering Department</option>
                  </select>
                </div>
                <div className="ceo-form-group">
                  <label>Priority Level</label>
                  <select className="ceo-form-input">
                    <option>Standard</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              <div className="ceo-form-group">
                <label>Official Content</label>
                <textarea className="ceo-form-input" rows={12} placeholder="Draft your enterprise communication here..." style={{ resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--ceo-border)' }}>
                <button className="ceo-btn" onClick={() => setView('list')}>Cancel</button>
                <button className="ceo-btn"><Save size={16} /> Save as Draft</button>
                <button className="ceo-btn"><Calendar size={16} /> Schedule</button>
                <button className="ceo-btn ceo-btn-primary"><Send size={16} /> Publish Now</button>
              </div>
            </div>
          </div>
          
          <div className="ceo-command-panel" style={{ flex: 1, height: 'fit-content' }}>
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title">Broadcast Guidelines</div>
            </div>
            <div className="ceo-command-content">
              <ul className="ceo-typography-body" style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Ensure all financial figures match the audited Q3 report before publishing.</li>
                <li>Critical priority broadcasts will send a push notification to all employee mobile devices.</li>
                <li>Standard broadcasts are delivered via the internal dashboard feed only.</li>
                <li>Drafts are visible to the CEO Office and Corporate Communications team for review.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
