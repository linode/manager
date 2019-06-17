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
import LinodeActivity from './LinodeActivity';
import LinodeAdvanced from './LinodeAdvanced';
import LinodeBackup from './LinodeBackup';
import { withLinodeDetailContext } from './linodeDetailContext';
import LinodeNetworking from './LinodeNetworking';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeSettings from './LinodeSettings';
import LinodeSummary from './LinodeSummary';

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
    { routeName: `${url}/summary`, title: 'Summary' },
    { routeName: `${url}/volumes`, title: 'Volumes' },
    { routeName: `${url}/networking`, title: 'Networking' },
    { routeName: `${url}/resize`, title: 'Resize' },
    { routeName: `${url}/rescue`, title: 'Rescue' },
    { routeName: `${url}/rebuild`, title: 'Rebuild' },
    { routeName: `${url}/backup`, title: 'Backups' },
    { routeName: `${url}/activity`, title: 'Activity' },
    { routeName: `${url}/settings`, title: 'Settings' },
    { routeName: `${url}/advanced`, title: 'Advanced' }
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
      <AppBar position="static" color="default">
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
            <VolumesLanding
              linodeId={linodeId}
              linodeLabel={linodeLabel}
              linodeRegion={linodeRegion}
              linodeConfigs={linodeConfigs}
              readOnly={readOnly}
              {...routeProps}
            />
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
  linodeConfigs: Linode.Config[];
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
