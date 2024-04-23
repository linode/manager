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
  handleStatsChange?: (start: number, end: number) => void;
}

const _PAST_7_DAYS = 'Past 7 Days';
const _PAST_12_HOURS = 'Past 12 Hours';
const _PAST_24_HOURS = 'Past 24 Hours';
const _PAST_30_DAYS = 'Past 30 Days';
const _PAST_30_MINUTES = 'Past 30 Minutes';
const _PAST_YEAR = 'Past Year';
export type Labels =
  | 'Past 7 Days'
  | 'Past 12 Hours'
  | 'Past 24 Hours'
  | 'Past 30 Days'
  | 'Past 30 Minutes'
  | 'Past Year';

export const CloudPulseTimeRangeSelect = React.memo((props: Props) => {
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
    _PAST_30_MINUTES
  );

  /*
    Why division by 1000?

    Because the LongView API doesn't expect the start and date time
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
        Math.round(
          generateStartTime(
            selectedTimeRange,
            nowInSeconds,
            new Date().getFullYear()
          )
        ),
        Math.round(nowInSeconds)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeRange]);

  const options = generateSelectOptions(`${new Date().getFullYear()}`);

  const handleChange = (item: Item<Labels, Labels>) => {
    setTimeRange(item.value);
  };

  return (
    <Select
      {...restOfSelectProps}
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
export const generateSelectOptions = (
  currentYear: string
): Item<Labels, Labels>[] => {
  const baseOptions: Item<Labels, Labels>[] = [
    {
      label: _PAST_30_MINUTES,
      value: _PAST_30_MINUTES,
    },
    {
      label: _PAST_12_HOURS,
      value: _PAST_12_HOURS,
    },
  ];

  return [
    ...baseOptions,
    {
      label: _PAST_24_HOURS,
      value: _PAST_24_HOURS,
    },
    {
      label: _PAST_7_DAYS,
      value: _PAST_7_DAYS,
    },
    {
      label: _PAST_30_DAYS,
      value: _PAST_30_DAYS,
    },
    {
      label: _PAST_YEAR,
      value: _PAST_YEAR,
    },
    {
      label: `${currentYear}` as Labels,
      value: `${currentYear}` as Labels,
    },
  ];
};

/**
 *
 * @returns start time in seconds (NOT milliseconds)
 */
export const generateStartTime = (
  modifier: Labels,
  nowInSeconds: number,
  currentYear: number
) => {
  switch (modifier) {
    case _PAST_30_MINUTES:
      return nowInSeconds - 30 * 60;
    case _PAST_12_HOURS:
      return nowInSeconds - 12 * 60 * 60;
    case _PAST_24_HOURS:
      return nowInSeconds - 24 * 60 * 60;
    case _PAST_7_DAYS:
      return nowInSeconds - 7 * 24 * 60 * 60;
    case _PAST_30_DAYS:
      return nowInSeconds - 30 * 24 * 60 * 60;
    case _PAST_YEAR:
      return nowInSeconds - 365 * 24 * 60 * 60;
    default:
      return new Date(`Jan 1 ${currentYear}`).getTime() / 1000;
  }
};
