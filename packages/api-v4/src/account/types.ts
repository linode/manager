import type { Capabilities, Region } from '../regions';
import type { APIWarning, RequestOptions } from '../types';

export type UserType = 'child' | 'default' | 'parent' | 'proxy';

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
  'Akamai Cloud Load Balancer',
  'Akamai Cloud Pulse',
  'Block Storage',
  'Block Storage Encryption',
  'Cloud Firewall',
  'CloudPulse',
  'Disk Encryption',
  'Kubernetes',
  'Kubernetes Enterprise',
  'Linodes',
  'Linode Interfaces',
  'LKE HA Control Planes',
  'LKE Network Access Control List (IP ACL)',
  'Machine Images',
  'Managed Databases',
  'Managed Databases Beta',
  'NETINT Quadra T1U',
  'NodeBalancers',
  'Object Storage Access Key Regions',
  'Object Storage Endpoint Types',
  'Object Storage',
  'Placement Group',
  'SMTP Enabled',
  'Support Ticket Severity',
  'Vlans',
  'VPCs',
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
  maintenance_policy_id: MaintenancePolicyId;
  managed: boolean;
  network_helper: boolean;
  object_storage: 'active' | 'disabled' | 'suspended';
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
  | 'add_buckets'
  | 'add_databases'
  | 'add_databases'
  | 'add_domains'
  | 'add_firewalls'
  | 'add_images'
  | 'add_kubernetes'
  | 'add_linodes'
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

export const EventActionKeys = [
  'account_agreement_eu_model',
  'account_promo_apply',
  'account_settings_update',
  'account_update',
  'backups_cancel',
  'backups_enable',
  'backups_restore',
  'community_like',
  'community_mention',
  'community_question_reply',
  'credit_card_updated',
  'database_backup_create',
  'database_backup_delete',
  'database_backup_restore',
  'database_create',
  'database_credentials_reset',
  'database_degraded',
  'database_delete',
  'database_failed',
  'database_low_disk_space',
  'database_resize_create',
  'database_resize',
  'database_scale',
  'database_update_failed',
  'database_update',
  'database_migrate',
  'database_upgrade',
  'disk_create',
  'disk_delete',
  'disk_duplicate',
  'disk_imagize',
  'disk_resize',
  'disk_update',
  'dns_record_create',
  'dns_record_delete',
  'dns_zone_create',
  'dns_zone_delete',
  'domain_create',
  'domain_delete',
  'domain_import',
  'domain_record_create',
  'domain_record_delete',
  'domain_record_update',
  'domain_record_updated',
  'domain_update',
  'entity_transfer_accept_recipient',
  'entity_transfer_accept',
  'entity_transfer_cancel',
  'entity_transfer_create',
  'entity_transfer_fail',
  'entity_transfer_stale',
  'firewall_apply',
  'firewall_create',
  'firewall_delete',
  'firewall_device_add',
  'firewall_device_remove',
  'firewall_disable',
  'firewall_enable',
  'firewall_rules_update',
  'firewall_update',
  'host_reboot',
  'image_delete',
  'image_update',
  'image_upload',
  'interface_create',
  'interface_delete',
  'interface_update',
  'ipaddress_update',
  'ipv6pool_add',
  'ipv6pool_delete',
  'lassie_reboot',
  'linode_addip',
  'linode_boot',
  'linode_clone',
  'linode_config_create',
  'linode_config_delete',
  'linode_config_update',
  'linode_create',
  'linode_delete',
  'linode_deleteip',
  'linode_migrate_datacenter_create',
  'linode_migrate_datacenter',
  'linode_migrate',
  'linode_mutate_create',
  'linode_mutate',
  'linode_poweroff_on',
  'linode_reboot',
  'linode_rebuild',
  'linode_resize_create',
  'linode_resize_warm_create',
  'linode_resize',
  'linode_shutdown',
  'linode_snapshot',
  'linode_update',
  'lish_boot',
  'lke_cluster_create',
  'lke_cluster_delete',
  'lke_cluster_recycle',
  'lke_cluster_regenerate',
  'lke_cluster_update',
  'lke_control_plane_acl_create',
  'lke_control_plane_acl_delete',
  'lke_control_plane_acl_update',
  'lke_kubeconfig_regenerate',
  'lke_node_create',
  'lke_node_recycle',
  'lke_pool_create',
  'lke_pool_delete',
  'lke_pool_recycle',
  'lke_token_rotate',
  'longviewclient_create',
  'longviewclient_delete',
  'longviewclient_update',
  'managed_enabled',
  'managed_service_create',
  'managed_service_delete',
  'nodebalancer_config_create',
  'nodebalancer_config_delete',
  'nodebalancer_config_update',
  'nodebalancer_create',
  'nodebalancer_delete',
  'nodebalancer_node_create',
  'nodebalancer_node_delete',
  'nodebalancer_node_update',
  'nodebalancer_update',
  'oauth_client_create',
  'oauth_client_delete',
  'oauth_client_secret_reset',
  'oauth_client_update',
  'obj_access_key_create',
  'obj_access_key_delete',
  'obj_access_key_update',
  'password_reset',
  'payment_method_add',
  'payment_submitted',
  'placement_group_assign',
  'placement_group_became_compliant',
  'placement_group_became_non_compliant',
  'placement_group_create',
  'placement_group_delete',
  'placement_group_unassign',
  'placement_group_update',
  'profile_update',
  'reserved_ip_assign',
  'reserved_ip_create',
  'reserved_ip_delete',
  'reserved_ip_unassign',
  'stackscript_create',
  'stackscript_delete',
  'stackscript_publicize',
  'stackscript_revise',
  'stackscript_update',
  'subnet_create',
  'subnet_delete',
  'subnet_update',
  'tag_create',
  'tag_delete',
  'tax_id_invalid',
  'tax_id_valid',
  'tfa_disabled',
  'tfa_enabled',
  'ticket_attachment_upload',
  'ticket_create',
  'ticket_update',
  'token_create',
  'token_delete',
  'token_update',
  'user_create',
  'user_delete',
  'user_ssh_key_add',
  'user_ssh_key_delete',
  'user_ssh_key_update',
  'user_update',
  'volume_attach',
  'volume_clone',
  'volume_create',
  'volume_delete',
  'volume_detach',
  'volume_migrate_scheduled',
  'volume_migrate',
  'volume_resize',
  'volume_update',
  'vpc_create',
  'vpc_delete',
  'vpc_update',
] as const;

export type EventAction = (typeof EventActionKeys)[number];

export type EventStatus =
  | 'failed'
  | 'finished'
  | 'notification'
  | 'scheduled'
  | 'started';

export type EventSource = 'platform' | 'user';

export interface Event {
  action: EventAction;
  complete_time?: null | string;
  created: string;
  description?: null | string;
  /*
    NOTE: events before the duration key was added will have a duration of 0
  */
  duration: null | number;
  entity: Entity | null;
  id: number;
  /**
   * Tentative fields from Host & VM Maintenance Policy project.
   *
   * TODO: verify final state of these fields.
   */
  maintenance_policy_set?: MaintenancePolicyType | null;
  message: null | string;
  not_before?: null | string;
  percent_complete: null | number;
  rate: null | string;
  read: boolean;
  secondary_entity: Entity | null;

  seen: boolean;
  source?: EventSource | null;
  start_time?: null | string;
  status: EventStatus;
  time_remaining: null | string;
  username: null | string;
}
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
  entity: {
    id: number;
    label: string;
    type: string;
    url: string;
  };
  reason: string;
  status: 'completed' | 'pending' | 'started';
  type: 'cold_migration' | 'live_migration' | 'reboot' | 'volume_migration';
  when: string;
}

export const maintenancePolicies = [
  { id: 1, type: 'migrate' },
  { id: 2, type: 'power on/off' },
] as const;

export type MaintenancePolicyId = (typeof maintenancePolicies)[number]['id'];

export type MaintenancePolicyType =
  (typeof maintenancePolicies)[number]['type'];

export type MaintenancePolicy = (typeof maintenancePolicies)[number] & {
  description: string;
  is_default: boolean;
  name: string;
  notification_period_sec: number;
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
