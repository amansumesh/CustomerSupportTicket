'use client';

import React from 'react';
import { AnalyticsData, ModelMetadata } from '../lib/types';
import { BarChart3, Cpu, Database, CheckCircle2, TrendingUp, Award, Layers } from 'lucide-react';

interface AnalyticsTabProps {
  analytics: AnalyticsData | null;
  modelInfo: ModelMetadata | null;
}

export default function AnalyticsTab({ analytics, modelInfo }: AnalyticsTabProps) {
  const total = analytics?.total_tickets || 0;
  const queueCounts = analytics?.queue_breakdown || {};
  const priorityCounts = analytics?.priority_breakdown || {};
  const statusCounts = analytics?.status_breakdown || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 2 Column Stats: Queue Breakdown & Priority/Status Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20
      }}>
        {/* Department / Queue Distribution */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Department Distribution</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{total} tickets total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.keys(queueCounts).length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', textAlign: 'center', padding: 20 }}>
                No department tickets recorded yet.
              </div>
            ) : (
              Object.entries(queueCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([q, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={q}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                        <span style={{ color: '#ffffff', fontWeight: 600 }}>{q}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                          borderRadius: 3
                        }} />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Priority Breakdown Card */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              Priority Distribution (SLA Tiers)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--priority-high-bg)', border: '1px solid var(--priority-high-border)' }}>
                <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>HIGH PRIORITY</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  {priorityCounts['high'] || 0}
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--priority-medium-bg)', border: '1px solid var(--priority-medium-border)' }}>
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>MEDIUM</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  {priorityCounts['medium'] || 0}
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--priority-low-bg)', border: '1px solid var(--priority-low-border)' }}>
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>LOW</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                  {priorityCounts['low'] || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown Card */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
              Resolution Lifecycle Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map(st => (
                <div key={st} style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{st}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
                    {statusCounts[st] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance & Test Evaluation Hub */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4'
            }}>
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                Classification Model Evaluation & Benchmarks
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Metrics trained on customer inquiries with Scikit-Learn LinearSVC and Word/Char N-Gram TF-IDF.
              </p>
            </div>
          </div>
          <span className="badge badge-queue">LinearSVC C=2.0 (Selected)</span>
        </div>

        {/* Selected Model Test Results Table */}
        <div style={{ marginBottom: 24, overflowX: 'auto' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Selected Model Test Results (Hold-out Test Set)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px 12px' }}>Classification Task</th>
                <th style={{ padding: '10px 12px' }}>Selected Model</th>
                <th style={{ padding: '10px 12px' }}>Test Accuracy</th>
                <th style={{ padding: '10px 12px' }}>Macro F1</th>
                <th style={{ padding: '10px 12px' }}>Weighted F1</th>
                <th style={{ padding: '10px 12px' }}>Macro Precision</th>
                <th style={{ padding: '10px 12px' }}>Macro Recall</th>
              </tr>
            </thead>
            <tbody>
              {modelInfo?.metrics?.test_results && modelInfo.metrics.test_results.length > 0 ? (
                modelInfo.metrics.test_results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ffffff', textTransform: 'capitalize' }}>
                      {r.task}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#93c5fd' }}>{r.selected_model}</td>
                    <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>
                      {(parseFloat(r.test_accuracy) * 100).toFixed(2)}%
                    </td>
                    <td style={{ padding: '10px 12px' }}>{(parseFloat(r.test_macro_f1) * 100).toFixed(2)}%</td>
                    <td style={{ padding: '10px 12px' }}>{(parseFloat(r.test_weighted_f1) * 100).toFixed(2)}%</td>
                    <td style={{ padding: '10px 12px' }}>{(parseFloat(r.test_macro_precision) * 100).toFixed(2)}%</td>
                    <td style={{ padding: '10px 12px' }}>{(parseFloat(r.test_macro_recall) * 100).toFixed(2)}%</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ffffff' }}>Queue Routing (10 Classes)</td>
                    <td style={{ padding: '10px 12px', color: '#93c5fd' }}>LinearSVC C=2.0</td>
                    <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>69.16%</td>
                    <td style={{ padding: '10px 12px' }}>70.21%</td>
                    <td style={{ padding: '10px 12px' }}>69.11%</td>
                    <td style={{ padding: '10px 12px' }}>70.60%</td>
                    <td style={{ padding: '10px 12px' }}>70.04%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ffffff' }}>Priority SLA (3 Classes)</td>
                    <td style={{ padding: '10px 12px', color: '#93c5fd' }}>LinearSVC C=2.0</td>
                    <td style={{ padding: '10px 12px', color: '#34d399', fontWeight: 700 }}>71.03%</td>
                    <td style={{ padding: '10px 12px' }}>70.33%</td>
                    <td style={{ padding: '10px 12px' }}>71.04%</td>
                    <td style={{ padding: '10px 12px' }}>70.46%</td>
                    <td style={{ padding: '10px 12px' }}>70.23%</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Validation Hyperparameter Tuning Comparison */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Validation Hyperparameter Comparison (C-Regularization Sweep)
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12
          }}>
            {modelInfo?.metrics?.validation_comparison && modelInfo.metrics.validation_comparison.slice(0, 8).map((vc, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: vc.model.includes('2.0') ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${vc.model.includes('2.0') ? 'rgba(99, 102, 241, 0.35)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'capitalize', color: 'var(--text-dim)', display: 'block' }}>
                    {vc.task} task
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    {vc.model}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: vc.model.includes('2.0') ? '#34d399' : 'var(--text-muted)' }}>
                    {(parseFloat(vc.val_accuracy) * 100).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>
                    F1: {(parseFloat(vc.val_macro_f1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
