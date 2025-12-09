export interface ManagedServiceMonitor {
  address: string;
  body: string;
  consultation_group: string; // deprecated but still returned by API
  created: string;
  credentials: number[]; // @todo
  id: number;
  label: string;
  notes: string;
  region: null | string;
  service_type: ServiceType;
  status: MonitorStatus;
  timeout: number;
  updated: string;
}

export type MonitorStatus = 'disabled' | 'ok' | 'pending' | 'problem';

export type ServiceType = 'tcp' | 'url';

export interface ManagedLinodeSetting {
  group: string;
  id: number;
  label: string;
  ssh: ManagedSSHSetting;
}

export interface ManagedSSHSetting {
  access: boolean;
  ip: string;
  port: number;
  user: string;
}

export interface ManagedCredential {
  id: number;
  label: string;
  last_decrypted: null | string;
}

export interface ManagedContact {
  email: string;
  group: null | string;
  id: number;
  name: string;
  phone: ManagedContactPhone;
  updated: string;
}
export interface ManagedContactPhone {
  primary?: null | string;
  secondary?: null | string;
}

export interface ManagedSSHPubKey {
  ssh_key: string;
}

export interface ManagedServicePayload {
  address: string;
  body?: string;
  consultation_group?: string;
  credentials?: number[];
  label: string;
  notes?: string;
  service_type: ServiceType;
  timeout: number;
}

export interface CredentialPayload {
  label: string;
  password?: string;
  username?: string;
}

export interface UpdateCredentialPayload {
  // Not using a Partial<> bc this is the only possible field to update
  label: string;
}

export interface UpdatePasswordPayload {
  password?: string;
  username?: string;
}

export interface ContactPayload {
  email: string;
  group?: null | string;
  name: string;
  phone?: ManagedContactPhone;
}

export interface ManagedIssue {
  created: string;
  entity: IssueEntity;
  id: number;
  services: number[];
}

// This is much like a support ticket but it's a special case so here's a special type:
export interface IssueEntity {
  id: number;
  label: string;
  type: 'ticket'; // I don't make the rules I'm just describing them
  url: string;
}

export interface DataSeries {
  x: number;
  y: number;
}

export interface ManagedStatsData {
  cpu: DataSeries[];
  disk: DataSeries[];
  net_in: DataSeries[];
  net_out: DataSeries[];
  swap: DataSeries[];
}

export interface ManagedStats {
  data: ManagedStatsData;
}
