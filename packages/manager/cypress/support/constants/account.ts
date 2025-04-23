/**
 * Data loss warning which is displayed in the account cancellation dialog.
 */
export const cancellationDataLossWarning =
  'This is an extremely destructive action. All services, Linodes, volumes, \
DNS records, and user accounts will be permanently lost.';

/**
 * Title text displayed in the account cancellation confirmation dialog.
 */
export const cancellationDialogTitle =
  'Are you sure you want to close your Akamai cloud \
computing services account?';

/**
 * Error message that appears when a payment failure occurs upon cancellation attempt.
 */
export const cancellationPaymentErrorMessage =
  'We were unable to charge your credit card for services rendered. \
We cannot cancel this account until the balance has been paid.';

/**
 * Error message that appears when typing an error SSH key.
 */
export const sshFormatErrorMessage =
  'SSH Key key-type must be ssh-dss, ssh-rsa, ecdsa-sha2-nistp, ssh-ed25519, or sk-ecdsa-sha2-nistp256.';

/**
 * Helper text that appears above the login history table.
 */
export const loginHelperText =
  'Logins across all users on your account over the last 90 days.';

/**
 * Empty state message that appears when there is no item in the login history table.
 */
export const loginEmptyStateMessageText = 'No account logins';

/**
 * Warning message that appears when users is trying to enable Linode Managed.
 */
export const linodeEnabledMessageText = (count: number): string => {
  return `Linode Managed costs an additional $100 per month per Linode.  You currently have ${count} Linodes, so Managed will increase your projected monthly bill by $${
    100 * count
  }.`;
};

/**
 * Message that tells the Linode Managed is enabled.
 */
export const linodeManagedStateMessageText =
  'Managed is already enabled on your account';
