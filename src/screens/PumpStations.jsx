import React, { useState, useMemo } from 'react'

function ValueCell({ label, value, unit }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.2)',
      borderRadius: 6, padding: '6px 10px',
      minWidth: 0, flex: 1,
    }}>
      <div className="value-label">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span className="value-display" style={{ fontSize: 18 }}>{value}</span>
        {unit && <span className="value-unit">{unit}</span>}
      </div>
    </div>
  )
}

function PumpCard({ pump, onSelect }) {
  const statusBadge = {
    RUNNING: 'badge-running', STANDBY: 'badge-standby',
    FAULT: 'badge-fault', ALARM: 'badge-alarm',
  }[pump.status] || 'badge-cleared'

  const cardClass = {
    NORMAL: 'card-normal', WARNING: 'card-warning', ALARM: 'card-alarm', FAULT: 'card-fault',
  }[pump.alarm] || 'card-normal'

  const alarmBadge = pump.alarm !== 'NORMAL' ? {
    WARNING: 'badge-warning', ALARM: 'badge-alarm', FAULT: 'badge-fault',
  }[pump.alarm] : null

  return (
    <div className={`glass-card ${cardClass} fade-in`}
      onClick={() => onSelect(pump)}
      style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 1 }}>
            {pump.tag} · {pump.facilityName}
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {pump.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{pump.type}</div>
        </div>
        <span className={`status-badge ${statusBadge}`}>{pump.status}</span>
      </div>

      {/* Values grid */}
      <div style={{ display: 'flex', gap: 6 }}>
        <ValueCell label="Flow" value={pump.status === 'RUNNING' ? pump.flow.toLocaleString() : '0'} unit={pump.flowUnit} />
        <ValueCell label="Disch PSI" value={pump.status === 'RUNNING' ? pump.pressure_out : '0'} unit="PSI" />
        <ValueCell label="Power" value={pump.status === 'RUNNING' ? pump.power : '0'} unit={pump.powerUnit} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {alarmBadge ? (
          <span className={`status-badge ${alarmBadge}`}>
            <span className="dot" style={{ width: 5, height: 5, background: 'currentColor', borderRadius: '50%' }} />
            {pump.alarmMsg || pump.alarm}
          </span>
        ) : (
          <span className="status-badge badge-normal">● NORMAL</span>
        )}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
          Ops: {pump.ops} | {pump.lastOp}
        </span>
      </div>
    </div>
  )
}

function PumpDetailModal({ pump, onClose }) {
  if (!pump) return null

  const rows = [
    { label: 'Tag Path', value: pump.tag },
    { label: 'Facility', value: pump.facilityName },
    { label: 'Type', value: pump.type },
    { label: 'Status', value: pump.status },
    { label: 'Flow Rate', value: `${pump.flow.toLocaleString()} ${pump.flowUnit}` },
    { label: 'Suction Pressure', value: `${pump.pressure_in} ${pump.pressureUnit}` },
    { label: 'Discharge Pressure', value: `${pump.pressure_out} ${pump.pressureUnit}` },
    { label: 'Speed', value: `${pump.speed} ${pump.speedUnit}` },
    { label: 'Power Draw', value: `${pump.power} ${pump.powerUnit}` },
    { label: 'Vibration', value: `${pump.vibration} in/s` },
    { label: 'Motor Temp', value: `${pump.temp} °F` },
    { label: 'Total Runtime', value: pump.runtime },
    { label: 'Operation Count', value: pump.ops },
    { label: 'Last Operation', value: pump.lastOp },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-in" onClick={e => e.stopPropagation()}
        style={{ padding: 0 }}>

        {/* Modal header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.2)', borderRadius: '14px 14px 0 0',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Equipment Detail
            </div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {pump.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pump.tag}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)',
          }}>✕</button>
        </div>

        {/* Values */}
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {pump.alarm !== 'NORMAL' && (
            <div style={{
              background: pump.alarm === 'WARNING' ? 'rgba(255,214,10,0.08)' : 'rgba(255,59,48,0.08)',
              border: `1px solid ${pump.alarm === 'WARNING' ? 'rgba(255,214,10,0.3)' : 'rgba(255,59,48,0.3)'}`,
              borderRadius: 8, padding: '8px 12px', marginBottom: 6,
              color: pump.alarm === 'WARNING' ? 'var(--status-warning)' : 'var(--status-alarm)',
              fontSize: 12, fontWeight: 500,
            }}>
              ⚠ {pump.alarmMsg}
            </div>
          )}
          {rows.map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '4px 0',
              borderBottom: '1px solid var(--glass-border)',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {label}
              </span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: 'var(--text-value)' }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: 10, color: 'var(--text-muted)' }}>
          Click outside or ✕ to close · Read-only demo mode
        </div>
      </div>
    </div>
  )
}

function matches(pump, filters, searchQuery) {
  const q = searchQuery.toLowerCase()
  if (q && ![pump.name, pump.tag, pump.facilityName, pump.type].some(v => v.toLowerCase().includes(q))) return false

  for (const f of filters) {
    if (f.type === 'status' && pump.status !== f.value) return false
    if (f.type === 'type' && pump.type !== f.value) return false
    if (f.type === 'facility' && pump.facility !== f.value) return false
    if (f.type === 'severity') {
      const sev = f.value
      if (sev === 'CRITICAL' && pump.alarm !== 'ALARM' && pump.alarm !== 'FAULT') return false
      if (sev === 'WARNING' && pump.alarm !== 'WARNING') return false
      if (sev === 'NORMAL' && pump.alarm !== 'NORMAL') return false
    }
  }
  return true
}

export default function PumpStations({ pumps, filters, searchQuery, addFilter }) {
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() =>
    pumps.filter(p => matches(p, filters, searchQuery)),
    [pumps, filters, searchQuery]
  )

  const statusCounts = useMemo(() => {
    const c = { RUNNING: 0, STANDBY: 0, FAULT: 0 }
    pumps.forEach(p => { if (c[p.status] !== undefined) c[p.status]++ })
    return c
  }, [pumps])

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>

      {/* Quick filter buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          PUMP STATIONS
        </span>
        <div style={{ flex: 1 }} />
        {[
          { label: `${statusCounts.RUNNING} Running`, type: 'status', value: 'RUNNING', cls: 'btn-active' },
          { label: `${statusCounts.STANDBY} Standby`, type: 'status', value: 'STANDBY' },
          { label: `${statusCounts.FAULT} Fault`, type: 'status', value: 'FAULT', cls: 'btn-alarm-active' },
          { label: 'All', clear: true },
        ].map(b => (
          <button key={b.label}
            className={`btn ${filters.some(f => f.type === b.type && f.value === b.value) ? (b.cls || 'btn-active') : ''}`}
            onClick={() => {
              if (b.clear) { /* handled by clear in sidebar */ }
              else addFilter({ type: b.type, value: b.value, label: b.label })
            }}>
            {b.label}
          </button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
          {filtered.length}/{pumps.length}
        </span>
      </div>

      {/* Card grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: 10, alignContent: 'start',
      }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>
            No equipment matches current filters
          </div>
        ) : filtered.map(pump => (
          <PumpCard key={pump.id} pump={pump} onSelect={setSelected} />
        ))}
      </div>

      {selected && <PumpDetailModal pump={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
