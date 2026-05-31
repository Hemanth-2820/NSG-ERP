import React, { useState } from 'react';
import { 
  Building, Settings, Plus, MapPin, Briefcase, 
  Shield, Layers, Link as LinkIcon, Edit2, ChevronRight, ChevronDown, CheckCircle
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const orgTree = [
  { id: 1, name: "NSG Global Holdings", type: "Parent Enterprise", children: [
    { id: 2, name: "NSG North America", type: "Regional HQ", children: [
      { id: 4, name: "Operations Dept", type: "Department", empCount: 142 },
      { id: 5, name: "Sales Dept", type: "Department", empCount: 84 },
    ]},
    { id: 3, name: "NSG APAC", type: "Regional HQ", children: [
      { id: 6, name: "Engineering Center", type: "Cost Center", empCount: 450 },
    ]}
  ]}
];

// ==========================================
// COMPONENT
// ==========================================
export default function CompanySetup() {
  const [activeMenu, setActiveMenu] = useState('organization');

  const menuItems = [
    { id: 'organization', label: 'Organization Structure', icon: <Layers size={16} /> },
    { id: 'departments', label: 'Departments & Units', icon: <Briefcase size={16} /> },
    { id: 'locations', label: 'Global Locations', icon: <MapPin size={16} /> },
    { id: 'roles', label: 'Executive Roles', icon: <Building size={16} /> },
    { id: 'policies', label: 'Corporate Policies', icon: <Shield size={16} /> },
    { id: 'branding', label: 'Enterprise Branding', icon: <Settings size={16} /> },
    { id: 'integrations', label: 'System Integrations', icon: <LinkIcon size={16} /> },
  ];

  const renderTreeNode = (node, depth = 0) => {
    return (
      <div key={node.id} style={{ marginLeft: depth * 24 + 'px', marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
          background: 'var(--ceo-card-bg)', border: '1px solid var(--ceo-border)', 
          borderRadius: 'var(--ceo-radius-btn)', cursor: 'pointer', transition: 'all 0.2s ease'
        }} className="hover-node">
          {node.children ? <ChevronDown size={16} color="var(--ceo-text-muted)" /> : <ChevronRight size={16} color="var(--ceo-text-muted)" />}
          <Building size={16} color="var(--ceo-primary)" />
          <div style={{ flex: 1 }}>
            <div className="ceo-typography-body" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>{node.name}</div>
            <div className="ceo-typography-meta">{node.type} {node.empCount ? `• ${node.empCount} Employees` : ''}</div>
          </div>
          <button className="ceo-btn" style={{ padding: '6px', border: 'none', background: 'transparent' }}><Edit2 size={14} color="var(--ceo-text-muted)" /></button>
        </div>
        {node.children && (
          <div style={{ borderLeft: '2px solid var(--ceo-border)', marginLeft: '12px', marginTop: '8px', paddingLeft: '12px' }}>
            {node.children.map(child => renderTreeNode(child, 0))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ceo-layout-grid">
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Enterprise Operating System</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Core organizational architecture and corporate entity management.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="ceo-btn ceo-btn-primary"><Plus size={16} /> Add Entity</button>
        </div>
      </div>

      <div className="ceo-split-layout">
        
        {/* LEFT NAV */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1 }}>
          
          {activeMenu === 'organization' && (
            <div className="ceo-layout-grid">
              <div className="ceo-command-panel">
                <div className="ceo-command-header">
                  <div className="ceo-typography-card-title"><Layers size={18} color="var(--ceo-primary)" /> Corporate Hierarchy</div>
                  <button className="ceo-btn"><Plus size={14} /> New Subsidiary</button>
                </div>
                <div className="ceo-command-content" style={{ padding: '32px' }}>
                  {orgTree.map(node => renderTreeNode(node))}
                </div>
              </div>

              <div className="ceo-command-panel">
                <div className="ceo-command-header">
                  <div className="ceo-typography-card-title"><Building size={18} color="var(--ceo-primary)" /> Parent Entity Configuration</div>
                </div>
                <div className="ceo-command-content">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="ceo-form-group">
                      <label>Legal Entity Name</label>
                      <input type="text" className="ceo-form-input" defaultValue="NSG Global Holdings Ltd." />
                    </div>
                    <div className="ceo-form-group">
                      <label>Registration Number</label>
                      <input type="text" className="ceo-form-input" defaultValue="CIN-U72200TG2020PTC145678" />
                    </div>
                    <div className="ceo-form-group">
                      <label>Tax Identification (GSTIN)</label>
                      <input type="text" className="ceo-form-input" defaultValue="36AADCN8794F1Z8" />
                    </div>
                    <div className="ceo-form-group">
                      <label>Base Currency</label>
                      <select className="ceo-form-input" defaultValue="INR">
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--ceo-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="ceo-btn ceo-btn-primary"><CheckCircle size={16} /> Save Master Config</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu !== 'organization' && (
            <div className="ceo-command-panel" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Settings size={48} color="var(--ceo-border)" style={{ margin: '0 auto 16px auto' }} />
                <h3 className="ceo-typography-card-title" style={{ justifyContent: 'center', marginBottom: '8px' }}>Module Configured</h3>
                <p className="ceo-typography-body">The {menuItems.find(m => m.id === activeMenu)?.label} module is active and synced with ERP backend.</p>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}
