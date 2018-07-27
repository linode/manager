import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getInvoice, getInvoiceItems } from 'src/services/account';

type ClassNames = 'root' | 'backButton' | 'titleWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  titleWrapper: {
    display: 'flex',
    marginTop: 5,
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
});

interface Props { }

interface State {
  invoice?: Linode.Invoice;
  items?: Linode.InvoiceItem[];
  loading: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & RouteComponentProps<{ invoiceId: number }> & WithStyles<ClassNames>;

class InvoiceDetail extends React.Component<CombinedProps, State> {
  state: State = {
    loading: false,
  };

  mounted: boolean = false;

  requestData = () => {
    const { match: { params: { invoiceId } } } = this.props;
    this.setState({ loading: true });

    Promise.all([
      getInvoice(invoiceId),
      getInvoiceItems(invoiceId),
    ]).then(([invoice, { data: items }]) => {
      this.setState({
        loading: false,
        invoice,
        items,
      })
    })
      .catch((error) => {
        this.setState({
          errors: pathOr([{ reason: 'Unable to retrieve invoice details. ' }], ['response', 'data', 'errors'], error),
        })
      });
  };

  componentDidMount() {
    this.mounted = true;
    this.requestData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { classes } = this.props;
    const { invoice } = this.state;

    return (
      <Paper>
        <Grid container>
          <Grid item xs={12}>
            <Grid container justify="space-between">
              <Grid item className={classes.titleWrapper}>
                <Link to={`/billing`}>
                  <IconButton className={classes.backButton}>
                    <KeyboardArrowLeft />
                  </IconButton>
                </Link>
                {invoice && <Typography variant="title">Invoice #{invoice.id}</Typography>}
              </Grid>
              <Grid item className={classes.titleWrapper}>
                {invoice && <Typography variant="title">Total ${Number(invoice.total).toFixed(2)}</Typography>}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.renderContent()}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  renderLoading = () => {
    return (
      <TableRowLoading colSpan={6} />
    );
  };

  renderErrors = (errors: Linode.ApiFieldError[]) => {
    return (
      <TableRowError colSpan={6} message="Unable to retrieve invoice items." />
    );
  };

  renderEmpty = () => {
    return (
      <TableRowEmptyState colSpan={6} />
    );
  };

  renderDate = (v: null | string) => v ? <DateTimeDisplay value={v} format={`Y-MM-DD HH:mm:ss`} /> : null;

  renderUnitPrice = (v: null | number) => v ? `$${v}` : null;

  renderQuantity = (v: null | number) => v ? v : null;

  renderData = (items: Linode.InvoiceItem[]) => {
    return items.map(({ label, from, to, quantity, unit_price, amount }) => (
      <TableRow key={`${label}-${from}-${to}`}>
        <TableCell>{label}</TableCell>
        <TableCell>{this.renderDate(from)}</TableCell>
        <TableCell>{this.renderDate(to)}</TableCell>
        <TableCell>{this.renderQuantity(quantity)}</TableCell>
        <TableCell>{this.renderUnitPrice(unit_price)}</TableCell>
        <TableCell>${amount}</TableCell>
      </TableRow>
    ));
  };

  renderContent = () => {
    const { loading, errors, items } = this.state;

    if (loading) {
      return this.renderLoading();
    }

    if (errors) {
      return this.renderErrors(errors);
    }

    /** @todo Once pagination PR is merged I need to add pagination. */
    if (items && items.length > 0) {
      return this.renderData(items);
    }

    return this.renderEmpty();
  };
}

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose(styled, withRouter);

export default enhanced(InvoiceDetail);
