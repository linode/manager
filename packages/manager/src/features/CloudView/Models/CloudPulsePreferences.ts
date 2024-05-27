import { TimeGranularity } from "@linode/api-v4";

export interface AclpConfig {
  dashboardId: number;
  interval: string;
  region: string;
  resources: string[];
  timeDuration: string;
  widgets: {
    aggregateFunction: string;
    label: string;
    size: number;
  }[];
}

export interface AclpWidget {
  aggregateFunction: string;
  time_granularity: TimeGranularity;
  label: string;
  size: number;
}
