import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import type { FilterValue, TimeDuration } from '@linode/api-v4';
import type {
  BaseSelectProps,
  Item,
} from 'src/components/EnhancedSelect/Select';

export interface CloudPulseTimeRangeSelectProps
  extends Omit<
    BaseSelectProps<Item<Labels, Labels>, false>,
    'defaultValue' | 'onChange'
  > {
  defaultValue?: Partial<FilterValue>;
  handleStatsChange?: (
    timeDuration: TimeDuration,
    timeDurationValue?: string,
    savePref?: boolean
  ) => void;
  savePreferences?: boolean;
}

const PAST_7_DAYS = 'Last 7 Days';
const PAST_12_HOURS = 'Last 12 Hours';
const PAST_24_HOURS = 'Last 24 Hours';
const PAST_30_DAYS = 'Last 30 Days';
const PAST_30_MINUTES = 'Last 30 Minutes';
export type Labels =
  | 'Last 7 Days'
  | 'Last 12 Hours'
  | 'Last 24 Hours'
  | 'Last 30 Days'
  | 'Last 30 Minutes';

export const CloudPulseTimeRangeSelect = React.memo(
  (props: CloudPulseTimeRangeSelectProps) => {
    const { defaultValue, handleStatsChange, label, savePreferences } = props;
    const options = generateSelectOptions();
    const getDefaultValue = React.useCallback((): Item<Labels, Labels> => {
      if (!savePreferences) {
        return options[0];
      }
      return options.find((o) => o.label === defaultValue) || options[0];
    }, [defaultValue]);
    const [selectedTimeRange, setSelectedTimeRange] = React.useState<
      Item<Labels, Labels>
    >(getDefaultValue());

    React.useEffect(() => {
      const item = getDefaultValue();

      if (handleStatsChange) {
        handleStatsChange(
          getTimeDurationFromTimeRange(item.value),
          item.value,
          false
        );
      }

      if (item !== selectedTimeRange) {
        setSelectedTimeRange(item);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValue]); // need to execute when there is change in default value
    const handleChange = (item: Item<Labels, Labels>) => {
      setSelectedTimeRange(item);

      if (handleStatsChange) {
        handleStatsChange(
          getTimeDurationFromTimeRange(item.value),
          item.value,
          savePreferences
        );
      }
    };
    return (
      <Autocomplete
        onChange={(e, value: Item<Labels, Labels>) => {
          handleChange(value);
        }}
        autoHighlight
        data-testid="cloudpulse-time-duration"
        disableClearable
        fullWidth
        isOptionEqualToValue={(option, value) => option.value === value.value}
        label={label || 'Time Range'}
        noMarginTop
        options={options}
        value={selectedTimeRange}
      />
    );
  }
);

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
const getTimeDurationFromTimeRange = (label: string): TimeDuration => {
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
    return { unit: 'days', value: 7 };
  }

  if (label === PAST_30_DAYS) {
    return { unit: 'days', value: 30 };
  }

  return { unit: 'min', value: 30 };
};
