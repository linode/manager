import { cloneLinode, cloneLinodeDisk } from '@linode/api-v4/lib/linodes';
import {
  useAllLinodeConfigsQuery,
  useAllLinodeDisksQuery,
  useAllLinodesQuery,
  useLinodeQuery,
} from '@linode/queries';
import { Box, Notice, Paper, Typography } from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { castDraft } from 'immer';
import * as React from 'react';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useEventsPollingActions } from 'src/queries/events/events';
import { getErrorMap } from 'src/utilities/errorUtils';

import { MutationNotification } from '../LinodesDetail/LinodesDetailHeader/MutationNotification';
import Notifications from '../LinodesDetail/LinodesDetailHeader/Notifications';
import { Details } from './Details';
import {
  attachAssociatedDisksToConfigs,
  curriedCloneLandingReducer,
  defaultState,
} from './utilities';

import type { Disk, Linode } from '@linode/api-v4/lib/linodes';
import type { APIError } from '@linode/api-v4/lib/types';
import type { LinodeConfigAndDiskQueryParams } from 'src/features/Linodes/types';

const Configs = React.lazy(() => import('./Configs'));
const Disks = React.lazy(() => import('./Disks'));
const LinodesDetailHeader = React.lazy(() =>
  import(
    'src/features/Linodes/LinodesDetail/LinodesDetailHeader/LinodeDetailHeader'
  ).then((module) => ({
    default: module.LinodeDetailHeader,
  }))
);

export const CloneLanding = () => {
  const { linodeId: _linodeId } = useParams<{ linodeId: string }>();
  const history = useHistory();
  const match = useRouteMatch();
  const location = useLocation();
  const theme = useTheme();

  const { checkForNewEvents } = useEventsPollingActions();

  const linodeId = Number(_linodeId);

  const { data: _configs } = useAllLinodeConfigsQuery(linodeId);
  const { data: _disks } = useAllLinodeDisksQuery(linodeId);
  const { data: linodes } = useAllLinodesQuery();
  const { data: linode } = useLinodeQuery(linodeId);

  const configs = _configs ?? [];
  const disks = _disks ?? [];

  /**
   * ROUTING
   */
  const tabs = [
    // These must correspond to the routes inside the Switch
    {
      routeName: `${match.url}/configs`,
      title: 'Configuration Profiles',
    },
    {
      routeName: `${match.url}/disks`,
      title: 'Disks',
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
      configs,
      disks,
      type: 'syncConfigsDisks',
    });
    // We can't use `configs` and `disks` as deps, since they are arrays.
    // Instead we use a serialized representation of their IDs.
  }, [stringifiedConfigIds, stringifiedDiskIds]);

  // A config and/or disk can be selected via query param. Memoized
  // so it can be used as a dep in the useEffects that consume it.
  const queryParams = React.useMemo(
    () =>
      getQueryParamsFromQueryString<LinodeConfigAndDiskQueryParams>(
        location.search
      ),
    [location.search]
  );

  // Toggle config if a valid configId is specified as a query param.
  React.useEffect(() => {
    const configFromQS = Number(queryParams.selectedConfig);
    if (configFromQS && configs) {
      return dispatch({ id: configFromQS, type: 'toggleConfig' });
    }
  }, [queryParams, configs]);

  // Toggle disk if a valid diskId is specified as a query param.
  React.useEffect(() => {
    const diskFromQS = Number(queryParams.selectedDisk);
    if (diskFromQS && disks) {
      return dispatch({ id: diskFromQS, type: 'toggleDisk' });
    }
  }, [queryParams, disks]);

  // Helper functions for updating the state.
  const toggleConfig = (id: number) => {
    return dispatch({ id, type: 'toggleConfig' });
  };

  const toggleDisk = (id: number) => {
    return dispatch({ id, type: 'toggleDisk' });
  };

  const setSelectedLinodeId = (id: number) => {
    return dispatch({ id, type: 'setSelectedLinodeId' });
  };

  const setSubmitting = (value: boolean) => {
    return dispatch({ type: 'setSubmitting', value });
  };

  const setErrors = (errors?: APIError[]) => {
    return dispatch({ errors, type: 'setErrors' });
  };

  const clearAll = () => dispatch({ type: 'clearAll' });

  // The configs we know about in our configSelection state.
  const configsInState = configs.filter((eachConfig) =>
    Object.prototype.hasOwnProperty.call(state.configSelection, eachConfig.id)
  );
  // The configs that are selected.
  const selectedConfigs = configsInState.filter(
    (eachConfig) => state.configSelection[eachConfig.id].isSelected
  );
  // IDs of selected configs.
  const selectedConfigIds = selectedConfigs.map((eachConfig) => eachConfig.id);

  // The disks we know about in our diskSelection state.
  const disksInState = disks.filter((eachDisk) =>
    Object.prototype.hasOwnProperty.call(state.diskSelection, eachDisk.id)
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
    let request: () => Promise<Disk | Linode>;

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
          configs: selectedConfigIds,
          disks: selectedDiskIds,
          linode_id: destinationLinodeId,
        });
    }

    setSubmitting(true);
    setErrors(undefined);

    request()
      .then(() => {
        setSubmitting(false);
        checkForNewEvents();
        history.push(`/linodes/${linodeId}/configurations`);
      })
      .catch((errors) => {
        setSubmitting(false);
        setErrors(errors);
      });
  };

  const handleCancel = () => {
    history.push(`/linodes/${linodeId}/configurations`);
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
      <Paper sx={{ padding: theme.spacing(2) }}>
        <Grid
          container
          sx={{
            justifyContent: 'space-between',
            marginTop: theme.spacing(1),
          }}
        >
          <Grid
            size={{
              md: 7,
              xs: 12,
            }}
          >
            <Paper sx={{ padding: 0 }}>
              <Typography
                aria-level={2}
                data-qa-title
                role="heading"
                sx={{ marginBottom: theme.spacing(2) }}
                variant="h2"
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
                    <Box>
                      <Configs
                        configs={configsInState}
                        // Cast the results of the Immer state to a mutable data structure.
                        configSelection={castDraft(state.configSelection)}
                        handleSelect={toggleConfig}
                      />
                    </Box>
                  </SafeTabPanel>

                  <SafeTabPanel index={1}>
                    <Box>
                      <Notice spacingTop={16} variant="info">
                        You can make a copy of a disk to the same or different
                        Linode. We recommend you power off your Linode first,
                        and keep it powered off until the disk has finished
                        being cloned.
                      </Notice>
                      <div>
                        <Disks
                          disks={disksInState}
                          // Cast the results of the Immer state to a mutable data structure.
                          diskSelection={castDraft(state.diskSelection)}
                          handleSelect={toggleDisk}
                          selectedConfigIds={selectedConfigIds}
                        />
                      </div>
                    </Box>
                  </SafeTabPanel>
                </TabPanels>
              </Tabs>
            </Paper>
          </Grid>
          <Grid
            size={{
              md: 4,
              xs: 12,
            }}
          >
            <Details
              // If a selected disk is associated with a selected config, we
              // don't want it to appear in the Details component, since
              clearAll={clearAll}
              currentLinodeId={linodeId}
              errorMap={errorMap}
              handleCancel={handleCancel}
              handleClone={handleClone}
              handleSelectLinode={setSelectedLinodeId}
              handleToggleConfig={toggleConfig}
              handleToggleDisk={toggleDisk}
              isSubmitting={state.isSubmitting}
              selectedConfigs={attachAssociatedDisksToConfigs(
                selectedConfigs,
                disks
              )}
              // cloning the config takes precedence.
              selectedDisks={disksInState.filter((disk) => {
                return (
                  // This disk has been individually selected ...
                  // ... AND it's associated configs are NOT selected
                  state.diskSelection[disk.id].isSelected &&
                  (
                    state.diskSelection?.[disk.id]?.associatedConfigIds ?? []
                  ).filter((num) => selectedConfigIds.includes(num)).length ===
                    0
                );
              })}
              selectedLinodeId={state.selectedLinodeId}
              selectedLinodeRegion={selectedLinodeRegion}
              thisLinodeRegion={linode?.region ?? ''}
            />
          </Grid>
        </Grid>
      </Paper>
    </React.Fragment>
  );
};
