import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown, Check, Shield, Briefcase, Award, Users } from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole }) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles = [
    { id: 'CEO', label: 'Chief Executive Officer', icon: Shield, color: '#f59e0b', desc: 'Full system oversight' },
    { id: 'HR', label: 'HR Manager', icon: Users, color: '#ec4899', desc: 'Talent & recruitment' },
    { id: 'TL', label: 'Team Lead', icon: Award, color: '#3b82f6', desc: 'Projects & delivery' },
    { id: 'Employee', label: 'Staff Member', icon: Briefcase, color: '#10b981', desc: 'Personal workspace' },
  ];

  const notifications = [
    { id: 1, title: 'Quarterly financial report ready', time: '10m ago', unread: true },
    { id: 2, title: 'New candidate applied for Senior React Developer', time: '1h ago', unread: true },
    { id: 3, title: 'Sprint retrospective scheduled', time: '3h ago', unread: false },
  ];

  const activeRoleDetails = roles.find((r) => r.id === activeRole) || roles[0];
  const RoleIcon = activeRoleDetails.icon;

  return (
    <header className="app-navbar">
      {/* Search Bar */}
      <div className="navbar-left">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search resources, files, and users..." className="search-input" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-right">
        {/* Notifications */}
        <div className="nav-action-wrapper">
          <button 
            className={`nav-icon-button ${showNotifications ? 'active' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleDropdown(false);
            }}
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="nav-dropdown notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <span className="mark-read">Mark all read</span>
              </div>
              <div className="dropdown-list">
                {notifications.map((item) => (
                  <div key={item.id} className={`dropdown-item ${item.unread ? 'unread' : ''}`}>
                    <div className="dot"></div>
                    <div className="item-content">
                      <p className="item-title">{item.title}</p>
                      <span className="item-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="nav-divider"></div>

        {/* User / Role Dropdown Selector */}
        <div className="role-selector-wrapper">
          <button 
            className="role-selector-btn"
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowNotifications(false);
            }}
          >
            <div className="role-avatar" style={{ backgroundColor: activeRoleDetails.color }}>
              <RoleIcon size={18} color="#fff" />
            </div>
            <div className="role-info">
              <span className="user-name">Sarah Jenkins</span>
              <span className="user-role" style={{ color: activeRoleDetails.color }}>
                {activeRoleDetails.label}
              </span>
            </div>
            <ChevronDown size={16} className={`chevron-icon ${showRoleDropdown ? 'rotate' : ''}`} />
          </button>

          {showRoleDropdown && (
            <div className="nav-dropdown role-dropdown">
              <div className="dropdown-header">
                <h3>Switch Account Role</h3>
              </div>
              <div className="dropdown-list">
                {roles.map((roleOption) => {
                  const Icon = roleOption.icon;
                  const isSelected = roleOption.id === activeRole;
                  return (
                    <button
                      key={roleOption.id}
                      className={`dropdown-itemrole ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setActiveRole(roleOption.id);
                        setShowRoleDropdown(false);
                      }}
                    >
                      <div className="itemrole-icon" style={{ backgroundColor: `${roleOption.color}15`, color: roleOption.color }}>
                        <Icon size={18} />
                      </div>
                      <div className="itemrole-text">
                        <span className="itemrole-label">{roleOption.label}</span>
                        <span className="itemrole-desc">{roleOption.desc}</span>
                      </div>
                      {isSelected && <Check size={16} className="itemrole-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
