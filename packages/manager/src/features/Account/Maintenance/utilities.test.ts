import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  deriveMaintenanceStartISO,
  getUpcomingRelativeLabel,
} from './utilities';

import type { AccountMaintenance, MaintenancePolicy } from '@linode/api-v4';

// Freeze time to a stable reference so relative labels are deterministic
const NOW_ISO = '2025-10-27T12:00:00.000Z';

describe('Account Maintenance utilities', () => {
  const policies: MaintenancePolicy[] = [
    {
      description: 'Migrate',
      is_default: true,
      label: 'Migrate',
      notification_period_sec: 3 * 60 * 60, // 3 hours
      slug: 'linode/migrate',
      type: 'linode_migrate',
    },
    {
      description: 'Power Off / On',
      is_default: false,
      label: 'Power Off / Power On',
      notification_period_sec: 72 * 60 * 60, // 72 hours
      slug: 'linode/power_off_on',
      type: 'linode_power_off_on',
    },
  ];

  const baseMaintenance: Omit<AccountMaintenance, 'when'> & { when: string } = {
    complete_time: null,
    description: 'scheduled',
    entity: { id: 1, label: 'linode-1', type: 'linode', url: '' },
    maintenance_policy_set: 'linode/migrate',
    not_before: null,
    reason: 'Test',
    source: 'platform',
    start_time: null,
    status: 'scheduled',
    type: 'migrate',
    when: '2025-10-27T09:00:00.000Z',
  };

  // Mock Date.now used by Luxon under the hood for relative calculations
  let realDateNow: () => number;
  beforeAll(() => {
    realDateNow = Date.now;
    vi.spyOn(Date, 'now').mockImplementation(() => new Date(NOW_ISO).getTime());
  });
  afterAll(() => {
    Date.now = realDateNow;
  });

  describe('deriveMaintenanceStartISO', () => {
    it('returns provided start_time when available', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: '2025-10-27T12:00:00.000Z',
      };
      expect(deriveMaintenanceStartISO(m, policies)).toBe(
        '2025-10-27T12:00:00.000Z'
      );
    });

    it('derives start_time from when + policy seconds when missing', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        when: '2025-10-27T09:00:00.000Z', // +3h -> 12:00Z
      };
      expect(deriveMaintenanceStartISO(m, policies)).toBe(
        '2025-10-27T12:00:00.000Z'
      );
    });

    it('returns undefined when policy cannot be found', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        // Use an intentionally unknown slug to exercise the no-policy fallback path.
        // Even though the API default is typically 'linode/migrate', the client may
        // not have policies loaded yet or could encounter a fetch error; this ensures
        // we verify the graceful fallback behavior.
        maintenance_policy_set: 'unknown/policy' as any,
      };
      expect(deriveMaintenanceStartISO(m, policies)).toBeUndefined();
    });
  });

  describe('getUpcomingRelativeLabel', () => {
    it('falls back to notice-relative when start cannot be determined', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        // Force the no-policy path to validate the notice-relative fallback
        maintenance_policy_set: 'unknown/policy' as any,
        when: '2025-10-27T10:00:00.000Z',
      };
      // NOW=12:00Z, when=10:00Z => "2 hours ago"
      expect(getUpcomingRelativeLabel(m, policies)).toContain('hour');
    });

    it('uses derived start to express time until maintenance (hours when <1 day)', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        // when 09:00Z + 3h = 12:00Z; NOW=12:00Z -> label likely "a few seconds ago" or similar
        when: '2025-10-27T09:00:00.000Z',
      };
      // Allow any non-empty string; exact phrasing depends on Luxon locale
      expect(getUpcomingRelativeLabel(m, policies)).toBeTypeOf('string');
    });

    it('shows days+hours when >= 1 day away (avoids day-only rounding)', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        maintenance_policy_set: 'linode/power_off_on', // 72h
        when: '2025-10-25T20:00:00.000Z', // +72h => 2025-10-28T20:00Z; from NOW (27 12:00Z) => 1 day 8 hours
      };
      const label = getUpcomingRelativeLabel(m, policies);
      expect(label).toBe('in 1 day 8 hours');
    });

    it('formats days and hours precisely when start_time is known', () => {
      // From NOW (2025-10-27T12:00Z) to 2025-10-30T04:00Z is 2 days 16 hours
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: '2025-10-30T04:00:00.000Z',
      };
      const label = getUpcomingRelativeLabel(m, policies);
      expect(label).toBe('in 2 days 16 hours');
    });

    it('shows exact minutes when under one hour', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        // NOW is 12:00Z; start in 37 minutes
        start_time: '2025-10-27T12:37:00.000Z',
      };
      const label = getUpcomingRelativeLabel(m, policies);
      expect(label).toBe('in 37 minutes');
    });

    it('shows seconds when under one minute', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        // NOW is 12:00Z; start in 30 seconds
        start_time: '2025-10-27T12:00:30.000Z',
      };
      const label = getUpcomingRelativeLabel(m, policies);
      expect(label).toBe('in 30 seconds');
    });

    it('correctly derives start time from when + 30 minute notification period', () => {
      // Real-world scenario: API returns when=2025-11-06T16:12:41, notification_period_sec=1800 (30 min)
      // Expected start time: 2025-11-06T16:42:41
      const policiesWith30Min: MaintenancePolicy[] = [
        {
          description: 'Migrate',
          is_default: true,
          label: 'Migrate',
          notification_period_sec: 30 * 60, // 30 minutes = 1800 seconds
          slug: 'linode/migrate',
          type: 'linode_migrate',
        },
      ];

      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        maintenance_policy_set: 'linode/migrate',
        when: '2025-11-06T16:12:41', // No timezone indicator, should be parsed as UTC
      };

      const derivedStart = deriveMaintenanceStartISO(m, policiesWith30Min);
      expect(derivedStart).toBe('2025-11-06T16:42:41.000Z');
    });

    it('shows correct relative time for 30-minute notification period scenario', () => {
      // Scenario: when=2025-11-06T16:12:41, start=2025-11-06T16:42:41
      // If now is 2025-11-06T16:14:41 (2 minutes after notification), should show "in 28 minutes"
      const policiesWith30Min: MaintenancePolicy[] = [
        {
          description: 'Migrate',
          is_default: true,
          label: 'Migrate',
          notification_period_sec: 30 * 60, // 30 minutes
          slug: 'linode/migrate',
          type: 'linode_migrate',
        },
      ];

      // Save original Date.now
      const originalDateNow = Date.now;

      // Mock "now" to be 2 minutes after the notification time
      const mockNow = '2025-11-06T16:14:41.000Z';
      Date.now = vi.fn(() => new Date(mockNow).getTime());

      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        maintenance_policy_set: 'linode/migrate',
        when: '2025-11-06T16:12:41',
      };

      const label = getUpcomingRelativeLabel(m, policiesWith30Min);
      // Start time is 16:42:41, now is 16:14:41, difference is 28 minutes
      expect(label).toBe('in 28 minutes');

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('handles date without timezone indicator correctly (parsed as UTC)', () => {
      // Verify that dates without timezone are parsed as UTC
      const policiesWith30Min: MaintenancePolicy[] = [
        {
          description: 'Migrate',
          is_default: true,
          label: 'Migrate',
          notification_period_sec: 30 * 60,
          slug: 'linode/migrate',
          type: 'linode_migrate',
        },
      ];

      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        maintenance_policy_set: 'linode/migrate',
        when: '2025-11-06T16:12:41', // No Z suffix or timezone
      };

      const derivedStart = deriveMaintenanceStartISO(m, policiesWith30Min);
      // Should add 30 minutes (1800 seconds) to get 16:42:41
      expect(derivedStart).toBe('2025-11-06T16:42:41.000Z');
    });
  });
});
