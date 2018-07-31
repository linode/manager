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
import { getPayments } from 'src/services/account';

interface PaymentWithDate extends Linode.Payment { moment: moment.Moment };

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface State extends PaginationProps {
  errors?: Linode.ApiFieldError[];
  loading: boolean;
  data?: PaymentWithDate[],
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

  addToItems: (incoming: Linode.Payment[]) => PaymentWithDate[] =
    compose(

      /** Sort in descending/revers chronological order. */
      sort((a, b) => b.moment.diff(a.moment)),

      /**
       * Add the moment reference for sorting.
       * Add the displayDate now since we already have the reference.
       */
      map<Linode.Payment, PaymentWithDate>((item) => {
        const m = moment(item.date);
        return {
          ...item,
          moment: m,
        };
      }),
    );

  requestPayments = (page: number = 1) => {
    if (!this.mounted) { return; }

    this.setState({
      /** Only display loading if the data is undefined (initial state)   */
      loading: this.state.data === undefined,
      errors: undefined,
    });

    return getPayments({ page_size: this.state.pageSize, page })
      .then(({ data, page, pages, results }) => {
        if (!this.mounted) { return; }

        this.setState({
          loading: false,
          page,
          count: results,
          data: this.addToItems(data),
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
        <Table>
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

  renderItems = (items: PaymentWithDate[]) => items.map(this.renderRow);

  renderRow = (item: PaymentWithDate) => {
    return (
      <TableRow key={`payment-${item.id}`}>
        <TableCell><DateTimeDisplay value={item.date} /></TableCell>
        <TableCell><Link to="">Payment #{item.id}</Link></TableCell>
        <TableCell>${item.usd}</TableCell>
      </TableRow>
    );
  };

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.state.data) {
      this.requestPayments();
    }
  }

  handlePageChange = (page: number) => this.requestPayments(page);

  handlePageSizeChange = (pageSize: number) => {
    if (!this.mounted) { return; }

    this.setState(
      { pageSize },
      () => { this.requestPayments() },
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(
  styled,
);

export default enhanced(RecentPaymentsPanel);

