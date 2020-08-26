import { Notification } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import H1Header from 'src/components/H1Header';
import MaintenanceBanner from 'src/components/MaintenanceBanner';
import PromotionalOfferCard from 'src/components/PromotionalOfferCard/PromotionalOfferCard';
import TaxBanner from 'src/components/TaxBanner';
import useFlags from 'src/hooks/useFlags';
import { handleOpen } from 'src/store/backupDrawer';
import { addNotificationsToLinodes } from 'src/store/linodes/linodes.helpers';
import { MapState } from 'src/store/types';
import BackupsDashboardCard from './BackupsDashboardCard';
import BlogDashboardCard from './BlogDashboardCard';
import DashboardCard from './DashboardCard';
import DomainsDashboardCard from './DomainsDashboardCard';
import LinodesDashboardCard from './LinodesDashboardCard';
import ManagedDashboardCard from './ManagedDashboardCard';
import NodeBalancersDashboardCard from './NodeBalancersDashboardCard';
import PromotionsBanner from './PromotionsBanner';
import TransferDashboardCard from './TransferDashboardCard';
import VolumesDashboardCard from './VolumesDashboardCard';
import getUserTimezone from 'src/utilities/getUserTimezone';

interface StateProps {
  accountBackups: boolean;
  linodesWithoutBackups: Linode[];
  managed: boolean;
  backupError?: Error;
  notifications: Notification[];
  userTimezone: string;
  userProfileLoading: boolean;
  userProfileError?: APIError[];
  someLinodesHaveScheduledMaintenance: boolean;
}

interface DispatchProps {
  actions: {
    openBackupDrawer: () => void;
  };
}

export type CombinedProps = StateProps &
  DispatchProps &
  RouteComponentProps<{}>;

export const Dashboard: React.FC<CombinedProps> = props => {
  const {
    accountBackups,
    actions: { openBackupDrawer },
    backupError,
    linodesWithoutBackups,
    managed,
    notifications,
    location
  } = props;

  const flags = useFlags();

  const dashboardPromos = (flags.promotionalOffers ?? []).filter(
    promo => promo.displayOnDashboard
  );

  return (
    <React.Fragment>
      {props.someLinodesHaveScheduledMaintenance && (
        <MaintenanceBanner
          userTimezone={props.userTimezone}
          userProfileError={props.userProfileError}
          userProfileLoading={props.userProfileLoading}
        />
      )}
      <Grid container spacing={3}>
        <AbuseTicketBanner />
        <TaxBanner location={location} marginBottom={8} />
        <DocumentTitleSegment segment="Dashboard" />
        <Grid item xs={12}>
          <H1Header title="Dashboard" data-qa-dashboard-header />
        </Grid>
        {managed && (
          <Grid item xs={12}>
            <ManagedDashboardCard />
          </Grid>
        )}
        <Grid item xs={12} md={7}>
          {flags.promos && (
            <PromotionsBanner
              notifications={notifications.filter(
                thisNotification => thisNotification.type === 'promotion'
              )}
            />
          )}
          <LinodesDashboardCard />
          <VolumesDashboardCard />
          <NodeBalancersDashboardCard />
          <DomainsDashboardCard />
        </Grid>
        <Grid item xs={12} md={5}>
          <TransferDashboardCard />

          {dashboardPromos.map(promotionalOffer => (
            <DashboardCard key={promotionalOffer.name}>
              <PromotionalOfferCard {...promotionalOffer} />
            </DashboardCard>
          ))}

          {!managed && !backupError && (
            <BackupsDashboardCard
              accountBackups={accountBackups}
              linodesWithoutBackups={linodesWithoutBackups.length}
              openBackupDrawer={openBackupDrawer}
            />
          )}
          <BlogDashboardCard />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const mapStateToProps: MapState<StateProps, {}> = state => {
  const linodes = Object.values(state.__resources.linodes.itemsById);
  const notifications = state.__resources.notifications.data || [];

  const linodesWithMaintenance = addNotificationsToLinodes(
    notifications,
    linodes
  );

  return {
    accountBackups: pathOr(
      false,
      ['__resources', 'accountSettings', 'data', 'backups_enabled'],
      state
    ),
    notifications: pathOr([], ['data'], state.__resources.notifications),
    userTimezone: getUserTimezone(state),
    userProfileLoading: state.__resources.profile.loading,
    userProfileError: path(['read'], state.__resources.profile.error),
    someLinodesHaveScheduledMaintenance: linodesWithMaintenance
      ? linodesWithMaintenance.some(eachLinode => !!eachLinode.maintenance)
      : false,
    linodesWithoutBackups: linodesWithMaintenance.filter(
      l => !l.backups.enabled
    ),
    managed: pathOr(
      false,
      ['__resources', 'accountSettings', 'data', 'managed'],
      state
    ),
    backupError: pathOr(false, ['backups', 'error'], state)
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => {
  return {
    actions: {
      openBackupDrawer: () => dispatch(handleOpen())
    }
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(connected)(Dashboard);

export default enhanced;
