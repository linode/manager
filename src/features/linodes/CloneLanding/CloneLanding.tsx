import { intersection, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import {
  matchPath,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
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
import { resetEventsPolling } from 'src/events';
import { cloneLinode, cloneLinodeDisk } from 'src/services/linodes';
import { ApplicationState } from 'src/store';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getErrorMap } from 'src/utilities/errorUtils';
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
  DispatchProps &
  WithStyles<ClassNames>;

export const CloneLanding: React.FC<CombinedProps> = props => {
  const {
    classes,
    configs,
    disks,
    history,
    match: { url },
    region,
    linodeId,
    requestDisks
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

  const setSubmitting = (value: boolean) => {
    return dispatch({ type: 'setSubmitting', value });
  };

  const setErrors = (errors?: Linode.ApiFieldError[]) => {
    return dispatch({ type: 'setErrors', errors });
  };

  const clearAll = () => dispatch({ type: 'clearAll' });

  const selectedConfigs = configs.filter(
    eachConfig => state.configSelection[eachConfig.id].isSelected
  );

  const selectedConfigIds = selectedConfigs.map(eachConfig => eachConfig.id);

  const selectedDisks = disks.filter(
    eachDisk => state.diskSelection[eachDisk.id].isSelected
  );

  const selectedDiskIds = selectedDisks.map(eachDisk => eachDisk.id);

  const handleClone = () => {
    // The "Clone" button should be disabled if there's no Linode selected,
    // but we'll include this early return just in case (and to make TS happy).
    if (!state.selectedLinodeId) {
      return;
    }

    /**
     * There are two distinct actions we can take here, depending on the selected Linode.
     *
     * 1) Duplicate a single disk on the current Linode.
     * 2) Clone configs/disks to a different Linode.
     */
    let request: () => Promise<Linode.Linode | Linode.Disk>;

    // The selected Linode is the same as the current Linode -- duplicate the disk
    if (state.selectedLinodeId === linodeId) {
      // In this mode, the "Clone" button will be disabled unless exactly one Disk is selected,
      // but we'll include this early return just in case (and to make TS happy).
      if (selectedDiskIds.length !== 1) {
        return;
      }

      request = () => cloneLinodeDisk(linodeId, selectedDiskIds[0]);
    } else {
      const sourceLinodeId = linodeId;
      const destinationLinodeId = state.selectedLinodeId;

      /** @todo: We should be able to let the user know if there isn't enough
       * space on the destination Linode.
       */

      /** NOTE:
       * We need to supply `configs` AND `disks` here, even if one is an empty array.
       * This is because the `cloneLinode` API method will clone ALL configs or disks
       * if they are not specified.
       */
      request = () =>
        cloneLinode(sourceLinodeId, {
          linode_id: destinationLinodeId,
          configs: selectedConfigIds,
          disks: selectedDiskIds
        });
    }

    setSubmitting(true);
    setErrors(undefined);

    request()
      .then(() => {
        setSubmitting(false);
        resetEventsPolling();
        requestDisks(linodeId);
        history.push(`/linodes/${linodeId}/advanced`);
      })
      .catch(errors => {
        setSubmitting(false);
        setErrors(errors);
      });
  };

  const errorMap = getErrorMap(['disk_size'], state.errors);

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
            currentLinodeId={linodeId}
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
            handleClone={handleClone}
            isSubmitting={state.isSubmitting}
            errorMap={errorMap}
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

interface DispatchProps {
  requestDisks: (linodeId: number) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    requestDisks: (linodeId: number) =>
      dispatch(getAllLinodeDisks({ linodeId }))
  };
};

const connected = connect(
  undefined,
  mapDispatchToProps
);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  connected,
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
