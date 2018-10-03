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
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import TableRow from 'src/components/TableRow';
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
  | 'linodeWrapper'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  linodeWrapper: {
    display: 'inline-flex',
    width: 'auto',
  },
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

type CombinedProps = ConnectedProps & TypesContext & WithStyles<ClassNames>;

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

    getLinodes({ page_size: 25 }, { '+order_by': 'label', '+order': 'asc' })
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
      <TableRow key={label} rowLink={`/linodes/${id}`} data-qa-linode>
        <TableCell className={classes.labelCol}>
          <Link to={`/linodes/${id}`} className="black nu">
            <Grid container wrap="nowrap" className={classes.linodeWrapper}>
              <Grid item>
                <LinodeStatusIndicator status={status} />
              </Grid>
              <Grid item>
                <Grid container direction="column" spacing={8}>
                  <Grid item className="py0">
                    <Typography variant="subheading">
                      {label}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" data-qa-linode-plan>
                      { typesData && displayType(type, typesData || []) }
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Link>
        </TableCell>
        <Hidden xsDown>
          <TableCell className={classes.moreCol} data-qa-linode-region>
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
