export interface Namespace {
  id: number;
  label: string;
  region: string;
  type: string;
  urls: {
    ingest: string;
    read: string;
    agent_install: string;
  };
  created: string;
  updated: string;
}

export interface Dashboard {

  id: number;
  label:string;
  service_type:string;
  instance_id:number;
  namespace_id:number;
  widgets:Widgets[];
  created:string;
  updated:string;
  filters:Filters[];

}

export interface Widgets {
  label:string;
  metric:string;
  aggregate_function:string;
  group_by:string;
  y_label:string;
  filters:Filters[];
}

export interface Filters {
  key:string;
  operator:string;
  value:string;
}

export interface NamespaceApiKey {
  active_keys: {
    api_key: string;
    expiry: string;
  }[];
}
export interface CreateNameSpacePayload {
  label: string | null;
  region: string | null;
  type: string | null;
}

export interface ServiceTypes {
  service_types: {
    service_type: string;
    price: string;
    available_metrics: {
      label: string;
      description: string;
      metric_label: string;
      metric_type: string;
      data_type: string;
      dimensions: {
        label: string;
        key: string;
        values: string[];
        data_type: string;
        description: string;
      }[];
    }[];
  }[];
}
