export interface AclpConfig {
  dashboardId: number;
  interval: string;
  region: string;
  resources: string[];
  timeDuration: string;
  widgets: {
    label: string;
    size: number;
  }[];
}

export interface AclpWidget {
    label: string;
    size: number;
}
