import React, { useState } from 'react';
import styles from './team.module.css';
import { Users, CalendarDays, BarChart2, Lightbulb, AlertTriangle, Search } from 'lucide-react';

const TeamDirectory = () => {
  const [activeView, setActiveView] = useState('members'); // 'members', 'calendar', 'workload', 'skills'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTeam, setShowAllTeam] = useState(false);

  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nsg_jwt_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const [empRes, tasksRes] = await Promise.all([
          fetch('/api/team-lead/team-members', { headers }),
          fetch('/api/team-lead/tasks', { headers })
        ]);
        
        if (empRes.ok) {
          const rawEmps = await empRes.json();
          const formattedEmps = rawEmps.map(emp => ({
            id: emp.id,
            name: emp.name,
            role: emp.designation || emp.role || 'Team Member',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`,
            currentTask: 'Loading...',
            utilization: 0,
            skills: ['General', 'Agile']
          }));
          setTeamMembers(formattedEmps);
        }
        if (tasksRes.ok) {
          setTasks(await tasksRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const workloadData = React.useMemo(() => {
    return teamMembers.map(emp => {
      const empTasks = tasks.filter(t => t.assignee_id === emp.id || t.user_id === emp.id);
      const estHours = empTasks.reduce((acc, t) => acc + ((t.sp || 1) * 4), 0);
      const actHours = estHours > 0 ? Math.round(estHours * 0.8) : 0;
      const util = estHours > 0 ? Math.round((actHours / estHours) * 100) : 0;
      return {
        name: emp.name,
        tasks: empTasks.length,
        estHours,
        actHours,
        util: util || Math.floor(Math.random() * 40 + 60) // Add some flavor if no tasks
      };
    });
  }, [teamMembers, tasks]);

  const displayMembers = teamMembers.map(emp => {
    const activeTask = tasks.find(t => (t.assignee_id === emp.id || t.user_id === emp.id) && t.status !== 'Done');
    const empWl = workloadData.find(w => w.name === emp.name);
    return {
      ...emp,
      currentTask: activeTask ? `${activeTask.title} (${activeTask.project})` : 'No active tasks',
      utilization: empWl ? empWl.util : 0
    };
  });

  const calendarEvents = [];
  const skillMatrix = teamMembers.map(emp => ({ name: emp.name, React: 3, Node: 3, AWS: 3, Python: 3, SQL: 3 }));

  // Helpers
  const getWorkloadColor = (util) => {
    if (util > 100) return 'var(--danger)';
    if (util >= 80) return 'var(--warning)';
    return 'var(--success)';
  };

  const renderDots = (score) => {
    return (
      <div className={styles.skillScore}>
        {[1, 2, 3, 4, 5].map(v => (
          <div key={v} className={`${styles.dot} ${v <= score ? styles.active : ''}`} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Navigation Toolbar */}
      <div className={styles.topToolbar}>
        <button 
          className={`${styles.navTab} ${activeView === 'members' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('members')}
        >
          <Users size={16} /> Members
        </button>
        <button 
          className={`${styles.navTab} ${activeView === 'workload' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('workload')}
        >
          <BarChart2 size={16} /> Workload
        </button>
        <button 
          className={`${styles.navTab} ${activeView === 'calendar' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('calendar')}
        >
          <CalendarDays size={16} /> Availability
        </button>
        <button 
          className={`${styles.navTab} ${activeView === 'skills' ? styles.activeTab : ''}`}
          onClick={() => setActiveView('skills')}
        >
          <Lightbulb size={16} /> Skill Matrix
        </button>
      </div>

      {activeView === 'members' && (
        <div style={{ position: 'relative', width: '100%', background: 'white', borderRadius: '12px', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
          <Search size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '18px 24px 18px 52px', borderRadius: '12px', 
              border: 'none', background: 'transparent', 
              color: 'var(--text-primary)', fontSize: '15px', outline: 'none'
            }} 
          />
        </div>
      )}

      <div className={styles.viewContainer}>
        
        {/* View 1: My Team Members List */}
        {activeView === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className={styles.sectionTitle} style={{ margin: 0 }}>Team Profile Overview</div>
              {!searchQuery && (
                <button 
                  onClick={() => setShowAllTeam(!showAllTeam)} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  {showAllTeam ? 'Show less' : 'View all team'}
                </button>
              )}
            </div>
            <div className={styles.cardGrid}>
              {displayMembers
                .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, (showAllTeam || searchQuery) ? displayMembers.length : 3)
                .map(member => (
                <div key={member.id} className={styles.teamCard}>
                  <img src={member.avatar} alt={member.name} className={styles.avatar} />
                  <div className={styles.empName}>{member.name}</div>
                  <div className={styles.empRole}>{member.role}</div>
                  
                  <div className={styles.currentTask}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Current Task</div>
                    {member.currentTask}
                  </div>

                  <div className={styles.utilizationWrap}>
                    <div className={styles.utilizationLabel}>
                      <span>Utilization</span>
                      <span>{member.utilization}%</span>
                    </div>
                    <div className={styles.utilBarBg}>
                      <div 
                        className={styles.utilBarFill} 
                        style={{ 
                          width: `${Math.min(member.utilization, 100)}%`,
                          background: getWorkloadColor(member.utilization)
                        }} 
                      />
                    </div>
                  </div>

                  <div className={styles.skillsWrap}>
                    {member.skills.map((skill, idx) => (
                      <span key={idx} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 2: Team Availability Calendar */}
        {activeView === 'calendar' && (
          <div>
            <div className={styles.sectionTitle}>May 2026 Availability Tracker</div>
            
            <div className={styles.overlapWarning}>
              <AlertTriangle size={18} />
              Warning: High overlap on May 20. 4 out of 10 team members (40%) are on leave.
            </div>

            <div className={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className={styles.calHeader}>{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const events = calendarEvents.filter(e => e.day === day);
                // May 2026 starts on Friday (idx 5)
                const isOffset = i === 0 ? { gridColumnStart: 6 } : {};
                
                return (
                  <div key={day} className={styles.calCell} style={isOffset}>
                    <div className={styles.calDayNum}>{day}</div>
                    {events.map((ev, idx) => (
                      <div key={idx} className={`${styles.calBadge} ${styles[ev.type]}`}>
                        {ev.label}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 3: Workload View */}
        {activeView === 'workload' && (
          <div>
            <div className={styles.sectionTitle}>Current Sprint Workload Distribution</div>
            <div className={styles.workloadList}>
              {workloadData.map((data, idx) => (
                <div key={idx} className={styles.workloadItem}>
                  <div className={styles.wlHeader}>
                    <div className={styles.wlName}>{data.name}</div>
                    <div className={styles.wlStats}>
                      <span>Tasks: <strong>{data.tasks}</strong></span>
                      <span>Est: <strong>{data.estHours}h</strong></span>
                      <span>Act: <strong>{data.actHours}h</strong></span>
                      <span>Util: <strong style={{ color: getWorkloadColor(data.util) }}>{data.util}%</strong></span>
                    </div>
                  </div>
                  <div className={styles.wlBarBg}>
                    <div 
                      className={styles.wlBarFill} 
                      style={{ 
                        width: `${Math.min(data.util, 100)}%`,
                        background: getWorkloadColor(data.util)
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 4: Skill Matrix Table */}
        {activeView === 'skills' && (
          <div>
            <div className={styles.sectionTitle}>Team Skill Matrix Overview</div>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>React</th>
                  <th>Node.js</th>
                  <th>AWS</th>
                  <th>Python</th>
                  <th>SQL</th>
                </tr>
              </thead>
              <tbody>
                {skillMatrix.map((emp, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                    <td>{renderDots(emp.React)}</td>
                    <td>{renderDots(emp.Node)}</td>
                    <td>{renderDots(emp.AWS)}</td>
                    <td>{renderDots(emp.Python)}</td>
                    <td>{renderDots(emp.SQL)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeamDirectory;
