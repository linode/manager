import { compose, take } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from 'rxjs/Subscription';

import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { withTypes } from 'src/context/types';
import { events$ } from 'src/events';
import LinodeStatusIndicator from 'src/features/linodes/LinodesLanding/LinodeStatusIndicator';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { displayType } from 'src/features/linodes/presentation';
import { getLinodes } from 'src/services/linodes';

import DashboardCard from '../DashboardCard';

type ClassNames =
  'root'
  | 'statusCol'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  statusCol: {
    width: '5%',
  },
  labelCol: {
    width: '42%',
  },
  moreCol: {
    width: '43%',
  },
  actionsCol: {
    width: '10%',
  },
});

interface Props { }

interface ConnectedProps {
  types: Linode.LinodeType[]
}

interface TypesContext {
  typesLoading: boolean;
  typesData?: Linode.LinodeType[];
}

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  data?: Linode.Linode[];
  results?: number;
}

type CombinedProps = Props & ConnectedProps & TypesContext & WithStyles<ClassNames>;

class LinodesDashboardCard extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
  };

  mounted: boolean = false;

  subscription: Subscription;

  requestLinodes = (initial: boolean = false) => {
    if (!this.mounted) { return; }

    if (initial) {
      this.setState({ loading: true });
    }

    getLinodes({ page_size: 25 }, { '+order_by': 'updated', '+order': 'desc' })
      .then(({ data, results }) => {
        if (!this.mounted) { return; }
        this.setState({
          loading: false,
          data: take(5, data),
          results,
        })
      })
      .catch((error) => {
        this.setState({ loading: false, errors: [{ reason: 'Unable to load Linodes.' }] })
      })
  }

  componentDidMount() {
    this.mounted = true;

    this.requestLinodes(true);

    this.subscription = events$
      .filter(e => !e._initial)
      .filter(e => Boolean(e.entity && e.entity.type === 'linode'))
      .filter(e => Boolean(this.state.data && this.state.data.length < 5) || isFoundInData(e.entity!.id, this.state.data))
      .subscribe(() => this.requestLinodes(false));
  }

  componentWillUnmount() {
    this.mounted = false;
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <DashboardCard title="Linodes" headerAction={this.renderAction}>
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
    ? <Link to={'/linodes'}>View All</Link>
    : null;

  renderContent = () => {
    const { loading, data, errors } = this.state;
    const { typesLoading } = this.props;
    if (loading || typesLoading) {
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
    <TableRowError colSpan={3} message={`Unable to load Linodes.`} />;

  renderEmpty = () => <TableRowEmptyState colSpan={3} />;

  renderData = (data: Linode.Linode[]) => {
    const { classes, typesData } = this.props;

    return data.map(({ id, label, region, status, type }) => (
      <TableRow key={label}>
        <TableCell className={classes.statusCol}>
          <LinodeStatusIndicator status={status} />
        </TableCell>
        <TableCell className={classes.labelCol}>
          <Typography variant="subheading">
            <Link to={`/linodes/${id}`}>{label}</Link>
          </Typography>
          <Typography>
            { typesData && displayType(type, typesData || []) }
          </Typography>
        </TableCell>
        <Hidden xsDown>
          <TableCell className={classes.moreCol}>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </TableRow>
    ));
  };

}

const styled = withStyles(styles, { withTheme: true });

const typesContext = withTypes((context) => ({
  typesLoading: context.loading,
  typesData: context.data,
}));

const enhanced = compose(styled, typesContext);

const isFoundInData = (id: number, data: Linode.Linode[] = []): boolean =>
  data.reduce((result, linode) => result || linode.id === id, false);

export default enhanced(LinodesDashboardCard);
