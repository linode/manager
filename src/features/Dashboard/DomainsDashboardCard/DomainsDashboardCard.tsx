import { compose, prop, sortBy, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
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
import { ApplicationState } from 'src/store';
import { openForEditing } from 'src/store/domainDrawer';

import {
  isEntityEvent,
  isInProgressEvent
} from 'src/store/events/event.helpers';
import DashboardCard from '../DashboardCard';
import ViewAllLink from '../ViewAllLink';

type ClassNames =
  | 'root'
  | 'labelGridWrapper'
  | 'description'
  | 'labelStatusWrapper'
  | 'labelCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  labelGridWrapper: {
    paddingLeft: `${theme.spacing.unit / 2}px !important`,
    paddingRight: `${theme.spacing.unit / 2}px !important`
  },
  description: {
    paddingTop: theme.spacing.unit / 2
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    wordBreak: 'break-all'
  },
  labelCol: {
    width: '90%'
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
  data?: Linode.Domain[];
  results?: number;
}

type CombinedProps = WithStyles<ClassNames> &
  WithUpdatingDomainsProps &
  DispatchProps;

class DomainsDashboardCard extends React.Component<CombinedProps, State> {
  render() {
    return (
      <DashboardCard title="Domains" headerAction={this.renderAction}>
        <Paper>
          <Table>
            <TableBody>{this.renderContent()}</TableBody>
          </Table>
        </Paper>
      </DashboardCard>
    );
  }

  handleRowClick(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: number,
    domain: string,
    type: string
  ) {
    if (type === 'slave') {
      e.preventDefault();
      this.props.openForEditing(domain, id);
    }
  }

  renderAction = () =>
    this.props.domainCount > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/domains'}
        count={this.props.domainCount}
      />
    ) : null;

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
  };

  renderLoading = () => {
    return <TableRowLoading colSpan={2} />;
  };

  renderErrors = (errors: Linode.ApiFieldError[]) => (
    <TableRowError colSpan={3} message={`Unable to load domains.`} />
  );

  renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  renderData = (data: Linode.Domain[]) => {
    const { classes } = this.props;

    return data.map(({ id, domain, type, status }) => (
      <TableRow key={domain} rowLink={`/domains/${id}/records`}>
        <TableCell className={classes.labelCol}>
          <Link
            onClick={e => this.handleRowClick(e, id, domain, type)}
            to={`/domains/${id}/records`}
            className={'black nu block'}
          >
            <Grid container wrap="nowrap" alignItems="center">
              <Grid item className="py0">
                <EntityIcon
                  variant="domain"
                  status={status}
                  marginTop={1}
                  loading={status === 'edit_mode'}
                />
              </Grid>
              <Grid item className={classes.labelGridWrapper}>
                <div className={classes.labelStatusWrapper}>
                  <Typography
                    variant="h3"
                    className={classes.wrapHeader}
                    data-qa-label
                  >
                    {domain}
                  </Typography>
                </div>
                <Typography className={classes.description}>{type}</Typography>
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
  domains: Linode.Domain[];
  domainCount: number;
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

const withUpdatingDomains = connect((state: ApplicationState, ownProps: {}) => {
  return {
    domains: compose(
      mergeEvents(state.events.events),
      take(5),
      sortBy(prop('domain'))
    )(state.__resources.domains.entities),
    loading: state.__resources.domains.loading,
    domainCount: state.__resources.domains.entities.length,
    error: state.__resources.domains.error
  };
});

const mergeEvents = (events: Linode.Event[]) => (domains: Linode.Domain[]) =>
  events.reduce((updatedDomains, event) => {
    if (isWantedEvent(event)) {
      return updatedDomains.map(domain =>
        event.entity.id === domain.id
          ? { ...domain, recentEvent: event }
          : domain
      );
    }

    return updatedDomains;
  }, domains);

const isWantedEvent = (e: Linode.Event): e is Linode.EntityEvent => {
  if (!isInProgressEvent(e)) {
    return false;
  }

  if (isEntityEvent(e)) {
    return e.entity.type === 'domain';
  }

  return false;
};

interface DispatchProps {
  openForEditing: (domain: string, id: number) => void;
}

const connected = connect(
  undefined,
  { openForEditing }
);

const enhanced = compose(
  connected,
  styled,
  withUpdatingDomains
);

export default enhanced(DomainsDashboardCard) as React.ComponentType<{}>;
