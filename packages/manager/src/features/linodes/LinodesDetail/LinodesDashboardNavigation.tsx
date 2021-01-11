import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import { withLinodeDetailContext } from './linodeDetailContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: 'transparent',
    marginTop: 10,
    '& [data-reach-tab-list]': {
      marginTop: 22
    },
    '& [data-reach-tab]': {
      color: theme.color.blue
    }
  },
  innerClass: {
    padding: 0
  }
}));

const LinodeSummary_CMR = React.lazy(() =>
  import('./LinodeSummary/LinodeSummary_CMR')
);
const LinodeNetworking_CMR = React.lazy(() =>
  import('./LinodeNetworking/LinodeNetworking_CMR')
);
const LinodeStorage = React.lazy(() => import('./LinodeStorage'));
const LinodeAdvanced_CMR = React.lazy(() =>
  import('./LinodeAdvanced/LinodeAdvancedConfigurationsPanel_CMR')
);
const LinodeBackup = React.lazy(() => import('./LinodeBackup'));
const LinodeActivity_CMR = React.lazy(() =>
  import('./LinodeActivity/LinodeActivity_CMR')
);
const LinodeSettings_CMR = React.lazy(() =>
  import('./LinodeSettings/LinodeSettings_CMR')
);

type CombinedProps = ContextProps & RouteComponentProps<{}>;

const suspenseWrapper = (Component: React.ComponentType<any>) => (
  <React.Suspense fallback={<SuspenseLoader />}>
    <Component />
  </React.Suspense>
);

const LinodesDetailNavigation: React.FC<CombinedProps> = () => {
  const classes = useStyles();

  const tabs: Tab[] = React.useMemo(
    () => [
      /* NB: These must correspond to the routes inside the Switch */
      // Previously Summary
      {
        render: () => suspenseWrapper(LinodeSummary_CMR),
        title: 'Analytics'
      },
      {
        render: () => suspenseWrapper(LinodeNetworking_CMR),
        title: 'Network'
      },
      // Previously Volumes
      {
        render: () => suspenseWrapper(LinodeStorage),
        title: 'Storage'
      },
      // Previously Disks/Configs
      {
        render: () => suspenseWrapper(LinodeAdvanced_CMR),
        title: 'Configurations'
      },
      {
        render: () => suspenseWrapper(LinodeBackup),
        title: 'Backups'
      },
      {
        render: () => suspenseWrapper(LinodeActivity_CMR),
        title: 'Activity Logs'
      },
      {
        render: () => suspenseWrapper(LinodeSettings_CMR),
        title: 'Settings'
      }
    ],
    []
  );

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

interface ContextProps {
  linodeId: number;
  linodeConfigs: Config[];
  linodeLabel: string;
  linodeRegion: string;
  readOnly: boolean;
}

const enhanced = compose<CombinedProps, {}>(
  withRouter,
  withLinodeDetailContext<ContextProps>(({ linode }) => ({
    linodeId: linode.id,
    linodeConfigs: linode._configs,
    linodeLabel: linode.label,
    linodeRegion: linode.region,
    readOnly: linode._permissions === 'read_only'
  }))
);

export default enhanced(LinodesDetailNavigation);
