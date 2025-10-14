import { getInvoice, getInvoiceItems } from '@linode/api-v4/lib/account';
import { useAccount, useRegionsQuery } from '@linode/queries';
import {
  Box,
  Button,
  IconButton,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { getAll } from '@linode/utilities';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { useTheme } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { DownloadCSV } from 'src/components/DownloadCSV/DownloadCSV';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { getShouldUseAkamaiBilling } from '../billingUtils';
import { invoiceCreatedAfterDCPricingLaunch } from '../PdfGenerator/utils';
import { InvoiceTable } from './InvoiceTable';

import type { Account, Invoice, InvoiceItem } from '@linode/api-v4/lib/account';
import type { APIError } from '@linode/api-v4/lib/types';

export const InvoiceDetail = () => {
  const flags = useFlags();

  const { invoiceId } = useParams({
    from: flags?.iamRbacPrimaryNavChanges
      ? '/billing/invoices/$invoiceId'
      : '/account/billing/invoices/$invoiceId',
  });
  const theme = useTheme();
  const { data: permissions } = usePermissions('account', [
    'list_invoice_items',
  ]);

  const csvRef = React.useRef<any>(undefined);

  const { data: account } = useAccount();
  const { data: regions } = useRegionsQuery();

  const [invoice, setInvoice] = React.useState<Invoice | undefined>(undefined);
  const [items, setItems] = React.useState<InvoiceItem[] | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [pdfGenerationError, setPDFGenerationError] =
    React.useState<any>(undefined);

  const shouldShowRegion = invoiceCreatedAfterDCPricingLaunch(invoice?.date);

  const requestData = () => {
    if (!permissions.list_invoice_items) {
      return;
    }

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

  if (!permissions.list_invoice_items) {
    return (
      <Notice variant="error">
        You do not have permission to view invoice details.
      </Notice>
    );
  }

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

  return (
    <>
      <DocumentTitleSegment segment="Invoice | Account & Billing" />
      <Paper>
        <Stack spacing={2}>
          <Stack
            alignItems="center"
            data-qa-invoice-header
            direction="row"
            flexWrap="wrap"
            gap={1}
            justifyContent="space-between"
          >
            <Stack direction="row" flexWrap="nowrap" spacing={1}>
              <Link
                accessibleAriaLabel="Back to Billing"
                data-qa-back-to-billing
                to={
                  flags?.iamRbacPrimaryNavChanges
                    ? '/billing'
                    : '/account/billing'
                }
              >
                <IconButton
                  component="span"
                  disableFocusRipple
                  role="none"
                  size="large"
                  sx={{
                    padding: 0,
                  }}
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
              <Box>
                <LandingHeader
                  breadcrumbProps={{
                    crumbOverrides: [{ label: 'Billing Info', position: 1 }],
                    firstAndLastOnly: true,
                    labelTitle: `Invoice #${invoiceId}`,
                    pathname: location.pathname,
                  }}
                  spacingBottom={0}
                />
              </Box>
            </Stack>
            {account && invoice && items && (
              <Stack
                alignItems="center"
                direction="row"
                flexWrap="wrap"
                gap={1}
              >
                <DownloadCSV
                  csvRef={csvRef}
                  data={items}
                  filename={`invoice-${invoice.date}.csv`}
                  headers={csvHeaders}
                  onClick={() => csvRef.current.link.click()}
                />
                <Button
                  buttonType="secondary"
                  onClick={() => printInvoicePDF(account, invoice, items)}
                >
                  Download PDF
                </Button>
                {invoice && (
                  <Typography
                    data-qa-total={invoice.total}
                    sx={{ whiteSpace: 'nowrap' }}
                    variant="h2"
                  >
                    Total:{' '}
                    <Currency
                      quantity={invoice.total}
                      wrapInParentheses={invoice.total < 0}
                    />
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
          {pdfGenerationError && (
            <Notice variant="error">Failed generating PDF.</Notice>
          )}
          <InvoiceTable
            errors={errors}
            items={items}
            loading={loading}
            shouldShowRegion={shouldShowRegion}
          />
          {invoice && (
            <Box
              data-qa-invoice-summary
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
        </Stack>
      </Paper>
    </>
  );
};

export const invoiceDetailLazyRoute = createLazyRoute(
  '/account/billing/invoices/$invoiceId'
)({
  component: InvoiceDetail,
});
