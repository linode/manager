export interface ManagedServiceMonitor {
  id: number;
  label: string;
  created: string;
  updated: string;
  status: MonitorStatus;
  service_type: ServiceType;
  timeout: number;
  region: string | null;
  credentials: ManagedCredential[]; // @todo
  address: string;
  body: string;
  notes: string;
  consultation_group: string; // deprecated but still returned by API
}

export type MonitorStatus = 'pending' | 'disabled' | 'ok' | 'problem';

export type ServiceType = 'url' | 'tcp';

export interface ManagedLinodeSetting {
  id: number;
  label: string;
  group: string;
  ssh: ManagedSSHSetting;
}

export interface ManagedSSHSetting {
  access: boolean;
  user: string;
  ip: string;
  port: number;
}

export interface ManagedCredential {
  id: number;
  last_decrypted: string | null;
  label: string;
}

export interface ManagedContact {
  id: number;
  name: string;
  email: string;
  phone: ManagedContactPhone;
  group: string | null;
  updated: string;
}
export interface ManagedContactPhone {
  primary: string | null;
  secondary: string | null;
}

export interface ManagedSSHPubKey {
  ssh_key: string;
}
