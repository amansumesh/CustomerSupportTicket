'use client';

import React, { useState } from 'react';
import { batchImportTickets } from '../lib/api';
import { Ticket } from '../lib/types';
import { UploadCloud, FileText, CheckCircle2, Play, Sparkles, Layers } from 'lucide-react';

interface BulkImportTabProps {
  onImportComplete: () => void;
}

const SAMPLE_CSV = `subject,description,customer_name,customer_email,channel
"Chargeback notification for Order #8821","Our credit card processor flagged an unauthorized chargeback dispute for transaction 8821. Please review immediate details.","Sophia Carter","sophia.c@merchant-pay.org","Email"
"VPN tunnel disconnecting every 10 minutes","Remote developers cannot stay connected to our internal GitLab subnet over the corporate wireguard gateway.","DevOps Team","devops@acme-systems.io","Web Portal"
"Return policy on unpacked monitor","I received a 32-inch 4K curved gaming monitor as a gift but already have one. Box is unopened with factory seals intact. How can I return?","Liam O'Connor","liam.oc@gmail.com","Web Portal"
"Scheduled database maintenance window inquiry","Could your infrastructure team confirm if the Sunday 03:00 UTC maintenance causes read-replica failovers?","Arun Patel","a.patel@cloudstack.co","Email"
"Inquiry regarding corporate charitable matching program","Does the company offer matching contributions for 501(c)(3) environmental nonprofit foundations?","Jessica Miller","j.miller@internal-corp.com","Internal Portal"
"Price quote for 250 enterprise mobile licenses","We are expanding our field technician operations and need a consolidated quote for 250 enterprise seats with phone support SLA.","Marcus Brody","m.brody@fieldservice-pro.com","Web Portal"`;

export default function BulkImportTab({ onImportComplete }: BulkImportTabProps) {
  const [csvContent, setCsvContent] = useState(SAMPLE_CSV);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<Ticket[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const parsed = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV regex with quoted commas
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const row = matches.map(m => m.trim().replace(/^"|"$/g, ''));

      const item: any = {
        subject: row[0] || 'Bulk Inquiry',
        description: row[1] || 'Bulk description',
        customer_name: row[2] || 'Bulk Customer',
        customer_email: row[3] || 'client@example.com',
        channel: row[4] || 'Batch Import',
        tags: ['batch-imported']
      };
      parsed.push(item);
    }
    return parsed;
  };

  const handleRunBatch = async () => {
    setErrorMessage('');
    try {
      const ticketsToImport = parseCSV(csvContent);
      if (ticketsToImport.length === 0) {
        setErrorMessage('Could not parse any tickets. Please verify your CSV format.');
        return;
      }

      setIsProcessing(true);
      const res = await batchImportTickets(ticketsToImport);
      setImportResults(res.tickets);
      onImportComplete();
    } catch (err: any) {
      console.error('Batch import error:', err);
      setErrorMessage(err.message || 'Batch processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview & Actions */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <UploadCloud size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Bulk Ticket Classifier & Ingestion</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ingest hundreds of raw tickets via CSV, classify with LinearSVC, and save directly to MongoDB.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setCsvContent(SAMPLE_CSV)}
              className="btn btn-secondary btn-sm"
            >
              <Sparkles size={14} color="#38bdf8" />
              <span>Load Sample CSV</span>
            </button>
            <button
              onClick={handleRunBatch}
              disabled={isProcessing || !csvContent.trim()}
              className="btn btn-primary"
            >
              {isProcessing ? (
                <>
                  <div className="pulse-dot pulse-blue" />
                  <span>Classifying & Ingesting...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Execute AI Classification & MongoDB Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CSV Editor */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>CSV Data Input (Header: subject, description, customer_name, customer_email, channel)</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{csvContent.trim().split('\n').length - 1} rows detected</span>
          </label>
          <textarea
            rows={10}
            className="mono-font"
            style={{ fontSize: '0.82rem', lineHeight: '1.5', whiteSpace: 'pre' }}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
          />
        </div>

        {errorMessage && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Results View */}
      {importResults && (
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CheckCircle2 size={18} color="#10b981" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Successfully Processed & Saved {importResults.length} Tickets to MongoDB
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {importResults.map((t, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 180px 100px',
                  gap: 16,
                  alignItems: 'center'
                }}
              >
                <span className="mono-font" style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 700 }}>
                  {t.ticket_id}
                </span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>{t.subject}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.customer_name} ({t.customer_email})</div>
                </div>
                <div>
                  <span className="badge badge-queue" style={{ fontSize: '0.72rem' }}>
                    {t.queue}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', marginLeft: 6, fontWeight: 700 }}>
                    {Math.round(t.queue_confidence * 100)}%
                  </span>
                </div>
                <div>
                  <span className={`badge ${
                    t.priority === 'high' ? 'badge-priority-high' :
                    t.priority === 'low' ? 'badge-priority-low' : 'badge-priority-medium'
                  }`} style={{ fontSize: '0.72rem' }}>
                    {t.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
