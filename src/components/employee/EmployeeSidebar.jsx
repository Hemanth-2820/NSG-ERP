import { LayoutDashboard, CreditCard, User, UserMinus, HelpCircle, Briefcase, MessageSquare } from 'lucide-react';

export default function EmployeeSidebar({ activeTab, setActiveTab }) {
  const isDashboardActive = activeTab === 'dashboard';
  const isExpensesActive = activeTab === 'expenses';
  const isProfileActive = activeTab === 'profile';
  const isResignationActive = activeTab === 'resignation';
  const isHelpActive = activeTab === 'help';
  const isAssetsActive = activeTab === 'assets';
  const isMessagingActive = activeTab === 'messaging';

export default function EmployeeSidebar({ activeTab, setActiveTab }) {
  return (
    <div className="nav-group">
      <span className="nav-group-title">Staff Modules</span>
      
      {/* Dashboard Tab */}
      <button
        className={`nav-link ${isDashboardActive ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
        style={isDashboardActive ? {
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        } : {}}
      >
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </button>

      {/* Expenses Tab */}
      <button
        className={`nav-link ${isExpensesActive ? 'active' : ''}`}
        onClick={() => setActiveTab('expenses')}
        style={isExpensesActive ? {
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        } : {}}
      >
        <CreditCard size={18} />
        <span>Expenses</span>
      </button>

      {/* Profile Tab */}
      <button
        className={`nav-link ${isProfileActive ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
        style={isProfileActive ? {
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        } : {}}
      >
        <User size={18} />
        <span>Profile</span>
      </button>

      {/* Resignation Tab */}
      <button
        className={`nav-link ${isResignationActive ? 'active' : ''}`}
        onClick={() => setActiveTab('resignation')}
        style={isResignationActive ? {
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        } : {}}
      >
        <UserMinus size={18} />
        <span>Resignation</span>
      </button>

      {/* Help Tab */}
      <button
        className={`nav-link ${isHelpActive ? 'active' : ''}`}
        onClick={() => setActiveTab('help')}
        style={isHelpActive ? {
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        } : {}}
      >
        <HelpCircle size={18} />
        <span>Help</span>
      </button>

      {/* Asset Requests Tab */}
      <button
        className={`nav-link ${isAssetsActive ? 'active' : ''}`}
        onClick={() => setActiveTab('assets')}
        style={isAssetsActive ? {
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        } : {}}
      >
        <Briefcase size={18} />
        <span>Asset Requests</span>
      </button>

      {/* Messaging & Meet Tab */}
      <button
        className={`nav-link ${isMessagingActive ? 'active' : ''}`}
        onClick={() => setActiveTab('messaging')}
        style={isMessagingActive ? {
          color: '#10b981',
          borderLeftColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)'
        } : {}}
      >
        <MessageSquare size={18} />
        <span>Messaging & Meet</span>
      </button>
    </div>
  );
}