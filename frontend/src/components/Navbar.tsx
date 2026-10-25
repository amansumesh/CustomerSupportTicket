'use client';

import React from 'react';
import { DatabaseStatus } from '../lib/types';
import { 
  Bot, 
  Layers, 
  PlusCircle, 
  UploadCloud, 
  BarChart3, 
  Database, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'tickets' | 'triage' | 'bulk' | 'analytics';
  setActiveTab: (tab: 'tickets' | 'triage' | 'bulk' | 'analytics') => void;
  dbStatus: DatabaseStatus | null;
  totalTickets: number;
  onRefresh: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  dbStatus,
  totalTickets,
  onRefresh
}: NavbarProps) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        gap: 16
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                NeuralDesk <span style={{ background: 'linear-gradient(90deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                LinearSVC Models
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Intelligent Support Ticket Triage & MongoDB
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            id="nav-tickets-tab"
            onClick={() => setActiveTab('tickets')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'tickets' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'tickets' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeTab === 'tickets' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <Layers size={15} />
            <span>Tickets</span>
            <span style={{
              background: activeTab === 'tickets' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              {totalTickets}
            </span>
          </button>

          <button
            id="nav-triage-tab"
            onClick={() => setActiveTab('triage')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'triage' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'triage' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeTab === 'triage' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <PlusCircle size={15} />
            <span>New Ticket & AI Triage</span>
          </button>

          <button
            id="nav-bulk-tab"
            onClick={() => setActiveTab('bulk')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'bulk' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'bulk' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeTab === 'bulk' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <UploadCloud size={15} />
            <span>Bulk Import</span>
          </button>

          <button
            id="nav-analytics-tab"
            onClick={() => setActiveTab('analytics')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'analytics' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'analytics' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeTab === 'analytics' ? '0 2px 10px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <BarChart3 size={15} />
            <span>Analytics & Models</span>
          </button>
        </nav>

        {/* Database & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* MongoDB Atlas Status Pill */}
          {dbStatus?.mongodb_connected && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#34d399'
            }} title="Storage Mode: MongoDB Atlas Cluster">
              <Database size={13} />
              <span className="pulse-dot pulse-green" />
              <span>MongoDB Atlas Connected</span>
            </div>
          )}

          {/* Refresh */}
          <button
            id="btn-refresh"
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 9px' }}
            title="Refresh current view"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
