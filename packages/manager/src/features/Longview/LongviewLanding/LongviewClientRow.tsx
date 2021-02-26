import { Grant } from '@linode/api-v4/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import withLongviewClients, {
  DispatchProps,
} from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps,
} from 'src/containers/longview.stats.container';
import withProfile from 'src/containers/profile.container';
import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import CPUGauge from './Gauges/CPU';
import LoadGauge from './Gauges/Load';
import NetworkGauge from './Gauges/Network';
import RAMGauge from './Gauges/RAM';
import StorageGauge from './Gauges/Storage';
import SwapGauge from './Gauges/Swap';
import ActionMenu, { ActionHandlers } from './LongviewActionMenu';
import LongviewClientHeader from './LongviewClientHeader';
import LongviewClientInstructions from './LongviewClientInstructions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      height: theme.spacing() === 220,
    },
  },
  gaugeContainer: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: 30,
    },
  },
}));

interface Props extends ActionHandlers {
  clientID: number;
  clientLabel: string;
  clientAPIKey: string;
  clientInstallKey: string;
  openPackageDrawer: () => void;
}

type CombinedProps = Props & LVDataProps & DispatchProps & GrantProps;

const LongviewClientRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    clientID,
    clientLabel,
    clientAPIKey,
    triggerDeleteLongviewClient,
    clientInstallKey,
    openPackageDrawer,
    updateLongviewClient,
    userCanModifyClient,
  } = props;

  const {
    lastUpdated,
    lastUpdatedError,
    authed,
  } = useClientLastUpdated(clientAPIKey, (_lastUpdated) =>
    props.getClientStats(clientAPIKey, _lastUpdated).catch((_) => null)
  );

  /**
   * We want to show a "waiting for data" state
   * until data has been returned.
   */
  if (!authed || lastUpdated === 0) {
    return (
      <LongviewClientInstructions
        clientID={clientID}
        clientLabel={clientLabel}
        clientAPIKey={clientAPIKey}
        installCode={clientInstallKey}
        triggerDeleteLongviewClient={triggerDeleteLongviewClient}
        updateLongviewClient={updateLongviewClient}
        userCanModifyClient={userCanModifyClient}
      />
    );
  }

  return (
    <Paper data-testid={clientID} className={classes.root}>
      <Grid
        container
        wrap="nowrap"
        justify="space-between"
        alignItems="flex-start"
        aria-label="List of Your Longview Clients"
        data-testid="longview-client-row"
      >
        <Grid item xs={11}>
          <Grid container>
            <Grid item xs={12} md={3}>
              <LongviewClientHeader
                clientID={clientID}
                clientLabel={clientLabel}
                lastUpdatedError={lastUpdatedError}
                openPackageDrawer={openPackageDrawer}
                updateLongviewClient={updateLongviewClient}
                longviewClientLastUpdated={lastUpdated}
                userCanModifyClient={userCanModifyClient}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container direction="row" alignItems="center">
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <CPUGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <RAMGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <SwapGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <LoadGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <NetworkGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
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
          <Grid container justify="flex-end">
            <Grid item>
              <ActionMenu
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
  withLongviewClients(() => ({})),
  withProfile<GrantProps, Props>((ownProps, { profileData }) => {
    const longviewPermissions = pathOr<Grant[]>(
      [],
      ['grants', 'longview'],
      profileData
    );

    const thisPermission = (longviewPermissions as Grant[]).find(
      (r) => r.id === ownProps.clientID
    );

    return {
      userCanModifyClient: thisPermission
        ? thisPermission.permissions === 'read_write'
        : true,
    };
  })
)(LongviewClientRow);
