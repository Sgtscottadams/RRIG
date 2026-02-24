import React, { useState, useMemo } from 'react'

function TankGauge({ pct, status }) {
  const color = pct > 90 ? 'var(--status-alarm)' : pct > 80 ? 'var(--status-warning)' : 'var(--status-normal)'
  const h = 120
  const fillH = Math.max(4, (pct / 100) * h)
  const yFill = h - fillH + 16

  return (
    <svg width="64" height={h + 20} viewBox={`0 0 64 ${h + 20}`}>
      {/* Tank outline */}
      <rect x="8" y="14" width="48" height={h} rx="4"
        fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
      {/* Fill */}
      <rect x="9" y={yFill} width="46" height={fillH} rx={fillH >= h ? '4 4 0 0' : '0 0 3 3'}
        fill={color} opacity="0.7"/>
      {/* Level ticks */}
      {[25, 50, 75].map(tick => {
        const tickY = 14 + h - (tick / 100) * h
        return (
          <g key={tick}>
            <line x1="8" y1={tickY} x2="16" y2={tickY} stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <text x="19" y={tickY + 3} fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="IBM Plex Mono">{tick}%</text>
          </g>
        )
      })}
      {/* Pct label */}
      <text x="32" y={yFill + Math.max(18, fillH / 2)} textAnchor="middle"
        fontSize="11" fontWeight="600" fill="white" fontFamily="IBM Plex Mono"
        style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.5)', strokeWidth: 3 }}>
        {pct.toFixed(1)}%
      </text>
    </svg>
  )
}

function TankCard({ tank, onSelect }) {
  const pct = tank.levelPct
  const alarmClass = { NORMAL: 'card-normal', WARNING: 'card-warning', ALARM: 'card-alarm' }[tank.alarm] || 'card-normal'
  const statusBadge = tank.alarm === 'WARNING' ? 'badge-warning' : tank.alarm === 'ALARM' ? 'badge-alarm' : 'badge-normal'

  const netColor = tank.netFlow > 0 ? 'var(--status-normal)' : tank.netFlow < 0 ? 'var(--accent-blue)' : 'var(--text-muted)'

  return (
    <div className={`glass-card ${alarmClass} fade-in`}
      onClick={() => onSelect(tank)}
      style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: 14 }}>

      {/* Gauge */}
      <TankGauge pct={pct} status={tank.alarm} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {tank.tag}
            </div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {tank.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tank.type}</div>
          </div>
          <span className={`status-badge ${statusBadge}`}>{tank.status}</span>
        </div>

        {/* Level bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span className="value-label">Volume</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
              {tank.capacity.toLocaleString()} {tank.levelUnit} cap
            </span>
          </div>
          <div className="level-bar-track">
            <div className="level-bar-fill" style={{
              width: `${pct}%`,
              background: pct > 90 ? 'var(--status-alarm)' : pct > 80 ? 'var(--status-warning)' : 'var(--status-normal)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-value)' }}>
              {tank.level.toLocaleString()} {tank.levelUnit}
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: pct > 90 ? 'var(--status-alarm)' : 'var(--text-muted)' }}>
              {pct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Flow rates */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '5px 8px' }}>
            <div className="value-label">In-Flow</div>
            <span className="value-display" style={{ fontSize: 15, color: 'var(--status-normal)' }}>{tank.inFlow.toLocaleString()}</span>
            <span className="value-unit">bbl/h</span>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '5px 8px' }}>
            <div className="value-label">Out-Flow</div>
            <span className="value-display" style={{ fontSize: 15, color: 'var(--accent-blue)' }}>{tank.outFlow.toLocaleString()}</span>
            <span className="value-unit">bbl/h</span>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '5px 8px' }}>
            <div className="value-label">Net</div>
            <span className="value-display" style={{ fontSize: 15, color: netColor }}>
              {tank.netFlow >= 0 ? '+' : ''}{tank.netFlow.toLocaleString()}
            </span>
            <span className="value-unit">bbl/h</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TankDetailModal({ tank, onClose }) {
  if (!tank) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-in" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: '14px 14px 0 0' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tank / Storage Detail</div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{tank.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tank.tag}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
        </div>

        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tank.alarm !== 'NORMAL' && (
            <div style={{
              background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.3)',
              borderRadius: 8, padding: '8px 12px', marginBottom: 6,
              color: 'var(--status-warning)', fontSize: 12, fontWeight: 500,
            }}>⚠ {tank.alarmMsg}</div>
          )}
          {[
            ['Tag', tank.tag], ['Facility', tank.facilityName], ['Type', tank.type],
            ['Status', tank.status], ['Capacity', `${tank.capacity.toLocaleString()} bbl`],
            ['Current Volume', `${tank.level.toLocaleString()} bbl`],
            ['Level %', `${tank.levelPct.toFixed(1)}%`],
            ['In-Flow Rate', `${tank.inFlow.toLocaleString()} bbl/h`],
            ['Out-Flow Rate', `${tank.outFlow.toLocaleString()} bbl/h`],
            ['Net Flow', `${tank.netFlow >= 0 ? '+' : ''}${tank.netFlow.toLocaleString()} bbl/h`],
            ['Operating Pressure', `${tank.pressure} ${tank.pressureUnit}`],
            ['Temperature', `${tank.temp} ${tank.tempUnit}`],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{l}</span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: 'var(--text-value)' }}>{v}</span>
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

function matchesTank(tank, filters, searchQuery) {
  const q = searchQuery.toLowerCase()
  if (q && ![tank.name, tank.tag, tank.facilityName, tank.type].some(v => v.toLowerCase().includes(q))) return false

  // OR within same filter type, AND across different types
  const byType = filters.reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = []
    acc[f.type].push(f.value)
    return acc
  }, {})

  if (byType.type && !byType.type.includes(tank.type)) return false
  if (byType.facility && !byType.facility.includes(tank.facility)) return false
  if (byType.severity) {
    const sevMap = { CRITICAL: ['ALARM'], WARNING: ['WARNING'], NORMAL: ['NORMAL'] }
    const allowed = byType.severity.flatMap(s => sevMap[s] || [])
    if (!allowed.includes(tank.alarm)) return false
  }
  return true
}

export default function TankMonitor({ tanks, filters, searchQuery }) {
  const [selected, setSelected] = useState(null)
  const filtered = useMemo(() => tanks.filter(t => matchesTank(t, filters, searchQuery)), [tanks, filters, searchQuery])

  const totalCapacity = tanks.reduce((s, t) => s + t.capacity, 0)
  const totalVolume   = tanks.reduce((s, t) => s + t.level, 0)
  const totalPct      = (totalVolume / totalCapacity * 100).toFixed(1)

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        <div className="glass-card" style={{ padding: '8px 14px', display: 'flex', gap: 16, alignItems: 'center', flex: 1 }}>
          <div>
            <div className="value-label">Total Storage Capacity</div>
            <span className="value-display" style={{ fontSize: 16 }}>{(totalCapacity / 1000).toFixed(0)}K</span>
            <span className="value-unit">bbl</span>
          </div>
          <div>
            <div className="value-label">Current Total Volume</div>
            <span className="value-display" style={{ fontSize: 16 }}>{(totalVolume / 1000).toFixed(0)}K</span>
            <span className="value-unit">bbl</span>
          </div>
          <div>
            <div className="value-label">Avg Fill Level</div>
            <span className="value-display" style={{ fontSize: 16, color: totalPct > 85 ? 'var(--status-warning)' : 'var(--status-normal)' }}>{totalPct}%</span>
          </div>
          <div style={{ flex: 1, minWidth: 80 }}>
            <div className="level-bar-track" style={{ height: 10 }}>
              <div className="level-bar-fill" style={{
                width: `${totalPct}%`,
                background: totalPct > 90 ? 'var(--status-alarm)' : totalPct > 80 ? 'var(--status-warning)' : 'var(--status-normal)',
              }} />
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
            {filtered.length}/{tanks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>
            No tanks match current filters
          </div>
        ) : filtered.map(tank => (
          <TankCard key={tank.id} tank={tank} onSelect={setSelected} />
        ))}
      </div>

      {selected && <TankDetailModal tank={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
