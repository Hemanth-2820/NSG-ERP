import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Laptop, 
  AlertCircle,
  Bell,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

const Dashboard = ({ setActiveTab, setSelectedChatUser }) => {
  const [currentView, setCurrentView] = useState('main');
  const [expandedItem, setExpandedItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, listKey: '', id: null, action: '' });
  const [showAllTeam, setShowAllTeam] = useState(false);
  const [showAllWorkload, setShowAllWorkload] = useState(false);

  // ── Real API Data ──────────────────────────────────────────────────────────
  const [teamMembers, setTeamMembers] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nsg_jwt_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };

    const fetchDashboard = async () => {
      try {
        // Fetch team members and all tasks in parallel
        const [membersRes, tasksRes, annRes] = await Promise.all([
          fetch('/api/team-lead/team-members', { headers }),
          fetch('/api/team-lead/tasks', { headers }),
          fetch('/api/tl-portal/announcements', { headers })
        ]);

        if (annRes.ok) {
          setAnnouncements(await annRes.json());
        }

        if (membersRes.ok) {
          const members = await membersRes.json();
          // Map backend data to the format the UI expects
          setTeamMembers(members.map(m => ({
            id: m.id,
            name: m.name,
            initials: m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            // Derive status from attendance or default to online
            status: m.status === 'active' ? 'online' : m.status === 'on_leave' ? 'on_leave' : 'offline',
            role: m.designation || 'Team Member'
          })));
        }

        if (tasksRes.ok) {
          setMyTasks(await tasksRes.json());
        }
      } catch (e) {
        console.error('TL Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ── Derive sprint stats from real tasks ──────────────────────────────────
  const sprintData = {
    name: 'Current Sprint',
    pointsCompleted: myTasks.filter(t => t.status === 'done').reduce((s, t) => s + (t.sp || 1), 0),
    pointsTotal: myTasks.reduce((s, t) => s + (t.sp || 1), 0) || 1,
    tasks: {
      todo: myTasks.filter(t => t.status === 'pending').length,
      inProgress: myTasks.filter(t => t.status === 'in-progress').length,
      blocked: myTasks.filter(t => t.status === 'blocked').length,
      done: myTasks.filter(t => t.status === 'done').length,
    },
    velocityTrend: `${myTasks.filter(t => t.status === 'done').length} tasks done`
  };

  const progressPercentage = Math.min(100, (sprintData.pointsCompleted / sprintData.pointsTotal) * 100);
  const radius = 60;

  // ── Derive workload from team members + tasks ─────────────────────────────
  const teamWorkload = teamMembers.map(m => {
    const memberTasks = myTasks.filter(t => t.assignee === m.name || t.user_id === m.id);
    const activeTasks = memberTasks.filter(t => t.status !== 'done').length;
    const load = Math.min(100, activeTasks * 20); // 5 tasks = 100% load
    return { id: m.id, name: m.name, role: m.role, load };
  });

  const statusPriority = {
    'online': 1,
    'wfh': 2,
    'offline': 3,
    'on_leave': 4,
    'absent': 5
  };

  const sortedTeamMembers = [...teamMembers].sort((a, b) => (statusPriority[a.status] || 3) - (statusPriority[b.status] || 3));

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;


  const [pendingDetails, setPendingDetails] = useState({
    leaveRequests: [
      { id: 1, name: 'Alice Chen', desc: 'Annual Leave: May 12 - 13', employeeNote: "Need to attend to family matters." },
      { id: 2, name: 'Diana Prince', desc: 'Personal Leave: May 20', employeeNote: 'Attending a workshop.' },
      { id: 3, name: 'Fiona Gallagher', desc: 'Annual Leave: May 20 - 21', employeeNote: 'Pre-planned vacation trip.' },
      { id: 4, name: 'George Hale', desc: 'Annual Leave: May 20', employeeNote: 'Family event.' }
    ],
    timesheetCorrections: [
      { id: 1, name: 'Fiona Gallagher', desc: 'Date: Tue, May 9 - Missing 2 hours', employeeNote: 'I forgot to clock in after lunch.' },
      { id: 2, name: 'Hannah Lee', desc: 'Date: Wed, May 10 - Overtime (4h)', employeeNote: 'Stayed late to finalize the Q2 marketing presentation.' },
      { id: 3, name: 'Charlie Davis', desc: 'Date: Mon, May 8 - Forgot clock out', employeeNote: 'Rushed out due to an emergency.' },
      { id: 4, name: 'George Hale', desc: 'Date: Thu, May 11 - Project code fix', employeeNote: 'Logged hours against the wrong client project by mistake.' },
      { id: 5, name: 'Evan Wright', desc: 'Date: Mon, May 8 - Missing hours', employeeNote: "System was down so I couldn't log my morning hours." },
      { id: 6, name: 'Diana Prince', desc: 'Date: Fri, May 5 - Overtime (2h)', employeeNote: 'Approved overtime for the weekend deployment prep.' },
      { id: 7, name: 'Alice Chen', desc: 'Date: Tue, May 9 - Wrong project code', employeeNote: 'Accidentally booked to internal overhead.' }
    ],
    wfhRequests: [
      { id: 1, name: 'Bob Smith', desc: 'Date: Thursday, May 14', employeeNote: 'Having a plumber come over to fix a leak.' },
      { id: 2, name: 'George Hale', desc: 'Date: Friday, May 15', employeeNote: 'Need to stay home for emergency childcare.' }
    ],
    absentAlerts: [
      { id: 5, name: 'Evan Wright', initials: 'EW', desc: 'Date: Today - Unexplained Absence', employeeNote: 'No leave request filed. Requires follow-up.' },
      { id: 9, name: 'Ivy Green', initials: 'IG', desc: 'Date: Today - Unexplained Absence', employeeNote: 'No leave request filed. Requires follow-up.' },
      { id: 10, name: 'Jack White', initials: 'JW', desc: 'Date: Today - Unexplained Absence', employeeNote: 'No leave request filed. Requires follow-up.' }
    ]
  });

  const promptAction = (e, listKey, id, action) => {
    e.stopPropagation();
    setConfirmDialog({ isOpen: true, listKey, id, action });
  };

  const executeAction = () => {
    const { listKey, id } = confirmDialog;
    setPendingDetails(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter(item => item.id !== id)
    }));
    if (expandedItem === id) {
      setExpandedItem(null);
    }
    setConfirmDialog({ isOpen: false, listKey: '', id: null, action: '' });
  };

  const cancelAction = () => {
    setConfirmDialog({ isOpen: false, listKey: '', id: null, action: '' });
  };

  // 3. Pending Approvals Data
  const pendingApprovals = {
    leaveRequests: pendingDetails.leaveRequests.length,
    timesheetCorrections: pendingDetails.timesheetCorrections.length,
    wfhRequests: pendingDetails.wfhRequests.length
  };


  if (currentView !== 'main') {
    const title = currentView === 'leave' ? 'Leave Requests' : 
                  currentView === 'timesheet' ? 'Timesheet Corrections' : 
                  currentView === 'wfh' ? 'WFH Requests' : 'Absent Alerts';
    const listKey = currentView === 'leave' ? 'leaveRequests' : 
                    currentView === 'timesheet' ? 'timesheetCorrections' : 
                    currentView === 'wfh' ? 'wfhRequests' : 'absentAlerts';
    const data = pendingDetails[listKey];

    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.pageHeader}>
          <button 
            className={styles.backBtn} 
            onClick={() => {
              setCurrentView('main');
              setExpandedItem(null);
            }}
          >
            ← Back to Dashboard
          </button>
          <h2 className={styles.pageTitle}>{title}</h2>
        </div>
        
        <div className={styles.pageContent}>
          {data.map(item => (
            <div 
              key={item.id} 
              className={styles.pageListItem}
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.pageListItemInfo}>
                <div className={styles.pageListItemName}>
                  {item.name}
                  <span className={styles.expandIcon}>
                    {expandedItem === item.id ? '▲' : '▼'}
                  </span>
                </div>
                
                {expandedItem === item.id && (
                  <div className={styles.pageListItemDetails}>
                    <div className={styles.pageListItemDesc}>{item.desc}</div>
                    
                    {item.employeeNote && (
                      <div className={styles.employeeNote}>
                        <strong>Note:</strong> {item.employeeNote}
                      </div>
                    )}
                    
                    <textarea 
                      className={styles.reviewTextarea}
                      placeholder="Add a comment or description (optional)..."
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className={styles.pageListItemActions}>
                      <button 
                        className={styles.actionBtnApprove} 
                        onClick={(e) => promptAction(e, listKey, item.id, currentView === 'absent' ? 'notify HR' : 'approve')}
                      >
                        {currentView === 'absent' ? 'Notify HR 🔔' : 'Approve ✓'}
                      </button>
                      <button 
                        className={styles.actionBtnReject} 
                        onClick={(e) => promptAction(e, listKey, item.id, currentView === 'absent' ? 'dismiss' : 'reject')}
                      >
                        {currentView === 'absent' ? 'Dismiss ✕' : 'Reject ✕'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {confirmDialog.isOpen && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmModal}>
              <div className={styles.confirmTitle}>Confirm Action</div>
              <div className={styles.confirmText}>
                Are you sure you want to {confirmDialog.action} this request?
              </div>
              <div className={styles.confirmActions}>
                <button className={styles.confirmBtnCancel} onClick={cancelAction}>Cancel</button>
                <button 
                  className={confirmDialog.action === 'approve' || confirmDialog.action === 'notify HR' ? styles.confirmBtnApprove : styles.confirmBtnReject} 
                  onClick={executeAction}
                >
                  {confirmDialog.action === 'approve' ? 'Approve ✓' : 
                   confirmDialog.action === 'notify HR' ? 'Notify HR 🔔' : 
                   confirmDialog.action === 'reject' ? 'Reject ✕' : 'Dismiss ✕'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      
      {/* CEO Announcements Section */}
      {announcements.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>CEO Announcements</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {announcements.slice(0, 3).map(ann => (
              <div key={ann.id} style={{
                background: '#FFF', border: '1px solid #E2E8F0', borderLeft: ann.priority === 'Urgent' ? '4px solid #ef4444' : '4px solid #3b82f6',
                borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>{ann.author} • {ann.date}</span>
                  {ann.priority === 'Urgent' && <span style={{ background: '#FEF2F2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800 }}>URGENT</span>}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>{ann.title}</div>
                <div dangerouslySetInnerHTML={{ __html: ann.body }} style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, maxHeight: '3.6em', overflow: 'hidden' }}></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.topGrid}>
        {/* 1. Team Presence Grid */}
        <div className={styles.widgetCard} style={{ alignSelf: 'start' }}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <Users size={20} className={styles.widgetIcon} />
              Team Presence
            </div>
            <button 
              onClick={() => setShowAllTeam(!showAllTeam)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              {showAllTeam ? 'Show less' : 'View all team'}
            </button>
          </div>
          <div className={styles.avatarGrid}>
            {(showAllTeam ? sortedTeamMembers : sortedTeamMembers.slice(0, 4)).map(member => {
              let statusClass = '';
              switch(member.status) {
                case 'online': statusClass = styles.statusOnline; break;
                case 'wfh': statusClass = styles.statusWfh; break;
                case 'on_leave': statusClass = styles.statusLeave; break;
                case 'absent': statusClass = styles.statusAbsent; break;
                default: statusClass = styles.statusOffline;
              }

              return (
                <div 
                  key={member.id} 
                  className={styles.avatarWrapper}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                  onClick={() => {
                    if (setSelectedChatUser && setActiveTab) {
                      // Match ID format from messaging module
                      setSelectedChatUser(`dm-${member.id}`);
                      setActiveTab('messaging');
                    }
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div className={styles.avatarCircle}>
                    {member.initials}
                    <span className={`${styles.statusIndicator} ${statusClass}`} title={member.status} />
                  </div>
                  <span className={styles.avatarName}>{member.name}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* 2. Sprint Status Widget */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <Activity size={20} className={styles.widgetIcon} />
              Sprint Status
            </div>
          </div>
          <div className={styles.sprintContent}>
            <div className={styles.progressRingContainer}>
              <svg className={styles.progressRingSvg} viewBox="0 0 140 140">
                <circle
                  className={styles.progressRingTrack}
                  cx="70" cy="70" r={radius}
                />
                <circle
                  className={styles.progressRingFill}
                  cx="70" cy="70" r={radius}
                  style={{ strokeDasharray: circumference, strokeDashoffset }}
                />
              </svg>
              <div className={styles.progressRingCenter}>
                <span className={styles.progressPoints}>{sprintData.pointsCompleted}</span>
                <span className={styles.progressLabel}>/ {sprintData.pointsTotal} pts</span>
              </div>
            </div>
            
            <div className={styles.sprintDetails}>
              <h3 className={styles.sprintName}>{sprintData.name}</h3>
              <div className={styles.velocityTrend}>
                <TrendingUp size={16} />
                {sprintData.velocityTrend}
              </div>
              <div className={styles.taskCounters}>
                <div className={styles.taskCountItem}>
                  <span className={styles.taskCountNum}>{sprintData.tasks.todo}</span>
                  <span className={styles.taskCountLabel}>To Do</span>
                </div>
                <div className={styles.taskCountItem}>
                  <span className={styles.taskCountNum}>{sprintData.tasks.inProgress}</span>
                  <span className={styles.taskCountLabel}>In Progress</span>
                </div>
                <div className={`${styles.taskCountItem} ${styles.blocked}`}>
                  <span className={styles.taskCountNum}>{sprintData.tasks.blocked}</span>
                  <span className={styles.taskCountLabel}>Blocked</span>
                </div>
                <div className={styles.taskCountItem}>
                  <span className={styles.taskCountNum}>{sprintData.tasks.done}</span>
                  <span className={styles.taskCountLabel}>Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* 3. Pending Approvals Counter */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <CheckCircle size={20} className={styles.widgetIcon} />
              Pending Approvals
            </div>
          </div>
          <div className={styles.badgeList}>
            <div 
              className={styles.badgeItem}
              onClick={() => setCurrentView('leave')}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.badgeInfo}>
                <div className={`${styles.badgeIcon} ${styles.purple}`}>
                  <Calendar size={18} />
                </div>
                <span className={styles.badgeLabel}>Leave Requests</span>
              </div>
              <span className={styles.badgeCount}>{pendingApprovals.leaveRequests}</span>
            </div>

            <div 
              className={styles.badgeItem}
              onClick={() => setCurrentView('timesheet')}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.badgeInfo}>
                <div className={`${styles.badgeIcon} ${styles.blue}`}>
                  <Clock size={18} />
                </div>
                <span className={styles.badgeLabel}>Timesheet Corrections</span>
              </div>
              <span className={styles.badgeCount}>{pendingApprovals.timesheetCorrections}</span>
            </div>

            <div 
              className={styles.badgeItem}
              onClick={() => setCurrentView('wfh')}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.badgeInfo}>
                <div className={`${styles.badgeIcon} ${styles.orange}`}>
                  <Laptop size={18} />
                </div>
                <span className={styles.badgeLabel}>WFH Requests</span>
              </div>
              <span className={styles.badgeCount}>{pendingApprovals.wfhRequests}</span>
            </div>
          </div>
        </div>

        {/* 4. Today's Absent Alert */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
              Today's Absent Alert
            </div>
          </div>
          <div className={styles.alertList}>
            {pendingDetails.absentAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={styles.alertCard}
                onClick={() => {
                  setCurrentView('absent');
                  setExpandedItem(alert.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.alertAvatar}>{alert.initials}</div>
                <div className={styles.alertInfo}>
                  <h4 className={styles.alertName} style={{ margin: 0 }}>{alert.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Team Workload Bars */}
        <div className={styles.widgetCard}>
          <div className={styles.widgetHeader}>
            <div className={styles.widgetTitle}>
              <Users size={20} className={styles.widgetIcon} />
              Team Workload
            </div>
            <button 
              onClick={() => setShowAllWorkload(!showAllWorkload)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
            >
              {showAllWorkload ? 'Show less' : 'View all team'}
            </button>
          </div>
          <div className={styles.workloadList}>
            {(showAllWorkload ? teamWorkload : teamWorkload.slice(0, 4)).map(member => {
              let loadClass = styles.low;
              if (member.load > 80) loadClass = styles.high;
              else if (member.load > 50) loadClass = styles.medium;

              return (
                <div key={member.id} className={styles.workloadItem}>
                  <div className={styles.workloadInfo}>
                    <span className={styles.workloadName}>{member.name}</span>
                    <span className={styles.workloadRole}>{member.role}</span>
                  </div>
                  <div className={styles.workloadBarContainer}>
                    <div 
                      className={`${styles.workloadBarFill} ${loadClass}`} 
                      style={{ width: `${member.load}%` }}
                    />
                  </div>
                  <span className={styles.workloadValue}>{member.load}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
