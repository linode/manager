import { compose, take } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from 'rxjs/Subscription';

import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { events$ } from 'src/events';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { getVolumes } from 'src/services/volumes';

import DashboardCard from '../DashboardCard';

type ClassNames =
  'root'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  labelCol: {
    width: '60%',
  },
  moreCol: {
    width: '30%',
  },
  actionsCol: {
    width: '10%',
  },
});

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  data?: Linode.Volume[];
  results?: number;
}

type CombinedProps = WithStyles<ClassNames>;

class VolumesDashboardCard extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
  };

  mounted: boolean = false;

  subscription: Subscription;

  requestData = (initial: boolean = false) => {
    if (!this.mounted) { return; }

    if (initial) {
      this.setState({ loading: true });
    }

    getVolumes({ page_size: 25 }, { '+order_by': 'label', '+order': 'asc' })
      .then(({ data, results }) => {
        if (!this.mounted) { return; }
        this.setState({
          loading: false,
          data: take(5, data),
          results,
        })
      })
      .catch((error) => {
        this.setState({ loading: false, errors: [{ reason: 'Unable to load Volumes.' }] })
      })
  }

  componentDidMount() {
    this.mounted = true;

    this.requestData(true);

    this.subscription = events$
      .filter(e => !e._initial)
      .filter(e => Boolean(e.entity && e.entity.type === 'volume'))
      .filter(e => Boolean(this.state.data && this.state.data.length < 5) || isFoundInData(e.entity!.id, this.state.data))
      .subscribe(() => this.requestData(false));
  }

  componentWillUnmount() {
    this.mounted = false;
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <DashboardCard title="Volumes" headerAction={this.renderAction} data-qa-dash-volume>
        <Paper>
          <Table>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
        </Paper>
      </DashboardCard>
    );
  }

  renderAction = () => this.state.results && this.state.results > 5
    ? <Link to={'/volumes'}>View All</Link>
    : null;

  renderContent = () => {
    const { loading, data, errors } = this.state;
    if (loading) {
      return this.renderLoading();
    }

    if (errors) {
      return this.renderErrors(errors);
    }

    if (data && data.length > 0) {
      return this.renderData(data);
    }

    return this.renderEmpty();
  }

  renderLoading = () => {
    return <TableRowLoading colSpan={3} />
  };

  renderErrors = (errors: Linode.ApiFieldError[]) =>
    <TableRowError colSpan={3} message={`Unable to load Volumes.`} />;

  renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  renderData = (data: Linode.Volume[]) => {
    const { classes } = this.props;

    return data.map(({ label, region, size, status }) => (
      <TableRow key={label} data-qa-volume={label}>
        <TableCell className={classes.labelCol}>
          <Grid container direction="column" spacing={8}>
            <Grid item className="py0">
              <Typography variant="subheading">
                {label}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="caption" data-qa-volume-status>
                {status}, {size} GB
              </Typography>
            </Grid>
          </Grid>
        </TableCell>
        <Hidden xsDown>
          <TableCell className={classes.moreCol} data-qa-volume-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </TableRow>
    ));
  };

}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(styled);

const isFoundInData = (id: number, data: Linode.Volume[] = []): boolean =>
  data.reduce((result, volume) => result || volume.id === id, false);

export default enhanced(VolumesDashboardCard);
