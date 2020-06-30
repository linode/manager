import { Config } from '@linode/api-v4/lib/linodes';
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
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLink from 'src/components/TabLink';
import VolumesLanding_CMR from 'src/features/Volumes/VolumesLanding_CMR';
import { withLinodeDetailContext } from './linodeDetailContext';

const LinodeSummary_CMR = React.lazy(() =>
  import('./LinodeSummary/LinodeSummary_CMR')
);
const LinodeNetworking_CMR = React.lazy(() =>
  import('./LinodeNetworking/LinodeNetworking_CMR')
);
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
    match: { url },
    linodeLabel,
    linodeConfigs,
    linodeId,
    linodeRegion,
    readOnly
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
      routeName: `${url}/rebuild`,
      title: 'Rebuild'
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
          // Prevent console error for -1 as invalid tab index if we're redirecting from e.g. /linodes/invalid-route
          value={Math.max(
            tabs.findIndex(tab => matches(tab.routeName)),
            0
          )}
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
                  title={tab.title}
                  {...tabProps}
                  ref={ref}
                />
              ))}
            />
          ))}
        </Tabs>
      </AppBar>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route
            exact
            path={`/linodes/:linodeId/analytics`}
            component={LinodeSummary_CMR}
          />
          <Route
            exact
            path={`/linodes/:linodeId/networking`}
            component={LinodeNetworking_CMR}
          />
          <Route
            exact
            path={`/linodes/:linodeId/storage`}
            render={routeProps => (
              <div
                id="tabpanel-storage"
                role="tabpanel"
                aria-labelledby="tab-storage"
              >
                <VolumesLanding_CMR
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
            path={`/linodes/:linodeId/configurations`}
            component={LinodeAdvanced_CMR}
          />
          <Route
            exact
            path={`/linodes/:linodeId/backup`}
            component={LinodeBackup_CMR}
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
            path={`/linodes/:linodeId/activity`}
            component={LinodeActivity_CMR}
          />
          <Route
            exact
            path={`/linodes/:linodeId/settings`}
            component={LinodeSettings_CMR}
          />
          {/* 404 */}
          <Redirect to={`${url}/analytics`} />
        </Switch>
      </React.Suspense>
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
