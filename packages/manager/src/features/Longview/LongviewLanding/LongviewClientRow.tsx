import { useGrants } from '@linode/queries';
import { Paper } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import withLongviewClients from 'src/containers/longview.container';
import withClientStats from 'src/containers/longview.stats.container';

import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import { CPUGauge } from './Gauges/CPU';
import { LoadGauge } from './Gauges/Load';
import { NetworkGauge } from './Gauges/Network';
import { RAMGauge } from './Gauges/RAM';
import { StorageGauge } from './Gauges/Storage';
import { SwapGauge } from './Gauges/Swap';
import { LongviewActionMenu } from './LongviewActionMenu';
import { LongviewClientHeader } from './LongviewClientHeader';
import { LongviewClientInstructions } from './LongviewClientInstructions';

import type { ActionHandlers } from './LongviewActionMenu';
import type { DispatchProps } from 'src/containers/longview.container';
import type { Props as LVDataProps } from 'src/containers/longview.stats.container';

interface Props extends ActionHandlers {
  clientAPIKey: string;
  clientID: number;
  clientInstallKey: string;
  clientLabel: string;
  openPackageDrawer: () => void;
}

interface LongviewClientRowProps extends Props, LVDataProps, DispatchProps {}

const LongviewClientRow = (props: LongviewClientRowProps) => {
  const {
    clientAPIKey,
    clientID,
    clientInstallKey,
    clientLabel,
    openPackageDrawer,
    triggerDeleteLongviewClient,
    updateLongviewClient,
  } = props;

  const { authed, lastUpdated, lastUpdatedError } = useClientLastUpdated(
    clientAPIKey,
    (_lastUpdated) =>
      props.getClientStats(clientAPIKey, _lastUpdated).catch((_) => null)
  );

  const { data: grants } = useGrants();

  const longviewPermissions = grants?.longview || [];

  const thisPermission = longviewPermissions.find((r) => r.id === clientID);

  const userCanModifyClient = thisPermission
    ? thisPermission.permissions === 'read_write'
    : true;

  /**
   * We want to show a "waiting for data" state
   * until data has been returned.
   */
  if (!authed || lastUpdated === 0) {
    return (
      <LongviewClientInstructions
        clientAPIKey={clientAPIKey}
        clientID={clientID}
        clientLabel={clientLabel}
        installCode={clientInstallKey}
        triggerDeleteLongviewClient={triggerDeleteLongviewClient}
        updateLongviewClient={updateLongviewClient}
        userCanModifyClient={userCanModifyClient}
      />
    );
  }

  return (
    <Paper
      data-testid={clientID}
      sx={(theme) => {
        return {
          marginBottom: theme.spacing(4),
        };
      }}
    >
      <Grid
        alignItems="flex-start"
        aria-label="List of Your Longview Clients"
        container
        data-testid="longview-client-row"
        justifyContent="space-between"
        padding={1}
        spacing={2}
        wrap="nowrap"
      >
        <Grid container size={11}>
          <Grid
            container
            size={{
              md: 3,
              xs: 12,
            }}
          >
            <LongviewClientHeader
              clientID={clientID}
              clientLabel={clientLabel}
              lastUpdatedError={lastUpdatedError}
              longviewClientLastUpdated={lastUpdated}
              openPackageDrawer={openPackageDrawer}
              updateLongviewClient={updateLongviewClient}
              userCanModifyClient={userCanModifyClient}
            />
          </Grid>
          <Grid
            alignItems="center"
            container
            direction="row"
            mt={-4}
            size={{
              md: 9,
              xs: 12,
            }}
            spacing={2}
          >
            <Grid
              size={{
                sm: 2,
                xs: 4,
              }}
            >
              <CPUGauge
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
            </Grid>
            <Grid
              size={{
                sm: 2,
                xs: 4,
              }}
            >
              <RAMGauge
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
            </Grid>
            <Grid
              size={{
                sm: 2,
                xs: 4,
              }}
            >
              <SwapGauge
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
            </Grid>
            <Grid
              size={{
                sm: 2,
                xs: 4,
              }}
            >
              <LoadGauge
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
            </Grid>
            <Grid
              size={{
                sm: 2,
                xs: 4,
              }}
            >
              <NetworkGauge
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
            </Grid>
            <Grid
              size={{
                sm: 2,
                xs: 4,
              }}
            >
              <StorageGauge
                clientID={clientID}
                lastUpdatedError={lastUpdatedError}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container justifyContent="flex-end" size={1}>
          <LongviewActionMenu
            longviewClientID={clientID}
            longviewClientLabel={clientLabel}
            triggerDeleteLongviewClient={triggerDeleteLongviewClient}
            userCanModifyClient={userCanModifyClient}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(
  withClientStats<Props>((ownProps) => ownProps.clientID)(
    withLongviewClients(() => ({}))(LongviewClientRow)
  )
);
