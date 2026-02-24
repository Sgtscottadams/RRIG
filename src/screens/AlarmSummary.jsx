import React, { useState, useMemo } from 'react'

function AlarmBadge({ severity }) {
  const cls = severity === 'CRITICAL' ? 'badge-critical' : severity === 'WARNING' ? 'badge-warning' : 'badge-normal'
  return <span className={`status-badge ${cls}`}>{severity}</span>
}

function AlarmStatusBadge({ status }) {
  const cls = status === 'UNACKNOWLEDGED' ? 'badge-alarm' : status === 'ACKNOWLEDGED' ? 'badge-warning' : 'badge-cleared'
  return <span className={`status-badge ${cls}`}>{status === 'UNACKNOWLEDGED' ? 'UNACK' : status === 'ACKNOWLEDGED' ? 'ACK' : 'CLEARED'}</span>
}

function AlarmRow({ alarm, onClick, isSelected }) {
  const sev = alarm.severity
  const leftColor = sev === 'CRITICAL' ? 'var(--status-alarm)' : sev === 'WARNING' ? 'var(--status-warning)' : 'var(--text-muted)'
  const unacked = alarm.status === 'UNACKNOWLEDGED'

  return (
    <div onClick={() => onClick(alarm)}
      className="glass-card fade-in"
      style={{
        padding: '10px 14px', cursor: 'pointer',
        borderLeft: `3px solid ${leftColor}`,
        background: isSelected ? 'var(--bg-card-hover)' : undefined,
        opacity: alarm.status === 'CLEARED' ? 0.6 : 1,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Time */}
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, minWidth: 110 }}>
          {alarm.timestamp}
        </span>
        {/* ID */}
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--accent-blue)', flexShrink: 0 }}>
          {alarm.id}
        </span>
        {/* Name */}
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', flex: 1, minWidth: 120 }}>
          {unacked && <span className="pulse" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--status-alarm)', marginRight: 6 }} />}
          {alarm.name}
        </span>
        {/* Facility */}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 100 }} className="hide-mobile">
          {alarm.facilityName}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }} className="hide-mobile">
          {alarm.category}
        </span>
        <AlarmBadge severity={alarm.severity} />
        <AlarmStatusBadge status={alarm.status} />
      </div>
    </div>
  )
}

function AlarmDetailModal({ alarm, onClose, onAck }) {
  if (!alarm) return null

  const sev = alarm.severity
  const borderColor = sev === 'CRITICAL' ? 'var(--status-alarm)' : sev === 'WARNING' ? 'var(--status-warning)' : 'var(--text-muted)'
  const canAck = alarm.status === 'UNACKNOWLEDGED'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box fade-in" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>

        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--glass-border)',
          borderTop: `4px solid ${borderColor}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          borderRadius: '14px 14px 0 0',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{alarm.id}</span>
              <AlarmBadge severity={alarm.severity} />
              <AlarmStatusBadge status={alarm.status} />
            </div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 21, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {alarm.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'IBM Plex Mono, monospace' }}>
              {alarm.tagPath}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>✕</button>
        </div>

        {/* Alarm message */}
        <div style={{ padding: '14px 18px' }}>
          <div style={{
            background: sev === 'CRITICAL' ? 'rgba(255,59,48,0.06)' : 'rgba(255,214,10,0.06)',
            border: `1px solid ${sev === 'CRITICAL' ? 'rgba(255,59,48,0.2)' : 'rgba(255,214,10,0.2)'}`,
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 14,
          }}>
            {alarm.message}
          </div>

          {/* Detail rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Alarm ID', alarm.id],
              ['Tag', alarm.tag],
              ['Tag Path', alarm.tagPath],
              ['Facility', alarm.facilityName],
              ['Equipment Type', alarm.type],
              ['Category', alarm.category],
              ['Alarm Time', alarm.timestamp],
              ['Duration', alarm.duration],
              ['Current Value', alarm.value],
              ['Setpoint', alarm.setpoint],
              ['Acknowledged By', alarm.ackBy || '—'],
              ['Acknowledge Time', alarm.ackTime || '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--glass-border)', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>{l}</span>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-value)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn">Close</button>
          {canAck && (
            <button onClick={() => { onAck(alarm.id); onClose() }} className="btn"
              style={{ background: 'rgba(50,215,75,0.15)', borderColor: 'rgba(50,215,75,0.4)', color: 'var(--status-normal)' }}>
              ✓ Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function matchesAlarm(alarm, filters, searchQuery) {
  const q = searchQuery.toLowerCase()
  if (q && ![alarm.name, alarm.tag, alarm.facilityName, alarm.category, alarm.id, alarm.tagPath]
    .some(v => v.toLowerCase().includes(q))) return false

  for (const f of filters) {
    if (f.type === 'severity' && alarm.severity !== f.value) return false
    if (f.type === 'alarmStatus' && alarm.status !== f.value) return false
    if (f.type === 'category' && alarm.category !== f.value) return false
    if (f.type === 'facility' && alarm.facility !== f.value) return false
    if (f.type === 'type' && alarm.type !== f.value) return false
  }
  return true
}

export default function AlarmSummary({ alarms, filters, searchQuery, addFilter, onAck }) {
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() =>
    alarms.filter(a => matchesAlarm(a, filters, searchQuery)),
    [alarms, filters, searchQuery]
  )

  const counts = useMemo(() => ({
    critical: alarms.filter(a => a.severity === 'CRITICAL' && a.status !== 'CLEARED').length,
    warning:  alarms.filter(a => a.severity === 'WARNING'  && a.status !== 'CLEARED').length,
    unacked:  alarms.filter(a => a.status === 'UNACKNOWLEDGED').length,
    total:    alarms.length,
  }), [alarms])

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        {[
          { label: `${counts.unacked} Unacknowledged`, type: 'alarmStatus', value: 'UNACKNOWLEDGED', cls: 'btn-alarm-active' },
          { label: `${counts.critical} Critical`, type: 'severity', value: 'CRITICAL', cls: 'btn-alarm-active' },
          { label: `${counts.warning} Warning`, type: 'severity', value: 'WARNING', cls: 'btn-warning-active' },
          { label: 'All Alarms' },
        ].map(b => (
          <button key={b.label}
            className={`btn ${filters.some(f => f.type === b.type && f.value === b.value) ? (b.cls || 'btn-active') : ''}`}
            onClick={() => b.type && addFilter({ type: b.type, value: b.value, label: b.label })}>
            {b.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace', alignSelf: 'center' }}>
          {filtered.length}/{alarms.length}
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex', gap: 10, padding: '0 14px',
        fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
        flexShrink: 0,
      }}>
        <span style={{ minWidth: 110 }}>Time</span>
        <span style={{ minWidth: 60 }}>ID</span>
        <span style={{ flex: 1 }}>Alarm</span>
        <span style={{ minWidth: 100 }} className="hide-mobile">Facility</span>
        <span style={{ minWidth: 80 }} className="hide-mobile">Category</span>
        <span style={{ minWidth: 70 }}>Severity</span>
        <span style={{ minWidth: 60 }}>Status</span>
      </div>

      {/* Alarm list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontFamily: 'Barlow Condensed, sans-serif', fontSize: 15 }}>
            No alarms match current filters
          </div>
        ) : filtered.map(a => (
          <AlarmRow key={a.id} alarm={a}
            isSelected={selected?.id === a.id}
            onClick={setSelected} />
        ))}
      </div>

      {selected && (
        <AlarmDetailModal
          alarm={selected}
          onClose={() => setSelected(null)}
          onAck={onAck}
        />
      )}
    </div>
  )
}
