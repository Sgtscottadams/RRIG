import React, { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { TREND_DATA } from '../data/mockData.js'

const PEN_COLORS = {
  azulPS1:    '#5ac8fa',
  azulPS2:    '#32d74b',
  northMesa:  '#ffd60a',
  cedarRidge: '#ff8c42',
}

const PEN_LABELS = {
  azulPS1:   'Azul PS-001',
  azulPS2:   'Azul PS-002',
  northMesa: 'North Mesa PS-003',
  cedarRidge:'Cedar Ridge PS-004',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-mid)',
      border: '1px solid var(--glass-border-strong)',
      borderRadius: 8, padding: '8px 12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12, color: p.color, marginBottom: 2 }}>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600 }}>{PEN_LABELS[p.dataKey]}</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{p.value?.toLocaleString()} bbl/h</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendView() {
  const [activePens, setActivePens] = useState(new Set(['azulPS1', 'azulPS2', 'northMesa', 'cedarRidge']))
  const [timeRange, setTimeRange] = useState('24h')

  const togglePen = (pen) => {
    setActivePens(prev => {
      const next = new Set(prev)
      if (next.has(pen)) { if (next.size > 1) next.delete(pen) }
      else next.add(pen)
      return next
    })
  }

  const displayData = timeRange === '8h'
    ? TREND_DATA.slice(-9)
    : timeRange === '12h'
    ? TREND_DATA.slice(-13)
    : TREND_DATA

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'hidden' }}>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          FLOW RATE TREND
        </span>
        <div style={{ flex: 1 }} />
        {/* Time range */}
        {['8h','12h','24h'].map(r => (
          <button key={r} className={`btn ${timeRange === r ? 'btn-active' : ''}`}
            onClick={() => setTimeRange(r)}>
            {r}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: 'var(--glass-border)' }} />
        {/* Pen toggles */}
        {Object.entries(PEN_LABELS).map(([key, label]) => (
          <button key={key}
            onClick={() => togglePen(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 7,
              background: activePens.has(key) ? `${PEN_COLORS[key]}20` : 'var(--bg-card)',
              border: `1px solid ${activePens.has(key) ? PEN_COLORS[key] : 'var(--glass-border)'}`,
              color: activePens.has(key) ? PEN_COLORS[key] : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 600,
              transition: 'all 0.15s',
            }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: PEN_COLORS[key], opacity: activePens.has(key) ? 1 : 0.3 }} />
            <span className="hide-mobile">{label}</span>
            <span className="hide-desktop hide-tablet" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10 }}>
              {key.replace('azulPS', 'PS-00').replace('northMesa','NM').replace('cedarRidge','CR')}
            </span>
          </button>
        ))}
      </div>

      {/* Primary chart */}
      <div className="glass-card" style={{ flex: 1, padding: '16px 8px 8px 4px', minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="hour"
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--glass-border)' }}
              tickLine={false}
              interval={timeRange === '24h' ? 3 : 1}
            />
            <YAxis
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v}
              label={{ value: 'bbl/h', angle: -90, position: 'insideLeft', offset: 14, style: { fontFamily: 'Barlow Condensed, sans-serif', fontSize: 10, fill: 'var(--text-muted)' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(PEN_COLORS).map(([key, color]) =>
              activePens.has(key) ? (
                <Line key={key} type="monotone" dataKey={key}
                  stroke={color} strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                  connectNulls={false}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        {Object.entries(PEN_LABELS).filter(([k]) => activePens.has(k)).map(([key, label]) => {
          const vals = displayData.map(d => d[key]).filter(Boolean)
          const avg = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
          const max = Math.max(...vals)
          const min = Math.min(...vals)
          return (
            <div key={key} className="glass-card" style={{
              padding: '8px 12px', flex: '1 1 160px',
              borderLeft: `3px solid ${PEN_COLORS[key]}`,
            }}>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 11, fontWeight: 700, color: PEN_COLORS[key], marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[['Avg', avg], ['Max', max], ['Min', min]].map(([l, v]) => (
                  <div key={l}>
                    <div className="value-label">{l}</div>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: 'var(--text-value)' }}>
                      {v?.toLocaleString()}
                    </span>
                    <span className="value-unit">bbl/h</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
