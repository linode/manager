import { compose, pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getPayments } from 'src/services/account';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State extends PaginationProps {
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  data?: Linode.Payment[],
}

type CombinedProps = Props & WithStyles<ClassNames>;

class RecentPaymentsPanel extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    page: 1,
    count: 1,
    pageSize: 25,
  };

  mounted: boolean = false;

  requestPayments = (
    page: number = this.state.page,
    pageSize: number = this.state.pageSize,
    initial: boolean = false,
  ) => {
    if (!this.mounted) { return; }

    this.setState({ loading: initial });

    return getPayments({ page, page_size: pageSize })
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
        <TableCell><DateTimeDisplay value={item.date} /></TableCell>
        <TableCell>Payment #{item.id}</TableCell>
        <TableCell>${item.usd}</TableCell>
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
