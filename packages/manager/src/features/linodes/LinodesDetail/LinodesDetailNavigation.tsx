import { Config } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Router } from '@reach/router';
import { compose } from 'recompose';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import VolumesLanding from 'src/features/Volumes/VolumesLanding';
import { withLinodeDetailContext } from './linodeDetailContext';

// import DefaultLoader from 'src/components/DefaultLoader';

import LinodeSummary from './LinodeSummary';
import LinodeSettings from './LinodeSettings';
import LinodeResize from './LinodeResize';
import LinodeRescue from './LinodeRescue';
import LinodeRebuild from './LinodeRebuild';
import LinodeNetworking from './LinodeNetworking';
import LinodeActivity from './LinodeActivity';
import LinodeAdvanced from './LinodeAdvanced';
import LinodeBackup from './LinodeBackup';

// const LinodeSummary = DefaultLoader({
//   loader: () => import('./LinodeSummary')
// });

// const LinodeSettings = DefaultLoader({
//   loader: () => import('./LinodeSettings')
// });

// const LinodeResize = DefaultLoader({
//   loader: () => import('./LinodeResize')
// });

// const LinodeRescue = DefaultLoader({
//   loader: () => import('./LinodeRescue')
// });

// const LinodeRebuild = DefaultLoader({
//   loader: () => import('./LinodeRebuild')
// });

// const LinodeNetworking = DefaultLoader({
//   loader: () => import('./LinodeNetworking')
// });

// const LinodeActivity = DefaultLoader({
//   loader: () => import('./LinodeActivity')
// });

// const LinodeAdvanced = DefaultLoader({
//   loader: () => import('./LinodeAdvanced')
// });

// const LinodeBackup = DefaultLoader({
//   loader: () => import('./LinodeBackup')
// });

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
    <>
      <Tabs>
        <TabLinkList tabs={tabs} />
        <Router component={TabPanels}>
          <TabPanel
            as={LinodeSummary}
            path={`/linodes/:linodeId/summary`}
            default
          />

          <TabPanel
            as={VolumesLanding}
            path={`/linodes/:linodeId/volumes`}
            linodeId={linodeId}
            linodeLabel={linodeLabel}
            linodeRegion={linodeRegion}
            linodeConfigs={linodeConfigs}
            readOnly={readOnly}
            fromLinodes
            removeBreadCrumb
          />

          <TabPanel
            as={LinodeNetworking}
            path={`/linodes/:linodeId/networking`}
          />

          <TabPanel as={LinodeResize} path={`/linodes/:linodeId/resize`} />

          <TabPanel as={LinodeRescue} path={`/linodes/:linodeId/rescue`} />
          <TabPanel as={LinodeRebuild} path={`/linodes/:linodeId/rebuild`} />

          <TabPanel as={LinodeBackup} path={`/linodes/:linodeId/backup`} />

          <TabPanel as={LinodeActivity} path={`/linodes/:linodeId/activity`} />

          <TabPanel
            component={LinodeSettings}
            path={`/linodes/:linodeId/settings`}
          />

          <TabPanel as={LinodeAdvanced} path={`/linodes/:linodeId/advanced`} />
        </Router>
      </Tabs>
    </>
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
