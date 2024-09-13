import React from 'react';

import { StyledWidgetAutocomplete } from '../../Utils/CloudPulseWidgetUtils';

import type { TimeGranularity } from '@linode/api-v4';

interface IntervalOptions {
  label: string;
  unit: string;
  value: number;
}

export interface IntervalSelectProperties {
  /**
   * Default time granularity to be selected
   */
  default_interval?: TimeGranularity | undefined;

  /**
   * Function to be triggered on aggregate function changed from dropdown
   */
  onIntervalChange: any;

  /**
   * scrape intervalto filter out minimum time granularity
   */
  scrape_interval: string;
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

const autoIntervalOption: IntervalOptions = {
  label: 'Auto',
  unit: 'Auto',
  value: -1,
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
    const scrapeIntervalValue = getInSeconds(props.scrape_interval);

    const firstIntervalIndex = getIntervalIndex(scrapeIntervalValue);

    // all intervals displayed if srape interval > highest available interval. Error handling done by api
    const availableIntervalOptions =
      firstIntervalIndex < 0
        ? allIntervalOptions.slice()
        : allIntervalOptions.slice(
            firstIntervalIndex,
            allIntervalOptions.length
          );

    let default_interval =
      props.default_interval?.unit === 'Auto'
        ? autoIntervalOption
        : availableIntervalOptions.find(
            (obj) =>
              obj.value === props.default_interval?.value &&
              obj.unit === props.default_interval?.unit
          );

    if (!default_interval) {
      default_interval = autoIntervalOption;
      props.onIntervalChange({
        unit: default_interval.unit,
        value: default_interval.value,
      });
    }

    return (
      <StyledWidgetAutocomplete
        isOptionEqualToValue={(
          option: IntervalOptions,
          value: IntervalOptions
        ) => {
          return option?.value === value?.value && option?.unit === value?.unit;
        }}
        onChange={(
          _: React.SyntheticEvent,
          selectedInterval: IntervalOptions
        ) => {
          props.onIntervalChange({
            unit: selectedInterval?.unit,
            value: selectedInterval?.value,
          });
        }}
        textFieldProps={{
          hideLabel: true,
        }}
        defaultValue={{ ...default_interval }}
        disableClearable
        fullWidth={false}
        label="Select an Interval"
        noMarginTop={true}
        options={[autoIntervalOption, ...availableIntervalOptions]}
        sx={{ width: { xs: '100%' } }}
      />
    );
  }
);
