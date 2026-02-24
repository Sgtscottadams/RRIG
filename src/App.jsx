import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import Overview from './screens/Overview.jsx'
import PumpStations from './screens/PumpStations.jsx'
import TankMonitor from './screens/TankMonitor.jsx'
import AlarmSummary from './screens/AlarmSummary.jsx'
import TrendView from './screens/TrendView.jsx'
import FilterSidebar from './components/FilterSidebar.jsx'
import { INITIAL_PUMPS, INITIAL_TANKS, INITIAL_ALARMS, FACILITIES, EQUIPMENT_TYPES } from './data/mockData.js'

// ---- Theme Context ----
export const ThemeContext = createContext({})
export const useTheme = () => useContext(ThemeContext)

// ---- Filter Context ----
export const FilterContext = createContext({})
export const useFilters = () => useContext(FilterContext)

// ---- Icons (inline SVG) ----
const Icons = {
  overview:   <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M2 4a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm9 0a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1h-5a1 1 0 01-1-1V4zm0 7a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5zm-9 3a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z"/></svg>,
  pumps:      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>,
  tanks:      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm4 0v12h4V4H8z"/></svg>,
  alarms:     <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
  trends:     <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/></svg>,
  moon:       <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>,
  sun:        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>,
  filter:     <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/></svg>,
  search:     <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>,
  menu:       <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>,
  close:      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
  chevronLeft: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  chevronRight: <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>,
}
export { Icons }

const NAV_ITEMS = [
  { path: '/',         label: 'Overview',   icon: Icons.overview },
  { path: '/pumps',    label: 'Pump Stations', icon: Icons.pumps },
  { path: '/tanks',    label: 'Tank Monitor',  icon: Icons.tanks },
  { path: '/alarms',   label: 'Alarms',     icon: Icons.alarms, badge: 'alarms' },
  { path: '/trends',   label: 'Trends',     icon: Icons.trends },
]

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('rrig-theme') || 'night')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [filters, setFilters] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [alarms, setAlarms] = useState(INITIAL_ALARMS)
  const [pumps, setPumps] = useState(INITIAL_PUMPS)
  const [tanks, setTanks] = useState(INITIAL_TANKS)
  const navigate = useNavigate()
  const location = useLocation()

  const activeAlarmCount = alarms.filter(a => a.status === 'UNACKNOWLEDGED').length

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('rrig-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'night' ? 'day' : 'night')

  const addFilter = useCallback((filter) => {
    setFilters(prev => {
      const exists = prev.find(f => f.type === filter.type && f.value === filter.value)
      return exists ? prev : [...prev, { ...filter, id: Date.now() }]
    })
  }, [])

  const removeFilter = useCallback((id) => {
    setFilters(prev => prev.filter(f => f.id !== id))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters([])
    setSearchQuery('')
  }, [])

  const ackAlarm = useCallback((id) => {
    setAlarms(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'ACKNOWLEDGED', ackBy: 'Demo User', ackTime: new Date().toLocaleString() } : a
    ))
  }, [])

  const navigateToAlarms = useCallback(() => navigate('/alarms'), [navigate])

  const sidebarWidth = sidebarOpen ? 240 : 48

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <FilterContext.Provider value={{ filters, addFilter, removeFilter, clearFilters, searchQuery, setSearchQuery }}>
        <div className="app-bg" />

        {/* ---- App Shell ---- */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          height: '100vh', overflow: 'hidden',
        }}>

          {/* ---- Header ---- */}
          <header style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 16px', height: 52,
            background: 'var(--header-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid var(--header-border)',
            flexShrink: 0, zIndex: 100,
          }}>
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileNavOpen(v => !v)}
              className="btn hide-desktop" style={{ padding: '6px 8px', minWidth: 36 }}>
              {Icons.menu}
            </button>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{
                background: theme === 'night'
                  ? 'rgba(255,255,255,0.92)'
                  : 'rgba(255,255,255,0.98)',
                borderRadius: 6, padding: '3px 6px',
                display: 'flex', alignItems: 'center',
              }}>
                <img src={`${import.meta.env.BASE_URL}KTX_LOGO.png`}
                  alt="KTX Electric" height="26"
                  style={{ display: 'block', filter: 'none' }} />
              </div>
              <div className="hide-mobile">
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  SCADA Demo
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  RRIG Water Solutions
                </div>
              </div>
            </div>

            {/* Separator */}
            <div style={{ width: 1, height: 28, background: 'var(--glass-border)', flexShrink: 0 }} className="hide-mobile" />

            {/* Desktop nav */}
            <nav style={{ display: 'flex', gap: 2, flex: 1 }} className="hide-mobile">
              {NAV_ITEMS.map(item => (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 7,
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(59,158,255,0.12)' : 'transparent',
                    border: '1px solid', borderColor: isActive ? 'rgba(59,158,255,0.25)' : 'transparent',
                    textDecoration: 'none',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 13, fontWeight: 600,
                    letterSpacing: '0.05em',
                    transition: 'all 0.15s',
                    position: 'relative',
                  })}>
                  {item.icon}
                  {item.label}
                  {item.badge === 'alarms' && activeAlarmCount > 0 && (
                    <span style={{
                      background: 'var(--status-alarm)',
                      color: '#fff', borderRadius: 20,
                      fontSize: 10, fontWeight: 700,
                      padding: '1px 5px', lineHeight: 1.4,
                    }}>{activeAlarmCount}</span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div style={{ flex: 1 }} className="hide-desktop" />

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Alarm bell for mobile/tablet */}
              <button onClick={navigateToAlarms} className="btn hide-desktop"
                style={{
                  padding: '6px 10px',
                  borderColor: activeAlarmCount > 0 ? 'rgba(255,59,48,0.4)' : undefined,
                  background: activeAlarmCount > 0 ? 'rgba(255,59,48,0.12)' : undefined,
                  color: activeAlarmCount > 0 ? 'var(--status-alarm)' : undefined,
                }}>
                {Icons.alarms}
                {activeAlarmCount > 0 && (
                  <span style={{ background: 'var(--status-alarm)', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 5px' }}>
                    {activeAlarmCount}
                  </span>
                )}
              </button>

              {/* Filter toggle */}
              <button onClick={() => {
                  setSidebarOpen(v => !v)
                  setMobileSidebarOpen(v => !v)
                }}
                className={`btn ${(sidebarOpen || mobileSidebarOpen) ? 'btn-active' : ''}`}
                style={{ padding: '6px 10px' }}>
                {Icons.filter}
                <span className="hide-mobile" style={{ fontSize: 12 }}>Filters</span>
                {filters.length > 0 && (
                  <span style={{ background: 'var(--accent-blue)', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 5px' }}>
                    {filters.length}
                  </span>
                )}
              </button>

              {/* Theme toggle */}
              <button onClick={toggleTheme} className="btn" style={{ padding: '6px 10px' }}
                title={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}>
                {theme === 'night' ? Icons.sun : Icons.moon}
              </button>
            </div>
          </header>

          {/* ---- Body ---- */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

            {/* Desktop sidebar */}
            <div className="hide-mobile hide-tablet" style={{
              width: sidebarOpen ? 240 : 0,
              flexShrink: 0,
              overflow: 'hidden',
              transition: 'width 0.25s ease',
              borderRight: '1px solid var(--glass-border)',
              background: 'var(--sidebar-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
            }}>
              <FilterSidebar
                collapsed={!sidebarOpen}
                filters={filters}
                addFilter={addFilter}
                removeFilter={removeFilter}
                clearFilters={clearFilters}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                facilities={FACILITIES}
                equipmentTypes={EQUIPMENT_TYPES}
                alarms={alarms}
              />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 50,
                background: 'rgba(0,0,0,0.5)',
              }} onClick={() => setMobileSidebarOpen(false)}>
                <div style={{
                  width: 280, height: '100%',
                  background: 'var(--sidebar-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  WebkitBackdropFilter: 'var(--glass-blur)',
                  borderRight: '1px solid var(--glass-border)',
                  overflow: 'hidden',
                }} onClick={e => e.stopPropagation()}>
                  <FilterSidebar
                    collapsed={false}
                    filters={filters}
                    addFilter={addFilter}
                    removeFilter={removeFilter}
                    clearFilters={clearFilters}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    facilities={FACILITIES}
                    equipmentTypes={EQUIPMENT_TYPES}
                    alarms={alarms}
                    onClose={() => setMobileSidebarOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Main content */}
            <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Routes>
                <Route path="/" element={<Overview pumps={pumps} tanks={tanks} alarms={alarms} onAlarmClick={navigateToAlarms} />} />
                <Route path="/pumps" element={<PumpStations pumps={pumps} filters={filters} searchQuery={searchQuery} addFilter={addFilter} />} />
                <Route path="/tanks" element={<TankMonitor tanks={tanks} filters={filters} searchQuery={searchQuery} />} />
                <Route path="/alarms" element={<AlarmSummary alarms={alarms} filters={filters} searchQuery={searchQuery} addFilter={addFilter} onAck={ackAlarm} />} />
                <Route path="/trends" element={<TrendView />} />
              </Routes>
            </main>
          </div>

          {/* Mobile bottom nav */}
          {mobileNavOpen && (
            <div className="hide-desktop" style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 150,
              background: 'var(--header-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderTop: '1px solid var(--glass-border)',
              padding: '8px 16px 16px',
            }}>
              {NAV_ITEMS.map(item => (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}
                  onClick={() => setMobileNavOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(59,158,255,0.12)' : 'transparent',
                    textDecoration: 'none',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontSize: 15, fontWeight: 600,
                    letterSpacing: '0.04em',
                  })}>
                  {item.icon}
                  {item.label}
                  {item.badge === 'alarms' && activeAlarmCount > 0 && (
                    <span style={{ background: 'var(--status-alarm)', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>
                      {activeAlarmCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </FilterContext.Provider>
    </ThemeContext.Provider>
  )
}
