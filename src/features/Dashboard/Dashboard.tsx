import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';

import BlogDashboardCard from 'src/features/Dashboard/BlogDashboardCard';
import DomainsDashboardCard from 'src/features/Dashboard/DomainsDashboardCard';
import LinodesDashboardCard from 'src/features/Dashboard/LinodesDashboardCard';
import NodeBalancersDashboardCard from 'src/features/Dashboard/NodeBalancersDashboardCard';
import TransferDashboardCard from 'src/features/Dashboard/TransferDashboardCard';
import VolumesDashboardCard from 'src/features/Dashboard/VolumesDashboardCard';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class Dashboard extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    return (
      <Grid container spacing={24}>
        <DocumentTitleSegment segment="Dashboard" />
        <Grid item xs={12}>
          <Typography variant="headline">Dashboard</Typography>
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
