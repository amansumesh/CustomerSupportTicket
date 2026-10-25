'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ClassificationResult } from '../lib/types';
import { classifyPreview, createTicket } from '../lib/api';
import { 
  Sparkles, 
  Send, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  HelpCircle,
  Zap,
  Tag,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

interface TriageLabTabProps {
  onTicketCreated: () => void;
}

const PRESET_SCENARIOS = [
  {
    label: 'Billing Charge',
    subject: 'Charged twice for monthly enterprise subscription',
    description: 'Our finance department noticed two identical debit entries of $450 each on our company Mastercard statement for Invoice INV-8921. Please issue a prompt refund for the duplicate transaction.',
    channel: 'Email',
    customer_name: 'Arthur Pendelton',
    customer_email: 'arthur@pendelton-legal.com'
  },
  {
    label: 'API Outage',
    subject: 'Webhook endpoint returning 500 Internal Server Error',
    description: 'All inbound webhooks to our production payment receiver have been failing with 500 error code since 12:15 UTC. Automated retries are piling up in queue.',
    channel: 'Web Portal',
    customer_name: 'Elena Rostova',
    customer_email: 'elena.r@quantum-cloud.io'
  },
  {
    label: 'Damaged Return',
    subject: 'Package arrived torn and headphone left cup broken',
    description: 'The courier dropped off parcel tracking #994821 and the outer box was smashed. Upon opening, the left ear cup of the noise-cancelling headphones is cracked in two. I want a replacement.',
    channel: 'Mobile App',
    customer_name: 'Mateo Rossi',
    customer_email: 'm.rossi@milano-studio.it'
  },
  {
    label: 'SSO / SAML',
    subject: 'Azure AD SSO login loops back to login prompt',
    description: 'Users attempting to sign in with company credentials get redirected back to the login screen without an error message after SAML assertion. IT needs this resolved ASAP.',
    channel: 'Web Portal',
    customer_name: 'Kenji Sato',
    customer_email: 'kenji.s@tokyo-systems.jp'
  },
  {
    label: 'Enterprise Sales',
    subject: 'Request for proposal: 800 seats deployment across EMEA',
    description: 'Our European operations division is looking to standardize on your platform. We require custom SLAs, HIPAA/GDPR addendums, and volume tier pricing for 800 licenses.',
    channel: 'Web Portal',
    customer_name: 'Charlotte Dubois',
    customer_email: 'c.dubois@alliancemedia.fr'
  },
  {
    label: 'HR Benefits',
    subject: 'Deadline for FSA medical reimbursement submission',
    description: 'Could someone clarify when receipts for the current calendar quarter flexible spending account need to be uploaded to the portal for payroll processing?',
    channel: 'Internal Portal',
    customer_name: 'Marcus Vance',
    customer_email: 'm.vance@internal.org'
  }
];

const QUEUE_OPTIONS = [
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

export default function TriageLabTab({ onTicketCreated }: TriageLabTabProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerEmail, setCustomerEmail] = useState('john.doe@example.com');
  const [channel, setChannel] = useState('Web Portal');
  const [tagsInput, setTagsInput] = useState('');

  const [overrideQueue, setOverrideQueue] = useState('');
  const [overridePriority, setOverridePriority] = useState('');

  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger classification when subject or description changes
  useEffect(() => {
    if (!subject.trim() && !description.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        setClassification(null);
      }, 0);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsClassifying(true);
        const res = await classifyPreview(subject || 'Inquiry', description || 'Details');
        setClassification(res);
      } catch (err) {
        console.error('Classification error:', err);
      } finally {
        setIsClassifying(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [subject, description]);

  const loadPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSubject(preset.subject);
    setDescription(preset.description);
    setChannel(preset.channel);
    setCustomerName(preset.customer_name);
    setCustomerEmail(preset.customer_email);
    setOverrideQueue('');
    setOverridePriority('');
    setSaveSuccess(false);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please enter both subject and description.');
      return;
    }

    try {
      setIsSaving(true);
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await createTicket({
        subject,
        description,
        customer_name: customerName,
        customer_email: customerEmail,
        channel,
        tags,
        override_queue: overrideQueue || undefined,
        override_priority: overridePriority || undefined
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSubject('');
        setDescription('');
        setTagsInput('');
        setOverrideQueue('');
        setOverridePriority('');
        onTicketCreated();
      }, 1200);
    } catch (err) {
      console.error('Save ticket error:', err);
      alert('Failed to save ticket to MongoDB');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Preset Scenarios Header */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Zap size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            Quick Test Scenarios (1-Click Test Models)
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRESET_SCENARIOS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Form on Left, Live AI Diagnosis on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 0.9fr)',
        gap: 24,
        alignItems: 'start'
      }}>
        {/* Left: Input Form */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bookmark size={18} color="var(--accent-primary)" />
            Customer Inquiry Information
          </h3>

          <form onSubmit={handleSaveTicket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Subject */}
            <div>
              <label htmlFor="ticket-subject">Inquiry Subject *</label>
              <input
                id="ticket-subject"
                type="text"
                placeholder="e.g. Billed twice on credit card for annual subscription"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="ticket-description">Inquiry Details / Customer Message *</label>
              <textarea
                id="ticket-description"
                rows={5}
                placeholder="Paste or write the customer inquiry message here. The Scikit-Learn models will classify Queue and Priority live..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Customer Details Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label htmlFor="customer-name">Customer Name</label>
                <input
                  id="customer-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="customer-email">Customer Email</label>
                <input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Channel & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label htmlFor="ticket-channel">Inbound Channel</label>
                <select
                  id="ticket-channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="Web Portal">Web Portal</option>
                  <option value="Email">Email</option>
                  <option value="Live Chat">Live Chat</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Internal Portal">Internal Portal</option>
                </select>
              </div>
              <div>
                <label htmlFor="ticket-tags">Tags (comma-separated)</label>
                <input
                  id="ticket-tags"
                  type="text"
                  placeholder="billing, urgent, bug"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
            </div>

            {/* Manual Triage Overrides (Optional) */}
            <div style={{
              marginTop: 4,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <SlidersHorizontal size={14} />
                <span>Optional Agent Overrides (Leave blank to use AI predictions)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <select
                    id="override-queue-select"
                    value={overrideQueue}
                    onChange={(e) => setOverrideQueue(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  >
                    <option value="">Auto AI Queue</option>
                    {QUEUE_OPTIONS.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    id="override-priority-select"
                    value={overridePriority}
                    onChange={(e) => setOverridePriority(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  >
                    <option value="">Auto AI Priority</option>
                    <option value="high">Force High</option>
                    <option value="medium">Force Medium</option>
                    <option value="low">Force Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ marginTop: 8 }}>
              <button
                id="btn-save-ticket"
                type="submit"
                disabled={isSaving || !subject.trim() || !description.trim()}
                className="btn btn-primary"
                style={{ width: '100%', height: 46 }}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={18} color="#ffffff" />
                    <span>Saved to MongoDB Successfully!</span>
                  </>
                ) : isSaving ? (
                  <>
                    <div className="pulse-dot pulse-blue" />
                    <span>Persisting to MongoDB...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Save Ticket to MongoDB & Route</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live AI Triage Analysis */}
        <div className="glass-panel" style={{ padding: 24, position: 'sticky', top: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}>
                <Cpu size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Live Model Classification</h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>LinearSVC Pipeline Inference</div>
              </div>
            </div>

            {isClassifying && (
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pulse-dot pulse-blue" />
                Analyzing text...
              </span>
            )}
          </div>

          {!classification ? (
            <div style={{
              padding: 40,
              textAlign: 'center',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-dim)'
            }}>
              <Sparkles size={28} color="var(--accent-primary)" style={{ marginBottom: 12, opacity: 0.6 }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Real-Time Inference Standby
              </div>
              <div style={{ fontSize: '0.78rem' }}>
                Type a subject or description, or click a Quick Test Scenario above to see instant AI queue and priority triage.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Predicted Queue Hero */}
              <div style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.04em' }}>
                    Predicted Queue / Department
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                    {Math.round(classification.queue_confidence * 100)}% Confidence
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: 10 }}>
                  {overrideQueue ? (
                    <span>
                      {overrideQueue} <small style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Override from {classification.queue})</small>
                    </span>
                  ) : (
                    classification.queue
                  )}
                </div>
                {/* Confidence Bar */}
                <div style={{
                  width: '100%',
                  height: 6,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.round(classification.queue_confidence * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                    borderRadius: 3,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Predicted Priority Hero */}
              <div style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Predicted SLA Priority
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171' }}>
                    {Math.round(classification.priority_confidence * 100)}% Confidence
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span className={`badge ${
                    (overridePriority || classification.priority) === 'high' ? 'badge-priority-high' :
                    (overridePriority || classification.priority) === 'low' ? 'badge-priority-low' :
                    'badge-priority-medium'
                  }`} style={{ fontSize: '0.9rem', padding: '5px 14px' }}>
                    {(overridePriority || classification.priority).toUpperCase()} PRIORITY
                  </span>
                  {overridePriority && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      (Manual override)
                    </span>
                  )}
                </div>

                {/* Priority Distribution Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(classification.priority_distribution).map(([pr, score]) => (
                    <div key={pr} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.75rem' }}>
                      <span style={{ width: 55, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{pr}</span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.round(score * 100)}%`,
                          height: '100%',
                          background: pr === 'high' ? '#f87171' : pr === 'low' ? '#34d399' : '#fbbf24',
                          borderRadius: 2
                        }} />
                      </div>
                      <span style={{ width: 35, textAlign: 'right', fontWeight: 600, color: '#ffffff' }}>
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 3 Alternative Queues */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Top Ranked Departments
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {classification.top_queues.map((item, idx) => (
                    <div
                      key={item.queue}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: idx === 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${idx === 0 ? 'rgba(99, 102, 241, 0.25)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: idx === 0 ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: idx === 0 ? 700 : 500, color: '#ffffff' }}>
                          {item.queue}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: idx === 0 ? '#38bdf8' : 'var(--text-muted)' }}>
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
