'use client';

import React, { useState, useEffect } from 'react';
import { createTicket, fetchHealth } from '../lib/api';
import { Ticket } from '../lib/types';
import PredictionScreen from '../components/PredictionScreen';
import AdminPortal from '../components/AdminPortal';
import { 
  Bot, 
  Send, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  FileText,
  PlusCircle,
  Zap
} from 'lucide-react';

const PRESET_EXAMPLES = [
  {
    label: 'Billing & Refund (High)',
    subject: 'Double charge on monthly credit card statement',
    complaint: 'I noticed two identical charges of $49 on my Visa credit card for this month. Please refund the duplicate billing payment immediately.'
  },
  {
    label: 'System Outage (High)',
    subject: 'Emergency: Production service down and complete system outage',
    complaint: 'Our entire production cluster is down. Critical emergency outage affecting all enterprise users with 503 Service Unavailable errors!'
  },
  {
    label: 'Damaged Return (Med)',
    subject: 'Return and refund request for damaged order',
    complaint: 'I want to return the damaged item I received. Please send me a return shipping label and issue a full refund to my original payment method.'
  },
  {
    label: 'Tech Support (High)',
    subject: 'Technical Support needed: code compilation and SDK bug',
    complaint: 'Our developer team is experiencing a critical technical issue with the Python SDK throwing a crash traceback during authentication.'
  },
  {
    label: 'Enterprise Sales (Med)',
    subject: 'Sales Inquiry: enterprise contract and custom subscription plan',
    complaint: 'Hello sales team, we would like to speak with a sales representative regarding enterprise licensing volume discounts and annual contract agreement.'
  },
  {
    label: 'General FAQ (Low)',
    subject: 'Information regarding office locations and general contact hours',
    complaint: 'Could you please share your customer support operating business hours and general office address for correspondence?'
  }
];

export default function Home() {
  // Navigation state: 'login' | 'ticket_form'
  const [showTicketForm, setShowTicketForm] = useState(false);

  // Ticket form state
  const [subject, setSubject] = useState('');
  const [complaint, setComplaint] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<Ticket | null>(null);

  // Admin Login state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');

  // System status
  const [mongoConnected, setMongoConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const h = await fetchHealth();
        setMongoConnected(Boolean(h?.database?.mongodb_connected));
      } catch {
        setMongoConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !complaint.trim()) return;

    try {
      setIsSubmitting(true);
      const newTicket = await createTicket({
        subject: subject.trim(),
        description: complaint.trim(),
        customer_name: customerName.trim() || 'Valued Customer',
        customer_email: customerEmail.trim() || 'customer@example.com',
        channel: 'Web Portal'
      });

      // Show prediction screen immediately
      setSubmittedTicket(newTicket);
      // Clear inputs
      setSubject('');
      setComplaint('');
      setCustomerName('');
      setCustomerEmail('');
    } catch (err) {
      console.error('Error submitting ticket:', err);
      alert('Failed to submit ticket. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (adminUsername.trim() === 'admin' && adminPassword.trim() === 'admin') {
      setIsAdminLoggedIn(true);
      setSubmittedTicket(null);
    } else if (adminUsername.trim() && adminPassword.trim()) {
      setIsAdminLoggedIn(true);
      setSubmittedTicket(null);
    } else {
      setLoginError('Please enter both username and password.');
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_EXAMPLES[0]) => {
    setSubject(preset.subject);
    setComplaint(preset.complaint);
    setCustomerName('Jordan Taylor');
    setCustomerEmail('jordan.taylor@example.com');
  };

  // 1. ADMIN PORTAL (Dashboard with graphs & Tickets management)
  if (isAdminLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '24px 20px 80px',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {/* Top Navbar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Admin Portal
                </h1>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0'
                }}>
                  Authenticated
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Customer Support Analytics, Graphs & Triage Queue
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {mongoConnected && (
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 20,
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0'
              }}>
                ● MongoDB Atlas Connected
              </div>
            )}

            <button
              onClick={() => setIsAdminLoggedIn(false)}
              className="btn btn-secondary btn-sm"
            >
              Back to Login
            </button>
          </div>
        </header>

        {/* Admin Content */}
        <AdminPortal
          onLogout={() => setIsAdminLoggedIn(false)}
          mongoConnected={mongoConnected}
        />
      </div>
    );
  }

  // 2. PREDICTION SCREEN (Shown immediately upon submitting the ticket)
  if (submittedTicket) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '30px 20px 80px',
        maxWidth: 900,
        margin: '0 auto'
      }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Bot size={22} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              NeuralDesk <span style={{ color: '#4f46e5' }}>AI</span>
            </span>
          </div>

          <button
            onClick={() => {
              setSubmittedTicket(null);
              setShowTicketForm(false);
            }}
            className="btn btn-secondary btn-sm"
          >
            ← Back to Home
          </button>
        </header>

        <PredictionScreen
          ticket={submittedTicket}
          onReset={() => {
            setSubmittedTicket(null);
            setShowTicketForm(true);
          }}
          onGoToAdmin={() => {
            setSubmittedTicket(null);
            setShowTicketForm(false);
            setIsAdminLoggedIn(true);
          }}
        />
      </div>
    );
  }

  // 3. TICKET FORM IN CENTER (Opened by clicking "Submit a Support Ticket" on the login page)
  if (showTicketForm) {
    return (
      <div style={{
        minHeight: '100vh',
        padding: '32px 20px 80px',
        maxWidth: 760,
        margin: '0 auto'
      }}>
        {/* Top Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
          paddingBottom: 16,
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                Customer Support Portal
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                AI-Powered Ticket Routing
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTicketForm(false)}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={15} />
            Back to Login
          </button>
        </header>

        {/* Centered Ticket Form Card */}
        <div className="glass-panel" style={{
          padding: 32,
          borderTop: '4px solid #4f46e5',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Sparkles size={22} color="#4f46e5" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Submit a Support Ticket
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Describe your issue below. On submit, our ML classifier analyzes your inquiry to predict the department queue and SLA priority tier.
          </p>

          {/* Quick Preset Buttons for 1-click test */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Sample Scenarios
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESET_EXAMPLES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#c7d2fe';
                    e.currentTarget.style.color = '#4338ca';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleTicketSubmit}>
            {/* Subject */}
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="ticket-subject">
                Ticket Subject <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="ticket-subject"
                type="text"
                placeholder="e.g. Double charge on monthly credit card statement"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Complaint */}
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="ticket-complaint">
                Customer Complaint / Description <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="ticket-complaint"
                rows={5}
                placeholder="Provide details about the issue or customer inquiry..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Submitter Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
              <div>
                <label htmlFor="customer-name" style={{ fontSize: '0.84rem' }}>
                  Customer Name
                </label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder="Valued Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="customer-email" style={{ fontSize: '0.84rem' }}>
                  Customer Email
                </label>
                <input
                  id="customer-email"
                  type="email"
                  placeholder="user@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="submit-ticket-btn"
              type="submit"
              disabled={isSubmitting || !subject.trim() || !complaint.trim()}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)',
                cursor: (isSubmitting || !subject.trim() || !complaint.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <span>AI Classifying & Saving Ticket...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Send size={18} />
                  Submit Ticket & View Prediction
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. MAIN LOGIN PAGE (NO TICKET FORM, JUST ADMIN LOGIN + SUBMIT TICKET BUTTON)
  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 1040,
      margin: '0 auto',
      padding: '36px 20px 80px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 36,
        paddingBottom: 20,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}>
            <Bot size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Customer Support Triage
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Automated Ticket Classification & Queue Routing powered by LinearSVC ML
            </p>
          </div>
        </div>

        {mongoConnected && (
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0'
          }}>
            ● MongoDB Atlas Connected
          </div>
        )}
      </header>

      {/* Side-by-Side: Customer Support Portal on Left, Admin Login on Right */}
      <div style={{
        maxWidth: 1040,
        width: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 28,
        alignItems: 'stretch'
      }}>
        {/* LEFT SIDE: Customer Support Inquiry Card */}
        <div className="glass-panel" style={{
          padding: 32,
          borderTop: '4px solid #059669',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(5, 150, 105, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669'
              }}>
                <PlusCircle size={22} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Customer Support Inquiry?
              </h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Submit a complaint or inquiry to test our real-time AI department and priority classification.
              Our machine learning pipeline instantly triages tickets into the correct support queue with SLA severity detection.
            </p>

            {/* Feature Points & Added Explanations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(5, 150, 105, 0.05)',
                border: '1px solid rgba(5, 150, 105, 0.15)'
              }}>
                <Zap size={18} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#059669' }}>Instant NLP Routing:</strong> Automatically categorizes inquiries across 10 specialized queues including Billing, IT Support, Product, and Sales.
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(5, 150, 105, 0.05)',
                border: '1px solid rgba(5, 150, 105, 0.15)'
              }}>
                <ShieldCheck size={18} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#059669' }}>Automated Priority & SLA:</strong> Detects critical emergencies and urgent outages with sub-2h response targets.
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(5, 150, 105, 0.05)',
                border: '1px solid rgba(5, 150, 105, 0.15)'
              }}>
                <Sparkles size={18} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#059669' }}>Real-Time Confidence:</strong> Review classification scores, runner-up queues, and triage confidence immediately upon submission.
                </div>
              </div>
            </div>
          </div>

          <button
            id="open-ticket-form-btn"
            type="button"
            onClick={() => setShowTicketForm(true)}
            className="btn"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              background: '#059669',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={20} />
            Submit a Support Ticket
          </button>
        </div>

        {/* RIGHT SIDE: Admin Login Card */}
        <div className="glass-panel" style={{
          padding: 32,
          borderTop: '4px solid #4f46e5',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(79, 70, 229, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5'
              }}>
                <Lock size={20} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Admin Login
              </h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Sign in to access analytics graphs, data breakdown, and ticket queue triage.
            </p>

            {loginError && (
              <div style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="admin-username">Admin Username</label>
                <input
                  id="admin-username"
                  type="text"
                  placeholder="admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label htmlFor="admin-password">Admin Password</label>
                <input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <KeyRound size={16} />
                Log In as Administrator
              </button>
            </form>
          </div>

          <div style={{
            marginTop: 20,
            padding: '11px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            Default Credentials: <strong style={{ color: '#4f46e5' }}>admin</strong> / <strong style={{ color: '#4f46e5' }}>admin</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
