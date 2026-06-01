import React, { useState } from 'react';
import { 
  ShieldAlert, History, Bell, Settings as SettingsIcon, Users, 
  Search, Download, CheckCircle, Save, Globe, Zap, CheckSquare, Square
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const SETTINGS_CATEGORIES = [
  { id: 'config', label: 'Global Governance', icon: Globe },
  { id: 'security', label: 'Security & Access', icon: ShieldAlert },
  { id: 'automation', label: 'AI & Automation', icon: Zap },
  { id: 'audit', label: 'Audit Logs', icon: History }
];

const mockAuditLogs = [
  { id: 1, timestamp: "2025-05-31 10:15:22", user: "HR Admin (Priya)", action: "UPDATED_SALARY", module: "Payroll", details: "Changed Basic for EMP-104 from ₹45000 to ₹50000" },
  { id: 2, timestamp: "2025-05-31 09:42:10", user: "System", action: "AUTO_ESCALATION", module: "Approvals", details: "Escalated Capex Request A-102 to CEO" },
  { id: 3, timestamp: "2025-05-30 18:20:05", user: "CEO (Vivek)", action: "CHANGED_RBAC", module: "Settings", details: "Granted 'View Salary' to 'Team Lead' role" },
  { id: 4, timestamp: "2025-05-30 14:10:00", user: "Manager (David)", action: "APPROVED_LEAVE", module: "People", details: "Approved Sick Leave for EMP-221" },
  { id: 5, timestamp: "2025-05-30 11:05:44", user: "Finance (Sarah)", action: "BUDGET_REJECTED", module: "Finance", details: "Rejected Q3 Ad Spend for Marketing" }
];

const ROLES = ['CEO', 'HR Manager', 'Finance Manager', 'Team Lead', 'Employee'];
const MODULES = ['View Salary', 'Run Payroll', 'Approve Leaves', 'Export Data', 'View Audit Logs'];

// Initial matrix state
const initialRbac = {
  'View Salary': { 'CEO': true, 'HR Manager': true, 'Finance Manager': true, 'Team Lead': false, 'Employee': false },
  'Run Payroll': { 'CEO': false, 'HR Manager': true, 'Finance Manager': false, 'Team Lead': false, 'Employee': false },
  'Approve Leaves': { 'CEO': true, 'HR Manager': true, 'Finance Manager': false, 'Team Lead': true, 'Employee': false },
  'Export Data': { 'CEO': true, 'HR Manager': true, 'Finance Manager': true, 'Team Lead': false, 'Employee': false },
  'View Audit Logs': { 'CEO': true, 'HR Manager': false, 'Finance Manager': false, 'Team Lead': false, 'Employee': false },
};

// ==========================================
// COMPONENT
// ==========================================
export default function Settings() {
  const [activeCategory, setActiveCategory] = useState('config');
  
  // RBAC State
  const [rbacMatrix, setRbacMatrix] = useState(initialRbac);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Audit Logs State
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const filteredAuditLogs = mockAuditLogs.filter(log => {
    let matchesType = true;
    if (auditFilter === 'CRITICAL') matchesType = log.action.includes('REJECTED') || log.action.includes('ESCALATION');
    if (auditFilter === 'FINANCIAL') matchesType = log.module === 'Payroll' || log.module === 'Finance';
    if (auditFilter === 'EXPORT') matchesType = log.action.includes('EXPORT');

    let matchesSearch = true;
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      matchesSearch = log.user.toLowerCase().includes(q) || log.action.toLowerCase().includes(q) || log.details.toLowerCase().includes(q) || log.module.toLowerCase().includes(q);
    }

    return matchesType && matchesSearch;
  });

  const togglePermission = (module, role) => {
    setRbacMatrix(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [role]: !prev[module][role]
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveRbac = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '32px' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="ceo-typography-page-title">System & Security Settings</h1>
        <p className="ceo-typography-body" style={{ marginTop: '4px' }}>Enterprise access controls, audit logs, and global parameters.</p>
      </div>

      {/* CSS GRID LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '24px',
        flex: 1
      }}>
        
        {/* NAV SIDEBAR */}
        <div className="ceo-command-panel" style={{ padding: '12px 0' }}>
          {SETTINGS_CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                background: activeCategory === cat.id ? 'var(--tab-active-bg)' : 'transparent',
                border: 'none',
                borderRight: activeCategory === cat.id ? '3px solid var(--tab-active-border)' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                color: activeCategory === cat.id ? 'var(--ceo-primary)' : 'var(--ceo-text-secondary)',
                fontWeight: activeCategory === cat.id ? 600 : 500,
                transition: 'all 0.2s ease'
              }}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* CONTENT PANEL */}
        <div className="ceo-command-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* 4. AUDIT LOGS */}
          {activeCategory === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="ceo-command-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--ceo-border)', background: '#F8FAFC' }}>
                <div className="ceo-typography-card-title"><History size={18} color="var(--ceo-primary)" /> Immutable Audit Trail</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select className="ceo-form-input" style={{ width: '160px', height: '38px', background: '#FFF' }} value={auditFilter} onChange={e => setAuditFilter(e.target.value)}>
                    <option value="ALL">All Actions</option>
                    <option value="CRITICAL">Critical Only</option>
                    <option value="FINANCIAL">Financial Changes</option>
                    <option value="EXPORT">Data Exports</option>
                  </select>
                  <div style={{ position: 'relative', width: '280px' }}>
                    <Search size={16} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                    <input type="text" className="ceo-form-input" placeholder="Search by user, action, or module..." style={{ paddingLeft: '38px', height: '38px', background: '#FFF', width: '100%' }} value={auditSearch} onChange={e => setAuditSearch(e.target.value)} />
                  </div>
                  <button className="ceo-btn" style={{ height: '38px', padding: '0 16px', display: 'flex', gap: '8px', background: '#FFF', border: '1px solid var(--ceo-border)' }}><Download size={16} /> Export</button>
                </div>
              </div>
              <div className="ceo-command-content" style={{ padding: 0, overflowY: 'auto' }}>
                <table className="ceo-erp-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Details (Old → New)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.length > 0 ? (
                      filteredAuditLogs.map(log => {
                        const isDanger = log.action.includes('REJECTED') || log.action.includes('ESCALATION');
                        const isSuccess = log.action.includes('APPROVED');
                        const isWarning = log.action.includes('EXPORT') || log.action.includes('CHANGED');
                        
                        const badgeColor = isDanger ? 'var(--ceo-danger)' : isSuccess ? 'var(--ceo-success)' : isWarning ? 'var(--ceo-warning)' : 'var(--ceo-primary)';
                        const badgeBg = isDanger ? '#FEF2F2' : isSuccess ? '#F0FDF4' : isWarning ? '#FEFCE8' : '#EFF6FF';
                        
                        return (
                          <tr key={log.id} style={{ height: '56px' }}>
                            <td style={{ padding: '0 24px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{log.timestamp.split(' ')[0]}</span>
                                <span style={{ color: 'var(--ceo-text-muted)', fontSize: '11px' }}>{log.timestamp.split(' ')[1]}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: 'var(--ceo-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                  {log.user.charAt(0)}
                                </div>
                                <span style={{ fontWeight: 600 }}>{log.user}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ 
                                background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}40`,
                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px'
                              }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500, color: 'var(--ceo-text-secondary)' }}>{log.module}</td>
                            <td style={{ paddingRight: '24px' }}><span style={{ fontSize: '13px', color: 'var(--ceo-text-secondary)' }}>{log.details}</span></td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--ceo-text-muted)' }}>
                          <History size={32} style={{ opacity: 0.2, margin: '0 auto 12px auto' }} />
                          <div>No audit logs found matching the current filters.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1. GLOBAL GOVERNANCE */}
          {activeCategory === 'config' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="ceo-command-header">
                <div className="ceo-typography-card-title"><Globe size={18} color="var(--ceo-primary)" /> Global Governance Parameters</div>
                <button className="ceo-btn ceo-btn-primary" onClick={saveRbac} disabled={!hasUnsavedChanges || isSaving} style={{ padding: '6px 16px' }}>
                  {isSaving ? 'Saving...' : <><Save size={16}/> Save Changes</>}
                </button>
              </div>
              <div className="ceo-command-content" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                <div>
                  <div className="ceo-typography-section-title" style={{ fontSize: '13px', marginBottom: '16px' }}>FISCAL & REGIONAL</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="ceo-form-group" style={{ marginBottom: 0 }}>
                      <label>Base Currency</label>
                      <select className="ceo-form-input" defaultValue="INR" onChange={() => setHasUnsavedChanges(true)}>
                        <option value="INR">INR (₹) - Indian Rupee</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                      </select>
                    </div>
                    <div className="ceo-form-group" style={{ marginBottom: 0 }}>
                      <label>Financial Year Start</label>
                      <select className="ceo-form-input" defaultValue="Apr" onChange={() => setHasUnsavedChanges(true)}>
                        <option value="Jan">January 1st</option>
                        <option value="Apr">April 1st</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--ceo-border)', paddingTop: '24px' }}>
                  <div className="ceo-typography-section-title" style={{ fontSize: '13px', marginBottom: '16px' }}>EXECUTIVE APPROVAL THRESHOLDS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="ceo-form-group" style={{ marginBottom: 0 }}>
                      <label>Capex CEO Approval Limit (&gt;)</label>
                      <input type="number" className="ceo-form-input" defaultValue={5000000} onChange={() => setHasUnsavedChanges(true)} />
                      <div style={{ fontSize: '11px', color: 'var(--ceo-text-muted)', marginTop: '4px' }}>Any expense above this amount requires CEO approval.</div>
                    </div>
                    <div className="ceo-form-group" style={{ marginBottom: 0 }}>
                      <label>Mandatory Executive Hiring Review</label>
                      <select className="ceo-form-input" defaultValue="VP" onChange={() => setHasUnsavedChanges(true)}>
                        <option value="Dir">Director & Above</option>
                        <option value="VP">VP & Above</option>
                        <option value="C-Level">C-Level Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--ceo-border)', paddingTop: '24px' }}>
                  <div className="ceo-typography-section-title" style={{ fontSize: '13px', marginBottom: '16px' }}>AUTHORITY DELEGATION (OOF)</div>
                  <div style={{ background: '#F8FAFC', border: '1px solid var(--ceo-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>Delegate CEO Approvals</div>
                      <div style={{ fontSize: '13px', color: 'var(--ceo-text-secondary)', marginTop: '4px' }}>Automatically route all CEO approvals to the selected executive while you are away.</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select className="ceo-form-input" defaultValue="" onChange={() => setHasUnsavedChanges(true)} style={{ width: '200px' }}>
                        <option value="" disabled>Select Delegate...</option>
                        <option value="CFO">CFO (A. Patel)</option>
                        <option value="COO">COO (R. Sharma)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. SECURITY & ACCESS (RBAC) */}
          {activeCategory === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="ceo-command-header">
                <div className="ceo-typography-card-title"><ShieldAlert size={18} color="var(--ceo-primary)" /> Security & Role-Based Access Control</div>
                <button className="ceo-btn ceo-btn-primary" onClick={saveRbac} disabled={!hasUnsavedChanges || isSaving} style={{ padding: '6px 16px' }}>
                  {isSaving ? 'Saving...' : <><Save size={16}/> Save Changes</>}
                </button>
              </div>
              <div className="ceo-command-content" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                <div>
                  <div className="ceo-typography-section-title" style={{ fontSize: '13px', marginBottom: '16px' }}>GLOBAL SECURITY POLICIES</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    
                    <div style={{ border: '1px solid var(--ceo-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Enforce Two-Factor Authentication</div>
                        <div style={{ fontSize: '12px', color: 'var(--ceo-text-muted)' }}>Require 2FA for all active employees.</div>
                      </div>
                      <input type="checkbox" defaultChecked onChange={() => setHasUnsavedChanges(true)} style={{ width: '18px', height: '18px', accentColor: 'var(--ceo-primary)' }} />
                    </div>

                    <div style={{ border: '1px solid var(--ceo-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Data Retention Policy</div>
                        <div style={{ fontSize: '12px', color: 'var(--ceo-text-muted)' }}>Automatically purge logs after period.</div>
                      </div>
                      <select className="ceo-form-input" defaultValue="7Y" style={{ width: 'auto', padding: '4px 8px', height: '30px' }} onChange={() => setHasUnsavedChanges(true)}>
                        <option value="3Y">3 Years</option>
                        <option value="7Y">7 Years</option>
                        <option value="Forever">Indefinite</option>
                      </select>
                    </div>

                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--ceo-border)', paddingTop: '24px' }}>
                  <div className="ceo-typography-section-title" style={{ fontSize: '13px', marginBottom: '16px' }}>RBAC PERMISSION MATRIX</div>
                  <div style={{ border: '1px solid var(--ceo-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table className="ceo-erp-table" style={{ width: '100%', margin: 0 }}>
                      <thead style={{ background: '#F8FAFC' }}>
                        <tr>
                          <th style={{ width: '250px' }}>Module / Permission</th>
                          {ROLES.map(r => <th key={r} style={{ textAlign: 'center' }}>{r}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES.map(mod => (
                          <tr key={mod}>
                            <td style={{ fontWeight: 600, borderRight: '1px solid var(--ceo-border)' }}>{mod}</td>
                            {ROLES.map(role => {
                              const isChecked = rbacMatrix[mod][role];
                              const disabled = role === 'CEO' && (mod === 'View Salary' || mod === 'Export Data' || mod === 'View Audit Logs');
                              
                              return (
                                <td key={role} style={{ textAlign: 'center' }}>
                                  <button 
                                    onClick={() => !disabled && togglePermission(mod, role)}
                                    disabled={disabled}
                                    style={{ 
                                      width: '40px', height: '20px', borderRadius: '10px', 
                                      background: isChecked ? 'var(--ceo-success)' : 'var(--ceo-border)', 
                                      position: 'relative', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                                      opacity: disabled ? 0.5 : 1, transition: 'background 0.2s'
                                    }}
                                  >
                                    <div style={{ 
                                      width: '16px', height: '16px', borderRadius: '8px', 
                                      background: '#fff', position: 'absolute', top: '2px', 
                                      left: isChecked ? '22px' : '2px', transition: 'left 0.2s ease',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                    }}></div>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 3. AI & AUTOMATION */}
          {activeCategory === 'automation' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="ceo-command-header">
                <div className="ceo-typography-card-title"><Zap size={18} color="var(--ceo-primary)" /> AI & Automation Engine</div>
                <button className="ceo-btn ceo-btn-primary" onClick={saveRbac} disabled={!hasUnsavedChanges || isSaving} style={{ padding: '6px 16px' }}>
                  {isSaving ? 'Saving...' : <><Save size={16}/> Save Changes</>}
                </button>
              </div>
              <div className="ceo-command-content" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ border: '1px solid var(--ceo-border)', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ceo-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} /> Automated Insights & Summaries
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--ceo-text-muted)', marginTop: '4px', maxWidth: '600px', lineHeight: 1.5 }}>
                      Allow the AI engine to generate daily operational summaries, extract action items from Executive Chat, and highlight critical anomalies in Finance reports.
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked onChange={() => setHasUnsavedChanges(true)} style={{ width: '20px', height: '20px', accentColor: 'var(--ceo-primary)' }} />
                </div>

                <div style={{ border: '1px solid var(--ceo-border)', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Predictive Attrition Modeling (HR)
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--ceo-text-muted)', marginTop: '4px', maxWidth: '600px', lineHeight: 1.5 }}>
                      Analyze employee engagement and leave patterns to flag 'Flight Risk' employees to the CEO and HR managers before they resign.
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked onChange={() => setHasUnsavedChanges(true)} style={{ width: '20px', height: '20px', accentColor: 'var(--ceo-primary)' }} />
                </div>

                <div style={{ border: '1px solid var(--ceo-border)', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Auto-Escalate Stale Approvals
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--ceo-text-muted)', marginTop: '4px', maxWidth: '600px', lineHeight: 1.5 }}>
                      Automatically forward approvals to the next tier of leadership if untouched by the manager for more than 48 hours.
                    </div>
                  </div>
                  <input type="checkbox" onChange={() => setHasUnsavedChanges(true)} style={{ width: '20px', height: '20px', accentColor: 'var(--ceo-primary)' }} />
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
