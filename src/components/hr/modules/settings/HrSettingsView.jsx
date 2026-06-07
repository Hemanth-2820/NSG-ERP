import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, MapPin, Loader, CheckCircle2, Building2 } from 'lucide-react';
import { HOLIDAYS, LEAVE_POLICIES } from '../../mockData';

export function HrSettingsView({ db, onUpdateDb }) {
  const [geofence, setGeofence] = useState(() => db.geofenceSettings || {
    enabled: true,
    latitude: 12.9716,
    longitude: 77.5946,
    radius: 100
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchGeofenceSettings = async () => {
      const token = localStorage.getItem('nsg_jwt_token');
      if (!token) return;
      try {
        const res = await fetch('/api/attendance/geofence-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGeofence({
            enabled: data.enabled,
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.radius
          });
        }
      } catch (err) {
        console.error("Failed to fetch geofence settings", err);
      }
    };
    fetchGeofenceSettings();
  }, []);

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to reset the client-side simulated database? This will restore all original seed values.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveGeofence = async () => {
    const token = localStorage.getItem('nsg_jwt_token');
    let success = true;
    if (token) {
      try {
        const res = await fetch('/api/attendance/geofence-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            enabled: geofence.enabled,
            latitude: geofence.latitude,
            longitude: geofence.longitude,
            radius: geofence.radius
          })
        });
        if (!res.ok) success = false;
      } catch (err) {
        console.error("Failed to save geofence settings to backend", err);
        success = false;
      }
    }
    onUpdateDb({
      ...db,
      geofenceSettings: geofence
    });
    if (success) {
      if (window.toast) {
        window.toast.success("Geofence settings saved successfully!");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } else {
      if (window.toast) {
        window.toast.error("Failed to save geofence settings.");
      } else {
        alert("Failed to save geofence settings.");
      }
    }
  };

  const handleLocateOffice = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeofence(prev => ({
          ...prev,
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6))
        }));
        setGpsLoading(false);
      },
      (error) => {
        if (window.toast) {
          window.toast.error("Failed to retrieve current location. Please ensure location permissions are enabled in your browser.");
        } else {
          alert("Failed to retrieve current location. Please ensure location permissions are enabled in your browser.");
        }
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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

      {/* GPS Geofencing Settings */}
      <div className="card" style={{ borderLeft: '4px solid #10b981', width: '100%', marginTop: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', border: 'none', padding: 0 }}>
            <MapPin size={20} style={{ color: '#10b981' }} /> GPS Geofencing Configuration
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={geofence.enabled}
                onChange={(e) => setGeofence(prev => ({ ...prev, enabled: e.target.checked }))}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Enforce Geofencing
            </label>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
          Restrict employees from clocking in for "Office" mode unless they are physically present within the defined perimeter. WFH requests are not restricted.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Office Latitude</label>
            <input
              type="number"
              step="any"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              value={geofence.latitude}
              onChange={(e) => setGeofence(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g. 12.9716"
              disabled={!geofence.enabled}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Office Longitude</label>
            <input
              type="number"
              step="any"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              value={geofence.longitude}
              onChange={(e) => setGeofence(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
              placeholder="e.g. 77.5946"
              disabled={!geofence.enabled}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Allowed Radius (Meters)</label>
            <input
              type="number"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              value={geofence.radius}
              onChange={(e) => setGeofence(prev => ({ ...prev, radius: parseInt(e.target.value, 10) || 0 }))}
              placeholder="e.g. 100"
              disabled={!geofence.enabled}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={handleLocateOffice}
            className="print-btn"
            disabled={!geofence.enabled || gpsLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: geofence.enabled && !gpsLoading ? 'pointer' : 'not-allowed', opacity: geofence.enabled ? 1 : 0.5 }}
          >
            {gpsLoading ? <Loader size={16} className="att-spin" /> : <Building2 size={16} />}
            {gpsLoading ? 'Fetching GPS...' : 'Use My Current Location'}
          </button>

          <button
            onClick={handleSaveGeofence}
            className="print-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontSize: '13px', backgroundColor: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {saveSuccess ? <CheckCircle2 size={16} /> : <RefreshCw size={16} />}
            {saveSuccess ? 'Saved Settings!' : 'Save Geofence Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 17. MESSAGING & MEET VIEW
