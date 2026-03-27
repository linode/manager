export interface Tag {
  label: string;
}

export interface TagRequest {
  domains?: number[];
  label: string;
  linodes?: number[];
  nodebalancers?: number[];
  reserved_ipv4_addresses?: string[];
  volumes?: number[];
}
