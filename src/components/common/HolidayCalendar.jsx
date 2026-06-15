import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, List, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem('nsg_jwt_token');
      const res = await fetch('/api/employee-portal/holidays', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Sort by date
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setHolidays(data);
      }
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getDayName = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { weekday: 'long' });
  };

  // Group holidays by month for list view
  const groupedHolidays = holidays.reduce((acc, h) => {
    const month = getMonthName(h.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  // Calendar Helpers
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const holidaysInCurrentMonth = holidays.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const getHolidayForDay = (day) => {
    return holidaysInCurrentMonth.find(h => new Date(h.date).getDate() === day);
  };

  if (loading) {
    return (
      <div className="component-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <div className="animate-spin" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #8b5cf6', borderRadius: '50%', width: '40px', height: '40px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container" style={{ padding: '32px', width: '100%' }}>
      
      {/* HEADER & CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarDays size={32} style={{ color: '#8b5cf6' }} /> 
            Company Holidays
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>
            Official list of public and company holidays for the year.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setViewMode('list')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: viewMode === 'list' ? '#8b5cf6' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
              fontWeight: viewMode === 'list' ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            <List size={18} /> List View
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              backgroundColor: viewMode === 'calendar' ? '#8b5cf6' : 'transparent',
              color: viewMode === 'calendar' ? '#fff' : 'var(--text-secondary)',
              fontWeight: viewMode === 'calendar' ? '600' : '500',
              transition: 'all 0.2s'
            }}
          >
            <CalendarIcon size={18} /> Calendar View
          </button>
        </div>
      </div>

      {holidays.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <CalendarDays size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No Holidays Configured</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>The HR or Management team hasn't added any holidays for this year yet.</p>
        </div>
      ) : (
        <>
          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {Object.keys(groupedHolidays).map(month => (
                <div key={month} style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: 'bold' }}>{month}</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)' }}>
                    {groupedHolidays[month].map(h => (
                      <div key={h.id} style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', transition: 'all 0.2s', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover-highlight">
                        <div style={{ backgroundColor: '#8b5cf615', color: '#8b5cf6', borderRadius: '12px', width: '64px', height: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>{new Date(h.date).getDate()}</span>
                          <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px' }}>{getDayName(h.date).slice(0,3)}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>{h.name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10b981', backgroundColor: '#10b98115', padding: '4px 10px', borderRadius: '100px', fontWeight: '500' }}>
                              <Star size={12} /> {h.type}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                              <MapPin size={14} /> All Locations
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CALENDAR VIEW */}
          {viewMode === 'calendar' && (
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.04)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePrevMonth} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={handleNextMonth} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--border-color)', gap: '1px' }}>
                {/* Days Header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {day}
                  </div>
                ))}
                
                {/* Empty cells for start of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ backgroundColor: 'var(--bg-secondary)', height: '140px', opacity: 0.3 }}></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const holiday = getHolidayForDay(day);
                  const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
                  
                  return (
                    <div key={day} style={{ 
                      backgroundColor: holiday ? '#8b5cf608' : 'var(--bg-primary)', 
                      height: '140px', 
                      padding: '12px',
                      position: 'relative',
                      borderTop: holiday ? '3px solid #8b5cf6' : '3px solid transparent',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', 
                        width: '28px', height: '28px', borderRadius: '50%', 
                        backgroundColor: isToday ? '#8b5cf6' : 'transparent',
                        color: isToday ? '#fff' : (holiday ? '#8b5cf6' : 'var(--text-primary)'),
                        fontWeight: isToday || holiday ? 'bold' : 'normal',
                        marginBottom: '8px'
                      }}>
                        {day}
                      </div>

                      {holiday && (
                        <div style={{ 
                          backgroundColor: '#8b5cf620', 
                          color: '#8b5cf6', 
                          padding: '6px 8px', 
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          lineHeight: '1.4',
                          borderLeft: '2px solid #8b5cf6'
                        }}>
                          {holiday.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Internal Style for hover effect */}
      <style>{`
        .hover-highlight:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.06) !important;
          border-color: #8b5cf6 !important;
        }
      `}</style>
    </div>
  );
}
