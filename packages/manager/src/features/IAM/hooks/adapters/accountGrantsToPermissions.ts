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
  const unrestricted = isRestricted === false; // explicit === false since the profile can be undefined
  const hasWriteAccess =
    globalGrants?.account_access === 'read_write' || unrestricted;
  const hasReadAccess =
    globalGrants?.account_access === 'read_only' || hasWriteAccess;

  return {
    // AccountAdmin
    accept_service_transfer: unrestricted,
    acknowledge_account_agreement: hasWriteAccess,
    cancel_account: hasWriteAccess || globalGrants?.cancel_account,
    cancel_service_transfer: unrestricted,
    create_service_transfer: unrestricted,
    create_user: unrestricted,
    delete_user: unrestricted, // TODO: verify mapping as this is not in the API
    enable_managed: hasWriteAccess,
    enroll_beta_program: unrestricted,
    is_account_admin: unrestricted,
    update_account: hasWriteAccess,
    update_account_settings: hasWriteAccess,
    update_user: unrestricted, // TODO: verify mapping as this is not in the API
    update_user_grants: unrestricted, // TODO: verify mapping as this is not in the API
    // AccountViewer
    list_account_agreements: unrestricted,
    list_account_logins: unrestricted,
    list_available_services: unrestricted,
    list_default_firewalls: unrestricted,
    list_service_transfers: unrestricted,
    list_user_grants: unrestricted, // TODO: verify mapping as this is not in the API
    view_account: unrestricted,
    view_account_login: unrestricted,
    view_account_settings: unrestricted,
    view_enrolled_beta_program: unrestricted,
    view_network_usage: unrestricted,
    view_region_available_service: unrestricted,
    view_service_transfer: unrestricted,
    view_user: true, // TODO: verify mapping as this is not in the API
    view_user_preferences: true, // TODO: verify mapping as this is not in the API
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
    // AccountFirewallAdmin
    create_firewall: unrestricted || globalGrants?.add_firewalls,
    // AccountLinodeAdmin
    create_linode: unrestricted || globalGrants?.add_linodes,
    // AccountOAuthClientAdmin
    create_oauth_client: true,
    update_oauth_client: true,
    delete_oauth_client: true,
    reset_oauth_client_secret: true,
  } as Record<AccountAdmin, boolean>;
};
