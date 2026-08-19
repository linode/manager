import { DateTimeRangePicker } from '@linode/ui';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CloudPulseIntervalSelect,
  getDurationInSeconds,
  getIntervalOptionInSeconds,
  PRESET_TO_INTERVALS_MAP,
} from './CloudPulseIntervalSelect';

/** Builds a DateTimeWithPreset spanning the given number of seconds ending now. */
const makeDuration = (durationSeconds: number) => ({
  end: new Date().toISOString(),
  start: new Date(Date.now() - durationSeconds * 1000).toISOString(),
});

/** data-testid of the CloudPulseTooltip wrapper around the interval select. */
const INTERVAL_TOOLTIP_TESTID = 'Data aggregation interval';

/** Opens the Autocomplete dropdown via the 'Open' button. */
const openDropdown = async (container: HTMLElement) => {
  const user = userEvent.setup();
  await user.click(within(container).getByRole('button', { name: 'Open' }));
};

describe('Interval select component', () => {
  // ─── Utility: getIntervalOptionInSeconds ───────────────────────────────────
  describe('getIntervalOptionInSeconds', () => {
    it('converts 1 min to 60 seconds', () => {
      expect(
        getIntervalOptionInSeconds({ label: '1 min', unit: 'min', value: 1 })
      ).toBe(60);
    });

    it('converts 5 min to 300 seconds', () => {
      expect(
        getIntervalOptionInSeconds({ label: '5 min', unit: 'min', value: 5 })
      ).toBe(300);
    });

    it('converts 1 hr to 3600 seconds', () => {
      expect(
        getIntervalOptionInSeconds({ label: '1 hr', unit: 'hr', value: 1 })
      ).toBe(3600);
    });

    it('converts 1 day to 86400 seconds', () => {
      expect(
        getIntervalOptionInSeconds({ label: '1 day', unit: 'days', value: 1 })
      ).toBe(86400);
    });
  });

  // ─── Preset-based option map ───────────────────────────────────────────────
  describe('PRESET_TO_INTERVALS_MAP', () => {
    it('exposes only 1 min and 5 min for Last 30 minutes', () => {
      const options =
        PRESET_TO_INTERVALS_MAP[
          DateTimeRangePicker.PRESET_LABELS.LAST_30_MINUTES
        ]!;
      expect(options.map((o) => o.label)).toEqual(['1 min', '5 min']);
    });

    it('includes 1 hr for Last hour', () => {
      const options =
        PRESET_TO_INTERVALS_MAP[DateTimeRangePicker.PRESET_LABELS.LAST_HOUR]!;
      expect(options.map((o) => o.label)).toEqual(['1 min', '5 min', '1 hr']);
    });

    it('shows 1 hr but hides 1 day for Last 12 hours', () => {
      const options =
        PRESET_TO_INTERVALS_MAP[
          DateTimeRangePicker.PRESET_LABELS.LAST_12_HOURS
        ]!;
      const labels = options.map((o) => o.label);
      expect(labels).toContain('1 hr');
      expect(labels).not.toContain('1 day');
    });

    it('includes all options for Last day and beyond', () => {
      for (const key of [
        DateTimeRangePicker.PRESET_LABELS.LAST_DAY,
        DateTimeRangePicker.PRESET_LABELS.LAST_7_DAYS,
        DateTimeRangePicker.PRESET_LABELS.LAST_30_DAYS,
        DateTimeRangePicker.PRESET_LABELS.THIS_MONTH,
        DateTimeRangePicker.PRESET_LABELS.LAST_MONTH,
      ]) {
        const options = PRESET_TO_INTERVALS_MAP[key]!;
        expect(options.map((o) => o.label)).toEqual([
          '1 min',
          '5 min',
          '1 hr',
          '1 day',
        ]);
      }
    });
  });

  // ─── Preset-based component filtering ─────────────────────────────────────
  describe('preset-based option visibility', () => {
    it('shows only 1 min and 5 min for Last 30 minutes preset', async () => {
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={{
            end: new Date().toISOString(),
            preset: DateTimeRangePicker.PRESET_LABELS.LAST_30_MINUTES,
            start: new Date(Date.now() - 1800 * 1000).toISOString(),
          }}
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(screen.getByRole('option', { name: '1 min' })).toBeVisible();
      expect(screen.getByRole('option', { name: '5 min' })).toBeVisible();
      expect(
        screen.queryByRole('option', { name: '1 hr' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: '1 day' })
      ).not.toBeInTheDocument();
    });

    it('shows all options for Last day preset', async () => {
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={{
            end: new Date().toISOString(),
            preset: DateTimeRangePicker.PRESET_LABELS.LAST_DAY,
            start: new Date(Date.now() - 86400 * 1000).toISOString(),
          }}
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(screen.getByRole('option', { name: '1 min' })).toBeVisible();
      expect(screen.getByRole('option', { name: '5 min' })).toBeVisible();
      expect(screen.getByRole('option', { name: '1 hr' })).toBeVisible();
      expect(screen.getByRole('option', { name: '1 day' })).toBeVisible();
    });

    it('still applies scrape filter on top of preset map (hides 1 min when scrape is 2m)', async () => {
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={{
            end: new Date().toISOString(),
            preset: DateTimeRangePicker.PRESET_LABELS.LAST_30_MINUTES,
            start: new Date(Date.now() - 1800 * 1000).toISOString(),
          }}
          onIntervalChange={vi.fn()}
          scrapeInterval="2m"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(
        screen.queryByRole('option', { name: '1 min' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: '5 min' })).toBeVisible();
    });
  });

  // ─── Utility: getDurationInSeconds ────────────────────────────────────────
  describe('getDurationInSeconds', () => {
    it('returns the correct seconds for a valid duration', () => {
      expect(getDurationInSeconds(makeDuration(3600))).toBeCloseTo(3600, 0);
    });

    it('returns Infinity for an invalid start date', () => {
      expect(
        getDurationInSeconds({
          start: 'not-a-date',
          end: new Date().toISOString(),
        })
      ).toBe(Infinity);
    });

    it('returns Infinity when end is before start', () => {
      expect(
        getDurationInSeconds({
          start: new Date().toISOString(),
          end: new Date(Date.now() - 3600 * 1000).toISOString(),
        })
      ).toBe(Infinity);
    });
  });

  // ─── Rendered value ────────────────────────────────────────────────────────
  describe('rendered dropdown value', () => {
    it('shows the defaultInterval when it is within the duration', () => {
      const { getByRole, getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'min', value: 5 }}
          duration={makeDuration(3600)}
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );

      expect(getByRole('combobox')).toHaveAttribute('value', '5 min');
      getByTestId(INTERVAL_TOOLTIP_TESTID);
    });

    it('falls back to Auto when defaultInterval exceeds the duration', () => {
      const onIntervalChange = vi.fn();
      const { getByRole } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'days', value: 1 }}
          duration={makeDuration(1800)} // only 30 min
          onIntervalChange={onIntervalChange}
          scrapeInterval="30s"
        />
      );

      expect(getByRole('combobox')).toHaveAttribute('value', 'Auto');
      expect(onIntervalChange).toHaveBeenCalledWith({
        unit: 'Auto',
        value: -1,
      });
    });

    it('renders Auto when defaultInterval is explicitly Auto', () => {
      const { getByRole } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={makeDuration(86400)}
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );

      expect(getByRole('combobox')).toHaveAttribute('value', 'Auto');
    });
  });

  // ─── Duration-based option visibility ─────────────────────────────────────
  describe('duration-based option visibility', () => {
    it('hides 1 hr and 1 day when duration is 30 minutes', async () => {
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={makeDuration(1800)} // 30 min
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(screen.getByRole('option', { name: 'Auto' })).toBeVisible();
      expect(screen.getByRole('option', { name: '1 min' })).toBeVisible();
      expect(screen.getByRole('option', { name: '5 min' })).toBeVisible();
      expect(
        screen.queryByRole('option', { name: '1 hr' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: '1 day' })
      ).not.toBeInTheDocument();
    });

    it('hides only 1 day when duration is exactly 1 hour', async () => {
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={makeDuration(3600)} // 1 hr
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(screen.getByRole('option', { name: '1 hr' })).toBeVisible();
      expect(
        screen.queryByRole('option', { name: '1 day' })
      ).not.toBeInTheDocument();
    });

    it('shows all options when duration is 1 day', async () => {
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={makeDuration(86400)} // 1 day
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(screen.getByRole('option', { name: '1 min' })).toBeVisible();
      expect(screen.getByRole('option', { name: '5 min' })).toBeVisible();
      expect(screen.getByRole('option', { name: '1 hr' })).toBeVisible();
      expect(screen.getByRole('option', { name: '1 day' })).toBeVisible();
    });

    it('shows only Auto and 1 min for a 2-minute duration', async () => {
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={makeDuration(120)} // 2 min
          onIntervalChange={vi.fn()}
          scrapeInterval="30s"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(screen.getByRole('option', { name: 'Auto' })).toBeVisible();
      expect(screen.getByRole('option', { name: '1 min' })).toBeVisible();
      expect(
        screen.queryByRole('option', { name: '5 min' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: '1 hr' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: '1 day' })
      ).not.toBeInTheDocument();
    });

    it('applies scrape interval and duration filters together', async () => {
      // scrape_interval=2m (120s): hides 1 min
      // duration=30min (1800s): hides 1 hr and 1 day
      // Result: Auto + 5 min only
      const { getByTestId } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'Auto', value: -1 }}
          duration={makeDuration(1800)} // 30 min
          onIntervalChange={vi.fn()}
          scrapeInterval="2m"
        />
      );
      await openDropdown(getByTestId(INTERVAL_TOOLTIP_TESTID));

      expect(screen.getByRole('option', { name: 'Auto' })).toBeVisible();
      expect(
        screen.queryByRole('option', { name: '1 min' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: '5 min' })).toBeVisible();
      expect(
        screen.queryByRole('option', { name: '1 hr' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: '1 day' })
      ).not.toBeInTheDocument();
    });
  });

  // ─── Auto-reset on duration change ────────────────────────────────────────
  describe('auto-reset on duration change', () => {
    it('resets to Auto when duration shrinks and current selection becomes invalid', () => {
      const onIntervalChange = vi.fn();
      const { getByRole, rerender } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'hr', value: 1 }}
          duration={makeDuration(3600)} // 1 hour — "1 hr" is valid
          onIntervalChange={onIntervalChange}
          scrapeInterval="30s"
        />
      );

      expect(getByRole('combobox')).toHaveAttribute('value', '1 hr');

      // Shrink to 30 minutes — "1 hr" is no longer valid
      rerender(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'hr', value: 1 }}
          duration={makeDuration(1800)}
          onIntervalChange={onIntervalChange}
          scrapeInterval="30s"
        />
      );

      expect(getByRole('combobox')).toHaveAttribute('value', 'Auto');
      expect(onIntervalChange).toHaveBeenLastCalledWith({
        unit: 'Auto',
        value: -1,
      });
    });

    it('does not reset when duration shrinks but selection remains valid', () => {
      const onIntervalChange = vi.fn();
      const { getByRole, rerender } = renderWithTheme(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'min', value: 5 }}
          duration={makeDuration(3600)} // 1 hour — "5 min" is valid
          onIntervalChange={onIntervalChange}
          scrapeInterval="30s"
        />
      );

      expect(getByRole('combobox')).toHaveAttribute('value', '5 min');

      // Shrink to 30 minutes — "5 min" (300s) ≤ 1800s, still valid
      rerender(
        <CloudPulseIntervalSelect
          defaultInterval={{ unit: 'min', value: 5 }}
          duration={makeDuration(1800)}
          onIntervalChange={onIntervalChange}
          scrapeInterval="30s"
        />
      );

      expect(getByRole('combobox')).toHaveAttribute('value', '5 min');
      // onIntervalChange should NOT have been called with Auto
      expect(onIntervalChange).not.toHaveBeenCalledWith({
        unit: 'Auto',
        value: -1,
      });
    });
  });
});
