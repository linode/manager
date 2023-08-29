import { Grant } from '@linode/api-v4/lib/account';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { compose } from 'recompose';

import { Grid } from 'src/components/Grid';
import { Paper } from 'src/components/Paper';
import withLongviewClients, {
  DispatchProps,
} from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import { useGrants } from 'src/queries/profile';

import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import { CPUGauge } from './Gauges/CPU';
import { LoadGauge } from './Gauges/Load';
import { NetworkGauge } from './Gauges/Network';
import { RAMGauge } from './Gauges/RAM';
import { StorageGauge } from './Gauges/Storage';
import { SwapGauge } from './Gauges/Swap';
import { LongviewActionMenu, ActionHandlers } from './LongviewActionMenu';
import LongviewClientHeader from './LongviewClientHeader';
import LongviewClientInstructions from './LongviewClientInstructions';

const useStyles = makeStyles()((theme: Theme) => ({
  gaugeContainer: {
    [theme.breakpoints.down('md')]: {
      marginBottom: 30,
    },
  },
  root: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      //height: false,
    },
  },
}));

interface Props extends ActionHandlers {
  clientAPIKey: string;
  clientID: number;
  clientInstallKey: string;
  clientLabel: string;
  openPackageDrawer: () => void;
}

type CombinedProps = Props & LVDataProps & DispatchProps & GrantProps;

const LongviewClientRow: React.FC<CombinedProps> = (props) => {
  const { classes } = useStyles();

  const {
    clientAPIKey,
    clientID,
    clientInstallKey,
    clientLabel,
    openPackageDrawer,
    triggerDeleteLongviewClient,
    updateLongviewClient,
  } = props;

  const {
    authed,
    lastUpdated,
    lastUpdatedError,
  } = useClientLastUpdated(clientAPIKey, (_lastUpdated) =>
    props.getClientStats(clientAPIKey, _lastUpdated).catch((_) => null)
  );

  const { data: grants } = useGrants();

  const longviewPermissions = grants?.longview || [];

  const thisPermission = (longviewPermissions as Grant[]).find(
    (r) => r.id === clientID
  );

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
    <Paper className={classes.root} data-testid={clientID}>
      <Grid
        alignItems="flex-start"
        aria-label="List of Your Longview Clients"
        container
        data-testid="longview-client-row"
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Grid item xs={11}>
          <Grid container>
            <Grid item md={3} xs={12}>
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
            <Grid item md={9} xs={12}>
              <Grid alignItems="center" container direction="row">
                <Grid className={classes.gaugeContainer} item sm={2} xs={4}>
                  <CPUGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid className={classes.gaugeContainer} item sm={2} xs={4}>
                  <RAMGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid className={classes.gaugeContainer} item sm={2} xs={4}>
                  <SwapGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid className={classes.gaugeContainer} item sm={2} xs={4}>
                  <LoadGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid className={classes.gaugeContainer} item sm={2} xs={4}>
                  <NetworkGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid className={classes.gaugeContainer} item sm={2} xs={4}>
                  <StorageGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <LongviewActionMenu
                longviewClientID={clientID}
                longviewClientLabel={clientLabel}
                triggerDeleteLongviewClient={triggerDeleteLongviewClient}
                userCanModifyClient={userCanModifyClient}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

interface GrantProps {
  userCanModifyClient: boolean;
}

export default compose<CombinedProps, Props>(
  React.memo,
  withClientStats<Props>((ownProps) => ownProps.clientID),
  /** We only need the update action here, easier than prop drilling through 4 components */
  withLongviewClients(() => ({}))
)(LongviewClientRow);
