import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getPayments } from 'src/services/account';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props extends PaginationProps<Linode.Payment> { }

type CombinedProps = Props & WithStyles<ClassNames>;

class RecentPaymentsPanel extends React.Component<CombinedProps, {}> {
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const {
      data,
      page,
      pageSize,
      count,
    } = this.props;

    return (
      <ExpansionPanel onChange={this.handleExpansion} heading="Recent Payments">
        <Table aria-label="List of Recent Payments">
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderContent()}
          </TableBody>
        </Table>
        {data && data.length > 0 &&
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={this.props.handlePageChange}
            handleSizeChange={this.props.handlePageSizeChange}
          />
        }
      </ExpansionPanel>
    );
  }

  renderContent = () => {
    const { data, error, loading } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={3} />
    }

    if (error) {
      return <TableRowError colSpan={4} message="We were unable to load your payments." />
    }

    return data && data.length > 0 ? this.renderItems(data) : <TableRowEmptyState colSpan={3} />
  };

  renderItems = (items: Linode.Payment[]) => items.map(this.renderRow);

  renderRow = (item: Linode.Payment) => {
    return (
      <TableRow key={`payment-${item.id}`}>
        <TableCell parentColumn="Date Created"><DateTimeDisplay value={item.date} /></TableCell>
        <TableCell parentColumn="Description">Payment #{item.id}</TableCell>
        <TableCell parentColumn="Amount">${item.usd}</TableCell>
      </TableRow>
    );
  };

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.props.data) {
      this.props.request();
    }
  }
}

const styled = withStyles(styles, { withTheme: true });

const updatedRequest = (ownProps: any, params: any) => getPayments(params, { '+order_by': 'date', '+order': 'desc' })
  .then((response) => response);

const paginated = paginate(updatedRequest);

const enhanced = compose(
  paginated,
  styled,
);

export default enhanced(RecentPaymentsPanel);
