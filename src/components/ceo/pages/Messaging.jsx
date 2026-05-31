import React, { useState } from 'react';
import { 
  Megaphone, ShieldAlert, Pin, Clock, 
  Send, Users, Briefcase, FileText, Settings, Search, Edit3
} from 'lucide-react';
import '../CEO.css';

// ==========================================
// MOCK DATA
// ==========================================
const commChannels = [
  { id: 'exec', label: 'Executive Directives', icon: <Megaphone size={16} /> },
  { id: 'board', label: 'Board Communications', icon: <Briefcase size={16} /> },
  { id: 'dept', label: 'Department Updates', icon: <Users size={16} /> },
  { id: 'alerts', label: 'System Alerts', icon: <ShieldAlert size={16} /> },
];

const messages = [
  { id: 1, title: 'Q3 Earnings Call Prep', channel: 'Executive Directives', sender: 'CEO Office', date: 'Oct 14, 2023', priority: 'High', pinned: true },
  { id: 2, title: 'Board Resolution: Mergers', channel: 'Board Communications', sender: 'Legal', date: 'Oct 12, 2023', priority: 'Critical', pinned: true },
  { id: 3, title: 'Data Center Migration Schedule', channel: 'System Alerts', sender: 'IT Ops', date: 'Oct 10, 2023', priority: 'High', pinned: false },
  { id: 4, title: 'New VP of Sales Announced', channel: 'Department Updates', sender: 'HR', date: 'Oct 08, 2023', priority: 'Standard', pinned: false },
];

export default function Messaging() {
  const [activeChannel, setActiveChannel] = useState('exec');

  return (
    <div className="ceo-layout-grid">
      
      {/* 1. PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="ceo-typography-page-title">Executive Communication Hub</h1>
          <p className="ceo-typography-body" style={{ marginTop: '8px' }}>Centralized broadcast center for board, executive, and enterprise-wide directives.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="ceo-btn"><Settings size={16} /> Comm Policies</button>
          <button className="ceo-btn ceo-btn-primary"><Edit3 size={16} /> New Broadcast</button>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT */}
      <div className="ceo-split-layout">
        
        {/* LEFT COLUMN - NAV */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title">Communication Channels</div>
            </div>
            <div className="ceo-command-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {commChannels.map(ch => (
                <div 
                  key={ch.id} 
                  onClick={() => setActiveChannel(ch.id)}
                  style={{
                    padding: '12px 16px', borderRadius: 'var(--ceo-radius-btn)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: activeChannel === ch.id ? 'var(--ceo-hover)' : 'transparent',
                    color: activeChannel === ch.id ? 'var(--ceo-primary)' : 'var(--ceo-text-secondary)',
                    fontWeight: activeChannel === ch.id ? 600 : 500,
                    borderLeft: activeChannel === ch.id ? '3px solid var(--ceo-primary)' : '3px solid transparent'
                  }}
                >
                  {ch.icon}
                  <span style={{ fontSize: '14px' }}>{ch.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title">Scheduled Broadcasts</div>
            </div>
            <div className="ceo-command-content" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--ceo-bg)', borderRadius: '8px', border: '1px solid var(--ceo-border)' }}>
                  <div className="ceo-typography-meta" style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Tomorrow, 09:00 AM</div>
                  <div className="ceo-typography-body" style={{ fontWeight: 600, color: 'var(--ceo-text-primary)' }}>Q3 Townhall Invite</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SEARCH & FILTER */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="var(--ceo-text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input type="text" placeholder="Search directives, alerts, and board minutes..." className="ceo-form-input" style={{ paddingLeft: '32px' }} />
            </div>
          </div>

          {/* MESSAGE FEED */}
          <div className="ceo-command-panel">
            <div className="ceo-command-header">
              <div className="ceo-typography-card-title">Recent Communications</div>
            </div>
            <div className="ceo-command-content" style={{ padding: 0 }}>
              {messages.map((msg, i) => (
                <div key={msg.id} style={{ 
                  padding: '24px', 
                  borderBottom: i === messages.length - 1 ? 'none' : '1px solid var(--ceo-border)',
                  background: msg.pinned ? 'var(--ceo-hover)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {msg.pinned && <Pin size={14} color="var(--ceo-primary)" style={{ transform: 'rotate(45deg)' }} />}
                      <span className="ceo-typography-section-title">{msg.title}</span>
                    </div>
                    <span className={`ceo-badge ${msg.priority === 'Critical' ? 'critical' : msg.priority === 'High' ? 'warning' : 'neutral'}`}>
                      {msg.priority}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                    <div>
                      <div className="ceo-typography-meta">Sender</div>
                      <div className="ceo-typography-body" style={{ fontWeight: 600 }}>{msg.sender}</div>
                    </div>
                    <div>
                      <div className="ceo-typography-meta">Channel</div>
                      <div className="ceo-typography-body">{msg.channel}</div>
                    </div>
                    <div>
                      <div className="ceo-typography-meta">Date Published</div>
                      <div className="ceo-typography-body">{msg.date}</div>
                    </div>
                  </div>

                  <p className="ceo-typography-body" style={{ marginBottom: '24px', maxWidth: '800px', lineHeight: '1.6' }}>
                    This is a preview of the official communication. Executive directives contain highly sensitive structural and financial data intended only for the designated leadership distribution list. Please click below to read the full document and acknowledge receipt.
                  </p>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="ceo-btn ceo-btn-primary"><FileText size={16} /> Read Full Document</button>
                    <button className="ceo-btn"><Send size={16} /> Forward to Dept Head</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
