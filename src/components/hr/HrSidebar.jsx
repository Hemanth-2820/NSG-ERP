import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function HrSidebar({ activeTab, setActiveTab }) {
  const isActive = activeTab === 'dashboard';

  return (
    <div className="nav-group">
      <span className="nav-group-title">HR Modules</span>
      <button
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        style={isActive ? {
          color: '#ec4899',
          borderLeftColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.05)'
        } : {}}
      >
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </button>
    </div>
  );
}

