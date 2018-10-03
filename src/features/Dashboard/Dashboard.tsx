import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';

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

type CombinedProps = WithStyles<ClassNames>;

class Dashboard extends React.Component<CombinedProps, {}> {

  render() {
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
          <BlogDashboardCard />
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(Dashboard);
