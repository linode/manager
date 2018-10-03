import { compose, pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
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

interface State extends PaginationProps {
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  data?: Linode.Payment[],
}

type CombinedProps = WithStyles<ClassNames>;

class RecentPaymentsPanel extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    page: 1,
    count: 1,
    pageSize: 25,
  };

  mounted: boolean = false;

  requestPayments = (
    whichPage: number = this.state.page,
    pageSize: number = this.state.pageSize,
    initial: boolean = false,
  ) => {
    if (!this.mounted) { return; }

    this.setState({ loading: initial });

    return getPayments({ page: whichPage, page_size: pageSize })
      .then(({ data, page, results }) => {
        if (!this.mounted) { return; }

        this.setState({
          loading: false,
          page,
          count: results,
          data,
        });
      })
      .catch((response) => {
        if (!this.mounted) { return; }

        const fallbackError = [{ reason: 'Unable to retrieve payments.' }];
        this.setState({
          errors: pathOr(fallbackError, ['response', 'data', 'errors'], response),
        })
      });
  }

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
    } = this.state;

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
            handlePageChange={this.handlePageChange}
            handleSizeChange={this.handlePageSizeChange}
          />
        }
      </ExpansionPanel>
    );
  }

  renderContent = () => {
    const { data, errors, loading } = this.state;

    if (loading) {
      return <TableRowLoading colSpan={3} />
    }

    if (errors) {
      return <TableRowError colSpan={3} message="We were unable to load your payments." />
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
    if (expanded && !this.state.data) {
      this.requestPayments();
    }
  }

  handlePageChange = (page: number) => {
    this.setState({ page }, () => this.requestPayments())
  };

  handlePageSizeChange = (pageSize: number) => {
    this.setState({ pageSize, page: 1 }, () => this.requestPayments())
  }
}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(styled);

export default enhanced(RecentPaymentsPanel);
