import React, { useState } from 'react'
import { Icons } from '../App.jsx'

const SEVERITY_OPTIONS = ['CRITICAL', 'WARNING', 'NORMAL']
const STATUS_OPTIONS    = ['RUNNING', 'STANDBY', 'FAULT']
const ALARM_STATUS_OPT  = ['UNACKNOWLEDGED', 'ACKNOWLEDGED', 'CLEARED']

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'Barlow Condensed, sans-serif',
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      padding: '0 16px', marginTop: 16, marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

function FilterRow({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '5px 16px',
      background: active ? 'rgba(59,158,255,0.10)' : 'transparent',
      border: 'none', cursor: 'pointer',
      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
      fontFamily: 'Barlow, sans-serif', fontSize: 13,
      transition: 'all 0.12s',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {active && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0 }} />
        )}
        {!active && <span style={{ width: 6 }} />}
        {label}
      </span>
      {active && <span style={{ fontSize: 10, color: 'var(--accent-blue)' }}>✓</span>}
    </button>
  )
}

function FacilityTree({ facilities, filters, addFilter, removeFilter }) {
  const hasFilter = (type, value) => filters.some(f => f.type === type && f.value === value)

  const byType = facilities.reduce((acc, f) => {
    const t = f.type
    if (!acc[t]) acc[t] = []
    acc[t].push(f)
    return acc
  }, {})

  return (
    <div>
      {Object.entries(byType).map(([type, facs]) => (
        <div key={type}>
          <div style={{ padding: '4px 16px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, letterSpacing: '0.06em' }}>
            {type}s
          </div>
          {facs.map(f => {
            const active = hasFilter('facility', f.id)
            return (
              <FilterRow key={f.id} label={f.name} active={active}
                onClick={() => active
                  ? removeFilter(filters.find(fi => fi.type === 'facility' && fi.value === f.id)?.id)
                  : addFilter({ type: 'facility', value: f.id, label: f.name })
                }
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function FilterSidebar({
  collapsed, filters, addFilter, removeFilter, clearFilters,
  searchQuery, setSearchQuery, facilities, equipmentTypes, alarms, onClose
}) {
  if (collapsed) return null

  const hasFilter = (type, value) => filters.some(f => f.type === type && f.value === value)

  const toggleFilter = (type, value, label) => {
    const existing = filters.find(f => f.type === type && f.value === value)
    if (existing) removeFilter(existing.id)
    else addFilter({ type, value, label })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: 24 }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
          {Icons.filter} FILTERS & SEARCH
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {filters.length > 0 && (
            <button onClick={clearFilters} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent-red)', fontSize: 11,
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 4px',
            }}>
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {Icons.close}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 16px 6px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            {Icons.search}
          </span>
          <input
            className="glass-input"
            placeholder="Tag, facility, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {(filters.length > 0 || searchQuery) && (
        <div style={{ padding: '4px 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 4, flexShrink: 0 }}>
          {searchQuery && (
            <span className="filter-chip" onClick={() => setSearchQuery('')}>
              🔍 "{searchQuery}" <span className="chip-x">✕</span>
            </span>
          )}
          {filters.map(f => (
            <span key={f.id} className="filter-chip" onClick={() => removeFilter(f.id)}>
              {f.label} <span className="chip-x">✕</span>
            </span>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--glass-border)', margin: '4px 0' }} />

      {/* Equipment Status */}
      <SectionLabel>Equipment Status</SectionLabel>
      {STATUS_OPTIONS.map(s => (
        <FilterRow key={s} label={s.charAt(0) + s.slice(1).toLowerCase()}
          active={hasFilter('status', s)}
          onClick={() => toggleFilter('status', s, s.charAt(0) + s.slice(1).toLowerCase())}
        />
      ))}

      {/* Alarm Severity */}
      <SectionLabel>Alarm Severity</SectionLabel>
      {SEVERITY_OPTIONS.map(s => (
        <FilterRow key={s} label={s.charAt(0) + s.slice(1).toLowerCase()}
          active={hasFilter('severity', s)}
          onClick={() => toggleFilter('severity', s, 'Severity: ' + s.charAt(0) + s.slice(1).toLowerCase())}
        />
      ))}

      {/* Alarm Status */}
      <SectionLabel>Alarm Status</SectionLabel>
      {ALARM_STATUS_OPT.map(s => (
        <FilterRow key={s} label={s.charAt(0) + s.slice(1).toLowerCase()}
          active={hasFilter('alarmStatus', s)}
          onClick={() => toggleFilter('alarmStatus', s, 'Status: ' + s.charAt(0) + s.slice(1).toLowerCase())}
        />
      ))}

      {/* Equipment Type */}
      <SectionLabel>Equipment Type</SectionLabel>
      {['Transfer Pump', 'Booster Pump', 'Disposal Pump', 'Storage Tank', 'Frac Pit', 'Disposal Well', 'Flow Meter', 'Level Sensor'].map(t => (
        <FilterRow key={t} label={t}
          active={hasFilter('type', t)}
          onClick={() => toggleFilter('type', t, t)}
        />
      ))}

      {/* By Facility */}
      <SectionLabel>By Facility</SectionLabel>
      <FacilityTree facilities={facilities} filters={filters} addFilter={addFilter} removeFilter={removeFilter} />

      {/* Alarm Category */}
      <SectionLabel>Alarm Category</SectionLabel>
      {['Equipment Fault', 'Process Warning', 'Safety', 'Communication'].map(c => (
        <FilterRow key={c} label={c}
          active={hasFilter('category', c)}
          onClick={() => toggleFilter('category', c, 'Cat: ' + c)}
        />
      ))}
    </div>
  )
}
