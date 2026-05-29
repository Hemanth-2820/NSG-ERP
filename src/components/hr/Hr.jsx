import React from 'react';

export default function Hr({ activeTab }) {
  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>HR Dashboard</h1>
          <p>Manage talent procurement, organizational structure, employee benefits, and policy compliance.</p>
        </div>
      </div>

      <div className="tab-pane" style={{ padding: '60px 40px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Talent & Culture Workspace Ready</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
          This is your clean HR dashboard canvas. Developers can add candidate pipelines, employee directories, leave requests, and payroll modules here.
        </p>
      </div>
    </div>
  );
}
