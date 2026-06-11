import React, { useState, useEffect } from 'react';
import { AlertTriangle, UserPlus, LogOut, Briefcase } from 'lucide-react';

export function HrDashboardView() {
  const [metrics, setMetrics] = useState({
    probationEmployees: 0,
    pendingExits: 0,
    activeCandidates: 0,
    unresolvedGrievances: 0
  });
  const [probationList, setProbationList] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nsg_jwt_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch metrics
        const metricsRes = await fetch('/api/hr-portal/dashboard/metrics', { headers });
        if (metricsRes.ok) {
          const m = await metricsRes.json();
          setMetrics(m);
        }

        // Fetch employees for probation list
        const empRes = await fetch('/api/hr-portal/employees', { headers });
        if (empRes.ok) {
          const emps = await empRes.json();
          setProbationList(emps.filter(e => e.status === 'probation'));
        }

        // Fetch tickets for alerts list
        const ticketsRes = await fetch('/api/hr-portal/performance/disciplinary-tickets', { headers });
        if (ticketsRes.ok) {
          const tickets = await ticketsRes.json();
          setCriticalAlerts(tickets.filter(t => t.status === 'issued'));
        }
      } catch (err) {
        console.error('Failed to fetch HR dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>HR Management Command Center</h1>
          <p>Operational summary of talent lifecycles, onboarding SLAs, and compliance items.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
          <div className="card-header-flex">
            <span className="card-title">Probation / Onboardings</span>
            <div className="card-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-pink)' }}>
              <UserPlus size={18} />
            </div>
          </div>
          <span className="metric-value">{metrics.probationEmployees}</span>
          <span className="info-txt">Active new hires in checklist</span>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
          <div className="card-header-flex">
            <span className="card-title">Pending Exit Claims</span>
            <div className="card-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
              <LogOut size={18} />
            </div>
          </div>
          <span className="metric-value">{metrics.pendingExits}</span>
          <span className="info-txt">Resignations awaiting review</span>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <div className="card-header-flex">
            <span className="card-title">Open Job Pipelines</span>
            <div className="card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-gold)' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <span className="metric-value">{metrics.activeCandidates}</span>
          <span className="info-txt">Candidates in ATS screening</span>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="card-header-flex">
            <span className="card-title">Grievance Watchdog</span>
            <div className="card-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <span className="metric-value">{metrics.unresolvedGrievances}</span>
          <span className="info-txt">Warnings awaiting acknowledgment</span>
        </div>
      </div>

      <div className="dashboard-row-grid">
        {/* New Joiners Checklist */}
        <div className="content-card flex-2">
          <div className="card-header">
            <h3>New Joiners Checklist Progress</h3>
          </div>
          <div className="card-content-list">
            {probationList.map(joiner => (
              <div key={joiner.id} className="strategic-list-item">
                <div className="progress-ring-mini" style={{ backgroundColor: 'var(--accent-pink)' }}></div>
                <div className="item-text">
                  <h5>{joiner.name}</h5>
                  <p>{joiner.designation} — Joined {joiner.join_date}</p>
                </div>
                <span className="badge-pill warning">Onboarding Checklist Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Watchdog */}
        <div className="content-card flex-1">
          <div className="card-header">
            <h3 style={{ color: '#ef4444' }}>⚠️ SLA Watchdog Alerts</h3>
          </div>
          <div className="card-content-list">
            {criticalAlerts.map(t => {
              return (
                <div key={t.id} className="strategic-list-item" style={{ borderLeft: '3px solid #ef4444', paddingLeft: '8px' }}>
                  <div className="item-text">
                    <h5 style={{ color: 'var(--text-primary)' }}>{t.violation_type?.toUpperCase() || 'CONDUCT'} Warning</h5>
                    <p>Employee ID: {t.employee_id} — Pending response</p>
                  </div>
                  <span className="badge-pill danger">Critical</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
