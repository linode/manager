import type { APIWarning, RequestOptions } from '../types';
import type { Capabilities, Region } from '../regions';

export type UserType = 'child' | 'parent' | 'proxy' | 'default';

export interface User {
  email: string;
  /**
   * Information for the most recent login attempt for this User.
   * `null` if no login attempts have been made since creation of this User.
   */
  last_login: {
    /**
     * @example 2022-02-09T16:19:26
     */
    login_datetime: string;
    /**
     * @example successful
     */
    status: AccountLoginStatus;
  } | null;
  /**
   * The date of when a password was set on a user.
   * `null` if this user has not created a password yet
   * @example 2022-02-09T16:19:26
   * @example null
   */
  password_created: string | null;
  restricted: boolean;
  ssh_keys: string[];
  tfa_enabled: boolean;
  username: string;
  user_type: UserType;
  verified_phone_number: string | null;
}

export interface Account {
  active_since: string;
  address_2: string;
  email: string;
  first_name: string;
  tax_id: string;
  credit_card: CreditCardData;
  state: string;
  zip: string;
  address_1: string;
  country: string;
  last_name: string;
  balance: number;
  balance_uninvoiced: number;
  billing_source: BillingSource;
  city: string;
  phone: string;
  company: string;
  active_promotions: ActivePromotion[];
  capabilities: AccountCapability[];
  euuid: string;
}

export type BillingSource = 'linode' | 'akamai';

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

export type AccountCapability = typeof accountCapabilities[number];

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

export type LinodeInterfaceAccountSetting = typeof linodeInterfaceAccountSettings[number];

export interface AccountSettings {
  managed: boolean;
  longview_subscription: string | null;
  network_helper: boolean;
  backups_enabled: boolean;
  object_storage: 'active' | 'disabled' | 'suspended';
  interfaces_for_new_linodes: LinodeInterfaceAccountSetting;
}

export interface ActivePromotion {
  description: string;
  summary: string;
  expire_dt: string | null;
  credit_remaining: string;
  this_month_credit_remaining: string;
  credit_monthly_cap: string;
  image_url: string;
  service_type: PromotionServiceType;
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
  | 'Visa'
  | 'MasterCard'
  | 'American Express'
  | 'Discover'
  | 'JCB';

export type PaymentType = 'credit_card' | ThirdPartyPayment;

export interface TaxSummary {
  tax: number;
  name: string;
}

export interface Invoice {
  id: number;
  date: string;
  label: string;
  total: number;
  tax: number;
  subtotal: number;
  tax_summary: TaxSummary[];
}

export interface InvoiceItem {
  amount: number;
  from: null | string;
  to: null | string;
  label: string;
  quantity: null | number;
  type: 'hourly' | 'prepay' | 'misc';
  unit_price: null | string;
  tax: number;
  total: number;
  region: string | null;
}

export interface Payment {
  id: number;
  date: string;
  usd: number;
}

export interface PaymentResponse extends Payment {
  warnings?: APIWarning[];
}

export type GrantLevel = null | 'read_only' | 'read_write';

export interface Grant {
  id: number;
  permissions: GrantLevel;
  label: string;
}
export type GlobalGrantTypes =
  | 'account_access'
  | 'add_databases'
  | 'add_domains'
  | 'add_firewalls'
  | 'add_images'
  | 'add_linodes'
  | 'add_longview'
  | 'add_databases'
  | 'add_kubernetes'
  | 'add_nodebalancers'
  | 'add_stackscripts'
  | 'add_volumes'
  | 'add_vpcs'
  | 'cancel_account'
  | 'child_account_access'
  | 'add_buckets'
  | 'longview_subscription';

export interface GlobalGrants {
  global: Record<GlobalGrantTypes, boolean | GrantLevel>;
}

export type GrantType =
  | 'linode'
  | 'domain'
  | 'nodebalancer'
  | 'image'
  | 'longview'
  | 'stackscript'
  | 'volume'
  | 'database'
  | 'firewall'
  | 'vpc';

export type Grants = GlobalGrants & Record<GrantType, Grant[]>;

export interface NetworkUtilization {
  billable: number;
  used: number;
  quota: number;
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
  eu_model: boolean;
  privacy_policy: boolean;
  billing_agreement: boolean;
}

export type NotificationType =
  | 'billing_email_bounce'
  | 'migration_scheduled'
  | 'migration_pending'
  | 'reboot_scheduled'
  | 'outage'
  | 'maintenance'
  | 'maintenance_scheduled'
  | 'payment_due'
  | 'ticket_important'
  | 'ticket_abuse'
  | 'notice'
  | 'promotion'
  | 'user_email_bounce'
  | 'volume_migration_scheduled'
  | 'volume_migration_imminent'
  | 'tax_id_verifying';

export type NotificationSeverity = 'minor' | 'major' | 'critical';

export interface Notification {
  entity: null | Entity;
  label: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  when: null | string;
  until: null | string;
  body: null | string;
}

export interface Entity {
  id: number;
  label: string | null;
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

export type EventAction = typeof EventActionKeys[number];

export type EventStatus =
  | 'scheduled'
  | 'started'
  | 'finished'
  | 'failed'
  | 'notification';

export interface Event {
  id: number;
  action: EventAction;
  created: string;
  entity: Entity | null;
  /*
    NOTE: events before the duration key was added will have a duration of 0
  */
  duration: number | null;
  percent_complete: number | null;
  rate: string | null;
  read: boolean;
  seen: boolean;
  status: EventStatus;
  time_remaining: null | string;
  username: string | null;
  secondary_entity: Entity | null;
  message: string | null;
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
  redirect_uri: string;
  thumbnail_url: string | null;
  public: boolean;
  status: 'disabled' | 'active' | 'suspended';
  secret: string;
}

export interface OAuthClientRequest {
  label: string;
  redirect_uri: string;
  public?: boolean;
}

export interface SaveCreditCardData {
  card_number: string;
  expiry_year: number;
  expiry_month: number;
  cvv: string;
}

export interface AccountMaintenance {
  reason: string;
  status: 'pending' | 'started' | 'completed';
  type: 'reboot' | 'cold_migration' | 'live_migration' | 'volume_migration';
  when: string;
  entity: {
    id: number;
    label: string;
    type: string;
    url: string;
  };
}

export interface PayPalData {
  paypal_id: string;
  email: string;
}

export interface CreditCardData {
  expiry: string | null;
  last_four: string | null;
  card_type?: CardType;
}

interface PaymentMethodMetaData {
  id: number;
  is_default: boolean;
  created: string;
}

interface PaymentMethodData<T, U> extends PaymentMethodMetaData {
  type: T;
  data: U;
}

export type PaymentMethod =
  | PaymentMethodData<'credit_card' | 'google_pay', CreditCardData>
  | PaymentMethodData<'paypal', PayPalData>;

export interface ClientToken {
  client_token: string;
}

export interface PaymentMethodPayload {
  type: 'credit_card' | 'payment_method_nonce';
  data: SaveCreditCardData | { nonce: string };
  is_default: boolean;
}

export interface MakePaymentData {
  usd: string;
  cvv?: string;
  nonce?: string;
  payment_method_id?: number;
}

export type AccountLoginStatus = 'successful' | 'failed';

export interface AccountLogin {
  datetime: string;
  id: number;
  ip: string;
  restricted: boolean;
  username: string;
  status: AccountLoginStatus;
}

export interface AccountBeta {
  label: string;
  started: string;
  id: string;
  ended: string | null;
  description: string | null;
  /**
   * The datetime the account enrolled into the beta
   * @example 2024-10-23T14:22:29
   */
  enrolled: string;
}

export interface EnrollInBetaPayload {
  id: string;
}
