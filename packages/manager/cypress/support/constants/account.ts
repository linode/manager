import { CANCELLATION_DATA_LOSS_WARNING } from 'src/features/Account/constants';

/**
 * Data loss warning which is displayed in the account cancellation dialog.
 */
export const cancellationDataLossWarning = CANCELLATION_DATA_LOSS_WARNING;

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
