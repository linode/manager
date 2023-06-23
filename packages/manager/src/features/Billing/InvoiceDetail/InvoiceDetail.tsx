import {
  Account,
  getInvoice,
  getInvoiceItems,
  Invoice,
  InvoiceItem,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { Currency } from 'src/components/Currency';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { IconButton } from 'src/components/IconButton';
import Link from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import useFlags from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { getShouldUseAkamaiBilling } from '../billingUtils';
import InvoiceTable from './InvoiceTable';

export const InvoiceDetail = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const theme = useTheme();

  const csvRef = React.useRef<any>();

  const { data: account } = useAccount();

  const [invoice, setInvoice] = React.useState<Invoice | undefined>(undefined);
  const [items, setItems] = React.useState<InvoiceItem[] | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [pdfGenerationError, setPDFGenerationError] =
    React.useState<any>(undefined);

  const flags = useFlags();

  const requestData = () => {
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

  const sxGrid = {
    alignItems: 'center',
    display: 'flex',
  };

  const sxDownloadButton = {
    whiteSpace: 'nowrap',
  };

  return (
    <Paper
      sx={{
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
      }}
    >
      <Grid container rowGap={2}>
        <Grid xs={12}>
          <Grid container sx={sxGrid} spacing={2}>
            <Grid xs={12} sm={4} sx={sxGrid}>
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
            </Grid>
            <Grid
              sm
              data-qa-printable-invoice
              sx={{ ...sxGrid, justifyContent: 'flex-end' }}
            >
              {account && invoice && items && (
                <>
                  <DownloadCSV
                    csvRef={csvRef}
                    data={items}
                    filename={`invoice-${invoice.date}.csv`}
                    headers={csvHeaders}
                    onClick={() => csvRef.current.link.click()}
                    sx={{ ...sxDownloadButton, marginRight: '8px' }}
                  />
                  <Button
                    buttonType="secondary"
                    onClick={() => printInvoicePDF(account, invoice, items)}
                    sx={sxDownloadButton}
                  >
                    Download PDF
                  </Button>
                </>
              )}
            </Grid>
            <Grid sm="auto">
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

export default InvoiceDetail;

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
