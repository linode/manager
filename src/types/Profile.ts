namespace Linode {
  export interface Profile {
    uid: number;
    username: string;
    email: string;
    timezone: string;
    email_notifications: boolean;
    referrals: Referrals;
    ip_whitelist_enabled: boolean;
    lish_auth_method: 'password_keys' | 'keys_only' | 'disabled';
    authorized_keys: string[];
    two_factor_auth: boolean;
    restricted: boolean;
    grants?: Linode.Grants;
  }

  interface Referrals {
    code: string;
    url: string;
    total: number;
    completed: number;
    pending: number;
    credit: number;
  }

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

  export interface OAuthClient {
    id: string;
    label: string;
    redirect_uri: string;
    thumbnail_url: string;
    public: boolean;
    status: 'disabled' | 'active' | 'suspended';
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
