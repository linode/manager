import * as moment from 'moment-timezone';
import { compose, map, pathOr, sort } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

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
import { getInvoices } from 'src/services/account';

interface InvoiceWithDate extends Linode.Invoice { moment: moment.Moment };

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State extends PaginationProps {
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  data?: InvoiceWithDate[],
}

type CombinedProps = Props & WithStyles<ClassNames>;

class RecentInvoicesPanel extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    page: 1,
    count: 0,
    pageSize: 25,
  };

  mounted: boolean = false;

  addToItems: (incoming: Linode.Invoice[]) => InvoiceWithDate[] =
    compose(

      /** Sort in descending/revers chronological order. */
      sort((a, b) => b.moment.diff(a.moment)),

      /**
       * Add the moment reference for sorting.
       * Add the displayDate now since we already have the reference.
       */
      map<Linode.Invoice, InvoiceWithDate>((item) => {
        const m = moment(item.date);
        return {
          ...item,
          moment: m,
        };
      }),
    );

  requestInvoices = (
    page: number = this.state.page,
    pageSize: number = this.state.pageSize,
    initial: boolean = false,
  ) => {

    return getInvoices({ page, page_size: pageSize })
      .then(({ data, results }) => {
        if (!this.mounted) { return; }

        this.setState({ loading: initial });

        this.setState({
          loading: false,
          page,
          count: results,
          data: this.addToItems(data),
        });
      })
      .catch((response) => {
        if (!this.mounted) { return; }

        const fallbackError = [{ reason: 'Unable to retrieve invoices.' }];
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
      <ExpansionPanel
        heading="Recent Invoices"
        onChange={this.handleExpansion}
      >
        <Table>
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
      return <TableRowLoading colSpan={3} />
    }

    if (errors) {
      return <TableRowError colSpan={3} message="We were unable to load your invoices." />
    }

    return data && data.length > 0 ? this.renderItems(data) : <TableRowEmptyState colSpan={3} />
  };

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.state.data) {
      this.requestInvoices(undefined, undefined, true);
    }
  };

  renderItems = (items: InvoiceWithDate[]) => items.map(this.renderRow);

  renderRow = (item: InvoiceWithDate) => {
    return (
      <TableRow key={`invoice-${item.id}`}>
        <TableCell><DateTimeDisplay value={item.date}/></TableCell>
        <TableCell><Link to={`billing/invoices/${item.id}`}>Invoice #{item.id}</Link></TableCell>
        <TableCell>${item.total}</TableCell>
      </TableRow>
    );
  };

  handlePageChange = (page: number) => {
    this.setState({ page}, () => this.requestInvoices() )
  };

  handlePageSizeChange = (pageSize: number) => {
    this.setState({ pageSize }, () => this.requestInvoices() )
  }
}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(
  styled,
);

export default enhanced(RecentInvoicesPanel);

