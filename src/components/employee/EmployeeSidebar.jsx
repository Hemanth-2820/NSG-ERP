import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function EmployeeSidebar({ activeTab, setActiveTab }) {
  const isActive = activeTab === 'dashboard';

  return (
    <div className="nav-group">
      <span className="nav-group-title">Staff Modules</span>
      <button
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        style={isActive ? { 
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)' 
        } : {}}
      >
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </button>
    </div>
  );
}

