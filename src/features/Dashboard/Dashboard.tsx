
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { handleOpen, requestLinodesWithoutBackups } from 'src/store/reducers/backupDrawer';
import getEntitiesWithGroupsToImport, { GroupedEntitiesForImport } from 'src/store/selectors/getEntitiesWithGroupsToImport';
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
  }
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

export const Dashboard: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    accountBackups,
    actions: { openBackupDrawer },
    backupError,
    linodesWithoutBackups,
    managed,
    entitiesWithGroupsToImport
  } = props;

  const hasGroupsToImport =
    entitiesWithGroupsToImport.linodes.length > 1
    // @todo: Uncomment when domain support is added
    // && entitiesWithGroupsToImport.domains.length > 1

  return (
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
        {hasGroupsToImport &&
          <ImportGroupsCard
            domainsWithGroupsToImport={{'1234':  ['s']}}
            linodesWithGroupsToImport={{'1234':  ['s']}}
            // @todo: use reducer to open drawer
            openImportDrawer={() => console.log('change this')}
          />
        }
        <BlogDashboardCard />
      </Grid>
    </Grid>
  );
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  accountBackups: pathOr(false, ['__resources', 'accountSettings', 'data', 'backups_enabled'], state),
  linodesWithoutBackups: state.__resources.linodes.entities.filter(l => !l.backups.enabled),
  managed: pathOr(false, ['__resources', 'accountSettings', 'data', 'managed'], state),
  backupError: pathOr(false, ['backups', 'error'], state),
  entitiesWithGroupsToImport: getEntitiesWithGroupsToImport(state)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      openBackupDrawer: () => dispatch(handleOpen())
      // openImportDrawer; () => dispatch(handleOpenImportDrawer())
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
