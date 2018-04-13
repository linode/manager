namespace Linode {
  export interface NodeBalancer {
    id: number;
    label: string;
    hostnamne: string;
    client_conn_throttle: number;
    region: string;
    ipv4: string;
    ipv6: string;
    created: string;
    updated: string;
  }
}
