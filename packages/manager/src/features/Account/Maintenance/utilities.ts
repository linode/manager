import { pluralize } from '@linode/utilities';
import { DateTime } from 'luxon';

import { parseAPIDate } from 'src/utilities/date';

import type { MaintenanceTableType } from './MaintenanceTable';
import type { AccountMaintenance, MaintenancePolicy } from '@linode/api-v4';

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
 * Derive the maintenance start when API `start_time` is absent by adding the
 * policy notification window to the `when` (notice publish time).
 */
export const deriveMaintenanceStartISO = (
  maintenance: AccountMaintenance,
  policies?: MaintenancePolicy[]
): string | undefined => {
  if (maintenance.start_time) {
    return maintenance.start_time;
  }
  const notificationSecs = policies?.find(
    (p) => p.slug === maintenance.maintenance_policy_set
  )?.notification_period_sec;
  if (maintenance.when && notificationSecs) {
    try {
      return parseAPIDate(maintenance.when)
        .plus({ seconds: notificationSecs })
        .toISO();
    } catch {
      return undefined;
    }
  }
  return undefined;
};

/**
 * Build a user-friendly relative label for the Upcoming table.
 *
 * Behavior:
 * - Prefers the actual or policy-derived start time to express time until maintenance
 * - Falls back to the notice relative time when the start cannot be determined
 * - Avoids day-only rounding by showing days + hours when >= 1 day
 *
 * Formatting rules:
 * - "in X days Y hours" when >= 1 day
 * - "in X hours" when >= 1 hour and < 1 day
 * - "in N minutes" when < 1 hour
 * - "in N seconds" when < 1 minute
 */
export const getUpcomingRelativeLabel = (
  maintenance: AccountMaintenance,
  policies?: MaintenancePolicy[]
): string => {
  const startISO = deriveMaintenanceStartISO(maintenance, policies);

  // Fallback: when start cannot be determined, show the notice time relative to now
  if (!startISO) {
    return maintenance.when
      ? (parseAPIDate(maintenance.when).toRelative() ?? '—')
      : '—';
  }

  // Prefer the actual or policy-derived start time to express "time until maintenance"
  const startDT = parseAPIDate(startISO);
  const now = DateTime.local();
  if (startDT <= now) {
    return startDT.toRelative() ?? '—';
  }

  // Avoid day-only rounding near boundaries by including hours alongside days.
  // For times under an hour, show exact minutes remaining; under a minute, show seconds.
  const diff = startDT
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
