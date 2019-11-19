import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

import Select, { Item } from 'src/components/EnhancedSelect/Select';

import withAccountSettings from 'src/containers/accountSettings.container';
// import withProfile, { Props as ProfileProps } from "src/containers/profile.container";

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

interface Props<Stats = any> {
  lastUpdated: number;
  request: () => Promise<Partial<Stats>>;
  children: (stats: Stats) => JSX.Element;
}

interface ReduxStateProps {
  isLongviewPro: boolean;
}

type CombinedProps = Props & ReduxStateProps;

const TimeRangeSelect: React.FC<CombinedProps> = props => {
  // const classes = useStyles();
  const { children, isLongviewPro, lastUpdated } = props;

  if (!children || typeof children !== 'function') {
    throw new Error(
      'TimeRangeSelect must have a children prop that is a function.'
    );
  }

  const [selectedTimeRange, setTimeRange] = React.useState<
    Item<number> | undefined
  >();
  const [stats, setStats] = React.useState<any>();

  const now = Date.now();

  React.useEffect(() => {
    props
      .request()
      .then(setStats)
      .catch(() => {
        if (!stats) {
          setStats({});
        }
      });
  }, [lastUpdated]);

  const options = generateSelectOptions(now, isLongviewPro);

  return (
    <Select
      onChange={(item: Item<number>) => setTimeRange(item)}
      isClearable={false}
      isSearchable={false}
      value={selectedTimeRange || options[0]}
      options={options}
    >
      {children(stats)}
    </Select>
  );
};

export default (compose<CombinedProps, Props>(
  React.memo,
  withAccountSettings<ReduxStateProps, Props>(
    (own, loading, lastUpdated, error, data) => {
      const subscription = (data || {}).longview_subscription;

      const isLongviewPro = !(subscription === 'longview-10' || !subscription);

      return {
        isLongviewPro
      };
    }
  )
)(TimeRangeSelect) as unknown) as <S>(props: Props<S>) => React.ReactElement;

export const generateSelectOptions = (
  now: number,
  isLongviewPro: boolean
): Item<number>[] => {
  const baseOptions: Item<number>[] = [
    {
      label: 'Past 30 Minutes',
      value: now - 30 * 60 * 1000
    },
    {
      label: 'Past 12 Hours',
      value: now - 12 * 60 * 60 * 1000
    }
  ];

  const finalOptions: Item<number>[] = isLongviewPro
    ? [
        ...baseOptions,
        {
          label: 'Past 24 Hours',
          value: now - 12 * 60 * 60 * 1000
        },
        {
          label: 'Past 7 days',
          value: now - 24 * 7 * 60 * 60 * 1000
        },
        {
          label: 'Past 30 Days',
          value: now - 24 * 30 * 60 * 60 * 1000
        }
      ]
    : baseOptions;

  return finalOptions;
};
