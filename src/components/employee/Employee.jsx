import Expenses from './Expenses';
import Profile from './Profile';
import Resignation from './Resignation';
import Help from './Help';
import Assets from './Assets';
import Messaging from './Messaging';
import Attendance from './Attendance';
import Timesheet from './Timesheet';
import Tasks from './Tasks';
import Leave from './Leave';
import Payroll from './Payroll';
import Learning from './Learning';
import EmployeeDashboard from './EmployeeDashboard';

export default function Employee({ activeTab, navigateTo, currentUser }) {
  // Helper: switch to an employee tab
  const setActiveTab = (tab) => {
    if (navigateTo) navigateTo('Employee', tab);
    else window.location.hash = `#/Employee/${tab}`;
  };

  if (activeTab === 'dashboard') {
    return <EmployeeDashboard setActiveTab={setActiveTab} currentUser={currentUser} />;
  }

  if (activeTab === 'attendance') {
    return <Attendance currentUser={currentUser} />;
  }

  if (activeTab === 'timesheet') {
    return <Timesheet currentUser={currentUser} />;
  }

  if (activeTab === 'tasks') {
    return <Tasks currentUser={currentUser} />;
  }

  if (activeTab === 'leave') {
    return <Leave currentUser={currentUser} />;
  }

  if (activeTab === 'payroll') {
    return <Payroll currentUser={currentUser} />;
  }

  if (activeTab === 'expenses') {
    return <Expenses currentUser={currentUser} />;
  }

  if (activeTab === 'profile') {
    return <Profile currentUser={currentUser} />;
  }

  if (activeTab === 'resignation') {
    return <Resignation currentUser={currentUser} />;
  }

  if (activeTab === 'help') {
    return <Help currentUser={currentUser} />;
  }

  if (activeTab === 'assets') {
    return <Assets currentUser={currentUser} />;
  }

  if (activeTab === 'messaging') {
    return <Messaging currentUser={currentUser} />;
  }

  if (activeTab === 'learning') {
    return <Learning currentUser={currentUser} />;
  }

  // Fallback: show dashboard
  return <EmployeeDashboard setActiveTab={setActiveTab} currentUser={currentUser} />;
}