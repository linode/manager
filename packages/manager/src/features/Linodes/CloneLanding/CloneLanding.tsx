import { castDraft } from 'immer';
import {
  cloneLinode,
  cloneLinodeDisk,
  Disk,
  Linode,
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { intersection, pathOr } from 'ramda';
import * as React from 'react';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { Typography } from 'src/components/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from '@mui/material/Unstable_Grid2';
import { resetEventsPolling } from 'src/eventsPolling';
import { getErrorMap } from 'src/utilities/errorUtils';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { MutationNotification } from '../LinodesDetail/LinodesDetailHeader/MutationNotification';
import Notifications from '../LinodesDetail/LinodesDetailHeader/Notifications';
import Details from './Details';
import {
  attachAssociatedDisksToConfigs,
  curriedCloneLandingReducer,
  defaultState,
} from './utilities';
import {
  useAllLinodeConfigsQuery,
  useAllLinodesQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';

const Configs = React.lazy(() => import('./Configs'));
const Disks = React.lazy(() => import('./Disks'));
const LinodesDetailHeader = React.lazy(
  () => import('../LinodesDetail/LinodesDetailHeader/LinodeDetailHeader')
);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
  paper: {
    padding: `${theme.spacing(3)} ${theme.spacing(3)} 0`,
  },
  appBar: {
    '& > div': {
      marginTop: 0,
    },
  },
  outerContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  diskContainer: {
    marginTop: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
}));

const CloneLanding = () => {
  const { linodeId: _linodeId } = useParams<{ linodeId: string }>();
  const history = useHistory();
  const match = useRouteMatch();
  const location = useLocation();

  const linodeId = Number(_linodeId);

  const { data: _configs } = useAllLinodeConfigsQuery(linodeId);
  const { data: _disks } = useAllLinodeDisksQuery(linodeId);
  const { data: linodes } = useAllLinodesQuery();
  const { data: linode } = useLinodeQuery(linodeId);

  const classes = useStyles();

  const configs = _configs ?? [];
  const disks = _disks ?? [];

  /**
   * ROUTING
   */
  const tabs = [
    // These must correspond to the routes inside the Switch
    {
      title: 'Configuration Profiles',
      routeName: `${match.url}/configs`,
    },
    {
      title: 'Disks',
      routeName: `${match.url}/disks`,
    },
  ];

  // Helper function for the <Tabs /> component
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
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
  const stringifiedConfigIds = JSON.stringify(configs.map((c) => c.id));
  const stringifiedDiskIds = JSON.stringify(disks.map((d) => d.id));

  // Update configs and disks if they change
  React.useEffect(() => {
    dispatch({
      type: 'syncConfigsDisks',
      configs,
      disks,
    });
    // We can't use `configs` and `disks` as deps, since they are arrays.
    // Instead we use a serialized representation of their IDs.
  }, [stringifiedConfigIds, stringifiedDiskIds]);

  // A config and/or disk can be selected via query param. Memoized
  // so it can be used as a dep in the useEffects that consume it.
  const queryParams = React.useMemo(
    () => getQueryParamsFromQueryString(location.search),
    [location.search]
  );

  // Toggle config if a valid configId is specified as a query param.
  React.useEffect(() => {
    const configFromQS = Number(queryParams.selectedConfig);
    if (configFromQS && configs) {
      return dispatch({ type: 'toggleConfig', id: configFromQS });
    }
  }, [queryParams, configs]);

  // Toggle disk if a valid diskId is specified as a query param.
  React.useEffect(() => {
    const diskFromQS = Number(queryParams.selectedDisk);
    if (diskFromQS && disks) {
      return dispatch({ type: 'toggleDisk', id: diskFromQS });
    }
  }, [queryParams, disks]);

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

  const setErrors = (errors?: APIError[]) => {
    return dispatch({ type: 'setErrors', errors });
  };

  const clearAll = () => dispatch({ type: 'clearAll' });

  // The configs we know about in our configSelection state.
  const configsInState = configs.filter((eachConfig) =>
    state.configSelection.hasOwnProperty(eachConfig.id)
  );
  // The configs that are selected.
  const selectedConfigs = configsInState.filter(
    (eachConfig) => state.configSelection[eachConfig.id].isSelected
  );
  // IDs of selected configs.
  const selectedConfigIds = selectedConfigs.map((eachConfig) => eachConfig.id);

  // The disks we know about in our diskSelection state.
  const disksInState = disks.filter((eachDisk) =>
    state.diskSelection.hasOwnProperty(eachDisk.id)
  );
  // The disks that are selected.
  const selectedDisks = disksInState.filter(
    (eachDisk) => state.diskSelection[eachDisk.id].isSelected
  );
  // IDs of selected disks.
  const selectedDiskIds = selectedDisks.map((eachDisk) => eachDisk.id);

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
          disks: selectedDiskIds,
        });
    }

    setSubmitting(true);
    setErrors(undefined);

    request()
      .then(() => {
        setSubmitting(false);
        resetEventsPolling();
        history.push(`/linodes/${linodeId}/configurations`);
      })
      .catch((errors) => {
        setSubmitting(false);
        setErrors(errors);
      });
  };

  // Cast the results of the Immer state to a mutable data structure.
  const errorMap = getErrorMap(['disk_size'], castDraft(state.errors));

  const selectedLinode = linodes?.find(
    (eachLinode) => eachLinode.id === state.selectedLinodeId
  );
  const selectedLinodeRegion = selectedLinode && selectedLinode.region;
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Clone" />
      <MutationNotification linodeId={linodeId} />
      <Notifications />
      <LinodesDetailHeader />
      <Grid container className={classes.root}>
        <Grid xs={12} md={8} lg={9}>
          <Paper className={classes.paper}>
            <Typography
              role="heading"
              aria-level={2}
              variant="h2"
              className={classes.title}
              data-qa-title
            >
              Clone
            </Typography>

            <Tabs
              index={Math.max(
                tabs.findIndex((tab) => matches(tab.routeName)),
                0
              )}
              onChange={navToURL}
            >
              <TabLinkList tabs={tabs} />
              <TabPanels>
                <SafeTabPanel index={0}>
                  <div className={classes.outerContainer}>
                    <Configs
                      configs={configsInState}
                      // Cast the results of the Immer state to a mutable data structure.
                      configSelection={castDraft(state.configSelection)}
                      handleSelect={toggleConfig}
                    />
                  </div>
                </SafeTabPanel>

                <SafeTabPanel index={1}>
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
                        // Cast the results of the Immer state to a mutable data structure.
                        diskSelection={castDraft(state.diskSelection)}
                        selectedConfigIds={selectedConfigIds}
                        handleSelect={toggleDisk}
                      />
                    </div>
                  </div>
                </SafeTabPanel>
              </TabPanels>
            </Tabs>
          </Paper>
        </Grid>
        <Grid xs={12} md={4} lg={3}>
          <Details
            currentLinodeId={linodeId}
            selectedConfigs={attachAssociatedDisksToConfigs(
              selectedConfigs,
              disks
            )}
            // If a selected disk is associated with a selected config, we
            // don't want it to appear in the Details component, since
            // cloning the config takes precedence.
            selectedDisks={disksInState.filter((disk) => {
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
            thisLinodeRegion={linode?.region ?? ''}
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
    </React.Fragment>
  );
};

export default CloneLanding;
