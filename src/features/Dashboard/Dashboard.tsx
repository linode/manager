
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TagImportDrawer from 'src/features/TagImport';
import { handleOpen } from 'src/store/reducers/backupDrawer';
import { openGroupDrawer } from 'src/store/reducers/tagImportDrawer';
import getEntitiesWithGroupsToImport, { GroupedEntitiesForImport } from 'src/store/selectors/getEntitiesWithGroupsToImport';
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

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
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
  }
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

const shouldDisplayGroupImportCTA = (groupedEntities: GroupedEntitiesForImport) => {
  const userHasDisabledCTA = storage.hideGroupImportCTA.get();
  return (
    !userHasDisabledCTA &&
    (groupedEntities.linodes.length >= 0 ||
    groupedEntities.domains.length >= 0)
  )
}

export const Dashboard: React.StatelessComponent<CombinedProps> = (props) => {
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
        <DocumentTitleSegment segment="Dashboard" />
        <Grid item xs={12}>
          <Typography variant="h1" data-qa-dashboard-header>Dashboard</Typography>
        </Grid>
        <Grid item xs={12} md={7}>
          <LinodesDashboardCard />
          <VolumesDashboardCard />
          <NodeBalancersDashboardCard />
          <DomainsDashboardCard />
        </Grid>
        <Grid item xs={12} md={5}>
          <TransferDashboardCard />
          {(!managed && !backupError) &&
            <BackupsDashboardCard
              accountBackups={accountBackups}
              linodesWithoutBackups={linodesWithoutBackups.length}
              openBackupDrawer={openBackupDrawer}
            />
          }
          {shouldDisplayGroupImportCTA(entitiesWithGroupsToImport) &&
            <ImportGroupsCard
              openImportDrawer={openImportDrawer}
              dismiss={storage.hideGroupImportCTA.set}
            />
          }
          <BlogDashboardCard />
        </Grid>
      </Grid>
      <TagImportDrawer />
    </React.Fragment>
  );
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  accountBackups: pathOr(false, ['__resources', 'accountSettings', 'data', 'backups_enabled'], state),
  linodesWithoutBackups: state.__resources.linodes.entities.filter(l => !l.backups.enabled),
  managed: pathOr(false, ['__resources', 'accountSettings', 'data', 'managed'], state),
  backupError: pathOr(false, ['backups', 'error'], state),
  entitiesWithGroupsToImport: getEntitiesWithGroupsToImport(state), // <-- Memoized selector
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      openBackupDrawer: () => dispatch(handleOpen()),
      openImportDrawer: () => dispatch(openGroupDrawer())
    }
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const styled = withStyles(styles);

const enhanced: any = compose(
  styled,
  connected,
)(Dashboard);

export default enhanced;
