import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import { pathOr } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import { getInvoice, getInvoiceItems } from 'src/services/account';
import InvoiceTable from './InvoiceTable';

type ClassNames = 'root' | 'backButton' | 'titleWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
});

interface State {
  invoice?: Linode.Invoice;
  items?: Linode.InvoiceItem[];
  loading: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = RouteComponentProps<{ invoiceId: number }> & WithStyles<ClassNames>;

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

  pressPrint = (e:any) => {
    const { invoice } = this.state;
    const evtobj = window.event? event : e;
    if (evtobj.keyCode === 80 && (evtobj.ctrlKey || evtobj.metaKey)) {
      e.preventDefault();
      return (
        invoice && window.open(`/account/billing/invoices/${invoice.id}/print`, "_blank")
      )
    }
    return false;
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
    const { invoice, loading, errors, items } = this.state;

    document.addEventListener('keydown', this.pressPrint);

    return (
      <Paper className={classes.root}>
        <Grid container>
          <Grid item xs={12}>
            <Grid container justify="space-between">
              <Grid item className={classes.titleWrapper} style={{ flex: 1 }}>
                <Link to={`/account/billing`}>
                  <IconButton className={classes.backButton} data-qa-back-to-billing>
                    <KeyboardArrowLeft />
                  </IconButton>
                </Link>
                {invoice && <Typography role="header" variant="h2" data-qa-invoice-id>Invoice #{invoice.id}</Typography>}
              </Grid>
              <Grid item className={classes.titleWrapper} data-qa-printable-invoice>
                {invoice && <Button type="primary" target="_blank" href={`/account/billing/invoices/${invoice.id}/print`}>Download / Print</Button>}
              </Grid>
              <Grid item className={classes.titleWrapper}>
                {invoice && <Typography role="header" variant="h2" data-qa-total={invoice.total}>Total ${Number(invoice.total).toFixed(2)}</Typography>}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <InvoiceTable loading={loading} items={items} errors={errors} />
          </Grid>
          <Grid item xs={12}>
            <Grid container justify="flex-end">
              <Grid item className={classes.titleWrapper}>
                {invoice && <Typography role="header" variant="h2">Total ${Number(invoice.total).toFixed(2)}</Typography>}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(styled, withRouter);

export default enhanced(InvoiceDetail);
