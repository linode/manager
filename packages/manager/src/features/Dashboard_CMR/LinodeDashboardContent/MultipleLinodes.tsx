import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'transparent'
  }
}));

export const MultipleLinodes: React.FC<{}> = _ => {
  const classes = useStyles();

  const tabs: Tab[] = [
    /* NB: These must correspond to the routes, inside the Switch */
    {
      title: 'Linodes',
      render: () => <div>Linodes Table</div>
    },
    {
      title: 'Domains',
      render: () => <div>Domains Table</div>
    },
    {
      title: 'Volumes',
      render: () => <div>Volumes Table</div>
    },
    {
      title: 'Object Storage',
      render: () => <div>Buckets Table</div>
    }
  ];

  return (
    <TabbedPanel
      rootClass={`${classes.root} tabbedPanel`}
      header={''}
      tabs={tabs}
      initTab={0}
    />
  );
};

export default React.memo(MultipleLinodes);
