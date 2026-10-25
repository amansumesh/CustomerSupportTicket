import { ClassificationResult, Ticket, TicketsResponse, AnalyticsData, ModelMetadata, HealthResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function classifyPreview(subject: string, description: string): Promise<ClassificationResult> {
  const res = await fetch(`${API_BASE}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, description }),
  });
  if (!res.ok) throw new Error('Classification preview request failed');
  return res.json();
}

export async function createTicket(ticketData: {
  subject: string;
  description: string;
  customer_name?: string;
  customer_email?: string;
  channel?: string;
  tags?: string[];
  override_queue?: string;
  override_priority?: string;
}): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function fetchTickets(params?: {
  search?: string;
  queue?: string;
  priority?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<TicketsResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.queue) query.set('queue', params.queue);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`${API_BASE}/tickets?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchTicket(id: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch ticket');
  return res.json();
}

export async function updateTicket(
  id: string,
  updates: {
    status?: string;
    queue?: string;
    priority?: string;
    assigned_agent?: string;
    add_note?: string;
  }
): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
}

export async function deleteTicket(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tickets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete ticket');
}

export async function batchImportTickets(tickets: Record<string, unknown>[]): Promise<{ imported_count: number; tickets: Ticket[] }> {
  const res = await fetch(`${API_BASE}/tickets/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickets }),
  });
  if (!res.ok) throw new Error('Batch import failed');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelMetadata> {
  const res = await fetch(`${API_BASE}/models/info`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch model info');
  return res.json();
}

export async function seedDemoTickets(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/tickets/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to seed demo tickets');
  return res.json();
}
