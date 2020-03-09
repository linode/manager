import { Config } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import Tabs from 'src/components/core/Tabs';
import TabPanels from 'src/components/core/TabPanels';
import TabPanel from 'src/components/core/TabPanel';
import TabLink from 'src/components/TabLink';
import VolumesLanding from 'src/features/Volumes/VolumesLanding';
import { withLinodeDetailContext } from './linodeDetailContext';

import DefaultLoader from 'src/components/DefaultLoader';

const LinodeSummary = DefaultLoader({
  loader: () => import('./LinodeSummary')
});

const LinodeSettings = DefaultLoader({
  loader: () => import('./LinodeSettings')
});

const LinodeResize = DefaultLoader({
  loader: () => import('./LinodeResize')
});

const LinodeRescue = DefaultLoader({
  loader: () => import('./LinodeRescue')
});

const LinodeRebuild = DefaultLoader({
  loader: () => import('./LinodeRebuild')
});

const LinodeNetworking = DefaultLoader({
  loader: () => import('./LinodeNetworking')
});

const LinodeActivity = DefaultLoader({
  loader: () => import('./LinodeActivity')
});

const LinodeAdvanced = DefaultLoader({
  loader: () => import('./LinodeAdvanced')
});

const LinodeBackup = DefaultLoader({
  loader: () => import('./LinodeBackup')
});

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

  // const handleTabChange = (
  //   event: React.ChangeEvent<HTMLDivElement>,
  //   value: number
  // ) => {
  //   const { history } = props;
  //   const routeName = tabs[value].routeName;
  //   history.push(`${routeName}`);
  // };

  return (
    <>
      <Tabs
        value={tabs.findIndex(tab => matches(tab.routeName))}
        // onChange={handleTabChange}
        // indicatorColor="primary"
        // textColor="primary"
        // variant="scrollable"
        // scrollButtons="on"
      >
        {tabs.map(tab => (
          <TabLink to={tab.routeName} title={tab.title} />
        ))}

        <TabPanels>
          <Switch>
            <Route
              exact
              path={`/linodes/:linodeId/summary`}
              component={LinodeSummary}
            />

            <Route
              exact
              path={`/linodes/:linodeId/volumes`}
              render={routeProps => (
                <div
                  id="tabpanel-volumes"
                  role="tabpanel"
                  aria-labelledby="tab-volumes"
                >
                  <VolumesLanding
                    linodeId={linodeId}
                    linodeLabel={linodeLabel}
                    linodeRegion={linodeRegion}
                    linodeConfigs={linodeConfigs}
                    readOnly={readOnly}
                    fromLinodes
                    removeBreadCrumb
                    {...routeProps}
                  />
                </div>
              )}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/networking`}
              component={LinodeNetworking}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/resize`}
              component={LinodeResize}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/rescue`}
              component={LinodeRescue}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/rebuild`}
              component={LinodeRebuild}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/backup`}
              component={LinodeBackup}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/activity`}
              component={LinodeActivity}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/settings`}
              component={LinodeSettings}
            />

            <Route
              as={Route}
              exact
              path={`/linodes/:linodeId/advanced`}
              component={LinodeAdvanced}
            />

            {/* 404 */}
            <Redirect to={`${url}/summary`} />
          </Switch>
        </TabPanels>
      </Tabs>
    </>
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
