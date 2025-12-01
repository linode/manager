import { pluralize } from '@linode/utilities';
import { DateTime } from 'luxon';

import { parseAPIDate } from 'src/utilities/date';

import type { MaintenanceTableType } from './MaintenanceTable';
import type { AccountMaintenance } from '@linode/api-v4';

export const COMPLETED_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['completed', 'canceled'] },
});

export const IN_PROGRESS_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['in_progress', 'started'] },
});

export const UPCOMING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'scheduled'] },
});

export const PENDING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started', 'scheduled'] },
});

export const PENDING_AND_IN_PROGRESS_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started', 'scheduled', 'in_progress'] },
});

export const PLATFORM_MAINTENANCE_TYPE =
  'security_reboot_maintenance_scheduled';

export const PLATFORM_MAINTENANCE_REASON_MATCH = [
  'critical platform update',
  'critical security update',
];

export const maintenanceDateColumnMap: Record<
  MaintenanceTableType,
  ['complete_time' | 'start_time' | 'when', string]
> = {
  completed: ['complete_time', 'End Date'],
  'in progress': ['start_time', 'Start Date'],
  upcoming: ['when', 'Start Date'],
  pending: ['when', 'Date'],
};

// Helper functions for better readability
export const getMaintenanceDateField = (
  type: MaintenanceTableType
): 'complete_time' | 'start_time' | 'when' => {
  return maintenanceDateColumnMap[type][0];
};

export const getMaintenanceDateLabel = (type: MaintenanceTableType): string => {
  return maintenanceDateColumnMap[type][1];
};

/**
 * Derive the maintenance start timestamp.
 *
 * The `when` and `start_time` fields are equivalent timestamps representing
 * when the maintenance will happen (or has happened). Prefer `start_time` if
 * available, otherwise use `when`.
 */
export const deriveMaintenanceStartISO = (
  maintenance: AccountMaintenance
): string | undefined => {
  if (maintenance.start_time) {
    return maintenance.start_time;
  }

  if (!maintenance.when) {
    return undefined;
  }

  // `when` is a timestamp equivalent to `start_time`
  try {
    return parseAPIDate(maintenance.when).toISO();
  } catch {
    return undefined;
  }
};

/**
 * Build a user-friendly relative label for the Upcoming table.
 *
 * Behavior:
 * - Uses `start_time` if available, otherwise uses `when` (both are equivalent timestamps)
 * - Avoids day-only rounding by showing days + hours when >= 1 day
 *
 * Formatting rules:
 * - "in X days Y hours" when >= 1 day
 * - "in X hours" when >= 1 hour and < 1 day
 * - "in N minutes" when < 1 hour
 * - "in N seconds" when < 1 minute
 */
export const getUpcomingRelativeLabel = (
  maintenance: AccountMaintenance
): string => {
  const startISO = deriveMaintenanceStartISO(maintenance);

  // Use the derived start timestamp (from start_time or when)
  const targetDT = startISO
    ? parseAPIDate(startISO)
    : maintenance.when
      ? parseAPIDate(maintenance.when)
      : null;

  if (!targetDT) {
    return '—';
  }

  const now = DateTime.utc();
  if (targetDT <= now) {
    return targetDT.toRelative() ?? '—';
  }

  // Avoid day-only rounding near boundaries by including hours alongside days.
  // For times under an hour, show exact minutes remaining; under a minute, show seconds.
  const diff = targetDT
    .diff(now, ['days', 'hours', 'minutes', 'seconds'])
    .toObject();
  let days = Math.floor(diff.days ?? 0);
  let hours = Math.floor(diff.hours ?? 0);
  let minutes = Math.round(diff.minutes ?? 0);
  const seconds = Math.round(diff.seconds ?? 0);

  // Normalize minute/hour boundaries
  if (minutes === 60) {
    hours += 1;
    minutes = 0;
  }
  if (hours === 24) {
    days += 1;
    hours = 0;
  }

  // Round up hours when we have significant minutes (>= 30) for better accuracy
  if (days >= 1 && minutes >= 30) {
    hours += 1;
    minutes = 0;
    // Check if rounding caused hours to overflow
    if (hours === 24) {
      days += 1;
      hours = 0;
    }
  }

  if (days >= 1) {
    const dayPart = pluralize('day', 'days', days);
    const hourPart = hours ? ` ${pluralize('hour', 'hours', hours)}` : '';
    return `in ${dayPart}${hourPart}`;
  }

  if (hours >= 1) {
    return `in ${pluralize('hour', 'hours', hours)}`;
  }

  // Under one hour: show minutes; under one minute: show seconds
  if (minutes === 0) {
    return `in ${pluralize('second', 'seconds', Math.max(0, seconds))}`;
  }
  return `in ${pluralize('minute', 'minutes', Math.max(0, minutes))}`;
};
