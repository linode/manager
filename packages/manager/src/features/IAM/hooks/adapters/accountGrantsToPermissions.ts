import type {
  AccountAdmin,
  GlobalGrantTypes,
  GrantLevel,
} from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const accountGrantsToPermissions = (
  globalGrants: Record<GlobalGrantTypes, boolean | GrantLevel>
): Record<AccountAdmin, boolean> => {
  return {
    // AccountAdmin
    accept_service_transfer: Boolean(globalGrants.account_access),
    acknowledge_account_agreement: Boolean(globalGrants.account_access),
    answer_profile_security_questions: Boolean(globalGrants.account_access),
    cancel_account: Boolean(globalGrants.cancel_account),
    cancel_service_transfer: Boolean(globalGrants.account_access),
    create_profile_pat: Boolean(globalGrants.account_access),
    create_profile_ssh_key: Boolean(globalGrants.account_access),
    create_profile_tfa_secret: Boolean(globalGrants.account_access),
    create_service_transfer: Boolean(globalGrants.account_access),
    create_user: Boolean(globalGrants.account_access),
    delete_profile_pat: Boolean(globalGrants.account_access),
    delete_profile_phone_number: Boolean(globalGrants.account_access),
    delete_profile_ssh_key: Boolean(globalGrants.account_access),
    delete_user: Boolean(globalGrants.account_access),
    disable_profile_tfa: Boolean(globalGrants.account_access),
    enable_managed: Boolean(globalGrants.account_access),
    enable_profile_tfa: Boolean(globalGrants.account_access),
    enroll_beta_program: Boolean(globalGrants.account_access),
    is_account_admin: Boolean(globalGrants.account_access),
    // AccountViewer
    list_account_agreements: Boolean(globalGrants.account_access),
    list_account_logins: Boolean(globalGrants.account_access),
    list_available_services: Boolean(globalGrants.account_access),
    list_default_firewalls: Boolean(globalGrants.account_access),
    list_enrolled_beta_programs: Boolean(globalGrants.account_access),
    list_service_transfers: Boolean(globalGrants.account_access),
    list_user_grants: Boolean(globalGrants.account_access),
    revoke_profile_app: Boolean(globalGrants.account_access),
    revoke_profile_device: Boolean(globalGrants.account_access),
    send_profile_phone_number_verification_code: Boolean(
      globalGrants.account_access
    ),
    update_account: Boolean(globalGrants.account_access),
    update_account_settings: Boolean(globalGrants.account_access),
    update_profile: true, // No grant equivalent
    update_profile_pat: true, // No grant equivalent
    update_profile_ssh_key: true, // No grant equivalent
    update_user: Boolean(globalGrants.account_access),
    update_user_grants: Boolean(globalGrants.account_access),
    update_user_preferences: true, // No grant equivalent
    verify_profile_phone_number: Boolean(globalGrants.account_access),
    view_account: Boolean(globalGrants.account_access),
    view_account_login: Boolean(globalGrants.account_access),
    view_account_settings: Boolean(globalGrants.account_access),
    view_enrolled_beta_program: Boolean(globalGrants.account_access),
    view_network_usage: Boolean(globalGrants.account_access),
    view_region_available_service: Boolean(globalGrants.account_access),
    view_service_transfer: Boolean(globalGrants.account_access),
    view_user: Boolean(globalGrants.account_access),
    view_user_preferences: Boolean(globalGrants.account_access),
    create_payment_method: Boolean(globalGrants.account_access),
    create_promo_code: Boolean(globalGrants.account_access),
    delete_payment_method: Boolean(globalGrants.account_access),
    make_billing_payment: Boolean(globalGrants.account_access),
    set_default_payment_method: Boolean(globalGrants.account_access),
    list_billing_invoices: Boolean(globalGrants.account_access),
    list_billing_payments: Boolean(globalGrants.account_access),
    list_invoice_items: Boolean(globalGrants.account_access),
    list_payment_methods: Boolean(globalGrants.account_access),
    view_billing_invoice: Boolean(globalGrants.account_access),
    view_billing_payment: Boolean(globalGrants.account_access),
    view_payment_method: Boolean(globalGrants.account_access),
    // AccountEventViewer
    list_events: true, // No grant equivalent
    mark_event_seen: true, // No grant equivalent
    view_event: true, // No grant equivalent
    // AccountFirewallAdmin
    create_firewall: Boolean(globalGrants.add_firewalls),
    // AccountLinodeAdmin
    create_linode: Boolean(globalGrants.add_linodes),
    // AccountMaintenanceViewer
    list_maintenances: true, // No grant equivalent
    // AccountNotificationViewer
    list_notifications: true, // No grant equivalent
    // AccountOauthClientAdmin
    create_oauth_client: Boolean(globalGrants.account_access),
    delete_oauth_client: Boolean(globalGrants.account_access),
    reset_oauth_client_secret: Boolean(globalGrants.account_access),
    update_oauth_client: Boolean(globalGrants.account_access),
    update_oauth_client_thumbnail: Boolean(globalGrants.account_access),
    // AccountOauthClientViewer
    list_oauth_clients: Boolean(globalGrants.account_access),
    view_oauth_client: Boolean(globalGrants.account_access),
    view_oauth_client_thumbnail: Boolean(globalGrants.account_access),
    // AccountProfileViewer
    list_profile_apps: true, // No grant equivalent
    list_profile_devices: true, // No grant equivalent
    list_profile_grants: true, // No grant equivalent
    list_profile_logins: true, // No grant equivalent
    list_profile_pats: true, // No grant equivalent
    list_profile_security_questions: true, // No grant equivalent
    list_profile_ssh_keys: true, // No grant equivalent
    view_profile: true, // No grant equivalent
    view_profile_app: true, // No grant equivalent
    view_profile_device: true, // No grant equivalent
    view_profile_login: true, // No grant equivalent
    view_profile_pat: true, // No grant equivalent
    view_profile_ssh_key: true, // No grant equivalent
  } as Record<AccountAdmin, boolean>;
};
