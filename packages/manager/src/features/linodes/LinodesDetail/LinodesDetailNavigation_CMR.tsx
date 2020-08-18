import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { withLinodeDetailContext } from './linodeDetailContext';

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
const LinodeBackup_CMR = React.lazy(() =>
  import('./LinodeBackup/LinodeBackup_CMR')
);
const LinodeResize = React.lazy(() => import('./LinodeResize'));
const LinodeRescue = React.lazy(() => import('./LinodeRescue'));
const LinodeRebuild = React.lazy(() => import('./LinodeRebuild'));
const LinodeActivity_CMR = React.lazy(() =>
  import('./LinodeActivity/LinodeActivity_CMR')
);
const LinodeSettings_CMR = React.lazy(() =>
  import('./LinodeSettings/LinodeSettings_CMR')
);

type CombinedProps = ContextProps &
  RouteComponentProps<{
    linodeId: string;
  }>;

const LinodesDetailNavigation: React.FC<CombinedProps> = props => {
  const {
    match: { url }
  } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    // Previously Summary
    {
      routeName: `${url}/analytics`,
      title: 'Analytics'
    },
    {
      routeName: `${url}/networking`,
      title: 'Network'
    },
    // Previously Volumes
    {
      routeName: `${url}/storage`,
      title: 'Storage'
    },
    // Previously Disks/Configs
    {
      routeName: `${url}/configurations`,
      title: 'Configurations'
    },
    {
      routeName: `${url}/backup`,
      title: 'Backups'
    },
    {
      routeName: `${url}/resize`,
      title: 'Resize'
    },
    {
      routeName: `${url}/rescue`,
      title: 'Rescue'
    },
    {
      routeName: `${url}/activity`,
      title: 'Activity Logs'
    },
    {
      routeName: `${url}/settings`,
      title: 'Settings'
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  return (
    <Tabs
      defaultIndex={Math.max(
        tabs.findIndex(tab => matches(tab.routeName)),
        0
      )}
    >
      <TabLinkList tabs={tabs} />

      <React.Suspense fallback={<SuspenseLoader />}>
        <TabPanels>
          <SafeTabPanel index={0}>
            <LinodeSummary_CMR />
          </SafeTabPanel>

          <SafeTabPanel index={1}>
            <LinodeNetworking_CMR />
          </SafeTabPanel>

          <SafeTabPanel index={2}>
            <LinodeStorage />
          </SafeTabPanel>

          <SafeTabPanel index={3}>
            <LinodeAdvanced_CMR />
          </SafeTabPanel>

          <SafeTabPanel index={4}>
            <LinodeBackup_CMR />
          </SafeTabPanel>

          <SafeTabPanel index={5}>
            <LinodeResize />
          </SafeTabPanel>

          <SafeTabPanel index={6}>
            <LinodeRescue />
          </SafeTabPanel>

          <SafeTabPanel index={7}>
            <LinodeRebuild />
          </SafeTabPanel>

          <SafeTabPanel index={8}>
            <LinodeActivity_CMR />
          </SafeTabPanel>

          <SafeTabPanel index={9}>
            <LinodeSettings_CMR />
          </SafeTabPanel>
        </TabPanels>
      </React.Suspense>
    </Tabs>
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
