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
import AppBar from 'src/components/core/AppBar';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
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

const LinodesDetailNavigation: React.StatelessComponent<
  CombinedProps
> = props => {
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
      title: 'Summary',
      name: 'linode-detail-summary'
    },
    {
      routeName: `${url}/volumes`,
      title: 'Volumes',
      name: 'linode-detail-volumes'
    },
    {
      routeName: `${url}/networking`,
      title: 'Networking',
      name: 'linode-detail-networking'
    },
    {
      routeName: `${url}/resize`,
      title: 'Resize',
      name: 'linode-detail-resize'
    },
    {
      routeName: `${url}/rescue`,
      title: 'Rescue',
      name: 'linode-detail-rescue'
    },
    {
      routeName: `${url}/rebuild`,
      title: 'Rebuild',
      name: 'linode-detail-rebuild'
    },
    {
      routeName: `${url}/backup`,
      title: 'Backups',
      name: 'linode-detail-backups'
    },
    {
      routeName: `${url}/activity`,
      title: 'Activity',
      name: 'linode-detail-activity'
    },
    {
      routeName: `${url}/settings`,
      title: 'Settings',
      name: 'linode-detail-settings'
    },
    {
      routeName: `${url}/advanced`,
      title: 'Advanced',
      name: 'linode-detail-advanced'
    }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  return (
    <>
      <AppBar position="static" color="default" role="tablist">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName))}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="on"
        >
          {tabs.map(tab => (
            <Tab
              key={tab.title}
              label={tab.title}
              data-qa-tab={tab.title}
              component={React.forwardRef((tabProps, ref) => (
                <TabLink
                  to={tab.routeName}
                  idName={tab.name}
                  title={tab.title}
                  {...tabProps}
                  ref={ref}
                />
              ))}
            />
          ))}
        </Tabs>
      </AppBar>
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
              id="tabpanel-linode-detail-volumes"
              role="tabpanel"
              aria-labelledby="tab-linode-detail-volumes"
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
          exact
          path={`/linodes/:linodeId/networking`}
          component={LinodeNetworking}
        />
        <Route
          exact
          path={`/linodes/:linodeId/resize`}
          component={LinodeResize}
        />
        <Route
          exact
          path={`/linodes/:linodeId/rescue`}
          component={LinodeRescue}
        />
        <Route
          exact
          path={`/linodes/:linodeId/rebuild`}
          component={LinodeRebuild}
        />
        <Route
          exact
          path={`/linodes/:linodeId/backup`}
          component={LinodeBackup}
        />
        <Route
          exact
          path={`/linodes/:linodeId/activity`}
          component={LinodeActivity}
        />
        <Route
          exact
          path={`/linodes/:linodeId/settings`}
          component={LinodeSettings}
        />
        <Route
          exact
          path={`/linodes/:linodeId/advanced`}
          component={LinodeAdvanced}
        />
        {/* 404 */}
        <Redirect to={`${url}/summary`} />
      </Switch>
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
