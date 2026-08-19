import type { Capabilities, Region } from '../regions';
import type { APIWarning, RequestOptions } from '../types';
import type { Event, EventAction } from '@akamai/compute-ui-core/events';

export type { Event, EventAction };

export type UserType = 'child' | 'default' | 'delegate' | 'parent'; // 'proxy' is deprecated

export interface User {
  email: string;
  /**
   * Information for the most recent login attempt for this User.
   * `null` if no login attempts have been made since creation of this User.
   */
  last_login: null | {
    /**
     * @example 2022-02-09T16:19:26
     */
    login_datetime: string;
    /**
     * @example successful
     */
    status: AccountLoginStatus;
  };
  /**
   * The date of when a password was set on a user.
   * `null` if this user has not created a password yet
   * @example 2022-02-09T16:19:26
   * @example null
   */
  password_created: null | string;
  restricted: boolean;
  ssh_keys: string[];
  tfa_enabled: boolean;
  /**
   * Whether MFA is enforced for this user.
   * Differs from `tfa_enabled`, which indicates whether the user has MFA configured.
   */
  tfa_enforced: boolean;
  user_type: UserType;
  username: string;
  verified_phone_number: null | string;
}

export interface Account {
  active_promotions: ActivePromotion[];
  active_since: string;
  address_1: string;
  address_2: string;
  balance: number;
  balance_uninvoiced: number;
  billing_source: BillingSource;
  capabilities: AccountCapability[];
  city: string;
  company: string;
  country: string;
  credit_card: CreditCardData;
  email: string;
  euuid: string;
  first_name: string;
  last_name: string;
  phone: string;
  state: string;
  tax_id: string;
  zip: string;
}

export type BillingSource = 'akamai' | 'linode';

export const accountCapabilities = [
  'AI Inference',
  'Akamai Cloud Load Balancer',
  'Akamai Cloud Pulse',
  'Akamai Cloud Pulse Logs',
  'Akamai Cloud Pulse Logs LKE-E Audit',
  'Block Storage',
  'Block Storage Encryption',
  'Cloud Firewall',
  'Cloud Firewall Rule Set',
  'CloudPulse',
  'Custom VPC IPv4 Ranges',
  'Disk Encryption',
  'GPUDirect RDMA',
  'Kubernetes',
  'Kubernetes Enterprise',
  'Kubernetes Enterprise BYO VPC',
  'Kubernetes Enterprise Dual Stack',
  'Linodes',
  'Linode Interfaces',
  'LKE HA Control Planes',
  'LKE Network Access Control List (IP ACL)',
  'Machine Images',
  'Managed Databases',
  'NETINT Quadra T1U',
  'NAT Gateway',
  'Network LoadBalancer',
  'NodeBalancers',
  'Object Storage Access Key Regions',
  'Object Storage Endpoint Types',
  'Object Storage',
  'Placement Group',
  'SMTP Enabled',
  'Support Live Chat',
  'Support Ticket Severity',
  'Vlans',
  'VPCs',
  'VPC Dual Stack',
] as const;

export type AccountCapability = (typeof accountCapabilities)[number];

export interface AccountAvailability {
  region: string; // will be slug of dc (matches id field of region object returned by API)
  unavailable: Capabilities[];
}

export const linodeInterfaceAccountSettings = [
  'legacy_config_only',
  'legacy_config_default_but_linode_allowed',
  'linode_default_but_legacy_config_allowed',
  'linode_only',
] as const;

export type LinodeInterfaceAccountSetting =
  (typeof linodeInterfaceAccountSettings)[number];

export interface AccountSettings {
  backups_enabled: boolean;
  interfaces_for_new_linodes: LinodeInterfaceAccountSetting;
  longview_subscription: null | string;
  maintenance_policy: MaintenancePolicySlug;
  managed: boolean;
  network_helper: boolean;
  object_storage: 'active' | 'disabled' | 'suspended';
  tfa_enforced: boolean;
}

export interface TfaOptionalUser {
  url: string;
  username: string;
}

export interface UpdateTfaOptionalUsersPayload {
  usernames: string[];
}

export interface UpdateTfaOptionalUsersResponse {
  tfa_optional_users_count: number;
  url: string;
}

export interface ActivePromotion {
  credit_monthly_cap: string;
  credit_remaining: string;
  description: string;
  expire_dt: null | string;
  image_url: string;
  service_type: PromotionServiceType;
  summary: string;
  this_month_credit_remaining: string;
}

export type PromotionServiceType =
  | 'all'
  | 'backup'
  | 'blockstorage'
  | 'db_mysql'
  | 'ip_v4'
  | 'linode'
  | 'linode_disk'
  | 'linode_memory'
  | 'longview'
  | 'managed'
  | 'nodebalancer'
  | 'objectstorage'
  | 'transfer_tx';

export type ThirdPartyPayment = 'google_pay' | 'paypal';

export type CardType =
  | 'American Express'
  | 'Discover'
  | 'JCB'
  | 'MasterCard'
  | 'Visa';

export type PaymentType = 'credit_card' | ThirdPartyPayment;

export interface TaxSummary {
  name: string;
  tax: number;
}

export interface Invoice {
  date: string;
  id: number;
  label: string;
  subtotal: number;
  tax: number;
  tax_summary: TaxSummary[];
  total: number;
}

export interface InvoiceItem {
  amount: number;
  from: null | string;
  label: string;
  quantity: null | number;
  region: null | string;
  tax: number;
  to: null | string;
  total: number;
  type: 'hourly' | 'misc' | 'prepay';
  unit_price: null | string;
}

export interface Payment {
  date: string;
  id: number;
  usd: number;
}

export interface PaymentResponse extends Payment {
  warnings?: APIWarning[];
}

export type GrantLevel = 'read_only' | 'read_write' | null;

export interface Grant {
  id: number;
  label: string;
  permissions: GrantLevel;
}
export type GlobalGrantTypes =
  | 'account_access'
  | 'add_databases'
  | 'add_domains'
  | 'add_firewalls'
  | 'add_images'
  | 'add_kubernetes'
  | 'add_linodes'
  | 'add_lkes'
  | 'add_longview'
  | 'add_nodebalancers'
  | 'add_stackscripts'
  | 'add_volumes'
  | 'add_vpcs'
  | 'cancel_account'
  | 'child_account_access'
  | 'longview_subscription';

export interface GlobalGrants {
  global: Record<GlobalGrantTypes, boolean | GrantLevel>;
}

export type GrantType =
  | 'database'
  | 'domain'
  | 'firewall'
  | 'image'
  | 'linode'
  | 'lkecluster'
  | 'longview'
  | 'nodebalancer'
  | 'stackscript'
  | 'volume'
  | 'vpc';

export type Grants = GlobalGrants & Record<GrantType, Grant[]>;

export interface NetworkUtilization {
  billable: number;
  quota: number;
  used: number;
}
export interface RegionalNetworkUtilization extends NetworkUtilization {
  region_transfers: RegionalTransferObject[];
}
export interface RegionalTransferObject extends NetworkUtilization {
  id: Region['id'];
}

export interface NetworkTransfer {
  bytes_in: number;
  bytes_out: number;
  bytes_total: number;
}

export interface CancelAccount {
  survey_link: string;
}

export interface CancelAccountPayload {
  comments: string;
}

export interface ChildAccountPayload extends RequestOptions {
  euuid: string;
}

export type AgreementType = 'eu_model' | 'privacy_policy';

export interface Agreements {
  billing_agreement: boolean;
  eu_model: boolean;
  privacy_policy: boolean;
}

export type NotificationType =
  | 'billing_email_bounce'
  | 'maintenance'
  | 'maintenance_in_progress'
  | 'maintenance_pending'
  | 'maintenance_scheduled'
  | 'migration_pending'
  | 'migration_scheduled'
  | 'notice'
  | 'outage'
  | 'payment_due'
  | 'promotion'
  | 'reboot_scheduled'
  | 'security_reboot_maintenance_scheduled'
  | 'tax_id_verifying'
  | 'ticket_abuse'
  | 'ticket_important'
  | 'user_email_bounce'
  | 'volume_migration_imminent'
  | 'volume_migration_scheduled';

export type NotificationSeverity = 'critical' | 'major' | 'minor';

export interface Notification {
  body: null | string;
  entity: Entity | null;
  label: string;
  message: string;
  severity: NotificationSeverity;
  type: NotificationType;
  until: null | string;
  when: null | string;
}

export interface Entity {
  id: number;
  label: null | string;
  type: string;
  url: string;
}

export type EventStatus =
  | 'canceled'
  | 'failed'
  | 'finished'
  | 'notification'
  | 'scheduled'
  | 'started';

export type EventSource = 'platform' | 'user';

/**
 * Represents an event which has an entity. For use with type guards.
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
export interface EntityEvent extends Event {
  entity: Entity;
}

export interface OAuthClient {
  id: string;
  label: string;
  public: boolean;
  redirect_uri: string;
  secret: string;
  status: 'active' | 'disabled' | 'suspended';
  thumbnail_url: null | string;
}

export interface OAuthClientRequest {
  label: string;
  public?: boolean;
  redirect_uri: string;
}

export interface SaveCreditCardData {
  card_number: string;
  cvv: string;
  expiry_month: number;
  expiry_year: number;
}

export interface AccountMaintenance {
  complete_time: null | string;
  description: 'emergency' | 'scheduled';
  entity: {
    id: number;
    label: string;
    type: 'linode' | 'volume';
    url: string;
  };
  maintenance_policy_set: MaintenancePolicySlug;
  not_before: null | string;
  reason: string;
  source: 'platform' | 'user';
  start_time: null | string;
  status:
    | 'canceled'
    | 'completed'
    | 'in_progress'
    | 'pending'
    | 'scheduled'
    | 'started';
  type:
    | 'cold_migration'
    | 'live_migration'
    | 'migrate'
    | 'power_off_on'
    | 'reboot'
    | 'volume_migration';
  when: string; // Never null, always datetime object
}

// Note: In the future there will be more slugs, ie: 'private/1234'.
export type MaintenancePolicySlug = 'linode/migrate' | 'linode/power_off_on';

export type MaintenancePolicy = {
  description: string;
  is_default: boolean;
  label: 'Migrate' | 'Power Off / Power On';
  notification_period_sec: number;
  slug: MaintenancePolicySlug;
  type: 'linode_migrate' | 'linode_power_off_on' | 'migrate' | 'power_off_on'; // Should not be needed for UX. Mainly for FleetOps.
};

export interface PayPalData {
  email: string;
  paypal_id: string;
}

export interface CreditCardData {
  card_type?: CardType;
  expiry: null | string;
  last_four: null | string;
}

interface PaymentMethodMetaData {
  created: string;
  id: number;
  is_default: boolean;
}

interface PaymentMethodData<T, U> extends PaymentMethodMetaData {
  data: U;
  type: T;
}

export type PaymentMethod =
  | PaymentMethodData<'credit_card' | 'google_pay', CreditCardData>
  | PaymentMethodData<'paypal', PayPalData>;

export interface ClientToken {
  client_token: string;
}

export interface PaymentMethodPayload {
  data: SaveCreditCardData | { nonce: string };
  is_default: boolean;
  type: 'credit_card' | 'payment_method_nonce';
}

export interface MakePaymentData {
  cvv?: string;
  nonce?: string;
  payment_method_id?: number;
  usd: string;
}

export type AccountLoginStatus = 'failed' | 'successful';

export interface AccountLogin {
  datetime: string;
  id: number;
  ip: string;
  restricted: boolean;
  status: AccountLoginStatus;
  username: string;
}

export interface AccountBeta {
  description: null | string;
  ended: null | string;
  /**
   * The datetime the account enrolled into the beta
   * @example 2024-10-23T14:22:29
   */
  enrolled: string;
  id: string;
  label: string;
  started: string;
}

export interface EnrollInBetaPayload {
  id: string;
}
