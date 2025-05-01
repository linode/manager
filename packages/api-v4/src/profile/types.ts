import type { UserType } from '../account';

export interface Referrals {
  code: string;
  completed: number;
  credit: number;
  pending: number;
  total: number;
  url: string;
}

export type TPAProvider = 'github' | 'google' | 'password';
export interface Profile {
  authentication_type: TPAProvider;
  authorized_keys: string[];
  email: string;
  email_notifications: boolean;
  ip_whitelist_enabled: boolean;
  lish_auth_method: 'disabled' | 'keys_only' | 'password_keys';
  referrals: Referrals;
  restricted: boolean;
  timezone: string;
  two_factor_auth: boolean;
  uid: number;
  user_type: UserType;
  username: string;
  verified_phone_number: null | string;
}

export interface TokenRequest {
  expiry?: string;
  label: string;
  scopes?: string;
}

export interface Token {
  created: string;
  expiry: null | string;
  id: number;
  label: string;
  scopes: string;
  thumbnail_url?: null | string;
  token?: string;
  website?: string;
}

export interface TrustedDevice {
  created: string;
  expiry: string;
  id: number;
  last_authenticated: string;
  last_remote_addr: string;
  user_agent: string;
}

export interface SSHKey {
  created: string;
  id: number;
  label: string;
  ssh_key: string;
}

export interface Secret {
  expiry: Date;
  secret: string;
}

export type UserPreferences = Record<string, any>;

export interface ProfileLogin {
  datetime: string;
  id: number;
  ip: string;
  restricted: boolean;
  username: string;
}

export type SecurityQuestions = Record<string, string>;

export interface VerifyVerificationCodePayload {
  otp_code: string;
}

export interface SecurityQuestion {
  id: number;
  question: string;
  response: null | string;
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
  iso_code: string;
  phone_number: string;
}
