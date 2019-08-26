import { Grants } from '../account/types'

export interface Referrals {
  code: string;
  url: string;
  total: number;
  completed: number;
  pending: number;
  credit: number;
}

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
  grants?: Grants;
}