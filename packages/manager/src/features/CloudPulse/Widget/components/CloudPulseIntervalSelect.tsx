import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import type { TimeGranularity } from '@linode/api-v4';

export interface IntervalSelectProperties {
  default_interval?: TimeGranularity | undefined;
  onIntervalChange: any;
  scrape_interval: string;
}

export const getInSeconds = (interval: string) => {
  if (interval.endsWith('s')) {
    return Number(interval.slice(0, -1));
  } else if (interval.endsWith('m')) {
    return Number(interval.slice(0, -1)) * 60;
  } else if (interval.endsWith('h')) {
    return Number(interval.slice(0, -1)) * 3600;
  } else if (interval.endsWith('d')) {
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
    unit: 'day',
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
    const scrapeIntervalValue = getInSeconds(props.scrape_interval);

    const firstIntervalIndex = getIntervalIndex(scrapeIntervalValue);

    // all intervals displayed if srape interval > highest available interval. Error handling done by api
    const available_interval_options =
      firstIntervalIndex < 0
        ? all_interval_options.slice()
        : all_interval_options.slice(
            firstIntervalIndex,
            all_interval_options.length
          );

    let default_interval =
      props.default_interval?.unit === 'Auto'
        ? autoIntervalOption
        : available_interval_options.find(
            (obj) =>
              obj.value === props.default_interval?.value &&
              obj.unit === props.default_interval?.unit
          );
    let default_interval_unavailable = false;

    if (!default_interval) {
      default_interval = autoIntervalOption;
      props.onIntervalChange({
        unit: default_interval.unit,
        value: default_interval.value,
      });

      if (props.default_interval && props.default_interval.value) {
        default_interval_unavailable = true;
      }
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Autocomplete
          isOptionEqualToValue={(option, value) => {
            return (
              option?.value === value?.value && option?.unit === value?.unit
            );
          }}
          onChange={(_: any, selectedInterval: any) => {
            props.onIntervalChange({
              unit: selectedInterval?.unit,
              value: selectedInterval?.value,
            });
          }}
          defaultValue={{ ...default_interval }}
          disableClearable
          fullWidth={false}
          label=""
          noMarginTop={true}
          options={[autoIntervalOption, ...available_interval_options]}
        />
        {default_interval_unavailable && (
          <p style={{ color: 'rgb(210 165 28)', fontSize: 'smaller' }}>
            Invalid interval '
            {props.default_interval?.unit +
              String(props.default_interval?.value)}
            '
          </p>
        )}
      </div>
    );
  }
);
