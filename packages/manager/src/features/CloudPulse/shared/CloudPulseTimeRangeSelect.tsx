import * as React from 'react';

import Select from 'src/components/EnhancedSelect/Select';

import { TIME_DURATION } from '../Utils/constants';
import {
  getUserPreferenceObject,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';

import type { TimeDuration } from '@linode/api-v4';
import type {
  BaseSelectProps,
  Item,
} from 'src/components/EnhancedSelect/Select';

interface Props
  extends Omit<
    BaseSelectProps<Item<Labels, Labels>, false>,
    'defaultValue' | 'onChange'
  > {
  handleStatsChange?: (start: number, end: number) => void;
}

const PAST_7_DAYS = 'Past 7 Days';
const PAST_12_HOURS = 'Past 12 Hours';
const PAST_24_HOURS = 'Past 24 Hours';
const PAST_30_DAYS = 'Past 30 Days';
const PAST_30_MINUTES = 'Past 30 Minutes';
export type Labels =
  | 'Past 7 Days'
  | 'Past 12 Hours'
  | 'Past 24 Hours'
  | 'Past 30 Days'
  | 'Past 30 Minutes';

export const CloudPulseTimeRangeSelect = React.memo((props: Props) => {
  const { handleStatsChange, ...restOfSelectProps } = props;

  // To set the default value fetched from preferences.
  const getPreferredValue = () => {
    const defaultValue = getUserPreferenceObject().timeDuration;

    return options.find((o) => o.label === defaultValue) || options[0];
  };

  const options = generateSelectOptions();

  const handleChange = (item: Item<Labels, Labels>) => {
    updateGlobalFilterPreference({
      [TIME_DURATION]: item.value,
    });

    /*
      Why division by 1000?

      Because the LongView API doesn't expect the start and date time
      to the nearest millisecond - if you send anything more than 10 digits
      you won't get any data back
    */
    const nowInSeconds = Date.now() / 1000;

    if (handleStatsChange) {
      handleStatsChange(
        Math.round(generateStartTime(item.value, nowInSeconds)),
        Math.round(nowInSeconds)
      );
    }
  };

  return (
    <Select
      {...restOfSelectProps}
      defaultValue={getPreferredValue()}
      isClearable={false}
      isSearchable={false}
      onChange={handleChange}
      options={options}
      small
    />
  );
});

/**
 * react-select option generator that aims to remain a pure function
 * and take in the current datetime as an argument and generate select values
 * based on what it's passed.
 *
 *
 * @param { string } currentYear - the current year
 */
export const generateSelectOptions = (): Item<Labels, Labels>[] => {
  const baseOptions: Item<Labels, Labels>[] = [
    {
      label: PAST_30_MINUTES,
      value: PAST_30_MINUTES,
    },
    {
      label: PAST_12_HOURS,
      value: PAST_12_HOURS,
    },
  ];

  return [
    ...baseOptions,
    {
      label: PAST_24_HOURS,
      value: PAST_24_HOURS,
    },
    {
      label: PAST_7_DAYS,
      value: PAST_7_DAYS,
    },
    {
      label: PAST_30_DAYS,
      value: PAST_30_DAYS,
    },
  ];
};

/**
 *
 * @returns start time in seconds (NOT milliseconds)
 */
export const generateStartTime = (modifier: Labels, nowInSeconds: number) => {
  switch (modifier) {
    case PAST_30_MINUTES:
      return nowInSeconds - 30 * 60;
    case PAST_12_HOURS:
      return nowInSeconds - 12 * 60 * 60;
    case PAST_24_HOURS:
      return nowInSeconds - 24 * 60 * 60;
    case PAST_7_DAYS:
      return nowInSeconds - 7 * 24 * 60 * 60;
    default:
      return nowInSeconds - 30 * 24 * 60 * 60;
  }
};

/**
 *
 * @param label label for time duration to get the corresponding time duration object
 * @returns time duration object for the label
 */
export const getTimeDurationFromTimeRange = (label: string): TimeDuration => {
  if (label === PAST_30_MINUTES) {
    return { unit: 'min', value: 30 };
  }

  if (label === PAST_24_HOURS) {
    return { unit: 'hr', value: 24 };
  }

  if (label === PAST_12_HOURS) {
    return { unit: 'hr', value: 12 };
  }

  if (label === PAST_7_DAYS) {
    return { unit: 'day', value: 7 };
  }

  if (label === PAST_30_DAYS) {
    return { unit: 'day', value: 30 };
  }

  return { unit: 'min', value: 30 };
};
