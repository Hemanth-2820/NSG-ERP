import React from 'react';
import { 
  CheckSquare, XSquare, Clock, Filter, Search, 
  Settings, CheckCircle, FileText, Download, MoreVertical
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const approvals = [
  { id: 'REQ-1042', title: 'Q3 Cloud Infrastructure CapEx', dept: 'Engineering', amount: '₹4.5M', priority: 'High', requester: 'Sarah Connor', date: 'Today', status: 'Pending' },
  { id: 'REQ-1043', title: 'New Hire: VP of Sales EMEA', dept: 'HR', amount: '₹1.2M/yr', priority: 'Medium', requester: 'John Doe', date: 'Yesterday', status: 'Pending' },
  { id: 'REQ-1040', title: 'Agency Contract Renewal', dept: 'Marketing', amount: '₹0.8M', priority: 'Low', requester: 'Mike R.', date: '2 Days Ago', status: 'In Review' },
  { id: 'REQ-1038', title: 'Enterprise Software Licenses', dept: 'IT', amount: '₹2.1M', priority: 'High', requester: 'David L.', date: '3 Days Ago', status: 'Approved' },
  { id: 'REQ-1039', title: 'Offsite Leadership Retreat', dept: 'Operations', amount: '₹0.4M', priority: 'Medium', requester: 'Elena R.', date: '3 Days Ago', status: 'Rejected' },
];

const columns = ['Pending', 'In Review', 'Approved', 'Rejected'];

export default function Approvals() {
  
  const getCardsByStatus = (status) => approvals.filter(a => a.status === status);

  return (
    <div className="ceo-layout-grid" style={{ height: 'calc(100vh - 64px)' }}>
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Executive Approvals</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Enterprise workflow for financial, structural, and strategic sign-offs.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input type="text" placeholder="Search requests..." className="ceo-form-input" style={{ paddingLeft: '32px', width: '250px' }} />
          </div>
          <button className="ceo-btn"><Filter size={16} /> Filter Dept</button>
          <button className="ceo-btn"><CheckSquare size={16} /> Bulk Approve (2)</button>
          <button className="ceo-btn ceo-btn-primary"><Settings size={16} /> Workflow Rules</button>
        </div>
      </div>

      {/* 2. KANBAN BOARD */}
      <div style={{ display: 'flex', gap: '24px', flex: 1, overflowX: 'auto', paddingBottom: '24px' }}>
        
        {columns.map(col => (
          <div key={col} style={{ width: '350px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--ceo-border)' }}>
              <div className="ceo-typography-card-title">{col}</div>
              <span className="ceo-badge neutral">{getCardsByStatus(col).length}</span>
            </div>

            {/* Column Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getCardsByStatus(col).map(req => (
                <div key={req.id} className="ceo-command-panel" style={{ padding: '16px', borderRadius: '12px', cursor: 'grab' }}>
                  
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="ceo-typography-meta" style={{ fontFamily: 'monospace', color: 'var(--ceo-text-secondary)' }}>{req.id}</span>
                    <span className={`ceo-badge ${req.priority === 'High' ? 'critical' : req.priority === 'Medium' ? 'warning' : 'neutral'}`}>
                      {req.priority} Priority
                    </span>
                  </div>

                  {/* Card Title & Amount */}
                  <div className="ceo-typography-card-title" style={{ marginBottom: '4px' }}>{req.title}</div>
                  <div className="ceo-typography-page-title" style={{ fontSize: '20px', color: 'var(--ceo-success)', marginBottom: '12px' }}>
                    {req.amount}
                  </div>

                  {/* Card Meta */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <div>
                      <div className="ceo-typography-meta">Requester</div>
                      <div className="ceo-typography-body">{req.requester}</div>
                    </div>
                    <div>
                      <div className="ceo-typography-meta">Department</div>
                      <div className="ceo-typography-body">{req.dept}</div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--ceo-border)' }}>
                    <span className="ceo-typography-meta"><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/> {req.date}</span>
                    
                    {col === 'Pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="ceo-btn" style={{ padding: '6px', color: 'var(--ceo-danger)', borderColor: 'var(--ceo-danger)' }}><XSquare size={16} /></button>
                        <button className="ceo-btn" style={{ padding: '6px', color: 'var(--ceo-success)', borderColor: 'var(--ceo-success)' }}><CheckSquare size={16} /></button>
                      </div>
                    )}
                    
                    {col !== 'Pending' && (
                      <button className="ceo-btn" style={{ padding: '4px 8px', fontSize: '12px' }}>View Audit</button>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
