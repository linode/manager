import { compose, prop, sortBy, take } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import LinodeRowHeadCell from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRowHeadCell';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import { isEntityEvent, isInProgressEvent } from 'src/store/events/event.helpers';
import DashboardCard from '../DashboardCard';

type ClassNames =
  'root'
  | 'linodeWrapper'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    marginTop: 0
  },
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
  wrapHeader: {
    whiteSpace: 'nowrap',
  },
});

interface ConnectedProps {
  types: Linode.LinodeType[]
}

type CombinedProps =
  ConnectedProps
  & WithUpdatingLinodesProps
  & WithTypesProps
  & WithStyles<ClassNames>;

class LinodesDashboardCard extends React.Component<CombinedProps> {

  render() {
    const { classes } = this.props;
    return (
      <DashboardCard title="Linodes" headerAction={this.renderAction} className={classes.root}>
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

  renderAction = () => this.props.linodes.length > 5
    ? <Link to={'/linodes'}>View All</Link>
    : null;

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
  }

  renderLoading = () => {
    return <TableRowLoading colSpan={3} />
  };

  renderErrors = (errors: Linode.ApiFieldError[]) =>
    <TableRowError colSpan={3} message={`Unable to load Linodes.`} />;

  renderEmpty = () => <TableRowEmptyState colSpan={3} />;

  renderData = (data: Linode.Linode[]) => {
    const { classes } = this.props;

    return data.map(linode => {
      const { id, label, region } = linode;
      return <TableRow key={label} rowLink={`/linodes/${id}`} data-qa-linode>
        <LinodeRowHeadCell
          loading={false}
          linode={linode}
        />
        <Hidden xsDown>
          <TableCell className={classes.moreCol} data-qa-linode-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </TableRow>
    });
  };

}

const styled = withStyles(styles);

interface WithTypesProps {
  typesData: Linode.LinodeType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  typesData: state.__resources.types.entities,
}));

interface WithUpdatingLinodesProps {
  linodes: Linode.Linode[]
  loading: boolean;
  error?: Linode.ApiFieldError[];
}

const withUpdatingLinodes = connect((state: ApplicationState, ownProps: {}) => {
  return {
    linodes: compose(
      mergeEvents(state.events.events),
      take(5),
      sortBy(prop('label')),
    )(state.__resources.linodes.entities),
    loading: state.__resources.linodes.loading,
    error: state.__resources.linodes.error,
  };
});

const mergeEvents = (events: Linode.Event[]) => (linodes: Linode.Linode[]) =>
  events
    .reduce((updatedLinodes, event) => {
      if (isWantedEvent(event)) {
        return updatedLinodes.map(linode => event.entity.id === linode.id
          ? { ...linode, recentEvent: event }
          : linode
        )
      }

      return updatedLinodes;
    }, linodes);

const isWantedEvent = (e: Linode.Event): e is Linode.EntityEvent => {

  if(!isInProgressEvent(e)){
    return false;
  }

  if (isEntityEvent(e)) {
    return e.entity.type === 'linode';
  }

  return false;
}

const enhanced = compose(withUpdatingLinodes, styled, withTypes);

export default enhanced(LinodesDashboardCard) as React.ComponentType<{}>;
