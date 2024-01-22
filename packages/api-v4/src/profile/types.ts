import type { UserType } from '../account';

export interface Referrals {
  code: string;
  url: string;
  total: number;
  completed: number;
  pending: number;
  credit: number;
}

export type TPAProvider = 'password' | 'github' | 'google';
export interface Profile {
  uid: number;
  username: string;
  email: string;
  timezone: string;
  email_notifications: boolean;
  referrals: Referrals;
  ip_whitelist_enabled: boolean;
  lish_auth_method: 'password_keys' | 'keys_only' | 'disabled';
  authentication_type: TPAProvider;
  authorized_keys: string[];
  two_factor_auth: boolean;
  restricted: boolean;
  verified_phone_number: string | null;
  user_type: UserType | null;
}

export interface TokenRequest {
  scopes?: string;
  expiry?: string;
  label: string;
}

export interface Token {
  id: number;
  scopes: string;
  label: string;
  created: string;
  token?: string;
  expiry: string | null;
  website?: string;
  thumbnail_url?: null | string;
}

export interface TrustedDevice {
  created: string;
  last_authenticated: string;
  last_remote_addr: string;
  id: number;
  user_agent: string;
  expiry: string;
}

export interface SSHKey {
  created: string;
  id: number;
  label: string;
  ssh_key: string;
}

export interface Secret {
  secret: string;
  expiry: Date;
}

export type UserPreferences = Record<string, any>;

export interface ProfileLogin {
  id: number;
  datetime: string;
  ip: string;
  username: string;
  restricted: boolean;
}

export type SecurityQuestions = Record<string, string>;

export interface VerifyVerificationCodePayload {
  otp_code: string;
}

export interface SecurityQuestion {
  id: number;
  question: string;
  response: string | null;
}

export interface SecurityQuestionsData {
  security_questions: SecurityQuestion[];
}

export interface SecurityQuestionsPayload {
  security_questions: {
    question_id: number;
    response: string;
  }[];
}

export interface SendPhoneVerificationCodePayload {
  phone_number: string;
  iso_code: string;
}
