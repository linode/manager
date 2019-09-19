import { Event } from 'linode-js-sdk/lib/account';
import {
  cloneLinode,
  cloneLinodeDisk,
  Config,
  Disk,
  Linode,
  LinodeStatus
} from 'linode-js-sdk/lib/linodes';
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
import { makeStyles, Theme } from 'src/components/core/styles';
import Tab from 'src/components/core/Tab';
import Tabs from 'src/components/core/Tabs';
import Typography from 'src/components/core/Typography';
import DefaultLoader from 'src/components/DefaultLoader';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TabLink from 'src/components/TabLink';
import withLinodes from 'src/containers/withLinodes.container';
import { resetEventsPolling } from 'src/events';
import { ApplicationState } from 'src/store';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getParamsFromUrl } from 'src/utilities/queryParams';
import { withLinodeDetailContext } from '../LinodesDetail/linodeDetailContext';
import LinodeControls from '../LinodesDetail/LinodesDetailHeader/LinodeControls';
import MutationNotification from '../LinodesDetail/LinodesDetailHeader/MutationNotification';
import Notifications from '../LinodesDetail/LinodesDetailHeader/Notifications';
import LinodeBusyStatus from '../LinodesDetail/LinodeSummary/LinodeBusyStatus';
import { linodeInTransition } from '../transitions';
import Details from './Details';
import {
  attachAssociatedDisksToConfigs,
  curriedCloneLandingReducer,
  defaultState
} from './utilities';

const Configs = DefaultLoader({
  loader: () => import('./Configs')
});

const Disks = DefaultLoader({
  loader: () => import('./Disks')
});

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1)
  },
  paper: {
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(3)
  },
  appBar: {
    '& > div': {
      marginTop: 0
    }
  },
  outerContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  diskContainer: {
    marginTop: theme.spacing(4)
  },
  title: {
    marginBottom: theme.spacing(2)
  }
}));

interface WithLinodesProps {
  linodesData: Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

type CombinedProps = RouteComponentProps<{}> &
  LinodeContextProps &
  WithLinodesProps &
  DispatchProps;

export const CloneLanding: React.FC<CombinedProps> = props => {
  const {
    configs,
    disks,
    history,
    match: { url },
    region,
    label,
    linodeId,
    requestDisks,
    linodeEvents,
    linodeStatus,
    linodesData
  } = props;

  const classes = useStyles();

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
  const [state, dispatch] = React.useReducer(
    curriedCloneLandingReducer,
    defaultState
  );

  /**
   * Stringify config and disk IDs to make prop comparison (for useEffect).
   * This is an alternative to doing a deep equality check, which is slower
   * (benchmarks: https://jsperf.com/json-stringify-vs-ramda-equals/1) or to
   * simply check the length of disks and configs, which could lead to edge-case bugs.
   */
  const stringifiedConfigIds = JSON.stringify(configs.map(c => c.id));
  const stringifiedDiskIds = JSON.stringify(disks.map(d => d.id));

  // Update configs and disks if they change
  React.useEffect(() => {
    dispatch({
      type: 'syncConfigsDisks',
      configs,
      disks
    });
    // We can't use `configs` and `disks` as deps, since they are arrays.
    // Instead we use a serialized representation of their IDs.
  }, [stringifiedConfigIds, stringifiedDiskIds]);

  // A config and/or disk can be selected via query param. Memoized
  // so it can be used as a dep in the useEffects that consume it.
  const queryParams = React.useMemo(() => getParamsFromUrl(location.search), [
    location.search
  ]);

  // Toggle config if a valid configId is specified as a query param.
  React.useEffect(() => {
    const configFromQS = Number(queryParams.selectedConfig);
    if (configFromQS) {
      return dispatch({ type: 'toggleConfig', id: configFromQS });
    }
  }, [queryParams]);

  // Toggle disk if a valid diskId is specified as a query param.
  React.useEffect(() => {
    const diskFromQS = Number(queryParams.selectedDisk);
    if (diskFromQS) {
      return dispatch({ type: 'toggleDisk', id: diskFromQS });
    }
  }, [queryParams]);

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

  // The configs we know about in our configSelection state.
  const configsInState = configs.filter(eachConfig =>
    state.configSelection.hasOwnProperty(eachConfig.id)
  );
  // The configs that are selected.
  const selectedConfigs = configsInState.filter(
    eachConfig => state.configSelection[eachConfig.id].isSelected
  );
  // IDs of selected configs.
  const selectedConfigIds = selectedConfigs.map(eachConfig => eachConfig.id);

  // The disks we know about in our diskSelection state.
  const disksInState = disks.filter(eachDisk =>
    state.diskSelection.hasOwnProperty(eachDisk.id)
  );
  // The disks that are selected.
  const selectedDisks = disksInState.filter(
    eachDisk => state.diskSelection[eachDisk.id].isSelected
  );
  // IDs of selected disks.
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
    let request: () => Promise<Linode | Disk>;

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

  const firstEventWithProgress = (linodeEvents || []).find(
    eachEvent => typeof eachEvent.percent_complete === 'number'
  );

  const selectedLinode = linodesData.find(
    eachLinode => eachLinode.id === state.selectedLinodeId
  );
  const selectedLinodeRegion = selectedLinode && selectedLinode.region;
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Clone" />
      {/* The header *basically* duplicated from LinodeDetailHeader. Why don't we use that component instead?...
      ...Because we don't want the Nav tabs and we want <LinodeControls /> with a custom <Breadcrumb />.
      @todo: DRY this up a bit?
      */}
      <MutationNotification disks={props.disks} />
      <Notifications />
      <LinodeControls
        breadcrumbProps={{
          removeCrumbX: 4,
          crumbOverrides: [
            {
              label,
              position: 2,
              linkTo: {
                pathname: `/linodes/${linodeId}/summary`
              },
              noCap: true
            }
          ],
          onEditHandlers: undefined
        }}
      />
      {linodeInTransition(linodeStatus, firstEventWithProgress) && (
        <LinodeBusyStatus />
      )}
      <Grid container className={classes.root}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper className={classes.paper}>
            <Typography
              role="header"
              variant="h2"
              className={classes.title}
              data-qa-title
            >
              Clone
            </Typography>
            <AppBar
              className={classes.appBar}
              position="static"
              color="default"
            >
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
                    component={React.forwardRef((forwardedProps, ref) => (
                      <TabLink to={tab.routeName} title={tab.title} />
                    ))}
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
                    configs={configsInState}
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
                    Linode. We recommend you power off your Linode first, and
                    keep it powered off until the disk has finished being
                    cloned.
                  </Typography>
                  <div className={classes.diskContainer}>
                    <Disks
                      disks={disksInState}
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
        <Grid item xs={12} md={4} lg={3}>
          <Details
            currentLinodeId={linodeId}
            selectedConfigs={attachAssociatedDisksToConfigs(
              selectedConfigs,
              disks
            )}
            // If a selected disk is associated with a selected config, we
            // don't want it to appear in the Details component, since
            // cloning the config takes precedence.
            selectedDisks={disksInState.filter(disk => {
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
            selectedLinodeId={state.selectedLinodeId}
            selectedLinodeRegion={selectedLinodeRegion}
            thisLinodeRegion={region}
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
  configs: Config[];
  disks: Disk[];
  region: string;
  label: string;
  linodeStatus: LinodeStatus;
  linodeEvents: Event[];
}
const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  configs: linode._configs,
  disks: linode._disks,
  region: linode.region,
  label: linode.label,
  linodeStatus: linode.status,
  linodeEvents: linode._events
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

const enhanced = compose<CombinedProps, {}>(
  connected,
  linodeContext,
  withLinodes((ownProps, linodesData, linodesLoading, linodesError) => ({
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError
  })),
  withRouter
);

export default enhanced(CloneLanding);
