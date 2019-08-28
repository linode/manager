namespace Linode {
  export interface Token {
    id: number;
    scopes: string;
    label: string;
    created: string;
    token?: string;
    expiry: string;
    website?: string;
    thumbnail_url?: null | string;
  }

  export interface SSHKey {
    id: number;
    label: string;
    ssh_key: string;
    created: string;
  }

  export interface Secret {
    secret: string;
    expiry: Date;
  }

  export interface Device {
    created: string;
    last_authenticated: string;
    last_remote_addr: string;
    id: number;
    user_agent: string;
    expiry: string;
  }
}
