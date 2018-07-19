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
  items: BillingItemWithDate[];
  errors?: Linode.ApiFieldError[];
  loading: boolean;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

class RecentBillingActivityPanel extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
    items: [],
  };

  mounted: boolean = false;

  addToItems: (incoming: BillingItem[]) => State['items'] =
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

  requestInvoices = (initial: boolean) =>
    getInvoices()
      .then(response => response.data)
      .catch((response) => {
        const fallbackError = [{ reason: 'Unable to retrieve invoices.' }];
        this.setState({
          errors: [...this.state.errors || [], pathOr(fallbackError, ['response', 'data', 'errors'], response)],
        })
      })

  requestPayments = (initial: boolean) =>
    getPayments()
      .then(response => response.data)
      .catch((response) => {
        const fallbackError = [{ reason: 'Unable to retrieve payments.' }];
        this.setState({
          errors: [...this.state.errors || [], pathOr(fallbackError, ['response', 'data', 'errors'], response)],
        })
      })

  requestBilling = (initial: boolean) => {
    this.setState({ loading: true, errors: undefined });
    Promise.all([
      this.requestInvoices(initial),
      this.requestPayments(initial),
    ])
      .then(([invoices, payments]) => {
        this.setState({
          items: this.addToItems([
            ...(invoices || []),
            ...(payments || []),
          ]),
          loading: false,
        });
      })
      .catch((response) => {
        this.setState({ loading: false });
      })
  }

  componentDidMount() {
    this.mounted = true;
    this.requestBilling(true);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { items } = this.state;

    return (
      <ExpansionPanel defaultExpanded heading="Recent Billing Activity">
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
              items.length === 0
                ? this.renderEmptyState()
                : this.renderItems(items)
            }
          </TableBody>
        </Table>
      </ExpansionPanel>
    );
  }

  renderEmptyState = () => (
    <React.Fragment>
      <TableRow>
        <TableCell colSpan={3} style={{ textAlign: 'center' }}>No billing history to display.</TableCell>
      </TableRow>
    </React.Fragment>
  );

  renderItems = (items: State['items']) => items.map(this.renderRow);

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
