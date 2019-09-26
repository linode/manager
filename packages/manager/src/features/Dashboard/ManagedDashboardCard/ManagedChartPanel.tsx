import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import LineGraph from 'src/components/LineGraph';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import useTimezone from 'src/utilities/useTimezone';

// Temporary
import { fakeData } from './fakeData';
const data: [number, number][] = fakeData.map(thisPoint => [
  thisPoint.x,
  thisPoint.y
]);

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  inner: {
    paddingTop: 0
  }
}));

interface Props {
  data: any;
}

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
                data,
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

export const ManagedChartPanel: React.FC<Props> = props => {
  const { data } = props;
  const classes = useStyles();

  if (data === null) {
    return null;
  }

  const initialTab = 0;

  return (
    <TabbedPanel
      rootClass={`${classes.root} tabbedPanel`}
      innerClass={classes.inner}
      error={undefined}
      header={''}
      copy={''}
      tabs={tabs}
      initTab={initialTab}
    />
  );
};

export default ManagedChartPanel;
