/**
 * Types for integrations with the StatusPage.io API
 */

export type IncidentStatus =
  | 'resolved'
  | 'monitoring'
  | 'postmortem'
  | 'identified'
  | 'investigating';

export type ComponentStatus =
  | 'operational'
  | 'degraded_performance'
  | 'partial_outage'
  | 'major_outage';

export type IncidentImpact = 'none' | 'minor' | 'major' | 'critical';

export interface IncidentComponent {
  code: string;
  name: string;
  old_status: ComponentStatus;
  new_status: ComponentStatus;
}

export interface IncidentPage {
  id: string;
  name: string;
  url: string;
  time_zone: string;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  body: string;
  incident_id: string;
  created_at: string;
  updated_at: string;
  display_at: string;
  affected_components: IncidentComponent[];
  deliver_notifications: boolean;
  custom_tweet: string;
  tweet_id: number;
}

export interface Incident {
  id: string;
  name: string;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  monitoring_at: string;
  resolved_at: string;
  impact: IncidentImpact;
  shortlink: string;
  started_at: string;
  page_id: string;
  incident_updates: any[];
}

export interface IncidentResponse {
  page: IncidentPage;
  incidents: Incident[];
}

export interface MaintenanceResponse {
  page: IncidentPage;
  scheduled_maintenances: Incident[];
}
