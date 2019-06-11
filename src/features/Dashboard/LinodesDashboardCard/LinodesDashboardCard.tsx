import { WithStyles } from '@material-ui/core/styles';
import { compose, path, pathOr, prop, sortBy, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { compose as recompose } from 'recompose'
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
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
import DashboardCard from '../DashboardCard';

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
  types: Linode.LinodeType[];
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

  renderErrors = (errors: Linode.ApiFieldError[]) => {
    let errorText = pathOr('Unable to load Linodes.', [0, 'reason'], errors);

    if (errorText.toLowerCase() === 'this linode has been suspended') {
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

  renderData = (data: Linode.Linode[]) => {
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
            ipv6={linode.ipv6}
            label={linode.label}
            region={linode.region}
            status={linode.status}
            tags={linode.tags}
            mostRecentBackup={linode.mostRecentBackup}
            disk={linode.specs.disk}
            vcpus={linode.specs.vcpus}
            memory={linode.specs.memory}
            type={linode.type}
            image={linode.image}
            width={70}
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
  typesData: Linode.LinodeType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  typesData: state.__resources.types.entities
}));

interface WithUpdatingLinodesProps {
  linodes: Linode.Linode[];
  linodeCount: number;
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

const withUpdatingLinodes = connect((state: ApplicationState, ownProps: {}) => {
  return {
    linodes: compose(
      mergeEvents(state.events.events),
      take(5),
      sortBy(prop('label'))
    )(state.__resources.linodes.entities),
    linodeCount: state.__resources.linodes.entities.length,
    loading: state.__resources.linodes.loading,
    error: path(['read'], state.__resources.linodes.error)
  };
});

const mergeEvents = (events: Linode.Event[]) => (linodes: Linode.Linode[]) =>
  events.reduce((updatedLinodes, event) => {
    if (isWantedEvent(event)) {
      return updatedLinodes.map(linode =>
        event.entity.id === linode.id
          ? { ...linode, recentEvent: event }
          : linode
      );
    }

    return updatedLinodes;
  }, linodes);

const isWantedEvent = (e: Linode.Event): e is Linode.EntityEvent => {
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
