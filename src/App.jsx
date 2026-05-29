import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Ceo from './components/ceo/Ceo';
import Hr from './components/hr/Hr';
import Tl from './components/tl/Tl';
import Employee from './components/employee/Employee';
import './index.css';

export default function App() {
  const [activeRole, setActiveRole] = useState('CEO');
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeRole) {
      case 'CEO':
        return <Ceo activeTab={activeTab} />;
      case 'HR':
        return <Hr activeTab={activeTab} />;
      case 'TL':
        return <Tl activeTab={activeTab} />;
      case 'Employee':
        return <Employee activeTab={activeTab} />;
      default:
        return <Ceo activeTab={activeTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <Sidebar 
        activeRole={activeRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Panel Viewport */}
      <main className="main-content">
        {/* Header Navigation */}
        <Navbar 
          activeRole={activeRole} 
          setActiveRole={(role) => {
            setActiveRole(role);
            setActiveTab('dashboard'); // Reset tab on role switch
          }} 
        />

        {/* Dynamic Inner Layout Body */}
        {renderActiveComponent()}
      </main>
    </div>
  );
}
