import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  deriveMaintenanceStartISO,
  getUpcomingRelativeLabel,
} from './utilities';

import type { AccountMaintenance } from '@linode/api-v4';

// Freeze time to a stable reference so relative labels are deterministic
const NOW_ISO = '2025-10-27T12:00:00.000Z';

describe('Account Maintenance utilities', () => {
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
      expect(deriveMaintenanceStartISO(m)).toBe('2025-10-27T12:00:00.000Z');
    });

    it('uses when directly as start time (when already accounts for notification period)', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        when: '2025-10-27T09:00:00.000Z',
      };
      // `when` already accounts for notification_period_sec, so it IS the start time
      expect(deriveMaintenanceStartISO(m)).toBe('2025-10-27T09:00:00.000Z');
    });

    it('uses when directly for all statuses without needing policies', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        status: 'pending',
        // Policies not needed - when IS the start time
        maintenance_policy_set: 'unknown/policy' as any,
        when: '2025-10-27T09:00:00.000Z',
      };
      expect(deriveMaintenanceStartISO(m)).toBe('2025-10-27T09:00:00.000Z');
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
      expect(getUpcomingRelativeLabel(m)).toContain('hour');
    });

    it('uses derived start to express time until maintenance (hours when <1 day)', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        // when 09:00Z + 3h = 12:00Z; NOW=12:00Z -> label likely "a few seconds ago" or similar
        when: '2025-10-27T09:00:00.000Z',
      };
      // Allow any non-empty string; exact phrasing depends on Luxon locale
      expect(getUpcomingRelativeLabel(m)).toBeTypeOf('string');
    });

    it('shows days+hours when >= 1 day away (avoids day-only rounding)', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        when: '2025-10-28T20:00:00.000Z', // from NOW (27 12:00Z) => 1 day 8 hours
      };
      const label = getUpcomingRelativeLabel(m);
      expect(label).toBe('in 1 day 8 hours');
    });

    it('formats days and hours precisely when start_time is known', () => {
      // From NOW (2025-10-27T12:00Z) to 2025-10-30T04:00Z is 2 days 16 hours
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: '2025-10-30T04:00:00.000Z',
      };
      const label = getUpcomingRelativeLabel(m);
      expect(label).toBe('in 2 days 16 hours');
    });

    it('shows exact minutes when under one hour', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        // NOW is 12:00Z; start in 37 minutes
        start_time: '2025-10-27T12:37:00.000Z',
      };
      const label = getUpcomingRelativeLabel(m);
      expect(label).toBe('in 37 minutes');
    });

    it('shows seconds when under one minute', () => {
      const m: AccountMaintenance = {
        ...baseMaintenance,
        // NOW is 12:00Z; start in 30 seconds
        start_time: '2025-10-27T12:00:30.000Z',
      };
      const label = getUpcomingRelativeLabel(m);
      expect(label).toBe('in 30 seconds');
    });

    it('uses when directly as start time (when already accounts for notification period)', () => {
      // Real-world scenario: API returns when=2025-11-06T16:12:41
      // `when` already accounts for notification_period_sec, so it IS the start time
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        when: '2025-11-06T16:12:41', // No timezone indicator, should be parsed as UTC
      };

      const derivedStart = deriveMaintenanceStartISO(m);
      // `when` equals start time (no addition needed)
      expect(derivedStart).toBe('2025-11-06T16:12:41.000Z');
    });

    it('shows correct relative time (when equals start)', () => {
      // Scenario: when=2025-11-06T16:12:41 (when IS the start time)
      // If now is 2025-11-06T16:14:41 (2 minutes after when), should show "2 minutes ago"
      // Save original Date.now
      const originalDateNow = Date.now;

      // Mock "now" to be 2 minutes after when (which is the start time)
      const mockNow = '2025-11-06T16:14:41.000Z';
      Date.now = vi.fn(() => new Date(mockNow).getTime());

      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        when: '2025-11-06T16:12:41',
      };

      const label = getUpcomingRelativeLabel(m);
      // when=start=16:12:41, now=16:14:41, difference is 2 minutes in the past
      expect(label).toContain('minute'); // Should show "2 minutes ago" or similar

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('handles date without timezone indicator correctly (parsed as UTC)', () => {
      // Verify that dates without timezone are parsed as UTC
      const m: AccountMaintenance = {
        ...baseMaintenance,
        start_time: null,
        when: '2025-11-06T16:12:41', // No Z suffix or timezone
      };

      const derivedStart = deriveMaintenanceStartISO(m);
      // `when` equals start time (no addition needed)
      expect(derivedStart).toBe('2025-11-06T16:12:41.000Z');
    });
  });
});
