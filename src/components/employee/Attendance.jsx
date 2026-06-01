import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock, LogOut, MapPin, Loader, CheckCircle2,
  AlertTriangle, ChevronLeft, ChevronRight,
  Camera, Send, WifiOff, Building2, Home,
  CalendarCheck, Timer, ArrowRightLeft,
} from 'lucide-react';
import './Attendance.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtClock(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function fmtTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function elapsedStr(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Mock monthly log data ────────────────────────────────────────────────────

function generateMockLog() {
  const today = new Date();
  const rows = [];
  for (let d = 1; d <= today.getDate(); d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    const day = date.getDay();
    if (day === 0 || day === 6) {
      rows.push({ date, status: 'holiday', inTime: null, outTime: null, hours: null });
      continue;
    }
    if (d === today.getDate()) {
      rows.push({ date, status: 'today', inTime: null, outTime: null, hours: null });
      continue;
    }
    const statuses = ['present', 'present', 'present', 'wfh', 'present', 'absent', 'late'];
    const status = statuses[d % statuses.length];
    const inH  = status === 'late' ? 10 : 9;
    const inM  = status === 'late' ? (15 + (d % 30)) : (d % 15);
    const outH = 18;
    const outM = d % 30;
    rows.push({
      date,
      status,
      inTime:  `${String(inH).padStart(2,'0')}:${String(inM).padStart(2,'0')}`,
      outTime: `${String(outH).padStart(2,'0')}:${String(outM).padStart(2,'0')}`,
      hours:   `${outH - inH}h ${outM}m`,
    });
  }
  return rows.reverse();
}

const STATUS_CONFIG = {
  present:  { label: 'Present',  cls: 'att-log-pill--present'  },
  wfh:      { label: 'WFH',      cls: 'att-log-pill--wfh'      },
  absent:   { label: 'Absent',   cls: 'att-log-pill--absent'   },
  late:     { label: 'Late',     cls: 'att-log-pill--late'      },
  holiday:  { label: 'Holiday',  cls: 'att-log-pill--holiday'  },
  today:    { label: 'Today',    cls: 'att-log-pill--present'  },
};

// ─── Section Header atom ──────────────────────────────────────────────────────

function SectionHeader({ icon, title, accent = '#10b981' }) {
  return (
    <div className="att-section-header">
      <span className="att-section-header__icon" style={{ color: accent }}>{icon}</span>
      <span className="att-section-header__title">{title}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  CLOCK IN/OUT PANEL
// ════════════════════════════════════════════════════════

function ClockInOutPanel({ clockState, onClockIn, onClockOut, liveClock, elapsed, gpsStatus }) {
  const btnRef = useRef(null);
  const [ripple, setRipple] = useState(null);

  function handleClick(e) {
    // Ripple
    const rect = btnRef.current.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left - 30, y: e.clientY - rect.top - 30, id: Date.now() });
    setTimeout(() => setRipple(null), 700);

    if (clockState === 'idle')       onClockIn();
    else if (clockState === 'clocked-in') onClockOut();
  }

  const btnClass = {
    idle:        'att-clock-btn--idle',
    searching:   'att-clock-btn--searching',
    'clocked-in':'att-clock-btn--clocked-in',
    'already':   'att-clock-btn--already',
  }[clockState] || 'att-clock-btn--idle';

  const isDisabled = clockState === 'searching' || clockState === 'already';

  const gpsLabel = {
    idle:      null,
    searching: { cls: 'att-gps-row--searching', icon: <Loader size={13} className="att-spin" />, text: 'Getting location…' },
    ok:        { cls: 'att-gps-row--ok',        icon: <MapPin size={13} />,                     text: 'GPS captured' },
    denied:    { cls: 'att-gps-row--warn',       icon: <WifiOff size={13} />,                    text: 'GPS denied — WFH mode flagged' },
    error:     { cls: 'att-gps-row--error',      icon: <AlertTriangle size={13} />,              text: 'GPS error' },
  }[gpsStatus];

  return (
    <div className="att-card att-clock-panel">
      <SectionHeader icon={<Clock size={15} />} title="Clock In / Out" accent="#10b981" />

      <div className="att-clock-btn-wrap">
        <button
          ref={btnRef}
          className={`att-clock-btn ${btnClass}`}
          onClick={handleClick}
          disabled={isDisabled}
          role="timer"
          aria-live="polite"
        >
          {ripple && (
            <span
              className="att-clock-btn__ripple"
              key={ripple.id}
              style={{ left: ripple.x, top: ripple.y }}
            />
          )}

          {clockState === 'searching' ? (
            <>
              <Loader size={28} className="att-spin" style={{ color: '#fbbf24' }} />
              <span className="att-clock-btn__sub">Getting location…</span>
            </>
          ) : clockState === 'clocked-in' ? (
            <>
              <LogOut size={22} style={{ color: 'rgba(255,255,255,0.7)' }} />
              <span className="att-clock-btn__label">Clock Out</span>
              <span className="att-clock-btn__time">{liveClock}</span>
            </>
          ) : clockState === 'already' ? (
            <>
              <CheckCircle2 size={24} style={{ color: '#60a5fa' }} />
              <span className="att-clock-btn__label" style={{ fontSize: 14 }}>Clocked In</span>
            </>
          ) : (
            <>
              <Clock size={22} style={{ color: 'rgba(255,255,255,0.7)' }} />
              <span className="att-clock-btn__label">Clock In</span>
              <span className="att-clock-btn__time">{liveClock}</span>
            </>
          )}
        </button>
      </div>

      {clockState === 'clocked-in' && elapsed !== null && (
        <div className="att-elapsed-badge">
          <Timer size={14} />
          {elapsedStr(elapsed)} elapsed
        </div>
      )}

      {gpsLabel && (
        <div className={`att-gps-row ${gpsLabel.cls}`}>
          {gpsLabel.icon}
          {gpsLabel.text}
        </div>
      )}

      {clockState === 'already' && (
        <div className="att-already-msg">
          You already clocked in today. Clock-out available above.
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  TODAY'S STATUS CARD
// ════════════════════════════════════════════════════════

function TodayStatusCard({ clockState, clockInTime, clockOutTime, elapsed }) {
  const hoursWorked = elapsed !== null
    ? (elapsed / 3_600_000).toFixed(1)
    : clockState === 'idle' ? '—' : '0.0';

  const workMode = clockState === 'clocked-in' || clockInTime
    ? 'Office'
    : 'Not In';

  return (
    <div className="att-card att-status-card">
      <SectionHeader icon={<CalendarCheck size={15} />} title="Today's Status" accent="#60a5fa" />

      <div className="att-status-grid">
        <div className="att-status-cell">
          <span className="att-status-cell__label">In-Time</span>
          <span className="att-status-cell__value att-status-cell__value--emerald">
            {clockInTime ? fmtTime(clockInTime) : '—'}
          </span>
          <span className="att-status-cell__sub">{fmtDate(new Date())}</span>
        </div>

        <div className="att-status-cell">
          <span className="att-status-cell__label">Out-Time</span>
          <span className="att-status-cell__value att-status-cell__value--amber">
            {clockOutTime ? fmtTime(clockOutTime) : '—'}
          </span>
          <span className="att-status-cell__sub">
            {clockOutTime ? fmtDate(clockOutTime) : 'Not clocked out'}
          </span>
        </div>

        <div className="att-status-cell">
          <span className="att-status-cell__label">Hours Worked</span>
          <span className="att-status-cell__value att-status-cell__value--blue">
            {hoursWorked !== '—' ? `${hoursWorked}h` : '—'}
          </span>
          <span className="att-status-cell__sub">Today</span>
        </div>

        <div className="att-status-cell">
          <span className="att-status-cell__label">Work Mode</span>
          <div style={{ marginTop: 4 }}>
            <span className={`att-work-mode-badge ${
              workMode === 'Office' ? 'att-work-mode-badge--office' :
              workMode === 'WFH'    ? 'att-work-mode-badge--wfh'    :
                                      'att-work-mode-badge--absent'
            }`}>
              {workMode === 'Office' ? <Building2 size={12} /> :
               workMode === 'WFH'    ? <Home size={12} />      :
                                       <AlertTriangle size={12} />}
              {workMode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  ATTENDANCE LOG TABLE
// ════════════════════════════════════════════════════════

const ROWS_PER_PAGE = 7;

function AttendanceLogTable() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [page, setPage] = useState(1);
  const logData = generateMockLog();

  const currentDate = new Date();
  const displayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);

  const totalPages = Math.ceil(logData.length / ROWS_PER_PAGE);
  const pageData   = logData.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Reset to page 1 when month changes
  function changeMonth(delta) {
    setMonthOffset(o => Math.max(0, o + delta));
    setPage(1);
  }

  return (
    <div className="att-card">
      <SectionHeader icon={<ArrowRightLeft size={15} />} title="My Monthly Log" accent="#a78bfa" />

      <div className="att-month-nav">
        <button className="att-month-nav__btn" onClick={() => changeMonth(1)}>
          <ChevronLeft size={14} />
        </button>
        <span className="att-month-nav__label">{fmtMonthYear(displayDate)}</span>
        <button
          className="att-month-nav__btn"
          onClick={() => changeMonth(-1)}
          disabled={monthOffset === 0}
          style={{ opacity: monthOffset === 0 ? 0.35 : 1 }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <table className="att-log-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>In</th>
            <th>Out</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((row, i) => {
            const isToday = row.status === 'today';
            const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.present;
            return (
              <tr key={i}>
                <td>
                  <span className={`att-log-date ${isToday ? 'att-log-today' : ''}`}>
                    {row.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    {isToday && ' ★'}
                  </span>
                </td>
                <td>
                  <span className={`att-log-pill ${cfg.cls}`}>{cfg.label}</span>
                </td>
                <td>{row.inTime  || '—'}</td>
                <td>{row.outTime || '—'}</td>
                <td>{row.hours  || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="att-pagination">
        <button
          className="att-month-nav__btn"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{ opacity: page === 1 ? 0.35 : 1 }}
        >
          <ChevronLeft size={14} />
        </button>

        <div className="att-pagination__pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`att-pagination__page ${page === n ? 'att-pagination__page--active' : ''}`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          className="att-month-nav__btn"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{ opacity: page === totalPages ? 0.35 : 1 }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <p className="att-pagination__info">
        Showing {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, logData.length)} of {logData.length} records
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  WFH REQUEST FORM
// ════════════════════════════════════════════════════════

function WfhRequestForm() {
  const [form, setForm]       = useState({ wfh_date: '', wfh_reason: '' });
  const [errors, setErrors]   = useState({});
  const [gps, setGps]         = useState('idle');   // idle | searching | captured | failed
  const [gpsCoords, setGpsCoords] = useState(null);
  const [toast, setToast]     = useState(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.wfh_date)   e.wfh_date   = 'Date is required';
    if (!form.wfh_reason || form.wfh_reason.length < 5)
      e.wfh_reason = 'Reason must be at least 5 characters';
    return e;
  }

  function captureGps() {
    setGps('searching');
    navigator.geolocation?.getCurrentPosition(
      pos => { setGps('captured'); setGpsCoords({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }); },
      ()  => { setGps('failed'); },
      { timeout: 8000, enableHighAccuracy: true }
    );
    if (!navigator.geolocation) setGps('failed');
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      setLoading(false);
      setToast({ type: 'success', msg: 'WFH request submitted successfully!' });
      setForm({ wfh_date: '', wfh_reason: '' });
      setGps('idle'); setGpsCoords(null);
      setTimeout(() => setToast(null), 4000);
    }, 1200);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="att-card">
      <SectionHeader icon={<Home size={15} />} title="WFH Request" accent="#60a5fa" />

      <div className="att-form-field">
        <label className="att-form-label">Date</label>
        <input
          type="date"
          className="att-form-input"
          min={today}
          value={form.wfh_date}
          onChange={e => { setForm(f => ({ ...f, wfh_date: e.target.value })); setErrors(v => ({ ...v, wfh_date: '' })); }}
        />
        {errors.wfh_date && <span className="att-form-error">{errors.wfh_date}</span>}
      </div>

      <div className="att-form-field">
        <label className="att-form-label">Reason</label>
        <textarea
          className="att-form-textarea"
          placeholder="Working from home — stable internet confirmed"
          value={form.wfh_reason}
          onChange={e => { setForm(f => ({ ...f, wfh_reason: e.target.value })); setErrors(v => ({ ...v, wfh_reason: '' })); }}
        />
        {errors.wfh_reason && <span className="att-form-error">{errors.wfh_reason}</span>}
      </div>

      <div className="att-form-field">
        <label className="att-form-label">GPS Location</label>
        <div
          className={`att-gps-capture-badge ${
            gps === 'captured' ? 'att-gps-capture-badge--captured' :
            gps === 'failed'   ? 'att-gps-capture-badge--failed'   :
                                  'att-gps-capture-badge--idle'
          }`}
          onClick={gps !== 'captured' ? captureGps : undefined}
          style={{ cursor: gps === 'captured' ? 'default' : 'pointer' }}
        >
          {gps === 'searching' && <Loader size={13} className="att-spin" />}
          {gps === 'captured'  && <CheckCircle2 size={13} />}
          {gps === 'failed'    && <AlertTriangle size={13} />}
          {gps === 'idle'      && <MapPin size={13} />}
          {gps === 'searching' ? 'Capturing GPS…'
           : gps === 'captured' ? `Captured: ${gpsCoords?.lat}, ${gpsCoords?.lng}`
           : gps === 'failed'   ? 'GPS failed — click to retry'
           : 'Auto-capture GPS location'}
        </div>
      </div>

      <button
        className="att-submit-btn att-submit-btn--blue"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <Loader size={14} className="att-spin" /> : <Send size={14} />}
        {loading ? 'Submitting…' : 'Submit WFH Request'}
      </button>

      {toast && (
        <div className={`att-toast att-toast--${toast.type}`}>
          <CheckCircle2 size={14} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  MISSED PUNCH CORRECTION FORM
// ════════════════════════════════════════════════════════

function CorrectionForm() {
  const [form, setForm]       = useState({
    correction_date: '',
    missed_type:     'clock-in',
    requested_time:  '',
    reason:          '',
  });
  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors]   = useState({});
  const [toast, setToast]     = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  function validate() {
    const e = {};
    if (!form.correction_date)  e.correction_date = 'Date is required';
    if (!form.requested_time)   e.requested_time  = 'Time is required';
    if (!form.reason || form.reason.length < 10)
      e.reason = 'Reason must be at least 10 characters';
    return e;
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ type: 'success', msg: 'Correction request submitted for approval.' });
      setForm({ correction_date: '', missed_type: 'clock-in', requested_time: '', reason: '' });
      setPhotoFile(null); setPhotoPreview(null);
      setTimeout(() => setToast(null), 4000);
    }, 1200);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="att-card">
      <SectionHeader icon={<AlertTriangle size={15} />} title="Missed Punch Correction" accent="#fbbf24" />

      <div className="att-form-field">
        <label className="att-form-label">Date</label>
        <input
          type="date"
          className="att-form-input"
          max={today}
          value={form.correction_date}
          onChange={e => { setForm(f => ({ ...f, correction_date: e.target.value })); setErrors(v => ({ ...v, correction_date: '' })); }}
        />
        {errors.correction_date && <span className="att-form-error">{errors.correction_date}</span>}
      </div>

      <div className="att-form-field">
        <label className="att-form-label">Missed Type</label>
        <div className="att-radio-group">
          {['clock-in', 'clock-out'].map(opt => (
            <label
              key={opt}
              className={`att-radio-option ${form.missed_type === opt ? 'att-radio-option--selected' : ''}`}
              onClick={() => setForm(f => ({ ...f, missed_type: opt }))}
            >
              <input type="radio" name="missed_type" value={opt} readOnly checked={form.missed_type === opt} />
              {opt === 'clock-in' ? <Clock size={13} /> : <LogOut size={13} />}
              {opt === 'clock-in' ? 'Clock-In' : 'Clock-Out'}
            </label>
          ))}
        </div>
      </div>

      <div className="att-form-field">
        <label className="att-form-label">Requested Time</label>
        <input
          type="time"
          className="att-form-input"
          placeholder="09:05"
          value={form.requested_time}
          onChange={e => { setForm(f => ({ ...f, requested_time: e.target.value })); setErrors(v => ({ ...v, requested_time: '' })); }}
        />
        {errors.requested_time && <span className="att-form-error">{errors.requested_time}</span>}
      </div>

      <div className="att-form-field">
        <label className="att-form-label">Reason</label>
        <textarea
          className="att-form-textarea"
          placeholder="Biometric device malfunction..."
          value={form.reason}
          onChange={e => { setForm(f => ({ ...f, reason: e.target.value })); setErrors(v => ({ ...v, reason: '' })); }}
        />
        {errors.reason && <span className="att-form-error">{errors.reason}</span>}
      </div>

      <div className="att-form-field">
        <label className="att-form-label">Photo Evidence (Optional)</label>
        <div className="att-photo-upload">
          <div className="att-photo-upload__btn" onClick={() => fileRef.current?.click()}>
            <Camera size={13} />
            {photoFile ? 'Change Photo' : 'Upload / Capture'}
          </div>
          <span className="att-photo-upload__name">
            {photoFile ? photoFile.name : 'No file chosen'}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
          />
        </div>
        {photoPreview && (
          <img src={photoPreview} alt="Preview" className="att-photo-preview" />
        )}
      </div>

      <button
        className="att-submit-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <Loader size={14} className="att-spin" /> : <Send size={14} />}
        {loading ? 'Submitting…' : 'Submit Correction Request'}
      </button>

      {toast && (
        <div className={`att-toast att-toast--${toast.type}`}>
          <CheckCircle2 size={14} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  ROOT — EmpAttendancePage
// ════════════════════════════════════════════════════════

export default function Attendance({ activeTab }) {
  // Clock state: idle | searching | clocked-in | already
  const [clockState, setClockState] = useState('idle');
  const [gpsStatus,  setGpsStatus]  = useState('idle'); // idle | searching | ok | denied | error
  const [clockInTime,  setClockInTime]  = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [liveClock, setLiveClock] = useState(fmtClock(new Date()));

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setLiveClock(fmtClock(new Date())), 1000);
    return () => clearInterval(t);
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (clockState !== 'clocked-in' || !clockInTime) return;
    const t = setInterval(() => setElapsed(Date.now() - clockInTime.getTime()), 1000);
    return () => clearInterval(t);
  }, [clockState, clockInTime]);

  function handleClockIn() {
    setClockState('searching');
    setGpsStatus('searching');
    navigator.geolocation?.getCurrentPosition(
      () => {
        setGpsStatus('ok');
        const now = new Date();
        setClockInTime(now);
        setClockState('clocked-in');
        setElapsed(0);
      },
      () => {
        setGpsStatus('denied');
        const now = new Date();
        setClockInTime(now);
        setClockState('clocked-in');
        setElapsed(0);
      },
      { timeout: 10_000, enableHighAccuracy: true }
    );
    if (!navigator.geolocation) {
      setGpsStatus('ok');
      const now = new Date();
      setClockInTime(now);
      setClockState('clocked-in');
      setElapsed(0);
    }
  }

  function handleClockOut() {
    setClockOutTime(new Date());
    setClockState('already');
    setGpsStatus('idle');
  }

  return (
    <div className="component-container att-root">
      <div className="component-header">
        <div>
          <h1>Attendance</h1>
          <p>Clock in/out, request WFH, and submit missed punch corrections.</p>
        </div>
      </div>

      <div className="att-body">
        {/* Row 1: Clock panel + Today status */}
        <div className="att-top-grid">
          <ClockInOutPanel
            clockState={clockState}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            liveClock={liveClock}
            elapsed={elapsed}
            gpsStatus={gpsStatus}
          />
          <TodayStatusCard
            clockState={clockState}
            clockInTime={clockInTime}
            clockOutTime={clockOutTime}
            elapsed={elapsed}
          />
        </div>

        {/* Row 2: Log table | WFH form | Correction form */}
        <div className="att-bottom-grid">
          <AttendanceLogTable />
          <WfhRequestForm />
          <CorrectionForm />
        </div>
      </div>
    </div>
  );
}