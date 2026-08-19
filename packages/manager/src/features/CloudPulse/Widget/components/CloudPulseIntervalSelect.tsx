import { Autocomplete, DateTimeRangePicker } from '@linode/ui';
import { DateTime } from 'luxon';
import React from 'react';

import { CloudPulseTooltip } from '../../shared/CloudPulseTooltip';
import { getAutocompleteWidgetStyles } from '../../Utils/CloudPulseWidgetUtils';

import type { DateTimeWithPreset, TimeGranularity } from '@linode/api-v4';

interface IntervalOptions {
  label: string;
  unit: string;
  value: number;
}

export interface IntervalSelectProperties {
  /**
   * Default time granularity to be selected
   */
  defaultInterval?: TimeGranularity | undefined;

  /**
   * The currently selected time duration. Used to hide granularity options
   * that are larger than the selected range (e.g. hide "1 day" when only
   * 1 hour of data is selected).
   */
  duration: DateTimeWithPreset;

  /**
   * Function to be triggered on aggregate function changed from dropdown
   */
  onIntervalChange: (intervalValue: TimeGranularity) => void;

  /**
   * scrape intervalto filter out minimum time granularity
   */
  scrapeInterval: string;
}

export const getInSeconds = (interval: string) => {
  if (interval.endsWith('s')) {
    return Number(interval.slice(0, -1));
  }
  if (interval.endsWith('m')) {
    return Number(interval.slice(0, -1)) * 60;
  }
  if (interval.endsWith('h')) {
    return Number(interval.slice(0, -1)) * 3600;
  }
  if (interval.endsWith('d')) {
    return Number(interval.slice(0, -1)) * 86400;
  }
  return 0;
  // month and year cases to be added if required
};

/**
 * Returns the value of an interval option in seconds.
 */
export const getIntervalOptionInSeconds = (option: IntervalOptions): number => {
  if (option.unit === 'min') return option.value * 60;
  if (option.unit === 'hr') return option.value * 3600;
  if (option.unit === 'days') return option.value * 86400;
  return 0;
};

/**
 * Returns the duration of a DateTimeWithPreset in seconds by diffing start and end.
 * Works for both preset and custom ranges since DateTimeWithPreset always populates both fields.
 */
export const getDurationInSeconds = (duration: DateTimeWithPreset): number => {
  const start = DateTime.fromISO(duration.start);
  const end = DateTime.fromISO(duration.end);
  if (!start.isValid || !end.isValid) {
    return Infinity;
  }
  const diff = end.diff(start, 'seconds').seconds;
  return diff > 0 ? diff : Infinity;
};

// Intervals must be in ascending order here
export const allIntervalOptions: IntervalOptions[] = [
  {
    label: '1 min',
    unit: 'min',
    value: 1,
  },
  {
    label: '5 min',
    unit: 'min',
    value: 5,
  },
  {
    label: '1 hr',
    unit: 'hr',
    value: 1,
  },
  {
    label: '1 day',
    unit: 'days',
    value: 1,
  },
];

export const autoIntervalOption: IntervalOptions = {
  label: 'Auto',
  unit: 'Auto',
  value: -1,
};

/**
 * Static map from preset label to the interval options valid for that range.
 * Avoids recomputing a DateTime diff on every render for known preset values.
 * Custom ranges (preset === 'Reset' or absent) fall back to getDurationInSeconds.
 */
export const PRESET_TO_INTERVALS_MAP: Partial<
  Record<string, IntervalOptions[]>
> = {
  [DateTimeRangePicker.PRESET_LABELS.LAST_30_MINUTES]: [
    allIntervalOptions[0], // 1 min  (60s  ≤ 1800s)
    allIntervalOptions[1], // 5 min  (300s ≤ 1800s)
  ],
  [DateTimeRangePicker.PRESET_LABELS.LAST_HOUR]: [
    allIntervalOptions[0], // 1 min
    allIntervalOptions[1], // 5 min
    allIntervalOptions[2], // 1 hr   (3600s ≤ 3600s)
  ],
  [DateTimeRangePicker.PRESET_LABELS.LAST_12_HOURS]: [
    allIntervalOptions[0], // 1 min
    allIntervalOptions[1], // 5 min
    allIntervalOptions[2], // 1 hr
  ],
  [DateTimeRangePicker.PRESET_LABELS.LAST_DAY]: allIntervalOptions.slice(),
  [DateTimeRangePicker.PRESET_LABELS.LAST_7_DAYS]: allIntervalOptions.slice(),
  [DateTimeRangePicker.PRESET_LABELS.LAST_30_DAYS]: allIntervalOptions.slice(),
  [DateTimeRangePicker.PRESET_LABELS.THIS_MONTH]: allIntervalOptions.slice(),
  [DateTimeRangePicker.PRESET_LABELS.LAST_MONTH]: allIntervalOptions.slice(),
};

export const getIntervalIndex = (scrapeIntervalValue: number) => {
  return allIntervalOptions.findIndex(
    (interval) =>
      scrapeIntervalValue <=
      getInSeconds(String(interval.value) + interval.unit.slice(0, 1))
  );
};

export const CloudPulseIntervalSelect = React.memo(
  (props: IntervalSelectProperties) => {
    const { defaultInterval, duration, onIntervalChange, scrapeInterval } =
      props;
    const scrapeIntervalValue = getInSeconds(scrapeInterval);

    const firstIntervalIndex = getIntervalIndex(scrapeIntervalValue);

    // Filter by scrape interval (existing): hide options below the metric's collection frequency
    const scrapeFilteredOptions =
      firstIntervalIndex < 0
        ? allIntervalOptions.slice()
        : allIntervalOptions.slice(
            firstIntervalIndex,
            allIntervalOptions.length
          );

    // Filter by duration: use preset map for known presets, diff for custom ranges
    const presetIntervals = duration.preset
      ? PRESET_TO_INTERVALS_MAP[duration.preset]
      : undefined;

    const availableIntervalOptions = presetIntervals
      ? scrapeFilteredOptions.filter((opt) =>
          presetIntervals.some(
            (p) => p.value === opt.value && p.unit === opt.unit
          )
        )
      : scrapeFilteredOptions.filter(
          (option) =>
            getIntervalOptionInSeconds(option) <= getDurationInSeconds(duration)
        );

    let defaultValue =
      defaultInterval?.unit === 'Auto'
        ? autoIntervalOption
        : availableIntervalOptions.find(
            (obj) =>
              obj.value === defaultInterval?.value &&
              obj.unit === defaultInterval?.unit
          );

    if (!defaultValue) {
      defaultValue = autoIntervalOption;
      onIntervalChange({
        unit: defaultValue.unit,
        value: defaultValue.value,
      });
    }
    const [selectedInterval, setSelectedInterval] =
      React.useState(defaultValue);

    // Stable key representing the effective duration: preset label for known presets,
    // or "start_end" string for custom ranges. Used as the effect dependency so the
    // reset fires exactly once per range change instead of depending on a computed number.
    const durationKey = presetIntervals
      ? duration.preset
      : `${duration.start}_${duration.end}`;

    // When the time range shrinks and makes the current granularity invalid, reset to Auto
    React.useEffect(() => {
      const isStillValid =
        selectedInterval.unit === 'Auto' ||
        availableIntervalOptions.some(
          (opt) =>
            opt.value === selectedInterval.value &&
            opt.unit === selectedInterval.unit
        );
      if (!isStillValid) {
        setSelectedInterval(autoIntervalOption);
        onIntervalChange({
          unit: autoIntervalOption.unit,
          value: autoIntervalOption.value,
        });
      }
      // Re-evaluate only when the effective duration changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [durationKey]);

    return (
      <CloudPulseTooltip title={'Data aggregation interval'}>
        <Autocomplete
          autoHighlight
          disableClearable
          isOptionEqualToValue={(option, value) => {
            return (
              option?.value === value?.value && option?.unit === value?.unit
            );
          }}
          label="Select an Interval"
          noMarginTop={true}
          onChange={(e, selectedInterval) => {
            setSelectedInterval(selectedInterval);
            onIntervalChange({
              unit: selectedInterval?.unit,
              value: selectedInterval?.value,
            });
          }}
          options={[autoIntervalOption, ...availableIntervalOptions]}
          sx={getAutocompleteWidgetStyles}
          textFieldProps={{
            hideLabel: true,
          }}
          value={selectedInterval}
        />
      </CloudPulseTooltip>
    );
  }
);
