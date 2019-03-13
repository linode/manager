import * as React from 'react';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getEvents } from 'src/services/account';

import EventRow from './EventRow';

type ClassNames = 'root' | 'header';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  header: {
    paddingBottom: theme.spacing.unit * 2
  }
});

type CombinedProps = WithStyles<ClassNames> & PaginationProps<Linode.Event>;

export class EventsLanding extends React.PureComponent<CombinedProps> {
  componentDidMount() {
    this.props.request();
  }

  render() {
    const { classes, count, data, error, loading, page, pageSize } = this.props;

    return(
      <>
        <Typography variant="h2" className={classes.header}>Events</Typography>
        <Paper>
          <Table aria-label="List of Tickets">
            <TableHead>
              <TableRow>
                <TableCell style={{ padding: 0, width: 50 }}/>
                <TableCell
                  data-qa-events-subject-header
                  style={{ minWidth: 200 }}
                >
                  Event
                </TableCell>
                <TableCell data-qa-events-time-header>
                  Time
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderTableBody(loading, data, error)}
            </TableBody>
          </Table>
            <PaginationFooter
              count={count}
              page={page}
              pageSize={pageSize}
              handlePageChange={this.props.handlePageChange}
              handleSizeChange={this.props.handlePageSizeChange}
              eventCategory="ticket list"
              padded
            />
        </Paper>
      </>
    )
  }

}

const renderTableBody = (loading: boolean, events?: Linode.Event[], error?: Error) => {
  if (loading) {
    return <TableRowLoading colSpan={12} />;
  } else if (error) {
    return <TableRowError colSpan={12} message="There was an error retrieving the events on your account." />
  } else if (!events || events.length === 0) {
    return <TableRowEmptyState colSpan={12} message={"You don't have any events on your account."}/>
  } else {
    return events.map((thisEvent, idx) => <EventRow key={`event-list-item-${idx}`} event={thisEvent} />);
  }
}

const updatedRequest = (ownProps: CombinedProps, params: any, filters: any) => {
  return getEvents(params, filters).then(
    response => response.data
  );
};

const styled = withStyles(styles);
const paginated = Pagey(updatedRequest);

const enhanced = compose<CombinedProps, {}>(
  styled,
  paginated
)

export default enhanced(EventsLanding);