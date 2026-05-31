import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, MapPin, Camera, Clock, GitCommit, CalendarDays, FileText, Home, Edit3 } from 'lucide-react';
import styles from './approvals.module.css';

// --- MOCK DATA ---
const leaveRequests = [
  { id: 1, emp: 'Alice Chen', type: 'Annual Leave', dates: 'May 20 - May 24', days: 5, reason: 'Family vacation to Hawaii. Need to disconnect.', overlap: true, overlapDetails: 'Bob Smith is also on Annual Leave from May 21 to May 23.' },
  { id: 2, emp: 'Bob Smith', type: 'Sick Leave', dates: 'May 18', days: 1, reason: 'High fever and doctor appointment.', overlap: false, overlapDetails: '' },
];

const timesheetRequests = [
  { id: 1, emp: 'Charlie Davis', hours: 42, commits: 18, match: true, breakdown: [{ task: 'API Integration', h: 20 }, { task: 'Bug Fixes', h: 22 }] },
  { id: 2, emp: 'Diana Prince', hours: 38, commits: 2, match: false, breakdown: [{ task: 'Documentation', h: 10 }, { task: 'Research', h: 28 }] },
];

const wfhRequests = [
  { id: 1, emp: 'Evan Wright', date: 'May 19', reason: 'Plumber coming to fix a leak.', verified: true, ip: '192.168.1.45 (Home ISP)' },
  { id: 2, emp: 'Fiona Gallagher', date: 'May 20', reason: 'Focus work on architectural design.', verified: false, ip: 'Unknown IP' },
];

const correctionRequests = [
  { id: 1, emp: 'George Hale', date: 'May 17', requested: '09:00 AM - 06:00 PM', reason: 'Forgot to clock in on mobile app due to dead battery.', sla: '12h left', coords: '37.7749° N, 122.4194° W' },
];

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('leave');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItem(null);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    alert(`${action} action triggered!`);
  };

  const renderList = () => {
    switch (activeTab) {
      case 'leave':
        return leaveRequests.map(req => (
          <div key={req.id} className={`${styles.listItem} ${selectedItem?.id === req.id ? styles.listItemActive : ''}`} onClick={() => setSelectedItem(req)}>
            <div className={styles.listItemHeader}>
              <span className={styles.empName}>{req.emp}</span>
              {req.overlap && <span className={styles.urgencyBadge}>Overlap Warning</span>}
            </div>
            <div className={styles.itemDesc}>{req.type} | {req.dates} ({req.days} days)</div>
            <div className={styles.actionRow}>
              <button className={styles.btnApprove} onClick={(e) => handleAction(e, 'Approve')}>Approve</button>
              <button className={styles.btnReject} onClick={(e) => handleAction(e, 'Reject')}>Reject</button>
            </div>
          </div>
        ));
      
      case 'timesheet':
        return timesheetRequests.map(req => (
          <div key={req.id} className={`${styles.listItem} ${selectedItem?.id === req.id ? styles.listItemActive : ''}`} onClick={() => setSelectedItem(req)}>
            <div className={styles.listItemHeader}>
              <span className={styles.empName}>{req.emp}</span>
              {!req.match && <span className={styles.urgencyBadge} style={{ backgroundColor: '#ef4444' }}>Audit Flag</span>}
            </div>
            <div className={styles.itemDesc}>Total Hours: {req.hours}h | Commits: {req.commits}</div>
            <div className={styles.actionRow}>
              <button className={styles.btnApprove} onClick={(e) => handleAction(e, 'Approve')}>Approve</button>
              <button className={styles.btnReject} onClick={(e) => handleAction(e, 'Reject')}>Reject w/ Reason</button>
            </div>
          </div>
        ));

      case 'wfh':
        return wfhRequests.map(req => (
          <div key={req.id} className={`${styles.listItem} ${selectedItem?.id === req.id ? styles.listItemActive : ''}`} onClick={() => setSelectedItem(req)}>
            <div className={styles.listItemHeader}>
              <span className={styles.empName}>{req.emp}</span>
            </div>
            <div className={styles.itemDesc}>Date: {req.date} | {req.reason}</div>
            <div className={styles.actionRow}>
              <button className={styles.btnApprove} onClick={(e) => handleAction(e, 'Approve')}>Approve</button>
              <button className={styles.btnReject} onClick={(e) => handleAction(e, 'Reject')}>Reject</button>
            </div>
          </div>
        ));

      case 'correction':
        return correctionRequests.map(req => (
          <div key={req.id} className={`${styles.listItem} ${selectedItem?.id === req.id ? styles.listItemActive : ''}`} onClick={() => setSelectedItem(req)}>
            <div className={styles.listItemHeader}>
              <span className={styles.empName}>{req.emp}</span>
              <span className={styles.urgencyBadge} style={{ backgroundColor: '#3b82f6' }}>SLA: {req.sla}</span>
            </div>
            <div className={styles.itemDesc}>{req.date} | {req.requested}</div>
            <div className={styles.actionRow}>
              <button className={styles.btnApprove} onClick={(e) => handleAction(e, 'Approve')}>Approve</button>
              <button className={styles.btnReject} onClick={(e) => handleAction(e, 'Reject')}>Reject</button>
            </div>
          </div>
        ));

      default:
        return null;
    }
  };

  const renderDetails = () => {
    if (!selectedItem) {
      return <div className={styles.emptyState}>Select a request from the list to view details.</div>;
    }

    switch (activeTab) {
      case 'leave':
        return (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitle}>{selectedItem.emp}</div>
              <div className={styles.detailSub}>{selectedItem.type} Request</div>
            </div>
            
            {selectedItem.overlap && (
              <div className={styles.warningBox}>
                <AlertTriangle size={16} />
                <span><strong>Team Availability Overlap:</strong> {selectedItem.overlapDetails}</span>
              </div>
            )}

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Dates Requested</div>
              <div className={styles.infoValue}>{selectedItem.dates} ({selectedItem.days} days)</div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Reason</div>
              <div className={styles.infoValue}>{selectedItem.reason}</div>
            </div>
          </>
        );

      case 'timesheet':
        return (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitle}>{selectedItem.emp}</div>
              <div className={styles.detailSub}>Weekly Timesheet Review</div>
            </div>

            {selectedItem.match ? (
              <div className={styles.successBox}>
                <CheckCircle size={16} />
                <span><strong>Git-Commit Match:</strong> Logged hours align with repository commit volume ({selectedItem.commits} commits).</span>
              </div>
            ) : (
              <div className={styles.warningBox}>
                <AlertTriangle size={16} />
                <span><strong>Audit Flag:</strong> High hours ({selectedItem.hours}h) but low commit volume ({selectedItem.commits} commits). Please review carefully.</span>
              </div>
            )}

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Hours Breakdown</div>
              <table className={styles.gridTable}>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Hours Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItem.breakdown.map((b, i) => (
                    <tr key={i}>
                      <td>{b.task}</td>
                      <td>{b.h}h</td>
                    </tr>
                  ))}
                  <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>{selectedItem.hours}h</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        );

      case 'wfh':
        return (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitle}>{selectedItem.emp}</div>
              <div className={styles.detailSub}>Work From Home Request</div>
            </div>

            {selectedItem.verified ? (
              <div className={styles.successBox}>
                <MapPin size={16} />
                <span><strong>Location Verified:</strong> Logged from registered Home IP ({selectedItem.ip}).</span>
              </div>
            ) : (
              <div className={styles.warningBox}>
                <AlertTriangle size={16} />
                <span><strong>Location Unverified:</strong> Logged from {selectedItem.ip}.</span>
              </div>
            )}

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Date</div>
              <div className={styles.infoValue}>{selectedItem.date}</div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Reason</div>
              <div className={styles.infoValue}>{selectedItem.reason}</div>
            </div>
          </>
        );

      case 'correction':
        return (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitle}>{selectedItem.emp}</div>
              <div className={styles.detailSub}>Attendance Correction Request</div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Requested Change</div>
              <div className={styles.infoValue}>{selectedItem.date} | {selectedItem.requested}</div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Reason</div>
              <div className={styles.infoValue}>{selectedItem.reason}</div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>GPS Coordinates at requested time</div>
              <div className={styles.infoValue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#64748b" /> {selectedItem.coords}
              </div>
            </div>

            <div className={styles.infoBlock}>
              <div className={styles.infoLabel}>Photo Evidence</div>
              <div className={styles.imagePlaceholder}>
                <Camera size={24} style={{ marginRight: '8px' }} />
                <span>No photo attached</span>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Approval Type Tabs */}
      <div className={styles.tabsHeader}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'leave' ? styles.tabBtnActive : ''}`} 
          onClick={() => handleTabChange('leave')}
        >
          <CalendarDays size={16} /> Leave
          <span className={styles.badge}>{leaveRequests.length}</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'timesheet' ? styles.tabBtnActive : ''}`} 
          onClick={() => handleTabChange('timesheet')}
        >
          <FileText size={16} /> Timesheet
          <span className={styles.badge}>{timesheetRequests.length}</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'wfh' ? styles.tabBtnActive : ''}`} 
          onClick={() => handleTabChange('wfh')}
        >
          <Home size={16} /> WFH
          <span className={styles.badge}>{wfhRequests.length}</span>
        </button>

        <button 
          className={`${styles.tabBtn} ${activeTab === 'correction' ? styles.tabBtnActive : ''}`} 
          onClick={() => handleTabChange('correction')}
        >
          <Edit3 size={16} /> Attendance Corrections
          <span className={styles.badge}>{correctionRequests.length}</span>
        </button>
      </div>

      {/* 2. Main Split View */}
      <div className={styles.mainGrid}>
        
        {/* Left Panel: Request List */}
        <div className={styles.listPanel}>
          <div className={styles.panelTitle}>Approval Request List</div>
          {renderList()}
        </div>

        {/* Right Panel: Detail Panel */}
        <div className={styles.detailPanel}>
          <div className={styles.panelTitle}>Request Detail Panel</div>
          {renderDetails()}
        </div>

      </div>
    </div>
  );
}
