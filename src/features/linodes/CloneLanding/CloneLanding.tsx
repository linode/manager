import { intersection, pathOr } from 'ramda';
import * as React from 'react';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import AppBar from 'src/components/core/AppBar';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TabLink from 'src/components/TabLink';
import withLinodes from 'src/containers/withLinodes.container';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { withLinodeDetailContext } from '../LinodesDetail/linodeDetailContext';
import Configs from './Configs';
import Details from './Details';
import Disks from './Disks';
import {
  attachAssociatedDisksToConfigs,
  cloneLandingReducer,
  createInitialCloneLandingState
} from './utilities';

type ClassNames = 'root' | 'outerContainer' | 'diskContainer';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit
  },
  outerContainer: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2
  },
  diskContainer: {
    marginTop: theme.spacing.unit * 4
  }
});

interface WithLinodesProps {
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

type CombinedProps = RouteComponentProps<{}> &
  LinodeContextProps &
  WithLinodesProps &
  WithStyles<ClassNames>;

export const CloneLanding: React.FC<CombinedProps> = props => {
  const {
    classes,
    configs,
    disks,
    match: { url },
    region
  } = props;

  /**
   * ROUTING
   */
  const tabs = [
    // These must correspond to the routes inside the Switch
    {
      title: 'Configuration Profiles',
      routeName: `${props.match.url}/configs`
    },
    { title: 'Disks', routeName: `${props.match.url}/disks` }
  ];

  // Update browser URL with tab change
  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  // Helper function for the <Tabs /> component
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  /**
   * STATE MANAGEMENT
   */

  // We grab the query params to (potentially) use in the initial state.
  const queryParams = getParamsFromUrl(location.search);

  const initialState = createInitialCloneLandingState(
    configs,
    disks,
    Number(queryParams.selectedConfig),
    Number(queryParams.selectedDisk)
  );

  const [state, dispatch] = React.useReducer(cloneLandingReducer, initialState);

  // Helper functions for updating the state.
  const toggleConfig = (id: number) => {
    return dispatch({ type: 'toggleConfig', id });
  };

  const toggleDisk = (id: number) => {
    return dispatch({ type: 'toggleDisk', id });
  };

  const setSelectedLinodeId = (id: number) => {
    return dispatch({ type: 'setSelectedLinodeId', id });
  };

  const clearAll = () => dispatch({ type: 'clearAll' });

  const selectedConfigs = configs.filter(
    eachConfig => state.configSelection[eachConfig.id].isSelected
  );

  const selectedConfigIds = selectedConfigs.map(eachConfig => eachConfig.id);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Clone" />
      <Typography variant="h1" data-qa-clone-header>
        Clone
      </Typography>
      <Grid container className={classes.root}>
        <Grid item xs={12} md={9}>
          <Paper>
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
                    data-qa-tab={tab.title}
                    component={() => (
                      <TabLink to={tab.routeName} title={tab.title} />
                    )}
                  />
                ))}
              </Tabs>
            </AppBar>
            <Route
              exact
              path={`${url}(/configs)?`}
              render={() => (
                <div className={classes.outerContainer}>
                  <Configs
                    configs={configs}
                    configSelection={state.configSelection}
                    handleSelect={toggleConfig}
                  />
                </div>
              )}
            />
            <Route
              exact
              path={`${url}/disks`}
              render={() => (
                <div className={classes.outerContainer}>
                  <Typography>
                    You can make a copy of a disk to the same or different
                    Linode. We recommend you power off your Linode first.
                  </Typography>
                  <div className={classes.diskContainer}>
                    <Disks
                      disks={disks}
                      diskSelection={state.diskSelection}
                      selectedConfigIds={selectedConfigIds}
                      handleSelect={toggleDisk}
                    />
                  </div>
                </div>
              )}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Details
            selectedConfigs={attachAssociatedDisksToConfigs(
              selectedConfigs,
              disks
            )}
            // If a selected disk is associated with a selected config, we
            // don't want it to appear in the Details component, since
            // cloning the config takes precedence.
            selectedDisks={disks.filter(disk => {
              return (
                // This disk has been individually selected ...
                state.diskSelection[disk.id].isSelected &&
                // ... AND it's associated configs are NOT selected
                intersection(
                  pathOr(
                    [],
                    [disk.id, 'associatedConfigIds'],
                    state.diskSelection
                  ),
                  selectedConfigIds
                ).length === 0
              );
            })}
            selectedLinode={state.selectedLinodeId}
            region={region}
            handleSelectLinode={setSelectedLinodeId}
            handleToggleConfig={toggleConfig}
            handleToggleDisk={toggleDisk}
            clearAll={clearAll}
          />
        </Grid>
      </Grid>
      <Switch />
    </React.Fragment>
  );
};

interface LinodeContextProps {
  linodeId: number;
  configs: Linode.Config[];
  disks: Linode.Disk[];
  region: string;
}
const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  configs: linode._configs,
  disks: linode._disks,
  region: linode.region
}));

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  linodeContext,
  styled,
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError
  })),
  withRouter
);

export default enhanced(CloneLanding);
