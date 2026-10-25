'use client';

import React from 'react';
import { AnalyticsData } from '../lib/types';
import { Inbox, AlertCircle, Clock, Cpu } from 'lucide-react';

interface StatsCardsProps {
  analytics: AnalyticsData | null;
}

export default function StatsCards({ analytics }: StatsCardsProps) {
  const total = analytics?.total_tickets || 0;
  const openCount = (analytics?.status_breakdown?.['Open'] || 0) + (analytics?.status_breakdown?.['In Progress'] || 0);
  const highPriority = analytics?.priority_breakdown?.['high'] || 0;
  const avgConf = analytics?.average_confidence ? Math.round(analytics.average_confidence * 100) : 88;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 16,
      marginBottom: 24
    }}>
      {/* Total Tickets */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <Inbox size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Inquiries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{total}</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: 2 }}>MongoDB persistent</div>
        </div>
      </div>

      {/* Open & Active */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(59, 130, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <Clock size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active / In Triage</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{openCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>Open & In Progress</div>
        </div>
      </div>

      {/* High Priority */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <AlertCircle size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>High Priority Esc.</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{highPriority}</div>
          <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 2 }}>Require rapid SLA</div>
        </div>
      </div>

      {/* AI Confidence */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(6, 182, 212, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#22d3ee',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}>
          <Cpu size={24} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg AI Confidence</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>{avgConf}%</div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: 2 }}>Dual LinearSVC pipelines</div>
        </div>
      </div>
    </div>
  );
}
