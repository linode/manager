import { Entity, Event } from 'linode-js-sdk/lib/account';
import { Linode, LinodeType } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { compose, path, pathOr, prop, sortBy, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
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
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import ViewAllLink from 'src/components/ViewAllLink';
import LinodeRowHeadCell from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRowHeadCell';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { ApplicationState } from 'src/store';
import {
  isEntityEvent,
  isInProgressEvent
} from 'src/store/events/event.helpers';
import { isEventRelevantToLinode } from 'src/store/events/event.selectors';
import { addNotificationsToLinodes } from 'src/store/linodes/linodes.helpers';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import { formatNotifications } from 'src/utilities/formatNotifications';
import DashboardCard from '../DashboardCard';

interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}

type ClassNames =
  | 'root'
  | 'linodeWrapper'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: 0
    },
    linodeWrapper: {
      display: 'inline-flex',
      width: 'auto'
    },
    labelCol: {
      width: '60%'
    },
    moreCol: {
      width: '30%'
    },
    actionsCol: {
      width: '10%'
    },
    wrapHeader: {
      whiteSpace: 'nowrap'
    }
  });

interface ConnectedProps {
  types: LinodeType[];
}

type CombinedProps = ConnectedProps &
  WithUpdatingLinodesProps &
  WithTypesProps &
  WithStyles<ClassNames>;

class LinodesDashboardCard extends React.Component<CombinedProps> {
  render() {
    const { classes } = this.props;
    return (
      <DashboardCard
        title="Linodes"
        headerAction={this.renderAction}
        className={classes.root}
        alignHeader="flex-start"
      >
        <Paper>
          <Table>
            <TableBody>{this.renderContent()}</TableBody>
          </Table>
        </Paper>
      </DashboardCard>
    );
  }

  renderAction = () => {
    return this.props.linodeCount > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/linodes'}
        count={this.props.linodeCount}
      />
    ) : null;
  };

  renderContent = () => {
    const { loading, linodes, error } = this.props;
    if (loading) {
      return this.renderLoading();
    }

    if (error) {
      return this.renderErrors(error);
    }

    if (linodes.length > 0) {
      return this.renderData(linodes);
    }

    return this.renderEmpty();
  };

  renderLoading = () => {
    return <TableRowLoading colSpan={3} />;
  };

  renderErrors = (errors: APIError[]) => {
    let errorText: string | JSX.Element = pathOr(
      'Unable to load Linodes.',
      [0, 'reason'],
      errors
    );

    if (
      typeof errorText === 'string' &&
      errorText.toLowerCase() === 'this linode has been suspended'
    ) {
      errorText = (
        <React.Fragment>
          One or more of your Linodes is suspended. Please{' '}
          <Link to="/support/tickets">open a support ticket </Link>
          if you have questions.
        </React.Fragment>
      );
    }

    return <TableRowError colSpan={3} message={errorText} />;
  };

  renderEmpty = () => <TableRowEmptyState colSpan={3} />;

  renderData = (data: ExtendedLinode[]) => {
    const { classes } = this.props;

    return data.map(linode => {
      const { id, label, region } = linode;
      return (
        <TableRow key={label} rowLink={`/linodes/${id}`} data-qa-linode>
          <LinodeRowHeadCell
            loading={false}
            recentEvent={linode.recentEvent}
            backups={linode.backups}
            id={linode.id}
            ipv4={linode.ipv4}
            ipv6={linode.ipv6 || ''}
            label={linode.label}
            region={linode.region}
            status={linode.status}
            displayStatus={linode.displayStatus || ''}
            tags={linode.tags}
            mostRecentBackup={linode.backups.last_successful}
            disk={linode.specs.disk}
            vcpus={linode.specs.vcpus}
            memory={linode.specs.memory}
            type={linode.type}
            image={linode.image}
            width={75}
            maintenance={linode.maintenance ? linode.maintenance.when : ''}
            isDashboard
          />
          <Hidden xsDown>
            <TableCell className={classes.moreCol} data-qa-linode-region>
              <RegionIndicator region={region} />
            </TableCell>
          </Hidden>
        </TableRow>
      );
    });
  };
}

const styled = withStyles(styles);

interface WithTypesProps {
  typesData: LinodeType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  typesData: state.__resources.types.entities
}));

type ExtendedLinode = {
  recentEvent: Event;
} & LinodeWithMaintenanceAndDisplayStatus;

interface WithUpdatingLinodesProps {
  linodes: ExtendedLinode[];
  linodeCount: number;
  loading: boolean;
  error?: APIError[];
}

const withUpdatingLinodes = connect((state: ApplicationState, ownProps: {}) => {
  const linodes = state.__resources.linodes.entities;
  const notifications = state.__resources.notifications.data || [];

  const linodesWithMaintenance = addNotificationsToLinodes(
    formatNotifications(notifications),
    linodes
  );

  return {
    linodes: compose(
      mergeEvents(state.events.events),
      take(5),
      sortBy(prop('label'))
    )(linodesWithMaintenance),
    linodeCount: state.__resources.linodes.entities.length,
    loading: state.__resources.linodes.loading,
    error: path(['read'], state.__resources.linodes.error)
  };
});

const mergeEvents = (events: Event[]) => (linodes: Linode[]) =>
  events.reduce((updatedLinodes, event) => {
    if (isWantedEvent(event)) {
      return updatedLinodes.map(linode =>
        isEventRelevantToLinode(event, linode.id)
          ? { ...linode, recentEvent: event }
          : linode
      );
    }

    return updatedLinodes;
  }, linodes);

const isWantedEvent = (e: Event): e is EntityEvent => {
  if (!isInProgressEvent(e)) {
    return false;
  }

  if (isEntityEvent(e)) {
    return e.entity.type === 'linode';
  }

  return false;
};

const enhanced = recompose<CombinedProps, {}>(
  withUpdatingLinodes,
  styled,
  withTypes
);

export default enhanced(LinodesDashboardCard) as React.ComponentType<{}>;
