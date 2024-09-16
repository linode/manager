import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import type { TimeGranularity } from '@linode/api-v4';

export interface IntervalSelectProperties {
  /**
   * Default time granularity to be selected
   */
  defaultInterval?: TimeGranularity | undefined;

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

// Intervals must be in ascending order here
export const all_interval_options = [
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

const autoIntervalOption = {
  label: 'Auto',
  unit: 'Auto',
  value: -1,
};

export const getIntervalIndex = (scrapeIntervalValue: number) => {
  return all_interval_options.findIndex(
    (interval) =>
      scrapeIntervalValue <=
      getInSeconds(String(interval.value) + interval.unit.slice(0, 1))
  );
};

export const CloudPulseIntervalSelect = React.memo(
  (props: IntervalSelectProperties) => {
    const { defaultInterval, onIntervalChange, scrapeInterval } = props;
    const scrapeIntervalValue = getInSeconds(scrapeInterval);

    const firstIntervalIndex = getIntervalIndex(scrapeIntervalValue);

    // all intervals displayed if srape interval > highest available interval. Error handling done by api
    const available_interval_options =
      firstIntervalIndex < 0
        ? all_interval_options.slice()
        : all_interval_options.slice(
            firstIntervalIndex,
            all_interval_options.length
          );

    let default_value =
      defaultInterval?.unit === 'Auto'
        ? autoIntervalOption
        : available_interval_options.find(
            (obj) =>
              obj.value === defaultInterval?.value &&
              obj.unit === defaultInterval?.unit
          );

    if (!default_value) {
      default_value = autoIntervalOption;
      onIntervalChange({
        unit: default_value.unit,
        value: default_value.value,
      });
    }
    const [selectedInterval, setSelectedInterval] = React.useState(
      default_value
    );

    return (
      <Autocomplete
        isOptionEqualToValue={(option, value) => {
          return option?.value === value?.value && option?.unit === value?.unit;
        }}
        onChange={(_: any, selectedInterval: any) => {
          setSelectedInterval(selectedInterval);
          onIntervalChange({
            unit: selectedInterval?.unit,
            value: selectedInterval?.value,
          });
        }}
        textFieldProps={{
          hideLabel: true,
        }}
        disableClearable
        fullWidth={false}
        label="Select an Interval"
        noMarginTop={true}
        options={[autoIntervalOption, ...available_interval_options]}
        sx={{ width: { xs: '100%' } }}
        value={selectedInterval}
      />
    );
  },
  () => true
);
