import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import LinodesLanding from 'src/features/linodes/LinodesLanding';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'transparent'
  },
  innerClass: {
    padding: 0
  }
}));

export const MultipleLinodes: React.FC<{}> = _ => {
  const classes = useStyles();

  const tabs: Tab[] = [
    {
      title: 'Linodes',
      render: () => <LinodesLanding isDashboard />
    }
  ];

  return (
    <TabbedPanel
      rootClass={`${classes.root} tabbedPanel`}
      header={''}
      tabs={tabs}
      initTab={0}
      innerClass={`${classes.innerClass}`}
    />
  );
};

export default React.memo(MultipleLinodes);
