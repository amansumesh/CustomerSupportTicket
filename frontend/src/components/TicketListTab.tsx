'use client';

import React, { useState } from 'react';
import { Ticket } from '../lib/types';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  Trash2, 
  Tag, 
  Globe, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface TicketListTabProps {
  tickets: Ticket[];
  isLoading: boolean;
  onSelectTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onGoToTriage: () => void;
  onSeedDemo: () => void;
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

export default function TicketListTab({
  tickets,
  isLoading,
  onSelectTicket,
  onDeleteTicket,
  onGoToTriage,
  onSeedDemo
}: TicketListTabProps) {
  const [search, setSearch] = useState('');
  const [selectedQueue, setSelectedQueue] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredTickets = tickets.filter(t => {
    if (selectedQueue !== 'all' && t.queue !== selectedQueue) return false;
    if (selectedPriority !== 'all' && t.priority.toLowerCase() !== selectedPriority.toLowerCase()) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSubject = t.subject?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchName = t.customer_name?.toLowerCase().includes(q);
      const matchEmail = t.customer_email?.toLowerCase().includes(q);
      const matchId = t.ticket_id?.toLowerCase().includes(q);
      if (!matchSubject && !matchDesc && !matchName && !matchEmail && !matchId) return false;
    }
    return true;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'email': return <Mail size={13} />;
      case 'mobile app': return <Smartphone size={13} />;
      case 'live chat': return <MessageSquare size={13} />;
      default: return <Globe size={13} />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'badge-priority-high';
      case 'low': return 'badge-priority-low';
      default: return 'badge-priority-medium';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'In Progress': return 'badge-status-in-progress';
      case 'Resolved': return 'badge-status-resolved';
      case 'Closed': return 'badge-status-closed';
      default: return 'badge-status-open';
    }
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 13 }} />
            <input
              id="ticket-search-input"
              type="text"
              placeholder="Search by ticket ID, subject, customer, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          {/* Queue Filter */}
          <div>
            <select
              id="filter-queue-select"
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
            >
              <option value="all">All Queues (10)</option>
              {QUEUES.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              id="filter-priority-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Reset button */}
          {(search || selectedQueue !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedQueue('all');
                setSelectedPriority('all');
                setSelectedStatus('all');
              }}
              className="btn btn-secondary btn-sm"
              style={{ height: 42 }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Ticket List Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        padding: '0 4px'
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <span style={{ color: '#ffffff', fontWeight: 700 }}>{filteredTickets.length}</span> tickets
        </div>
        <button
          onClick={onGoToTriage}
          className="btn btn-primary btn-sm"
        >
          <Sparkles size={14} />
          <span>New AI Triage Inquiry</span>
        </button>
      </div>

      {/* Tickets List Container */}
      {isLoading ? (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="pulse-dot pulse-blue" style={{ width: 14, height: 14, marginBottom: 16 }} />
          <div>Loading tickets from MongoDB...</div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            color: '#818cf8'
          }}>
            <Filter size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#ffffff' }}>No matching tickets found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto 20px auto' }}>
            There are currently no tickets matching your search filters. Try adjusting the query or seed sample support tickets into MongoDB.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onSeedDemo} className="btn btn-secondary btn-sm">
              <Sparkles size={14} color="#38bdf8" />
              <span>Seed Demo Support Tickets</span>
            </button>
            <button onClick={onGoToTriage} className="btn btn-primary btn-sm">
              <span>Create New Ticket</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id || ticket.ticket_id}
              onClick={() => onSelectTicket(ticket)}
              className="glass-panel"
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'grid',
                gridTemplateColumns: '120px 1fr auto auto auto 40px',
                gap: 18,
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-active)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              {/* Ticket ID & Channel */}
              <div>
                <span className="mono-font" style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#93c5fd',
                  display: 'block'
                }}>
                  {ticket.ticket_id}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.72rem',
                  color: 'var(--text-dim)',
                  marginTop: 4
                }}>
                  {getChannelIcon(ticket.channel)}
                  <span>{ticket.channel || 'Web'}</span>
                </div>
              </div>

              {/* Subject & Description */}
              <div style={{ minWidth: 0 }}>
                <h4 style={{
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {ticket.subject}
                </h4>
                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 550
                }}>
                  {ticket.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 6,
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)'
                }}>
                  <span>By <strong style={{ color: 'var(--text-muted)' }}>{ticket.customer_name}</strong></span>
                  <span>•</span>
                  <span>{ticket.customer_email}</span>
                </div>
              </div>

              {/* Queue Badge with Confidence Bar */}
              <div style={{ minWidth: 170 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="badge badge-queue" style={{ fontSize: '0.73rem' }}>
                    {ticket.queue}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8' }}>
                    {Math.round(ticket.queue_confidence * 100)}%
                  </span>
                </div>
                {/* Confidence Bar */}
                <div style={{
                  width: '100%',
                  height: 4,
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.round(ticket.queue_confidence * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    borderRadius: 2
                  }} />
                </div>
              </div>

              {/* Priority */}
              <div>
                <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                  {ticket.priority?.toUpperCase()}
                </span>
              </div>

              {/* Status */}
              <div>
                <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>

              {/* Delete / View icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete ticket ${ticket.ticket_id}?`)) {
                      onDeleteTicket(ticket.ticket_id || ticket.id);
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: 6,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)'
                  }}
                  title="Delete ticket"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
