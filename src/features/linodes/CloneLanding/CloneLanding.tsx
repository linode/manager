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
  cloneLandingReducer,
  createInitialCloneLandingState
} from './utilities';

type ClassNames = 'root' | 'configContainer' | 'diskOuter' | 'diskInner';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit
  },
  configContainer: {
    paddingLeft: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit
  },
  diskOuter: {
    paddingLeft: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit
  },
  diskInner: {
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

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Configuration Profiles',
      routeName: `${props.match.url}/configs`
    },
    { title: 'Disks', routeName: `${props.match.url}/disks` }
  ];

  const handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = props;
    const routeName = tabs[value].routeName;
    history.push(`${routeName}`);
  };

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const queryParams = getParamsFromUrl(location.search);

  const initialState = createInitialCloneLandingState(
    configs,
    disks,
    Number(queryParams.selectedConfig),
    Number(queryParams.defaultSelectedDiskId)
  );

  const [state, dispatch] = React.useReducer(cloneLandingReducer, initialState);

  const handleSelectConfig = (id: number) =>
    dispatch({ type: 'toggleConfig', id });

  const handleSelectDisk = (id: number) => dispatch({ type: 'toggleDisk', id });

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
              path={`${url}/configs`}
              render={() => (
                <div className={classes.configContainer}>
                  <Configs
                    configs={configs}
                    selectedConfigs={state.configSelection}
                    handleSelect={handleSelectConfig}
                  />
                </div>
              )}
            />
            <Route
              exact
              path={`${url}/disks`}
              render={() => (
                <div className={classes.diskOuter}>
                  <Typography>
                    You can make a copy of a disk to the same or different
                    Linode. We recommend you power off your Linode first.
                  </Typography>
                  <div className={classes.diskInner}>
                    <Disks
                      disks={disks}
                      selectedDisks={state.diskSelection}
                      selectedConfigs={state.configSelection}
                      handleSelect={handleSelectDisk}
                    />
                  </div>
                </div>
              )}
            />
            <Route exact path={`${url}`} component={Configs} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Details
            selectedConfigs={configs
              // Filter out configs that aren't selected
              .filter(config => state.configSelection[config.id].isSelected)
              // Add associatedDisks to each config
              .map(eachConfig => ({
                ...eachConfig,
                associatedDisks:
                  state.configSelection[eachConfig.id].associatedDisks
              }))}
            selectedDisks={disks
              // Filter out disks that aren't selected
              .filter(disk => state.diskSelection[disk.id].isSelected)}
            selectedLinode={state.selectedLinodeId}
            region={region}
            handleSelectLinode={(id: number) =>
              dispatch({ type: 'setSelectedLinodeId', id })
            }
            handleSelectConfig={handleSelectConfig}
            handleSelectDisk={handleSelectDisk}
            clearAll={() => dispatch({ type: 'clearAll' })}
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
