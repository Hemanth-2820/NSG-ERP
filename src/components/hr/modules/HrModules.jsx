import React, { useState } from 'react';
import { 
  Users, CheckCircle, AlertTriangle, UserPlus, Calendar, Plus, Mail,
  Search, ShieldAlert, Award, FileText, Ban, Trash2, ArrowRight,
  TrendingUp, Download, Eye, FileCheck, Check, Clock, ShieldCheck,
  Play, Lock, Unlock, RefreshCw, Send, Video, MessageSquare,
  LogOut, Briefcase
} from 'lucide-react';
import { HOLIDAYS, LEAVE_POLICIES } from '../mockData';

// ==========================================
// 1. HR DASHBOARD VIEW
// ==========================================
export function HrDashboardView({ db, onUpdateDb }) {
  const openOnboardings = db.employees.filter(e => e.status === 'probation').length;
  const pendingExits = db.resignations ? db.resignations.filter(r => r.status === 'pending').length : 1;
  const activeRecruitments = db.candidates.filter(c => c.stage !== 'joined' && c.stage !== 'rejected').length;
  const unresolvedGrievances = db.disciplinaryTickets ? db.disciplinaryTickets.filter(t => t.status === 'issued').length : 2;

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
          <span className="metric-value">{openOnboardings}</span>
          <span className="info-txt">Active new hires in checklist</span>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
          <div className="card-header-flex">
            <span className="card-title">Pending Exit Claims</span>
            <div className="card-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
              <LogOut size={18} />
            </div>
          </div>
          <span className="metric-value">{pendingExits}</span>
          <span className="info-txt">Resignations awaiting review</span>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <div className="card-header-flex">
            <span className="card-title">Open Job Pipelines</span>
            <div className="card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-gold)' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <span className="metric-value">{activeRecruitments}</span>
          <span className="info-txt">Candidates in ATS screening</span>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="card-header-flex">
            <span className="card-title">Grievance Watchdog</span>
            <div className="card-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <span className="metric-value">{unresolvedGrievances}</span>
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
            {db.employees.filter(e => e.status === 'probation').map(joiner => (
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
            {db.disciplinaryTickets.filter(t => t.status === 'issued').map(t => {
              const emp = db.employees.find(e => e.id === t.employee_id) || { name: 'Unknown' };
              return (
                <div key={t.id} className="strategic-list-item" style={{ borderLeft: '3px solid #ef4444', paddingLeft: '8px' }}>
                  <div className="item-text">
                    <h5 style={{ color: 'var(--text-primary)' }}>{t.violation_type.toUpperCase()} Warning</h5>
                    <p>Target: {emp.name} — Pending response</p>
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

// ==========================================
// 2. RECRUITMENT & ATS VIEW
// ==========================================
export function RecruitmentView({ db, onUpdateDb }) {
  const [showScheduler, setShowScheduler] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Offer Form States
  const [basicPay, setBasicPay] = useState(30000);
  const [hra, setHra] = useState(12000);
  const [allowance, setAllowance] = useState(8000);

  const stages = [
    { id: 'applied', label: 'Applied' },
    { id: 'screening', label: 'Screening' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'joined', label: 'Joined' }
  ];

  const handleMoveStage = (id, newStage) => {
    const updated = db.candidates.map(c => {
      if (c.id === id) {
        return { ...c, stage: newStage };
      }
      return c;
    });
    
    // Auto convert to employee if marked joined
    if (newStage === 'joined') {
      const cand = db.candidates.find(c => c.id === id);
      const exists = db.employees.some(e => e.email === cand.email);
      if (!exists) {
        const newEmp = {
          id: Date.now(),
          emp_id: `NSG-0${db.employees.length + 101}`,
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          department: 'Engineering',
          designation: cand.role,
          status: 'probation',
          join_date: new Date().toISOString().split('T')[0],
          probation_end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          bank_name: 'HDFC Bank',
          account_number: '50100' + Math.floor(100000000 + Math.random() * 900000000),
          ifsc_code: 'HDFC0000012',
          grade: 3,
          manager: 'John Doe',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80'
        };
        const newLogs = [...db.auditLogs, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          initiator_id: 'Sarah Jenkins',
          module: 'Recruitment',
          record_id: newEmp.id,
          action_type: 'create',
          change_diff: { converted_employee: newEmp.name },
          ip_address: '192.168.1.104',
          client_agent: 'Chrome / Windows'
        }];
        onUpdateDb({
          ...db,
          candidates: updated,
          employees: [...db.employees, newEmp],
          auditLogs: newLogs
        });
        alert(`Candidate ${cand.name} converted to Employee! An onboarding checklist has been automatically assigned.`);
        return;
      }
    }
    
    onUpdateDb({ ...db, candidates: updated });
  };

  const handleScheduleInterview = (e) => {
    e.preventDefault();
    alert('Interview scheduled successfully! WebRTC Guest video meeting link dispatched to candidate.');
    setShowScheduler(false);
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    alert('Offer letter generated and sent to candidate via e-sign channel.');
    setShowOfferForm(false);
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Recruitment & ATS Board</h1>
          <p>Source candidates, coordinate tech screens, schedule video interviews, and release offer structures.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="strategic-list-item" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowScheduler(true)}>
            <Calendar size={16} /> Schedule Interview
          </button>
        </div>
      </div>

      {/* ATS board grids */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
        {stages.map(st => (
          <div key={st.id} style={{ flex: 1, minWidth: '220px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{st.label}</span>
              <span className="badge-pill bg-pink">{db.candidates.filter(c => c.stage === st.id).length}</span>
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {db.candidates.filter(c => c.stage === st.id).map(cand => (
                <div key={cand.id} className="metric-card" style={{ padding: '14px', gap: '8px', borderLeft: '3px solid var(--accent-pink)' }}>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{cand.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cand.role}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {st.id !== 'joined' && (
                      <button style={{ background: 'none', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => {
                        const nextStage = stages[stages.findIndex(s => s.id === st.id) + 1]?.id;
                        if (nextStage) handleMoveStage(cand.id, nextStage);
                      }}>
                        Move <ArrowRight size={10} />
                      </button>
                    )}
                    {st.id === 'interview' && (
                      <button style={{ background: 'none', border: '1px solid var(--accent-pink)', color: 'var(--accent-pink)', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px', fontSize: '10px' }} onClick={() => {
                        setSelectedCandidate(cand);
                        setShowOfferForm(true);
                      }}>
                        CTC Offer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Popups Scheduler */}
      {showScheduler && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleScheduleInterview} className="card" style={{ width: '400px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3>📅 Schedule Video Interview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <label style={{ fontSize: '12px' }}>Candidate Name</label>
              <input type="text" placeholder="John Doe" required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
              
              <label style={{ fontSize: '12px' }}>Role</label>
              <input type="text" placeholder="Senior Architect" required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Interviewer (TL)</label>
              <select style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option>John Doe (Engineering Lead)</option>
                <option>Vikram Sen (Sales Director)</option>
              </select>

              <label style={{ fontSize: '12px' }}>Scheduled Date & Time</label>
              <input type="datetime-local" required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowScheduler(false)}>Cancel</button>
              <button type="submit" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Schedule</button>
            </div>
          </form>
        </div>
      )}

      {/* Popups Offer Forms */}
      {showOfferForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateOffer} className="card" style={{ width: '420px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3>📄 Propose CTC Offer Structure</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <label style={{ fontSize: '12px' }}>Basic Salary (Monthly)</label>
              <input type="number" value={basicPay} onChange={(e) => setBasicPay(Number(e.target.value))} required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
              
              <label style={{ fontSize: '12px' }}>HRA (Monthly)</label>
              <input type="number" value={hra} onChange={(e) => setHra(Number(e.target.value))} required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Special Allowance (Monthly)</label>
              <input type="number" value={allowance} onChange={(e) => setAllowance(Number(e.target.value))} required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Simulated EPF Contribution (12% Basic):</span>
                  <strong>₹{Math.floor(basicPay * 0.12)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginTop: '8px', color: 'var(--accent-pink)' }}>
                  <span>Gross Monthly CTC:</span>
                  <span>₹{basicPay + hra + allowance}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowOfferForm(false)}>Cancel</button>
              <button type="submit" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Generate Offer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. EMPLOYEE REGISTRY VIEW
// ==========================================
export function EmployeeRegistryView({ db, onUpdateDb }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [profileTab, setProfileTab] = useState('info'); // info | docs | probation | attendance | payroll
  const [revealBank, setRevealBank] = useState(false);
  const [scanningDoc, setScanningDoc] = useState(null); // type of doc being scanned

  // New Employee Form States
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState('Developer');

  const filtered = db.employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.emp_id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleExportCSV = () => {
    let csv = 'Employee ID,Name,Email,Department,Designation,Status,Join Date\n';
    filtered.forEach(e => {
      csv += `${e.emp_id},${e.name},${e.email},${e.department},${e.designation},${e.status},${e.join_date}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `NSG_Employee_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    
    // Log csv export to audit
    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Employees',
      record_id: 0,
      action_type: 'verify_doc', // Export action
      change_diff: { export_action: 'Employee Registry CSV Exported', row_count: filtered.length },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];
    onUpdateDb({ ...db, auditLogs: newLogs });
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const newEmp = {
      id: Date.now(),
      emp_id: `NSG-0${db.employees.length + 101}`,
      name: newName,
      email: newEmail,
      phone: '+91 99887 76655',
      department: newDept,
      designation: newRole,
      status: 'probation',
      join_date: new Date().toISOString().split('T')[0],
      probation_end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bank_name: 'HDFC Bank',
      account_number: '50100' + Math.floor(100000000 + Math.random() * 900000000),
      ifsc_code: 'HDFC0000012',
      grade: 3,
      manager: 'John Doe',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80',
      documents: [
        { type: 'Aadhaar Card', name: 'aadhaar_verify.pdf', status: 'verified', date: new Date().toISOString().split('T')[0] },
        { type: 'Degree Certificate', name: 'bachelors_degree.pdf', status: 'pending', date: new Date().toISOString().split('T')[0] }
      ]
    };
    
    // Add default training progress for the employee
    const newProgress = [...(db.trainingProgress || []), {
      id: Date.now() + 1,
      employee_id: newEmp.id,
      track_id: 1,
      completed_modules: 0,
      quiz_score: 0,
      passed: false
    }];

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Employees',
      record_id: newEmp.id,
      action_type: 'create',
      change_diff: { created_employee: newEmp.name, assigned_role: newEmp.designation },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    // Also auto initialize onboarding tasks for them
    const newOnboardingTasks = [
      { id: Date.now() + 10, instance_id: newEmp.id, task_name: 'Workstation Setup & Laptop Provisioning', assigned_to: 'IT', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_mandatory: true, requires_esign: false, completed_at: null, status: 'pending' },
      { id: Date.now() + 11, instance_id: newEmp.id, task_name: 'Provision System Logins & Email', assigned_to: 'IT', due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_mandatory: true, requires_esign: false, completed_at: null, status: 'pending' },
      { id: Date.now() + 12, instance_id: newEmp.id, task_name: 'Mandatory NDA Policy E-Sign', assigned_to: 'Employee', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_mandatory: true, requires_esign: true, completed_at: null, status: 'pending' },
      { id: Date.now() + 13, instance_id: newEmp.id, task_name: 'Complete Compliance Induction Quiz', assigned_to: 'Employee', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_mandatory: true, requires_esign: false, completed_at: null, status: 'pending' },
      { id: Date.now() + 14, instance_id: newEmp.id, task_name: 'Welcome Kit & Access Badge Handover', assigned_to: 'HR', due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], is_mandatory: false, requires_esign: false, completed_at: null, status: 'pending' }
    ];

    onUpdateDb({
      ...db,
      employees: [...db.employees, newEmp],
      trainingProgress: newProgress,
      onboardingTasks: [...(db.onboardingTasks || []), ...newOnboardingTasks],
      auditLogs: newLogs
    });

    setNewName('');
    setNewEmail('');
    setShowAddWizard(false);
    alert(`Employee ${newEmp.name} successfully added! Onboarding checklists & mandatory compliance tracks initialized.`);
  };

  const handleConfirmProbation = (id) => {
    // Prerequisite checks: Learning and L&D compliance
    const progress = db.trainingProgress?.find(p => p.employee_id === id) || { passed: false };
    if (!progress.passed) {
      alert('WARNING: Lock Prerequisite Engaged! Employee has not finished/passed mandatory L&D Inductions. Probation confirmation blocked.');
      return;
    }

    const updated = db.employees.map(e => {
      if (e.id === id) {
        return { ...e, status: 'active' };
      }
      return e;
    });

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Employees',
      record_id: id,
      action_type: 'verify_doc',
      change_diff: { probation_status: 'confirmed_active', verified_prerequisite: 'L&D Quiz passed' },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      employees: updated,
      auditLogs: newLogs
    });

    if (selectedEmp) {
      setSelectedEmp({ ...selectedEmp, status: 'active' });
    }
    alert('Employee probation confirmed! Status set to Fully Active.');
  };

  const handleExtendProbation = (id) => {
    const updated = db.employees.map(e => {
      if (e.id === id) {
        const currentEnd = new Date(e.probation_end_date);
        const extendedEnd = new Date(currentEnd.getTime() + 90 * 24 * 60 * 60 * 1000);
        return {
          ...e,
          probation_end_date: extendedEnd.toISOString().split('T')[0]
        };
      }
      return e;
    });

    const target = db.employees.find(e => e.id === id);
    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Employees',
      record_id: id,
      action_type: 'verify_doc',
      change_diff: { probation_status: 'extended_90_days', new_probation_end: new Date(new Date(target.probation_end_date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      employees: updated,
      auditLogs: newLogs
    });

    const updatedEmp = updated.find(e => e.id === id);
    setSelectedEmp(updatedEmp);
    alert(`Probation successfully extended by 90 days. New end date: ${updatedEmp.probation_end_date}`);
  };

  const handleTerminateProbation = (id) => {
    if (!confirm('Are you sure you want to terminate this employee during probation? This will update their status to inactive immediately.')) return;

    const updated = db.employees.map(e => {
      if (e.id === id) {
        return { ...e, status: 'inactive' };
      }
      return e;
    });

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Employees',
      record_id: id,
      action_type: 'verify_doc',
      change_diff: { employment_status: 'terminated_in_probation' },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      employees: updated,
      auditLogs: newLogs
    });

    const updatedEmp = updated.find(e => e.id === id);
    setSelectedEmp(updatedEmp);
    alert('Employment terminated. Employee status marked as Inactive.');
  };

  const handleRevealBankDetails = (emp) => {
    setRevealBank(true);
    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Employees',
      record_id: emp.id,
      action_type: 'verify_doc', // monospaced audit trails action
      change_diff: { revealed_sensitive_data: `Bank account of ${emp.name} was revealed` },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];
    onUpdateDb({
      ...db,
      auditLogs: newLogs
    });
  };

  const handleUploadDocument = (docType) => {
    setScanningDoc(docType);
    setTimeout(() => {
      // simulated malware scan complete in 1.5s
      const currentDocs = selectedEmp.documents || [
        { type: 'Aadhaar Card', name: 'aadhaar_verify.pdf', status: 'verified', date: '2026-05-20' },
        { type: 'Degree Certificate', name: 'bachelors_degree.pdf', status: 'pending', date: '2026-05-22' }
      ];
      const updatedDocs = [
        ...currentDocs.filter(d => d.type !== docType),
        { type: docType, name: `${docType.toLowerCase().replace(/ /g, '_')}_upload.pdf`, status: 'pending', date: new Date().toISOString().split('T')[0] }
      ];
      
      const updatedEmployees = db.employees.map(emp => {
        if (emp.id === selectedEmp.id) {
          return { ...emp, documents: updatedDocs };
        }
        return emp;
      });

      const newLogs = [...db.auditLogs, {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        initiator_id: 'Sarah Jenkins',
        module: 'Employees',
        record_id: selectedEmp.id,
        action_type: 'verify_doc',
        change_diff: { uploaded_document: docType },
        ip_address: '192.168.1.104',
        client_agent: 'Chrome / Windows'
      }];

      onUpdateDb({
        ...db,
        employees: updatedEmployees,
        auditLogs: newLogs
      });

      setSelectedEmp({
        ...selectedEmp,
        documents: updatedDocs
      });

      setScanningDoc(null);
      alert(`Malware Scan Clean! Document ${docType} successfully uploaded & enqueued for verification.`);
    }, 1500);
  };

  const handleVerifyDocument = (docType) => {
    const currentDocs = selectedEmp.documents || [];
    const updatedDocs = currentDocs.map(d => {
      if (d.type === docType) {
        return { ...d, status: 'verified' };
      }
      return d;
    });

    const updatedEmployees = db.employees.map(emp => {
      if (emp.id === selectedEmp.id) {
        return { ...emp, documents: updatedDocs };
      }
      return emp;
    });

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Employees',
      record_id: selectedEmp.id,
      action_type: 'verify_doc',
      change_diff: { verified_document: docType },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      employees: updatedEmployees,
      auditLogs: newLogs
    });

    setSelectedEmp({
      ...selectedEmp,
      documents: updatedDocs
    });

    alert(`Document ${docType} successfully verified and stamped ✓`);
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Employee Registry</h1>
          <p>Monitor staffing rosters, verify identity records, and oversee onboarding completions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="print-btn" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="strategic-list-item" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddWizard(true)}>
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Searching filters */}
      <div style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '8px', gap: '8px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by name, ID or role..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '13px' }} />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 16px', borderRadius: '8px', outline: 'none' }}>
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="IT">IT</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Directory Tables */}
        <div className="table-container" style={{ flex: 1, margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} onClick={() => { setSelectedEmp(emp); setProfileTab('info'); setRevealBank(false); }} style={{ cursor: 'pointer' }}>
                  <td>
                    <img src={emp.photo} alt={emp.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  </td>
                  <td><span className="code-span">{emp.emp_id}</span></td>
                  <td><strong>{emp.name}</strong></td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>
                    <span className={`badge-pill ${emp.status === 'active' ? 'badge-green' : emp.status === 'probation' ? 'badge-gold' : 'danger'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>{emp.join_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Profile Side Panels */}
        {selectedEmp && (() => {
          const progress = db.trainingProgress?.find(p => p.employee_id === selectedEmp.id) || { completed_modules: 0, quiz_score: 0, passed: false };
          const docs = selectedEmp.documents || [
            { type: 'Aadhaar Card', name: 'aadhaar_verify.pdf', status: 'verified', date: '2026-05-20' },
            { type: 'Degree Certificate', name: 'bachelors_degree.pdf', status: 'pending', date: '2026-05-22' }
          ];
          const leave = db.leaveBalances?.find(b => b.employee_id === selectedEmp.id) || { CL: 0, SL: 0, EL: 0 };
          const attendance = db.attendanceLogs?.filter(l => l.employee_id === selectedEmp.id) || [];
          const payslipsList = db.payslips?.filter(p => p.employee_id === selectedEmp.id) || [];

          return (
            <div className="card" style={{ width: '420px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--accent-pink)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <img src={selectedEmp.photo} alt={selectedEmp.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>{selectedEmp.name}</h3>
                    <span className="code-span">{selectedEmp.emp_id}</span>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} onClick={() => setSelectedEmp(null)}>✕</button>
              </div>

              {/* Tab Selector Inside Drawer */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '8px', paddingBottom: '4px' }}>
                {['info', 'docs', 'probation', 'attendance', 'payroll'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setProfileTab(tab); setRevealBank(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: profileTab === tab ? 'var(--accent-pink)' : 'var(--text-muted)',
                      borderBottom: profileTab === tab ? '2px solid var(--accent-pink)' : 'none',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}
                  >
                    {tab === 'docs' ? 'Docs Vault' : tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ minHeight: '240px' }}>
                {profileTab === 'info' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                      <strong>{selectedEmp.email}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Phone Number</span>
                      <strong>{selectedEmp.phone || '+91 99000 11000'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Structural Grade & Designation</span>
                      <strong>Grade {selectedEmp.grade} — {selectedEmp.designation}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Active Manager & Dept</span>
                      <strong>{selectedEmp.manager} ({selectedEmp.department})</strong>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Masked Bank Details</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                          {selectedEmp.bank_name} — {revealBank ? selectedEmp.account_number : `****${selectedEmp.account_number.slice(-4)}`}
                        </span>
                        {!revealBank ? (
                          <button
                            onClick={() => handleRevealBankDetails(selectedEmp)}
                            style={{
                              backgroundColor: 'rgba(236,72,153,0.1)',
                              color: 'var(--accent-pink)',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            Reveal Account
                          </button>
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 'bold' }}>Logged ✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'docs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Verified Employee Credentials Vault</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {docs.map((doc, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{doc.type}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{doc.name} ({doc.date})</div>
                          </div>
                          <div>
                            {doc.status === 'verified' ? (
                              <span style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={14} /> Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyDocument(doc.type)}
                                style={{
                                  backgroundColor: 'var(--accent-pink)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  cursor: 'pointer'
                                }}
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upload simulated box */}
                    <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center', marginTop: '8px' }}>
                      {scanningDoc ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--accent-pink)' }} />
                          <span style={{ fontSize: '12px', color: 'var(--accent-pink)', fontWeight: 'bold' }} className="pulse">Malware Scanner Active: Analyzing {scanningDoc}...</span>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Upload document into verified vault</span>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleUploadDocument('PAN Card')}
                              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              + PAN Card
                            </button>
                            <button
                              onClick={() => handleUploadDocument('Degree Certificate')}
                              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              + Degree
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {profileTab === 'probation' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Onboarding Status</span>
                      <strong style={{ fontSize: '14px', color: selectedEmp.status === 'probation' ? 'var(--accent-gold)' : 'var(--accent-green)' }}>
                        {selectedEmp.status.toUpperCase()}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Probation Timeline End Date</span>
                      <strong>{selectedEmp.probation_end_date}</strong>
                    </div>

                    {selectedEmp.status === 'probation' && (
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          {progress.passed ? (
                            <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                              <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} /> L&D Compliance Quiz Passed ({progress.quiz_score}%)
                            </span>
                          ) : (
                            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                              <Lock size={16} style={{ color: '#fbbf24' }} /> L&D Quiz Lock Prerequisite Engaged (Score: {progress.quiz_score}%)
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <button
                            className="print-btn"
                            disabled={!progress.passed}
                            style={{
                              width: '100%',
                              justifyContent: 'center',
                              backgroundColor: progress.passed ? 'var(--accent-pink)' : 'rgba(255,255,255,0.05)',
                              color: progress.passed ? '#fff' : 'var(--text-muted)',
                              cursor: progress.passed ? 'pointer' : 'not-allowed',
                              border: progress.passed ? 'none' : '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onClick={() => handleConfirmProbation(selectedEmp.id)}
                          >
                            {!progress.passed && <Lock size={14} />} Confirm Probation Active
                          </button>

                          <button
                            className="print-btn"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => handleExtendProbation(selectedEmp.id)}
                          >
                            Extend Probation Timeline (90 Days)
                          </button>

                          <button
                            className="print-btn"
                            style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', color: '#fff', border: 'none' }}
                            onClick={() => handleTerminateProbation(selectedEmp.id)}
                          >
                            Terminate Employment Status
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {profileTab === 'attendance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Casual Leave (CL)</span>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{leave.CL} Days</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sick Leave (SL)</span>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{leave.SL} Days</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Earned Leave (EL)</span>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{leave.EL} Days</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Recent Presence Logs (This Month)</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                        {attendance.map((log, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', backgroundColor: 'var(--bg-tertiary)', padding: '6px 10px', borderRadius: '4px' }}>
                            <span>{log.date} ({log.work_mode.toUpperCase()})</span>
                            <span style={{ color: log.is_late ? 'var(--accent-gold)' : 'var(--accent-green)', fontWeight: 'bold' }}>
                              {log.is_late ? 'Late punch' : 'On-time punch'}
                            </span>
                          </div>
                        ))}
                        {attendance.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No attendance logs captured for active period.</span>}
                      </div>
                    </div>
                  </div>
                )}

                {profileTab === 'payroll' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Salary Grade Bracket</span>
                      <strong>Grade {selectedEmp.grade} — Fixed Base Bracket</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Historical Monthly Payslips</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                        {payslipsList.map((payslip, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div>
                              <span style={{ fontWeight: '600' }}>Month {payslip.month} / {payslip.year}</span>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Net Salary: ₹{payslip.net.toLocaleString()}</div>
                            </div>
                            <button
                              onClick={() => alert(`Downloading payslip PDF structure for Month ${payslip.month}...`)}
                              style={{
                                background: 'none',
                                border: '1px solid var(--accent-pink)',
                                color: 'var(--accent-pink)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              PDF Download
                            </button>
                          </div>
                        ))}
                        {payslipsList.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No payslip ledgers processed for employee.</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Popups Adding */}
      {showAddWizard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddEmployee} className="card" style={{ width: '400px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3>🧑‍💼 Add New Employee Wizard</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <label style={{ fontSize: '12px' }}>Employee Full Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Jane Doe" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
              
              <label style={{ fontSize: '12px' }}>Email Address</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="jane@nsgtech.com" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Department</label>
              <select value={newDept} onChange={(e) => setNewDept(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option value="Engineering">Engineering</option>
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>

              <label style={{ fontSize: '12px' }}>Designation / Title</label>
              <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} required placeholder="Staff Developer" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowAddWizard(false)}>Cancel</button>
              <button type="submit" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Create Profile</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function OnboardingView({ db, onUpdateDb }) {
  const [onboardingTab, setOnboardingTab] = useState('active'); // active | templates | overdue | esign
  const [selectedInstance, setSelectedInstance] = useState(null); // Employee object for detailed task checklist modal
  
  // Template Builder States
  const [taskName, setTaskName] = useState('');
  const [taskRole, setTaskRole] = useState('Employee'); // Employee | IT | HR | TL
  const [taskOffset, setTaskOffset] = useState(2);
  const [isMandatory, setIsMandatory] = useState(true);
  const [requiresEsign, setRequiresEsign] = useState(false);

  // Initialize onboarding tasks in localStorage database if missing
  const activeProbationers = db.employees.filter(e => e.status === 'probation');
  const onboardingTasks = db.onboardingTasks || [
    { id: 1, instance_id: 104, task_name: 'Workstation Setup & Laptop Provisioning', assigned_to: 'IT', due_date: '2026-04-17', is_mandatory: true, requires_esign: false, completed_at: '2026-04-16', status: 'completed' },
    { id: 2, instance_id: 104, task_name: 'Provision System Logins & Email', assigned_to: 'IT', due_date: '2026-04-16', is_mandatory: true, requires_esign: false, completed_at: '2026-04-16', status: 'completed' },
    { id: 3, instance_id: 104, task_name: 'Mandatory NDA Policy E-Sign', assigned_to: 'Employee', due_date: '2026-04-18', is_mandatory: true, requires_esign: true, completed_at: null, status: 'pending' },
    { id: 4, instance_id: 104, task_name: 'Complete Compliance Induction Quiz', assigned_to: 'Employee', due_date: '2026-04-20', is_mandatory: true, requires_esign: false, completed_at: null, status: 'pending' },
    { id: 5, instance_id: 104, task_name: 'Welcome Kit & Access Badge Handover', assigned_to: 'HR', due_date: '2026-04-17', is_mandatory: false, requires_esign: false, completed_at: '2026-04-17', status: 'completed' }
  ];

  const esignRequests = db.esignRequests || [
    { id: 1, employee_id: 104, document_name: 'Mandatory NDA Policy Handbook', status: 'pending', sent_at: '2026-04-15T10:00:00Z', signed_at: null }
  ];

  const templates = db.onboardingTemplates || [
    { id: 1, name: 'NSG Corporate Onboarding Template', tasks: [
      { name: 'Workstation Setup & Laptop Provisioning', role: 'IT', offset: 2, mandatory: true, esign: false },
      { name: 'Provision System Logins & Email', role: 'IT', offset: 1, mandatory: true, esign: false },
      { name: 'Mandatory NDA Policy E-Sign', role: 'Employee', offset: 3, mandatory: true, esign: true },
      { name: 'Complete Compliance Induction Quiz', role: 'Employee', offset: 5, mandatory: true, esign: false }
    ]}
  ];

  const handleToggleTask = (taskId) => {
    const updatedTasks = onboardingTasks.map(t => {
      if (t.id === taskId) {
        const isCompleting = t.status !== 'completed';
        return {
          ...t,
          status: isCompleting ? 'completed' : 'pending',
          completed_at: isCompleting ? new Date().toISOString().split('T')[0] : null
        };
      }
      return t;
    });

    // Enforce L&D state auto completion if compliance quiz is checked
    const clickedTask = onboardingTasks.find(t => t.id === taskId);
    let updatedTrainingProgress = db.trainingProgress;
    if (clickedTask && clickedTask.task_name.includes('Compliance Induction Quiz')) {
      const isCompleting = clickedTask.status !== 'completed';
      updatedTrainingProgress = db.trainingProgress?.map(p => {
        if (p.employee_id === clickedTask.instance_id) {
          return {
            ...p,
            passed: isCompleting,
            completed_modules: isCompleting ? 2 : 0,
            quiz_score: isCompleting ? 90 : 0
          };
        }
        return p;
      });
    }

    onUpdateDb({
      ...db,
      onboardingTasks: updatedTasks,
      trainingProgress: updatedTrainingProgress
    });
  };

  const handleCreateTemplateTask = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const newTask = {
      name: taskName,
      role: taskRole,
      offset: taskOffset,
      mandatory: isMandatory,
      esign: requiresEsign
    };

    const updatedTemplates = templates.map(t => {
      if (t.id === 1) {
        return { ...t, tasks: [...t.tasks, newTask] };
      }
      return t;
    });

    onUpdateDb({
      ...db,
      onboardingTemplates: updatedTemplates
    });

    setTaskName('');
    alert('Task successfully enqueued to onboarding template flow builder.');
  };

  const handleDeleteTemplateTask = (taskName) => {
    const updatedTemplates = templates.map(t => {
      if (t.id === 1) {
        return { ...t, tasks: t.tasks.filter(tk => tk.name !== taskName) };
      }
      return t;
    });
    onUpdateDb({
      ...db,
      onboardingTemplates: updatedTemplates
    });
  };

  const handleSimulateEsign = (requestId) => {
    const request = esignRequests.find(r => r.id === requestId);
    if (!request) return;

    const updatedEsigns = esignRequests.map(r => {
      if (r.id === requestId) {
        return { ...r, status: 'signed', signed_at: new Date().toISOString() };
      }
      return r;
    });

    // Auto complete the e-sign onboarding task too
    const updatedTasks = onboardingTasks.map(t => {
      if (t.instance_id === request.employee_id && t.requires_esign) {
        return {
          ...t,
          status: 'completed',
          completed_at: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    onUpdateDb({
      ...db,
      esignRequests: updatedEsigns,
      onboardingTasks: updatedTasks
    });

    alert('Simulation: Employee e-signed document via OTP secure portal. Onboarding task updated.');
  };

  const handleSendEsignRequest = (emp) => {
    const newRequest = {
      id: Date.now(),
      employee_id: emp.id,
      document_name: 'Mandatory NDA Policy Handbook',
      status: 'pending',
      sent_at: new Date().toISOString(),
      signed_at: null
    };

    onUpdateDb({
      ...db,
      esignRequests: [...esignRequests, newRequest]
    });

    alert(`E-signature request for NDA Policy dispatched to ${emp.name} email queue.`);
  };

  const handleSendOverdueReminder = (task) => {
    alert(`Slack & Email alert triggered to Assignee: [${task.assigned_to}] for task: [${task.task_name}]`);
  };

  // Pre-calculate overdue tasks
  const overdueTasks = onboardingTasks.filter(t => {
    if (t.status === 'completed') return false;
    const dueDate = new Date(t.due_date);
    return dueDate < new Date();
  });

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Active Onboarding Workspace</h1>
          <p>Supervise task checklist progressions, workstation allocations, and signed induction credentials.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', marginBottom: '20px', paddingBottom: '4px' }}>
        {[
          { id: 'active', label: 'Active Checklists' },
          { id: 'templates', label: 'Template Builder' },
          { id: 'overdue', label: 'Overdue Alerts' },
          { id: 'esign', label: 'E-Sign Portal' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setOnboardingTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: onboardingTab === tab.id ? 'var(--accent-pink)' : 'var(--text-muted)',
              borderBottom: onboardingTab === tab.id ? '2.5px solid var(--accent-pink)' : 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Onboarding tab contents */}
      {onboardingTab === 'active' && (
        <div className="metrics-grid">
          {activeProbationers.map(emp => {
            const empTasks = onboardingTasks.filter(t => t.instance_id === emp.id);
            const totalTasks = empTasks.length || 5;
            const completedTasks = empTasks.filter(t => t.status === 'completed').length;
            const pct = Math.floor((completedTasks / totalTasks) * 100);
            const nextTask = empTasks.find(t => t.status !== 'completed')?.task_name || 'All Onboarding Tasks Complete';

            return (
              <div key={emp.id} className="card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <img src={emp.photo} alt={emp.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ margin: 0 }}>{emp.name}</h4>
                    <span className="code-span" style={{ fontSize: '10px' }}>{emp.emp_id}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                      <span>Checklist Completion:</span>
                      <strong>{pct}% ({completedTasks}/{totalTasks})</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-pink)' }}></div>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span style={{ textTransform: 'uppercase', display: 'block', fontSize: '9px' }}>Next Pending Action</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{nextTask}</strong>
                  </div>

                  <button
                    className="print-btn"
                    style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
                    onClick={() => setSelectedInstance(emp)}
                  >
                    View Checklist Details
                  </button>
                </div>
              </div>
            );
          })}

          {activeProbationers.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: 'span 3', padding: '32px' }}>No active hires enqueued under probation checklists.</p>
          )}
        </div>
      )}

      {onboardingTab === 'templates' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Active tasks in general template */}
          <div className="table-container flex-2" style={{ margin: 0 }}>
            <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Corporate Onboarding General Template Task Roster</div>
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Assigned to Role</th>
                  <th>Due Day Offset</th>
                  <th>Mandatory</th>
                  <th>Requires E-Sign</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {templates[0].tasks.map((tk, idx) => (
                  <tr key={idx}>
                    <td><strong>{tk.name}</strong></td>
                    <td><span className="badge-pill bg-blue">{tk.role}</span></td>
                    <td>Day +{tk.offset}</td>
                    <td>{tk.mandatory ? 'Yes ✓' : 'Optional'}</td>
                    <td>{tk.esign ? 'E-Sign Required' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteTemplateTask(tk.name)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form to add task */}
          <form onSubmit={handleCreateTemplateTask} className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0 }}>
            <h3>➕ Add Task Flow Builder</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '12px 0' }}>
              <label style={{ fontSize: '12px' }}>Task Description Name</label>
              <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} required placeholder="Setup Slack logins..." style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Assigned To Role</label>
              <select value={taskRole} onChange={(e) => setTaskRole(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option value="Employee">Employee (ESS)</option>
                <option value="IT">IT Department</option>
                <option value="HR">HR Manager</option>
                <option value="TL">Team Lead (TL)</option>
              </select>

              <label style={{ fontSize: '12px' }}>Due Offset (Days from Joining)</label>
              <input type="number" value={taskOffset} onChange={(e) => setTaskOffset(Number(e.target.value))} required min={0} max={30} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isMandatory} onChange={(e) => setIsMandatory(e.target.checked)} />
                  Mandatory Task
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={requiresEsign} onChange={(e) => setRequiresEsign(e.target.checked)} />
                  Requires E-Sign
                </label>
              </div>
            </div>
            <button type="submit" className="print-btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none' }}>
              Add Task to Template
            </button>
          </form>
        </div>
      )}

      {onboardingTab === 'overdue' && (
        <div className="table-container">
          <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Onboarding Overdue Escalations Watchdog</div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Task Name</th>
                <th>Assigned To Role</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueTasks.map(t => {
                const emp = db.employees.find(e => e.id === t.instance_id) || { name: 'Unknown' };
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={emp.photo} alt={emp.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                        <strong>{emp.name}</strong>
                      </div>
                    </td>
                    <td>{t.task_name}</td>
                    <td><span className="badge-pill bg-pink">{t.assigned_to}</span></td>
                    <td><span style={{ color: 'red', fontWeight: 'bold' }}>{t.due_date} (Overdue)</span></td>
                    <td><span className="badge-pill danger">Overdue SLA</span></td>
                    <td>
                      <button
                        className="print-btn"
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => handleSendOverdueReminder(t)}
                      >
                        Send Alert Reminder
                      </button>
                    </td>
                  </tr>
                );
              })}
              {overdueTasks.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>No onboarding tasks are currently overdue. SLA compliant ✓</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {onboardingTab === 'esign' && (
        <div className="table-container">
          <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Digital Document E-Signature Secure Portal</div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Agreement Document Name</th>
                <th>Sent Timestamp</th>
                <th>Status status</th>
                <th>Repatch Actions</th>
              </tr>
            </thead>
            <tbody>
              {esignRequests.map(req => {
                const emp = db.employees.find(e => e.id === req.employee_id) || { name: 'Unknown' };
                return (
                  <tr key={req.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td><span style={{ textDecoration: 'underline', color: 'var(--accent-pink)', cursor: 'pointer' }}>{req.document_name}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{new Date(req.sent_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge-pill ${req.status === 'signed' ? 'badge-green' : 'badge-gold'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="print-btn"
                            style={{ padding: '4px 8px', fontSize: '10px' }}
                            onClick={() => alert(`Resent NDA document signature request to ${emp.name}`)}
                          >
                            Resend Link
                          </button>
                          <button
                            className="print-btn"
                            style={{ padding: '4px 8px', fontSize: '10px', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none' }}
                            onClick={() => handleSimulateEsign(req.id)}
                          >
                            Simulate Sign
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Completed on {new Date(req.signed_at).toLocaleDateString()}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Onboarding instance detailed tasks checklist modal */}
      {selectedInstance && (() => {
        const empTasks = onboardingTasks.filter(t => t.instance_id === selectedInstance.id);
        const hasEsign = esignRequests.some(r => r.employee_id === selectedInstance.id && r.status === 'pending');
        
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '550px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={selectedInstance.photo} alt={selectedInstance.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div>
                    <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Onboarding Checklist — {selectedInstance.name}</h3>
                    <span className="code-span" style={{ fontSize: '10px' }}>{selectedInstance.emp_id}</span>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }} onClick={() => setSelectedInstance(null)}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '8px 0' }}>
                {empTasks.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', justify: 'space-between', backgroundColor: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={t.status === 'completed'}
                        onChange={() => handleToggleTask(t.id)}
                        disabled={t.requires_esign && hasEsign}
                        style={{ width: '18px', height: '18px', cursor: (t.requires_esign && hasEsign) ? 'not-allowed' : 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{t.task_name}</div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Assigned to: {t.assigned_to} | Due by: {t.due_date}</span>
                      </div>
                    </div>
                    <div>
                      {t.requires_esign ? (
                        hasEsign ? (
                          <button
                            onClick={() => { setOnboardingTab('esign'); setSelectedInstance(null); }}
                            style={{ backgroundColor: 'rgba(236,72,153,0.1)', color: 'var(--accent-pink)', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Sign Needed
                          </button>
                        ) : (
                          <span style={{ color: 'var(--accent-green)', fontSize: '11px', fontWeight: 'bold' }}>Signed ✓</span>
                        )
                      ) : (
                        <span className={`badge-pill ${t.status === 'completed' ? 'badge-green' : 'badge-gold'}`}>{t.status}</span>
                      )}
                    </div>
                  </div>
                ))}

                {empTasks.some(t => t.requires_esign && t.status !== 'completed') && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(236,72,153,0.05)', border: '1px dashed var(--accent-pink)', padding: '10px', borderRadius: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>NDA document must be e-signed to complete that task.</span>
                    <button
                      onClick={() => handleSendEsignRequest(selectedInstance)}
                      style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Send E-Sign Request
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button className="print-btn" onClick={() => setSelectedInstance(null)}>Close View</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ==========================================
// 5. JOB HISTORY VIEW (NEW)
// ==========================================
export function JobHistoryView({ db, onUpdateDb }) {
  const [selectedEmpId, setSelectedEmpId] = useState(101);
  const [showTransferForm, setShowTransferForm] = useState(false);

  // Transfer Form States
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState('Engineering Lead');
  const [newGrade, setNewGrade] = useState(4);
  const [newManager, setNewManager] = useState('Sarah Jenkins');

  const history = db.jobHistory.filter(h => h.employee_id === selectedEmpId);
  const activeEmp = db.employees.find(e => e.id === selectedEmpId);

  const handleCreateTransfer = (e) => {
    e.preventDefault();
    
    const newHist = {
      id: Date.now(),
      employee_id: selectedEmpId,
      event_type: 'transfer',
      old_dept: activeEmp.department,
      new_dept: newDept,
      old_role: activeEmp.designation,
      new_role: newRole,
      old_grade: activeEmp.grade,
      new_grade: newGrade,
      manager: newManager,
      effective_date: new Date().toISOString().split('T')[0],
      approved_by: 'Sarah Jenkins'
    };

    const updatedEmployees = db.employees.map(emp => {
      if (emp.id === selectedEmpId) {
        return {
          ...emp,
          department: newDept,
          designation: newRole,
          grade: newGrade,
          manager: newManager
        };
      }
      return emp;
    });

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Job History',
      record_id: selectedEmpId,
      action_type: 'update',
      change_diff: { structural_transfer: `${activeEmp.name} to ${newDept}` },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      employees: updatedEmployees,
      jobHistory: [...db.jobHistory, newHist],
      auditLogs: newLogs
    });

    setShowTransferForm(false);
    alert(`Transfer executed successfully for ${activeEmp.name}! Corporate hierarchies updated.`);
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Department Transfers & Job History</h1>
          <p>Log employee job transitions, structural department transfers, promotions, and manager reporting lines.</p>
        </div>
        <div>
          <button className="strategic-list-item" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowTransferForm(true)}>
            <Plus size={16} /> Execute Transfer
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '13px' }}>Select Employee Profile:</span>
        <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(Number(e.target.value))} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 16px', borderRadius: '8px' }}>
          {db.employees.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.emp_id})</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Career Timeline */}
        <div className="content-card flex-2" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Chronological Progression Timeline</h3>
          </div>
          <div className="card-content-list" style={{ paddingLeft: '16px' }}>
            {history.map((hist, idx) => (
              <div key={hist.id} className="strategic-list-item" style={{ position: 'relative', borderLeft: '2px solid var(--accent-pink)', paddingLeft: '24px', paddingBottom: '20px' }}>
                <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-pink)' }}></div>
                <div className="item-text">
                  <h4 style={{ margin: 0 }}>{hist.event_type.toUpperCase()} — {hist.new_role}</h4>
                  <p style={{ margin: '4px 0 0 0' }}>
                    Department: {hist.new_dept} {hist.old_dept && `(Transferred from ${hist.old_dept})`} <br />
                    Reporting Manager: {hist.manager} — Approved by {hist.approved_by}
                  </p>
                </div>
                <span className="code-span" style={{ fontSize: '11px' }}>{hist.effective_date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active Structure */}
        {activeEmp && (
          <div className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
            <h3>Active Job Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Department</span>
                <strong>{activeEmp.department}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Designation / Title</span>
                <strong>{activeEmp.designation}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Grade Level Structure</span>
                <strong>Grade {activeEmp.grade}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Active Reporting Manager</span>
                <strong>{activeEmp.manager}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popups transfers */}
      {showTransferForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateTransfer} className="card" style={{ width: '400px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3>🏢 Execute Structural Department Transfer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <label style={{ fontSize: '12px' }}>Target Employee</label>
              <input type="text" readOnly value={activeEmp?.name || ''} style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>New Destination Department</label>
              <select value={newDept} onChange={(e) => setNewDept(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option value="Engineering">Engineering</option>
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>

              <label style={{ fontSize: '12px' }}>New Title Designation</label>
              <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} required placeholder="Lead Architect" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>New Grade Structure Level</label>
              <input type="number" value={newGrade} onChange={(e) => setNewGrade(Number(e.target.value))} required min={1} max={10} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>New Reporting Manager (TL)</label>
              <input type="text" value={newManager} onChange={(e) => setNewManager(e.target.value)} required placeholder="Sarah Jenkins" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowTransferForm(false)}>Cancel</button>
              <button type="submit" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Commit Transfer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. DISCIPLINARY & PIP VIEW (NEW)
// ==========================================
export function DisciplinaryPipView({ db, onUpdateDb }) {
  const [showWarningForm, setShowWarningForm] = useState(false);
  
  // Warning Form States
  const [targetEmpId, setTargetEmpId] = useState(101);
  const [vType, setVType] = useState('tardiness');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState('written_warning');

  const handleIssueWarning = (e) => {
    e.preventDefault();

    const newTicket = {
      id: Date.now(),
      employee_id: targetEmpId,
      issued_by: 'Sarah Jenkins',
      violation_type: vType,
      severity: severity,
      description: desc,
      evidence_url: '#',
      response_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      employee_rebuttal: '',
      status: 'issued'
    };

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Disciplinary',
      record_id: targetEmpId,
      action_type: 'verify_doc', // Auditing code triggers warning creation
      change_diff: { warning_severity: severity },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      disciplinaryTickets: [...db.disciplinaryTickets, newTicket],
      auditLogs: newLogs
    });

    setDesc('');
    setShowWarningForm(false);
    alert('Disciplinary Warning Ticket successfully issued to employee profile! Red SLA countdown markers are live.');
  };

  const handleSimulateRebuttal = (id) => {
    const updated = db.disciplinaryTickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          employee_rebuttal: 'I acknowledge the concern and am working to correct this immediately. I had emergency medical circumstances.',
          status: 'resolved'
        };
      }
      return t;
    });

    onUpdateDb({ ...db, disciplinaryTickets: updated });
    alert('Simulated Employee OTP Sign-off Rebuttal successfully logged.');
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Disciplinary Tickets &amp; PIP Cycles</h1>
          <p>Issue formal policy warning tickets, capture OTP-signed employee responses, and manage Performance Improvement Plans.</p>
        </div>
        <div>
          <button className="strategic-list-item" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowWarningForm(true)}>
            <AlertTriangle size={16} /> Issue Warning
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Warning tickets */}
        <div className="content-card flex-2" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Disciplinary Warning Registry</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {db.disciplinaryTickets.map(ticket => {
              const emp = db.employees.find(e => e.id === ticket.employee_id) || { name: 'Unknown' };
              return (
                <div key={ticket.id} className="strategic-list-item" style={{ borderLeft: '3px solid #ef4444', paddingLeft: '16px', paddingBottom: '12px' }}>
                  <div className="item-text">
                    <h4 style={{ margin: 0 }}>{emp.name} — {ticket.violation_type.toUpperCase()} Warning</h4>
                    <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)' }}>
                      <strong>Severity:</strong> {ticket.severity.replace('_', ' ')} <br />
                      <strong>Context:</strong> {ticket.description}
                    </p>
                    {ticket.employee_rebuttal && (
                      <p style={{ marginTop: '8px', backgroundColor: 'var(--bg-tertiary)', padding: '8px', borderRadius: '6px', fontSize: '12px', border: '1px dashed var(--border-color)', fontStyle: 'italic' }}>
                        <strong>Employee Acknowledgment:</strong> "{ticket.employee_rebuttal}"
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <span className={`badge-pill ${ticket.status === 'issued' ? 'danger' : 'success'}`}>
                      {ticket.status}
                    </span>
                    {ticket.status === 'issued' && (
                      <button style={{ backgroundColor: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} onClick={() => handleSimulateRebuttal(ticket.id)}>
                        Simulate Rebuttal
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIP Tracker */}
        <div className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
          <h3>📈 Active Performance Improvement Plans</h3>
          {db.pips.map(pip => {
            const emp = db.employees.find(e => e.id === pip.employee_id) || { name: 'Unknown' };
            return (
              <div key={pip.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Target Employee</span>
                  <strong>{emp.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Duration Cycle</span>
                  <strong>{pip.duration_weeks} Weeks (Started {pip.start_date})</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>PIP Targets Status</span>
                  {pip.goals.map((g, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>{g.title}:</span>
                      <strong style={{ color: 'var(--accent-gold)' }}>{g.current} / {g.target}</strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popups warning */}
      {showWarningForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleIssueWarning} className="card" style={{ width: '400px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3>⚠️ Issue Formal Policy Warning Ticket</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <label style={{ fontSize: '12px' }}>Target Employee</label>
              <select value={targetEmpId} onChange={(e) => setTargetEmpId(Number(e.target.value))} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                {db.employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>

              <label style={{ fontSize: '12px' }}>Violation Type Category</label>
              <select value={vType} onChange={(e) => setVType(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option value="tardiness">Tardiness / Delay</option>
                <option value="policy_breach">Policy Breach</option>
                <option value="insubordination">Insubordination</option>
                <option value="performance">Underperformance</option>
              </select>

              <label style={{ fontSize: '12px' }}>Severity Level</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option value="written_warning">Written Warning 1</option>
                <option value="final_warning">Final Written Warning</option>
                <option value="suspension">Formal Suspension Action</option>
              </select>

              <label style={{ fontSize: '12px' }}>Warning Description Reason</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required placeholder="Provide clear descriptions..." style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px', height: '80px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" style={{ background: 'none', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setShowWarningForm(false)}>Cancel</button>
              <button type="submit" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Issue Warning</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. ATTENDANCE VIEW
// ==========================================
export function AttendanceRegisterView({ db, onUpdateDb }) {
  const [showRoster, setShowRoster] = useState(false);

  const handleApproveCorrection = (id) => {
    const correction = db.attendanceCorrections?.find(c => c.id === id);
    if (!correction) return;

    // Remove correction and update log
    const updatedCorrections = db.attendanceCorrections.filter(c => c.id !== id);
    
    // Add check in log
    const newLog = {
      id: Date.now(),
      employee_id: correction.employee_id,
      date: correction.correction_date,
      clock_in: correction.requested_clock_in,
      clock_out: correction.requested_clock_out,
      work_mode: 'office',
      is_late: false,
      exception_flag: 'none'
    };

    onUpdateDb({
      ...db,
      attendanceCorrections: updatedCorrections,
      attendanceLogs: [...db.attendanceLogs, newLog]
    });

    alert('Missed punch correction approved! Attendance logs updated.');
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Attendance Register</h1>
          <p>Review presence registers, oversee shifts schedule swap requests, and approve missed-punch overrides.</p>
        </div>
        <div>
          <button className="print-btn" onClick={() => setShowRoster(!showRoster)}>
            {showRoster ? 'Hide Shift Roster' : 'View Shift Roster Planner'}
          </button>
        </div>
      </div>

      {showRoster && (
        <div className="pipeline" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div className="pipeline-title">Shift Roster Planner (General Shifts: 09:00 - 18:00)</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {db.employees.map(emp => (
              <span key={emp.id} className="badge-pill bg-blue" style={{ padding: '6px 12px' }}>
                {emp.name}: Mon-Fri (Standard Shift)
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Attendance Register */}
        <div className="table-container flex-2" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Punch Date</th>
                <th>Clock In Time</th>
                <th>Clock Out Time</th>
                <th>Work Mode</th>
                <th>Punch Flags</th>
              </tr>
            </thead>
            <tbody>
              {db.attendanceLogs.map(log => {
                const emp = db.employees.find(e => e.id === log.employee_id) || { name: 'Unknown' };
                return (
                  <tr key={log.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{log.date}</td>
                    <td>{log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : <span style={{ color: 'red' }}>Missed</span>}</td>
                    <td>{log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : <span style={{ color: 'red' }}>Missed</span>}</td>
                    <td><span className="badge-pill bg-pink">{log.work_mode.toUpperCase()}</span></td>
                    <td>
                      <span className={`badge-pill ${log.exception_flag === 'none' ? 'badge-green' : 'badge-gold'}`}>
                        {log.exception_flag}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* punch corrections */}
        <div className="content-card flex-1" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>punch correction Regularizations</h3>
          </div>
          <div className="card-content-list">
            {db.attendanceCorrections && db.attendanceCorrections.length > 0 ? (
              db.attendanceCorrections.map(c => {
                const emp = db.employees.find(e => e.id === c.employee_id) || { name: 'Unknown' };
                return (
                  <div key={c.id} className="strategic-list-item" style={{ borderLeft: '3px solid var(--accent-gold)', paddingLeft: '12px' }}>
                    <div className="item-text">
                      <h5>{emp.name}</h5>
                      <p>Date: {c.correction_date} <br /> Reason: {c.reason}</p>
                    </div>
                    <button style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} onClick={() => handleApproveCorrection(c.id)}>
                      Approve
                    </button>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No pending regularization overrides.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. TIMESHEET EXCEPTIONS VIEW (NEW)
// ==========================================
export function TimesheetExceptionsView({ db, onUpdateDb }) {
  const handleApplyLOP = (id) => {
    const item = db.timesheetExceptions.find(x => x.id === id);
    if (!item) return;

    const updated = db.timesheetExceptions.map(x => {
      if (x.id === id) {
        return { ...x, status: 'lop_applied' };
      }
      return x;
    });

    const emp = db.employees.find(e => e.id === item.employee_id) || { name: 'Staff' };

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Timesheets',
      record_id: item.id,
      action_type: 'payroll_lock', // LOP locking payroll trigger
      change_diff: { LOP_deductions_applied: emp.name },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      timesheetExceptions: updated,
      auditLogs: newLogs
    });

    alert(`Loss-of-Pay (LOP) deduction rules locked for ${emp.name} timesheet exception.`);
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Timesheet Exceptions Inspector</h1>
          <p>Review missing, unsubmitted or TL-rejected timesheets. Unresolved exceptions block the monthly Stepper Payroll process.</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Date of Exception</th>
              <th>Logged Hours</th>
              <th>Expected Shift Hours</th>
              <th>Exception Flag</th>
              <th>Action Panel</th>
            </tr>
          </thead>
          <tbody>
            {db.timesheetExceptions.map(item => {
              const emp = db.employees.find(e => e.id === item.employee_id) || { name: 'Unknown' };
              return (
                <tr key={item.id} style={item.status === 'lop_applied' ? { opacity: 0.5 } : {}}>
                  <td><strong>{emp.name}</strong></td>
                  <td>{item.date}</td>
                  <td><span style={{ color: 'red', fontWeight: 'bold' }}>{item.logged_hours}h</span></td>
                  <td>{item.target_hours}h</td>
                  <td>
                    <span className="badge-pill bg-pink">
                      {item.exception_type.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {item.status === 'open' ? (
                      <button style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} onClick={() => handleApplyLOP(item.id)}>
                        Apply LOP Deduction
                      </button>
                    ) : (
                      <span className="badge-pill bg-blue">LOP Applied</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 9. LEAVE MANAGEMENT VIEW
// ==========================================
export function LeaveManagementView({ db, onUpdateDb }) {
  const handleApproveLeave = (id) => {
    const updatedRequests = db.leaveRequests.map(r => {
      if (r.id === id) {
        return { ...r, status: 'hr_approved', hr_approved_at: new Date().toISOString() };
      }
      return r;
    });

    const req = db.leaveRequests.find(r => r.id === id);
    const updatedBalances = db.leaveBalances.map(b => {
      if (b.employee_id === req.employee_id) {
        const type = req.leave_type;
        return {
          ...b,
          [type]: b[type] - req.days
        };
      }
      return b;
    });

    onUpdateDb({
      ...db,
      leaveRequests: updatedRequests,
      leaveBalances: updatedBalances
    });

    alert('Leave request approved! Balances updated.');
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Leave Management</h1>
          <p>Oversee company leave accruals policies, check team calendar overlapping alerts, and approve leaves.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Balances grid */}
        <div className="table-container flex-2" style={{ margin: 0 }}>
          <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Staff Active Leave Balances</div>
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>CL Balance</th>
                <th>SL Balance</th>
                <th>EL Balance</th>
                <th>Maternity</th>
                <th>Paternity</th>
              </tr>
            </thead>
            <tbody>
              {db.leaveBalances.map(b => {
                const emp = db.employees.find(e => e.id === b.employee_id) || { name: 'Unknown' };
                return (
                  <tr key={b.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{b.CL}</td>
                    <td>{b.SL}</td>
                    <td>{b.EL}</td>
                    <td>{b.Maternity}</td>
                    <td>{b.Paternity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Requests inbox */}
        <div className="content-card flex-1" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Leave Approval Inbox</h3>
          </div>
          <div className="card-content-list">
            {db.leaveRequests.filter(r => r.status === 'tl_approved' || r.status === 'pending').map(r => {
              const emp = db.employees.find(e => e.id === r.employee_id) || { name: 'Unknown' };
              return (
                <div key={r.id} className="strategic-list-item" style={{ borderLeft: '3px solid var(--accent-pink)', paddingLeft: '12px' }}>
                  <div className="item-text">
                    <h5>{emp.name} — {r.leave_type}</h5>
                    <p>{r.days} days ({r.from_date} to {r.to_date}) <br /> Reason: {r.reason}</p>
                  </div>
                  <button style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }} onClick={() => handleApproveLeave(r.id)}>
                    Approve
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. PAYROLL BUILDER VIEW
// ==========================================
export function PayrollBuilderView({ db, onUpdateDb, userRole }) {
  const [payrollStep, setPayrollStep] = useState(1);
  const [lockedAtt, setLockedAtt] = useState(false);
  const [appliedDeductions, setAppliedDeductions] = useState(false);
  const [runLedger, setRunLedger] = useState(false);
  
  const isMakerSigned = db.payrollRuns?.[db.payrollRuns.length - 1]?.status === 'maker_signed';
  const isReleased = db.payrollRuns?.[db.payrollRuns.length - 1]?.status === 'bank_transferred';

  const handleLockAttendance = () => {
    setLockedAtt(true);
    setPayrollStep(2);
    alert('Attendance data locked for the active month! Punch regularizations are frozen.');
  };

  const handleApplyDeductions = () => {
    setAppliedDeductions(true);
    setPayrollStep(3);
    alert('LOP and statutory TDS tax structures successfully calculated and applied.');
  };

  const handleRunLedger = () => {
    setRunLedger(true);
    setPayrollStep(4);
    alert('Payroll ledger successfully computed. Draft payslips generated.');
  };

  const handleMakerSign = () => {
    const newRun = {
      id: Date.now(),
      month: 5,
      year: 2026,
      status: 'maker_signed',
      maker_id: 'Sarah Jenkins',
      maker_signed_at: new Date().toISOString(),
      checker_id: null,
      checker_signed_at: null,
      bank_transfer_at: null
    };

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Payroll',
      record_id: newRun.id,
      action_type: 'payroll_lock', // Maker signed transaction lock
      change_diff: { payroll_run: 'maker_signed' },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      payrollRuns: [...db.payrollRuns, newRun],
      auditLogs: newLogs
    });

    setPayrollStep(5);
    alert('Maker signature committed! Ledger locked and dispatched to CEO Approvals queue for Checker sign-off.');
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Monthly Payroll Builder</h1>
          <p>Locked attendance data, compute LWP tax TDS structures, and execute Twin-Signature Maker-Checker payout locks.</p>
        </div>
      </div>

      {/* Stepper Timeline UI */}
      <div className="pipeline" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px' }}>
        <div className="pipeline-title">Monthly Payroll Run Timeline</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ opacity: payrollStep === 1 ? 1 : 0.5 }}>1. Lock Attendance</div>
          <div style={{ opacity: payrollStep === 2 ? 1 : 0.5 }}>→</div>
          <div style={{ opacity: payrollStep === 3 ? 1 : 0.5 }}>2. Calculate Taxes</div>
          <div style={{ opacity: payrollStep === 4 ? 1 : 0.5 }}>→</div>
          <div style={{ opacity: payrollStep === 5 ? 1 : 0.5 }}>3. Maker Sign</div>
          <div style={{ opacity: isMakerSigned ? 1 : 0.5 }}>→</div>
          <div style={{ opacity: isReleased ? 1 : 0.5 }}>4. Checker Release</div>
        </div>
      </div>

      <div className="card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
        <h3>Active Stepper Workspaces</h3>
        
        {payrollStep === 1 && (
          <div>
            <p>Phase 1: Lock attendance logs and freeze missed-punch regularization tickets.</p>
            <button className="print-btn" onClick={handleLockAttendance}>Lock Attendance Now</button>
          </div>
        )}

        {payrollStep === 2 && (
          <div>
            <p>Phase 2: Calculate Provident Fund contributions, professional taxes, LOP, and TDS schedules.</p>
            <button className="print-btn" onClick={handleApplyDeductions}>Apply Deductions &amp; TDS</button>
          </div>
        )}

        {payrollStep === 3 && (
          <div>
            <p>Phase 3: Generate the draft ledger payroll structures.</p>
            <button className="print-btn" onClick={handleRunLedger}>Run Payout Ledger</button>
          </div>
        )}

        {payrollStep === 4 && (
          <div>
            <p>Phase 4: Digitally sign the payroll Maker file and push it to the CEO approvalsChecker queue.</p>
            <button className="print-btn" onClick={handleMakerSign}>Sign Maker File</button>
          </div>
        )}

        {payrollStep === 5 && (
          <div>
            <p>Phase 5: Pending CEO Checker signature. Maker file signed by HR.</p>
            <div style={{ padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)' }}>
              <strong>Maker Status:</strong> Signed ✓ | <strong>Checker Status:</strong> Awaiting CEO signoff. Switch your active role to CEO Suite to approve payroll payouts in CEO settings/approvals.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 11. APPRAISALS VIEW
// ==========================================
export function AppraisalsView({ db, onUpdateDb }) {
  const [appraisalTab, setAppraisalTab] = useState('proposals'); // proposals | cycles | scorecards | promotions
  const [selectedEmpId, setSelectedEmpId] = useState(104);
  const [proposedCTC, setProposedCTC] = useState(65000);
  const [incrementPct, setIncrementPct] = useState(10);
  const [calibratedBy, setCalibratedBy] = useState('Sarah Jenkins');

  // Review Cycle States
  const [cycleName, setCycleName] = useState('');
  const [reviewPeriod, setReviewPeriod] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const emp = db.employees.find(e => e.id === selectedEmpId) || { name: 'Staff', grade: 1, designation: 'Developer' };
  
  // Base current CTC calculation simulation
  const currentMonthlyCTC = emp.grade * 15000 + 10000;
  const currentAnnualCTC = currentMonthlyCTC * 12;

  // Reactively calculate values
  const handleCTCChange = (val) => {
    setProposedCTC(val);
    const pct = ((val - currentAnnualCTC) / currentAnnualCTC) * 100;
    setIncrementPct(Math.round(pct * 100) / 100);
  };

  const handlePctChange = (val) => {
    setIncrementPct(val);
    const annual = currentAnnualCTC * (1 + val / 100);
    setProposedCTC(Math.round(annual));
  };

  const handleProposeIncrement = (e) => {
    e.preventDefault();

    const newProposal = {
      id: Date.now(),
      employee_id: selectedEmpId,
      current_ctc: currentAnnualCTC,
      proposed_ctc: proposedCTC,
      increment_pct: incrementPct,
      performance_band: 'A',
      effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending_ceo',
      approved_by: null
    };

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Appraisals',
      record_id: selectedEmpId,
      action_type: 'verify_doc',
      change_diff: { increment_proposed: `${incrementPct}%`, new_ctc: proposedCTC },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      incrementProposals: [...(db.incrementProposals || []), newProposal],
      auditLogs: newLogs
    });

    alert(`Increment proposal of ${incrementPct}% successfully submitted to CEO reviews approvals queue!`);
  };

  const handleCreateCycle = (e) => {
    e.preventDefault();
    if (!cycleName.trim()) return;

    const newCycle = {
      id: Date.now(),
      name: cycleName,
      period: reviewPeriod,
      start_date: startDate,
      end_date: endDate,
      self_deadline: new Date(new Date(startDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tl_review_deadline: new Date(new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    };

    onUpdateDb({
      ...db,
      appraisalCycles: [...(db.appraisalCycles || []), newCycle]
    });

    setCycleName('');
    alert(`Performance Review Cycle ${cycleName} successfully launched globally!`);
  };

  const scorecards = db.appraisalScorecards || [
    { id: 1, employee_name: 'John Doe', tl_name: 'Sarah Jenkins', rating: 'A — Excellent', comments: 'Outstanding system design velocity. Handled HDFC payment integration flawlessly.' },
    { id: 2, employee_name: 'Jane Smith', tl_name: 'Sarah Jenkins', rating: 'B — Competent', comments: 'Consistent uptime and server provisioning logs. Excellent IT compliance.' },
    { id: 3, employee_name: 'Rahul Roy', tl_name: 'Vikram Sen', rating: 'C — Developing', comments: 'Good work on content SEO audits, but needs more punctuality on clock-ins.' }
  ];

  const promotionTracker = db.promotions || [
    { id: 1, name: 'Priya Patel', current: 'Junior Architect', proposed: 'Systems Architect', status: 'approved_by_ceo' }
  ];

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Appraisals &amp; CTC Increment Calibration</h1>
          <p>Evaluate TL scorecard ratings and calibrate proposed CTC percentage increases.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', marginBottom: '20px', paddingBottom: '4px' }}>
        {[
          { id: 'proposals', label: 'Proposals Calibration' },
          { id: 'cycles', label: 'Review Cycle Manager' },
          { id: 'scorecards', label: 'TL Scorecards Inbox' },
          { id: 'promotions', label: 'Promotion Flow Tracker' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAppraisalTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: appraisalTab === tab.id ? 'var(--accent-pink)' : 'var(--text-muted)',
              borderBottom: appraisalTab === tab.id ? '2.5px solid var(--accent-pink)' : 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {appraisalTab === 'proposals' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <form onSubmit={handleProposeIncrement} className="card flex-2" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0 }}>
            <h3>CTC Projections Worksheet</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
              <label style={{ fontSize: '12px' }}>Target Employee</label>
              <select value={selectedEmpId} onChange={(e) => { setSelectedEmpId(Number(e.target.value)); setRevealBank(false); }} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                {db.employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Current Annual CTC</span>
                  <strong style={{ fontSize: '15px' }}>₹{currentAnnualCTC.toLocaleString()}</strong>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Performance Rating Band</span>
                  <strong style={{ fontSize: '15px', color: 'var(--accent-pink)' }}>A (TL Endorsed)</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Proposed Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={proposedCTC}
                    onChange={(e) => handleCTCChange(Number(e.target.value))}
                    required
                    style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Increment Percentage (%)</label>
                  <input
                    type="number"
                    value={incrementPct}
                    onChange={(e) => handlePctChange(Number(e.target.value))}
                    required
                    step="0.1"
                    style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Annual Budget Deficit Impact:</span>
                  <strong style={{ color: 'red' }}>+ ₹{(proposedCTC - currentAnnualCTC).toLocaleString()} / year</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
                  <span>Grade Level Increment Impact:</span>
                  <strong>Grade {emp.grade} → Grade {emp.grade}</strong>
                </div>
              </div>
            </div>

            <button type="submit" className="strategic-list-item" style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Propose CTC Increment &amp; Submit
            </button>
          </form>

          {/* Calibrator details info */}
          <div className="card flex-1" style={{ margin: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3>ℹ️ Increment Policy Guidelines</h3>
            <ul style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
              <li><strong>Maker-Checker Flow:</strong> Calibrations submitted by HR (Maker) must be Checker authorized by CEO.</li>
              <li><strong>Performance Band A:</strong> Recommends 10% - 25% increments basis scorecards.</li>
              <li><strong>Statutory PF:</strong> Increments will trigger dynamic PF recalculated contributions (12% of basic).</li>
              <li><strong>Retroactive:</strong> Backdated effective dates will generate dynamic salary arrears processed on future cycles automatically.</li>
            </ul>
          </div>
        </div>
      )}

      {appraisalTab === 'cycles' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Active cycles tree */}
          <div className="table-container flex-2" style={{ margin: 0 }}>
            <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>System Appraisal Calibration Cycles</div>
            <table>
              <thead>
                <tr>
                  <th>Cycle Name</th>
                  <th>Review Period</th>
                  <th>Start Date</th>
                  <th>Self-Assessment Deadline</th>
                  <th>TL Approval Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {db.appraisalCycles?.map((cy, idx) => (
                  <tr key={idx}>
                    <td><strong>{cy.name}</strong></td>
                    <td><span className="badge-pill bg-blue">{cy.period.toUpperCase()}</span></td>
                    <td>{cy.start_date}</td>
                    <td>{cy.self_deadline}</td>
                    <td>{cy.tl_review_deadline}</td>
                    <td><span className="badge-pill bg-green">{cy.status}</span></td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)' }}>No cycles configured. Seed a new one on the right.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Form to launch cycle */}
          <form onSubmit={handleCreateCycle} className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0 }}>
            <h3>🚀 Launch Review Cycle</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '12px 0' }}>
              <label style={{ fontSize: '12px' }}>Cycle Identifier Name</label>
              <input type="text" value={cycleName} onChange={(e) => setCycleName(e.target.value)} required placeholder="Q1 2026 Appraisal Calibration" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Review Period Frequency</label>
              <select value={reviewPeriod} onChange={(e) => setReviewPeriod(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option value="annual">Annual Calibration</option>
                <option value="bi_annual">Bi-Annual Calibration</option>
                <option value="quarterly">Quarterly Review</option>
              </select>

              <label style={{ fontSize: '12px' }}>Calibration Launch Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Cycle Completion End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
            </div>
            <button type="submit" className="print-btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none' }}>
              Initiate Appraisal Cycle
            </button>
          </form>
        </div>
      )}

      {appraisalTab === 'scorecards' && (
        <div className="table-container">
          <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Performance Scorecard Inbox (TL-Submitted)</div>
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Assigned Evaluator (TL)</th>
                <th>Performance Band Rating</th>
                <th>TL Feedback Comments</th>
                <th>Reminder Alert</th>
              </tr>
            </thead>
            <tbody>
              {scorecards.map((sc, idx) => (
                <tr key={idx}>
                  <td><strong>{sc.employee_name}</strong></td>
                  <td>{sc.tl_name}</td>
                  <td><span className="badge-pill bg-pink">{sc.rating}</span></td>
                  <td style={{ fontSize: '12px', fontStyle: 'italic', maxWidth: '300px' }}>"{sc.comments}"</td>
                  <td>
                    <button
                      className="print-btn"
                      style={{ padding: '4px 8px', fontSize: '10px' }}
                      onClick={() => alert(`TL [${sc.tl_name}] notified! Calibrations scorecard audit requested.`)}
                    >
                      Acknowledge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {appraisalTab === 'promotions' && (
        <div className="table-container">
          <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Corporate Promotions &amp; Designations Transfer Pipeline</div>
          <table>
            <thead>
              <tr>
                <th>Employee Profile</th>
                <th>Current Title Designation</th>
                <th>Proposed Designation Title</th>
                <th>Promotion Approval Flow</th>
              </tr>
            </thead>
            <tbody>
              {promotionTracker.map((pr, idx) => (
                <tr key={idx}>
                  <td><strong>{pr.name}</strong></td>
                  <td>{pr.current}</td>
                  <td><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{pr.proposed}</span></td>
                  <td>
                    <span className="badge-pill bg-green" style={{ textTransform: 'uppercase' }}>
                      {pr.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ExitFnFView({ db, onUpdateDb }) {
  const [exitTab, setExitTab] = useState('resignations'); // resignations | assets | fnf | noc
  const [selectedResignId, setSelectedResignId] = useState(1);
  const [relievingDate, setRelievingDate] = useState('2026-06-20');
  const [hrSign, setHrSign] = useState('');

  // Asset return checkboxes states (strict verification gates)
  const [assetLaptop, setAssetLaptop] = useState(false);
  const [assetToken, setAssetToken] = useState(false);
  const [assetPhone, setAssetPhone] = useState(false);

  // FnF computation states
  const [earnedSalary, setEarnedSalary] = useState(35000);
  const [reimbursements, setReimbursements] = useState(5000);
  const [gratuity, setGratuity] = useState(0);
  const [fnfComputed, setFnfComputed] = useState(false);

  const activeResignation = db.resignations?.find(r => r.id === selectedResignId) || { id: 1, employee_id: 103, status: 'pending', reason: 'Higher studies.' };
  const exitingEmp = db.employees.find(e => e.id === activeResignation.employee_id) || { name: 'Staff', bank_name: 'HDFC', account_number: '0000', email: 'staff@nsg.com' };

  // Sync loan deduction dynamically from active payroll loans
  const activeLoan = db.loans?.find(l => l.employee_id === exitingEmp.id && l.status === 'active');
  const loanDeduction = activeLoan ? activeLoan.outstanding_balance : 0;

  // Sync EL Encashment dynamically from leave balance
  const empLeave = db.leaveBalances?.find(b => b.employee_id === exitingEmp.id) || { EL: 0 };
  const elEncashment = Math.round(empLeave.EL * 1200); // 1200 per day salary simulated

  const totalFnFPayout = earnedSalary + elEncashment + reimbursements + gratuity - loanDeduction;

  const handleApproveResignation = () => {
    const updated = db.resignations.map(r => {
      if (r.id === selectedResignId) {
        return { ...r, status: 'approved', LWD: relievingDate };
      }
      return r;
    });

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Exits',
      record_id: selectedResignId,
      action_type: 'verify_doc',
      change_diff: { exit_status: 'approved', last_working_day: relievingDate },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      resignations: updated,
      auditLogs: newLogs
    });

    alert(`Resignation exit approved for ${exitingEmp.name}! Corporate offboarding lists enqueued.`);
  };

  const handleComputeFnF = () => {
    setFnfComputed(true);
    alert('Full & Final Settlement computed successfully based on live leave balances and active loan ledgers!');
  };

  const handleFinalizeFnF = () => {
    // strict gate: assets must be fully returned
    if (!assetLaptop || !assetToken || !assetPhone) {
      alert('WARNING: Compliance Gate Engaged! Cannot finalize FnF settlement until all issued assets are returned and verified by HR.');
      return;
    }

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Exits',
      record_id: exitingEmp.id,
      action_type: 'payroll_lock',
      change_diff: { fnf_settlement: 'finalized', net_payout: totalFnFPayout },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    // update resignation status to cleared
    const updatedResigns = db.resignations.map(r => {
      if (r.id === selectedResignId) {
        return { ...r, status: 'cleared' };
      }
      return r;
    });

    onUpdateDb({
      ...db,
      resignations: updatedResigns,
      auditLogs: newLogs
    });

    alert(`Settlement finalized for ${exitingEmp.name}. Net Payout of ₹${totalFnFPayout.toLocaleString()} approved.`);
  };

  const handleSignNOC = (e) => {
    e.preventDefault();
    if (!hrSign.trim()) {
      alert('Please fill in your digital signature to sign off.');
      return;
    }

    const updated = db.employees.map(emp => {
      if (emp.id === exitingEmp.id) {
        return { ...emp, status: 'inactive' };
      }
      return emp;
    });

    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Exits',
      record_id: exitingEmp.id,
      action_type: 'verify_doc',
      change_diff: { noc_stamped: 'fully_signed', account_status: 'deactivated' },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      employees: updated,
      auditLogs: newLogs
    });

    alert(`NOC fully signed and dispatched to ${exitingEmp.name} secure email portal. ERP login session revoked.`);
    setHrSign('');
  };

  const assetsFullyReturned = assetLaptop && assetToken && assetPhone;

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Exits &amp; Final settlements</h1>
          <p>Track notice checkpoints, run asset checklist returns, and compute Full &amp; Final payouts.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', marginBottom: '20px', paddingBottom: '4px' }}>
        {[
          { id: 'resignations', label: 'Resignations Tracker' },
          { id: 'assets', label: 'Asset Return Checklist' },
          { id: 'fnf', label: 'FnF Payout Calculator' },
          { id: 'noc', label: 'NOC e-Sign Portal' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setExitTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: exitTab === tab.id ? 'var(--accent-pink)' : 'var(--text-muted)',
              borderBottom: exitTab === tab.id ? '2.5px solid var(--accent-pink)' : 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {exitTab === 'resignations' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Active resignation notice queues */}
          <div className="table-container flex-2" style={{ margin: 0 }}>
            <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Notice Period Resignation Registry</div>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Submission Date</th>
                  <th>Last Working Date (LWD)</th>
                  <th>Urgent Exit Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {db.resignations?.map((r, idx) => {
                  const employee = db.employees.find(e => e.id === r.employee_id) || { name: 'Unknown' };
                  return (
                    <tr key={idx} onClick={() => setSelectedResignId(r.id)} style={{ cursor: 'pointer', backgroundColor: selectedResignId === r.id ? 'rgba(236,72,153,0.05)' : 'transparent' }}>
                      <td>
                        <strong>{employee.name}</strong>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{employee.designation}</div>
                      </td>
                      <td>{r.resignation_date}</td>
                      <td>{r.LWD}</td>
                      <td style={{ fontSize: '11.5px', maxWidth: '180px' }}>"{r.reason}"</td>
                      <td>
                        <span className={`badge-pill ${r.status === 'pending' ? 'badge-gold' : r.status === 'approved' ? 'badge-blue' : 'badge-green'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Form to calibrate notice period */}
          {activeResignation && (
            <div className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0 }}>
              <h3>🚪 Notice Period Calibrator</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Resigning Employee</span>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{exitingEmp.name}</div>
                </div>

                <label style={{ fontSize: '12px' }}>Confirmed Relieving Date (LWD)</label>
                <input
                  type="date"
                  value={relievingDate}
                  onChange={(e) => setRelievingDate(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                />

                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Default notice period is 30 days. Early relieving overrides will create immutable audit logs.
                </div>
              </div>

              {activeResignation.status === 'pending' ? (
                <button
                  className="print-btn"
                  style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none' }}
                  onClick={handleApproveResignation}
                >
                  Approve Resignation Exit
                </button>
              ) : (
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center', fontSize: '12px' }}>
                  Notice period approved ✓ (LWD: {activeResignation.LWD})
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {exitTab === 'assets' && (
        <div style={{ display: 'flex', gap: '24px', justify: 'center' }}>
          <div className="card flex-2" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0 }}>
            <h3>🛠️ Asset Allocation Checklist Checklist</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Confirm all corporate physical hardware properties are checked as returned by corresponding IT Leads before F&amp;F settlement is unblocked.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <input type="checkbox" checked={assetLaptop} onChange={(e) => setAssetLaptop(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <div>
                  <strong>Corporate MacBook Pro Silicon</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SN: NSG-MAC-093 | Verified physical casing clean</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <input type="checkbox" checked={assetToken} onChange={(e) => setAssetToken(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <div>
                  <strong>RSA Security Hardware OTP Token</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: RSA-8472-F | Revoked MFA connections</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                <input type="checkbox" checked={assetPhone} onChange={(e) => setAssetPhone(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <div>
                  <strong>Corporate Mobile (iPhone SE)</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SN: NSG-PHN-201 | Sim-card retrieved and archived</div>
                </div>
              </label>
            </div>
          </div>

          <div className="card flex-1" style={{ margin: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3>🔒 Lock Gate Compliance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', marginTop: '16px' }}>
              {assetsFullyReturned ? (
                <div style={{ color: 'var(--accent-green)' }}>
                  <CheckCircle size={48} />
                  <h4 style={{ margin: '8px 0 0 0' }}>All Assets Returned</h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Final FnF and NOC dispatch channels unlocked.</span>
                </div>
              ) : (
                <div style={{ color: '#fbbf24' }}>
                  <Lock size={48} />
                  <h4 style={{ margin: '8px 0 0 0' }}>F&amp;F Settlements Locked</h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>You must check off all 3 assets as returned to unblock corporate clearance settlement files.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {exitTab === 'fnf' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Computation Form */}
          <div className="card flex-2" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0 }}>
            <h3>💰 Settlement Payout computation Worksheet</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Accrued earned salary till LWD</label>
                <input type="number" value={earnedSalary} onChange={(e) => setEarnedSalary(Number(e.target.value))} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>EL Encashment (Synced Leave Balance)</label>
                <input type="text" readOnly value={`₹${elEncashment.toLocaleString()} (${empLeave.EL} EL days)`} style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '8px', borderRadius: '6px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Reimbursements &amp; Expense claims</label>
                <input type="number" value={reimbursements} onChange={(e) => setReimbursements(Number(e.target.value))} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Gratuity Accumulation Payout</label>
                <input type="number" value={gratuity} onChange={(e) => setGratuity(Number(e.target.value))} style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Outstanding Loan Deduction (Payroll Loans)</label>
                <input type="text" readOnly value={`- ₹${loanDeduction.toLocaleString()} (${activeLoan ? 'Active Loan Outstanding' : 'No Loans outstanding'})`} style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'red', padding: '8px', borderRadius: '6px', fontWeight: 'bold' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <button className="print-btn" onClick={handleComputeFnF}>Compute Net FnF Payout</button>
            </div>
          </div>

          {/* Settlement result box */}
          {fnfComputed && (
            <div className="card flex-1" style={{ margin: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3>💰 Computed Net F&amp;F Ledger</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', margin: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gross Additions:</span>
                  <strong>₹{(earnedSalary + elEncashment + reimbursements + gratuity).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Deductions:</span>
                  <strong style={{ color: 'red' }}>- ₹{loanDeduction.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyBetween: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                  <span>Net FnF Payout:</span>
                  <span style={{ color: 'var(--accent-pink)' }}>₹{totalFnFPayout.toLocaleString()}</span>
                </div>
              </div>

              <button
                disabled={!assetsFullyReturned || activeResignation.status === 'cleared'}
                onClick={handleFinalizeFnF}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  backgroundColor: (assetsFullyReturned && activeResignation.status !== 'cleared') ? 'var(--accent-pink)' : 'rgba(255,255,255,0.05)',
                  color: (assetsFullyReturned && activeResignation.status !== 'cleared') ? '#fff' : 'var(--text-muted)',
                  cursor: (assetsFullyReturned && activeResignation.status !== 'cleared') ? 'pointer' : 'not-allowed',
                  border: (assetsFullyReturned && activeResignation.status !== 'cleared') ? 'none' : '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                {!assetsFullyReturned && <Lock size={14} />} 
                {activeResignation.status === 'cleared' ? 'Settlement Finalized ✓' : 'Finalize FnF Settlement'}
              </button>
            </div>
          )}
        </div>
      )}

      {exitTab === 'noc' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <form onSubmit={handleSignNOC} className="card flex-2" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0, padding: '24px' }}>
            <div style={{ border: '1px solid var(--border-color)', padding: '24px', borderRadius: '12px', backgroundColor: 'var(--bg-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15px', marginBottom: '20px', letterSpacing: '1px' }}>NO OBJECTION CERTIFICATE</div>
              
              <p>Date: {new Date().toLocaleDateString()}</p>
              
              <p>
                This is to certify that <strong>{exitingEmp.name}</strong>, holding designation <strong>{exitingEmp.designation}</strong> in 
                the <strong>{exitingEmp.department}</strong> department, has resigned from employment and is fully relieved of duties effective 
                on last working date <strong>{activeResignation.LWD}</strong>.
              </p>

              <p>
                We confirm that the employee has completed all handovers, returned corporate physical properties, and cleared all full and final 
                settlement ledgers (Net F&amp;F: ₹{totalFnFPayout.toLocaleString()}) without outstanding advances.
              </p>

              <p>We wish them outstanding success in all future professional endeavors.</p>
              
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div>System Checked: NSG ERP Failsafe</div>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Assets &amp; FnF Cleared ✓</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <input
                    type="text"
                    value={hrSign}
                    onChange={(e) => setHrSign(e.target.value)}
                    required
                    placeholder="Input Digital Sign..."
                    style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', color: '#fff', fontSize: '13px', textAlign: 'right', outline: 'none', width: '180px', fontStyle: 'italic' }}
                  />
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Authorized HR Manager Signature</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={activeResignation.status !== 'cleared' || exitingEmp.status === 'inactive'}
              style={{
                marginTop: '16px',
                width: '100%',
                justifyContent: 'center',
                backgroundColor: (activeResignation.status === 'cleared' && exitingEmp.status !== 'inactive') ? 'var(--accent-pink)' : 'rgba(255,255,255,0.05)',
                color: (activeResignation.status === 'cleared' && exitingEmp.status !== 'inactive') ? '#fff' : 'var(--text-muted)',
                cursor: (activeResignation.status === 'cleared' && exitingEmp.status !== 'inactive') ? 'pointer' : 'not-allowed',
                border: (activeResignation.status === 'cleared' && exitingEmp.status !== 'inactive') ? 'none' : '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              {activeResignation.status !== 'cleared' && <Lock size={14} />}
              {exitingEmp.status === 'inactive' ? 'NOC Fully Dispatched & Session Revoked ✓' : 'Sign & Dispatch NOC Certificate'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function LearningLndView({ db, onUpdateDb }) {
  const [lndTab, setLndTab] = useState('progress'); // progress | tracks | assigner
  
  // Track Builder States
  const [trackName, setTrackName] = useState('');
  const [trackDept, setTrackDept] = useState('All');
  const [m1Title, setM1Title] = useState('');
  const [m2Title, setM2Title] = useState('');

  const handleCreateTrack = (e) => {
    e.preventDefault();
    if (!trackName.trim()) return;

    const newTrack = {
      id: Date.now(),
      name: trackName,
      department: trackDept,
      modules: [
        { id: 1, title: m1Title || 'Induction Session 1', duration: 30, has_quiz: true },
        { id: 2, title: m2Title || 'Technical Guidelines', duration: 45, has_quiz: true }
      ],
      is_mandatory: true
    };

    onUpdateDb({
      ...db,
      trainingTracks: [...(db.trainingTracks || []), newTrack]
    });

    setTrackName('');
    setM1Title('');
    setM2Title('');
    alert(`Training Track ${newTrack.name} successfully deployed to LMS!`);
  };

  const handleSimulatePass = (empId) => {
    // Find or seed training progress for employee
    const existingIndex = db.trainingProgress?.findIndex(p => p.employee_id === empId);
    let updatedProgress;

    if (existingIndex !== -1 && existingIndex !== undefined) {
      updatedProgress = db.trainingProgress.map(p => {
        if (p.employee_id === empId) {
          return {
            ...p,
            completed_modules: 2,
            quiz_score: 92,
            passed: true
          };
        }
        return p;
      });
    } else {
      updatedProgress = [...(db.trainingProgress || []), {
        id: Date.now(),
        employee_id: empId,
        track_id: 1,
        completed_modules: 2,
        quiz_score: 92,
        passed: true
      }];
    }

    // Also auto complete the corresponding onboarding task for them if present
    const updatedTasks = db.onboardingTasks?.map(t => {
      if (t.instance_id === empId && t.task_name.includes('Induction Quiz')) {
        return {
          ...t,
          status: 'completed',
          completed_at: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    const emp = db.employees.find(e => e.id === empId) || { name: 'Staff' };
    const newLogs = [...db.auditLogs, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      initiator_id: 'Sarah Jenkins',
      module: 'Learning',
      record_id: empId,
      action_type: 'verify_doc',
      change_diff: { quiz_passed: true, score: 92, probation_lock_released: emp.name },
      ip_address: '192.168.1.104',
      client_agent: 'Chrome / Windows'
    }];

    onUpdateDb({
      ...db,
      trainingProgress: updatedProgress,
      onboardingTasks: updatedTasks || [],
      auditLogs: newLogs
    });

    alert(`Quiz pass simulated for ${emp.name}! Quiz Score: 92% committed. Compliance lock-gate successfully unblocked.`);
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Inductions &amp; Training Tracks (LMS)</h1>
          <p>Plan corporate compliance tracks and track onboarding learning milestones.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', marginBottom: '20px', paddingBottom: '4px' }}>
        {[
          { id: 'progress', label: 'Quiz & Compliance Progress' },
          { id: 'tracks', label: 'Training Course Tracks' },
          { id: 'assigner', label: 'Mandatory Assigner matrix' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setLndTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: lndTab === tab.id ? 'var(--accent-pink)' : 'var(--text-muted)',
              borderBottom: lndTab === tab.id ? '2.5px solid var(--accent-pink)' : 'none',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {lndTab === 'progress' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Compliance checklist */}
          <div className="table-container flex-2" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Mandatory Inductions Track</th>
                  <th>Modules Completed</th>
                  <th>Quiz Score</th>
                  <th>Lock Gate Status</th>
                  <th>Actions Panel</th>
                </tr>
              </thead>
              <tbody>
                {db.employees.map(e => {
                  const progress = db.trainingProgress?.find(p => p.employee_id === e.id) || { completed_modules: 0, quiz_score: 0, passed: false };
                  return (
                    <tr key={e.id}>
                      <td><strong>{e.name}</strong></td>
                      <td>Corporate Induction Track 1</td>
                      <td>{progress.completed_modules} / 2 Modules</td>
                      <td style={{ fontWeight: 'bold', color: progress.passed ? 'var(--accent-green)' : '#fbbf24' }}>
                        {progress.quiz_score > 0 ? `${progress.quiz_score}%` : 'Not Attempted'}
                      </td>
                      <td>
                        <span className={`badge-pill ${progress.passed ? 'badge-green' : 'badge-gold'}`}>
                          {progress.passed ? 'Unlocked (Confirm Enabled)' : 'Locked (Confirm Blocked)'}
                        </span>
                      </td>
                      <td>
                        {!progress.passed ? (
                          <button
                            className="print-btn"
                            style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none' }}
                            onClick={() => handleSimulatePass(e.id)}
                          >
                            Simulate Pass
                          </button>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Lock released ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card flex-1" style={{ margin: 0, borderLeft: '4px solid var(--accent-pink)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3>💡 Probation Gate Trigger</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '12px' }}>
              <strong>Lock Gate Compliance Check:</strong> The Employee Registry probation confirmation workflow queries training progress records reactively. 
              New hires must clear the induction quiz with a score ≥ 80% to release the confirm lock.
            </p>
          </div>
        </div>
      )}

      {lndTab === 'tracks' && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Configured Tracks list */}
          <div className="table-container flex-2" style={{ margin: 0 }}>
            <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Active Training tracks in LMS</div>
            <table>
              <thead>
                <tr>
                  <th>Course Track Name</th>
                  <th>Target Department</th>
                  <th>Syllabus Duration</th>
                  <th>Mandatory</th>
                </tr>
              </thead>
              <tbody>
                {db.trainingTracks?.map((tr, idx) => (
                  <tr key={idx}>
                    <td><strong>{tr.name}</strong></td>
                    <td>{tr.department}</td>
                    <td>{tr.modules?.reduce((acc, m) => acc + m.duration, 0) || 75} mins (2 modules)</td>
                    <td>{tr.is_mandatory ? 'Yes ✓' : 'Optional'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form to create track */}
          <form onSubmit={handleCreateTrack} className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0 }}>
            <h3>⚙️ LMS Course Track Builder</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '12px 0' }}>
              <label style={{ fontSize: '12px' }}>Track Name</label>
              <input type="text" value={trackName} onChange={(e) => setTrackName(e.target.value)} required placeholder="Corporate Code of Conduct" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Department Scope</label>
              <select value={trackDept} onChange={(e) => setTrackDept(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="IT">IT</option>
              </select>

              <label style={{ fontSize: '12px' }}>Module 1 Title</label>
              <input type="text" value={m1Title} onChange={(e) => setM1Title(e.target.value)} placeholder="Values and Ethics" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />

              <label style={{ fontSize: '12px' }}>Module 2 Title</label>
              <input type="text" value={m2Title} onChange={(e) => setM2Title(e.target.value)} placeholder="Anti-harassment & POSH" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px' }} />
            </div>
            <button type="submit" className="print-btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none' }}>
              Publish LMS Course Track
            </button>
          </form>
        </div>
      )}

      {lndTab === 'assigner' && (
        <div className="table-container">
          <div className="pipeline-title" style={{ padding: '16px 16px 0 16px' }}>Compliance Induction Assignment Matrix Grid</div>
          <table>
            <thead>
              <tr>
                <th>Training Track Course</th>
                <th>Engineering Department</th>
                <th>Sales Department</th>
                <th>IT Department</th>
                <th>Marketing Department</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>NSG Corporate Inductions (L1)</strong></td>
                <td><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Mandatory ✓</span></td>
                <td><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Mandatory ✓</span></td>
                <td><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Mandatory ✓</span></td>
                <td><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Mandatory ✓</span></td>
              </tr>
              <tr>
                <td><strong>Systems Architecture &amp; security (L2)</strong></td>
                <td><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Mandatory ✓</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>Not Assigned</span></td>
                <td><span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Mandatory ✓</span></td>
                <td><span style={{ color: 'var(--text-muted)' }}>Not Assigned</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 14. REPORTS ENGINE VIEW
// ==========================================
export function ReportsEngineView({ db, onUpdateDb }) {
  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Reports &amp; BI Engine</h1>
          <p>Export staff attrition graphs, payroll costs, and carryover leaf utilization rates.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
          <span className="card-title">Employee Attrition Rate</span>
          <span className="metric-value">4.2%</span>
          <span className="info-txt">Voluntary separations this year</span>
        </div>
        <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
          <span className="card-title">Payroll Cost Payouts</span>
          <span className="metric-value">₹99,800</span>
          <span className="info-txt">Total gross payments last month</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 15. AUDIT LOGS VIEW (NEW)
// ==========================================
export function DepartmentAuditView({ db, onUpdateDb }) {
  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Department Action Audit Logs</h1>
          <p>Monospaced, append-only immutable registry capturing data changes, masked account displays, and exports.</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Initiated By</th>
              <th>Module Category</th>
              <th>Record ID</th>
              <th>Action Type</th>
              <th>Simulated Diff Changes</th>
            </tr>
          </thead>
          <tbody>
            {db.auditLogs.map(log => (
              <tr key={log.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td><strong>{log.initiator_id}</strong></td>
                <td>{log.module}</td>
                <td><span className="code-span">#{log.record_id}</span></td>
                <td>
                  <span className="badge-pill bg-pink">
                    {log.action_type.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  {JSON.stringify(log.change_diff)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 16. SETTINGS VIEW
// ==========================================
export function HrSettingsView({ db, onUpdateDb }) {
  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to reset the client-side simulated database? This will restore all original seed values.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>HR Settings &amp; Holiday calendar</h1>
          <p>Tweak carryover leaf policies, add official holiday timelines, or reset your local simulator data.</p>
        </div>
        <div>
          <button className="print-btn" style={{ backgroundColor: 'red', color: '#fff', border: 'none' }} onClick={handleResetDemoData}>
            <RefreshCw size={16} /> Reset Demo Data
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Leave Policies */}
        <div className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
          <h3>Leave Policies Quick Config</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {LEAVE_POLICIES.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>{p.type} Policy:</span>
                <strong>{p.max_balance} days Max</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Holidays */}
        <div className="card flex-1" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3>Holiday Calendar Roster</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {HOLIDAYS.map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>{h.name}:</span>
                <strong>{h.date}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 17. MESSAGING & MEET VIEW
// ==========================================
export function HrMessagingView({ db, onUpdateDb }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John Doe', text: 'Hi Sarah, is Vikram Malhotra interview scheduled?', time: '10:00 AM' },
    { id: 2, sender: 'You', text: 'Yes, enqueued under Jitsi WebRTC launchers!', time: '10:05 AM' }
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'You', text: newMsg, time: 'Just now' }]);
    setNewMsg('');
  };

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Messaging channels</h1>
          <p>Collaborate in private department rooms or launch instant screening RTC calls.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch', height: '400px' }}>
        {/* Channels */}
        <div className="card flex-1" style={{ borderLeft: '4px solid var(--accent-pink)', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3>HR Chat Channels</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} /> #hr-dept-channel
            </div>
            <div style={{ padding: '10px', background: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Creating video room token...')}>
              <Video size={16} style={{ color: 'var(--accent-pink)' }} /> Launch Interview RTC Meeting
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="card flex-2" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <strong>Direct Message: John Doe</strong>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: m.sender === 'You' ? 'right' : 'left' }}>{m.sender}</div>
                <div style={{ padding: '10px', backgroundColor: m.sender === 'You' ? 'var(--accent-pink)' : 'var(--bg-tertiary)', borderRadius: '8px', color: '#fff', fontSize: '13px', marginTop: '4px' }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <input type="text" placeholder="Write message..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)} style={{ flex: 1, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px', borderRadius: '6px', outline: 'none' }} />
            <button type="submit" style={{ backgroundColor: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
