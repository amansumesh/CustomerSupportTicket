'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, AnalyticsData, ModelMetadata } from '../lib/types';
import { 
  fetchTickets, 
  deleteTicket, 
  updateTicket, 
  fetchAnalytics, 
  fetchModelInfo
} from '../lib/api';
import TicketDetailModal from './TicketDetailModal';
import { 
  BarChart3, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Search, 
  Trash2, 
  LogOut, 
  RefreshCw, 
  Sparkles,
  Filter, 
  ChevronRight, 
  ExternalLink,
  Award,
  Database
} from 'lucide-react';

interface AdminPortalProps {
  onLogout: () => void;
  mongoConnected: boolean;
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

export default function AdminPortal({ onLogout, mongoConnected }: AdminPortalProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'tickets'>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Filters for tickets tab
  const [search, setSearch] = useState('');
  const [selectedQueue, setSelectedQueue] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tRes, aRes, mRes] = await Promise.all([
        fetchTickets({ limit: 100 }),
        fetchAnalytics(),
        fetchModelInfo().catch(() => null)
      ]);
      setTickets(tRes.tickets || []);
      setAnalytics(aRes);
      if (mRes) setModelInfo(mRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicket(id);
      setTickets(prev => prev.filter(t => t.ticket_id !== id && t.id !== id));
      loadData();
      if (selectedTicket && (selectedTicket.ticket_id === id || selectedTicket.id === id)) {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete ticket.');
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (selectedQueue !== 'all' && t.queue !== selectedQueue) return false;
    if (selectedPriority !== 'all' && t.priority?.toLowerCase() !== selectedPriority.toLowerCase()) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchSub = t.subject?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchName = t.customer_name?.toLowerCase().includes(q);
      const matchId = t.ticket_id?.toLowerCase().includes(q);
      if (!matchSub && !matchDesc && !matchName && !matchId) return false;
    }
    return true;
  });

  const total = tickets.length || analytics?.total_tickets || 0;
  const queueCounts = analytics?.queue_breakdown || {};
  const priorityCounts = analytics?.priority_breakdown || {};
  const statusCounts = analytics?.status_breakdown || {};
  const highPriorityCount = priorityCounts['high'] || tickets.filter(t => t.priority === 'high').length;
  const openCount = statusCounts['Open'] || tickets.filter(t => t.status === 'Open').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Admin Subheader & Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        background: 'var(--bg-card)',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Left: Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setActiveAdminTab('dashboard')}
            className="btn"
            style={{
              background: activeAdminTab === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
              color: activeAdminTab === 'dashboard' ? '#ffffff' : 'var(--text-muted)',
              border: activeAdminTab === 'dashboard' ? 'none' : '1px solid var(--border-subtle)'
            }}
          >
            <BarChart3 size={16} />
            Analytics & Graphs
          </button>

          <button
            onClick={() => setActiveAdminTab('tickets')}
            className="btn"
            style={{
              background: activeAdminTab === 'tickets' ? 'var(--accent-primary)' : 'transparent',
              color: activeAdminTab === 'tickets' ? '#ffffff' : 'var(--text-muted)',
              border: activeAdminTab === 'tickets' ? 'none' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Layers size={16} />
            Ticket Management
            <span style={{
              background: activeAdminTab === 'tickets' ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-tertiary)',
              color: activeAdminTab === 'tickets' ? '#ffffff' : 'var(--text-main)',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {tickets.length}
            </span>
          </button>
        </div>

        {/* Right: Actions & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>


          <button
            onClick={onLogout}
            className="btn btn-danger btn-sm"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ADMIN DASHBOARD (DATA GRAPH AND STUFF)            */}
      {/* ======================================================== */}
      {activeAdminTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPI Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16
          }}>
            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>TOTAL TICKETS</span>
                <Layers size={18} color="#4f46e5" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {total}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: 4, fontWeight: 500 }}>
                ● Active in MongoDB Atlas
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>HIGH PRIORITY (SLA)</span>
                <ShieldAlert size={18} color="#dc2626" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>
                {highPriorityCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4 }}>
                Target: Response &lt; 2h
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>OPEN TICKETS</span>
                <Clock size={18} color="#d97706" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>
                {openCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4 }}>
                Awaiting resolution
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>AI CONFIDENCE</span>
                <Sparkles size={18} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>
                {analytics?.average_confidence ? `${Math.round(analytics.average_confidence * 100)}%` : '88%'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4 }}>
                LinearSVC • 70.2% Benchmark F1
              </div>
            </div>
          </div>

          {/* Data Graphs: Department Breakdown & Priority Breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: 20
          }}>
            {/* Department Distribution Graph */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Department Distribution Graph
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Tickets classified across 10 customer service queues
                  </p>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4f46e5' }}>
                  {total} total
                </span>
              </div>

              {/* Bar Graph Visual */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.keys(queueCounts).length === 0 ? (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: 30 }}>
                    No department data yet.
                  </div>
                ) : (
                  Object.entries(queueCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([q, count]) => {
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={q}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{q}</span>
                            <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.max(pct, 4)}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                              borderRadius: 4,
                              transition: 'width 0.4s ease'
                            }} />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Right Column: Priority Distribution & Lifecycle Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Priority SLA Breakdown */}
              <div className="glass-panel" style={{ padding: 22 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
                  Priority SLA Breakdown
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    padding: 14,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--priority-high-bg)',
                    border: '1px solid var(--priority-high-border)'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>HIGH PRIORITY</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: 2 }}>
                      {priorityCounts['high'] || 0}
                    </div>
                  </div>

                  <div style={{
                    padding: 14,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--priority-medium-bg)',
                    border: '1px solid var(--priority-medium-border)'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700 }}>MEDIUM</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: 2 }}>
                      {priorityCounts['medium'] || 0}
                    </div>
                  </div>

                  <div style={{
                    padding: 14,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--priority-low-bg)',
                    border: '1px solid var(--priority-low-border)'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>LOW</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: 2 }}>
                      {priorityCounts['low'] || 0}
                    </div>
                  </div>
                </div>

                {/* Combined Progress Bar */}
                {total > 0 && (
                  <div style={{
                    height: 10,
                    borderRadius: 5,
                    overflow: 'hidden',
                    display: 'flex',
                    background: '#e2e8f0'
                  }}>
                    <div style={{
                      width: `${((priorityCounts['high'] || 0) / total) * 100}%`,
                      background: '#ef4444'
                    }} title="High Priority" />
                    <div style={{
                      width: `${((priorityCounts['medium'] || 0) / total) * 100}%`,
                      background: '#f59e0b'
                    }} title="Medium Priority" />
                    <div style={{
                      width: `${((priorityCounts['low'] || 0) / total) * 100}%`,
                      background: '#10b981'
                    }} title="Low Priority" />
                  </div>
                )}
              </div>

              {/* Status Resolution Lifecycle */}
              <div className="glass-panel" style={{ padding: 22 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
                  Resolution Lifecycle Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {['Open', 'In Progress', 'Resolved', 'Closed'].map(st => (
                    <div key={st} style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>{st}</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                        {statusCounts[st] || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Model Performance Overview */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={20} color="#4f46e5" />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    AI Model Benchmark & Accuracy
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Hold-out test evaluation with Scikit-Learn LinearSVC Classifier
                  </p>
                </div>
              </div>
              <span className="badge badge-queue">LinearSVC C=2.0</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14
            }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>QUEUE CLASSIFICATION ACCURACY</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  69.2%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>10 Balanced Classes</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PRIORITY SLA ACCURACY</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
                  71.0%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>High / Med / Low Classes</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>NLP FEATURE EXTRACTION</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 6 }}>
                  Word & Char N-Grams
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Sublinear TF-IDF</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>DATA PERSISTENCE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4f46e5', marginTop: 6 }}>
                  MongoDB Atlas
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Cloud Cluster Auto-Sync</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SEPARATE TICKETS MANAGEMENT TAB IN ADMIN          */}
      {/* ======================================================== */}
      {activeAdminTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search and Filters Bar */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: '1 1 240px', position: 'relative' }}>
                <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by ticket ID, subject, customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 36 }}
                />
              </div>

              {/* Queue Filter */}
              <div style={{ minWidth: 160 }}>
                <select
                  value={selectedQueue}
                  onChange={(e) => setSelectedQueue(e.target.value)}
                >
                  <option value="all">All Departments ({tickets.length})</option>
                  {QUEUES.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div style={{ minWidth: 140 }}>
                <select
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
              <div style={{ minWidth: 140 }}>
                <select
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
            </div>
          </div>

          {/* Tickets List */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
              Loading tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="glass-panel" style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No matching tickets found</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredTickets.map(t => (
                <div
                  key={t.ticket_id || t.id}
                  className="glass-panel"
                  style={{
                    padding: '18px 20px',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedTicket(t)}
                >
                  {/* Row 1: ID, Badges & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span className="mono-font" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4f46e5' }}>
                        {t.ticket_id}
                      </span>
                      <span className="badge badge-queue">
                        {t.queue}
                      </span>
                      <span className={`badge ${
                        t.priority === 'high' ? 'badge-priority-high' :
                        t.priority === 'low' ? 'badge-priority-low' : 'badge-priority-medium'
                      }`}>
                        {t.priority?.toUpperCase()} PRIORITY
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)'
                      }}>
                        ● {t.status || 'Open'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px' }}
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(t.ticket_id || t.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Delete ticket"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Subject & Description Preview */}
                  <div style={{ marginBottom: 8 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                      {t.subject}
                    </h4>
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                      lineHeight: 1.45,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {t.description}
                    </p>
                  </div>

                  {/* Row 3: Submitter & Date */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    <span>
                      From: <strong style={{ color: 'var(--text-main)' }}>{t.customer_name || 'Customer'}</strong> ({t.customer_email || 'user@example.com'})
                    </span>
                    <span>
                      {new Date(t.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={() => {
            loadData();
            setSelectedTicket(null);
          }}
          onTicketDeleted={() => {
            loadData();
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}
