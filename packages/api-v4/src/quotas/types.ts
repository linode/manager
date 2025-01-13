export interface Quota {
  quota_id: number;
  quota_name: string;
  service_name: string;
  description: string;
  quota_limit: number;
  used: number;
  resource_metric: string;
  unit: string;
  scope: string;
}

export type QuotaType = 'linode' | 'lke' | 'object-storage';
