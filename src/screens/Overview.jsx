import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { OVERVIEW_KPIS, FACILITIES, TREND_DATA } from '../data/mockData.js'

// Maps facility ID → trend data key + color
const FACILITY_TREND = {
  'AZL-PS1': { key: 'azulPS1',    color: '#5ac8fa' },
  'AZL-PS2': { key: 'azulPS2',    color: '#32d74b' },
  'NM-PS3':  { key: 'northMesa',  color: '#ffd60a' },
  'CR-PS4':  { key: 'cedarRidge', color: '#ff9f0a' },
}

// ─── Small shared components ─────────────────────────────────────────────────

function KpiCard({ label, value, unit, sub, color }) {
  return (
    <div className="glass-card kpi-item" style={{ minWidth: 110 }}>
      <div className="value-label">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span className="value-display" style={{ fontSize: 22, color: color || 'var(--text-value)' }}>{value}</span>
        {unit && <span className="value-unit">{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
    </div>
  )
}

function FacilityStatusRow({ id, name, type, status, flow, flowUnit, alarmCount, onClick }) {
  const statusColor = {
    NORMAL: 'var(--status-normal)', WARNING: 'var(--status-warning)',
    ALARM: 'var(--status-alarm)', OFFLINE: 'var(--text-muted)',
  }[status] || 'var(--text-muted)'
  const badgeClass = { NORMAL: 'badge-normal', WARNING: 'badge-warning', ALARM: 'badge-alarm', OFFLINE: 'badge-cleared' }[status] || 'badge-cleared'

  return (
    <div onClick={onClick} className="glass-card" style={{
      padding: '10px 14px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 10,
      borderLeft: `3px solid ${statusColor}`,
    }}>
      <span className={`dot dot-${status?.toLowerCase()}`} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{type}</div>
      </div>
      {flow !== undefined && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span className="value-display" style={{ fontSize: 16 }}>{flow.toLocaleString()}</span>
          <span className="value-unit">{flowUnit}</span>
        </div>
      )}
      <span className={`status-badge ${badgeClass}`}>{status}</span>
      {alarmCount > 0 && (
        <span style={{ background: 'var(--status-alarm)', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>
          {alarmCount}
        </span>
      )}
      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>›</span>
    </div>
  )
}

function OverviewAlarmRow({ alarm, onClick }) {
  const sev = alarm.severity?.toLowerCase()
  const badgeClass = sev === 'critical' ? 'badge-critical' : sev === 'warning' ? 'badge-warning' : 'badge-normal'
  return (
    <div onClick={() => onClick(alarm)} className="glass-card" style={{
      padding: '8px 12px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 10,
      borderLeft: `3px solid ${sev === 'critical' ? 'var(--status-alarm)' : 'var(--status-warning)'}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {alarm.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alarm.facilityName} · {alarm.timestamp}</div>
      </div>
      <span className={`status-badge ${badgeClass}`}>{alarm.severity}</span>
    </div>
  )
}

// ─── Facility Detail Modal — Tab contents ────────────────────────────────────

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-value)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function SectionHeader({ children }) {
  return (
    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 14, marginBottom: 6 }}>
      {children}
    </div>
  )
}

function FacilityDataTab({ facPumps, facTanks, facAlarms }) {
  const activeAlarms = facAlarms.filter(a => a.status !== 'CLEARED')

  if (facPumps.length === 0 && facTanks.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14 }}>
        No equipment registered at this facility
      </div>
    )
  }

  return (
    <div>
      {/* Alarm summary line */}
      {activeAlarms.length > 0 && (
        <div style={{
          background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 10,
          color: 'var(--status-alarm)', fontSize: 12, fontWeight: 500,
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-alarm)', flexShrink: 0, display: 'inline-block' }} className="pulse" />
          {activeAlarms.length} active alarm{activeAlarms.length !== 1 ? 's' : ''} — {activeAlarms.filter(a => a.severity === 'CRITICAL').length} critical
        </div>
      )}

      {/* Pumps */}
      {facPumps.length > 0 && (
        <>
          <SectionHeader>Pumps ({facPumps.length})</SectionHeader>
          {facPumps.map(p => {
            const statusBadge = { RUNNING: 'badge-running', STANDBY: 'badge-standby', FAULT: 'badge-fault' }[p.status] || 'badge-cleared'
            return (
              <div key={p.id} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>{p.tag}</div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{p.name}</div>
                  </div>
                  <span className={`status-badge ${statusBadge}`}>{p.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { label: 'Flow', value: p.status === 'RUNNING' ? `${p.flow.toLocaleString()} ${p.flowUnit}` : '— bbl/h' },
                    { label: 'Disch PSI', value: p.status === 'RUNNING' ? `${p.pressure_out} PSI` : '— PSI' },
                    { label: 'Power', value: p.status === 'RUNNING' ? `${p.power} ${p.powerUnit}` : '— kW' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 5, padding: '4px 8px' }}>
                      <div className="value-label">{label}</div>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-value)' }}>{value}</span>
                    </div>
                  ))}
                </div>
                {p.alarm !== 'NORMAL' && (
                  <div style={{ marginTop: 6, fontSize: 11, color: p.alarm === 'WARNING' ? 'var(--status-warning)' : 'var(--status-alarm)' }}>
                    ⚠ {p.alarmMsg}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {/* Tanks */}
      {facTanks.length > 0 && (
        <>
          <SectionHeader>Storage ({facTanks.length})</SectionHeader>
          {facTanks.map(t => {
            const pct = t.levelPct
            const barColor = pct > 90 ? 'var(--status-alarm)' : pct > 80 ? 'var(--status-warning)' : 'var(--status-normal)'
            return (
              <div key={t.id} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>{t.tag}</div>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{t.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 18, color: barColor }}>{pct.toFixed(1)}%</span>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.level.toLocaleString()} / {t.capacity.toLocaleString()} bbl</div>
                  </div>
                </div>
                <div className="level-bar-track">
                  <div className="level-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                  {[
                    { label: 'In', value: `+${t.inFlow.toLocaleString()}`, color: 'var(--status-normal)' },
                    { label: 'Out', value: `-${t.outFlow.toLocaleString()}`, color: 'var(--accent-blue)' },
                    { label: 'Net', value: `${t.netFlow >= 0 ? '+' : ''}${t.netFlow.toLocaleString()}`, color: t.netFlow >= 0 ? 'var(--status-normal)' : 'var(--accent-blue)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 5, padding: '4px 8px' }}>
                      <div className="value-label">{label} bbl/h</div>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

function FacilityHistoryTab({ facAlarms }) {
  if (facAlarms.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14 }}>
        No alarm history for this facility
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
        {facAlarms.length} alarm record{facAlarms.length !== 1 ? 's' : ''} — newest first
      </div>
      {[...facAlarms].reverse().map(alarm => {
        const sevClass = alarm.severity === 'CRITICAL' ? 'badge-critical' : alarm.severity === 'WARNING' ? 'badge-warning' : 'badge-normal'
        const stClass = alarm.status === 'UNACKNOWLEDGED' ? 'badge-alarm' : alarm.status === 'ACKNOWLEDGED' ? 'badge-warning' : 'badge-cleared'
        const leftColor = alarm.severity === 'CRITICAL' ? 'var(--status-alarm)' : alarm.severity === 'WARNING' ? 'var(--status-warning)' : 'var(--text-muted)'
        return (
          <div key={alarm.id} className="glass-card" style={{
            padding: '8px 12px', opacity: alarm.status === 'CLEARED' ? 0.6 : 1,
            borderLeft: `3px solid ${leftColor}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              {alarm.status === 'UNACKNOWLEDGED' && (
                <span className="pulse" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--status-alarm)', marginTop: 4, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{alarm.name}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{alarm.timestamp} · {alarm.tag}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <span className={`status-badge ${sevClass}`}>{alarm.severity}</span>
                <span className={`status-badge ${stClass}`}>{alarm.status === 'UNACKNOWLEDGED' ? 'UNACK' : alarm.status === 'ACKNOWLEDGED' ? 'ACK' : 'CLEARED'}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingLeft: alarm.status === 'UNACKNOWLEDGED' ? 15 : 0 }}>
              {alarm.message}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FacilityChartTab({ facilityId, facilityName }) {
  const trend = FACILITY_TREND[facilityId]

  if (!trend) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14 }}>
        No trend data available for this facility type
      </div>
    )
  }

  const data = TREND_DATA.map(d => ({ hour: d.hour, flow: d[trend.key] }))
  const values = data.map(d => d.flow).filter(v => v > 0)
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b) / values.length) : 0
  const max = values.length ? Math.max(...values) : 0
  const min = values.length ? Math.min(...values) : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '8px 12px', backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: trend.color }}>
          {payload[0].value?.toLocaleString()} bbl/h
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" interval={3}
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fill: 'var(--text-muted)' }} />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(1)}K`}
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fill: 'var(--text-muted)' }}
              width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="flow" stroke={trend.color}
              dot={false} strokeWidth={2} activeDot={{ r: 4, fill: trend.color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
        {[
          { label: 'AVG 24H', value: avg.toLocaleString(), color: trend.color },
          { label: 'MAX',     value: max.toLocaleString(), color: 'var(--text-value)' },
          { label: 'MIN',     value: min.toLocaleString(), color: 'var(--text-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
            <div className="value-label">{label}</div>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 15, color }}>{value}</span>
            <span className="value-unit"> bbl/h</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Facility Detail Modal ────────────────────────────────────────────────────

function FacilityDetailModal({ facility, pumps, tanks, alarms, onClose }) {
  const [tab, setTab] = useState('data')

  const facPumps = pumps.filter(p => p.facility === facility.id)
  const facTanks = tanks.filter(t => t.facility === facility.id)
  const facAlarms = alarms.filter(a => a.facility === facility.id)

  const hasTrend = !!FACILITY_TREND[facility.id]
  const statusColor = {
    NORMAL: 'var(--status-normal)', WARNING: 'var(--status-warning)', ALARM: 'var(--status-alarm)',
  }[facility.status] || 'var(--text-muted)'
  const statusBadge = { NORMAL: 'badge-normal', WARNING: 'badge-warning', ALARM: 'badge-alarm' }[facility.status] || 'badge-cleared'

  const TABS = [
    { id: 'data', label: 'Data' },
    { id: 'history', label: `History (${facAlarms.length})` },
    ...(hasTrend ? [{ id: 'trend', label: 'Trend' }] : []),
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-in" onClick={e => e.stopPropagation()}
        style={{ padding: 0, maxWidth: 640, width: '95%', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          padding: '14px 18px', flexShrink: 0,
          borderBottom: '1px solid var(--glass-border)',
          borderTop: `4px solid ${statusColor}`,
          borderRadius: '14px 14px 0 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Facility Detail
            </div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {facility.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {facility.location} · {facility.typeRaw}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <span className={`status-badge ${statusBadge}`}>{facility.status}</span>
            <button onClick={onClose} style={{
              background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)',
            }}>✕</button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '0 18px', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent-blue)' : 'transparent'}`,
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              transition: 'color 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          {tab === 'data'    && <FacilityDataTab    facPumps={facPumps} facTanks={facTanks} facAlarms={facAlarms} />}
          {tab === 'history' && <FacilityHistoryTab facAlarms={facAlarms} />}
          {tab === 'trend'   && <FacilityChartTab   facilityId={facility.id} facilityName={facility.name} />}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--glass-border)', textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
          Click outside or ✕ to close · Read-only demo mode
        </div>
      </div>
    </div>
  )
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

function matchesFacility(fac, filters, searchQuery) {
  const q = (searchQuery || '').toLowerCase()
  if (q && !fac.name.toLowerCase().includes(q) && !fac.typeRaw.toLowerCase().includes(q) && !fac.location.toLowerCase().includes(q)) return false

  // OR within same filter type, AND across different types
  const byType = (filters || []).reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = []
    acc[f.type].push(f.value)
    return acc
  }, {})

  if (byType.facility && !byType.facility.includes(fac.id)) return false
  if (byType.status && !byType.status.some(s => fac.pumpStatuses.includes(s))) return false
  if (byType.type && !byType.type.some(t => fac.equipmentTypes.includes(t))) return false
  return true
}

function matchesOverviewAlarm(alarm, filters, searchQuery) {
  const q = (searchQuery || '').toLowerCase()
  if (q && ![alarm.name, alarm.facilityName, alarm.tag, alarm.category]
    .some(v => v.toLowerCase().includes(q))) return false

  // OR within same filter type, AND across different types
  const byType = (filters || []).reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = []
    acc[f.type].push(f.value)
    return acc
  }, {})

  if (byType.severity    && !byType.severity.includes(alarm.severity))    return false
  if (byType.facility    && !byType.facility.includes(alarm.facility))    return false
  if (byType.category    && !byType.category.includes(alarm.category))    return false
  if (byType.alarmStatus && !byType.alarmStatus.includes(alarm.status))   return false
  return true
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function Overview({ pumps, tanks, alarms, filters = [], searchQuery = '', onAlarmClick }) {
  const navigate = useNavigate()
  const kpi = OVERVIEW_KPIS
  const [selectedFacility, setSelectedFacility] = useState(null)

  const runningPumps = pumps.filter(p => p.status === 'RUNNING').length
  const activeAlarms = alarms.filter(a => a.status !== 'CLEARED')
  const unacked = alarms.filter(a => a.status === 'UNACKNOWLEDGED')

  // Derive facility statuses from live pump/tank/alarm data
  const allFacilityStatuses = useMemo(() => FACILITIES.map(fac => {
    const facPumps = pumps.filter(p => p.facility === fac.id)
    const facTanks = tanks.filter(t => t.facility === fac.id)
    const facAlarms = alarms.filter(a => a.facility === fac.id && a.status !== 'CLEARED')

    let status = 'NORMAL'
    if (facPumps.some(p => p.alarm === 'ALARM' || p.alarm === 'FAULT') ||
        facTanks.some(t => t.alarm === 'ALARM')) {
      status = 'ALARM'
    } else if (facPumps.some(p => p.alarm === 'WARNING') ||
               facTanks.some(t => t.alarm === 'WARNING')) {
      status = 'WARNING'
    }

    const totalFlow = facPumps.reduce((s, p) => s + (p.status === 'RUNNING' ? p.flow : 0), 0)
    const typeLabel = facTanks.length > 0
      ? `${facTanks[0].type} — ${facTanks[0].levelPct.toFixed(1)}%`
      : fac.type

    return {
      id: fac.id,
      name: fac.name,
      type: typeLabel,
      typeRaw: fac.type,
      location: fac.location,
      status,
      flow: totalFlow > 0 ? totalFlow : undefined,
      flowUnit: 'bbl/h',
      alarmCount: facAlarms.length,
      pumpStatuses: facPumps.map(p => p.status),
      equipmentTypes: [...new Set([...facPumps.map(p => p.type), ...facTanks.map(t => t.type)])],
    }
  }), [pumps, tanks, alarms])

  const facilityStatuses = useMemo(() =>
    allFacilityStatuses.filter(f => matchesFacility(f, filters, searchQuery)),
    [allFacilityStatuses, filters, searchQuery]
  )

  const recentAlarms = useMemo(() =>
    activeAlarms.filter(a => matchesOverviewAlarm(a, filters, searchQuery)).slice(0, 4),
    [activeAlarms, filters, searchQuery]
  )

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflowY: 'auto' }}>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <KpiCard label="Total Flow Rate" value={kpi.totalFlow.toLocaleString()} unit="bbl/h"
          sub="Azul Pipeline System" color="var(--accent-cyan)" />
        <KpiCard label="Volume Today" value={(kpi.totalVolume24h/1000).toFixed(0)+'K'} unit="bbl"
          sub="24-hour total" />
        <KpiCard label="Active Alarms" value={unacked.length} sub={`${activeAlarms.length} total active`}
          color={unacked.length > 0 ? 'var(--status-alarm)' : 'var(--status-normal)'} />
        <KpiCard label="Pumps Running" value={`${runningPumps}/${pumps.length}`} sub="Online / Total"
          color="var(--status-normal)" />
        <KpiCard label="Avg Pressure" value={kpi.avgPressure} unit="PSI" sub="Pipeline header" />
        <KpiCard label="System Efficiency" value={`${kpi.systemEfficiency}%`} sub="Last 24h"
          color={kpi.systemEfficiency > 90 ? 'var(--status-normal)' : 'var(--status-warning)'} />
      </div>

      {/* Two column layout */}
      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0, flexWrap: 'wrap' }}>

        {/* Facility Status Column */}
        <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            <span>Facility Status</span>
            <button onClick={() => navigate('/pumps')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent-blue)', fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>View All →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto' }}>
            {facilityStatuses.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13 }}>
                No facilities match current filters
              </div>
            ) : facilityStatuses.map(f => (
              <FacilityStatusRow key={f.id} {...f}
                onClick={() => setSelectedFacility(f)} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Pipeline schematic */}
          <div className="glass-card" style={{ padding: 16, minHeight: 180 }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10,
            }}>Azul Pipeline — System Overview</div>
            <PipelineSchematic />
          </div>

          {/* Recent Alarms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
            }}>
              <span>Recent Alarms</span>
              <button onClick={onAlarmClick} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent-blue)', fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>View All →</button>
            </div>
            {recentAlarms.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px 0', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13 }}>
                No alarms match current filters
              </div>
            ) : recentAlarms.map(a => (
              <OverviewAlarmRow key={a.id} alarm={a} onClick={onAlarmClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', paddingTop: 4, flexShrink: 0 }}>
        SCADA Demo — Powered by Inductive Automation Ignition · Presented by KTX Electric
      </div>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          pumps={pumps}
          tanks={tanks}
          alarms={alarms}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </div>
  )
}

// ─── Pipeline Schematic SVG ───────────────────────────────────────────────────

function PipelineSchematic() {
  return (
    <svg viewBox="0 0 400 140" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="400" height="140" fill="url(#grid)" rx="6"/>
      <line x1="30" y1="70" x2="370" y2="70" stroke="rgba(90,200,250,0.4)" strokeWidth="4"/>
      {[80,150,220,290,350].map(x => (
        <polygon key={x} points={`${x},66 ${x+8},70 ${x},74`} fill="rgba(90,200,250,0.6)"/>
      ))}
      {[
        { x: 60,  label: 'HUB',    status: '#32d74b' },
        { x: 140, label: 'PS-001', status: '#32d74b' },
        { x: 220, label: 'PS-002', status: '#ffd60a' },
        { x: 290, label: 'PS-003', status: '#32d74b' },
        { x: 360, label: 'PS-004', status: '#ff3b30' },
      ].map(({ x, label, status }) => (
        <g key={label}>
          <circle cx={x} cy={70} r="12" fill="rgba(255,255,255,0.04)" stroke={status} strokeWidth="2"/>
          <circle cx={x} cy={70} r="5" fill={status} opacity="0.8"/>
          <text x={x} y={94} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)" fontFamily="Barlow Condensed, sans-serif" fontWeight="600">{label}</text>
        </g>
      ))}
      <line x1="140" y1="70" x2="140" y2="108" stroke="rgba(90,200,250,0.3)" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="124" y="108" width="32" height="18" rx="3" fill="rgba(50,215,75,0.15)" stroke="rgba(50,215,75,0.5)" strokeWidth="1.5"/>
      <text x="140" y="121" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontFamily="Barlow Condensed, sans-serif">TK-A 71%</text>
      <line x1="220" y1="70" x2="220" y2="108" stroke="rgba(90,200,250,0.3)" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="204" y="108" width="32" height="18" rx="3" fill="rgba(255,214,10,0.15)" stroke="rgba(255,214,10,0.5)" strokeWidth="1.5"/>
      <text x="220" y="121" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontFamily="Barlow Condensed, sans-serif">TK-B 91%</text>
      <line x1="290" y1="70" x2="290" y2="108" stroke="rgba(90,200,250,0.3)" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="274" y="108" width="32" height="18" rx="3" fill="rgba(50,215,75,0.12)" stroke="rgba(50,215,75,0.4)" strokeWidth="1.5"/>
      <text x="290" y="121" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontFamily="Barlow Condensed, sans-serif">PIT 34%</text>
      <circle cx="15" cy="130" r="4" fill="#32d74b"/>
      <text x="23" y="134" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Barlow Condensed">Normal</text>
      <circle cx="65" cy="130" r="4" fill="#ffd60a"/>
      <text x="73" y="134" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Barlow Condensed">Warning</text>
      <circle cx="115" cy="130" r="4" fill="#ff3b30"/>
      <text x="123" y="134" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Barlow Condensed">Alarm</text>
    </svg>
  )
}
