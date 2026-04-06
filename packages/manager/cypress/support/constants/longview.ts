/**
 * Timeout when installing Longview client on a Linode.
 *
 * Equates to 4 minutes and 15 seconds.
 */
export const longviewInstallTimeout = 255000;

/**
 * Timeout when waiting for a Longview client's status to be updated.
 *
 * Equates to 1 minute.
 */
export const longviewStatusTimeout = 60000;

/**
 * Message that will be displayed when no clients are present.
 */
export const longviewEmptyStateMessage =
  'You have no Longview clients configured.';

/**
 * Button text to add a new Longview client.
 */
export const longviewAddClientButtonText = 'Click here to add one.';
