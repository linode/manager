import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getInvoices } from 'src/services/account';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface State extends PaginationProps {
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  data?: Linode.Invoice[],
}

type CombinedProps = WithStyles<ClassNames>;

class RecentInvoicesPanel extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    page: 1,
    count: 0,
    pageSize: 25,
  };

  mounted: boolean = false;

  requestInvoices = (
    page: number = this.state.page,
    pageSize: number = this.state.pageSize,
  ) => {

    return getInvoices({ page, page_size: pageSize }, { '+order_by': 'date', '+order': 'desc' })
      .then(({ data, results }) => {
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

        const fallbackError = [{ reason: 'Unable to retrieve invoices.' }];
        this.setState({
          loading: false,
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
      <ExpansionPanel
        heading="Recent Invoices"
        onChange={this.handleExpansion}
      >
        <Table aria-label="List of Recent Invoices">
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { this.renderContent() }
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
      return <TableRowLoading colSpan={4} />
    }

    if (errors) {
      return <TableRowError colSpan={4} message="We were unable to load your invoices." />
    }

    return data && data.length > 0 ? this.renderItems(data) : <TableRowEmptyState colSpan={3} />
  };

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.state.data) {
      this.setState({ loading: true });
      this.requestInvoices(undefined, undefined);
    }
  };

  renderItems = (items: Linode.Invoice[]) => items.map(this.renderRow);

  renderRow = (item: Linode.Invoice) => {
    return (
      <TableRow key={`invoice-${item.id}`} rowLink={`billing/invoices/${item.id}`}>
        <TableCell parentColumn="Date Created"><DateTimeDisplay value={item.date}/></TableCell>
        <TableCell parentColumn="Description"><Link to={`billing/invoices/${item.id}`}>Invoice #{item.id}</Link></TableCell>
        <TableCell parentColumn="Amount">${item.total}</TableCell>
      </TableRow>
    );
  };

  handlePageChange = (page: number) => {
    this.setState({ page}, () => this.requestInvoices() )
  };

  handlePageSizeChange = (pageSize: number) => {
    this.setState({ pageSize, page: 1 }, () => this.requestInvoices() )
  }
}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(
  styled,
);

export default enhanced(RecentInvoicesPanel);
