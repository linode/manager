namespace Linode {
  export interface Profile {
    uid: number;
    username: string;
    email: string;
    timezone: string;
    email_notifications: boolean;
    referrals: Referrals;
    ip_whitelist_enabled: boolean;
    list_auth_method: 'password_keys' | 'keys_only' | 'disabled';
    authorized_keys: string[];
    two_factor_auth: boolean;
    restricted: boolean;
  }

  type Referrals = {
    code: string,
    url: string,
    total: number,
    completed: number,
    pending: number,
    credit: number,
  };

  export type Token = {
    id: number,
    scopes: string,
    label: string,
    created: string,
    token: string,
    expiry: string,
  };
}
