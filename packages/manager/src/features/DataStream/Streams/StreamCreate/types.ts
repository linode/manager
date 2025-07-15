import type { CreateDestinationForm } from 'src/features/DataStream/Shared/types';

export const streamType = {
  AuditLogs: 'audit_logs',
  ErrorLogs: 'error_logs',
} as const;

export type StreamType = (typeof streamType)[keyof typeof streamType];

export const streamStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type StreamStatus = (typeof streamStatus)[keyof typeof streamStatus];

export const eventType = {
  Authentication: 'authn',
  Authorization: 'authz',
  Configuration: 'configuration',
} as const;

export type EventType = (typeof eventType)[keyof typeof eventType];

export interface CreateStreamForm extends CreateDestinationForm {
  [eventType.Authentication]: boolean;
  [eventType.Authorization]: boolean;
  [eventType.Configuration]: boolean;
  destination_id: number;
  label: string;
  status: StreamStatus;
  type: StreamType;
}
