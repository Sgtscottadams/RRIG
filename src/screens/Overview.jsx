import React from 'react'
import { useNavigate } from 'react-router-dom'
import { OVERVIEW_KPIS } from '../data/mockData.js'

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

function FacilityStatusRow({ name, type, status, flow, flowUnit, alarmCount, onClick }) {
  const statusColor = {
    NORMAL: 'var(--status-normal)', WARNING: 'var(--status-warning)',
    ALARM: 'var(--status-alarm)', OFFLINE: 'var(--text-muted)',
  }[status] || 'var(--text-muted)'

  const badgeClass = { NORMAL: 'badge-normal', WARNING: 'badge-warning', ALARM: 'badge-alarm', OFFLINE: 'badge-cleared' }[status] || 'badge-cleared'

  return (
    <div onClick={onClick} className="glass-card" style={{
      padding: '10px 14px', cursor: onClick ? 'pointer' : 'default',
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
    </div>
  )
}

function AlarmRow({ alarm, onClick }) {
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

export default function Overview({ pumps, tanks, alarms, onAlarmClick }) {
  const navigate = useNavigate()
  const kpi = OVERVIEW_KPIS
  const activeAlarms = alarms.filter(a => a.status !== 'CLEARED')
  const unacked = alarms.filter(a => a.status === 'UNACKNOWLEDGED')

  const facilityStatuses = [
    { name: 'Azul Main Hub', type: 'Hub / Pipeline', status: 'NORMAL', flow: kpi.totalFlow, flowUnit: 'bbl/h', alarmCount: 0 },
    { name: 'Azul PS-001', type: 'Pump Station', status: 'NORMAL', flow: 9030, flowUnit: 'bbl/h', alarmCount: 0 },
    { name: 'Azul PS-002', type: 'Pump Station', status: 'WARNING', flow: 6100, flowUnit: 'bbl/h', alarmCount: 1 },
    { name: 'North Mesa PS-003', type: 'Pump Station', status: 'NORMAL', flow: 3850, flowUnit: 'bbl/h', alarmCount: 0 },
    { name: 'Cedar Ridge PS-004', type: 'Pump Station', status: 'ALARM', flow: 2900, flowUnit: 'bbl/h', alarmCount: 1 },
    { name: 'Azul Storage Tank A', type: 'Storage — 71.4%', status: 'NORMAL', alarmCount: 0 },
    { name: 'Azul Storage Tank B', type: 'Storage — 90.8%', status: 'WARNING', alarmCount: 1 },
    { name: 'North Mesa Frac Pit 1', type: 'Storage — 34.0%', status: 'NORMAL', alarmCount: 0 },
    { name: 'Cedar Ridge SWD-002', type: 'Disposal Well', status: 'NORMAL', alarmCount: 0 },
  ]

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
        <KpiCard label="Pumps Running" value={`${kpi.runningPumps}/${kpi.totalPumps}`} sub="Online / Total"
          color="var(--status-normal)" />
        <KpiCard label="Avg Pressure" value={kpi.avgPressure} unit="PSI" sub="Pipeline header" />
        <KpiCard label="System Efficiency" value={`${kpi.systemEfficiency}%`} sub="Last 24h"
          color={kpi.systemEfficiency > 90 ? 'var(--status-normal)' : 'var(--status-warning)'} />
      </div>

      {/* Two column layout for desktop */}
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
            {facilityStatuses.map(f => (
              <FacilityStatusRow key={f.name} {...f}
                onClick={f.status !== 'NORMAL' ? onAlarmClick : undefined} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Pipeline schematic placeholder */}
          <div className="glass-card" style={{ padding: 16, minHeight: 180 }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 10,
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
            {activeAlarms.slice(0, 4).map(a => (
              <AlarmRow key={a.id} alarm={a} onClick={onAlarmClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', paddingTop: 4, flexShrink: 0 }}>
        SCADA Demo — Powered by Inductive Automation Ignition · Presented by KTX Electric
      </div>
    </div>
  )
}

// Simple inline pipeline schematic SVG
function PipelineSchematic() {
  return (
    <svg viewBox="0 0 400 140" style={{ width: '100%', height: 'auto' }}>
      {/* Background grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="400" height="140" fill="url(#grid)" rx="6"/>

      {/* Main pipeline */}
      <line x1="30" y1="70" x2="370" y2="70" stroke="rgba(90,200,250,0.4)" strokeWidth="4" strokeDasharray="none"/>

      {/* Flow direction arrows */}
      {[80,150,220,290,350].map(x => (
        <polygon key={x} points={`${x},66 ${x+8},70 ${x},74`} fill="rgba(90,200,250,0.6)"/>
      ))}

      {/* Pump stations */}
      {[
        { x: 60, y: 70, label: 'HUB', status: '#32d74b' },
        { x: 140, y: 70, label: 'PS-001', status: '#32d74b' },
        { x: 220, y: 70, label: 'PS-002', status: '#ffd60a' },
        { x: 290, y: 70, label: 'PS-003', status: '#32d74b' },
        { x: 360, y: 70, label: 'PS-004', status: '#ff3b30' },
      ].map(({ x, y, label, status }) => (
        <g key={label}>
          <circle cx={x} cy={y} r="12" fill="rgba(255,255,255,0.04)" stroke={status} strokeWidth="2"/>
          <circle cx={x} cy={y} r="5" fill={status} opacity="0.8"/>
          <text x={x} y={y + 24} textAnchor="middle" fontSize="8"
            fill="rgba(255,255,255,0.55)" fontFamily="Barlow Condensed, sans-serif" fontWeight="600">
            {label}
          </text>
        </g>
      ))}

      {/* Tank branches */}
      <line x1="140" y1="70" x2="140" y2="108" stroke="rgba(90,200,250,0.3)" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="124" y="108" width="32" height="18" rx="3" fill="rgba(50,215,75,0.15)" stroke="rgba(50,215,75,0.5)" strokeWidth="1.5"/>
      <text x="140" y="121" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontFamily="Barlow Condensed, sans-serif">TK-A 71%</text>

      <line x1="220" y1="70" x2="220" y2="108" stroke="rgba(90,200,250,0.3)" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="204" y="108" width="32" height="18" rx="3" fill="rgba(255,214,10,0.15)" stroke="rgba(255,214,10,0.5)" strokeWidth="1.5"/>
      <text x="220" y="121" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontFamily="Barlow Condensed, sans-serif">TK-B 91%</text>

      <line x1="290" y1="70" x2="290" y2="108" stroke="rgba(90,200,250,0.3)" strokeWidth="2" strokeDasharray="4,3"/>
      <rect x="274" y="108" width="32" height="18" rx="3" fill="rgba(50,215,75,0.12)" stroke="rgba(50,215,75,0.4)" strokeWidth="1.5"/>
      <text x="290" y="121" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.5)" fontFamily="Barlow Condensed, sans-serif">PIT 34%</text>

      {/* Legend */}
      <circle cx="15" cy="130" r="4" fill="#32d74b"/>
      <text x="23" y="134" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Barlow Condensed">Normal</text>
      <circle cx="65" cy="130" r="4" fill="#ffd60a"/>
      <text x="73" y="134" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Barlow Condensed">Warning</text>
      <circle cx="115" cy="130" r="4" fill="#ff3b30"/>
      <text x="123" y="134" fontSize="7" fill="rgba(255,255,255,0.4)" fontFamily="Barlow Condensed">Alarm</text>
    </svg>
  )
}
