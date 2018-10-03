import { compose, take } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from 'rxjs/Subscription';

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
import { events$ } from 'src/events';
import { getDomains } from 'src/services/domains';

import DashboardCard from '../DashboardCard';

type ClassNames =
  'root'
  | 'labelCol'
  | 'actionsCol';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  labelCol: {
    width: '90%',
  },
  actionsCol: {
    width: '10%',
  },
});

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  data?: Linode.Domain[];
  results?: number;
}

type CombinedProps = WithStyles<ClassNames>;

class DomainsDashboardCard extends React.Component<CombinedProps, State> {
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

    /** Cant sort on created, because domains dones't have created... */
    // getDomains({ page_size: 25 }, { '+order_by': 'updated', '+order': 'desc' })
    getDomains({ page_size: 25 }, { '+order_by': 'domain', '+order': 'asc' })
      .then(({ data, results }) => {
        if (!this.mounted) { return; }
        this.setState({
          loading: false,
          data: take(5, data),
          results,
        })
      })
      .catch((error) => {
        this.setState({ loading: false, errors: [{ reason: 'Unable to load domains.' }] })
      })
  }

  componentDidMount() {
    this.mounted = true;

    this.requestData(true);

    this.subscription = events$
      .filter(e => !e._initial)
      .filter(e => Boolean(e.entity && e.entity.type === 'domain'))
      .filter(e => Boolean(this.state.data && this.state.data.length < 5) || isFoundInData(e.entity!.id, this.state.data))
      .subscribe(() => this.requestData(false));
  }

  componentWillUnmount() {
    this.mounted = false;
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <DashboardCard title="Domains" headerAction={this.renderAction}>
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
    ? <Link to={'/domains'}>View All</Link>
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
    return <TableRowLoading colSpan={2} />
  };

  renderErrors = (errors: Linode.ApiFieldError[]) =>
  <TableRowError colSpan={3} message={`Unable to load domains.`} />;

  renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  renderData = (data: Linode.Domain[]) => {
    const { classes } = this.props;

    return data.map(({ id, domain, type, status }) => (
      <TableRow key={domain} rowLink={`/domains/${id}/records`}>
        <TableCell className={classes.labelCol}>
          <Link to={`/domains/${id}/records`} className={'black nu block'}>
            <Grid container direction="column" spacing={8}>
              <Grid item className="py0">
                <Typography variant="subheading" data-qa-domain-name>
                  {domain}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="caption" data-qa-domain-status>
                  {status}, {type}
                </Typography>
              </Grid>
            </Grid>
            </Link>
          </TableCell>
        <TableCell className={classes.actionsCol} />
      </TableRow>
    ));
  };

}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(styled);

const isFoundInData = (id: number, data: Linode.Domain[] = []): boolean =>
  data.reduce((result, domain) => result || domain.id === id, false);

export default enhanced(DomainsDashboardCard);
