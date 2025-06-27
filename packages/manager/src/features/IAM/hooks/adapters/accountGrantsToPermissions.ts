import type {
  AccountAdmin,
  GlobalGrantTypes,
  GrantLevel,
} from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
// list_vpcs_ip_addresses returned by API
// upload_image returned by API
export const accountGrantsToPermissions = (
  globalGrants?: Record<GlobalGrantTypes, boolean | GrantLevel>,
  isRestricted?: boolean
): Record<AccountAdmin, boolean> => {
  const unrestricted = isRestricted === false;
  const hasWriteAccess =
    globalGrants?.account_access === 'read_write' || unrestricted;
  const hasReadAccess =
    globalGrants?.account_access === 'read_only' || hasWriteAccess;

  return {
    // AccountAdmin
    accept_service_transfer: unrestricted,
    answer_profile_security_questions: true, // Not returned by API
    cancel_account: unrestricted || globalGrants?.cancel_account,
    cancel_service_transfer: unrestricted,
    create_profile_pat: true, // Not returned by API
    create_profile_ssh_key: true, // Not returned by API
    create_profile_tfa_secret: true, // Not returned by API
    create_service_transfer: unrestricted,
    create_user: unrestricted,
    delete_profile_pat: true, // Not returned by API
    delete_profile_phone_number: true, // Not returned by API
    delete_profile_ssh_key: true, // Not returned by API
    delete_user: false, // Not returned by API
    disable_profile_tfa: true, // Not returned by API
    enable_managed: unrestricted,
    enable_profile_tfa: true, // Not returned by API
    enroll_beta_program: unrestricted,
    is_account_admin: unrestricted,
    revoke_profile_app: true, // Not returned by API
    revoke_profile_device: true, // Not returned by API
    send_profile_phone_number_verification_code: true, // Not returned by API
    update_account: unrestricted,
    update_account_settings: unrestricted,
    update_profile: true, // Not returned by API
    update_profile_pat: true, // Not returned by API
    update_profile_ssh_key: true, // Not returned by API
    update_user: false, // Not returned by API
    update_user_grants: false, // Not returned by API
    update_user_preferences: true, // Not returned by API
    verify_profile_phone_number: true, // Not returned by API
    // AccountViewer
    list_account_agreements: unrestricted,
    list_account_logins: unrestricted,
    list_available_services: unrestricted,
    list_default_firewalls: unrestricted,
    list_enrolled_beta_programs: true, // Not returned by API
    list_service_transfers: unrestricted,
    list_user_grants: false, // Not returned by API
    view_account: unrestricted,
    view_account_login: unrestricted,
    view_account_settings: unrestricted,
    view_enrolled_beta_program: unrestricted,
    view_network_usage: unrestricted,
    view_region_available_service: unrestricted,
    view_service_transfer: unrestricted,
    view_user: true, // Not returned by API
    view_user_preferences: true, // Not returned by API
    // AccountBillingAdmin
    create_payment_method: hasWriteAccess,
    create_promo_code: hasWriteAccess,
    delete_payment_method: hasWriteAccess,
    make_billing_payment: hasWriteAccess,
    set_default_payment_method: hasWriteAccess,
    // AccountBillingViewer
    list_billing_invoices: hasReadAccess,
    list_billing_payments: hasReadAccess,
    list_invoice_items: hasReadAccess,
    list_payment_methods: hasReadAccess,
    view_billing_invoice: hasReadAccess,
    view_billing_payment: hasReadAccess,
    view_payment_method: hasReadAccess,
    // AccountEventViewer
    list_events: true,
    mark_event_seen: true,
    view_event: true,
    // AccountFirewallAdmin
    create_firewall: unrestricted || globalGrants?.add_firewalls,
    // AccountLinodeAdmin
    create_linode: unrestricted || globalGrants?.add_linodes,
    // AccountMaintenanceViewer
    list_maintenances: true,
    // AccountNotificationViewer
    list_notifications: true,
    // AccountOauthClientAdmin
    create_oauth_client: true,
    delete_oauth_client: true,
    reset_oauth_client_secret: true,
    update_oauth_client: true, // Not returned by API
    update_oauth_client_thumbnail: true,
    // AccountOauthClientViewer
    list_oauth_clients: true,
    view_oauth_client: true,
    view_oauth_client_thumbnail: true,
    // AccountProfileViewer
    list_profile_apps: true, // Not returned by API
    list_profile_devices: true, // Not returned by API
    list_profile_grants: true, // Not returned by API
    list_profile_logins: true, // Not returned by API
    list_profile_pats: true, // Not returned by API
    list_profile_security_questions: true, // Not returned by API
    list_profile_ssh_keys: true, // Not returned by API
    view_profile: true, // Not returned by API
    view_profile_app: true, // Not returned by API
    view_profile_device: true, // Not returned by API
    view_profile_login: true, // Not returned by API
    view_profile_pat: true, // Not returned by API
    view_profile_ssh_key: true, // Not returned by API
  } as Record<AccountAdmin, boolean>;
};
