export type ResourceType =
  | 'linode'
  | 'firewall'
  | 'nodebalancer'
  | 'longview'
  | 'domain'
  | 'stackscript'
  | 'image'
  | 'volume'
  | 'database'
  | 'vpc';

export interface IamAccountResource {
  resource_type: ResourceType;
  resources: Resource[];
}

export interface Resource {
  name: string;
  id: number;
}
