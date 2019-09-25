import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}));

interface Props {
  data: any;
}

const tabs: Tab[] = [
  {
    render: () => {
      return (
        <>
          <Typography>Empty CPU charts panel</Typography>
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
      error={undefined}
      header={''}
      copy={''}
      tabs={tabs}
      initTab={initialTab}
    />
  );
};

export default ManagedChartPanel;
