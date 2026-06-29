import type { Filter, Params } from '../types';

export type IdentityElement = 'name_id' | 'user_id_attribute';

export interface IdpCertificate {
  certificate: string;
  created: string;
  created_by: string;
  id: string;
  not_after: string;
  not_before: string;
}

export interface IdpSamlConfig {
  entity_id: string;
  identity_element: IdentityElement;
  idp_url: string;
  public_certificates: IdpCertificate[];
  user_id_attribute?: string;
}

export interface IdpConfig {
  created: string;
  created_by: string;
  default: boolean;
  enabled: boolean;
  enforce: boolean;
  excluded_users_count: number;
  id: string;
  included_users_count: number;
  label: string;
  saml: IdpSamlConfig;
  updated: string;
  updated_by: string;
}

export interface IdpUser {
  id: string;
  label: string;
  type: string;
  url: string;
}

export interface CreateIdpCertificatePayload {
  certificate: string;
}

export interface CreateIdpSamlPayload {
  entity_id: string;
  identity_element: IdentityElement;
  idp_url: string;
  public_certificates: CreateIdpCertificatePayload[];
  user_id_attribute?: string;
}

export interface CreateIdpConfigPayload {
  default: boolean;
  enabled: boolean;
  enforce: boolean;
  label: string;
  saml: CreateIdpSamlPayload;
}

export interface UpdateIdpConfigPayload {
  default?: boolean;
  enabled?: boolean;
  enforce?: boolean;
  label?: string;
  saml?: CreateIdpSamlPayload;
}

export interface UpdateIdpUsersPayload {
  usernames: string[];
}

export interface GetIdpConfigsParams {
  filter?: Filter;
  params?: Params;
}

export interface GetIdpConfigUsersParams {
  euuid: string;
  filter?: Filter;
  params?: Params;
}

export interface GetIdpCertificatesParams {
  euuid: string;
  params?: Params;
}
