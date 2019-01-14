import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import Notice from 'src/components/Notice';
import { reportException } from 'src/exceptionReporting';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { getInvoice, getInvoiceItems } from 'src/services/account';
import { async } from 'src/store/reducers/resources/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
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
  pdfGenerationError: boolean
}

type CombinedProps = RouteComponentProps<{ invoiceId: string }>
  & StateProps
  & WithStyles<ClassNames>;


class InvoiceDetail extends React.Component<CombinedProps, State> {
  state: State = {
    loading: false,
    pdfGenerationError: false
  };

  mounted: boolean = false;

  requestData = () => {
    const { match: { params: { invoiceId } }, data } = this.props;
    this.setState({ loading: true });

    if (!data) {
      this.props.requestAccount();
    }

    Promise.all([
      getInvoice(+invoiceId),
      getInvoiceItems(+invoiceId),
    ]).then(([invoice, { data: items }]) => {
      this.setState({
        loading: false,
        invoice,
        items,
      })
    })
      .catch((errorResponse) => {
        this.setState({
          errors: getAPIErrorOrDefault(errorResponse, 'Unable to retrieve invoice details. '),
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

  printInvoice(account: Linode.Account, invoice: Linode.Invoice, items: Linode.InvoiceItem[]) {
    this.setState({
      pdfGenerationError: false
    });
    try {
      printInvoice(account, invoice, items);
    } catch (e) {
      reportException(
        Error('Error while generating PDF.'),
        e
      );
      this.setState({
        pdfGenerationError: true
      });
    }
  }

  render() {
    const { classes, data } = this.props;
    const { invoice, loading, errors, items, pdfGenerationError } = this.state;

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
                {data && invoice && items && <Button type="primary" target="_blank" onClick={() => this.printInvoice(data, invoice, items)}>Download PDF</Button>}
              </Grid>
              <Grid item className={classes.titleWrapper}>
                {invoice && <Typography role="header" variant="h2" data-qa-total={invoice.total}>Total ${Number(invoice.total).toFixed(2)}</Typography>}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {pdfGenerationError && <Notice error={true} text="Failed generating PDF." />}
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

type S = ApplicationState['__resources']['account'];

interface StateProps extends S {
  requestAccount: () => void;
}

const connected = connect(
  (state: ApplicationState): S => state.__resources.account,
  (dispatch): { requestAccount: () => void; } => ({ requestAccount: () => dispatch(async.requestAccount()) }));


const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(connected, styled, withRouter);

export default enhanced(InvoiceDetail);
