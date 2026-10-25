'use client';

import React, { useState } from 'react';
import { Ticket } from '../lib/types';
import { 
  CheckCircle2, 
  ArrowLeft, 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  Layers, 
  AlertCircle, 
  Copy, 
  Check, 
  User, 
  Mail, 
  Sparkles,
  BarChart2
} from 'lucide-react';

interface PredictionScreenProps {
  ticket: Ticket;
  onReset: () => void;
  onGoToAdmin: () => void;
}

export default function PredictionScreen({ ticket, onReset, onGoToAdmin }: PredictionScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticket.ticket_id || ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case 'high':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#dc2626',
          sla: 'Urgent SLA: First response targeted in < 2 hours',
          badgeBg: '#dc2626',
          badgeText: '#ffffff'
        };
      case 'low':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#059669',
          sla: 'Normal SLA: First response within 48-72 hours',
          badgeBg: '#059669',
          badgeText: '#ffffff'
        };
      default:
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#d97706',
          sla: 'Standard SLA: First response within 24 hours',
          badgeBg: '#d97706',
          badgeText: '#ffffff'
        };
    }
  };

  const pConfig = getPriorityColor(ticket.priority || ticket.predicted_priority);
  const queueConfidencePct = Math.round((ticket.queue_confidence || 0.85) * 100);
  const priorityConfidencePct = Math.round((ticket.priority_confidence || 0.88) * 100);

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Top Success Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
        border: '1px solid #a7f3d0',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: 24,
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)'
      }}>
        <div style={{
          width: 56,
          height: 56,
          background: '#059669',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
        }}>
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>
          Ticket Successfully Submitted & Classified!
        </h2>
        <p style={{ color: '#047857', fontSize: '0.95rem', margin: '8px 0 16px' }}>
          Our AI model analyzed your complaint and assigned it to the appropriate department and priority level.
        </p>

        {/* Ticket ID Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: '#ffffff',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid #a7f3d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Ticket ID:</span>
          <span className="mono-font" style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1rem' }}>
            {ticket.ticket_id || ticket.id}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: copied ? '#059669' : '#64748b',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4
            }}
            title="Copy Ticket ID"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Main Predictions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        {/* Department / Queue Prediction */}
        <div className="glass-panel" style={{ padding: 24, borderTop: '4px solid #4f46e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#4f46e5" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Predicted Department
              </span>
            </div>
            <span style={{
              background: '#e0e7ff',
              color: '#4338ca',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)'
            }}>
              {queueConfidencePct}% Match
            </span>
          </div>

          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 10 }}>
            {ticket.queue || ticket.predicted_queue}
          </div>

          {/* Progress bar */}
          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{
              width: `${queueConfidencePct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
              borderRadius: 4
            }} />
          </div>

          {/* Top alternative predictions if any */}
          {ticket.top_queues && ticket.top_queues.length > 1 && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                Other Possible Departments:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ticket.top_queues.slice(1, 3).map((tq, i) => (
                  <span key={i} style={{
                    fontSize: '0.72rem',
                    background: 'var(--bg-tertiary)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    color: 'var(--text-muted)'
                  }}>
                    {tq.queue}: {Math.round(tq.confidence * 100)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Priority Prediction */}
        <div className="glass-panel" style={{ padding: 24, borderTop: `4px solid ${pConfig.badgeBg}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color={pConfig.badgeBg} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Predicted Priority & SLA
              </span>
            </div>
            <span style={{
              background: pConfig.bg,
              color: pConfig.text,
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${pConfig.border}`
            }}>
              {priorityConfidencePct}% Confidence
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: pConfig.text,
              textTransform: 'uppercase'
            }}>
              {ticket.priority || ticket.predicted_priority} Priority
            </span>
          </div>

          <div style={{
            background: pConfig.bg,
            border: `1px solid ${pConfig.border}`,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: pConfig.text,
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Clock size={16} />
            {pConfig.sla}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Automatically prioritized by our ML triage classifier based on urgency keywords and issue severity.
          </div>
        </div>
      </div>

      {/* Ticket Details Overview */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>
          Submitted Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Customer</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>
              {ticket.customer_name || 'Customer'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Contact Email</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>
              {ticket.customer_email || 'user@example.com'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Status</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#2563eb', marginTop: 2 }}>
              ● {ticket.status || 'Open'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
            Subject
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {ticket.subject}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
            Complaint Description
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            background: '#ffffff',
            padding: 14,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'pre-wrap'
          }}>
            {ticket.description}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onReset}
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <PlusCircle size={18} />
          Submit Another Ticket
        </button>

        <button
          onClick={onGoToAdmin}
          className="btn btn-secondary"
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <BarChart2 size={18} />
          Go to Admin Portal
        </button>
      </div>
    </div>
  );
}
