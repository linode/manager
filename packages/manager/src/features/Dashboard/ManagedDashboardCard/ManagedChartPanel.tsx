import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import LineGraph from 'src/components/LineGraph';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import useTimezone from 'src/utilities/useTimezone';

import { COMPACT_SPACING_UNIT } from 'src/themeFactory';

// Temporary
import { fakeData } from './fakeData';
const _data: [number, number][] = fakeData.map(thisPoint => [
  thisPoint.x,
  thisPoint.y
]);

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  inner: {
    paddingTop: 0
  },
  graphControls: {
    position: 'relative',
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 52,
      height: 'calc(100% - 102px);',
      width: 1,
      backgroundColor: theme.palette.divider,
      [theme.breakpoints.down('xs')]: {
        display: 'none'
      }
    }
  },
  chartSelect: {
    maxWidth: 150,
    [theme.breakpoints.up('lg')]: {
      position: 'absolute !important' as 'absolute',
      right: 24,
      top: 0,
      zIndex: 2
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(3),
      marginBottom: theme.spacing(3)
    }
  },
  chartSelectCompact: {
    [theme.breakpoints.up('lg')]: {
      right: 12,
      top: -6
    }
  }
}));

interface Props {
  data: any;
}

type CombinedProps = Props & WithTheme;

const chartHeight = 300;

// const statsFetchInterval = 30000;

const rangeSelection = '24';

const tabs: Tab[] = [
  {
    render: () => {
      const timezone = useTimezone();
      return (
        <>
          <LineGraph
            timezone={timezone}
            chartHeight={chartHeight}
            showToday={rangeSelection === '24'}
            data={[
              {
                borderColor: 'rgba(54, 131, 220, 1)',
                backgroundColor: 'rgba(54, 131, 220, .5)',
                data: _data,
                label: 'CPU %'
              }
            ]}
          />
        </>
      );
    },
    title: 'CPU Usage'
  },
  {
    render: () => {
      return (
        <>
          <Typography>Empty transfer panel</Typography>
        </>
      );
    },
    title: 'Network Transfer'
  },
  {
    render: () => {
      return (
        <>
          <Typography>Empty I/O panel</Typography>
        </>
      );
    },
    title: 'Disk I/O'
  }
];

export const ManagedChartPanel: React.FC<CombinedProps> = props => {
  const { data } = props;
  const classes = useStyles();

  if (data === null) {
    return null;
  }

  const initialTab = 0;

  const rangeSelectOptions: Item[] = [
    { value: 'Last 24 Hours', label: 'Last 24 Hours' },
    { value: 'Last 30 Days', label: 'Last 30 Days' }
  ];

  const handleChartRangeChange = (e: Item<string>) => {
    return e.value;
  };

  const spacingMode =
    props.theme && props.theme.spacing(1) === COMPACT_SPACING_UNIT
      ? 'compact'
      : 'normal';

  return (
    <React.Fragment>
      <div className={classes.graphControls}>
        <TabbedPanel
          rootClass={`${classes.root} tabbedPanel`}
          innerClass={classes.inner}
          error={undefined}
          header={''}
          copy={''}
          tabs={tabs}
          initTab={initialTab}
        />
        {/* TODO this is placeholder for now */}
        <Select
          options={rangeSelectOptions}
          defaultValue={rangeSelectOptions[0]}
          onChange={handleChartRangeChange}
          name="chartRange"
          id="chartRange"
          small
          label="Select Time Range"
          hideLabel
          isClearable={false}
          className={classNames({
            [classes.chartSelect]: true,
            [classes.chartSelectCompact]: spacingMode === 'compact'
          })}
        />
      </div>
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, Props>(withTheme);

export default enhanced(ManagedChartPanel);
