import { Autocomplete } from '@linode/ui';
import React from 'react';

import { CloudPulseTooltip } from '../../shared/CloudPulseTooltip';
import { getAutocompleteWidgetStyles } from '../../Utils/CloudPulseWidgetUtils';

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

export const getIntervalIndex = (scrapeIntervalValue: number) => {
  return allIntervalOptions.findIndex(
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
    const availableIntervalOptions =
      firstIntervalIndex < 0
        ? allIntervalOptions.slice()
        : allIntervalOptions.slice(
            firstIntervalIndex,
            allIntervalOptions.length
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
    const [selectedInterval, setSelectedInterval] = React.useState(
      defaultValue
    );

    return (
      <CloudPulseTooltip title={'Data aggregation interval'}>
        <Autocomplete
          isOptionEqualToValue={(option, value) => {
            return (
              option?.value === value?.value && option?.unit === value?.unit
            );
          }}
          onChange={(e, selectedInterval) => {
            setSelectedInterval(selectedInterval);
            onIntervalChange({
              unit: selectedInterval?.unit,
              value: selectedInterval?.value,
            });
          }}
          textFieldProps={{
            hideLabel: true,
          }}
          autoHighlight
          disableClearable
          label="Select an Interval"
          noMarginTop={true}
          options={[autoIntervalOption, ...availableIntervalOptions]}
          sx={getAutocompleteWidgetStyles}
          value={selectedInterval}
        />
      </CloudPulseTooltip>
    );
  }
);
