import {
  Account,
  getInvoice,
  getInvoiceItems,
  Invoice,
  InvoiceItem,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import * as React from 'react';
import { CSVLink } from 'react-csv';
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
import useFlags from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import InvoiceTable from './InvoiceTable';

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

  const csvRef = React.useRef<any>();

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
          <Grid container justifyContent="space-between">
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
                <>
                  {/* Hidden CSVLink component controlled by a ref.
                  This is done so we can use Button styles.  */}
                  <CSVLink
                    ref={csvRef}
                    filename={`invoice-${invoice.date}.csv`}
                    headers={csvHeaders}
                    data={items}
                  />
                  <Button
                    buttonType="secondary"
                    onClick={() => csvRef.current.link.click()}
                    style={{ marginRight: 8 }}
                  >
                    Download CSV
                  </Button>
                  <Button
                    buttonType="secondary"
                    onClick={() => printInvoicePDF(account, invoice, items)}
                  >
                    Download PDF
                  </Button>
                </>
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
          {pdfGenerationError && <Notice error>Failed generating PDF.</Notice>}
          <InvoiceTable loading={loading} items={items} errors={errors} />
        </Grid>
        <Grid item xs={12}>
          {invoice && (
            <Grid container justifyContent="flex-end">
              <Grid item className={classes.totals}>
                <Typography variant="h2">
                  Subtotal:{' '}
                  <Currency
                    wrapInParentheses={invoice.subtotal < 0}
                    quantity={invoice.subtotal}
                  />
                </Typography>
                {invoice.tax_summary.map((summary) => {
                  return (
                    <Typography key={summary.name} variant="h2">
                      {summary.name === 'Standard'
                        ? 'Standard Tax: '
                        : `${summary.name}: `}
                      <Currency quantity={summary.tax} />
                    </Typography>
                  );
                })}
                <Typography variant="h2">
                  Tax Subtotal: <Currency quantity={invoice.tax} />
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

const csvHeaders = [
  { label: 'Description', key: 'label' },
  { label: 'From', key: 'from' },
  { label: 'To', key: 'to' },
  { label: 'Quantity', key: 'quantity' },
  { label: 'Unit Price', key: 'unit_price' },
  { label: 'Amount (USD)', key: 'amount' },
  { label: 'Tax (USD)', key: 'tax' },
  { label: 'Total (USD)', key: 'total' },
];
