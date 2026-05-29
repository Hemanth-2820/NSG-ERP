import React from 'react';
import { 
  Shield, Users, Award, Briefcase, 
  Settings, LogOut
} from 'lucide-react';
import CeoSidebar from '../ceo/CeoSidebar';
import HrSidebar from '../hr/HrSidebar';
import TlSidebar from '../tl/TlSidebar';
import EmployeeSidebar from '../employee/EmployeeSidebar';

export default function Sidebar({ activeRole, activeTab, setActiveTab }) {
  const currentRoleColor = {
    CEO: '#f59e0b',
    HR: '#ec4899',
    TL: '#3b82f6',
    Employee: '#10b981',
  }[activeRole];

  const roleLabel = {
    CEO: 'CEO Suite',
    HR: 'HR Portal',
    TL: 'Team Lead',
    Employee: 'Staff Portal',
  }[activeRole];

  const roleLogoColor = {
    CEO: 'rgba(245, 158, 11, 0.1)',
    HR: 'rgba(236, 72, 153, 0.1)',
    TL: 'rgba(59, 130, 246, 0.1)',
    Employee: 'rgba(16, 185, 129, 0.1)',
  }[activeRole];

  const roleIcon = {
    CEO: Shield,
    HR: Users,
    TL: Award,
    Employee: Briefcase,
  }[activeRole];

  const RoleIconComponent = roleIcon;

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ backgroundColor: roleLogoColor, color: currentRoleColor }}>
          <RoleIconComponent size={24} />
        </div>
        <div className="brand-text">
          <h2>NSG ERP</h2>
          <span style={{ color: currentRoleColor }}>{roleLabel}</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {/* Dynamic Folder-Specific Sidebars */}
        {activeRole === 'CEO' && <CeoSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
        {activeRole === 'HR' && <HrSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
        {activeRole === 'TL' && <TlSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
        {activeRole === 'Employee' && <EmployeeSidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
      </nav>

      {/* Footer Settings & Actions */}
      <div className="sidebar-footer">
        <button className="nav-link footer-link">
          <Settings size={18} />
          <span>System Settings</span>
        </button>
        <button className="nav-link footer-link logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}



