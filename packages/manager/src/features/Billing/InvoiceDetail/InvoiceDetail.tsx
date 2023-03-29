import {
  Account,
  getInvoice,
  getInvoiceItems,
  Invoice,
  InvoiceItem,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import * as React from 'react';
import { CSVLink } from 'react-csv';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { useTheme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from 'src/components/IconButton';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import useFlags from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { getShouldUseAkamaiBilling } from '../billingUtils';
import InvoiceTable from './InvoiceTable';
import Box from '@mui/material/Box';

type CombinedProps = RouteComponentProps<{ invoiceId: string }>;

export const InvoiceDetail = (props: CombinedProps) => {
  const theme = useTheme();

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
    const taxes =
      flags[getShouldUseAkamaiBilling(invoice.date) ? 'taxes' : 'taxBanner'];
    const result = printInvoice(account, invoice, items, taxes);

    setPDFGenerationError(result.status === 'error' ? result.error : undefined);
  };

  const sxBox = {
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Paper
      sx={{
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
      }}
    >
      <Grid container rowGap={2}>
        <Grid xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ ...sxBox, flex: 1 }}>
              <Link to={`/account/billing`}>
                <IconButton
                  data-qa-back-to-billing
                  size="large"
                  sx={{
                    padding: 0,
                  }}
                >
                  <KeyboardArrowLeft
                    sx={{
                      width: 34,
                      height: 34,
                    }}
                  />
                </IconButton>
              </Link>
              {invoice && (
                <Typography
                  variant="h2"
                  data-qa-invoice-id
                  sx={{ paddingLeft: theme.spacing(1) }}
                >
                  Invoice #{invoice.id}
                </Typography>
              )}
            </Box>
            <Box sx={sxBox} data-qa-printable-invoice>
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
            </Box>
            <Box sx={{ ...sxBox, margin: theme.spacing() }}>
              {invoice && (
                <Typography variant="h2" data-qa-total={invoice.total}>
                  Total:{' '}
                  <Currency
                    wrapInParentheses={invoice.total < 0}
                    quantity={invoice.total}
                  />
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid xs={12}>
          {pdfGenerationError && <Notice error>Failed generating PDF.</Notice>}
          <InvoiceTable loading={loading} items={items} errors={errors} />
        </Grid>
        <Grid xs={12}>
          {invoice && (
            <Box
              sx={{
                alignItems: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(2),
                padding: theme.spacing(1),
              }}
            >
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
            </Box>
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
