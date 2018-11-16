import Typography from '@material-ui/core/Typography';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { handleOpen, requestLinodesWithoutBackups } from 'src/store/reducers/backupDrawer';
import BackupsDashboardCard from './BackupsDashboardCard';
import BlogDashboardCard from './BlogDashboardCard';
import DomainsDashboardCard from './DomainsDashboardCard';
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
}

interface DispatchProps {
  actions: {
    getLinodesWithoutBackups: () => void;
    openBackupDrawer: () => void;
  }
}

type CombinedProps = StateProps & DispatchProps & WithStyles<ClassNames>;

export class Dashboard extends React.Component<CombinedProps, {}> {

  render() {
    const {
      accountBackups,
      actions: { openBackupDrawer },
      backupError,
      linodesWithoutBackups,
      managed,
    } = this.props;
    return (
      <Grid container spacing={24}>
        <DocumentTitleSegment segment="Dashboard" />
        <Grid item xs={12}>
          <Typography variant="headline" data-qa-dashboard-header>Dashboard</Typography>
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
          <BlogDashboardCard />
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state, ownProps) => ({
  accountBackups: pathOr(false, ['__resources', 'accountSettings', 'data', 'backups_enabled'], state),
  linodesWithoutBackups: pathOr([],['backups', 'data'], state),
  managed: pathOr(false, ['__resources', 'accountSettings', 'data', 'managed'], state),
  backupError: pathOr(false, ['backups', 'error'], state),
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch, ownProps) => {
  return {
    actions: {
      getLinodesWithoutBackups: () => dispatch(requestLinodesWithoutBackups()),
      openBackupDrawer: () => dispatch(handleOpen())
    }
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

const enhanced: any = compose(
  styled,
  connected,
)(Dashboard);

export default enhanced;
