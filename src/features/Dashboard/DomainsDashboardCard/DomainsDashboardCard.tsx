import { compose, prop, sortBy, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
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
import Grid from 'src/components/Grid';
import StatusIndicator, {
  getStatusForDomain
} from 'src/components/StatusIndicator';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ApplicationState } from 'src/store';
import {
  isEntityEvent,
  isInProgressEvent
} from 'src/store/events/event.helpers';
import DashboardCard from '../DashboardCard';

type ClassNames =
  | 'root'
  | 'icon'
  | 'labelGridWrapper'
  | 'description'
  | 'labelStatusWrapper'
  | 'statusOuter'
  | 'labelCol'
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
    paddingLeft: '4px !important',
    paddingRight: '4px !important'
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
  statusOuter: {
    top: 0,
    position: 'relative',
    marginLeft: 4,
    lineHeight: '0.8rem'
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

type CombinedProps = WithStyles<ClassNames> & WithUpdatingDomainsProps;

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

  renderAction = () =>
    this.props.domains.length > 5 ? (
      <Link to={'/domains'}>View All</Link>
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
          <Link to={`/domains/${id}/records`} className={'black nu block'}>
            <Grid container wrap="nowrap" alignItems="center">
              <Grid item className="py0">
                <DomainIcon className={classes.icon} />
              </Grid>
              <Grid item className={classes.labelGridWrapper}>
                <div className={classes.labelStatusWrapper}>
                  <Typography role="header" variant="h3" data-qa-label>
                    {domain}
                  </Typography>
                  <div className={classes.statusOuter}>
                    <StatusIndicator status={getStatusForDomain(status)} />
                  </div>
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

const enhanced = compose(
  styled,
  withUpdatingDomains
);

export default enhanced(DomainsDashboardCard) as React.ComponentType<{}>;
