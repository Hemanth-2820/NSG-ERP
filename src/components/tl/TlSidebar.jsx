import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function TlSidebar({ activeTab, setActiveTab }) {
  const isActive = activeTab === 'dashboard';

  return (
    <div className="nav-group">
      <span className="nav-group-title">TL Modules</span>
      <button
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        style={isActive ? { 
          color: '#3b82f6',
          borderLeftColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)' 
        } : {}}
      >
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </button>
    </div>
  );
}

