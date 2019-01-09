import { compose, prop, sortBy, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { isEntityEvent, isInProgressEvent } from 'src/store/events/events.reducer';
import DashboardCard from '../DashboardCard';

type ClassNames =
  'root'
  | 'labelCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  labelCol: {
    width: '90%',
  },
  actionsCol: {
    width: '10%',
  },
  wrapHeader: {
    wordBreak: 'break-all',
  }
});

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  data?: Linode.Domain[];
  results?: number;
}

type CombinedProps = WithStyles<ClassNames> & WithUpdatingDomainsProps

class DomainsDashboardCard extends React.Component<CombinedProps, State> {

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

  renderAction = () => this.props.domains.length > 5
    ? <Link to={'/domains'}>View All</Link>
    : null;

  renderContent = () => {
    const { loading, domains, error } = this.props;
    if (loading) {
      return this.renderLoading();
    }

    if (error) {
      return this.renderErrors(error);
    }

    if (domains.length > 0) {
      return this.renderData(domains);
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
              <Grid item style={{ paddingBottom: 0 }}>
                <Typography className={classes.wrapHeader} variant="h3" data-qa-domain-name>
                  {domain}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body1" data-qa-domain-status>
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

const styled = withStyles(styles);
interface WithUpdatingDomainsProps {
  domains: Linode.Domain[]
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

const withUpdatingDomains = connect((state: ApplicationState, ownProps: {}) => {
  return {
    domains: compose(
      mergeEvents(state.events.events),
      take(5),
      sortBy(prop('domain')),
    )(state.__resources.domains.entities),
    loading: state.__resources.domains.loading,
    error: state.__resources.domains.error,
  };
});

const mergeEvents = (events: Linode.Event[]) => (domains: Linode.Domain[]) =>
  events
    .reduce((updatedDomains, event) => {
      if (isWantedEvent(event)) {
        return updatedDomains.map(domain => event.entity.id === domain.id
          ? { ...domain, recentEvent: event }
          : domain
        )
      }

      return updatedDomains;
    }, domains);

const isWantedEvent = (e: Linode.Event): e is Linode.EntityEvent => {

  if(!isInProgressEvent(e)){
    return false;
  }

  if (isEntityEvent(e)) {
    return e.entity.type === 'domain';
  }

  return false;
}

const enhanced = compose(
  styled,
  withUpdatingDomains
);

export default enhanced(DomainsDashboardCard) as React.ComponentType<{}>;
