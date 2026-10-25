'use client';

import React, { useState, useEffect } from 'react';
import { Ticket } from '../lib/types';
import { updateTicket, deleteTicket } from '../lib/api';
import { 
  X, 
  Clock, 
  Send, 
  User, 
  Mail, 
  Tag, 
  Trash2, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle,
  MessageSquare,
  Globe
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onTicketUpdated: () => void;
  onTicketDeleted: () => void;
}

const QUEUES = [
  'Billing and Payments',
  'Customer Service',
  'General Inquiry',
  'Human Resources',
  'IT Support',
  'Product Support',
  'Returns and Exchanges',
  'Sales and Pre-Sales',
  'Service Outages and Maintenance',
  'Technical Support'
];

export default function TicketDetailModal({
  ticket,
  onClose,
  onTicketUpdated,
  onTicketDeleted
}: TicketDetailModalProps) {
  const [currentStatus, setCurrentStatus] = useState(ticket?.status || 'Open');
  const [currentQueue, setCurrentQueue] = useState(ticket?.queue || '');
  const [currentPriority, setCurrentPriority] = useState(ticket?.priority || 'medium');
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (ticket) {
      setCurrentStatus(ticket.status || 'Open');
      setCurrentQueue(ticket.queue || '');
      setCurrentPriority(ticket.priority || 'medium');
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleUpdateTicket = async () => {
    try {
      setIsUpdating(true);
      await updateTicket(ticket.ticket_id || ticket.id, {
        status: currentStatus,
        queue: currentQueue,
        priority: currentPriority,
        add_note: newNote.trim() ? newNote.trim() : undefined
      });
      setNewNote('');
      onTicketUpdated();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ticket ${ticket.ticket_id}?`)) {
      try {
        await deleteTicket(ticket.ticket_id || ticket.id);
        onTicketDeleted();
        onClose();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete ticket');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: 20
    }} onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          padding: 28,
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="mono-font" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4f46e5' }}>
                {ticket.ticket_id}
              </span>
              <span className="badge badge-queue">{ticket.channel || 'Web Portal'}</span>
              <span className={`badge ${
                ticket.priority === 'high' ? 'badge-priority-high' :
                ticket.priority === 'low' ? 'badge-priority-low' : 'badge-priority-medium'
              }`}>
                {ticket.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {ticket.subject}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: 6, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Customer & Meta Banner */}
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          fontSize: '0.82rem',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={14} color="var(--accent-primary)" />
            <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
            <strong style={{ color: 'var(--text-main)' }}>{ticket.customer_name}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={14} color="var(--accent-secondary)" />
            <span style={{ color: 'var(--text-main)' }}>{ticket.customer_email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} color="var(--text-dim)" />
            <span style={{ color: 'var(--text-dim)' }}>
              {new Date(ticket.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Full Message Body */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            Customer Message / Complaint Content
          </label>
          <div style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: 'var(--text-main)',
            whiteSpace: 'pre-wrap'
          }}>
            {ticket.description}
          </div>
        </div>

        {/* AI Triage Diagnosis Analysis */}
        <div style={{
          padding: 18,
          borderRadius: 'var(--radius-md)',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Cpu size={18} color="#059669" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', margin: 0 }}>
              AI Classification Rationale
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#047857', marginBottom: 4 }}>
                Routed Queue: <strong>{ticket.queue}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <div style={{ flex: 1, height: 6, background: '#dcfce7', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round(ticket.queue_confidence * 100)}%`,
                    height: '100%',
                    background: '#059669'
                  }} />
                </div>
                <span style={{ fontWeight: 700, color: '#059669' }}>{Math.round(ticket.queue_confidence * 100)}% Match</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#047857', marginBottom: 4 }}>
                Priority SLA: <strong>{ticket.priority.toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <div style={{ flex: 1, height: 6, background: '#dcfce7', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round(ticket.priority_confidence * 100)}%`,
                    height: '100%',
                    background: ticket.priority === 'high' ? '#ef4444' : ticket.priority === 'low' ? '#10b981' : '#f59e0b'
                  }} />
                </div>
                <span style={{ fontWeight: 700, color: '#047857' }}>{Math.round(ticket.priority_confidence * 100)}% Confidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Controls: Status, Queue Override, Priority Override */}
        <div style={{
          padding: 18,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 24
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
            Ticket Management & Triage Updates
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
            <div>
              <label>Status</label>
              <select value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label>Assigned Queue</label>
              <select value={currentQueue} onChange={(e) => setCurrentQueue(e.target.value)}>
                {QUEUES.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Priority SLA</label>
              <select value={currentPriority} onChange={(e) => setCurrentPriority(e.target.value)}>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label>Add Internal Agent Note</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="e.g. Verified transaction with merchant gateway, issuing refund..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button
                onClick={handleUpdateTicket}
                disabled={isUpdating}
                className="btn btn-primary btn-sm"
                style={{ padding: '0 18px', whiteSpace: 'nowrap' }}
              >
                {isUpdating ? 'Saving...' : 'Update Ticket'}
              </button>
            </div>
          </div>
        </div>

        {/* Activity & Notes Timeline */}
        {ticket.notes && ticket.notes.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
              Audit & Activity Log
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ticket.notes.map((n, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: 4, fontSize: '0.72rem' }}>
                    <strong style={{ color: '#4f46e5' }}>{n.author}</strong>
                    <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)' }}>{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete ticket button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">
            <Trash2 size={14} />
            <span>Delete Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
