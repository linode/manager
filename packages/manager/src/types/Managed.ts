namespace Linode {
  export interface ManagedServiceMonitor {
    id: number;
    label: string;
    created: string;
    updated: string;
    status: MonitorStatus;
    service_type: ServiceType;
    timeout: number;
    region: string | null;
    credentials: any[]; // @todo
    address: string;
    body: string;
    notes: string;
    consultation_group: string; // deprecated but still returned by API
  }

  export type MonitorStatus = 'pending' | 'disabled' | 'ok' | 'problem';

  export type ServiceType = 'url' | 'tcp';
}
