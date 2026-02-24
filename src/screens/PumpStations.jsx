import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TREND_DATA } from '../data/mockData'

// Facility → trend data key + color
const PUMP_TREND = {
  'AZL-PS1': { key: 'azulPS1',    color: '#5ac8fa' },
  'AZL-PS2': { key: 'azulPS2',    color: '#32d74b' },
  'NM-PS3':  { key: 'northMesa',  color: '#ffd60a' },
  'CR-PS4':  { key: 'cedarRidge', color: '#ff9f0a' },
}

const RANGE_POINTS = { '8H': 9, '12H': 13, '24H': 25 }

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
  const [tab, setTab] = useState('info')
  const [range, setRange] = useState('24H')
  if (!pump) return null

  const trendCfg = PUMP_TREND[pump.facility]
  const pts = RANGE_POINTS[range]
  const trendSlice = TREND_DATA.slice(TREND_DATA.length - pts)

  const vals = trendCfg ? trendSlice.map(d => d[trendCfg.key]).filter(Boolean) : []
  const avg    = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  const maxVal = vals.length ? Math.max(...vals) : null
  const minVal = vals.length ? Math.min(...vals) : null

  const rows = [
    { label: 'Tag Path',           value: pump.tag },
    { label: 'Facility',           value: pump.facilityName },
    { label: 'Type',               value: pump.type },
    { label: 'Status',             value: pump.status },
    { label: 'Flow Rate',          value: `${pump.flow.toLocaleString()} ${pump.flowUnit}` },
    { label: 'Suction Pressure',   value: `${pump.pressure_in} ${pump.pressureUnit}` },
    { label: 'Discharge Pressure', value: `${pump.pressure_out} ${pump.pressureUnit}` },
    { label: 'Speed',              value: `${pump.speed} ${pump.speedUnit}` },
    { label: 'Power Draw',         value: `${pump.power} ${pump.powerUnit}` },
    { label: 'Vibration',          value: `${pump.vibration} in/s` },
    { label: 'Motor Temp',         value: `${pump.temp} °F` },
    { label: 'Total Runtime',      value: pump.runtime },
    { label: 'Operation Count',    value: pump.ops },
    { label: 'Last Operation',     value: pump.lastOp },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-in" onClick={e => e.stopPropagation()}
        style={{ padding: 0, maxWidth: 620 }}>

        {/* Header */}
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`status-badge badge-${pump.status.toLowerCase()}`}>{pump.status}</span>
            <button onClick={onClose} style={{
              background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)',
            }}>✕</button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '0 18px' }}>
          {[['info', 'Info'], ['trend', 'Flow Trend']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '9px 16px', marginBottom: -1,
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: tab === id ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: tab === id ? '2px solid var(--accent-blue)' : '2px solid transparent',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* INFO tab */}
        {tab === 'info' && (
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '60vh', overflowY: 'auto' }}>
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
                padding: '4px 0', borderBottom: '1px solid var(--glass-border)',
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
        )}

        {/* TREND tab */}
        {tab === 'trend' && (
          <div style={{ padding: '14px 18px' }}>
            {!trendCfg ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>
                No historical trend data available for this equipment
              </div>
            ) : (
              <>
                {/* Time range selector */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 14, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>
                    Range
                  </span>
                  {Object.keys(RANGE_POINTS).map(r => (
                    <button key={r} onClick={() => setRange(r)}
                      className={`btn ${range === r ? 'btn-active' : ''}`}
                      style={{ padding: '3px 10px', fontSize: 11 }}>
                      {r}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendSlice} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'IBM Plex Mono' }}
                      tickFormatter={v => `${(v/1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-mid)', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 12 }}
                      labelStyle={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono', marginBottom: 4 }}
                      itemStyle={{ color: trendCfg.color }}
                      formatter={v => [`${v.toLocaleString()} bbl/d`, 'Flow Rate']}
                    />
                    <Line
                      type="monotone" dataKey={trendCfg.key}
                      stroke={trendCfg.color} strokeWidth={2}
                      dot={false} activeDot={{ r: 4, fill: trendCfg.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {[
                    { label: 'Avg', value: avg },
                    { label: 'Max', value: maxVal },
                    { label: 'Min', value: minVal },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      flex: 1, background: 'rgba(0,0,0,0.25)', borderRadius: 6,
                      padding: '8px 10px', textAlign: 'center',
                      border: '1px solid var(--border)',
                    }}>
                      <div className="value-label">{label}</div>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, color: trendCfg.color }}>
                        {value?.toLocaleString() ?? '—'}
                      </span>
                      <span className="value-unit"> bbl/d</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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

  // OR within same filter type, AND across different types
  const byType = filters.reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = []
    acc[f.type].push(f.value)
    return acc
  }, {})

  if (byType.status && !byType.status.includes(pump.status)) return false
  if (byType.type && !byType.type.includes(pump.type)) return false
  if (byType.facility && !byType.facility.includes(pump.facility)) return false
  if (byType.severity) {
    const sevMap = { CRITICAL: ['ALARM', 'FAULT'], WARNING: ['WARNING'], NORMAL: ['NORMAL'] }
    const allowed = byType.severity.flatMap(s => sevMap[s] || [])
    if (!allowed.includes(pump.alarm)) return false
  }
  return true
}

export default function PumpStations({ pumps, filters, searchQuery, addFilter, clearFilters }) {
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
              if (b.clear) clearFilters()
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
