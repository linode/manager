import { TimeDuration } from '@linode/api-v4';
import * as React from 'react';

import Select, {
  BaseSelectProps,
  Item,
} from 'src/components/EnhancedSelect/Select';

interface Props
  extends Omit<
    BaseSelectProps<Item<Labels, Labels>, false>,
    'defaultValue' | 'onChange'
  > {
  defaultValue?: Labels;
  handleStatsChange?: (
    start: number,
    end: number,
    timeDuration: TimeDuration,
    timeRangeLabel: string
  ) => void;
}

const _PAST_7_DAYS = 'Last 7 Days';
const _PAST_12_HOURS = 'Last 12 Hours';
const _PAST_24_HOURS = 'Last 24 Hours';
const _PAST_30_DAYS = 'Last 30 Days';
const _PAST_30_MINUTES = 'Last 30 Minutes';

export type Labels =
  | 'Last 7 Days'
  | 'Last 12 Hours'
  | 'Last 24 Hours'
  | 'Last 30 Days'
  | 'Last 30 Minutes';

export const CloudPulseTimeRangeSelect = React.memo((props: Props) => {
  const getTimeDurationFromTimeRange = (label: string) => {
    if (label == _PAST_30_MINUTES) {
      return { unit: 'min', value: 30 };
    }

    if (label == _PAST_24_HOURS) {
      return { unit: 'hr', value: 24 };
    }

    if (label == _PAST_12_HOURS) {
      return { unit: 'hr', value: 12 };
    }

    if (label == _PAST_7_DAYS) {
      return { unit: 'day', value: 7 };
    }

    if (label == _PAST_30_DAYS) {
      return { unit: 'day', value: 30 };
    }

    return { unit: 'min', value: 30 };
  };

  const { defaultValue, handleStatsChange, ...restOfSelectProps } = props;

  /*
    the time range is the label instead of the value because it's a lot harder
    to keep Date.now() consistent with this state. We can get the actual
    values when it comes time to make the request.

    Use the value from user preferences if available, then fall back to
    the default that was passed to the component, and use Past 30 Minutes
    if all else fails.

    @todo Validation here to make sure that the value from user preferences
    is a valid time window.
  */
  const [selectedTimeRange, setTimeRange] = React.useState<Labels>(
    props.defaultValue ?? 'Last 30 Minutes'
  );

  const [apiTimeDuration, setApiTimeDuration] = React.useState<TimeDuration>(
    props.defaultValue
      ? getTimeDurationFromTimeRange(props.defaultValue)
      : {
        unit: 'min',
        value: 30,
      }
  );
  /*
    Why division by 1000?

    Because the Longview API doesn't expect the start and date time
    to the nearest millisecond - if you send anything more than 10 digits
    you won't get any data back
  */
  const nowInSeconds = Date.now() / 1000;

  React.useEffect(() => {
    // Do the math and send start/end values to the consumer
    // (in most cases the consumer has passed defaultValue={'last 30 minutes'}
    // but the calcs to turn that into start/end numbers live here)
    if (!!handleStatsChange) {
      handleStatsChange(
        Math.round(generateStartTime(selectedTimeRange, nowInSeconds)),
        Math.round(nowInSeconds),
        apiTimeDuration,
        selectedTimeRange
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiTimeDuration]);

  const options = generateSelectOptions();

  const handleChange = (item: Item<Labels, Labels>) => {
    setTimeRange(item.value);
    setTimeDurationFromTimeRange(item.value);
  };

  const setTimeDurationFromTimeRange = (label: string) => {
    if (label == _PAST_30_MINUTES) {
      setApiTimeDuration({ unit: 'min', value: 30 });
    }

    if (label == _PAST_24_HOURS) {
      setApiTimeDuration({ unit: 'hr', value: 24 });
    }

    if (label == _PAST_12_HOURS) {
      setApiTimeDuration({ unit: 'hr', value: 12 });
    }

    if (label == _PAST_7_DAYS) {
      setApiTimeDuration({ unit: 'day', value: 7 });
    }

    if (label == _PAST_30_DAYS) {
      setApiTimeDuration({ unit: 'day', value: 30 });
    }
  };

  return (
    <Select
      {...restOfSelectProps}
      defaultValue={props.defaultValue ? props.defaultValue : undefined!}
      isClearable={false}
      isSearchable={false}
      onChange={handleChange}
      options={options}
      small
      value={options.find((o) => o.label === selectedTimeRange) || options[0]}
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
      label: 'Last 30 Minutes',
      value: 'Last 30 Minutes',
    },
    {
      label: 'Last 12 Hours',
      value: 'Last 12 Hours',
    },
  ];

  return [
    ...baseOptions,
    {
      label: 'Last 24 Hours',
      value: 'Last 24 Hours',
    },
    {
      label: 'Last 7 Days',
      value: 'Last 7 Days',
    },
    {
      label: 'Last 30 Days',
      value: 'Last 30 Days',
    },
  ];
};

/**
 *
 * @returns start time in seconds (NOT milliseconds)
 */
export const generateStartTime = (modifier: Labels, nowInSeconds: number) => {
  switch (modifier) {
    case 'Last 30 Minutes':
      return nowInSeconds - 30 * 60;
    case 'Last 12 Hours':
      return nowInSeconds - 12 * 60 * 60;
    case 'Last 24 Hours':
      return nowInSeconds - 24 * 60 * 60;
    case 'Last 7 Days':
      return nowInSeconds - 7 * 24 * 60 * 60;
    default:
      return nowInSeconds - 30 * 24 * 60 * 60;
  }
};
