import { getInvoice, getInvoiceItems } from '@linode/api-v4/lib/account';
import { IconButton } from '@linode/ui';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Currency } from 'src/components/Currency';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from '@linode/ui';
import { Typography } from 'src/components/Typography';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';

import { getShouldUseAkamaiBilling } from '../billingUtils';
import { invoiceCreatedAfterDCPricingLaunch } from '../PdfGenerator/utils';
import { InvoiceTable } from './InvoiceTable';

import type { Account, Invoice, InvoiceItem } from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';

export const InvoiceDetail = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const theme = useTheme();

  const csvRef = React.useRef<any>();

  const { data: account } = useAccount();
  const { data: regions } = useRegionsQuery();

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

  const shouldShowRegion = invoiceCreatedAfterDCPricingLaunch(invoice?.date);

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

  const printInvoicePDF = async (
    account: Account,
    invoice: Invoice,
    items: InvoiceItem[]
  ) => {
    const taxes =
      flags[getShouldUseAkamaiBilling(invoice.date) ? 'taxes' : 'taxBanner'];

    const result = await printInvoice({
      account,
      invoice,
      items,
      regions: shouldShowRegion && regions ? regions : [],
      taxes,
    });

    setPDFGenerationError(result.status === 'error' ? result.error : undefined);
  };

  const csvHeaders = [
    { key: 'label', label: 'Description' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'quantity', label: 'Quantity' },
    ...(shouldShowRegion ? [{ key: 'region', label: 'Region' }] : []),
    { key: 'unit_price', label: 'Unit Price' },
    { key: 'amount', label: 'Amount (USD)' },
    { key: 'tax', label: 'Tax (USD)' },
    { key: 'total', label: 'Total (USD)' },
  ];

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
          <Grid container data-qa-invoice-header spacing={2} sx={sxGrid}>
            <Grid sm={4} sx={sxGrid} xs={12}>
              <Link
                accessibleAriaLabel="Back to Billing"
                data-qa-back-to-billing
                to={`/account/billing`}
              >
                <IconButton
                  sx={{
                    padding: 0,
                  }}
                  component="span"
                  disableFocusRipple
                  role="none"
                  size="large"
                  tabIndex={-1}
                >
                  <KeyboardArrowLeft
                    sx={{
                      height: 34,
                      width: 34,
                    }}
                  />
                </IconButton>
              </Link>
              {invoice && (
                <LandingHeader
                  breadcrumbProps={{
                    crumbOverrides: [{ label: 'Billing Info', position: 1 }],
                    firstAndLastOnly: true,
                    labelTitle: `Invoice #${invoice.id}`,
                    pathname: location.pathname,
                  }}
                />
              )}
            </Grid>
            <Grid
              data-qa-printable-invoice
              sm
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
                <Typography data-qa-total={invoice.total} variant="h2">
                  Total:{' '}
                  <Currency
                    quantity={invoice.total}
                    wrapInParentheses={invoice.total < 0}
                  />
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={12}>
          {pdfGenerationError && (
            <Notice variant="error">Failed generating PDF.</Notice>
          )}
          <InvoiceTable
            errors={errors}
            items={items}
            loading={loading}
            shouldShowRegion={shouldShowRegion}
          />
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
              data-qa-invoice-summary
            >
              <Typography variant="h2">
                Subtotal:{' '}
                <Currency
                  quantity={invoice.subtotal}
                  wrapInParentheses={invoice.subtotal < 0}
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
                  quantity={invoice.total}
                  wrapInParentheses={invoice.total < 0}
                />
              </Typography>
              <Typography>
                This invoice may include Linode Compute Instances that have been
                powered off as the data is maintained and resources are still
                reserved. If you no longer need powered-down Linodes, you can{' '}
                <Link to="https://techdocs.akamai.com/cloud-computing/docs/stop-further-billing">
                  {' '}
                  remove the service
                </Link>{' '}
                from your account.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export const invoiceDetailLazyRoute = createLazyRoute(
  '/account/billing/invoices/$invoiceId'
)({
  component: InvoiceDetail,
});
