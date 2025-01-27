import type { AlertStatusType } from '@linode/api-v4';

/**
 * `statusMap` is a TypeScript object that maps alert status types (represented by `AlertStatusType`)
 * to their corresponding human-readable string labels.
 *
 * This mapping is useful for converting internal alert status values (such as 'disabled' and 'enabled')
 * into more user-friendly or display-friendly strings ('Disabled' and 'Enabled'), which can be
 * shown in UI elements, logs, or reports.
 *
 * The key of the map is of type `AlertStatusType`, which represents different states an alert can have.
 * The value is a string that represents the display-friendly status of the alert.
 *
 * Example:
 * - If the status of an alert is 'disabled', it will be displayed as 'Disabled' on the UI.
 * - If the status of an alert is 'enabled', it will be displayed as 'Enabled' on the UI.
 *
 * @example
 * const status = statusMap['enabled']; // Returns: 'Enabled'
 *
 * @type {Record<AlertStatusType, string>}
 */

export const statusMap: Record<AlertStatusType, string> = {
  disabled: 'Disabled',
  enabled: 'Enabled',
};
