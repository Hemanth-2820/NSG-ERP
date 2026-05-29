import React from 'react';

export default function Tl({ activeTab }) {
  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Team Lead Dashboard</h1>
          <p>Supervise scrum pipelines, sprint reviews, team workloads, and software build timelines.</p>
        </div>
      </div>
      
      <div className="tab-pane" style={{ padding: '60px 40px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Sprint Engineering Workspace Ready</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>
          This is your clean Team Lead dashboard canvas. Developers can add Kanban boards, sprint charts, code reviews, and milestone timelines here.
        </p>
      </div>
    </div>
  );
}
