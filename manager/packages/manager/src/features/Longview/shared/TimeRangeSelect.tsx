import { getActiveLongviewPlan } from '@linode/api-v4/lib/longview';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import Select, {
  BaseSelectProps,
  Item,
} from 'src/components/EnhancedSelect/Select';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';

interface Props extends Omit<BaseSelectProps, 'onChange' | 'defaultValue'> {
  handleStatsChange?: (start: number, end: number) => void;
  defaultValue?: Labels;
}

export type Labels =
  | 'Past 30 Minutes'
  | 'Past 12 Hours'
  | 'Past 24 Hours'
  | 'Past 7 Days'
  | 'Past 30 Days'
  | 'Past Year';

type CombinedProps = Props & PreferencesProps;

const TimeRangeSelect: React.FC<CombinedProps> = (props) => {
  const {
    defaultValue,
    handleStatsChange,
    preferences,
    getUserPreferences,
    updateUserPreferences,
    ...restOfSelectProps
  } = props;

  const [isLongviewPro, setLongviewPro] = React.useState(false);

  React.useEffect(() => {
    getActiveLongviewPlan()
      .then((response) => {
        setLongviewPro(!isEmpty(response));
      })
      .catch((_) => null); // Swallow errors, default to free tier time select options.
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

  const handleChange = (item: Item<Labels, Labels>) => {
    setTimeRange(item.value);

    getUserPreferences()
      .then((response) => {
        updateUserPreferences({
          ...response,
          longviewTimeRange: item.value,
        });
      })
      .catch((_) => null); // swallow the error, it's nbd if the choice isn't saved

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
      small
      onChange={handleChange}
      isClearable={false}
      isSearchable={false}
      value={options.find((o) => o.label === selectedTimeRange) || options[0]}
      options={options}
    />
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withPreferences()
)(TimeRangeSelect);

/**
 * react-select option generator that aims to remain a pure function
 * and take in the current datetime as an argument and generate select values
 * based on what it's passed.
 *
 * @param { boolean } isLongviewPro - whether or not this user has a Longview Pro subscription
 * @param { string } currentYear - the current year
 */
export const generateSelectOptions = (
  isLongviewPro: boolean,
  currentYear: string
): Item<Labels, Labels>[] => {
  const baseOptions: Item<Labels, Labels>[] = [
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
