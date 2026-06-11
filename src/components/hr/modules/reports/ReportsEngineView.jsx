import React, { useState, useMemo } from 'react';

export function ReportsEngineView() {
  const [db, setDb] = useState({});
  const onUpdateDb = setDb;
  const [activeReport, setActiveReport] = useState('overview');

  // ── LIVE COMPUTED METRICS ─────────────────────────────────────────────────

  const employees = db?.employees || [];
  const payslips  = db?.payslips  || [];
  const payrollRuns = db?.payrollRuns || [];
  const leaveBalances = db?.leaveBalances || [];
  const leaveRequests = db?.leaveRequests || [];
  const attendanceLogs = db?.attendanceLogs || [];
  const resignations = db?.resignations || [];
  const trainingProgress = db?.trainingProgress || [];
  const incrementProposals = db?.incrementProposals || [];
  const onboardingTasks = db?.onboardingTasks || [];

  // 1. Total headcount
  const totalHeadcount = employees.length;

  // 2. Attrition — count approved resignations
  const approvedResignations = resignations.filter(r => r.status === 'approved').length;
  const attritionRate = totalHeadcount > 0
    ? ((approvedResignations / totalHeadcount) * 100).toFixed(1)
    : '0.0';

  // 3. Payroll cost — last approved payroll run net total
  const approvedRuns = payrollRuns.filter(r => r.status === 'bank_transferred');
  const lastRun = approvedRuns[approvedRuns.length - 1];
  const getPayslipNet = (p) => p.net_pay ?? p.net ?? 0;
  const getPayslipGross = (p) => p.gross_pay ?? ((p.basic || 0) + (p.hra || 0) + (p.da || 0) + (p.allowances || 0));
  const getPayslipDeductions = (p) => p.total_deductions ?? ((p.epf || 0) + (p.tds || 0));

  const payrollCost = lastRun
    ? payslips.filter(p => p.payroll_run_id === lastRun.id).reduce((sum, p) => sum + getPayslipNet(p), 0)
    : payslips.reduce((sum, p) => sum + getPayslipNet(p), 0);

  // 4. Leave utilization — avg % of leave used across all employees
  const leaveUtil = leaveBalances.length > 0
    ? leaveBalances.reduce((sum, lb) => {
        const totalAlloc = 35; // 12 CL + 8 SL + 15 EL
        const used = (12 - (lb.CL ?? 12)) + (8 - (lb.SL ?? 8)) + (15 - (lb.EL ?? 15));
        return sum + (used / totalAlloc) * 100;
      }, 0) / leaveBalances.length
    : 0;

  // 5. Pending leave requests
  const pendingLeave = leaveRequests.filter(r => r.status === 'pending').length;

  // 6. Compliance lock — % employees who passed quiz
  const passedQuiz = trainingProgress.filter(p => p.passed).length;
  const complianceRate = totalHeadcount > 0
    ? Math.round((passedQuiz / totalHeadcount) * 100)
    : 0;

  // 7. Pending increment proposals
  const pendingProposals = incrementProposals.filter(p => p.status === 'pending_ceo').length;

  // 8. Onboarding completion %
  const completedOnboarding = onboardingTasks.filter(t => t.status === 'completed').length;
  const totalOnboarding = onboardingTasks.length;
  const onboardingPct = totalOnboarding > 0
    ? Math.round((completedOnboarding / totalOnboarding) * 100)
    : 0;

  // 9. Department breakdown
  const deptCounts = employees.reduce((acc, e) => {
    const dept = e.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // 10. Leave pending by employee
  const leaveByEmp = leaveRequests.filter(r => r.status === 'pending').slice(0, 5).map(r => {
    const emp = employees.find(e => e.id === r.employee_id);
    return { name: emp?.name || 'Unknown', type: r.leave_type, days: r.days || 1 };
  });

  // ── STAT CARD helper ───────────────────────────────────────────────────────
  const StatCard = ({ title, value, sub, color, icon }) => (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderLeft: `4px solid ${color}`,
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      transition: 'transform 0.15s',
      cursor: 'default'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{title}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 32, fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>
    </div>
  );

  // ── BAR CHART helper ───────────────────────────────────────────────────────
  const BarChart = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 110, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{d.label}</div>
            <div style={{ flex: 1, height: 22, background: 'var(--bg-primary)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${(d.value / max) * 100}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{d.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'payroll', label: '💰 Payroll' },
    { id: 'leave', label: '🌴 Leave' },
    { id: 'compliance', label: '📋 Compliance' },
    { id: 'workforce', label: '👥 Workforce' },
  ];

  return (
    <div className="component-container">
      <div className="component-header">
        <div>
          <h1>Reports & BI Engine</h1>
          <p>Live analytics from real HR data — payroll, leave, compliance, and workforce insights.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 24, paddingBottom: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveReport(t.id)} style={{
            background: 'none', border: 'none', padding: '6px 14px', cursor: 'pointer',
            color: activeReport === t.id ? 'var(--accent-pink)' : 'var(--text-muted)',
            borderBottom: activeReport === t.id ? '2.5px solid var(--accent-pink)' : '2.5px solid transparent',
            fontWeight: 600, fontSize: 13, transition: 'all 0.15s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeReport === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard title="Total Employees" value={totalHeadcount} sub="Active headcount" color="#60a5fa" icon="👥" />
            <StatCard title="Attrition Rate" value={`${attritionRate}%`} sub={`${approvedResignations} voluntary exits`} color="#f87171" icon="📉" />
            <StatCard title="Compliance Rate" value={`${complianceRate}%`} sub={`${passedQuiz}/${totalHeadcount} quiz passed`} color="#10b981" icon="✅" />
            <StatCard title="Pending Actions" value={pendingLeave + pendingProposals} sub="Leave + increment queue" color="#fbbf24" icon="⚡" />
          </div>

          {/* Department breakdown bar chart */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: 'var(--text-primary)' }}>👥 Headcount by Department</div>
            {Object.keys(deptCounts).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No employee data available.</div>
            ) : (
              <BarChart data={Object.entries(deptCounts).map(([label, value]) => ({ label, value }))} color="#60a5fa" />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-primary)' }}>📋 Onboarding Progress</div>
              <div style={{ position: 'relative', height: 10, background: 'var(--bg-primary)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${onboardingPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 10, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{completedOnboarding} / {totalOnboarding} tasks completed ({onboardingPct}%)</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-primary)' }}>🌴 Leave Utilization</div>
              <div style={{ position: 'relative', height: 10, background: 'var(--bg-primary)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${leaveUtil.toFixed(0)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Avg {leaveUtil.toFixed(1)}% of allocated leave used across all employees</div>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYROLL ── */}
      {activeReport === 'payroll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard title="Total Payslips Issued" value={payslips.length} sub="Across all periods" color="#60a5fa" icon="📄" />
            <StatCard title="Total Net Payout" value={`₹${payrollCost.toLocaleString('en-IN')}`} sub="From last approved run" color="#10b981" icon="💰" />
            <StatCard title="Pending Proposals" value={pendingProposals} sub="Awaiting CEO approval" color="#fbbf24" icon="⏳" />
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, overflowX: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>💰 Payslip Log</div>
            {payslips.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No payslips generated yet. Run payroll from Payroll Builder.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Employee', 'Period', 'Gross', 'Deductions', 'Net Pay'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payslips.slice(0, 10).map((p, i) => {
                    const emp = employees.find(e => e.id === p.employee_id);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{emp?.name || `Emp #${p.employee_id}`}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{p.period || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>₹{getPayslipGross(p).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 16px', color: '#f87171' }}>-₹{getPayslipDeductions(p).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700 }}>₹{getPayslipNet(p).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── LEAVE ── */}
      {activeReport === 'leave' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard title="Pending Requests" value={pendingLeave} sub="Awaiting HR approval" color="#fbbf24" icon="⏳" />
            <StatCard title="Approved This Year" value={leaveRequests.filter(r => r.status === 'approved').length} sub="Leave requests approved" color="#10b981" icon="✅" />
            <StatCard title="Avg Leave Used" value={`${leaveUtil.toFixed(1)}%`} sub="Of total allocation per employee" color="#60a5fa" icon="📊" />
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🌴 Leave Balance by Employee</div>
            {leaveBalances.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No leave balance data available.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Employee', 'CL Left', 'SL Left', 'EL Left', 'Total Left', 'Utilized'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaveBalances.map((lb, i) => {
                    const emp = employees.find(e => e.id === lb.employee_id);
                    const totalLeft = (lb.CL ?? 12) + (lb.SL ?? 8) + (lb.EL ?? 15);
                    const used = 35 - totalLeft;
                    const pct = Math.round((used / 35) * 100);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{emp?.name || `Emp #${lb.employee_id}`}</td>
                        <td style={{ padding: '12px 16px' }}>{lb.CL ?? 12}</td>
                        <td style={{ padding: '12px 16px' }}>{lb.SL ?? 8}</td>
                        <td style={{ padding: '12px 16px' }}>{lb.EL ?? 15}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10b981' }}>{totalLeft}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 80, height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: pct > 70 ? '#f87171' : '#fbbf24', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── COMPLIANCE ── */}
      {activeReport === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard title="Quiz Passed" value={passedQuiz} sub={`of ${totalHeadcount} employees`} color="#10b981" icon="✅" />
            <StatCard title="Not Attempted" value={totalHeadcount - trainingProgress.length} sub="Never opened quiz" color="#f87171" icon="❌" />
            <StatCard title="Compliance Rate" value={`${complianceRate}%`} sub="Induction gate unlock rate" color="#60a5fa" icon="🔓" />
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📋 Employee Compliance Status</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Employee', 'Modules Done', 'Quiz Score', 'Gate Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => {
                  const prog = trainingProgress.find(p => p.employee_id === emp.id);
                  const passed = prog?.passed || false;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{emp.name}</td>
                      <td style={{ padding: '12px 16px' }}>{prog?.completed_modules ?? 0} / 2</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: passed ? '#10b981' : '#fbbf24' }}>
                        {prog?.quiz_score ? `${prog.quiz_score}%` : 'Not attempted'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                          background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(251,191,36,0.1)',
                          color: passed ? '#10b981' : '#fbbf24',
                          border: `1px solid ${passed ? 'rgba(16,185,129,0.4)' : 'rgba(251,191,36,0.4)'}`
                        }}>
                          {passed ? '🔓 Unlocked' : '🔒 Locked'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── WORKFORCE ── */}
      {activeReport === 'workforce' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard title="Active Employees" value={totalHeadcount - approvedResignations} sub="Currently on payroll" color="#10b981" icon="👥" />
            <StatCard title="Attrition Rate" value={`${attritionRate}%`} sub={`${approvedResignations} exits this year`} color="#f87171" icon="📉" />
            <StatCard title="Departments" value={Object.keys(deptCounts).length} sub="Active teams" color="#a78bfa" icon="🏢" />
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18 }}>🏢 Department Headcount</div>
            {Object.keys(deptCounts).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No employee data.</div>
            ) : (
              <BarChart data={Object.entries(deptCounts).sort((a,b) => b[1]-a[1]).map(([label, value]) => ({ label, value }))} color="var(--accent-pink)" />
            )}
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📋 Employee Directory</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Name', 'Department', 'Designation', 'Grade', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => {
                  const exited = resignations.find(r => r.employee_id === emp.id && r.status === 'approved');
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', opacity: exited ? 0.5 : 1 }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{emp.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{emp.department || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>{emp.designation || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>G{emp.grade || 1}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                          background: exited ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          color: exited ? '#f87171' : '#10b981' }}>
                          {exited ? 'Exited' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
