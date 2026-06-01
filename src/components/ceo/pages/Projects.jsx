import React, { useState } from 'react';
import { 
  Search, Filter, LayoutGrid, List, CheckCircle, 
  AlertTriangle, Clock, Target, PlayCircle, Lock
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
export default function Projects() {
  const [signoffProject, setSignoffProject] = useState(null);
  const [signature, setSignature] = useState(false); // mock digital signature

  const [projects, setProjects] = useState([
    { id: 1, name: "ERP Migration V2", client: "Internal", budget: 1500000, used: 1250000, status: "Active", deadline: "Dec 31, 2025" },
    { id: 2, name: "Q3 Marketing Campaign", client: "Acme Corp", budget: 500000, used: 480000, status: "At Risk", deadline: "Oct 15, 2025" },
    { id: 3, name: "Data Center Upgrade", client: "TechCorp", budget: 2000000, used: 900000, status: "Active", deadline: "Feb 28, 2026" },
    { id: 4, name: "Mobile App Rebuild", client: "FinBank", budget: 850000, used: 200000, status: "Active", deadline: "Nov 30, 2025" },
    { id: 5, name: "Q1 Training Program", client: "Internal", budget: 150000, used: 150000, status: "Completed", deadline: "Aug 10, 2025" }
  ]);
  const [editProject, setEditProject] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const getBudgetColor = (used, total) => {
    const pct = used / total;
    if (pct > 0.9) return 'var(--ceo-danger)';
    if (pct > 0.75) return 'var(--ceo-warning)';
    return 'var(--ceo-success)';
  };

  const handleSignoff = () => {
    // Perform sign off logic
    setProjects(prev => prev.map(p => p.id === signoffProject.id ? { ...p, status: 'Completed' } : p));
    setSignoffProject(null);
    setSignature(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setProjects(prev => prev.map(p => p.id === editProject.id ? editProject : p));
    setEditProject(null);
  };

  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '32px', position: 'relative' }}>
      
      {/* HEADER & TOOLBAR */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 className="ceo-typography-page-title">Enterprise Project Portfolio</h1>
          <p className="ceo-typography-body" style={{ marginTop: '4px' }}>Strategic oversight of budgets, deadlines, and deliverables.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ceo-form-input" 
              placeholder="Search projects..." 
              style={{ paddingLeft: '36px', height: '40px', width: '100%' }} 
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="ceo-form-input" 
            style={{ height: '40px', cursor: 'pointer', minWidth: '120px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* PROJECTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))', gap: '24px' }}>
          {filteredProjects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--ceo-text-muted)' }}>No projects found matching your criteria.</div>
          ) : (
            filteredProjects.map(proj => (
            <div key={proj.id} className="ceo-command-panel" style={{ padding: '24px', opacity: proj.status === 'Completed' ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className={`ceo-badge ${proj.status === 'At Risk' ? 'critical' : proj.status === 'Active' ? 'success' : 'neutral'}`}>
                  {proj.status}
                </span>
                <span className="ceo-typography-meta"><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/> {proj.deadline}</span>
              </div>
              
              <div className="ceo-typography-section-title" style={{ fontSize: '18px' }}>{proj.name}</div>
              <div className="ceo-typography-meta" style={{ fontStyle: 'italic', marginBottom: '24px', marginTop: '4px' }}>Client: {proj.client}</div>
              
              {/* Budget Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ceo-typography-meta">Budget Usage</span>
                  <span className="ceo-typography-meta" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>
                    ₹{(proj.used/1000).toFixed(0)}K / ₹{(proj.budget/1000).toFixed(0)}K
                  </span>
                </div>
                <div style={{ height: '8px', background: 'var(--ceo-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${Math.min(100, (proj.used / proj.budget) * 100)}%`, 
                    background: getBudgetColor(proj.used, proj.budget) 
                  }}></div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--ceo-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <button className="ceo-btn" onClick={() => setEditProject(proj)}>
                  Edit
                </button>
                <button className="ceo-btn" onClick={() => setSignoffProject(proj)} disabled={proj.status === 'Completed'}>
                  <Target size={16} /> {proj.status === 'Completed' ? 'Signed-off' : 'Sign-off Milestone'}
                </button>
              </div>
            </div>
          )))}
        </div>      {/* SIGNOFF MODAL */}
      {signoffProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ceo-command-panel" style={{ width: '500px', maxWidth: '90vw' }}>
            <div className="ceo-command-header">
              <div className="ceo-typography-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={20} color="var(--ceo-success)"/> Executive Sign-off</div>
            </div>
            <div className="ceo-command-content">
              <div style={{ marginBottom: '24px' }}>
                <div className="ceo-typography-meta">Project</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>{signoffProject.name}</div>
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="ceo-typography-section-title" style={{ fontSize: '14px' }}>Milestone Checklist</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="checkbox" defaultChecked /> Deliverables verified by QA
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="checkbox" defaultChecked /> Client accepted UAT
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input type="checkbox" defaultChecked /> Invoice generated
                </label>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div className="ceo-typography-section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>Digital Signature</div>
                <div 
                  onClick={() => setSignature(!signature)}
                  style={{ 
                    height: '100px', 
                    background: 'var(--ceo-bg)', 
                    border: '1px dashed var(--ceo-border)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {signature ? (
                    <span style={{ fontFamily: 'cursive', fontSize: '32px', color: 'var(--ceo-primary)' }}>CEO Approved</span>
                  ) : (
                    <span className="ceo-typography-meta">Click to sign</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="ceo-btn" onClick={() => setSignoffProject(null)}>Cancel</button>
                <button className="ceo-btn ceo-btn-primary" onClick={handleSignoff} disabled={!signature}>Authorize Sign-off</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ceo-command-panel" style={{ width: '500px', maxWidth: '90vw' }}>
            <div className="ceo-command-header">
              <div className="ceo-typography-section-title">Modify Project Details</div>
            </div>
            <form onSubmit={handleSaveEdit} className="ceo-command-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="ceo-typography-meta">Project Name</label>
                <input required className="ceo-form-input" style={{ width: '100%', marginTop: '4px' }} value={editProject.name} onChange={e => setEditProject({...editProject, name: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="ceo-typography-meta">Client</label>
                  <input required className="ceo-form-input" style={{ width: '100%', marginTop: '4px' }} value={editProject.client} onChange={e => setEditProject({...editProject, client: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="ceo-typography-meta">Status</label>
                  <select className="ceo-form-input" style={{ width: '100%', marginTop: '4px' }} value={editProject.status} onChange={e => setEditProject({...editProject, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="ceo-typography-meta">Total Budget (₹)</label>
                  <input required type="number" className="ceo-form-input" style={{ width: '100%', marginTop: '4px' }} value={editProject.budget} onChange={e => setEditProject({...editProject, budget: Number(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="ceo-typography-meta">Used Budget (₹)</label>
                  <input required type="number" className="ceo-form-input" style={{ width: '100%', marginTop: '4px' }} value={editProject.used} onChange={e => setEditProject({...editProject, used: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="ceo-typography-meta">Deadline</label>
                <input required className="ceo-form-input" style={{ width: '100%', marginTop: '4px' }} value={editProject.deadline} onChange={e => setEditProject({...editProject, deadline: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="ceo-btn" onClick={() => setEditProject(null)}>Cancel</button>
                <button type="submit" className="ceo-btn ceo-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
