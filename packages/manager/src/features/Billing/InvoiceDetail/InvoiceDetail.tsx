import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import {
  Account,
  getInvoice,
  getInvoiceItems,
  Invoice,
  InvoiceItem,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import createMailto from 'src/features/Footer/createMailto';
import useFlags from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import InvoiceTable from './InvoiceTable';
import { useAccount } from 'src/queries/account';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
  totals: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    '& h2': {
      margin: theme.spacing(1),
    },
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
  m2: {
    margin: theme.spacing(),
  },
}));

type CombinedProps = RouteComponentProps<{ invoiceId: string }>;

export const InvoiceDetail: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { data: account } = useAccount();

  const [invoice, setInvoice] = React.useState<Invoice | undefined>(undefined);
  const [items, setItems] = React.useState<InvoiceItem[] | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [pdfGenerationError, setPDFGenerationError] = React.useState<any>(
    undefined
  );

  const flags = useFlags();

  const requestData = () => {
    const {
      match: {
        params: { invoiceId },
      },
    } = props;
    setLoading(true);

    const getAllInvoiceItems = getAll<InvoiceItem>((params, filter) =>
      getInvoiceItems(+invoiceId, params, filter)
    );

    Promise.all([getInvoice(+invoiceId), getAllInvoiceItems()])
      .then(([invoice, { data: items }]) => {
        setLoading(false);
        setInvoice(invoice);
        setItems(items);
      })
      .catch((errorResponse) => {
        setLoading(false);
        setErrors(
          getAPIErrorOrDefault(
            errorResponse,
            'Unable to retrieve invoice details.'
          )
        );
      });
  };

  React.useEffect(() => {
    requestData();
  }, []);

  const printInvoicePDF = (
    account: Account,
    invoice: Invoice,
    items: InvoiceItem[]
  ) => {
    const taxBanner = flags.taxBanner;
    const result = printInvoice(account, invoice, items, taxBanner);

    setPDFGenerationError(result.status === 'error' ? result.error : undefined);
  };

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
              {account && invoice && items && (
                <Button
                  buttonType="primary"
                  onClick={() => printInvoicePDF(account, invoice, items)}
                >
                  Download PDF
                </Button>
              )}
            </Grid>
            <Grid item className={`${classes.titleWrapper} ${classes.m2}`}>
              {invoice && (
                <Typography variant="h2" data-qa-total={invoice.total}>
                  Total:{' '}
                  <Currency
                    wrapInParentheses={invoice.total < 0}
                    quantity={invoice.total}
                  />
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {pdfGenerationError && (
            <Notice error>
              Failed generating PDF.{' '}
              <Link to={createMailto(pdfGenerationError.stack)}>
                {' '}
                Send report
              </Link>
            </Notice>
          )}
          <InvoiceTable loading={loading} items={items} errors={errors} />
        </Grid>
        <Grid item xs={12}>
          {invoice && (
            <Grid container justify="flex-end">
              <Grid item className={classes.totals}>
                <Typography variant="h2">
                  Subtotal:{' '}
                  <Currency
                    wrapInParentheses={invoice.subtotal < 0}
                    quantity={invoice.subtotal}
                  />
                </Typography>
                <Typography variant="h2">
                  Tax: <Currency quantity={invoice.tax} />
                </Typography>
                <Typography variant="h2">
                  Total:{' '}
                  <Currency
                    wrapInParentheses={invoice.total < 0}
                    quantity={invoice.total}
                  />
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

const enhanced = compose<CombinedProps, {}>(withRouter);

export default enhanced(InvoiceDetail);
