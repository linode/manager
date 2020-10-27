declare module 'linode-js-sdk/account/account' {
  import { Account, AccountSettings, CancelAccount, CancelAccountPayload, NetworkUtilization } from 'linode-js-sdk/account/types';
  /**
   * getAccountInfo
   *
   * Return account information,
   * including contact and billing info.
   *
   */
  export const getAccountInfo: () => Promise<Account>;
  /**
   * getNetworkUtilization
   *
   * Return your current network transfer quota and usage.
   *
   */
  export const getNetworkUtilization: () => Promise<NetworkUtilization>;
  /**
   * updateAccountInfo
   *
   * Update your contact or billing information.
   *
   */
  export const updateAccountInfo: (data: Partial<Account>) => Promise<Account>;
  /**
   * getAccountSettings
   *
   * Retrieve general account-level settings.
   *
   */
  export const getAccountSettings: () => Promise<AccountSettings>;
  /**
   * updateAccountSettings
   *
   * Update a user's account settings.
   *
   */
  export const updateAccountSettings: (data: Partial<AccountSettings>) => Promise<AccountSettings>;
  /**
   * cancelAccount
   *
   * Cancels an account and returns a survey monkey link for a user to fill out
   */
  export const cancelAccount: (data: CancelAccountPayload) => Promise<CancelAccount>;

}
declare module 'linode-js-sdk/account/account.schema' {
  export const updateAccountSchema: import("yup").ObjectSchema<{
      email: string;
      address_1: string;
      city: string;
      company: string;
      country: string;
      first_name: string;
      last_name: string;
      address_2: string;
      phone: string;
      state: string;
      tax_id: string;
      zip: string;
  }>;
  export const createOAuthClientSchema: import("yup").ObjectSchema<{
      label: string;
      redirect_uri: string;
  }>;
  export const updateOAuthClientSchema: import("yup").ObjectSchema<{
      label: string;
      redirect_uri: string;
  }>;
  export const StagePaypalPaymentSchema: import("yup").ObjectSchema<{
      cancel_url: string;
      redirect_url: string;
      usd: string;
  }>;
  export const ExecutePaypalPaymentSchema: import("yup").ObjectSchema<{
      payer_id: string;
      payment_id: string;
  }>;
  export const PaymentSchema: import("yup").ObjectSchema<{
      usd: string;
  }>;
  export const CreditCardSchema: import("yup").ObjectSchema<{
      card_number: string;
      expiry_year: number;
      expiry_month: number;
      cvv: string;
  }>;
  export const CreateUserSchema: import("yup").ObjectSchema<{
      username: string;
      email: string;
      restricted: boolean;
  }>;
  export const UpdateUserSchema: import("yup").ObjectSchema<{
      username: string;
      email: string;
      restricted: boolean;
  }>;
  export const UpdateGrantSchema: import("yup").ObjectSchema<{
      global: import("yup").Ref;
      linode: {
          id: any;
          permissions: any;
      }[];
      domain: {
          id: any;
          permissions: any;
      }[];
      nodebalancer: {
          id: any;
          permissions: any;
      }[];
      image: {
          id: any;
          permissions: any;
      }[];
      longview: {
          id: any;
          permissions: any;
      }[];
      stackscript: {
          id: any;
          permissions: any;
      }[];
      volume: {
          id: any;
          permissions: any;
      }[];
  }>;
  export const UpdateAccountSettingsSchema: import("yup").ObjectSchema<{
      network_helper: boolean;
      backups_enabled: boolean;
      managed: boolean;
  }>;

}
declare module 'linode-js-sdk/account/events' {
  import { ResourcePage } from 'linode-js-sdk/types';
  import { Event, Notification } from 'linode-js-sdk/account/types';
  /**
   * getEvents
   *
   * Retrieve a list of events on your account.
   *
   */
  export const getEvents: (params?: any, filter?: any) => Promise<ResourcePage<Event>>;
  /**
   * getEvent
   *
   * Retrieve details about a single event.
   *
   */
  export const getEvent: (eventId: number) => import("axios").AxiosPromise<Event>;
  /**
   * markEventSeen
   *
   * Set the "seen" property of an event to true
   *
   * @param eventId { number } ID of the event to designate as seen
   */
  export const markEventSeen: (eventId: number) => import("axios").AxiosPromise<{}>;
  /**
   * markEventRead
   *
   * Set the "read" property of an event to true
   *
   * @param eventId { number } ID of the event to designate as read
   *
   */
  export const markEventRead: (eventId: number) => import("axios").AxiosPromise<{}>;
  /**
   * getNotifications
   *
   * Retrieve a list of active notifications on your account.
   *
   */
  export const getNotifications: () => Promise<ResourcePage<Notification>>;

}
declare module 'linode-js-sdk/account/index' {
  export * from 'linode-js-sdk/account/account';
  export * from 'linode-js-sdk/account/events';
  export * from 'linode-js-sdk/account/invoices';
  export * from 'linode-js-sdk/account/payments';
  export * from 'linode-js-sdk/account/users';
  export * from 'linode-js-sdk/account/oauth';
  export * from 'linode-js-sdk/account/types';
  export * from 'linode-js-sdk/account/account';

}
declare module 'linode-js-sdk/account/invoices' {
  import { ResourcePage } from 'linode-js-sdk/types';
  import { Invoice, InvoiceItem } from 'linode-js-sdk/account/types';
  /**
   * getInvoices
   *
   * Retrieve a paginated list of invoices on your account.
   *
   */
  export const getInvoices: (params?: any, filter?: any) => Promise<ResourcePage<Invoice>>;
  /**
   * getInvoice
   *
   * Retrieve details for a single invoice.
   *
   * @param invoiceId { number } The ID of the invoice to be retrieved
   *
   */
  export const getInvoice: (invoiceId: number) => Promise<Invoice>;
  /**
   * getInvoiceItems
   *
   * Returns a paginated list of invoice items
   *
   * @param invoiceId { number } return items for an invoice with this ID
   *
   *
   */
  export const getInvoiceItems: (invoiceId: number, params?: any, filter?: any) => Promise<ResourcePage<InvoiceItem>>;

}
declare module 'linode-js-sdk/account/oauth' {
  import { ResourcePage } from 'linode-js-sdk/types';
  import { OAuthClient, OAuthClientRequest } from 'linode-js-sdk/account/types';
  /**
   * getOAuthClients
   *
   * Returns a paginated list of OAuth apps authorized on your account.
   *
   */
  export const getOAuthClients: (params?: any, filter?: any) => Promise<ResourcePage<OAuthClient>>;
  /**
   * getOAuthClient
   *
   * Returns a single authorized OAuth app
   *
   * @param clientId { number } the ID of the OAuth client to retrieve
   *
   */
  export const getOAuthClient: (clientId: number) => Promise<string>;
  /**
   * createOAuthClient
   *
   * Create a new authorized OAuth client. The creation endpoint
   * will return a secret used for authenticating with the new app.
   * This secret will not be returned on subsequent requests
   * (e.g. using getOAuthClient)
   *
   */
  export const createOAuthClient: (data: OAuthClientRequest) => Promise<OAuthClient & {
      secret: string;
  }>;
  /**
   * resetOAuthClientSecret
   *
   * Resets the OAuth Client secret for a client you own, and returns the OAuth Client
   * with the new secret in plaintext. This secret is not supposed to be publicly known
   * or disclosed anywhere. This can be used to generate a new secret in case the one
   * you have has been leaked, or to get a new secret if you lost the original.
   * The old secret is expired immediately, and logins to your client with the old secret will fail.
   *
   */
  export const resetOAuthClientSecret: (clientId: string | number) => Promise<OAuthClient & {
      secret: string;
  }>;
  /**
   * updateOAuthClient
   *
   * Update the label and/or redirect uri of your OAuth client.
   *
   * @param clientId { number } the ID of the client to be updated
   */
  export const updateOAuthClient: (clientId: string, data: Partial<OAuthClientRequest>) => Promise<OAuthClient>;
  /**
   * deleteOAuthClient
   *
   * Deletes an OAuth Client registered with Linode.
   * The Client ID and Client secret will no longer be accepted by
   * https://login.linode.com, and all tokens issued to this client
   * will be invalidated (meaning that if your application was using
   * a token, it will no longer work).
   *
   * @param clientId { number } ID of the client to be deleted
   *
   */
  export const deleteOAuthClient: (clientId: string | number) => import("axios").AxiosPromise<{}>;

}
declare module 'linode-js-sdk/account/payments' {
  import { ResourcePage } from 'linode-js-sdk/types';
  import { ExecutePayload, Payment, Paypal, SaveCreditCardData } from 'linode-js-sdk/account/types';
  /**
   * getPayments
   *
   * Retrieve a paginated list of the most recent payments made
   * on your account.
   *
   */
  export const getPayments: (params?: any, filter?: any) => Promise<ResourcePage<Payment>>;
  /**
   * makePayment
   *
   * Make a payment using the currently active credit card on your
   * account.
   *
   * @param data { object }
   * @param data.usd { string } the dollar amount of the payment
   * @param data.cvv { string } the 3-digit code on the back of the
   * credit card.
   *
   */
  export const makePayment: (data: {
      usd: string;
      cvv?: string | undefined;
  }) => Promise<Payment>;
  interface StagePaypalData {
      checkout_token: string;
      payment_id: string;
  }
  /**
   * stagePaypalPayment
   *
   * Begins the process of making a payment through Paypal.
   *
   * @param data { object }
   * @param data.cancel_url The URL to have PayPal redirect to when Payment is cancelled.
   * @param data.redirect_url The URL to have PayPal redirect to when Payment is approved.
   * @param data.usd { string } The dollar amount of the payment
   *
   * @returns a payment ID, used for submitting the payment to Paypal.
   *
   */
  export const stagePaypalPayment: (data: Paypal) => Promise<StagePaypalData>;
  /**
   * executePaypalPayment
   *
   * Executes a payment through Paypal that has been started with the
   * stagePaypalPayment method above. Paypal will capture the designated
   * funds and credit your Linode account.
   *
   * @param data { object }
   * @param data.payment_id The ID returned by stagePaypalPayment
   * @param data.payer_id The PayerID returned by PayPal during the transaction authorization process.
   *
   */
  export const executePaypalPayment: (data: ExecutePayload) => Promise<{}>;
  /**
   * saveCreditCard
   *
   * Add or update credit card information to your account. Only one
   * card is allowed per account, so this method will overwrite any
   * existing information.
   *
   */
  export const saveCreditCard: (data: SaveCreditCardData) => Promise<{}>;
  export {};

}
declare module 'linode-js-sdk/account/types' {
  export interface User {
      username: string;
      email: string;
      restricted: boolean;
      gravatarUrl?: string;
      ssh_keys: string[];
  }
  export interface Account {
      active_since: string;
      address_2: string;
      email: string;
      first_name: string;
      tax_id: string;
      credit_card: CreditCard;
      state: string;
      zip: string;
      address_1: string;
      country: string;
      last_name: string;
      balance: number;
      balance_uninvoiced: number;
      city: string;
      phone: string;
      company: string;
      active_promotions: ActivePromotion[];
      capabilities: AccountCapability[];
      euuid: string;
  }
  export type AccountCapability = 'Linodes' | 'NodeBalancers' | 'Block Storage' | 'Object Storage' | 'Kubernetes';
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
  }
  interface CreditCard {
      expiry: string;
      last_four: string;
      cvv: string;
  }
  export interface Invoice {
      id: number;
      date: string;
      label: string;
      total: number;
      tax: number;
      subtotal: number;
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
  }
  export interface Payment {
      id: number;
      date: string;
      usd: number;
  }
  export type GrantLevel = null | 'read_only' | 'read_write';
  export interface Grant {
      id: number;
      permissions: GrantLevel;
      label: string;
  }
  export type GlobalGrantTypes = 'add_linodes' | 'add_longview' | 'longview_subscription' | 'account_access' | 'cancel_account' | 'add_domains' | 'add_stackscripts' | 'add_nodebalancers' | 'add_images' | 'add_volumes';
  export interface GlobalGrants {
      global: Record<GlobalGrantTypes, boolean | GrantLevel>;
  }
  export type GrantType = 'linode' | 'domain' | 'nodebalancer' | 'image' | 'longview' | 'stackscript' | 'volume';
  export type Grants = GlobalGrants & Record<GrantType, Grant[]>;
  export interface NetworkUtilization {
      billable: number;
      used: number;
      quota: number;
  }
  export interface CancelAccount {
      survey_link: string;
  }
  export interface CancelAccountPayload {
      comments: string;
  }
  export type NotificationType = 'migration_scheduled' | 'migration_pending' | 'reboot_scheduled' | 'outage' | 'maintenance' | 'payment_due' | 'ticket_important' | 'ticket_abuse' | 'notice' | 'promotion';
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
      label: string;
      type: string;
      url: string;
  }
  export type EventAction = 'account_update' | 'account_settings_update' | 'backups_cancel' | 'backups_enable' | 'backups_restore' | 'community_like' | 'community_question_reply' | 'credit_card_updated' | 'disk_create' | 'disk_update' | 'disk_delete' | 'disk_duplicate' | 'disk_imagize' | 'disk_resize' | 'domain_create' | 'domain_update' | 'domain_delete' | 'domain_record_create' | 'domain_record_updated' | 'domain_record_delete' | 'firewall_create' | 'firewall_delete' | 'firewall_device_add' | 'firewall_device_remove' | 'firewall_disable' | 'firewall_enable' | 'firewall_update' | 'host_reboot' | 'image_update' | 'image_delete' | 'lassie_reboot' | 'linode_addip' | 'linode_boot' | 'linode_clone' | 'linode_create' | 'linode_update' | 'linode_delete' | 'linode_deleteip' | 'linode_migrate' | 'linode_reboot' | 'linode_resize' | 'linode_resize_create' | 'linode_migrate_datacenter_create' | 'linode_migrate_datacenter' | 'linode_mutate' | 'linode_mutate_create' | 'linode_rebuild' | 'linode_shutdown' | 'linode_snapshot' | 'linode_config_create' | 'linode_config_update' | 'linode_config_delete' | 'lke_node_create' | 'longviewclient_create' | 'longviewclient_delete' | 'longviewclient_update' | 'nodebalancer_config_create' | 'nodebalancer_config_update' | 'nodebalancer_config_delete' | 'nodebalancer_create' | 'nodebalancer_update' | 'nodebalancer_delete' | 'password_reset' | 'stackscript_create' | 'stackscript_update' | 'stackscript_delete' | 'stackscript_publicize' | 'stackscript_revise' | 'tfa_enabled' | 'tfa_disabled' | 'ticket_attachment_upload' | 'user_ssh_key_add' | 'user_ssh_key_update' | 'user_ssh_key_delete' | 'volume_create' | 'volume_update' | 'volume_delete' | 'volume_detach' | 'volume_attach' | 'volume_resize' | 'volume_clone';
  export type EventStatus = 'scheduled' | 'started' | 'finished' | 'failed' | 'notification';
  export interface Event {
      id: number;
      action: EventAction;
      created: string;
      entity: Entity | null;
      duration: number | null;
      percent_complete: number | null;
      rate: string | null;
      read: boolean;
      seen: boolean;
      status: EventStatus;
      time_remaining: null | number;
      username: string;
      secondary_entity: Entity | null;
      _initial?: boolean;
  }
  /**
   * Represents an event which has an entity. For use with type guards.
   * https://www.typescriptlang.org/docs/handbook/advanced-types.html
   */
  export interface EntityEvent extends Event {
      entity: Entity;
  }
  export interface SupportTicket {
      opened: string;
      id: number;
      closed: string | null;
      closable: boolean;
      description: string;
      entity: Entity | null;
      gravatar_id: string;
      attachments: string[];
      opened_by: string;
      status: 'closed' | 'new' | 'open';
      summary: string;
      updated: string;
      updated_by: string;
      gravatarUrl: string | undefined;
  }
  export interface OAuthClient {
      id: string;
      label: string;
      redirect_uri: string;
      thumbnail_url: string;
      public: boolean;
      status: 'disabled' | 'active' | 'suspended';
  }
  export interface OAuthClientRequest {
      label: string;
      redirect_uri: string;
      public?: boolean;
  }
  export interface Paypal {
      cancel_url: string;
      redirect_url: string;
      usd: string;
  }
  export interface ExecutePayload {
      payer_id: string;
      payment_id: string;
  }
  export interface SaveCreditCardData {
      card_number: string;
      expiry_year: number;
      expiry_month: number;
      cvv?: string;
  }
  export interface SupportReply {
      created: string;
      created_by: string;
      gravatar_id: string;
      description: string;
      id: number;
      from_linode: boolean;
      gravatarUrl: string | undefined;
  }
  export {};

}
declare module 'linode-js-sdk/account/users' {
  import { ResourcePage } from 'linode-js-sdk/types';
  import { Grants, User } from 'linode-js-sdk/account/types';
  /**
   * getUsers
   *
   * Returns a paginated list of users on this account.
   *
   */
  export const getUsers: (params?: any, filters?: any) => Promise<ResourcePage<User>>;
  /**
   * getUser
   *
   * Returns details about a single user.
   *
   * @param username { string } name of the user to be viewed.
   *
   */
  export const getUser: (username: string) => Promise<User>;
  /**
   * createUser
   *
   * Add a new user to your account.
   *
   * @param data { object }
   *
   */
  export const createUser: (data: Partial<User>) => Promise<User>;
  /**
   * updateUser
   *
   * Update a user's information.
   *
   * @param username { string } username of the user to be updated.
   * @param data { object } The fields of the user object to be updated.
   *
   */
  export const updateUser: (username: string, data: Partial<User>) => Promise<User>;
  /**
   * deleteUser
   *
   * Remove a single user from your account.
   *
   * @param username { string } username of the user to be deleted.
   *
   */
  export const deleteUser: (username: string) => Promise<{}>;
  /**
   * getGrants
   *
   * Returns the full grants structure for this User. This includes all entities on
   * the Account alongside what level of access this User has to each of them. Individual
   * users may view their own grants at the /profile/grants endpoint,
   * but will not see entities that they have no access to.
   *
   * @param username { number } the username to look up.
   *
   */
  export const getGrants: (username: string) => Promise<Grants>;
  /**
   * updateGrants
   *
   * Update the grants a User has. This can be used to give a User access
   * to new entities or actions, or take access away. You do not need to include
   * the grant for every entity on the Account in this request;
   * any that are not included will remain unchanged.
   *
   * @param username { number } ID of the client to be viewed.
   * @param data { object } the Grants object to update.
   *
   */
  export const updateGrants: (username: string, data: Partial<Grants>) => Promise<Grants>;

}
declare module 'linode-js-sdk/authentication/index' {
  import { Success } from 'linode-js-sdk/authentication/types';
  /**
   * Revokes auth token used to make HTTP requests
   *
   * @param { string } client_id - the ID of the client app
   * @param { string } token - the auth token used to make HTTP requests
   *
   */
  export const revokeToken: (client_id: string, token: string) => Promise<Success>;
  export { Success };

}
declare module 'linode-js-sdk/authentication/types' {
  export interface Success {
      success: true;
  }

}
declare module 'linode-js-sdk/constants' {
  export const API_ROOT = "https://api.linode.com/v4";
  export const LOGIN_ROOT = "https://login.linode.com";
  export const BETA_API_ROOT: string;
  export const MAX_VOLUME_SIZE = 10240;

}
declare module 'linode-js-sdk/domains/domains' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Domain } from 'linode-js-sdk/domains/types';
  /**
   * Returns a paginated list of Domains.
   *
   */
  export const getDomains: (params?: any, filters?: any) => Promise<Page<Domain>>;
  /**
   * Returns all of the information about a specified Domain.
   *
   * @param domainId { number } The ID of the Domain to access.
   */
  export const getDomain: (domainId: number) => Promise<Domain>;
  /**
   * Adds a new Domain to Linode's DNS Manager.
   *
   * @param data { object } Options for type, status, etc.
   */
  export const createDomain: (data: Partial<Domain>) => Promise<Domain>;
  /**
   * Update information about a Domain in Linode's DNS Manager.
   *
   * @param domainId { number } The ID of the Domain to access.
   * @param data { object } Options for type, status, etc.
   */
  export const updateDomain: (domainId: number, data: Partial<Domain>) => Promise<Domain>;
  /**
   * Deletes a Domain from Linode's DNS Manager. The Domain will be removed from Linode's nameservers shortly after this
   * operation completes. This also deletes all associated Domain Records.
   *
   * @param domainId { number } The ID of the Domain to delete.
   */
  export const deleteDomain: (domainId: number) => import("axios").AxiosPromise<{}>;
  /**
   * Clones a Domain.
   *
   * @param domainId { number } The ID of the Domain to clone.
   * @param cloneName { string } The name of the new domain.
   */
  export const cloneDomain: (domainId: number, cloneName: string) => Promise<Domain>;
  /**
   * Imports a domain zone from a remote nameserver.
   *
   * @param domain { string } The domain to import.
   * @param remote_nameserver { string } The remote nameserver that allows zone transfers (AXFR).
   */
  export const importZone: (domain: string, remote_nameserver: string) => Promise<Domain>;

}
declare module 'linode-js-sdk/domains/domains.schema' {
  export const importZoneSchema: import("yup").ObjectSchema<{
      domain: string;
      remote_nameserver: string;
  }>;
  export const createDomainSchema: import("yup").ObjectSchema<import("yup").Shape<import("yup").Shape<object, {
      domain: string;
      status: any;
      tags: unknown[];
      description: string;
      retry_sec: number;
      master_ips: string[];
      axfr_ips: string[];
      expire_sec: number;
      refresh_sec: number;
      ttl_sec: number;
  }>, {
      domain: string;
      type: any;
      soa_email: string;
  }>>;
  export const updateDomainSchema: import("yup").ObjectSchema<import("yup").Shape<import("yup").Shape<object, {
      domain: string;
      status: any;
      tags: unknown[];
      description: string;
      retry_sec: number;
      master_ips: string[];
      axfr_ips: string[];
      expire_sec: number;
      refresh_sec: number;
      ttl_sec: number;
  }>, {
      domainId: number;
      soa_email: string;
      axfr_ips: string[];
  }>>;

}
declare module 'linode-js-sdk/domains/index' {
  export * from 'linode-js-sdk/domains/domains';
  export * from 'linode-js-sdk/domains/records';
  export * from 'linode-js-sdk/domains/types';

}
declare module 'linode-js-sdk/domains/records' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { DomainRecord } from 'linode-js-sdk/domains/types';
  /**
   * Returns a paginated list of Records configured on a Domain in Linode's DNS Manager.
   *
   * @param domainId { number } The ID of the Domain we are accessing Records for.
   * @param params { object }
   */
  export const getDomainRecords: (domainId: number, params?: any) => Promise<Page<DomainRecord>>;
  /**
   * View a single Record on this Domain.
   *
   * @param domainId { number } The ID of the Domain whose Record you are accessing.
   * @param recordId { number } The ID of the Record you are accessing.
   */
  export const getDomainRecord: (domainId: number, recordId: number) => Promise<DomainRecord>;
  /**
   * Adds a new Domain Record to the zonefile this Domain represents.
   *
   * @param domainId { number } The ID of the Domain we are accessing Records for.
   * @param data { object } Options for type, name, etc.
   */
  export const createDomainRecord: (domainId: number, data: Partial<DomainRecord>) => Promise<DomainRecord>;
  /**
   * Updates a single Record on this Domain.
   *
   * @param domainId { number } The ID of the Domain we are accessing Records for.
   * @param recordId { number } The ID of the Record you are accessing.
   * @param data { object } Options for type, name, etc.
   */
  export const updateDomainRecord: (domainId: number, recordId: number, data: Partial<DomainRecord>) => Promise<DomainRecord>;
  /**
   * Deletes a Record on this Domain..
   *
   * @param domainId { number } The ID of the Domain whose Record you are deleting.
   * @param recordId { number } The ID of the Record you are deleting.
   */
  export const deleteDomainRecord: (domainId: number, recordId: number) => Promise<{}>;

}
declare module 'linode-js-sdk/domains/records.schema' {
  export const createRecordSchema: import("yup").ObjectSchema<import("yup").Shape<import("yup").Shape<object, {
      name: string;
      target: string;
      priority: number;
      weight: number;
      port: number;
      service: string | null;
      protocol: string | null;
      ttl_sec: number;
      tag: string;
  }>, {
      type: string;
  }>>;
  export const updateRecordSchema: import("yup").ObjectSchema<import("yup").Shape<import("yup").Shape<object, {
      name: string;
      target: string;
      priority: number;
      weight: number;
      port: number;
      service: string | null;
      protocol: string | null;
      ttl_sec: number;
      tag: string;
  }>, {
      type: string;
  }>>;

}
declare module 'linode-js-sdk/domains/types' {
  export interface Domain {
      id: number;
      domain: string;
      soa_email: string;
      description: string;
      refresh_sec: number;
      retry_sec: number;
      expire_sec: number;
      ttl_sec: number;
      status: DomainStatus;
      tags: string[];
      master_ips: string[];
      axfr_ips: string[];
      group: string;
      type: DomainType;
  }
  export type DomainStatus = 'active' | 'disabled' | 'edit_mode' | 'has_errors';
  export type DomainType = 'master' | 'slave';
  export type RecordType = 'A' | 'AAAA' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'PTR' | 'SRV' | 'TXT';
  export interface DomainRecord {
      id: number;
      name: string;
      port: number;
      priority: number;
      protocol: null | string;
      service: null | string;
      tag: null | string;
      target: string;
      ttl_sec: number;
      type: RecordType;
      weight: number;
  }
  export type CreateDomainPayload = Partial<Domain>;
  export type UpdateDomainPayload = Partial<Domain>;

}
declare module 'linode-js-sdk/firewalls/firewalls' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { CreateFirewallPayload, Firewall, FirewallDevice, FirewallDevicePayload, FirewallRules, UpdateFirewallPayload } from 'linode-js-sdk/firewalls/types';
  /**
   * getFirewalls
   *
   * Returns a paginated list of all Cloud Firewalls on this account.
   */
  export const getFirewalls: (params?: any, filters?: any) => Promise<Page<Firewall>>;
  /**
   * getFirewall
   *
   * Get a specific Firewall resource by its ID. The Firewall's Devices will not be
   * returned in the response. Use getFirewallDevices() to view the Devices.
   *
   */
  export const getFirewall: (firewallID: number) => Promise<Firewall>;
  /**
   * createFirewall
   *
   *  Creates a Firewall to filter network traffic. Use the `rules` property to
   *  create inbound and outbound access rules. Use the `devices` property to assign the
   *  Firewall to a Linode service.
   *  A Firewall can be assigned to multiple Linode services, and up to three active Firewalls
   *  can be assigned to a single Linode service. Additional disabled Firewalls can be
   *  assigned to a service, but they cannot be enabled if three other active Firewalls
   *  are already assigned to the same service.
   */
  export const createFirewall: (data: CreateFirewallPayload) => Promise<Firewall>;
  /**
   * updateFirewall
   *
   * Updates the Cloud Firewall with the provided ID. Only label, tags, and status can be updated
   * through this method.
   *
   */
  export const updateFirewall: (firewallID: number, data: UpdateFirewallPayload) => Promise<Firewall>;
  /**
   * enableFirewall
   *
   * Convenience method for enabling a Cloud Firewall. Calls updateFirewall internally
   * with { status: 'enabled' }
   *
   */
  export const enableFirewall: (firewallID: number) => Promise<Firewall>;
  /**
   * disableFirewall
   *
   * Convenience method for disabling a Cloud Firewall. Calls updateFirewall internally
   * with { status: 'disabled' }
   *
   */
  export const disableFirewall: (firewallID: number) => Promise<Firewall>;
  /**
   * deleteFirewall
   *
   * Deletes a single Cloud Firewall.
   *
   */
  export const deleteFirewall: (firewallID: number) => Promise<{}>;
  /**
   * getFirewallRules
   *
   * Returns the current set of rules for a single Cloud Firewall.
   */
  export const getFirewallRules: (firewallID: number, params?: any, filters?: any) => Promise<Page<FirewallRules>>;
  /**
   * updateFirewallRules
   *
   * Updates the inbound and outbound Rules for a Firewall. Using this endpoint will
   * replace all of a Firewall's ruleset with the Rules specified in your request.
   */
  export const updateFirewallRules: (firewallID: number, data: FirewallRules) => Promise<FirewallRules>;
  /**
   * getFirewallDevices
   *
   * Returns a paginated list of a Firewall's Devices. A Firewall Device assigns a
   * Firewall to a Linode service (referred to as the Device's `entity`).
   */
  export const getFirewallDevices: (firewallID: number, params?: any, filters?: any) => Promise<Page<FirewallDevice>>;
  /**
   * getFirewallDevice
   *
   * Returns information about a single Firewall Device. A Firewall Device assigns a
   * Firewall to a Linode service (referred to as the Device's `entity`).
   */
  export const getFirewallDevice: (firewallID: number, deviceID: number) => Promise<FirewallDevice>;
  /**
   * addFirewallDevice
   *
   *  Creates a Firewall Device, which assigns a Firewall to a Linode service (referred to
   *  as the Device's `entity`).
   *  A Firewall can be assigned to multiple Linode services, and up to three active Firewalls can
   *  be assigned to a single Linode service. Additional disabled Firewalls can be
   *  assigned to a service, but they cannot be enabled if three other active Firewalls
   *  are already assigned to the same service.
   *  Creating a Firewall Device will apply the Rules from a Firewall to a Linode service.
   *  A `firewall_device_add` Event is generated when the Firewall Device is added successfully.
   */
  export const addFirewallDevice: (firewallID: number, data: FirewallDevicePayload) => Promise<FirewallDevice>;
  /**
   * deleteFirewallDevice
   *
   *  Removes a Firewall Device, which removes a Firewall from the Linode service it was
   *  assigned to by the Device. This will remove all of the Firewall's Rules from the Linode
   *  service. If any other Firewalls have been assigned to the Linode service, then those Rules
   *  will remain in effect.
   */
  export const deleteFirewallDevice: (firewallID: number, deviceID: number) => Promise<{}>;

}
declare module 'linode-js-sdk/firewalls/firewalls.schema' {
  export const CreateFirewallDeviceSchema: import("yup").ObjectSchema<{
      linodes: number[];
      nodebalancers: number[];
  }>;
  export const FirewallRuleSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      inbound: unknown[];
      outbound: unknown[];
  }>>;
  export const CreateFirewallSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string;
      tags: string[];
      rules: import("yup").Shape<object, {
          inbound: any;
          outbound: any;
      }>;
  }>>;
  export const UpdateFirewallSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string;
      tags: string[];
      status: string;
  }>>;
  export const FirewallDeviceSchema: import("yup").ObjectSchema<{
      type: string;
      id: number;
  }>;

}
declare module 'linode-js-sdk/firewalls/index' {
  export * from 'linode-js-sdk/firewalls/types';
  export * from 'linode-js-sdk/firewalls/firewalls';
  export * from 'linode-js-sdk/firewalls/firewalls';

}
declare module 'linode-js-sdk/firewalls/types' {
  export type FirewallStatus = 'enabled' | 'disabled' | 'deleted';
  export type FirewallRuleProtocol = 'ALL' | 'TCP' | 'UDP' | 'ICMP';
  export type FirewallDeviceEntityType = 'linode' | 'nodebalancer';
  export interface Firewall {
      id: number;
      status: FirewallStatus;
      label: string;
      tags: string[];
      rules: FirewallRules;
      created_dt: string;
      updated_dt: string;
  }
  export interface FirewallRules {
      inbound?: FirewallRuleType[] | null;
      outbound?: FirewallRuleType[] | null;
  }
  export interface FirewallRuleType {
      protocol: FirewallRuleProtocol;
      ports: string;
      addresses?: null | {
          ipv4?: null | string[];
          ipv6?: null | string[];
      };
  }
  export interface FirewallDeviceEntity {
      id: number;
      type: FirewallDeviceEntityType;
      label: string;
      url: string;
  }
  export interface FirewallDevice {
      id: number;
      created: string;
      updated: string;
      entity: FirewallDeviceEntity;
  }
  export interface CreateFirewallPayload {
      label?: string;
      tags?: string[];
      rules: FirewallRules;
      devices?: {
          linodes?: number[];
          nodebalancers?: number[];
      };
  }
  export interface UpdateFirewallPayload {
      label?: string;
      tags?: string[];
      status?: Omit<FirewallStatus, 'deleted'>;
  }
  export interface FirewallDevicePayload {
      id: number;
      type: FirewallDeviceEntityType;
  }

}
declare module 'linode-js-sdk/images/images' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Image } from 'linode-js-sdk/images/types';
  /**
   * Get information about a single Image.
   *
   * @param imageId { string } ID of the Image to look up.
   */
  export const getImage: (imageId: string) => Promise<Image>;
  /**
   * Returns a paginated list of Images.
   *
   */
  export const getImages: (params?: any, filters?: any) => Promise<Page<Image>>;
  /**
   * Create a private gold-master Image from a Linode Disk.
   *
   * @param diskId { number } The ID of the Linode Disk that this Image will be created from.
   * @param label { string } A short description of the Image. Labels cannot contain special characters.
   * @param description { string } A detailed description of this Image.
   */
  export const createImage: (diskId: number, label?: string | undefined, description?: string | undefined) => import("axios").AxiosPromise<Image>;
  /**
   * Updates a private Image that you have permission to read_write.
   *
   * @param imageId { string } ID of the Image to look up.
   * @param label { string } A short description of the Image. Labels cannot contain special characters.
   * @param description { string } A detailed description of this Image.
   */
  export const updateImage: (imageId: string, label?: string | undefined, description?: string | undefined) => import("axios").AxiosPromise<Image>;
  /**
   * Delete a private Image you have permission to read_write.
   *
   * @param imageId { string } the ID of the image to delete
   */
  export const deleteImage: (imageId: string) => import("axios").AxiosPromise<{}>;

}
declare module 'linode-js-sdk/images/images.schema' {
  export const createImageSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      disk_id: number;
      label: string | undefined;
      description: string | undefined;
  }>>;
  export const updateImageSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string | undefined;
      description: string | undefined;
  }>>;

}
declare module 'linode-js-sdk/images/index' {
  export * from 'linode-js-sdk/images/types';
  export * from 'linode-js-sdk/images/images';
  export * from 'linode-js-sdk/images/images';

}
declare module 'linode-js-sdk/images/types' {
  export interface Image {
      id: string;
      label: string;
      description: string | null;
      created: string;
      type: string;
      is_public: boolean;
      size: number;
      created_by: null | string;
      vendor: string | null;
      deprecated: boolean;
      expiry: null | string;
  }
  export interface CreateImagePayload {
      diskID: number;
      label?: string;
      description?: string;
  }

}
declare module 'linode-js-sdk/index' {
  export * from 'linode-js-sdk/account/index';
  export * from 'linode-js-sdk/domains/index';
  export * from 'linode-js-sdk/firewalls/index';
  export * from 'linode-js-sdk/images/index';
  export * from 'linode-js-sdk/kubernetes/index';
  export * from 'linode-js-sdk/linodes/index';
  export * from 'linode-js-sdk/longview/index';
  export * from 'linode-js-sdk/managed/index';
  export * from 'linode-js-sdk/networking/index';
  export * from 'linode-js-sdk/object-storage/index';
  export * from 'linode-js-sdk/profile/index';
  export * from 'linode-js-sdk/regions/index';
  export * from 'linode-js-sdk/stackscripts/index';
  export * from 'linode-js-sdk/support/index';
  export * from 'linode-js-sdk/tags/index';
  export * from 'linode-js-sdk/volumes/index';
  export { baseRequest } from 'linode-js-sdk/request';

}
declare module 'linode-js-sdk/kubernetes/index' {
  export * from 'linode-js-sdk/kubernetes/kubernetes';
  export * from 'linode-js-sdk/kubernetes/kubernetes';
  export * from 'linode-js-sdk/kubernetes/nodePools';
  export * from 'linode-js-sdk/kubernetes/types';

}
declare module 'linode-js-sdk/kubernetes/kubernetes' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { CreateKubeClusterPayload, KubeConfigResponse, KubernetesCluster, KubernetesEndpointResponse, KubernetesVersion } from 'linode-js-sdk/kubernetes/types';
  /**
   * getKubernetesClusters
   *
   * Gets a list of a user's Kubernetes clusters
   */
  export const getKubernetesClusters: (params?: any, filters?: any) => Promise<Page<KubernetesCluster>>;
  /**
   * getKubernetesCluster
   *
   * Return details about a single Kubernetes cluster
   */
  export const getKubernetesCluster: (clusterID: number) => Promise<KubernetesCluster>;
  /**
   * createKubernetesClusters
   *
   * Create a new Cluster.
   */
  export const createKubernetesCluster: (data: CreateKubeClusterPayload) => Promise<KubernetesCluster>;
  /**
   * updateKubernetesCluster
   *
   * Create a new Cluster.
   */
  export const updateKubernetesCluster: (clusterID: number, data: Partial<KubernetesCluster>) => Promise<KubernetesCluster>;
  /**
   * deleteKubernetesCluster
   *
   * Delete the specified Cluster.
   */
  export const deleteKubernetesCluster: (clusterID: number) => Promise<{}>;
  /** getKubeConfig
   *
   * Returns a base64 encoded string of a cluster's kubeconfig.yaml
   *
   * @param clusterId
   */
  export const getKubeConfig: (clusterId: number) => Promise<KubeConfigResponse>;
  /** getKubernetesVersions
   *
   * Returns a paginated list of available Kubernetes versions.
   *
   */
  export const getKubernetesVersions: () => Promise<Page<KubernetesVersion>>;
  /** getKubernetesVersion
   *
   * Returns a single Kubernetes version by ID.
   *
   */
  export const getKubernetesVersion: (versionID: string) => Promise<KubernetesVersion>;
  /** getKubernetesClusterEndpoint
   *
   * Returns the endpoint URL for a single Kubernetes cluster by ID.
   *
   */
  export const getKubernetesClusterEndpoint: (clusterID: number) => Promise<KubernetesEndpointResponse>;

}
declare module 'linode-js-sdk/kubernetes/kubernetes.schema' {
  export const nodePoolSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      type: string;
      count: number;
  }>>;
  export const clusterLabelSchema: import("yup").StringSchema<string | undefined>;
  export const createKubeClusterSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string | undefined;
      region: string;
      version: string;
      node_pools: import("yup").Shape<object, {
          type: any;
          count: any;
      }>[];
  }>>;

}
declare module 'linode-js-sdk/kubernetes/nodePools' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { KubeNodePoolResponse, PoolNodeRequest } from 'linode-js-sdk/kubernetes/types';
  /**
   * getNodePools
   *
   * Gets a list of all node pools associated with the specified cluster
   */
  export const getNodePools: (clusterID: number, params?: any, filters?: any) => Promise<Page<KubeNodePoolResponse>>;
  /**
   * getNodePool
   *
   * Returns a single node pool
   */
  export const getNodePool: (clusterID: number, nodePoolID: number) => Promise<KubeNodePoolResponse>;
  /**
   * createNodePool
   *
   * Adds a node pool to the specified cluster.
   */
  export const createNodePool: (clusterID: number, data: PoolNodeRequest) => Promise<KubeNodePoolResponse>;
  /**
   * updateNodePool
   *
   * Change the type or count of a node pool
   */
  export const updateNodePool: (clusterID: number, nodePoolID: number, data: PoolNodeRequest) => Promise<KubeNodePoolResponse>;
  /**
   * deleteNodePool
   *
   * Delete a single node pool from the specified Cluster.
   */
  export const deleteNodePool: (clusterID: number, nodePoolID: number) => Promise<{}>;

}
declare module 'linode-js-sdk/kubernetes/types' {
  export interface KubernetesCluster {
      created: string;
      region: string;
      status: string;
      label: string;
      version: string;
      id: number;
  }
  export interface KubeNodePoolResponse {
      count: number;
      id: number;
      nodes: PoolNodeResponse[];
      type: string;
  }
  export interface PoolNodeResponse {
      id: string;
      instance_id: number | null;
      status: string;
  }
  export interface PoolNodeRequest {
      type: string;
      count: number;
  }
  export interface KubeConfigResponse {
      kubeconfig: string;
  }
  export interface KubernetesVersion {
      id: string;
  }
  export interface KubernetesEndpointResponse {
      endpoints: string[];
  }
  export interface CreateKubeClusterPayload {
      label?: string;
      region?: string;
      node_pools: PoolNodeRequest[];
      version?: string;
  }

}
declare module 'linode-js-sdk/linodes/actions' {
  import { Linode, LinodeCloneData, RebuildRequest } from 'linode-js-sdk/linodes/types';
  /**
   * linodeBoot
   *
   * Boots a Linode you have permission to modify.
   * If no parameters are given, a Config profile will be
   * chosen for this boot based on the following criteria:
   * - If there is only one Config profile for this Linode, it will be used.
   * - If there is more than one Config profile, the last booted config will be used.
   * - If there is more than one Config profile and none were the last to be booted
   *  (because the Linode was never booted or the last booted config was deleted)
   *  an error will be returned.
   *
   * @param linodeId { number } The id of the Linode to boot.
   * @param config_id { number } the ID of the configuration profile to boot from.
   */
  export const linodeBoot: (linodeId: string | number, config_id?: number | undefined) => import("axios").AxiosPromise<{}>;
  /**
   * linodeReboot
   *
   * Reboots a Linode you have permission to modify.
   * If any actions are currently running or queued,
   * those actions must be completed first before you can initiate a reboot.
   *
   * @param linodeId { number } The id of the Linode to reboot.
   * @param config_id { number } the ID of the configuration profile to boot from.
   */
  export const linodeReboot: (linodeId: string | number, config_id?: number | undefined) => import("axios").AxiosPromise<{}>;
  /**
   * linodeShutdown
   *
   * Shuts down a Linode you have permission to modify.
   * If any actions are currently running or queued,
   * those actions must be completed first before you can initiate a shutdown.
   *
   * @param linodeId { number } The id of the Linode to shut down.
   */
  export const linodeShutdown: (linodeId: string | number) => import("axios").AxiosPromise<{}>;
  /**
   * resizeLinode
   *
   * Resizes a Linode to a different Type. You must have read_write
   * permission on the target Linode to use this endpoint. If resizing
   * to a smaller Type, the Linode must not have more disk allocation
   * than the new Type allows.
   *
   * @param linodeId { number } The id of the Linode to resize.
   * @param type { string } the new size of the Linode
   * @param auto_resize_linode { boolean } do you want to resize your disks after
   * the Linode is resized? NOTE: Unless the user has 1 ext disk or 1 ext disk and
   * 1 swap disk, this flag does nothing, regardless of whether it's true or false
   */
  export const resizeLinode: (linodeId: number, type: string, allow_auto_disk_resize?: boolean) => import("axios").AxiosPromise<{}>;
  /**
   * rebuildLinode
   *
   * Rebuilds a Linode you have permission to modify.
   * A rebuild will first shut down the Linode,
   * delete all disks and configs on the Linode,
   * and then deploy a new image to the Linode with the given attributes.
   *
   * @param linodeId { number } The id of the Linode to rebuild.
   * @param data { object }
   * @param data.image { string } the image to be deployed during rebuild.
   * @param data.root_pass { string } the new root password for the default Linode disk
   * @param data.authorized_users { Array(string) } A list of usernames that will have their SSH keys, if any,
   * automatically appended to the root user's authorized keys file.
   */
  export const rebuildLinode: (linodeId: number, data: RebuildRequest) => Promise<{}>;
  /**
   * rescueLinode
   *
   * Boots the Linode into Rescue Mode, a safe environment
   * for performing many system recovery and disk management tasks.
   * Rescue Mode is based on the Finnix recovery distribution, a self-contained
   * and bootable Linux distribution. You can also use Rescue Mode for tasks
   * other than disaster recovery, such as formatting disks to use different
   * filesystems, copying data between disks, and downloading files from a
   * disk via SSH and SFTP.
   *
   * @param linodeId { number } The id of the Linode to boot into rescue mode.
   * @param devices { object } device assignments to be used in rescue mode.
   */
  export const rescueLinode: (linodeId: number, devices: Pick<import("linode-js-sdk/linodes/types").Devices, "sda" | "sdb" | "sdc" | "sdd" | "sde" | "sdf" | "sdg">) => Promise<{}>;
  /**
   * cloneLinode
   *
   * You can clone your Linode's existing Disks or Configuration profiles to another
   * Linode on your Account. In order for this request to complete successfully,
   * your User must have the add_linodes grant. Cloning to a new Linode will
   * incur a charge on your Account. If cloning to an existing Linode, any actions
   * currently running or queued must be completed first before you can clone to it.
   *
   * @param linodeId { number } The id of the Linode to be cloned.
   */
  export const cloneLinode: (sourceLinodeId: number, data: LinodeCloneData) => Promise<Linode>;
  /**
   * startMutation
   *
   * Linodes created with now-deprecated Types are entitled to a free upgrade
   * to the next generation. A mutating Linode will be allocated any new resources
   * the upgraded Type provides, and will be subsequently restarted if it was currently running.
   * If any actions are currently running or queued, those actions must be completed
   * first before you can initiate a mutate.
   *
   * @param linodeId { number } The id of the Linode to be upgraded.
   */
  export const startMutation: (linodeID: number) => Promise<{}>;
  /**
   * scheduleOrQueueMigration
   *
   * Schedules a pending migration (if one is present on the Linode),
   * or immediately moves a scheduled migration into the migration queue.
   *
   * @param linodeId { number } The id of the Linode to be migrated.
   */
  export const scheduleOrQueueMigration: (linodeID: number, payload?: {
      region: string;
  } | undefined) => import("axios").AxiosPromise<{}>;

}
declare module 'linode-js-sdk/linodes/backups' {
  import { LinodeBackup, LinodeBackupsResponse } from 'linode-js-sdk/linodes/types';
  /**
   * getLinodeBackups
   *
   * Returns information about this Linode's available backups.
   *
   * @param linodeId { number } The id of a Linode with backups enabled.
   */
  export const getLinodeBackups: (id: number) => Promise<LinodeBackupsResponse>;
  /**
   * enableBackups
   *
   * Enable backups service for a single Linode.
   *
   * @param linodeId { number } The id of the Linode to enable backup services for.
   */
  export const enableBackups: (linodeId: number) => import("axios").AxiosPromise<{}>;
  /**
   * cancelBackups
   *
   * Cancel backups service for the specified Linode.
   *
   * @param linodeId { number } The id of a Linode with backups enabled.
   */
  export const cancelBackups: (linodeId: number) => import("axios").AxiosPromise<{}>;
  /**
   * takeSnapshot
   *
   * Creates a snapshot Backup of a Linode. If you already have a snapshot
   * of this Linode, this is a destructive action. The previous snapshot will be deleted.
   *
   * @param linodeId { number } The id of the Linode to retrieve.
   * @param label { string } A label to identify the new snapshot.
   */
  export const takeSnapshot: (linodeId: number, label: string) => import("axios").AxiosPromise<LinodeBackup>;
  /**
   * restoreBackup
   *
   * Restores a Linode's Backup to the specified Linode.
   *
   * @param linodeId { number } The id of the Linode that the backup belongs to.
   * @param backupId { number } The id of the backup to restore from.
   * @param targetLinodeId { number } The id of the Linode to restore the backup to.
   * @param overwrite: { boolean } If True, deletes all Disks and Configs on the
   * target Linode before restoring.
   */
  export const restoreBackup: (linodeId: number, backupId: number, targetLinodeId: number, overwrite: boolean) => Promise<{}>;

}
declare module 'linode-js-sdk/linodes/configs' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Config, LinodeConfigCreationData } from 'linode-js-sdk/linodes/types';
  /**
   * getLinodeConfigs
   *
   * Lists Configuration profiles associated with the specified Linode.
   *
   * @param linodeId { number } The id of the Linode to list configs for.
   * @todo VolumeAttachmentDrawer, ConfigSelect, and LinodeConfigs all make use of this still, and probably shouldnt.
   */
  export const getLinodeConfigs: (linodeId: number, params?: any, filters?: any) => Promise<Page<Config>>;
  /**
   * getLinodeConfig
   *
   * Returns information about a single Linode configuration.
   *
   * @param linodeId { number } The id of a Linode the specified config is attached to.
   * @param configId { number } The id of the config to be returned
   */
  export const getLinodeConfig: (linodeId: number, configId: number) => Promise<Config>;
  /**
   * createLinodeConfig
   *
   * Adds a new Configuration profile to a Linode.
   *
   * @param linodeId { number } The id of a Linode to receive the new config.
   */
  export const createLinodeConfig: (linodeId: number, data: LinodeConfigCreationData) => Promise<Config>;
  /**
   * deleteLinodeConfig
   *
   * Delete a single configuration profile from a Linode.
   *
   * @param linodeId { number } The id of a Linode the specified config is attached to.
   * @param configId { number } The id of the config to be deleted
   */
  export const deleteLinodeConfig: (linodeId: number, configId: number) => Promise<{}>;
  /**
   * updateLinodeConfig
   *
   * Update a configuration profile.
   *
   * @param linodeId { number } The id of a Linode the specified config is attached to.
   * @param configId { number } The id of the config to be updated.
   */
  export const updateLinodeConfig: (linodeId: number, configId: number, data: Partial<LinodeConfigCreationData>) => Promise<Config>;

}
declare module 'linode-js-sdk/linodes/disks' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Disk, LinodeDiskCreationData } from 'linode-js-sdk/linodes/types';
  /**
   * getLinodeDisks
   *
   * Returns a paginated list of disks associated with the specified Linode.
   *
   * @param linodeId { number } The id of the Linode to list disks for.
   */
  export const getLinodeDisks: (linodeId: number, params?: any, filter?: any) => Promise<Page<Disk>>;
  /**
   * createLinodeDisk
   *
   * Lists Configuration profiles associated with the specified Linode.
   *
   * @param linodeId { number } The id of the Linode to list configs for.
   */
  export const createLinodeDisk: (linodeId: number, data: LinodeDiskCreationData) => Promise<Disk>;
  /**
   * getLinodeDisk
   *
   * Retrieve detailed information about a single Disk.
   *
   * @param linodeId { number } The id of the Linode containing the disk to be viewed.
   * @param diskId { number } The id of the disk to be viewed.
   */
  export const getLinodeDisk: (linodeId: number, diskId: number) => Promise<Disk>;
  /**
   * updateLinodeDisk
   *
   * Update settings for a disk. Fields not specified will be left unchanged.
   *
   * @param linodeId { number } The id of the Linode containing the disk to be updated.
   * @param diskId { number } The id of the disk to be updated.
   */
  export const updateLinodeDisk: (linodeId: number, diskId: number, data: Pick<LinodeDiskCreationData, "label">) => Promise<Disk>;
  /**
   * resizeLinodeDisk
   *
   * Resizes a Disk you have permission to read_write.
   * The Linode this Disk is attached to must be shut down for resizing to take effect.
   * If you are resizing the Disk to a smaller size, it cannot be made smaller than
   * what is required by the total size of the files current on the Disk.
   * The Disk must not be in use. If the Disk is in use, the request will
   * succeed but the resize will ultimately fail.
   *
   * @param linodeId { number } The id of the Linode containing the disk to be resized.
   * @param diskId { number } The id of the disk to be resized.
   * @param size { number } The intended size of the disk (in MB).
   */
  export const resizeLinodeDisk: (linodeId: number, diskId: number, size: number) => import("axios").AxiosPromise<Disk>;
  /**
   * cloneLinodeDisk
   *
   * Clones (duplicates) a Disk on an individual Linode.
   * @param linodeId { number } The id of the Linode containing the disk to be resized.
   * @param diskId { number } The id of the disk to be resized.
   */
  export const cloneLinodeDisk: (linodeId: number, diskId: number) => Promise<Disk>;
  /**
   * deleteLinodeDisk
   *
   * Deletes a Disk you have permission to read_write.
   *
   * @param linodeId { number } The id of the Linode containing the disk to be deleted.
   * @param diskId { number } The id of the disk to be deleted.
   */
  export const deleteLinodeDisk: (linodeId: number, diskId: number) => Promise<{}>;
  /**
   * changeLinodeDiskPassword
   *
   * Resets the password of a Disk you have permission to read_write.
   *
   * @param linodeId { number } The id of the Linode containing the target disk.
   * @param diskId { number } The id of the target disk.
   * @param password { string } The new disk password.
   */
  export const changeLinodeDiskPassword: (linodeId: number, diskId: number, password: string) => Promise<Disk>;

}
declare module 'linode-js-sdk/linodes/index' {
  export * from 'linode-js-sdk/linodes/actions';
  export * from 'linode-js-sdk/linodes/backups';
  export * from 'linode-js-sdk/linodes/configs';
  export * from 'linode-js-sdk/linodes/disks';
  export * from 'linode-js-sdk/linodes/info';
  export * from 'linode-js-sdk/linodes/ips';
  export * from 'linode-js-sdk/linodes/linodes';
  export * from 'linode-js-sdk/linodes/linodes';
  export * from 'linode-js-sdk/linodes/types';

}
declare module 'linode-js-sdk/linodes/info' {
  import { NetworkUtilization } from 'linode-js-sdk/account/types';
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Kernel, LinodeType as Type, Stats } from 'linode-js-sdk/linodes/types';
  /**
   * getLinodeStats
   *
   * Returns CPU, IO, IPv4, and IPv6 statistics for your Linode for the past 24 hours.
   *
   * @param linodeId { number } The id of the Linode to retrieve stats data for.
   */
  export const getLinodeStats: (linodeId: number) => Promise<Stats>;
  /**
   * getLinodeStats
   *
   * Returns CPU, IO, IPv4, and IPv6 statistics for a specific month.
   * The year/month values must be either a date in the past, or the current month.
   * If the current month, statistics will be retrieved for the past 30 days.
   *
   * @param linodeId { number } The id of the Linode to retrieve stats data for.
   * @param year { number }
   * @param month { number }
   */
  export const getLinodeStatsByDate: (linodeId: number, year: string, month: string) => Promise<Stats>;
  /**
   * getLinodeTransfer
   *
   * Returns current network transfer information for your Linode.
   *
   * @param linodeId { number } The id of the Linode to retrieve network transfer information for.
   */
  export const getLinodeTransfer: (linodeId: number) => Promise<NetworkUtilization>;
  /**
   * getLinodeKernels
   *
   * Returns a paginated list of available kernels.
   * This endpoint does not require authentication.
   *
   */
  export const getLinodeKernels: (params?: any, filter?: any) => Promise<Page<Kernel>>;
  /**
   * getLinodeKernel
   *
   * Returns detailed information about a single Kernel.
   * This endpoint does not require authentication.
   *
   * @param kernelId { number } The id of the kernel to retrieve.
   */
  export const getLinodeKernel: (kernelId: string) => Promise<Page<Kernel>>;
  /**
   * getLinodeTypes
   *
   * Return a paginated list of available Linode types.
   * This endpoint does not require authentication.
   */
  export const getLinodeTypes: () => Promise<Page<Type>>;
  /**
   * getType
   *
   * View details for a single Linode type.
   * This endpoint does not require authentication.
   *
   * @param typeId { number } The id of the Linode type to retrieve.
   */
  export const getType: (typeId: string) => Promise<Type>;
  /**
   * getDeprecatedLinodeTypes
   *
   * Returns a list of deprecated Types that are no longer
   * supported. This endpoint does not require authentication.
   *
   */
  export const getDeprecatedLinodeTypes: () => Promise<Page<Type>>;

}
declare module 'linode-js-sdk/linodes/ips' {
  import { IPAddress } from 'linode-js-sdk/networking/types';
  import { IPAllocationRequest, LinodeIPsResponse } from 'linode-js-sdk/linodes/types';
  /**
   * getLinodeIPs
   *
   * Return a list of IP addresses allocated to this Linode.
   *
   * @param linodeId { number } The id of the Linode whose addresses you would like to retrieve.
   */
  export const getLinodeIPs: (id: number) => Promise<LinodeIPsResponse>;
  /**
   * allocateIPAddress
   *
   * Allocates a public or private IPv4 address to a Linode
   *
   * @param linodeId { number } The id of the Linode to receive a new IP address.
   * @param data { object }
   * @param data.type { string } Must be "ipv4", as currently only IPv4 addresses can be allocated.
   * @param data.public { boolean } True for a public IP address, false for a private address.
   */
  export const allocateIPAddress: (linodeID: number, data: IPAllocationRequest) => Promise<IPAddress>;
  /**
   * removeIPAddress
   *
   * Deletes a Linode's public IP Address. This request will fail if this is the last IP
   * address allocated to the Linode. This request cannot be invoked on a private IP Address
   *
   * @param {linodeID: number, IPAddress: string} payload - the linode ID and IP Address for
   * which you'd like the delete request to be invoked
   */
  export const removeIPAddress: (payload: {
      linodeID: number;
      IPAddress: string;
  }) => import("axios").AxiosPromise<{}>;

}
declare module 'linode-js-sdk/linodes/linodes' {
  import { DeepPartial, ResourcePage as Page } from 'linode-js-sdk/types';
  import { Volume } from 'linode-js-sdk/volumes/types';
  import { CreateLinodeRequest, Linode } from 'linode-js-sdk/linodes/types';
  /**
   * getLinode
   *
   * View details for a single Linode.
   *
   * @param linodeId { number } The id of the Linode to retrieve.
   */
  export const getLinode: (linodeId: number) => import("axios").AxiosPromise<Linode>;
  /**
   * getLinodeLishToken
   *
   * Generates a token which can be used to authenticate with LISH.
   *
   * @param linodeId { number } The id of the Linode.
   */
  export const getLinodeLishToken: (linodeId: number) => import("axios").AxiosPromise<{
      lish_token: string;
  }>;
  /**
   * getLinodeVolumes
   *
   * Returns a paginated list of Block Storage volumes attached to the
   * specified Linode.
   *
   * @param linodeId { number } The id of the Linode.
   */
  export const getLinodeVolumes: (linodeId: number, params?: any, filter?: any) => Promise<Page<Volume>>;
  /**
   * getLinodes
   *
   * Returns a paginated list of Linodes on your account.
   *
   * @param linodeId { number } The id of the Linode.
   */
  export const getLinodes: (params?: any, filter?: any) => Promise<Page<Linode>>;
  /**
   * createLinode
   *
   * Create a new Linode. The authenticating user must have the
   * add_linodes grant in order to use this endpoint.
   *
   * @param data { object } Options for type, region, etc.
   *
   * @returns the newly created Linode object.
   */
  export const createLinode: (data: CreateLinodeRequest) => Promise<Linode>;
  /**
   * updateLinode
   *
   * Generates a token which can be used to authenticate with LISH.
   *
   * @param linodeId { number } The id of the Linode to be updated.
   * @param values { object } the fields of the Linode object to be updated.
   * Fields not included in this parameter will be left unchanged.
   */
  export const updateLinode: (linodeId: number, values: DeepPartial<Linode>) => Promise<Linode>;
  /**
   * deleteLinode
   *
   * Delete the specified Linode instance.
   *
   * @param linodeId { number } The id of the Linode to be deleted.
   */
  export const deleteLinode: (linodeId: number) => import("axios").AxiosPromise<{}>;

}
declare module 'linode-js-sdk/linodes/linodes.schema' {
  export const ResizeLinodeDiskSchema: import("yup").ObjectSchema<{
      size: number;
  }>;
  export const CreateLinodeSchema: import("yup").ObjectSchema<{
      type: string;
      region: string;
      stackscript_id: number | undefined;
      backup_id: number | undefined;
      swap_size: number | undefined;
      image: string | undefined;
      root_pass: string | undefined;
      authorized_keys: string[] | undefined;
      backups_enabled: boolean | undefined;
      stackscript_data: import("yup").Ref[] | null;
      booted: boolean | undefined;
      label: string | undefined;
      tags: string[] | undefined;
      private_ip: boolean | undefined;
      authorized_users: string[] | undefined;
  }>;
  export const UpdateLinodeSchema: import("yup").ObjectSchema<{
      label: string | undefined;
      tags: string[] | undefined;
      watchdog_enabled: boolean | undefined;
      alerts: {
          cpu: any;
          network_in: any;
          network_out: any;
          transfer_quota: any;
          io: any;
      } | undefined;
      backups: {
          schedule: any;
          enabled: any;
      };
  }>;
  export const RebuildLinodeSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      image: string;
      root_pass: string;
      authorized_keys: {
          id: any;
          label: any;
          ssh_key: any;
          created: any;
      }[];
      authorized_users: string[];
      stackscript_id: number | undefined;
      stackscript_data: import("yup").Ref[] | null;
      booted: boolean | undefined;
  }>>;
  export const RebuildLinodeFromStackScriptSchema: import("yup").ObjectSchema<import("yup").Shape<import("yup").Shape<object, {
      image: string;
      root_pass: string;
      authorized_keys: {
          id: any;
          label: any;
          ssh_key: any;
          created: any;
      }[];
      authorized_users: string[];
      stackscript_id: number | undefined;
      stackscript_data: import("yup").Ref[] | null;
      booted: boolean | undefined;
  }>, {
      stackscript_id: number;
  }>>;
  export const IPAllocationSchema: import("yup").ObjectSchema<{
      type: string;
      public: boolean;
  }>;
  export const CreateSnapshotSchema: import("yup").ObjectSchema<{
      label: string;
  }>;
  export const CreateLinodeConfigSchema: import("yup").ObjectSchema<{
      label: string;
      devices: {
          sda: any;
          sdb: any;
          sdc: any;
          sdd: any;
          sde: any;
          sdf: any;
          sdg: any;
          sdh: any;
      };
      kernel: string;
      comments: string;
      memory_limit: number;
      run_level: any;
      virt_mode: any;
      helpers: {
          updatedb_disabled: any;
          distro: any;
          modules_dep: any;
          network: any;
          devtmpfs_automount: any;
      };
      root_device: string;
  }>;
  export const UpdateLinodeConfigSchema: import("yup").ObjectSchema<{
      label: string;
      devices: {
          sda: any;
          sdb: any;
          sdc: any;
          sdd: any;
          sde: any;
          sdf: any;
          sdg: any;
          sdh: any;
      };
      kernel: string;
      comments: string;
      memory_limit: number;
      run_level: any;
      virt_mode: any;
      helpers: {
          updatedb_disabled: any;
          distro: any;
          modules_dep: any;
          network: any;
          devtmpfs_automount: any;
      };
      root_device: string;
  }>;
  export const CreateLinodeDiskSchema: import("yup").ObjectSchema<{
      size: number;
      label: string;
      filesystem: any;
      read_only: boolean;
      image: string;
      authorized_keys: string[];
      authorized_users: string[];
      root_pass: string;
      stackscript_id: number;
      stackscript_data: import("yup").Ref[] | null;
  }>;

}
declare module 'linode-js-sdk/linodes/types' {
  import { IPAddress, IPRange } from 'linode-js-sdk/networking/types';
  import { SSHKey } from 'linode-js-sdk/profile/types';
  export type Hypervisor = 'kvm' | 'zen';
  export interface LinodeSpecs {
      disk: number;
      memory: number;
      vcpus: number;
      transfer: number;
      gpus: number;
  }
  export interface Linode {
      id: number;
      alerts: LinodeAlerts;
      backups: LinodeBackups;
      created: string;
      region: string;
      image: string | null;
      group: string;
      ipv4: string[];
      ipv6: string | null;
      label: string;
      type: null | string;
      status: LinodeStatus;
      updated: string;
      hypervisor: Hypervisor;
      specs: LinodeSpecs;
      watchdog_enabled: boolean;
      tags: string[];
  }
  export interface LinodeAlerts {
      cpu: number;
      io: number;
      network_in: number;
      network_out: number;
      transfer_quota: number;
  }
  export interface LinodeBackups {
      enabled: boolean;
      schedule: LinodeBackupSchedule;
      last_successful: string | null;
  }
  export type Window = 'Scheduling' | 'W0' | 'W2' | 'W4' | 'W8' | 'W10' | 'W12' | 'W14' | 'W16' | 'W18' | 'W20' | 'W22';
  export type Day = 'Scheduling' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  export interface LinodeBackupSchedule {
      window: Window | null;
      day: Day | null;
  }
  export interface LinodeBackupsResponse {
      automatic: LinodeBackup[];
      snapshot: {
          current: LinodeBackup | null;
          in_progress: LinodeBackup | null;
      };
  }
  export type Filesystem = 'raw' | 'swap' | 'ext4' | 'ext3' | 'initrd';
  export interface LinodeBackupDisk {
      size: number;
      label: string;
      filesystem: Filesystem;
  }
  export interface LinodeBackup {
      id: number;
      label: string | null;
      status: LinodeBackupStatus;
      type: LinodeBackupType;
      region: string;
      created: string;
      updated: string;
      finished: string;
      configs: string[];
      disks: LinodeBackupDisk[];
  }
  export type LinodeBackupType = 'auto' | 'snapshot';
  export type LinodeBackupStatus = 'pending' | 'running' | 'paused' | 'needsPostProcessing' | 'successful' | 'failed' | 'userAborted';
  export interface LinodeIPsResponse {
      ipv4: LinodeIPsResponseIPV4;
      ipv6?: LinodeIPsResponseIPV6;
  }
  export interface LinodeIPsResponseIPV4 {
      public: IPAddress[];
      private: IPAddress[];
      shared: IPAddress[];
      reserved: IPAddress[];
  }
  export interface LinodeIPsResponseIPV6 {
      link_local: IPAddress;
      slaac: IPAddress;
      global: IPRange[];
  }
  export type LinodeStatus = 'offline' | 'booting' | 'running' | 'shutting_down' | 'rebooting' | 'rebuilding' | 'provisioning' | 'deleting' | 'migrating' | 'cloning' | 'restoring';
  export interface Config {
      id: number;
      kernel: string;
      comments: string;
      memory_limit: number;
      root_device: string;
      run_level: 'default' | 'single' | 'binbash';
      virt_mode: 'paravirt' | 'fullvirt';
      helpers: any;
      label: string;
      devices: Devices;
      created: string;
      updated: string;
      initrd: string | null;
  }
  export interface DiskDevice {
      disk_id: null | number;
  }
  export interface VolumeDevice {
      volume_id: null | number;
  }
  export interface Devices {
      sda: null | DiskDevice | VolumeDevice;
      sdb: null | DiskDevice | VolumeDevice;
      sdc: null | DiskDevice | VolumeDevice;
      sdd: null | DiskDevice | VolumeDevice;
      sde: null | DiskDevice | VolumeDevice;
      sdf: null | DiskDevice | VolumeDevice;
      sdg: null | DiskDevice | VolumeDevice;
      sdh: null | DiskDevice | VolumeDevice;
  }
  export interface Kernel {
      id: string;
      label: string;
      version: string;
      kvm: boolean;
      xen: boolean;
      architecture: string;
      pvops: boolean;
  }
  interface NetStats {
      in: [number, number][];
      out: [number, number][];
      private_in: [number, number][];
      private_out: [number, number][];
  }
  export interface StatsData {
      cpu: [number, number][];
      io: {
          io: [number, number][];
          swap: [number, number][];
      };
      netv4: NetStats;
      netv6: NetStats;
  }
  export interface Stats {
      title: string;
      data: StatsData;
  }
  export interface Disk {
      id: number;
      label: string;
      status: DiskStatus;
      size: number;
      filesystem: Filesystem;
      created: string;
      updated: string;
  }
  export type DiskStatus = 'offline' | 'booting' | 'running' | 'shutting_down' | 'rebooting' | 'provisioning' | 'deleting' | 'migrating' | 'ready';
  export interface LinodeConfigCreationData {
      label: string;
      devices: Devices;
      kernel?: string;
      comments?: string;
      memory_limit?: number;
      run_level?: 'default' | 'single' | 'binbash';
      virt_mode?: 'fullvirt' | 'paravirt';
      helpers: {
          updatedb_disabled: boolean;
          distro: boolean;
          modules_dep: boolean;
          network: boolean;
          devtmpfs_automount: boolean;
      };
      root_device: string;
  }
  export interface PriceObject {
      monthly: number;
      hourly: number;
  }
  export interface LinodeType {
      id: string;
      disk: number;
      class: LinodeTypeClass;
      price: PriceObject;
      successor: string | null;
      label: string;
      addons: {
          backups: {
              price: PriceObject;
          };
      };
      network_out: number;
      memory: number;
      transfer: number;
      vcpus: number;
  }
  export type LinodeTypeClass = 'nanode' | 'standard' | 'dedicated' | 'highmem' | 'gpu';
  export interface IPAllocationRequest {
      type: 'ipv4';
      public: boolean;
  }
  export interface CreateLinodeRequest {
      type?: string;
      region?: string;
      stackscript_id?: number;
      backup_id?: number;
      swap_size?: number;
      image?: string;
      root_pass?: string;
      authorized_keys?: string[];
      backups_enabled?: boolean;
      stackscript_data?: any;
      booted?: boolean;
      label?: string;
      tags?: string[];
      private_ip?: boolean;
      authorized_users?: string[];
  }
  export type RescueRequestObject = Pick<Devices, 'sda' | 'sdb' | 'sdc' | 'sdd' | 'sde' | 'sdf' | 'sdg'>;
  export interface LinodeCloneData {
      linode_id?: number;
      region?: string | null;
      type?: string | null;
      label?: string | null;
      backups_enabled?: boolean | null;
      tags?: string[] | null;
      configs?: number[];
      disks?: number[];
  }
  export interface RebuildRequest {
      image: string;
      root_pass: string;
      authorized_keys?: SSHKey[];
      authorized_users?: string[];
      stackscript_id?: number;
      stackscript_data?: any;
      booted?: boolean;
  }
  export interface LinodeDiskCreationData {
      label: string;
      size: number;
      filesystem?: 'raw' | 'swap' | 'ext3' | 'ext4' | 'initrd';
      read_only?: boolean;
      image?: string;
      authorized_keys?: string[];
      authorized_users?: string[];
      root_pass?: string;
      stackscript_id?: number;
      stackscript_data?: any;
  }
  export {};

}
declare module 'linode-js-sdk/longview/index' {
  export * from 'linode-js-sdk/longview/longview';
  export * from 'linode-js-sdk/longview/longview';
  export * from 'linode-js-sdk/longview/types';

}
declare module 'linode-js-sdk/longview/longview' {
  import { ResourcePage } from 'linode-js-sdk/types';
  import { LongviewClient, LongviewSubscription } from 'linode-js-sdk/longview/types';
  export const createLongviewClient: (label?: string | undefined) => Promise<LongviewClient>;
  export const getLongviewClients: (params?: any, filter?: any) => Promise<ResourcePage<LongviewClient>>;
  export const deleteLongviewClient: (id: number) => Promise<{}>;
  export const updateLongviewClient: (id: number, label: string) => Promise<LongviewClient>;
  export const getLongviewSubscriptions: () => Promise<ResourcePage<LongviewSubscription>>;

}
declare module 'linode-js-sdk/longview/longview.schema' {
  export const longviewClientCreate: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string;
  }>>;

}
declare module 'linode-js-sdk/longview/types' {
  export interface LongviewClient {
      id: number;
      created: string;
      label: string;
      updated: string;
      api_key: string;
      install_code: string;
      apps: Apps;
  }
  export interface LongviewSubscription {
      id: string;
      label: string;
      clients_included: number;
      price: {
          hourly: number;
          monthly: number;
      };
  }
  export interface Apps {
      apache: boolean;
      nginx: boolean;
      mysql: boolean;
  }

}
declare module 'linode-js-sdk/managed/index' {
  export * from 'linode-js-sdk/managed/managed';
  export * from 'linode-js-sdk/managed/managed';
  export * from 'linode-js-sdk/managed/types';

}
declare module 'linode-js-sdk/managed/managed' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { ContactPayload, CredentialPayload, ManagedContact, ManagedCredential, ManagedIssue, ManagedLinodeSetting, ManagedServiceMonitor, ManagedServicePayload, ManagedSSHPubKey, ManagedSSHSetting, ManagedStats, UpdateCredentialPayload, UpdatePasswordPayload } from 'linode-js-sdk/managed/types';
  /**
   * enableManaged
   *
   * Enables the Managed feature
   * on your account. This service is billed at $100/month/Linode.
   *
   * Should this live in /account?
   *
   */
  export const enableManaged: () => import("axios").AxiosPromise<{}>;
  /**
   * getServices
   *
   * Returns a paginated list of Managed Services on your account.
   */
  export const getServices: (params?: any, filters?: any) => Promise<Page<ManagedServiceMonitor>>;
  /**
   * disableServiceMonitor
   *
   * Temporarily disables monitoring of a Managed Service.
   */
  export const disableServiceMonitor: (serviceID: number) => Promise<ManagedServiceMonitor>;
  /**
   * enableServiceMonitor
   *
   * Enables monitoring of a Managed Service that is currently disabled.
   */
  export const enableServiceMonitor: (serviceID: number) => Promise<ManagedServiceMonitor>;
  /**
   * deleteServiceMonitor
   *
   * Disables a Managed Service and removes it from your account.
   */
  export const deleteServiceMonitor: (serviceID: number) => Promise<{}>;
  /**
   * getLinodeSettings
   *
   * Returns a paginated list of Managed Settings for your Linodes. There will be one entry per Linode on your Account.
   */
  export const getLinodeSettings: (params?: any, filters?: any) => Promise<Page<ManagedLinodeSetting>>;
  /**
   * createServiceMonitor
   *
   * Creates a Managed Service Monitor
   */
  export const createServiceMonitor: (data: ManagedServicePayload) => Promise<ManagedServiceMonitor>;
  /**
   * updateServiceMonitor
   *
   * Update a Managed Service Monitor
   */
  export const updateServiceMonitor: (monitorID: number, data: Partial<ManagedServicePayload>) => Promise<ManagedServiceMonitor>;
  /**
   * getCredentials
   *
   * Returns a paginated list of Managed Credentials for your account.
   */
  export const getCredentials: (params?: any, filters?: any) => Promise<Page<ManagedCredential>>;
  /**
   * updateCredential
   *
   * Update the label on a Managed Credential on your account.
   * Other fields (password and username) cannot be changed.
   */
  export const updateCredential: (credentialID: number, data: UpdateCredentialPayload) => Promise<Page<ManagedCredential>>;
  /**
   * updatePassword
   *
   * Update the username and/or password on a Managed Credential on your account.
   */
  export const updatePassword: (credentialID: number, data: UpdatePasswordPayload) => Promise<Page<ManagedCredential>>;
  /**
   * deleteCredential
   *
   * Disables a Managed Credential and removes it from your account.
   */
  export const deleteCredential: (credentialID: number) => Promise<{}>;
  export const createCredential: (data: CredentialPayload) => Promise<ManagedCredential>;
  /**
   * getSSHKey
   *
   * Returns the unique SSH public key assigned to your Linode account's Managed service.
   * If you add this public key to a Linode on your account, Linode special forces will be
   * able to log in to the Linode with this key when attempting to resolve issues.
   */
  export const getSSHPubKey: () => Promise<ManagedSSHPubKey>;
  /**
   * updateLinodeSettings
   *
   * Updates a single Linode's Managed settings.
   *
   */
  export const updateLinodeSettings: (linodeId: number, data: {
      ssh: Partial<ManagedSSHSetting>;
  }) => Promise<ManagedLinodeSetting>;
  /**
   * getManagedContacts
   *
   * Returns a paginated list of Managed Contacts on your Account.
   */
  export const getManagedContacts: (params?: any, filters?: any) => Promise<Page<ManagedContact>>;
  /**
   * createContact
   *
   * Creates a Managed Contact
   */
  export const createContact: (data: ContactPayload) => Promise<ManagedContact>;
  /**
   * updateContact
   *
   * Updates a Managed Contact
   */
  export const updateContact: (contactId: number, data: Partial<ContactPayload>) => Promise<ManagedContact>;
  /**
   * deleteContact
   *
   * Deletes a Managed Contact
   */
  export const deleteContact: (contactId: number) => Promise<{}>;
  /**
   * getManagedIssues
   *
   * Returns a paginated list of Issues on a Managed customer's account.
   */
  export const getManagedIssues: () => Promise<Page<ManagedIssue>>;
  /**
   * getManagedStats
   *
   * Returns usage data for all of the Linodes on a Managed customer's account.
   */
  export const getManagedStats: () => Promise<ManagedStats>;

}
declare module 'linode-js-sdk/managed/managed.schema' {
  export const createServiceMonitorSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string;
      service_type: any;
      address: string;
      timeout: number;
      credentials: number[] | undefined;
      notes: string | undefined;
      consultation_group: string | undefined;
      body: string | undefined;
  }>>;
  export const sshSettingSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      access: boolean;
      user: string;
      ip: string;
      port: number;
  }>>;
  export const updateManagedLinodeSchema: import("yup").ObjectSchema<{
      ssh: import("yup").Shape<object, {
          access: any;
          user: any;
          ip: any;
          port: any;
      }>;
  }>;
  export const credentialLabel: import("yup").StringSchema<string>;
  export const credentialPassword: import("yup").StringSchema<string | undefined>;
  export const credentialUsername: import("yup").StringSchema<string | undefined>;
  export const createCredentialSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string;
      username: string | undefined;
      password: string | undefined;
  }>>;
  export const updateCredentialSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      label: string;
  }>>;
  export const updatePasswordSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      username: string | undefined;
      password: string;
  }>>;
  export const createContactSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      name: string;
      email: string;
      phone: import("yup").Shape<object, {
          primary: any;
          secondary: any;
      }> | undefined;
      group: string | null | undefined;
  }>>;

}
declare module 'linode-js-sdk/managed/types' {
  export interface ManagedServiceMonitor {
      id: number;
      label: string;
      created: string;
      updated: string;
      status: MonitorStatus;
      service_type: ServiceType;
      timeout: number;
      region: string | null;
      credentials: ManagedCredential[];
      address: string;
      body: string;
      notes: string;
      consultation_group: string;
  }
  export type MonitorStatus = 'pending' | 'disabled' | 'ok' | 'problem';
  export type ServiceType = 'url' | 'tcp';
  export interface ManagedLinodeSetting {
      id: number;
      label: string;
      group: string;
      ssh: ManagedSSHSetting;
  }
  export interface ManagedSSHSetting {
      access: boolean;
      user: string;
      ip: string;
      port: number;
  }
  export interface ManagedCredential {
      id: number;
      last_decrypted: string | null;
      label: string;
  }
  export interface ManagedContact {
      id: number;
      name: string;
      email: string;
      phone: ManagedContactPhone;
      group: string | null;
      updated: string;
  }
  export interface ManagedContactPhone {
      primary?: string | null;
      secondary?: string | null;
  }
  export interface ManagedSSHPubKey {
      ssh_key: string;
  }
  export interface ManagedServicePayload {
      label: string;
      service_type: ServiceType;
      address: string;
      timeout: number;
      notes?: string;
      body?: string;
      consultation_group?: string;
      credentials?: number[];
  }
  export interface CredentialPayload {
      label: string;
      password?: string;
      username?: string;
  }
  export interface UpdateCredentialPayload {
      label: string;
  }
  export interface UpdatePasswordPayload {
      password?: string;
      username?: string;
  }
  export interface ContactPayload {
      name: string;
      email: string;
      phone?: ManagedContactPhone;
      group?: string | null;
  }
  export interface ManagedIssue {
      id: number;
      services: number[];
      created: string;
      entity: any;
  }
  export interface IssueEntity {
      id: number;
      label: string;
      type: 'ticket';
      url: string;
  }
  export interface DataSeries {
      x: number;
      y: number;
  }
  export interface ManagedStatsData {
      disk: DataSeries[];
      cpu: DataSeries[];
      net_in: DataSeries[];
      net_out: DataSeries[];
      swap: DataSeries[];
  }
  export interface ManagedStats {
      data: ManagedStatsData;
  }

}
declare module 'linode-js-sdk/networking/index' {
  export * from 'linode-js-sdk/networking/types';
  export * from 'linode-js-sdk/networking/networking';
  export * from 'linode-js-sdk/networking/networking';

}
declare module 'linode-js-sdk/networking/networking' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { IPAddress, IPRange } from 'linode-js-sdk/networking/types';
  /**
   * Returns a paginated list of IP Addresses on your Account, excluding private
   * addresses.
   *
   */
  export const getIPs: (params?: any, filters?: any) => Promise<Page<IPAddress>>;
  /**
   * Returns information about a single IP Address on your Account.
   *
   * @param address { string } The address to operate on.
   */
  export const getIP: (address: string) => Promise<IPAddress>;
  /**
   * Sets RDNS on an IP Address. Forward DNS must already be set up for reverse
   * DNS to be applied. If you set the RDNS to null for public IPv4 addresses,
   * it will be reset to the default members.linode.com RDNS value.
   *
   * @param address { string } The address to operate on.
   * @param rdns { string } The reverse DNS assigned to this address. For public
   * IPv4 addresses, this will be set to a default value provided by Linode if not
   * explicitly set.
   */
  export const updateIP: (address: string, rdns?: string | null) => Promise<IPAddress>;
  /**
   * Allocates a new IPv4 Address on your Account. The Linode must be configured
   * to support additional addresses - please open a support ticket requesting
   * additional addresses before attempting allocation
   *
   * @param payload { Object }
   * @param payload.type { string } The type of address you are requesting. Only
   * IPv4 addresses may be allocated through this endpoint.
   * @param payload.public { boolean } Whether to create a public or private IPv4
   * address.
   * @param payload.linode_id { number } The ID of a Linode you you have access to
   *  that this address will be allocated to.
   */
  export const allocateIp: (payload: any) => Promise<IPAddress>;
  /**
   * Assign multiple IPs to multiple Linodes in one Region. This allows swapping,
   * shuffling, or otherwise reorganizing IPv4 Addresses to your Linodes. When the
   * assignment is finished, all Linodes must end up with at least one public
   * IPv4 and no more than one private IPv4.
   *
   * @param payload { Object }
   * @param payload.region { string } The ID of the Region in which these
   * assignments are to take place. All IPs and Linodes must exist in this Region.
   * @param payload.assignments { Object[] } The ID of the Region in which these
   * assignments are to take place. All IPs and Linodes must exist in this Region.
   */
  export const assignAddresses: (payload: any) => import("axios").AxiosPromise<{}>;
  /**
   * Configure shared IPs. A shared IP may be brought up on a Linode other than
   * the one it lists in its response. This can be used to allow one Linode to
   * begin serving requests should another become unresponsive.
   *
   * @param payload { Object }
   * @param payload.linode_id { number } The ID of the Linode that the addresses
   * will be shared with.
   * @param payload.ips { string[] } A list of IPs that will be shared with this
   * Linode. When this is finished, the given Linode will be able to bring up
   * these addresses in addition to the Linodes that these addresses belong to.
   * You must have access to all of these addresses and they must be in the same
   * Region as the Linode.
   */
  export const shareAddresses: (payload: any) => import("axios").AxiosPromise<{}>;
  /**
   * Displays the IPv6 pools on your Account.
   *
   */
  export const getIPv6Pools: (params?: any) => Promise<Page<IPRange>>;
  /**
   * Displays the IPv6 ranges on your Account.
   *
   */
  export const getIPv6Ranges: (params?: any) => Promise<Page<IPRange>>;

}
declare module 'linode-js-sdk/networking/networking.schema' {
  export const updateIPSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      rdns: string | null | undefined;
  }>>;
  export const allocateIPSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      type: string;
      public: boolean;
      linode_id: number;
  }>>;
  export const assignAddressesSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      region: string;
      assignments: import("yup").Ref[];
  }>>;
  export const shareAddressesSchema: import("yup").ObjectSchema<import("yup").Shape<object, {
      linode_id: number;
      ips: string[];
  }>>;

}
declare module 'linode-js-sdk/networking/types' {
  export type ZoneName = 'newark' | 'dallas' | 'fremont' | 'atlanta' | 'london' | 'tokyo' | 'singapore' | 'frankfurt' | 'shinagawa1' | 'toronto1' | 'mumbai1' | 'sydney1';
  export interface IPAddress {
      address: string;
      gateway: string | null;
      subnet_mask: string;
      prefix: number;
      type: string;
      public: boolean;
      rdns: string | null;
      linode_id: number;
      region: string;
  }
  export interface IPRange {
      range: string;
      region: string;
      route_target: string | null;
      prefix?: number;
  }

}
declare module 'linode-js-sdk/nodebalancers/index' {
  export * from 'linode-js-sdk/nodebalancers/types';
  export * from 'linode-js-sdk/nodebalancers/nodebalancers';
  export * from 'linode-js-sdk/nodebalancers/nodebalancers';
  export * from 'linode-js-sdk/nodebalancers/nodebalancer-configs';
  export * from 'linode-js-sdk/nodebalancers/nodebalancer-config-nodes';

}
declare module 'linode-js-sdk/nodebalancers/nodebalancer-config-nodes' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { CreateNodeBalancerConfigNode, NodeBalancerConfigNode, UpdateNodeBalancerConfigNode } from 'linode-js-sdk/nodebalancers/types';
  /**
   * getNodeBalancerConfigNodes
   *
   * Returns a paginated list of nodes for the specified NodeBalancer configuration profile.
   * These are the backends that will be sent traffic for this port.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
   * @param configId { number } The configuration profile to retrieve nodes for.
   */
  export const getNodeBalancerConfigNodes: (nodeBalancerId: number, configId: number) => Promise<Page<NodeBalancerConfigNode>>;
  /**
   * getNodeBalancerConfigNode
   *
   * Returns details about a specific node for the given NodeBalancer configuration profile.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
   * @param configId { number } The configuration profile to retrieve nodes for.
   * @param nodeId { number } The Node to be retrieved.
   */
  export const getNodeBalancerConfigNode: (nodeBalancerId: number, configId: number, nodeId: number) => Promise<Page<NodeBalancerConfigNode>>;
  /**
   * createNodeBalancerConfigNode
   *
   * Creates a NodeBalancer Node, a backend that can accept traffic for
   * this NodeBalancer Config. Nodes are routed requests on the configured port based on their status.
   *
   * Note: The Linode API does not accept separate port and IP address parameters. This method will join
   * the IP and port after validation:
   *
   * data: {
   *  address: '0.0.0.0',
   *  port: 80
   * }
   *
   * will become:
   *
   * data: {
   *  address: '0.0.0.0:80'
   * }
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
   * @param configId { number } The configuration profile to add a node to.
   * @param data
   */
  export const createNodeBalancerConfigNode: (nodeBalancerId: number, configId: number, data: CreateNodeBalancerConfigNode) => Promise<NodeBalancerConfigNode>;
  /**
   * createNodeBalancerConfigNode
   *
   * Updates a backend node for the specified NodeBalancer configuration profile.
   *
   * Note: The Linode API does not accept separate port and IP address parameters. This method will join
   * the IP and port after validation:
   *
   * data: {
   *  address: '0.0.0.0',
   *  port: 80
   * }
   *
   * will become:
   *
   * data: {
   *  address: '0.0.0.0:80'
   * }
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
   * @param configId { number } The configuration profile to add a node to.
   * @param data
   */
  export const updateNodeBalancerConfigNode: (nodeBalancerId: number, configId: number, nodeId: number, data: UpdateNodeBalancerConfigNode) => Promise<NodeBalancerConfigNode>;
  /**
   * deleteNodeBalancerConfigNode
   *
   * Deletes a single backend Node form the specified NodeBalancer configuration profile.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer the config belongs to.
   * @param configId { number } The configuration profile to delete a node from.
   * @param nodeId { number} The node to be deleted.
   */
  export const deleteNodeBalancerConfigNode: (nodeBalancerId: number, configId: number, nodeId: number) => Promise<{}>;

}
declare module 'linode-js-sdk/nodebalancers/nodebalancer-configs' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { CreateNodeBalancerConfig, NodeBalancerConfig, UpdateNodeBalancerConfig } from 'linode-js-sdk/nodebalancers/types';
  /**
   * getNodeBalancerConfigs
   *
   * Returns a list of configuration profiles for the specified NodeBalancer.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer to view configs for.
   */
  export const getNodeBalancerConfigs: (nodeBalancerId: number) => Promise<Page<NodeBalancerConfig>>;
  /**
   * getNodeBalancerConfig
   *
   * Returns a list of configuration profiles for the specified NodeBalancer.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer associated with the config.
   */
  export const getNodeBalancerConfig: (nodeBalancerId: number, configId: number) => Promise<Page<NodeBalancerConfig>>;
  /**
   * createNodeBalancerConfig
   *
   * Creates a NodeBalancer Config, which allows the NodeBalancer to accept traffic on a new port.
   * You will need to add NodeBalancer Nodes to the new Config before it can actually serve requests.
   *
   * @param nodeBalancerId { number } The NodeBalancer to receive the new config.
   */
  export const createNodeBalancerConfig: (nodeBalancerId: number, data: CreateNodeBalancerConfig) => Promise<NodeBalancerConfig>;
  /**
   * updateNodeBalancerConfig
   *
   * Updates the configuration for a single port on a NodeBalancer.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer associated with the config.
   * @param configId { number } The ID of the configuration profile to be updated
   */
  export const updateNodeBalancerConfig: (nodeBalancerId: number, configId: number, data: UpdateNodeBalancerConfig) => Promise<NodeBalancerConfig>;
  /**
   * deleteNodeBalancerConfig
   *
   * Delete a single NodeBalancer configuration profile.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer associated with the config.
   * @param configId { number } The ID of the configuration profile to be deleted.
   */
  export const deleteNodeBalancerConfig: (nodeBalancerId: number, configId: number) => Promise<{}>;

}
declare module 'linode-js-sdk/nodebalancers/nodebalancers' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { CreateNodeBalancerPayload, NodeBalancer, NodeBalancerStats } from 'linode-js-sdk/nodebalancers/types';
  /**
   * getNodeBalancers
   *
   * Returns a paginated list of NodeBalancers on your account.
   */
  export const getNodeBalancers: (params?: any, filters?: any) => Promise<Page<NodeBalancer>>;
  /**
   * getNodeBalancer
   *
   * Returns detailed information about a single NodeBalancer.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer to retrieve.
   */
  export const getNodeBalancer: (nodeBalancerId: number) => Promise<NodeBalancer>;
  /**
   * updateNodeBalancer
   *
   * Update an existing NodeBalancer on your account.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer to update.
   * @param data { object } The fields to update. Values not included in this
   * parameter will be left unchanged.
   */
  export const updateNodeBalancer: (nodeBalancerId: number, data: Partial<NodeBalancer>) => Promise<NodeBalancer>;
  /**
   * createNodeBalancer
   *
   * Add a NodeBalancer to your account.
   */
  export const createNodeBalancer: (data: CreateNodeBalancerPayload) => Promise<NodeBalancer>;
  /**
   * deleteNodeBalancer
   *
   * Remove a NodeBalancer from your account.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer to delete.
   */
  export const deleteNodeBalancer: (nodeBalancerId: number) => Promise<{}>;
  /**
   * getNodeBalancerStats
   *
   * Returns detailed statistics about the requested NodeBalancer.
   *
   * @param nodeBalancerId { number } The ID of the NodeBalancer to view stats for.
   */
  export const getNodeBalancerStats: (nodeBalancerId: number) => Promise<NodeBalancerStats>;

}
declare module 'linode-js-sdk/nodebalancers/nodebalancers.schema' {
  export const nodeBalancerConfigNodeSchema: import("yup").ObjectSchema<{
      label: string;
      address: string;
      port: number;
      weight: number;
      mode: any;
  }>;
  export const createNodeBalancerConfigSchema: import("yup").ObjectSchema<{
      algorithm: any;
      check_attempts: number;
      check_body: string;
      check_interval: number;
      check_passive: boolean;
      check_path: string;
      check_timeout: number;
      check: any;
      cipher_suite: any;
      port: number;
      protocol: any;
      ssl_key: string;
      ssl_cert: string;
      stickiness: any;
      nodes: {
          label: any;
          address: any;
          port: any;
          weight: any;
          mode: any;
      }[];
  }>;
  export const UpdateNodeBalancerConfigSchema: import("yup").ObjectSchema<{
      algorithm: any;
      check_attempts: number;
      check_body: string;
      check_interval: number;
      check_passive: boolean;
      check_path: string;
      check_timeout: number;
      check: any;
      cipher_suite: any;
      port: number;
      protocol: any;
      ssl_key: string;
      ssl_cert: string;
      stickiness: any;
      nodes: {
          label: any;
          address: any;
          port: any;
          weight: any;
          mode: any;
      }[];
  }>;
  export const NodeBalancerSchema: import("yup").ObjectSchema<{
      label: string;
      client_conn_throttle: number;
      region: string;
      configs: {
          algorithm: any;
          check_attempts: any;
          check_body: any;
          check_interval: any;
          check_passive: any;
          check_path: any;
          check_timeout: any;
          check: any;
          cipher_suite: any;
          port: any;
          protocol: any;
          ssl_key: any;
          ssl_cert: any;
          stickiness: any;
          nodes: any;
      }[];
  }>;
  export const UpdateNodeBalancerSchema: import("yup").ObjectSchema<{
      label: string;
      client_conn_throttle: number;
      region: string;
  }>;

}
declare module 'linode-js-sdk/nodebalancers/types' {
  import { APIError } from 'linode-js-sdk/types';
  export interface NodeBalancer {
      id: number;
      label: string;
      hostname: string;
      client_conn_throttle: number;
      region: string;
      ipv4: string;
      ipv6: null | string;
      created: string;
      updated: string;
      transfer: BalancerTransfer;
      tags: string[];
  }
  export interface NodeBalancerWithConfigIDs extends NodeBalancer {
      configs: number[];
  }
  export interface NodeBalancerWithConfigs extends NodeBalancer {
      configs: NodeBalancerConfig[];
  }
  export interface NodesStatus {
      up: number;
      down: number;
  }
  export interface BalancerTransfer {
      in: number;
      out: number;
      total: number;
  }
  export type NodeBalancerConfigNodeMode = 'accept' | 'reject' | 'backup' | 'drain';
  export interface NodeBalancerConfigNode2 {
      id: number;
      label: string;
      address: string;
      port?: number;
      weight?: number;
      nodebalancer_id: number;
      config_id?: number;
      mode?: NodeBalancerConfigNodeMode;
      modifyStatus?: 'new' | 'delete' | 'update';
      errors?: APIError[];
      status: 'UP' | 'DOWN' | 'unknown';
  }
  export interface NodeBalancerConfigNodeFields {
      id?: number;
      label: string;
      address: string;
      port?: number;
      weight?: number;
      nodebalancer_id?: number;
      config_id?: number;
      mode?: NodeBalancerConfigNodeMode;
      modifyStatus?: 'new' | 'delete' | 'update';
      errors?: APIError[];
      status?: 'UP' | 'DOWN' | 'unknown';
  }
  export interface NodeBalancerConfig {
      id: number;
      nodebalancer_id: number;
      port: number;
      check_passive: boolean;
      ssl_cert: string;
      nodes_status: NodesStatus;
      protocol: 'http' | 'https' | 'tcp';
      ssl_commonname: string;
      check_interval: number;
      check_attempts: number;
      check_timeout: number;
      check_body: string;
      check_path: string;
      check: 'none' | 'connection' | 'http' | 'http_body';
      ssl_key: string;
      stickiness: 'none' | 'table' | 'http_cookie';
      algorithm: 'roundrobin' | 'leastconn' | 'source';
      ssl_fingerprint: string;
      cipher_suite: 'recommended' | 'legacy';
      nodes: NodeBalancerConfigNode[];
      modifyStatus?: 'new';
  }
  export interface NodeBalancerConfigPort {
      configId: number;
      port: number;
  }
  export interface NodeBalancerStats {
      title: string;
      data: {
          connections: [number, number][];
          traffic: {
              out: [number, number][];
              in: [number, number][];
          };
      };
  }
  export interface CreateNodeBalancerConfig {
      port?: number;
      protocol?: 'http' | 'https' | 'tcp';
      algorithm?: 'roundrobin' | 'leastconn' | 'source';
      stickiness?: 'none' | 'table' | 'http_cookie';
      check?: 'none' | 'connection' | 'http' | 'http_body';
      check_interval?: number;
      check_timeout?: number;
      check_attempts?: number;
      check_path?: string;
      check_body?: string;
      check_passive?: boolean;
      cipher_suite?: 'recommended' | 'legacy';
      ssl_cert?: string;
      ssl_key?: string;
  }
  export interface UpdateNodeBalancerConfig extends CreateNodeBalancerConfig {
  }
  export interface NodeBalancerConfigFields {
      id?: number;
      algorithm?: 'roundrobin' | 'leastconn' | 'source';
      check_attempts?: number /** 1..30 */;
      check_body?: string;
      check_interval?: number;
      check_passive?: boolean;
      check_path?: string;
      check_timeout?: number /** 1..30 */;
      check?: 'none' | 'connection' | 'http' | 'http_body';
      cipher_suite?: 'recommended' | 'legacy';
      port?: number /** 1..65535 */;
      protocol?: 'http' | 'https' | 'tcp';
      ssl_cert?: string;
      ssl_key?: string;
      stickiness?: 'none' | 'table' | 'http_cookie';
      nodes: NodeBalancerConfigNodeFields[];
  }
  export interface CreateNodeBalancerConfigNode {
      address: string;
      label: string;
      mode?: NodeBalancerConfigNodeMode;
      weight?: number;
  }
  export interface UpdateNodeBalancerConfigNode {
      address?: string;
      label?: string;
      mode?: NodeBalancerConfigNodeMode;
      weight?: number;
  }
  export interface NodeBalancerConfigNode {
      address: string;
      config_id: number;
      id: number;
      label: string;
      mode: NodeBalancerConfigNodeMode;
      nodebalancer_id: number;
      status: 'unknown' | 'UP' | 'DOWN';
      weight: number;
  }
  export interface CreateNodeBalancerPayload {
      region?: string;
      label?: string;
      client_conn_throttle?: number;
      configs: any;
  }

}
declare module 'linode-js-sdk/nodebalancers/utils' {
  import { NodeBalancerConfigNode2 } from 'linode-js-sdk/nodebalancers/types';
  export const combineConfigNodeAddressAndPort: (data: any) => any;
  export const combineNodeBalancerConfigNodeAddressAndPort: (data: any) => any;
  export const mergeAddressAndPort: (node: NodeBalancerConfigNode2) => {
      address: string;
      id: number;
      label: string;
      port?: number | undefined;
      weight?: number | undefined;
      nodebalancer_id: number;
      config_id?: number | undefined;
      mode?: "accept" | "reject" | "backup" | "drain" | undefined;
      modifyStatus?: "new" | "delete" | "update" | undefined;
      errors?: import("linode-js-sdk/types").APIError[] | undefined;
      status: "UP" | "DOWN" | "unknown";
  };

}
declare module 'linode-js-sdk/object-storage/account' {
  /**
   * cancelObjectStorage
   *
   * Cancels Object Storage service
   */
  export const cancelObjectStorage: () => Promise<{}>;

}
declare module 'linode-js-sdk/object-storage/buckets' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { ObjectStorageBucket, ObjectStorageBucketRequestPayload, ObjectStorageDeleteBucketRequestPayload, ObjectStorageObjectListParams, ObjectStorageObjectListResponse } from 'linode-js-sdk/object-storage/types';
  /**
   * getBuckets
   *
   * Gets a list of a user's Object Storage Buckets
   */
  export const getBuckets: (params?: any, filters?: any) => Promise<Page<ObjectStorageBucket>>;
  /**
   * createBucket
   *
   * Creates a new Bucket on your account.
   *
   * @param data { object } The label and clusterId of the new Bucket.
   *
   */
  export const createBucket: (data: ObjectStorageBucketRequestPayload) => Promise<ObjectStorageBucket>;
  /**
   * deleteBucket
   *
   * Removes a Bucket from your account.
   *
   * NOTE: Attempting to delete a non-empty bucket will result in an error.
   */
  export const deleteBucket: ({ cluster, label }: ObjectStorageDeleteBucketRequestPayload) => import("axios").AxiosPromise<ObjectStorageBucket>;
  /**
   * Returns a list of Objects in a given Bucket.
   */
  export const getObjectList: (clusterId: string, bucketName: string, params?: ObjectStorageObjectListParams | undefined) => Promise<ObjectStorageObjectListResponse>;

}
declare module 'linode-js-sdk/object-storage/buckets.schema' {
  export const CreateBucketSchema: import("yup").ObjectSchema<{
      label: string;
      cluster: string;
  }>;

}
declare module 'linode-js-sdk/object-storage/clusters' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { ObjectStorageCluster } from 'linode-js-sdk/object-storage/types';
  /**
   * getClusters
   *
   * Gets a list of available clusters
   */
  export const getClusters: (params?: any, filters?: any) => Promise<Page<ObjectStorageCluster>>;

}
declare module 'linode-js-sdk/object-storage/index' {
  export * from 'linode-js-sdk/object-storage/account';
  export * from 'linode-js-sdk/object-storage/buckets';
  export * from 'linode-js-sdk/object-storage/buckets';
  export * from 'linode-js-sdk/object-storage/clusters';
  export * from 'linode-js-sdk/object-storage/objects';
  export * from 'linode-js-sdk/object-storage/objectStorageKeys';
  export * from 'linode-js-sdk/object-storage/objectStorageKeys';
  export * from 'linode-js-sdk/object-storage/types';

}
declare module 'linode-js-sdk/object-storage/objectStorageKeys' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { ObjectStorageKey, ObjectStorageKeyRequest } from 'linode-js-sdk/object-storage/types';
  /**
   * getObjectStorageKeys
   *
   * Gets a list of a user's Object Storage Keys
   */
  export const getObjectStorageKeys: (params?: any, filters?: any) => Promise<Page<ObjectStorageKey>>;
  /**
   * createObjectStorageKeys
   *
   * Creates an Object Storage key
   */
  export const createObjectStorageKeys: (data: ObjectStorageKeyRequest) => Promise<ObjectStorageKey>;
  /**
   * updateObjectStorageKeys
   *
   * Updates an Object Storage Key
   */
  export const updateObjectStorageKey: (id: number, data: ObjectStorageKeyRequest) => Promise<ObjectStorageKey>;
  /**
   * revokeObjectStorageKey
   *
   * Revokes an Object Storage key
   */
  export const revokeObjectStorageKey: (id: number) => Promise<ObjectStorageKey>;

}
declare module 'linode-js-sdk/object-storage/objectStorageKeys.schema' {
  export const createObjectStorageKeysSchema: import("yup").ObjectSchema<{
      label: string;
  }>;

}
declare module 'linode-js-sdk/object-storage/objects' {
  import { ObjectStorageObjectURL, ObjectStorageObjectURLOptions } from 'linode-js-sdk/object-storage/types';
  /**
   * Gets a URL to upload/download/delete objects from a bucket.
   */
  export const getObjectURL: (clusterId: string, bucketName: string, name: string, method: "GET" | "POST" | "PUT" | "DELETE", options?: ObjectStorageObjectURLOptions | undefined) => Promise<ObjectStorageObjectURL>;

}
declare module 'linode-js-sdk/object-storage/types' {
  export interface ObjectStorageKey {
      access_key: string;
      id: number;
      label: string;
      secret_key: string;
  }
  export interface ObjectStorageKeyRequest {
      label: string;
  }
  export interface ObjectStorageBucketRequestPayload {
      label: string;
      cluster: string;
  }
  export interface ObjectStorageDeleteBucketRequestPayload {
      cluster: string;
      label: string;
  }
  export interface ObjectStorageBucket {
      label: string;
      created: string;
      cluster: string;
      hostname: string;
  }
  export interface ObjectStorageObject {
      size: number | null;
      owner: string | null;
      etag: string | null;
      last_modified: string | null;
      name: string;
  }
  export interface ObjectStorageObjectURL {
      exists: boolean;
      url: string;
  }
  export interface ObjectStorageObjectURLOptions {
      expires_in?: number;
      content_type?: string;
      content_disposition?: 'attachment';
  }
  export type ObjectStorageClusterID = 'us-east-1' | 'eu-central-1';
  export interface ObjectStorageCluster {
      region: string;
      status: string;
      id: ObjectStorageClusterID;
      domain: string;
      static_site_domain: string;
  }
  export interface ObjectStorageObjectListParams {
      delimiter?: string;
      marker?: string;
      prefix?: string;
      page_size?: number;
  }
  export interface ObjectStorageObjectListResponse {
      data: ObjectStorageObject[];
      next_marker: string | null;
      is_truncated: boolean;
  }

}
declare module 'linode-js-sdk/profile/accessTokens' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Token, TokenRequest } from 'linode-js-sdk/profile/types';
  /**
   * getPersonalAccessTokens
   *
   * Returns a paginated list of Personal Access Tokens currently active for your User.
   *
   */
  export const getPersonalAccessTokens: (params?: any, filters?: any) => Promise<Page<Token>>;
  /**
   * getPersonalAccessToken
   *
   * Retrieve a single Personal Access Token.
   *
   * @param ticketId { number } the ID of the token to view
   *
   */
  export const getPersonalAccessToken: (id: number) => Promise<Token>;
  /**
   * createPersonalAccessToken
   *
   * Creates a Personal Access Token for your User.
   * The raw token will be returned in the response. You may create a token with at most the scopes of
   * your current token. The created token will be able to access your Account until the given expiry,
   * or until it is revoked.
   *
   * @param data { Object } Token request object
   * @param data.scope { string } The scopes to create the token with. These cannot be changed after creation,
   * and may not exceed the scopes of the acting token. If omitted, the new token will have the same
   * scopes as the acting token.
   * @param data.expiry { string } Datetime string indicating when this token should be valid until.
   * If omitted, the new token will be valid until it is manually revoked.
   * @param data.label { string } String to identify this token. Used for organizational purposes only.
   *
   */
  export const createPersonalAccessToken: (data: TokenRequest) => Promise<Token>;
  /**
   * updatePersonalAccessToken
   *
   * Change the label or expiry date of a Personal Access Token
   *
   * @param tokenId { number } the ID of the token to be updated.
   * @param data { Object } JSON object to be sent as the X-Filter header.
   * @param data.label { string } update the Token's label.
   * @param data.expiry { string } Datetime string to update when the token should expire.
   *
   */
  export const updatePersonalAccessToken: (tokenId: number, data: Partial<TokenRequest>) => Promise<Token>;
  /**
   * deletePersonalAccessToken
   *
   * Deletes a single Personal Access Token.
   *
   * @param tokenId { number } the ID of the token to be deleted.
   *
   */
  export const deletePersonalAccessToken: (tokenId: number) => import("axios").AxiosPromise<{}>;

}
declare module 'linode-js-sdk/profile/appTokens' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Token } from 'linode-js-sdk/profile/types';
  /**
   * getAppTokens
   *
   * Returns list of apps that have been authorized to access your account.
   *
   */
  export const getAppTokens: (params?: any, filters?: any) => Promise<Page<Token>>;
  /**
   * getAppToken
   *
   * Returns information about a single app you've authorized to access your account.
   *
   * @param tokenId { number } the Id of the App Token to retrieve.
   */
  export const getAppToken: (tokenId: number) => Promise<Token>;
  /**
   * deleteAppToken
   *
   * Delete a single App Token. Revokes this app's ability to
   * access the API.
   *
   * @param tokenId { number } the ID of the token to be deleted.
   */
  export const deleteAppToken: (tokenId: number) => import("axios").AxiosPromise<{}>;

}
declare module 'linode-js-sdk/profile/index' {
  export * from 'linode-js-sdk/profile/types';
  export * from 'linode-js-sdk/profile/twofactor';
  export * from 'linode-js-sdk/profile/twofactor';
  export * from 'linode-js-sdk/profile/sshkeys';
  export * from 'linode-js-sdk/profile/profile';
  export * from 'linode-js-sdk/profile/profile';
  export * from 'linode-js-sdk/profile/appTokens';
  export * from 'linode-js-sdk/profile/accessTokens';

}
declare module 'linode-js-sdk/profile/profile' {
  import { Grants } from 'linode-js-sdk/account/index';
  import { ResourcePage } from 'linode-js-sdk/types';
  import { Profile, TrustedDevice } from 'linode-js-sdk/profile/types';
  /**
   * getProfile
   *
   * Return the current (logged in) user's profile.
   *
   */
  export const getProfile: () => Promise<Profile>;
  /**
   * updateProfile
   *
   * Update the current user's profile. Fields included in the
   * data param will be updated by the API; omitted fields will remain
   * unchanged.
   *
   */
  export const updateProfile: (data: any) => Promise<Profile>;
  /**
   * listGrants
   *
   * This returns a GrantsResponse describing what the acting User has been granted access to.
   * For unrestricted users, this will return a 204 and no body because unrestricted users have
   * access to everything without grants. This will not return information about entities you do
   * not have access to. This endpoint is useful when writing third-party OAuth applications to
   * see what options you should present to the acting User.
   *
   * This endpoint is unauthenticated.
   */
  export const listGrants: () => Promise<Grants>;
  /**
   * getMyGrants
   *
   * This returns a GrantsResponse describing what the acting User has been granted access to. For
   * unrestricted users, this will return a 204 and no body because unrestricted users have access
   * to everything without grants. This will not return information about entities you do not have
   * access to. This endpoint is useful when writing third-party OAuth applications to see what
   * options you should present to the acting User.
   *
   */
  export const getMyGrants: () => Promise<Grants>;
  /**
   * getTrustedDevices
   *
   * Returns a paginated list of all trusted devices associated with the user's profile.
   */
  export const getTrustedDevices: (params: any, filter: any) => Promise<ResourcePage<TrustedDevice>>;
  /**
   * deleteTrustedDevice
   *
   * Deletes a trusted device from a user's profile
   */
  export const deleteTrustedDevice: (id: number) => Promise<{}>;
  /**
   * getUserPreferences
   *
   * Retrieves an arbitrary JSON blob for the purposes of implementing
   * conditional logic based on preferences the user chooses
   */
  export const getUserPreferences: () => Promise<Record<string, any>>;
  /**
   * getUserPreferences
   *
   * Stores an arbitrary JSON blob for the purposes of implementing
   * conditional logic based on preferences the user chooses
   */
  export const updateUserPreferences: (payload: Record<string, any>) => Promise<Record<string, any>>;

}
declare module 'linode-js-sdk/profile/profile.schema' {
  export const createPersonalAccessTokenSchema: import("yup").ObjectSchema<{
      scopes: string;
      expiry: string;
      label: string;
  }>;
  export const createSSHKeySchema: import("yup").ObjectSchema<{
      label: string;
      ssh_key: string;
  }>;
  export const updateProfileSchema: import("yup").ObjectSchema<{
      email: string;
      timezone: string;
      email_notifications: boolean;
      authorized_keys: string[];
      restricted: boolean;
      two_factor_auth: boolean;
      lish_auth_method: string;
  }>;

}
declare module 'linode-js-sdk/profile/sshkeys' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { SSHKey } from 'linode-js-sdk/profile/types';
  /**
   * getSSHKeys
   *
   * Returns a collection of SSH Keys you've added to your Profile.
   *
   */
  export const getSSHKeys: (params?: any, filters?: any) => Promise<Page<SSHKey>>;
  /**
   * getSSHKey
   *
   * View a single SSH key by ID.
   *
   */
  export const getSSHKey: (keyId: number) => Promise<SSHKey>;
  /**
   * createSSHKey
   *
   * Add an SSH key to your account.
   *
   */
  export const createSSHKey: (data: {
      label: string;
      ssh_key: string;
  }) => Promise<SSHKey>;
  /**
   * updateSSHKey
   *
   * Update an existing SSH key. Currently, only the label field can be updated.
   *
   * @param keyId { number } the ID of the key to be updated.
   *
   */
  export const updateSSHKey: (keyId: number, data: Partial<SSHKey>) => Promise<SSHKey>;
  /**
   * deleteSSHKey
   *
   * Remove a single SSH key from your Profile.
   *
   * @param keyId { number } the ID of the key to be deleted.
   *
   */
  export const deleteSSHKey: (keyId: number) => Promise<{}>;

}
declare module 'linode-js-sdk/profile/twofactor' {
  import { Secret } from 'linode-js-sdk/profile/types';
  /**
   * getTFAToken
   *
   * Generate a token for enabling two-factor authentication.
   * Used for authorizing 3rd party apps such as Authy and
   * Google Authenticator. This token can be input manually
   * into one of these 3rd party apps, or can be used to
   * generate a QR code for users to scan.
   *
   */
  export const getTFAToken: () => import("axios").AxiosPromise<Secret>;
  /**
   * disableTwoFactor
   *
   * Disable two-factor authentication for the current user.
   * All tokens generated by authorized apps will no longer
   * be valid.
   *
   */
  export const disableTwoFactor: () => import("axios").AxiosPromise<{}>;
  /**
   * confirmTwoFactor
   *
   * Use a two-factor code generated by a third-party app
   * to confirm that Two Factor Authentication has been
   * configured correctly. If this call succeeds, TFA will
   * be enabled on future logins for your account.
   *
   * @param code { string } Code generated by Authy/Google Authenticator/etc.
   *   after the QR code has been scanned.
   *
   * @returns a scratch code: a one-use code that can be used in place of your Two Factor code,
   * in case you are unable to generate one. Keep this in a safe place to avoid
   * being locked out of your Account.
   */
  export const confirmTwoFactor: (tfa_code: string) => Promise<{
      scratch: string;
  }>;

}
declare module 'linode-js-sdk/profile/twofactor.schema' {
  export const enableTwoFactorSchema: import("yup").ObjectSchema<{
      tfa_code: string;
  }>;

}
declare module 'linode-js-sdk/profile/types' {
  import { Grants } from 'linode-js-sdk/account/types';
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
      expiry: string;
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

}
declare module 'linode-js-sdk/regions/index' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Region } from 'linode-js-sdk/regions/types';
  /**
   * getRegions
   *
   * Return a list of available Regions (datacenters).
   * The response will be paginated, but the number of
   * available regions is small enough that multiple
   * pages are unlikely to be necessary.
   *
   * Filters are not included, as none of the fields
   * in a Region response object are filterable.
   *
   */
  export const getRegions: () => Promise<Page<Region>>;
  /**
   * getRegion
   *
   * Return detailed information about a particular region.
   *
   * @param regionID { string } The region to be retrieved.
   *
   */
  export const getRegion: (regionID: string) => Promise<Page<Region>>;
  export { Region };

}
declare module 'linode-js-sdk/regions/types' {
  export type Capabilities = 'Linodes' | 'NodeBalancers' | 'Block Storage' | 'Object Storage' | 'Kubernetes';
  export type RegionStatus = 'ok' | 'outage';
  export interface Region {
      id: string;
      country: string;
      capabilities: Capabilities[];
      status: RegionStatus;
  }

}
declare module 'linode-js-sdk/request' {
  import { AxiosError, AxiosPromise } from 'axios';
  import { ObjectSchema } from 'yup';
  import { APIError } from 'linode-js-sdk/types';
  export const baseRequest: import("axios").AxiosInstance;
  /** URL */
  export const setURL: (url: string) => <T>(obj: T) => T;
  /** METHOD */
  export const setMethod: (method: "GET" | "POST" | "PUT" | "DELETE") => <T>(obj: T) => T;
  /** Param */
  export const setParams: (params?: any) => <T>(obj: T) => T;
  export const setHeaders: (headers?: any) => <T>(obj: T) => T;
  /**
   * Validate and set data in the request configuration object.
   */
  export const setData: <T extends {}>(data: T, schema?: ObjectSchema<T> | undefined, postValidationTransform?: ((v: any) => any) | undefined) => (<T_1>(obj: T_1) => T_1) | (() => APIError[]);
  /** X-Filter */
  export const setXFilter: (xFilter: any) => <T>(obj: T) => T;
  /** Generator */
  export const requestGenerator: <T>(...fns: Function[]) => AxiosPromise<T>;
  /**
   * Mock Error Function
   *
   * Use this function in place of your API request to mock errors. This returns the same
   * same response body as an Axios error.
   *
   * @example getLinodes = () => mockAPIError();
   * @example getLinode = () => mockAPIError(404, 'Not Found');
   * @example getLinodes = () => mockAPIError(404, 'Not Found');
   */
  export const mockAPIError: (status?: number, statusText?: string, data?: any) => Promise<AxiosError<any>>;
  /**
   *
   * Helper method to easily generate APIError[] for a number of fields and a general error.
   */
  export const mockAPIFieldErrors: (fields: string[]) => APIError[];
  /**
   * POC * POC * POC * POC * POC * POC * POC *
   */
  interface CancellableRequest<T> {
      request: () => Promise<T>;
      cancel: () => void;
  }
  export const CancellableRequest: <T>(...fns: Function[]) => CancellableRequest<T>;
  export default requestGenerator;

}
declare module 'linode-js-sdk/stackscripts/index' {
  export * from 'linode-js-sdk/stackscripts/types';
  export * from 'linode-js-sdk/stackscripts/stackscripts';
  export * from 'linode-js-sdk/stackscripts/stackscripts';

}
declare module 'linode-js-sdk/stackscripts/stackscripts' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { StackScript, StackScriptPayload } from 'linode-js-sdk/stackscripts/types';
  /**
   * Returns a paginated list of StackScripts.
   *
   */
  export const getStackScripts: (params?: any, filter?: any) => Promise<Page<StackScript>>;
  /**
   * Returns all of the information about a specified StackScript, including the contents of the script.
   *
   * @param stackscriptId { string } ID of the Image to look up.
   */
  export const getStackScript: (stackscriptId: number) => Promise<StackScript>;
  /**
   * Creates a StackScript in your Account.
   *
   * @param payload { object }
   * @param payload.script { string } The script to execute when provisioning a new Linode with this StackScript.
   * @param payload.label { string } The StackScript's label is for display purposes only.
   * @param payload.images { string[] } An array of Image IDs representing the Images that this StackScript
   * is compatible for deploying with.
   * @param payload.description { string } A description for the StackScript.
   * @param payload.is_public { boolean } This determines whether other users can use your StackScript.
   * Once a StackScript is made public, it cannot be made private.
   * @param payload.rev_note { string } This field allows you to add notes for the set of revisions
   * made to this StackScript.
   */
  export const createStackScript: (payload: StackScriptPayload) => Promise<StackScript>;
  /**
   * Updates a StackScript.
   *
   * @param stackscriptId { string } The ID of the StackScript to update.
   * @param payload { object }
   * @param payload.script { string } The script to execute when provisioning a new Linode with this StackScript.
   * @param payload.label { string } The StackScript's label is for display purposes only.
   * @param payload.images { string[] } An array of Image IDs representing the Images that this StackScript
   * is compatible for deploying with.
   * @param payload.description { string } A description for the StackScript.
   * @param payload.is_public { boolean } This determines whether other users can use your StackScript.
   * Once a StackScript is made public, it cannot be made private.
   * @param payload.rev_note { string } This field allows you to add notes for the set of revisions
   * made to this StackScript.
   */
  export const updateStackScript: (stackscriptId: number, payload: Partial<StackScriptPayload>) => Promise<StackScript>;
  /**
   * Deletes a private StackScript you have permission to read_write. You cannot delete a public StackScript.
   *
   * @param stackscriptId { string } The ID of the StackScript to delete.
   */
  export const deleteStackScript: (stackscriptId: number) => Promise<{}>;

}
declare module 'linode-js-sdk/stackscripts/stackscripts.schema' {
  export const stackScriptSchema: import("yup").ObjectSchema<{
      script: string;
      label: string;
      images: string[];
      description: string;
      is_public: boolean;
      rev_note: string;
  }>;
  export const updateStackScriptSchema: import("yup").ObjectSchema<{
      script: string;
      label: string;
      images: string[];
      description: string;
      is_public: boolean;
      rev_note: string;
  }>;

}
declare module 'linode-js-sdk/stackscripts/types' {
  export interface StackScriptPayload {
      script: string;
      label: string;
      images: string[];
      description?: string;
      is_public?: boolean;
      rev_note?: string;
  }
  export interface StackScript {
      deployments_active: number;
      id: number;
      user_gravatar_id: string;
      label: string;
      description: string;
      images: string[];
      deployments_total: number;
      username: string;
      is_public: boolean;
      created: string;
      updated: string;
      rev_note: string;
      script: string;
      user_defined_fields: UserDefinedField[];
      ordinal: number;
      logo_url: string;
  }
  export interface UserDefinedField {
      label: string;
      name: string;
      example?: string;
      oneof?: string;
      manyof?: string;
      default?: string;
  }

}
declare module 'linode-js-sdk/support/index' {
  export * from 'linode-js-sdk/support/types';
  export * from 'linode-js-sdk/support/support';
  export * from 'linode-js-sdk/support/support';

}
declare module 'linode-js-sdk/support/support' {
  import { SupportReply, SupportTicket } from 'linode-js-sdk/account/index';
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { ReplyRequest, TicketRequest } from 'linode-js-sdk/support/types';
  /**
   * getTickets
   *
   * Base function for retrieving a page of support ticket objects.
   *
   * @param params { Object } any parameters to be sent with the request
   * @param filter { Object } JSON object to be sent as the X-Filter header
   *
   *
   */
  export const getTickets: (params?: any, filter?: any) => import("axios").AxiosPromise<Page<SupportTicket>>;
  /**
   * getTicket
   *
   * Retrieve a single support ticket.
   *
   * @param ticketID { Number } the ID of the ticket to be retrieved
   * @param params { Object } any parameters to be sent with the request
   * @param filter { Object } JSON object to be sent as the X-Filter header
   *
   */
  export const getTicket: (ticketID: number) => Promise<SupportTicket>;
  /**
   * getTicketReplies
   *
   * Get all replies to a single ticket. Returns an
   * array of Reply objects.
   *
   * @param ticketID { Number } the ID of the ticket
   * @param params { Object } any parameters to be sent with the request
   * @param filter { Object } JSON object to be sent as the X-Filter header
   *
   *
   */
  export const getTicketReplies: (ticketId: number, params?: any, filter?: any) => Promise<Page<SupportReply>>;
  /**
   * createSupportTicket
   *
   * Add a new support ticket.
   *
   * @param data { Object } the JSON body for the POST request
   * @param data.summary { string } a summary (or title) for the support ticket
   * @param data.description { string } body text of the support ticket
   *
   */
  export const createSupportTicket: (data: TicketRequest) => Promise<SupportTicket>;
  /**
   * closeSupportTicket
   *
   * Close a single support ticket. This will only succeed if the ticket
   * is marked as "closable," which is a field on the ticket object. Tickets
   * opened by Linode are generally not closable through the API.
   *
   * @param ticketID { Number } the ID of the ticket to be closed
   *
   */
  export const closeSupportTicket: (ticketId: number) => Promise<{}>;
  /**
   * createReply
   *
   * Reply to a support ticket.
   *
   * @param data { Object } the ID of the ticket to be retrieved
   * @param data.ticket_id { number } the ID of the ticket
   * @param data.description { string } the text of the reply
   * @param validate { boolean } whether to run the validation schema against the request
   *
   */
  export const createReply: (data: ReplyRequest) => Promise<SupportReply>;
  /**
   * uploadAttachment
   *
   * Attach an image or other file to a support ticket.
   *
   * @param ticketID { Number } the ID of the ticket to be retrieved
   * @param formData { Object } any parameters to be sent with the request
   *
   */
  export const uploadAttachment: (ticketId: number, formData: FormData) => Promise<{}>;

}
declare module 'linode-js-sdk/support/support.schema' {
  export const createSupportTicketSchema: import("yup").ObjectSchema<{
      summary: string;
      description: string;
      domain_id: number;
      linode_id: number;
      longviewclient_id: number;
      nodebalancer_id: number;
      volume_id: number;
  }>;
  export const createReplySchema: import("yup").ObjectSchema<{
      description: string;
  }>;

}
declare module 'linode-js-sdk/support/support.spec' {
  export {};

}
declare module 'linode-js-sdk/support/types' {
  export interface ReplyRequest {
      ticket_id: number;
      description: string;
  }
  export interface TicketRequest {
      summary: string;
      description: string;
      domain_id?: number;
      linode_id?: number;
      longviewclient_id?: number;
      nodebalancer_id?: number;
      volume_id?: number;
  }

}
declare module 'linode-js-sdk/tags/index' {
  export * from 'linode-js-sdk/tags/tags';
  export * from 'linode-js-sdk/tags/types';

}
declare module 'linode-js-sdk/tags/tags' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { Tag, TagRequest } from 'linode-js-sdk/tags/types';
  export const getTags: (params?: any, filter?: any) => Promise<Page<Tag>>;
  export const createTag: (data: TagRequest) => Promise<Tag>;
  export const deleteTag: (label: string) => Promise<Tag>;

}
declare module 'linode-js-sdk/tags/types' {
  export interface Tag {
      label: string;
  }
  export interface TagRequest {
      label: string;
      linodes?: number[];
  }

}
declare module 'linode-js-sdk/types' {
  export interface APIError {
      field?: string;
      reason: string;
  }
  export interface ConfigOverride {
      baseURL?: string;
  }
  export interface ResourcePage<T> {
      data: T[];
      page: number;
      pages: number;
      results: number;
  }
  export type DeepPartial<T> = {
      [P in keyof T]?: DeepPartial<T[P]>;
  };

}
declare module 'linode-js-sdk/volumes/index' {
  export * from 'linode-js-sdk/volumes/types';
  export * from 'linode-js-sdk/volumes/volumes';
  export * from 'linode-js-sdk/volumes/volumes';

}
declare module 'linode-js-sdk/volumes/types' {
  import { Event } from 'linode-js-sdk/account/types';
  export interface Volume {
      id: number;
      label: string;
      status: VolumeStatus;
      size: number;
      region: string;
      linode_id: null | number;
      created: string;
      updated: string;
      filesystem_path: string;
      recentEvent?: Event;
      tags: string[];
  }
  export type VolumeStatus = 'creating' | 'active' | 'resizing' | 'deleting' | 'deleted' | 'contact_support';
  export interface VolumeRequestPayload {
      label: string;
      size?: number;
      region?: string;
      linode_id?: number;
      config_id?: number;
      tags?: string[];
  }
  export interface AttachVolumePayload {
      linode_id: number;
      config_id?: number;
  }
  export interface CloneVolumePayload {
      label: string;
  }
  export interface ResizeVolumePayload {
      size: number;
  }

}
declare module 'linode-js-sdk/volumes/volumes' {
  import { ResourcePage as Page } from 'linode-js-sdk/types';
  import { AttachVolumePayload, CloneVolumePayload, ResizeVolumePayload, Volume, VolumeRequestPayload } from 'linode-js-sdk/volumes/types';
  /**
   * getVolume
   *
   * Returns detailed information about a single Volume.
   *
   * @param volumeId { number } The ID of the volume to be retrieved.
   */
  export const getVolume: (volumeId: number) => Promise<Volume>;
  /**
   * getVolumes
   *
   * Returns a paginated list of Volumes on your account.
   *
   */
  export const getVolumes: (params?: any, filters?: any) => Promise<Page<Volume>>;
  /**
   * attachVolume
   *
   * Attaches a Volume on your Account to an existing Linode on your Account.
   * The Volume and Linode must both be in the same region.
   *
   * @param volumeId { number } The volume to be attached.
   * @param payload { Object }
   * @param payload.linode_id { number } The ID of the linode to attach the Volume to.
   * @param payload.config_id { number } The configuration profile to include this volume in.
   *   If this value is not provided, the most recently booted Config profile will be chosen.
   */
  export const attachVolume: (volumeId: number, payload: AttachVolumePayload) => Promise<Volume>;
  /**
   * detachVolume
   *
   * Detaches a Volume on your account from a Linode on your account.
   *
   * @param volumeId { number } The Volume to be detached.
   *
   */
  export const detachVolume: (volumeId: number) => Promise<{}>;
  /**
   * deleteVolume
   *
   * Deletes a Volume on your account. This can only be done if the Volume
   * is not currently attached to a Linode.
   *
   * @param volumeId { number } The Volume to be detached.
   *
   */
  export const deleteVolume: (volumeId: number) => Promise<{}>;
  /**
   * cloneVolume
   *
   * Creates a Volume on your Account. In order for this request to complete successfully,
   * your User must have the add_volumes grant.
   * The new Volume will have the same size and data as the source Volume
   *
   * @param volumeId { number } The Volume to be detached.
   * @param data { { label: string } } A label to identify the new volume.
   *
   */
  export const cloneVolume: (volumeId: number, data: CloneVolumePayload) => Promise<Volume>;
  /**
   * resizeVolume
   *
   * Resize an existing Volume on your Account. Volumes can only be resized up.
   *
   * @param volumeId { number } The Volume to be resized.
   * @param data { { size: number } } The size of the Volume (in GiB).
   *
   */
  export const resizeVolume: (volumeId: number, data: ResizeVolumePayload) => Promise<Volume>;
  export interface UpdateVolumeRequest {
      label: string;
      tags?: string[];
  }
  /**
   * updateVolume
   *
   * Detaches a Volume on your account from a Linode on your account.
   *
   * @param volumeId { number } The Volume to be updated.
   * @param data { { label: string; tags: string[] } } The updated label for this Volume.
   *
   */
  export const updateVolume: (volumeId: number, data: UpdateVolumeRequest) => Promise<Volume>;
  /**
   * createVolume
   *
   * Creates a new Volume on your account.
   *
   * @param data { object } The size, label, and region of the new Volume. Can
   * also include a linode_id instead of a region to automatically attach the new Volume
   * to the target Linode.
   *
   */
  export const createVolume: (data: VolumeRequestPayload) => Promise<Volume>;

}
declare module 'linode-js-sdk/volumes/volumes.schema' {
  export const CreateVolumeSchema: import("yup").ObjectSchema<{
      region: string;
      linode_id: number;
      size: number;
      label: string;
      config_id: number;
      tags: string[];
  }>;
  export const CloneVolumeSchema: import("yup").ObjectSchema<{
      label: string;
  }>;
  export const ResizeVolumeSchema: (minSize?: number) => import("yup").ObjectSchema<{
      size: number;
  }>;
  export const UpdateVolumeSchema: import("yup").ObjectSchema<{
      label: string;
  }>;
  export const AttachVolumeSchema: import("yup").ObjectSchema<{
      linode_id: number;
      config_id: number;
  }>;

}
declare module 'linode-js-sdk' {
  import main = require('linode-js-sdk/index');
  export = main;
}