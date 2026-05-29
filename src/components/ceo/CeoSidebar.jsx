import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function CeoSidebar({ activeTab, setActiveTab }) {
  const isActive = activeTab === 'dashboard';

  return (
    <div className="nav-group">
      <span className="nav-group-title">CEO Modules</span>
      <button
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        style={isActive ? { 
          color: '#f59e0b',
          borderLeftColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.05)' 
        } : {}}
      >
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </button>
    </div>
  );
}

