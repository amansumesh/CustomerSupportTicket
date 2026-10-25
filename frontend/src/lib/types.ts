export interface QueueScore {
  queue: string;
  confidence: number;
}

export interface ClassificationResult {
  queue: string;
  queue_confidence: number;
  top_queues: QueueScore[];
  all_queue_scores: Record<string, number>;
  priority: string;
  priority_confidence: number;
  priority_distribution: Record<string, number>;
  processed_text: string;
}

export interface TicketNote {
  author: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  ticket_id: string;
  subject: string;
  description: string;
  customer_name: string;
  customer_email: string;
  channel: string;
  tags: string[];
  predicted_queue: string;
  queue: string;
  queue_confidence: number;
  top_queues: QueueScore[];
  all_queue_scores: Record<string, number>;
  predicted_priority: string;
  priority: string;
  priority_confidence: number;
  priority_distribution: Record<string, number>;
  status: string;
  assigned_agent: string;
  notes: TicketNote[];
  created_at: string;
  updated_at: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  source: string;
}

export interface DatabaseStatus {
  mongodb_connected: boolean;
  uri: string;
  database: string;
  collection: string;
  total_tickets: number;
  storage_mode: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  database: DatabaseStatus;
  models: {
    loaded: boolean;
    priority_classes: string[];
    queue_classes: string[];
  };
}

export interface AnalyticsData {
  total_tickets: number;
  status_breakdown: Record<string, number>;
  priority_breakdown: Record<string, number>;
  queue_breakdown: Record<string, number>;
  average_confidence: number;
  database_status: DatabaseStatus;
}

export interface ModelMetadata {
  loaded: boolean;
  priority_classes: string[];
  queue_classes: string[];
  metrics: {
    test_results: Array<{
      task: string;
      selected_model: string;
      test_accuracy: string;
      test_macro_f1: string;
      test_weighted_f1: string;
      test_macro_precision: string;
      test_macro_recall: string;
    }>;
    validation_comparison: Array<{
      task: string;
      model: string;
      val_accuracy: string;
      val_macro_f1: string;
      val_weighted_f1: string;
    }>;
    model_architecture: string;
  };
}
