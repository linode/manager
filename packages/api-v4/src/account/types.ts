import type { APIWarning, RequestOptions } from '../types';
import type { Capabilities, Region } from '../regions';

export type UserType = 'child' | 'parent' | 'proxy';

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
  user_type: UserType | null;
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

export type AccountCapability =
  | 'Block Storage'
  | 'Cloud Firewall'
  | 'Kubernetes'
  | 'Linodes'
  | 'LKE HA Control Planes'
  | 'Machine Images'
  | 'Managed Databases'
  | 'NodeBalancers'
  | 'Object Storage Access Key Regions'
  | 'Object Storage'
  | 'Vlans'
  | 'VPCs';

export interface AccountAvailability {
  region: string; // will be slug of dc (matches id field of region object returned by API)
  unavailable: Capabilities[];
}

export interface AccountSettings {
  managed: boolean;
  longview_subscription: string | null;
  network_helper: boolean;
  backups_enabled: boolean;
  object_storage: 'active' | 'disabled' | 'suspended';
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
  | 'add_domains'
  | 'add_firewalls'
  | 'add_images'
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
}

export type NotificationType =
  | 'billing_email_bounce'
  | 'migration_scheduled'
  | 'migration_pending'
  | 'reboot_scheduled'
  | 'outage'
  | 'maintenance'
  | 'payment_due'
  | 'ticket_important'
  | 'ticket_abuse'
  | 'notice'
  | 'promotion'
  | 'user_email_bounce'
  | 'volume_migration_scheduled'
  | 'volume_migration_imminent';

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

export type EventAction =
  | 'account_settings_update'
  | 'account_update'
  | 'backups_cancel'
  | 'backups_enable'
  | 'backups_restore'
  | 'community_like'
  | 'community_mention'
  | 'community_question_reply'
  | 'credit_card_updated'
  | 'database_low_disk_space'
  | 'database_backup_restore'
  | 'database_create'
  | 'database_credentials_reset'
  | 'database_delete'
  | 'database_update_failed'
  | 'database_update'
  | 'disk_create'
  | 'disk_delete'
  | 'disk_duplicate'
  | 'disk_imagize'
  | 'disk_resize'
  | 'disk_update'
  | 'domain_create'
  | 'domain_delete'
  | 'domain_record_create'
  | 'domain_record_delete'
  | 'domain_record_updated'
  | 'domain_update'
  | 'entity_transfer_accept'
  | 'entity_transfer_cancel'
  | 'entity_transfer_create'
  | 'entity_transfer_fail'
  | 'entity_transfer_stale'
  | 'firewall_create'
  | 'firewall_delete'
  | 'firewall_device_add'
  | 'firewall_device_remove'
  | 'firewall_disable'
  | 'firewall_enable'
  | 'firewall_update'
  | 'host_reboot'
  | 'image_delete'
  | 'image_update'
  | 'image_upload'
  | 'lassie_reboot'
  | 'linode_addip'
  | 'linode_boot'
  | 'linode_clone'
  | 'linode_config_create'
  | 'linode_config_delete'
  | 'linode_config_update'
  | 'linode_create'
  | 'linode_delete'
  | 'linode_deleteip'
  | 'linode_migrate_datacenter_create'
  | 'linode_migrate_datacenter'
  | 'linode_migrate'
  | 'linode_mutate_create'
  | 'linode_mutate'
  | 'linode_reboot'
  | 'linode_rebuild'
  | 'linode_resize_create'
  | 'linode_resize_warm_create'
  | 'linode_resize'
  | 'linode_shutdown'
  | 'linode_snapshot'
  | 'linode_update'
  | 'lke_node_create'
  | 'longviewclient_create'
  | 'longviewclient_delete'
  | 'longviewclient_update'
  | 'nodebalancer_config_create'
  | 'nodebalancer_config_delete'
  | 'nodebalancer_config_update'
  | 'nodebalancer_create'
  | 'nodebalancer_delete'
  | 'nodebalancer_update'
  | 'password_reset'
  | 'profile_update'
  | 'stackscript_create'
  | 'stackscript_delete'
  | 'stackscript_publicize'
  | 'stackscript_revise'
  | 'stackscript_update'
  | 'subnet_create'
  | 'subnet_delete'
  | 'subnet_update'
  | 'tfa_disabled'
  | 'tfa_enabled'
  | 'ticket_attachment_upload'
  | 'ticket_update'
  | 'token_create'
  | 'token_delete'
  | 'token_update'
  | 'user_ssh_key_add'
  | 'user_ssh_key_delete'
  | 'user_ssh_key_update'
  | 'volume_attach'
  | 'volume_clone'
  | 'volume_create'
  | 'volume_delete'
  | 'volume_detach'
  | 'volume_migrate_scheduled'
  | 'volume_migrate'
  | 'volume_resize'
  | 'volume_update'
  | 'vpc_create'
  | 'vpc_delete'
  | 'vpc_update';

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
  _initial?: boolean;
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
  ended?: string;
  description?: string;
  enrolled: string;
}

export interface EnrollInBetaPayload {
  id: string;
}
