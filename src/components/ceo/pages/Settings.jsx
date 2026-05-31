import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Shield, Users, Key, Bell, 
  List, Link2, Database, Save, Activity, Download
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const menuItems = [
  { id: 'general', label: 'General Configuration', icon: <SettingsIcon size={16} /> },
  { id: 'security', label: 'Security & Access', icon: <Shield size={16} /> },
  { id: 'users', label: 'User Provisioning', icon: <Users size={16} /> },
  { id: 'perms', label: 'Role Permissions', icon: <Key size={16} /> },
  { id: 'notifs', label: 'System Notifications', icon: <Bell size={16} /> },
  { id: 'audit', label: 'Compliance Audit Logs', icon: <List size={16} /> },
  { id: 'integrations', label: 'ERP Integrations', icon: <Link2 size={16} /> },
  { id: 'backups', label: 'Data & Backups', icon: <Database size={16} /> },
];

const auditLogs = [
  { id: 'AUD-091', action: 'User Permissions Modified', user: 'System Admin', timestamp: 'Oct 14, 2023 14:32:01', ip: '192.168.1.45', status: 'Success' },
  { id: 'AUD-090', action: 'Failed Login Attempt', user: 'unknown@nsg-erp.com', timestamp: 'Oct 14, 2023 11:15:22', ip: '203.0.113.42', status: 'Failed' },
  { id: 'AUD-089', action: 'Database Backup Completed', user: 'System Task', timestamp: 'Oct 14, 2023 03:00:00', ip: 'localhost', status: 'Success' },
  { id: 'AUD-088', action: 'API Key Generated', user: 'Vivek C. (CEO)', timestamp: 'Oct 13, 2023 16:45:10', ip: '10.0.0.15', status: 'Success' },
];

export default function Settings() {
  const [activeMenu, setActiveMenu] = useState('general');

  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Enterprise System Configuration</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Manage security, access controls, system integrations, and compliance logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="ceo-btn"><Activity size={16} /> System Health</button>
          <button className="ceo-btn ceo-btn-primary"><Save size={16} /> Save Changes</button>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT */}
      <div className="ceo-split-layout">
        
        {/* LEFT COLUMN - NAV */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="ceo-command-panel">
            <div className="ceo-command-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {menuItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveMenu(item.id)}
                  style={{
                    padding: '12px 16px', borderRadius: 'var(--ceo-radius-btn)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: activeMenu === item.id ? 'var(--ceo-hover)' : 'transparent',
                    color: activeMenu === item.id ? 'var(--ceo-primary)' : 'var(--ceo-text-secondary)',
                    fontWeight: activeMenu === item.id ? 600 : 500,
                    borderLeft: activeMenu === item.id ? '3px solid var(--ceo-primary)' : '3px solid transparent'
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeMenu === 'general' && (
            <div className="ceo-command-panel">
              <div className="ceo-command-header">
                <div className="ceo-typography-card-title"><SettingsIcon size={18} color="var(--ceo-primary)" /> General Enterprise Settings</div>
              </div>
              <div className="ceo-command-content" style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px' }}>
                  <div className="ceo-form-group">
                    <label>Enterprise Instance Name</label>
                    <input type="text" className="ceo-form-input" defaultValue="NSG Global ERP - Prod" />
                  </div>
                  <div className="ceo-form-group">
                    <label>Primary Domain</label>
                    <input type="text" className="ceo-form-input" defaultValue="erp.nsg-global.com" disabled style={{ background: 'var(--ceo-bg)' }} />
                  </div>
                  <div className="ceo-form-group">
                    <label>System Timezone</label>
                    <select className="ceo-form-input" defaultValue="UTC">
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="IST">IST (Indian Standard Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                    </select>
                  </div>
                  <div className="ceo-form-group">
                    <label>Default Currency</label>
                    <select className="ceo-form-input" defaultValue="INR">
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'audit' && (
            <div className="ceo-command-panel">
              <div className="ceo-command-header">
                <div className="ceo-typography-card-title"><List size={18} color="var(--ceo-primary)" /> Security & Compliance Audit Logs</div>
                <button className="ceo-btn" style={{ padding: '6px 12px', fontSize: '12px' }}><Download size={14} /> Export CSV</button>
              </div>
              <div className="ceo-erp-table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                <table className="ceo-erp-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>Action</th>
                      <th>User / Actor</th>
                      <th>IP Address</th>
                      <th>Timestamp (UTC)</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'monospace' }} className="ceo-typography-meta">{log.id}</td>
                        <td style={{ fontWeight: 600 }}>{log.action}</td>
                        <td>{log.user}</td>
                        <td style={{ fontFamily: 'monospace' }} className="ceo-typography-meta">{log.ip}</td>
                        <td className="ceo-typography-meta">{log.timestamp}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`ceo-badge ${log.status === 'Success' ? 'success' : 'critical'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu !== 'general' && activeMenu !== 'audit' && (
            <div className="ceo-command-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <SettingsIcon size={48} color="var(--ceo-border)" style={{ margin: '0 auto 16px auto' }} />
                <h3 className="ceo-typography-card-title" style={{ justifyContent: 'center', marginBottom: '8px' }}>Configuration Module Ready</h3>
                <p className="ceo-typography-body">The {menuItems.find(m => m.id === activeMenu)?.label} module is connected to the master database.</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
