import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import * as moment from 'moment-timezone';
import { compose, map, pathOr, sort } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PaginationFooter from 'src/components/PaginationFooter';
import { getInvoices, getPayments } from 'src/services/account';

type BillingItem = Linode.Invoice | Linode.Payment;

interface InvoiceWithDate extends Linode.Invoice { displayDate: string, moment: moment.Moment };

interface PaymentWithDate extends Linode.Payment { displayDate: string, moment: moment.Moment };

type BillingItemWithDate = InvoiceWithDate | PaymentWithDate;

// const mockInvoices: Linode.Invoice[] = Array.from(Array(100)).map((_, idx) => ({
//   id: idx,
//   date: `2018-01-01T00:00:00.${idx}`,
//   label: `${idx}`,
//   total: idx.toFixed(2),
// }));

// const mockPayments: Linode.Payment[] = Array.from(Array(100)).map((_, idx) => ({
//   id: idx,
//   date: `2018-01-01T00:00:00.${idx}`,
//   usd: idx.toFixed(2),
// }));

// const getInvoices = (): Promise<Linode.Invoice[]> => Promise.resolve(mockInvoices);

// const getPayments = (): Promise<Linode.Payment[]> => Promise.resolve(mockPayments);

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface ConnectedProps {
  timezone: string;
}

interface State {
  invoices: {
    errors?: Linode.ApiFieldError[];
    loading: boolean;
    data?: BillingItemWithDate[],
    page: number;
    pages: number;
    results: number;
    perPage: number;
  },

  payments: {
    errors?: Linode.ApiFieldError[];
    loading: boolean;
    data?: BillingItemWithDate[],
    page: number;
    pages: number;
    results: number;
    perPage: number;
  },

}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

class RecentBillingActivityPanel extends React.Component<CombinedProps, State> {
  state: State = {
    invoices: {
      loading: true,
      page: 1,
      pages: 1,
      results: 1,
      perPage: 25,
    },
    payments: {
      loading: true,
      page: 1,
      pages: 1,
      results: 1,
      perPage: 25,
    },
  };

  mounted: boolean = false;

  addToItems: (incoming: BillingItem[]) => BillingItemWithDate[] =
    compose(

      /** Sort in descending/revers chronological order. */
      sort((a, b) => b.moment.diff(a.moment)),

      /**
       * Add the moment reference for sorting.
       * Add the displayDate now since we already have the reference.
       */
      map<BillingItem, BillingItemWithDate>((item) => {
        const m = moment(item.date);
        return {
          ...item,
          moment: m,
          displayDate: m.clone().tz(this.props.timezone).format('Y-DD-MM'),
        };
      }),
    );

  requestInvoices = (page: number = 1) => {
    this.setState({
      invoices: {
        ...this.state.invoices,
        loading: true,
        errors: undefined,
      },
    });

    return getInvoices({ page_size: this.state.invoices.perPage, page })
      .then(({ data, page, pages, results }) => {
        this.setState({
          invoices: {
            ...this.state.invoices,
            loading: false,
            page,
            pages,
            results,
            data: this.addToItems(data),
          },
        });
      })
      .catch((response) => {
        const fallbackError = [{ reason: 'Unable to retrieve invoices.' }];

        this.setState({
          invoices: {
            ...this.state.invoices,
            errors: pathOr(fallbackError, ['response', 'data', 'errors'], response),
          },
        })
      });
  }

  requestPayments = (page: number = 1) => {
    this.setState({
      payments: {
        ...this.state.payments,
        loading: true,
        errors: undefined,
      },
    });

    return getPayments({ page_size: this.state.payments.perPage, page })
      .then(({ data, page, pages, results }) => {
        this.setState({
          payments: {
            ...this.state.payments,
            loading: false,
            page,
            pages,
            results,
            data: this.addToItems(data),
          },
        });
      })
      .catch((response) => {
        const fallbackError = [{ reason: 'Unable to retrieve payments.' }];

        this.setState({
          payments: {
            ...this.state.payments,
            errors: pathOr(fallbackError, ['response', 'data', 'errors'], response),
          },
        })
      });
  }

  componentDidMount() {
    this.mounted = true;
    this.requestInvoices();
    this.requestPayments();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const {
      payments: {
        data: paymentsData,
        page: paymentsPage,
        results: paymentsResults,
        perPage: paymentsPerPage,
      },
      invoices: {
        data: invoicesData,
        page: invoicesPage,
        results: invoicesResults,
        perPage: invoicesPerPage,
      },
    } = this.state;

    return [
      <ExpansionPanel defaultExpanded heading="Recent Payments" key="payments">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Ammount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              paymentsData && paymentsData.length > 0
                ? this.renderItems(paymentsData)
                : this.renderEmptyState()
            }
          </TableBody>
        </Table>
        {paymentsData && paymentsData.length > 0 &&
          <PaginationFooter
            count={paymentsResults}
            page={paymentsPage}
            pageSize={paymentsPerPage}
            handlePageChange={this.handlePaymentsPageChange}
            handleSizeChange={this.updatePaymentsPerPage}
          />
        }
      </ExpansionPanel>,
      <ExpansionPanel defaultExpanded heading="Recent Invoices" key="invoices">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              invoicesData && invoicesData.length > 0
                ? this.renderItems(invoicesData)
                : this.renderEmptyState()
            }
          </TableBody>
        </Table>
        {invoicesData && invoicesData.length > 0 &&
          <PaginationFooter
            count={invoicesResults}
            page={invoicesPage}
            pageSize={invoicesPerPage}
            handlePageChange={this.handleInvoicesPageChange}
            handleSizeChange={this.updateInvoicesPerPage}
          />
        }
      </ExpansionPanel>
    ];
  }

  renderEmptyState = () => (
    <React.Fragment>
      <TableRow>
        <TableCell colSpan={3} style={{ textAlign: 'center' }}>No items to display.</TableCell>
      </TableRow>
    </React.Fragment>
  );

  renderItems = (items: BillingItemWithDate[]) => items.map(this.renderRow);

  renderRow = (item: BillingItemWithDate) => {
    if (isInvoice(item)) {
      return (
        <TableRow key={`invoice-${item.id}`}>
          <TableCell>{item.displayDate}</TableCell>
          <TableCell><Link to="">Invoice #{item.id}</Link></TableCell>
          <TableCell>${item.total}</TableCell>
        </TableRow>
      );
    }

    if (isPayment(item)) {
      return (
        <TableRow key={`payment-${item.id}`}>
          <TableCell>{item.displayDate}</TableCell>
          <TableCell><Link to="">Payment #{item.id}</Link></TableCell>
          <TableCell>${item.usd}</TableCell>
        </TableRow>
      );
    }

    return null;
  };

  handlePaymentsPageChange = (page: number) => this.requestPayments(page);

  updatePaymentsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState(
      { payments: { ...this.state.payments, perPage: +e.target.value } },
      () => { this.requestPayments() },
    );
  }


  handleInvoicesPageChange = (page: number) => this.requestInvoices(page);

  updateInvoicesPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState(
      { invoices: { ...this.state.invoices, perPage: +e.target.value } },
      () => { this.requestInvoices() },
    );
  }
}

const isInvoice = (item: BillingItemWithDate): item is InvoiceWithDate => {
  return Boolean((item as InvoiceWithDate).label) && Boolean((item as InvoiceWithDate).total)
}

const isPayment = (item: BillingItemWithDate): item is PaymentWithDate => {
  return Boolean((item as PaymentWithDate).usd);
}

const styled = withStyles(styles, { withTheme: true });

const connected = connect<ConnectedProps>((state: Linode.AppState) => ({
  timezone: pathOr('GMT', ['resources', 'profile', 'data', 'timezone'], state),
}));

const enhanced = compose(
  styled,
  connected,
);

export default enhanced(RecentBillingActivityPanel);

