import * as React from 'react';
import { matchPath, Redirect, Route, Switch } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import {
  StyleRulesCallback,
  
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import { linodeInTransition } from 'src/features/linodes/transitions';

import LinodeBackup from '../LinodeBackup';
import LinodeNetworking from '../LinodeNetworking';
import LinodeRebuild from '../LinodeRebuild';
import LinodeRescue from '../LinodeRescue';
import LinodeResize from '../LinodeResize';
import LinodeSettings from '../LinodeSettings';
import LinodeSummary from '../LinodeSummary';
import LinodeBusyStatus from '../LinodeSummary/LinodeBusyStatus';
import LinodeVolumes from '../LinodeVolumes';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface ReducedLinode {
  status: Linode.LinodeStatus;
  recentEvent?: Linode.Event;
}

interface Props {
  linode: ReducedLinode;
  url: string;
  history: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TabsAndStatusBarPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { linode, url } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${url}/summary`, title: 'Summary' },
    { routeName: `${url}/volumes`, title: 'Volumes' },
    { routeName: `${url}/networking`, title: 'Networking' },
    { routeName: `${url}/resize`, title: 'Resize' },
    { routeName: `${url}/rescue`, title: 'Rescue' },
    { routeName: `${url}/rebuild`, title: 'Rebuild' },
    { routeName: `${url}/backup`, title: 'Backups' },
    { routeName: `${url}/settings`, title: 'Settings' },
  ];

  const handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  }

  return (
    <React.Fragment>
      {linodeInTransition(linode.status, linode.recentEvent) &&
        <LinodeBusyStatus status={linode.status} recentEvent={linode.recentEvent} />
      }
      <AppBar position="static" color="default">
        <Tabs
          value={tabs.findIndex(tab => matches(tab.routeName))}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          scrollable
          scrollButtons="off"
        >
          {tabs.map(tab =>
            <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title} />)}
        </Tabs>
      </AppBar>
      <Switch>
        <Route exact path={`${url}/summary`} component={LinodeSummary} />
        <Route exact path={`${url}/volumes`} component={LinodeVolumes} />
        <Route exact path={`${url}/networking`} component={LinodeNetworking} />
        <Route exact path={`${url}/resize`} component={LinodeResize} />
        <Route exact path={`${url}/rescue`} component={LinodeRescue} />
        <Route exact path={`${url}/rebuild`} component={LinodeRebuild} />
        <Route exact path={`${url}/backup`} component={LinodeBackup} />
        <Route exact path={`${url}/settings`} component={LinodeSettings} />
        {/* 404 */}
        <Redirect to={`${url}/summary`} />
      </Switch>
    </React.Fragment>
  );
};

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
}

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(TabsAndStatusBarPanel);
