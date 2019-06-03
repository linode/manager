import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import Notice from 'src/components/Notice';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import createMailto from 'src/features/Footer/createMailto';
import { getInvoice, getInvoiceItems } from 'src/services/account';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
import { ThunkDispatch } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import InvoiceTable from './InvoiceTable';

type ClassNames = 'root' | 'backButton' | 'titleWrapper' | 'totals';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`
  },
  totals: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    '& h2': {
      margin: theme.spacing(1)
    }
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34
    }
  }
});

interface State {
  invoice?: Linode.Invoice;
  items?: Linode.InvoiceItem[];
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  pdfGenerationError?: any;
}

type CombinedProps = RouteComponentProps<{ invoiceId: string }> &
  StateProps &
  WithStyles<ClassNames>;

class InvoiceDetail extends React.Component<CombinedProps, State> {
  state: State = {
    loading: false,
    pdfGenerationError: undefined
  };

  mounted: boolean = false;

  requestData = () => {
    const {
      match: {
        params: { invoiceId }
      },
      data
    } = this.props;
    this.setState({ loading: true });

    if (!data) {
      this.props.requestAccount();
    }

    const getAllInvoiceItems = getAll<Linode.InvoiceItem>((params, filter) =>
      getInvoiceItems(+invoiceId, params, filter)
    );

    Promise.all([getInvoice(+invoiceId), getAllInvoiceItems()])
      .then(([invoice, { data: items }]) => {
        this.setState({
          loading: false,
          invoice,
          items
        });
      })
      .catch(errorResponse => {
        this.setState({
          errors: getAPIErrorOrDefault(
            errorResponse,
            'Unable to retrieve invoice details. '
          )
        });
      });
  };

  componentDidMount() {
    this.mounted = true;
    this.requestData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  printInvoice(
    account: Linode.Account,
    invoice: Linode.Invoice,
    items: Linode.InvoiceItem[]
  ) {
    const result = printInvoice(account, invoice, items);
    this.setState({
      pdfGenerationError: result.status === 'error' ? result.error : undefined
    });
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
                  <IconButton
                    className={classes.backButton}
                    data-qa-back-to-billing
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                </Link>
                {invoice && (
                  <Typography variant="h2" data-qa-invoice-id>
                    Invoice #{invoice.id}
                  </Typography>
                )}
              </Grid>
              <Grid
                item
                className={classes.titleWrapper}
                data-qa-printable-invoice
              >
                {data && invoice && items && (
                  <Button
                    type="primary"
                    target="_blank"
                    onClick={() => this.printInvoice(data, invoice, items)}
                  >
                    Download PDF
                  </Button>
                )}
              </Grid>
              <Grid item className={classes.titleWrapper}>
                {invoice && (
                  <Typography variant="h2" data-qa-total={invoice.total}>
                    Total: ${Number(invoice.total).toFixed(2)}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {pdfGenerationError && (
              <Notice
                error={true}
                html={`Failed generating PDF. <a href="${createMailto(
                  pdfGenerationError.stack
                )}"
            > Send report</a>`}
              />
            )}
            <InvoiceTable loading={loading} items={items} errors={errors} />
          </Grid>
          <Grid item xs={12}>
            {invoice && (
              <Grid container justify="flex-end">
                <Grid item className={classes.totals}>
                  <Typography variant="h2">
                    Subtotal: ${Number(invoice.subtotal).toFixed(2)}
                  </Typography>
                  <Typography variant="h2">
                    Tax: ${Number(invoice.tax).toFixed(2)}
                  </Typography>
                  <Typography variant="h2">
                    Total: ${Number(invoice.total).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            )}
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
  (dispatch: ThunkDispatch): { requestAccount: () => void } => ({
    requestAccount: () => dispatch(requestAccount())
  })
);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  connected,
  styled,
  withRouter
);

export default enhanced(InvoiceDetail);
