import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import AbuseTicketBanner from 'src/components/AbuseTicketBanner';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TagImportDrawer from 'src/features/TagImport';
import { handleOpen } from 'src/store/backupDrawer';
import getEntitiesWithGroupsToImport, {
  emptyGroupedEntities,
  GroupedEntitiesForImport
} from 'src/store/selectors/getEntitiesWithGroupsToImport';
import { openGroupDrawer } from 'src/store/tagImportDrawer';
import { MapState } from 'src/store/types';
import shouldDisplayGroupImport from 'src/utilities/shouldDisplayGroupImportCTA';
import { storage } from 'src/utilities/storage';
import BackupsDashboardCard from './BackupsDashboardCard';
import BlogDashboardCard from './BlogDashboardCard';
import DomainsDashboardCard from './DomainsDashboardCard';
import ImportGroupsCard from './GroupImportCard';
import LinodesDashboardCard from './LinodesDashboardCard';
import NodeBalancersDashboardCard from './NodeBalancersDashboardCard';
import TransferDashboardCard from './TransferDashboardCard';
import VolumesDashboardCard from './VolumesDashboardCard';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface StateProps {
  accountBackups: boolean;
  linodesWithoutBackups: Linode.Linode[];
  managed: boolean;
  backupError?: Error;
  entitiesWithGroupsToImport: GroupedEntitiesForImport;
}

interface DispatchProps {
  actions: {
    openBackupDrawer: () => void;
    openImportDrawer: () => void;
  };
}

type CombinedProps = StateProps &
  DispatchProps &
  WithStyles<ClassNames> &
  WithTheme;

export const Dashboard: React.StatelessComponent<CombinedProps> = props => {
  const {
    accountBackups,
    actions: { openBackupDrawer, openImportDrawer },
    backupError,
    linodesWithoutBackups,
    managed,
    entitiesWithGroupsToImport
  } = props;

  return (
    <React.Fragment>
      <Grid container spacing={24}>
        <AbuseTicketBanner />
        <DocumentTitleSegment segment="Dashboard" />
        <Grid item xs={12}>
          <Typography variant="h1" data-qa-dashboard-header>
            Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} md={7}>
          <LinodesDashboardCard />
          <VolumesDashboardCard />
          <NodeBalancersDashboardCard />
          <DomainsDashboardCard />
        </Grid>
        <Grid item xs={12} md={5}>
          <TransferDashboardCard />
          {!managed && !backupError && (
            <BackupsDashboardCard
              accountBackups={accountBackups}
              linodesWithoutBackups={linodesWithoutBackups.length}
              openBackupDrawer={openBackupDrawer}
            />
          )}
          {!storage.hideGroupImportCTA.get() &&
            shouldDisplayGroupImport(entitiesWithGroupsToImport) && (
              <ImportGroupsCard
                theme={props.theme.name}
                openImportDrawer={openImportDrawer}
                dismiss={storage.hideGroupImportCTA.set}
              />
            )}
          <BlogDashboardCard />
        </Grid>
      </Grid>
      <TagImportDrawer />
    </React.Fragment>
  );
};

const mapStateToProps: MapState<StateProps, {}> = (state, ownProps) => ({
  accountBackups: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'backups_enabled'],
    state
  ),
  linodesWithoutBackups: state.__resources.linodes.entities.filter(
    l => !l.backups.enabled
  ),
  managed: pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'managed'],
    state
  ),
  backupError: pathOr(false, ['backups', 'error'], state),
  entitiesWithGroupsToImport:
    !storage.hideGroupImportCTA.get() && !storage.hasImportedGroups.get()
      ? getEntitiesWithGroupsToImport(state)
      : emptyGroupedEntities
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch,
  ownProps
) => {
  return {
    actions: {
      openBackupDrawer: () => dispatch(handleOpen()),
      openImportDrawer: () => dispatch(openGroupDrawer())
    }
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose<CombinedProps, {}>(
  styled,
  connected
)(Dashboard);

export default enhanced;
