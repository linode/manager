import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import LinodesLanding from 'src/features/linodes/LinodesLanding';
import DomainsLanding from 'src/features/Domains/DomainsLanding';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'transparent'
  }
}));

export const MultipleLinodes: React.FC<{}> = _ => {
  const classes = useStyles();

  const tabs: Tab[] = [
    {
      title: 'Linodes',
      render: () => <LinodesLanding />
    },
    {
      title: 'Domains',
      render: () => <DomainsLanding />
    },
    {
      title: 'Volumes',
      render: () => <div>Volumes Table</div>
    },
    {
      title: 'Object Storage',
      render: () => <div>Object Storage Table</div>
    },
    {
      title: 'Databases',
      render: () => <div>Databases Table</div>
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
