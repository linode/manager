/**
 * Types for integrations with the StatusPage.io API
 */

export type IncidentStatus =
  | 'identified'
  | 'investigating'
  | 'monitoring'
  | 'postmortem'
  | 'resolved';

export type MaintenanceStatus =
  | 'completed'
  | 'in_progress'
  | 'scheduled'
  | 'verifying';

export type ComponentStatus =
  | 'degraded_performance'
  | 'major_outage'
  | 'operational'
  | 'partial_outage';

export type IncidentImpact = 'critical' | 'major' | 'minor' | 'none';

export interface IncidentComponent {
  code: string;
  name: string;
  new_status: ComponentStatus;
  old_status: ComponentStatus;
}

export interface IncidentPage {
  id: string;
  name: string;
  time_zone: string;
  updated_at: string;
  url: string;
}

export interface IncidentUpdate {
  affected_components: IncidentComponent[];
  body: string;
  created_at: string;
  custom_tweet: null | string;
  deliver_notifications: boolean;
  display_at: string;
  id: string;
  incident_id: string;
  status: IncidentStatus;
  tweet_id: null | number;
  updated_at: string;
}

export interface Incident {
  created_at: string;
  id: string;
  impact: IncidentImpact;
  incident_updates: IncidentUpdate[];
  monitoring_at: null | string;
  name: string;
  page_id: string;
  resolved_at: null | string;
  shortlink: string;
  started_at: string;
  status: IncidentStatus;
  updated_at: string;
}

export interface Maintenance extends Omit<Incident, 'status'> {
  status: MaintenanceStatus;
}

export interface IncidentResponse {
  incidents: Incident[];
  page: IncidentPage;
}

export interface MaintenanceResponse {
  page: IncidentPage;
  scheduled_maintenances: Maintenance[];
}
