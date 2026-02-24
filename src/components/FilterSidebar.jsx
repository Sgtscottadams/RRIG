import React from 'react'
import { Icons } from '../App.jsx'

function SLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'Barlow Condensed, sans-serif',
      fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'var(--text-muted)',
      padding: '10px 12px 5px',
    }}>
      {children}
    </div>
  )
}

export default function FilterSidebar({
  collapsed, filters, addFilter, removeFilter, clearFilters,
  searchQuery, setSearchQuery, facilities, pumps, alarms, onClose,
}) {
  if (collapsed) return null

  const has = (type, value) => filters.some(f => f.type === type && f.value === value)

  const toggle = (type, value, label) => {
    const ex = filters.find(f => f.type === type && f.value === value)
    if (ex) removeFilter(ex.id)
    else addFilter({ type, value, label })
  }

  // Live counts from props
  const runCount   = pumps.filter(p => p.status === 'RUNNING').length
  const stbyCount  = pumps.filter(p => p.status === 'STANDBY').length
  const faultCount = pumps.filter(p => p.status === 'FAULT').length

  // Group facilities by type
  const byType = facilities.reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = []
    acc[f.type].push(f)
    return acc
  }, {})

  const STATUS_TILES = [
    { value: 'RUNNING', count: runCount,     label: 'RUN',  color: 'var(--status-normal)',  bg: 'rgba(50,215,75,0.10)' },
    { value: 'STANDBY', count: stbyCount,    label: 'STBY', color: 'var(--status-standby)', bg: 'rgba(90,200,250,0.10)' },
    { value: 'FAULT',   count: faultCount,   label: 'FLT',  color: 'var(--status-fault)',   bg: 'rgba(255,59,48,0.10)' },
    { value: null,      count: pumps.length, label: 'ALL',  color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.04)', isAll: true },
  ]

  const ALARM_FILTERS = [
    { type: 'alarmStatus', value: 'UNACKNOWLEDGED', label: 'Unack',    dot: 'var(--status-alarm)' },
    { type: 'severity',    value: 'CRITICAL',        label: 'Critical', dot: 'var(--status-alarm)' },
    { type: 'severity',    value: 'WARNING',         label: 'Warning',  dot: 'var(--status-warning)' },
    { type: 'severity',    value: 'NORMAL',          label: 'Normal',   dot: 'var(--status-normal)' },
  ]

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      overflowY: 'auto', paddingBottom: 20,
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px 8px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 9, fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>Filters</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {filters.length > 0 && (
            <button onClick={clearFilters} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent-red)', fontSize: 9,
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>CLEAR</button>
          )}
          {onClose && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', padding: 2,
            }}>{Icons.close}</button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 10px 4px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex',
          }}>
            {Icons.search}
          </span>
          <input
            className="glass-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 28, fontSize: 12 }}
          />
        </div>
      </div>

      {/* Active chips */}
      {(filters.length > 0 || searchQuery) && (
        <div style={{ padding: '2px 10px 6px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {searchQuery && (
            <span className="filter-chip" onClick={() => setSearchQuery('')}>
              "{searchQuery.slice(0, 8)}{searchQuery.length > 8 ? '…' : ''}"
              <span className="chip-x">✕</span>
            </span>
          )}
          {filters.map(f => (
            <span key={f.id} className="filter-chip" onClick={() => removeFilter(f.id)}>
              {f.label.slice(0, 10)}{f.label.length > 10 ? '…' : ''}
              <span className="chip-x">✕</span>
            </span>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0 0' }} />

      {/* ── Pump Status tiles ── */}
      <SLabel>Pump Status</SLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '0 10px' }}>
        {STATUS_TILES.map(tile => {
          const active = tile.isAll
            ? filters.every(f => f.type !== 'status') && !filters.length
            : has('status', tile.value)
          return (
            <button
              key={tile.label}
              onClick={() => tile.isAll ? clearFilters() : toggle('status', tile.value, tile.label)}
              style={{
                background: active ? tile.bg : 'rgba(0,0,0,0.25)',
                border: `1px solid ${active ? tile.color : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 6, padding: '7px 4px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2, transition: 'all 0.12s',
              }}
            >
              <span style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 18, fontWeight: 600,
                color: tile.color, lineHeight: 1,
              }}>
                {tile.count}
              </span>
              <span style={{
                fontSize: 8, fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: active ? tile.color : 'var(--text-muted)',
              }}>
                {tile.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Alarm State ── */}
      <SLabel>Alarm State</SLabel>
      <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ALARM_FILTERS.map(item => {
          const active = has(item.type, item.value)
          return (
            <button
              key={item.value}
              onClick={() => toggle(item.type, item.value, item.label)}
              style={{
                background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: `1px solid ${active ? 'var(--border-strong)' : 'transparent'}`,
                borderRadius: 5, padding: '5px 8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.12s', textAlign: 'left',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: item.dot, flexShrink: 0,
                boxShadow: active ? `0 0 6px ${item.dot}` : 'none',
              }} />
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700, fontSize: 11, letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── By Facility ── */}
      <SLabel>By Facility</SLabel>
      {Object.entries(byType).map(([type, facs]) => (
        <div key={type}>
          <div style={{
            padding: '2px 12px 2px 12px',
            display: 'flex', justifyContent: 'space-between',
            fontSize: 9, fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            <span>{type}</span>
            <span>{facs.length}</span>
          </div>
          {facs.map(f => {
            const active = has('facility', f.id)
            return (
              <button
                key={f.id}
                onClick={() => active
                  ? removeFilter(filters.find(fi => fi.type === 'facility' && fi.value === f.id)?.id)
                  : addFilter({ type: 'facility', value: f.id, label: f.name })
                }
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  width: '100%', padding: '4px 12px 4px 18px',
                  background: active ? 'rgba(59,158,255,0.10)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontFamily: 'Barlow, sans-serif', fontSize: 11,
                  textAlign: 'left', transition: 'all 0.10s',
                }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                  background: active ? 'var(--accent-blue)' : 'rgba(255,255,255,0.2)',
                }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                {active && <span style={{ marginLeft: 'auto', fontSize: 9, opacity: 0.7 }}>✓</span>}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
