import { Config } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import { matchPath, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import TabPanel from 'src/components/core/ReachTabPanel';
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

const LinodesDetailNavigation: React.StatelessComponent<CombinedProps> = props => {
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

  return (
    <Tabs defaultIndex={tabs.findIndex(tab => matches(tab.routeName))}>
      <TabLinkList tabs={tabs} />

      <React.Suspense fallback={<SuspenseLoader />}>
        <TabPanels>
          <TabPanel>
            <LinodeSummary />
          </TabPanel>
          <TabPanel>
            <VolumesLanding
              linodeId={linodeId}
              linodeLabel={linodeLabel}
              linodeRegion={linodeRegion}
              linodeConfigs={linodeConfigs}
              readOnly={readOnly}
              fromLinodes
              removeBreadCrumb
            />
          </TabPanel>

          <TabPanel>
            <LinodeNetworking />
          </TabPanel>

          <TabPanel>
            <LinodeResize />
          </TabPanel>

          <TabPanel>
            <LinodeRescue />
          </TabPanel>

          <TabPanel>
            <LinodeRebuild />
          </TabPanel>

          <TabPanel>
            <LinodeBackup />
          </TabPanel>

          <TabPanel>
            <LinodeActivity />
          </TabPanel>

          <TabPanel>
            <LinodeSettings />
          </TabPanel>

          <TabPanel>
            <LinodeAdvanced />
          </TabPanel>
        </TabPanels>
      </React.Suspense>
    </Tabs>
  );
};

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
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
