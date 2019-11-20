import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import Select, {
  BaseSelectProps,
  Item
} from 'src/components/EnhancedSelect/Select';
import withAccountSettings from 'src/containers/accountSettings.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props<Stats = any> extends Omit<BaseSelectProps, 'onChange'> {
  lastUpdated: number;
  request: (start: number, end: number) => Promise<Partial<Stats>>;
  children: (stats: Stats, error?: APIError[]) => JSX.Element;
}

interface ReduxStateProps {
  isLongviewPro: boolean;
}

export type Labels =
  | 'Past 30 Minutes'
  | 'Past 12 Hours'
  | 'Past 24 Hours'
  | 'Past 7 Days'
  | 'Past 30 Days'
  | 'Past Year';

type CombinedProps = Props & ReduxStateProps;

const TimeRangeSelect: React.FC<CombinedProps> = props => {
  const {
    children,
    isLongviewPro,
    lastUpdated,
    request,
    ...restOfSelectProps
  } = props;

  /* children has to be a function - enforce this */
  if (!children || typeof children !== 'function') {
    throw new Error(
      'TimeRangeSelect must have a children prop that is a function.'
    );
  }

  /* 
    the time range is the label instead of the value because it's a lot harder
    to keep Date.now() consistent with this state. We can get the actual
    values when it comes time to make the request
  */
  const [selectedTimeRange, setTimeRange] = React.useState<Labels>(
    'Past 30 Minutes'
  );
  const [stats, setStats] = React.useState<any>({});
  const [fetchError, setError] = React.useState<APIError[] | undefined>();

  const now = Date.now();
  const options = generateSelectOptions(
    isLongviewPro,
    `${new Date().getFullYear()}`
  );

  React.useEffect(() => {
    const foundOption = options.find(o => o.label === selectedTimeRange);
    const selectedPastDateTime = foundOption ? foundOption.value(now) : 0;

    if (selectedPastDateTime) {
      /* only make the request if we have a _start_ time */
      props
        /*
        Why division by 1000?
        
        Because the Longview API doesn't expect the start and date time
        to the nearest millisecond - if you send anything more than 10 digits
        you won't get any data back
        */
        .request(
          Math.round(selectedPastDateTime / 1000),
          Math.round(now / 1000)
        )
        .then(response => {
          if (
            !!response &&
            typeof response === 'object' &&
            !!Object.keys(response).length
          ) {
            setStats(response);
          }
        })
        .catch(e => {
          /* always set an error - it's up to the consumer if it wants to do anything with this error */
          setError(
            getAPIErrorOrDefault(e, 'There was an issue retrieving the stats')
          );
        });
    }
  }, [lastUpdated]);

  const handleChange = (item: Item<(now: number) => number, Labels>) => {
    setTimeRange(item.label);
  };

  return (
    <React.Fragment>
      <Select
        {...restOfSelectProps}
        onChange={handleChange as any}
        isClearable={false}
        isSearchable={false}
        value={options.find(o => o.label === selectedTimeRange) || options[0]}
        options={options}
      />
      {children(stats, fetchError)}
    </React.Fragment>
  );
};

export default (compose<CombinedProps, Props>(
  React.memo,
  withAccountSettings<ReduxStateProps, Props>(
    (own, loading, lastUpdated, error, data) => {
      const subscription = (data || {}).longview_subscription;

      /* if you're longview-10 or the response is _null_, you're on the free tier */
      const isLongviewPro = !(subscription === 'longview-10' || !subscription);

      return {
        isLongviewPro
      };
    }
  )
)(TimeRangeSelect) as unknown) as <S>(props: Props<S>) => React.ReactElement;

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
): Item<(now: number) => number, Labels>[] => {
  const baseOptions: Item<(now: number) => number, Labels>[] = [
    {
      label: 'Past 30 Minutes',
      value: _now => _now - 30 * 60 * 1000
    },
    {
      label: 'Past 12 Hours',
      value: _now => _now - 12 * 60 * 60 * 1000
    }
  ];

  const finalOptions: Item<(now: number) => number, Labels>[] = isLongviewPro
    ? [
        ...baseOptions,
        {
          label: 'Past 24 Hours',
          value: _now => _now - 24 * 60 * 60 * 1000
        },
        {
          label: 'Past 7 Days',
          value: _now => _now - 7 * 24 * 60 * 60 * 1000
        },
        {
          label: 'Past 30 Days',
          value: _now => _now - 30 * 24 * 60 * 60 * 1000
        },
        {
          label: 'Past Year',
          value: _now => _now - 365 * 24 * 60 * 60 * 1000
        },
        {
          label: `${currentYear}` as Labels,
          value: () => new Date(`Jan 1 ${currentYear}`).getTime()
        }
      ]
    : baseOptions;

  return finalOptions;
};
