import { getActiveLongviewPlan } from '@linode/api-v4/lib/longview';
import { Select } from '@linode/ui';
import * as React from 'react';

import { useMutatePreferences, usePreferences } from '@linode/queries';

import type { SelectOption, SelectProps } from '@linode/ui';

interface Props
  extends Omit<
    SelectProps<SelectOption<Labels>>,
    'defaultValue' | 'onChange' | 'options'
  > {
  defaultValue?: Labels;
  handleStatsChange?: (start: number, end: number) => void;
}

export type Labels =
  | 'Past 7 Days'
  | 'Past 12 Hours'
  | 'Past 24 Hours'
  | 'Past 30 Days'
  | 'Past 30 Minutes'
  | 'Past Year';

export const TimeRangeSelect = React.memo((props: Props) => {
  const { defaultValue, handleStatsChange, ...restOfSelectProps } = props;

  const { data: preferences, refetch: refetchPreferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const [isLongviewPro, setLongviewPro] = React.useState(false);

  React.useEffect(() => {
    getActiveLongviewPlan()
      .then((response) => {
        setLongviewPro(Object.keys(response).length > 0);
      })
      .catch(); // Swallow errors, default to free tier time select options.
  }, []);

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
    (preferences?.longviewTimeRange as Labels) ||
      defaultValue ||
      'Past 30 Minutes'
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
  }, []);

  const options = generateSelectOptions(
    isLongviewPro,
    `${new Date().getFullYear()}`
  );

  const handleChange = (item: SelectOption<Labels>) => {
    setTimeRange(item.value);

    refetchPreferences()
      .then(({ data: response }) => response ?? Promise.reject())
      .then((response) => {
        updatePreferences({
          ...response,
          longviewTimeRange: item.value,
        });
      })
      .catch(); // swallow the error, it's nbd if the choice isn't saved

    if (!!handleStatsChange) {
      handleStatsChange(
        Math.round(
          generateStartTime(item.value, nowInSeconds, new Date().getFullYear())
        ),
        Math.round(nowInSeconds)
      );
    }
  };

  return (
    <Select
      {...restOfSelectProps}
      onChange={(_event, value) => handleChange(value)}
      options={options}
      value={options.find((o) => o.label === selectedTimeRange) || options[0]}
    />
  );
});

/**
 * Select option generator that aims to remain a pure function
 * and take in the current datetime as an argument and generate select values
 * based on what it's passed.
 *
 * @param { boolean } isLongviewPro - whether or not this user has a Longview Pro subscription
 * @param { string } currentYear - the current year
 */
export const generateSelectOptions = (
  isLongviewPro: boolean,
  currentYear: string
): SelectOption<Labels>[] => {
  const baseOptions: SelectOption<Labels>[] = [
    {
      label: 'Past 30 Minutes',
      value: 'Past 30 Minutes',
    },
    {
      label: 'Past 12 Hours',
      value: 'Past 12 Hours',
    },
  ];

  return isLongviewPro
    ? [
        ...baseOptions,
        {
          label: 'Past 24 Hours',
          value: 'Past 24 Hours',
        },
        {
          label: 'Past 7 Days',
          value: 'Past 7 Days',
        },
        {
          label: 'Past 30 Days',
          value: 'Past 30 Days',
        },
        {
          label: 'Past Year',
          value: 'Past Year',
        },
        {
          label: `${currentYear}` as Labels,
          value: `${currentYear}` as Labels,
        },
      ]
    : baseOptions;
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
    case 'Past 30 Minutes':
      return nowInSeconds - 30 * 60;
    case 'Past 12 Hours':
      return nowInSeconds - 12 * 60 * 60;
    case 'Past 24 Hours':
      return nowInSeconds - 24 * 60 * 60;
    case 'Past 7 Days':
      return nowInSeconds - 7 * 24 * 60 * 60;
    case 'Past 30 Days':
      return nowInSeconds - 30 * 24 * 60 * 60;
    case 'Past Year':
      return nowInSeconds - 365 * 24 * 60 * 60;
    default:
      return new Date(`Jan 1 ${currentYear}`).getTime() / 1000;
  }
};
