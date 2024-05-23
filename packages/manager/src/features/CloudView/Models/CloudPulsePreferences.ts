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
  label: string;
  size: number;
}
