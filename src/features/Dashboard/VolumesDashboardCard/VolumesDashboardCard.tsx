import { compose, take } from 'ramda';
import * as React from 'react';
import { Subscription } from 'rxjs/Subscription';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { events$ } from 'src/events';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { getVolumes } from 'src/services/volumes';
import DashboardCard from '../DashboardCard';
import ViewAllLink from '../ViewAllLink';

type ClassNames =
  | 'root'
  | 'icon'
  | 'labelGridWrapper'
  | 'description'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  icon: {
    position: 'relative',
    top: 3,
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT
    },
    '& .outerCircle': {
      stroke: theme.bg.main
    }
  },
  labelGridWrapper: {
    paddingLeft: `${theme.spacing.unit / 2}px !important`,
    paddingRight: `${theme.spacing.unit / 2}px !important`
  },
  description: {
    paddingTop: theme.spacing.unit / 2
  },
  labelCol: {
    width: '70%'
  },
  moreCol: {
    width: '30%'
  },
  actionsCol: {
    width: '10%'
  },
  wrapHeader: {
    wordBreak: 'break-all'
  }
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
    loading: true
  };

  mounted: boolean = false;

  subscription: Subscription;

  requestData = (initial: boolean = false) => {
    if (!this.mounted) {
      return;
    }

    if (initial) {
      this.setState({ loading: true });
    }

    getVolumes({ page_size: 25 }, { '+order_by': 'label', '+order': 'asc' })
      .then(({ data, results }) => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          loading: false,
          data: take(5, data),
          results
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          errors: [{ reason: 'Unable to load Volumes.' }]
        });
      });
  };

  componentDidMount() {
    this.mounted = true;

    this.requestData(true);

    this.subscription = events$
      .filter(e => !e._initial)
      .filter(e => Boolean(e.entity && e.entity.type === 'volume'))
      .filter(
        e =>
          Boolean(this.state.data && this.state.data.length < 5) ||
          isFoundInData(e.entity!.id, this.state.data)
      )
      .subscribe(() => this.requestData(false));
  }

  componentWillUnmount() {
    this.mounted = false;
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <DashboardCard
        title="Volumes"
        headerAction={this.renderAction}
        data-qa-dash-volume
      >
        <Paper>
          <Table>
            <TableBody>{this.renderContent()}</TableBody>
          </Table>
        </Paper>
      </DashboardCard>
    );
  }

  renderAction = () =>
    this.state.results && this.state.results > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/volumes'}
        count={this.state.results}
      />
    ) : null;

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
  };

  renderLoading = () => {
    return <TableRowLoading colSpan={3} />;
  };

  renderErrors = (errors: Linode.ApiFieldError[]) => (
    <TableRowError colSpan={3} message={`Unable to load Volumes.`} />
  );

  renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  renderData = (data: Linode.Volume[]) => {
    const { classes } = this.props;

    return data.map(({ label, region, size, status }) => (
      <TableRow key={label} data-qa-volume={label}>
        <TableCell className={classes.labelCol}>
          <Grid container wrap="nowrap" alignItems="center">
            <Grid item className="py0">
              <EntityIcon variant="volume" />
            </Grid>
            <Grid item className={classes.labelGridWrapper}>
              <Typography
                role="header"
                variant="h3"
                className={classes.wrapHeader}
                data-qa-label
              >
                {label}
              </Typography>
              <Typography className={classes.description}>
                {size} GiB
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

const styled = withStyles(styles);

const enhanced = compose(styled);

const isFoundInData = (id: number, data: Linode.Volume[] = []): boolean =>
  data.reduce((result, volume) => result || volume.id === id, false);

export default enhanced(VolumesDashboardCard) as React.ComponentType<{}>;
