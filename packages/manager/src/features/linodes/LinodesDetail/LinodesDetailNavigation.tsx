import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import SuspenseLoader from 'src/components/SuspenseLoader';
import VolumesLanding from 'src/features/Volumes/VolumesLanding';

import { withLinodeDetailContext } from './linodeDetailContext';

const LinodeSummary = React.lazy(() => import('./LinodeSummary'));
const LinodeSettings = React.lazy(() => import('./LinodeSettings'));
const LinodeResize = React.lazy(() => import('./LinodeResize'));
const LinodeRescue = React.lazy(() => import('./LinodeRescue'));
const LinodeRebuild = React.lazy(() => import('./LinodeRebuild'));
const LinodeNetworking = React.lazy(() => import('./LinodeNetworking'));
const LinodeActivity = React.lazy(() => import('./LinodeActivity'));
const LinodeAdvanced = React.lazy(() => import('./LinodeAdvanced'));
const LinodeBackup = React.lazy(() => import('./LinodeBackup'));

type CombinedProps = ContextProps &
  RouteComponentProps<{
    linodeId: string;
  }>;

const LinodesDetailNavigation: React.FC<CombinedProps> = props => {
  const {
    match: { url },
    linodeLabel,
    linodeConfigs,
    linodeId,
    linodeRegion,
    readOnly
  } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      routeName: `${url}/summary`,
      title: 'Summary'
    },
    {
      routeName: `${url}/volumes`,
      title: 'Volumes'
    },
    {
      routeName: `${url}/networking`,
      title: 'Networking'
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
      routeName: `${url}/rebuild`,
      title: 'Rebuild'
    },
    {
      routeName: `${url}/backup`,
      title: 'Backups'
    },
    {
      routeName: `${url}/activity`,
      title: 'Activity'
    },
    {
      routeName: `${url}/settings`,
      title: 'Settings'
    },
    {
      routeName: `${url}/advanced`,
      title: 'Disks/Configs'
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  return (
    <Tabs
      index={Math.max(
        tabs.findIndex(tab => matches(tab.routeName)),
        0
      )}
      onChange={navToURL}
    >
      <TabLinkList tabs={tabs} />

      <React.Suspense fallback={<SuspenseLoader />}>
        <TabPanels>
          <SafeTabPanel index={0}>
            <LinodeSummary />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <VolumesLanding
              linodeId={linodeId}
              linodeLabel={linodeLabel}
              linodeRegion={linodeRegion}
              linodeConfigs={linodeConfigs}
              readOnly={readOnly}
              fromLinodes
              removeBreadCrumb
            />
          </SafeTabPanel>

          <SafeTabPanel index={2}>
            <LinodeNetworking />
          </SafeTabPanel>

          <SafeTabPanel index={3}>
            <LinodeResize />
          </SafeTabPanel>

          <SafeTabPanel index={4}>
            <LinodeRescue />
          </SafeTabPanel>

          <SafeTabPanel index={5}>
            <LinodeRebuild />
          </SafeTabPanel>

          <SafeTabPanel index={6}>
            <LinodeBackup />
          </SafeTabPanel>

          <SafeTabPanel index={7}>
            <LinodeActivity />
          </SafeTabPanel>

          <SafeTabPanel index={8}>
            <LinodeSettings />
          </SafeTabPanel>

          <SafeTabPanel index={9}>
            <LinodeAdvanced />
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
