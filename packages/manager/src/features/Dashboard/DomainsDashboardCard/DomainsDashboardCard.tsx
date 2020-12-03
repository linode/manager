import { Entity, Event } from '@linode/api-v4/lib/account';
import { Domain } from '@linode/api-v4/lib/domains';
import { APIError } from '@linode/api-v4/lib/types';
import { compose, prop, sortBy, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
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
import ViewAllLink from 'src/components/ViewAllLink';
import { REFRESH_INTERVAL } from 'src/constants';
import withDomains, {
  DomainActionsProps
} from 'src/containers/domains.container';
import withEvents, { EventsProps } from 'src/containers/events.container';
import { getDomainDisplayType } from 'src/features/Domains/domainUtils';
import { openForEditing } from 'src/store/domainDrawer';
import {
  isEntityEvent,
  isInProgressEvent
} from 'src/store/events/event.helpers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DashboardCard from '../DashboardCard';

interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}

type ClassNames =
  | 'root'
  | 'labelGridWrapper'
  | 'description'
  | 'labelStatusWrapper'
  | 'labelCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    labelGridWrapper: {
      paddingLeft: `${theme.spacing(1) / 2}px !important`,
      paddingRight: `${theme.spacing(1) / 2}px !important`
    },
    description: {
      paddingTop: theme.spacing(1) / 2
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

interface Props {
  domain: string;
  id: number;
  type: 'master' | 'slave';
  onEdit: (domain: string, id: number) => void;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithUpdatingDomainsProps &
  DomainActionsProps &
  DispatchProps;

const DomainsDashboardCard: React.FC<CombinedProps> = props => {
  React.useEffect(() => {
    if (Date.now() - props.lastUpdated > REFRESH_INTERVAL) {
      props.getDomainsPage({ page: 1, page_size: 25 });
    }
  }, []);

  const renderAction = () =>
    props.domainCount > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/domains'}
        count={props.domainCount}
      />
    ) : null;

  const renderLoading = () => {
    return <TableRowLoading colSpan={2} />;
  };

  const renderErrors = (errors: APIError[]) => (
    <TableRowError
      colSpan={3}
      message={
        getAPIErrorOrDefault(errors, `Unable to load Domains.`)[0].reason
      }
    />
  );

  const renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  const renderContent = () => {
    const { loading, domains, error } = props;
    if (loading && domains.length === 0) {
      return renderLoading();
    }

    if (error) {
      return renderErrors(error);
    }

    if (domains.length > 0) {
      return renderData(domains);
    }

    return renderEmpty();
  };

  const renderData = (data: Domain[]) => {
    const { classes } = props;

    return data.map(({ id, domain, type, status }) => (
      <TableRow
        key={domain}
        ariaLabel={`Domain ${domain}`}
        rowLink={`/domains/${id}`}
      >
        <TableCell className={classes.labelCol}>
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
                {type !== 'slave' ? (
                  <Link to={`/domains/${id}`} tabIndex={0}>
                    <Typography
                      variant="h3"
                      className={classes.wrapHeader}
                      data-qa-label
                    >
                      {domain}
                    </Typography>
                  </Link>
                ) : (
                  <Typography
                    variant="h3"
                    className={classes.wrapHeader}
                    data-qa-label
                  >
                    {domain}
                  </Typography>
                )}
              </div>
              <Typography className={classes.description}>
                {getDomainDisplayType(type)}
              </Typography>
            </Grid>
          </Grid>
        </TableCell>
        <TableCell className={classes.actionsCol} />
      </TableRow>
    ));
  };

  return (
    <DashboardCard
      title="Domains"
      headerAction={renderAction}
      alignHeader="flex-start"
    >
      <Paper>
        <Table>
          <TableBody>{renderContent()}</TableBody>
        </Table>
      </Paper>
    </DashboardCard>
  );
};

const styled = withStyles(styles);
interface WithUpdatingDomainsProps {
  domains: Domain[];
  domainCount: number;
  loading: boolean;
  lastUpdated: number;
  error?: APIError[];
}

const withUpdatingDomains = withDomains<WithUpdatingDomainsProps, EventsProps>(
  (
    ownProps,
    domainsData,
    domainsLoading,
    domainsError,
    domainsResults,
    domainLastUpdated
  ): WithUpdatingDomainsProps => {
    return {
      domains: compose(
        mergeEvents(ownProps.eventsData),
        take(5),
        sortBy(prop('domain'))
      )(domainsData),
      loading: domainsLoading,
      domainCount: domainsResults,
      error: domainsError.read,
      lastUpdated: domainLastUpdated
    };
  }
);

const mergeEvents = (events: Event[]) => (domains: Domain[]) =>
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

const isWantedEvent = (e: Event): e is EntityEvent => {
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

const connected = connect(undefined, { openForEditing });

const enhanced = recompose<CombinedProps, {}>(
  connected,
  withEvents(),
  withUpdatingDomains,
  styled
);

export default enhanced(DomainsDashboardCard) as React.ComponentType<{}>;
