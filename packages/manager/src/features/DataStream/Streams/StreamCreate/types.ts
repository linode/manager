import type { CreateDestinationForm } from 'src/features/DataStream/Shared/types';

export const streamType = {
  AuditLogs: 'audit_logs',
  LKEAuditLogs: 'lke_audit_logs',
} as const;

export type StreamType = (typeof streamType)[keyof typeof streamType];

export const streamStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type StreamStatus = (typeof streamStatus)[keyof typeof streamStatus];

export interface StreamDetails {
  cluster_ids?: number[];
  is_auto_add_all_clusters_enabled?: boolean;
}

export interface CreateStreamForm extends CreateDestinationForm {
  destinations: number[];
  details?: StreamDetails;
  label: string;
  status: StreamStatus;
  type: StreamType;
}
