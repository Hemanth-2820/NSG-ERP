import React from 'react';

export default function Employee({ activeTab }) {
  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Employee Dashboard</h1>
          <p>Organize your day-to-day deliverables, submit your timecards, and review your benefits.</p>
        </div>
      </div>
      
      <div className="tab-pane" style={{ padding: '60px 40px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Staff Workspace Ready</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
          This is your clean Employee dashboard canvas. Developers can add task checklists, timecards, logging charts, and benefit summaries here.
        </p>
      </div>
    </div>
  );
}
