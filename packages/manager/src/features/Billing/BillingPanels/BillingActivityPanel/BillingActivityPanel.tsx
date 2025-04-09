import { getInvoiceItems } from '@linode/api-v4/lib/account';
import {
  useAccount,
  useAllAccountInvoices,
  useAllAccountPayments,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import { Autocomplete, Typography } from '@linode/ui';
import { getAll, useSet } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Currency } from 'src/components/Currency';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import { createDisplayPage } from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { TextTooltip } from 'src/components/TextTooltip';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { getShouldUseAkamaiBilling } from 'src/features/Billing/billingUtils';
import {
  printInvoice,
  printPayment,
} from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { useFlags } from 'src/hooks/useFlags';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

import { getTaxID } from '../../billingUtils';

import type { Invoice, InvoiceItem, Payment } from '@linode/api-v4/lib/account';
import type { SxProps, Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  activeSince: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
    },
  },
  dateColumn: {
    width: '25%',
  },
  descriptionColumn: {
    width: '25%',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
    },
  },
  headerRight: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
  pdfDownloadColumn: {
    '& > .loading': {
      width: 115,
    },
    paddingRight: 0,
    textAlign: 'right',
  },
  pdfError: {
    color: theme.color.red,
  },
  totalColumn: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
      width: '10%',
    },
  },
  transactionDate: {
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(1),
    },
    width: 130,
  },
  transactionType: {
    marginRight: theme.spacing(),
    width: 200,
  },
}));

interface ActivityFeedItem {
  date: string;
  id: number;
  label: string;
  total: number;
  type: 'invoice' | 'payment';
}

interface TransactionTypeOptions {
  label: string;
  value: 'all' | 'invoice' | 'payment';
}

const transactionTypeOptions: TransactionTypeOptions[] = [
  { label: 'Invoices', value: 'invoice' },
  { label: 'Payments', value: 'payment' },
  { label: 'All Transaction Types', value: 'all' },
];

interface TransactionDateOptions {
  label: string;
  value:
    | '6 Months'
    | '12 Months'
    | '30 Days'
    | '60 Days'
    | '90 Days'
    | 'All Time';
}

export const transactionDateOptions: TransactionDateOptions[] = [
  { label: '30 Days', value: '30 Days' },
  { label: '60 Days', value: '60 Days' },
  { label: '90 Days', value: '90 Days' },
  { label: '6 Months', value: '6 Months' },
  { label: '12 Months', value: '12 Months' },
  { label: 'All Time', value: 'All Time' },
];

const AkamaiBillingInvoiceText = (
  <Typography>
    Charges in the final Akamai invoice should be considered the final source
    truth. Linode invoice will not reflect discounting, currency adjustment, or
    any negotiated terms and conditions. Condensed and finalized invoice is
    available within{' '}
    <Link to="https://control.akamai.com/apps/billing">
      Akamai Control Center &gt; Billing
    </Link>
    .
  </Typography>
);

// =============================================================================
// <BillingActivityPanel />
// =============================================================================

const NUM_COLS = 4;

export interface Props {
  accountActiveSince?: string;
}

export const BillingActivityPanel = React.memo((props: Props) => {
  const { accountActiveSince } = props;
  const { data: profile } = useProfile();
  const { data: account } = useAccount();
  const { data: regions } = useRegionsQuery();

  const pagination = usePagination(1, 'billing-activity');
  const { handleOrderChange, order, orderBy } = useOrder();

  const isAkamaiCustomer = account?.billing_source === 'akamai';
  const { classes } = useStyles();
  const flags = useFlags();
  const pdfErrors = useSet();
  const pdfLoading = useSet();

  const [selectedTransactionType, setSelectedTransactionType] =
    React.useState<TransactionTypeOptions>(transactionTypeOptions[2]);

  const [selectedTransactionDate, setSelectedTransactionDate] =
    React.useState<TransactionDateOptions>(transactionDateOptions[3]);

  const endDate = getCutoffFromDateRange(selectedTransactionDate);
  const filter = makeFilter(endDate);

  const {
    data: payments,
    error: accountPaymentsError,
    isLoading: accountPaymentsLoading,
  } = useAllAccountPayments({}, filter);

  const {
    data: invoices,
    error: accountInvoicesError,
    isLoading: accountInvoicesLoading,
  } = useAllAccountInvoices({}, filter);

  const downloadInvoicePDF = React.useCallback(
    (invoiceId: number) => {
      const invoice = invoices?.find(
        (thisInvoice) => thisInvoice.id === invoiceId
      );

      const id = `invoice-${invoiceId}`;

      // TS Safeguard.
      if (!account || !invoice) {
        pdfErrors.add(id);
        return;
      }

      const taxes =
        flags[getShouldUseAkamaiBilling(invoice.date) ? 'taxes' : 'taxBanner'];

      pdfErrors.delete(id);
      pdfLoading.add(id);

      getAllInvoiceItems(invoiceId)
        .then(async (invoiceItems) => {
          pdfLoading.delete(id);

          const result = await printInvoice({
            account,
            invoice,
            items: invoiceItems,
            regions: regions ?? [],
            taxes,
          });

          if (result.status === 'error') {
            pdfErrors.add(id);
          }
        })
        .catch(() => {
          pdfLoading.delete(id);
          pdfErrors.add(id);
        });
    },
    [account, flags, invoices, pdfErrors, pdfLoading, regions]
  );

  const downloadPaymentPDF = React.useCallback(
    (paymentId: number) => {
      const payment = payments?.find(
        (thisPayment) => thisPayment.id === paymentId
      );

      const id = `payment-${paymentId}`;

      // TS Safeguard.
      if (!account || !payment) {
        pdfErrors.add(id);
        return;
      }

      const taxes =
        flags[getShouldUseAkamaiBilling(payment.date) ? 'taxes' : 'taxBanner'];

      pdfErrors.delete(id);

      const countryTax = getTaxID(
        payment.date,
        taxes?.date,
        taxes?.country_tax
      );
      const result = printPayment(account, payment, countryTax);

      if (result.status === 'error') {
        pdfErrors.add(id);
      }
    },
    [payments, flags, account, pdfErrors]
  );

  // Combine Invoices and Payments
  const combinedData = React.useMemo(
    () => [
      ...(invoices?.map(invoiceToActivityFeedItem) ?? []),
      ...(payments?.map(paymentToActivityFeedItem) ?? []),
    ],
    [invoices, payments]
  );

  // Filter on transaction type
  const filteredData = React.useMemo(() => {
    return combinedData.filter(
      (thisBillingItem) =>
        thisBillingItem.type === selectedTransactionType.value
    );
  }, [selectedTransactionType, combinedData]);

  const data =
    selectedTransactionType.value === 'all' ? combinedData : filteredData;

  const orderedPaginatedData = React.useMemo(() => {
    const orderedData = data.sort((a, b) => {
      if (orderBy === 'total') {
        return order === 'asc' ? a.total - b.total : b.total - a.total;
      }
      // Default: If no valid 'orderBy' is provided, sort the data by date in descending order.
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const displayPage = createDisplayPage<ActivityFeedItem>(
      pagination.page,
      pagination.pageSize
    );

    return displayPage(orderedData);
  }, [data, orderBy, order, pagination.page, pagination.pageSize]);

  const renderTableContent = () => {
    if (accountPaymentsLoading || accountInvoicesLoading) {
      return <TableRowLoading columns={NUM_COLS} rows={1} />;
    }
    if (accountPaymentsError || accountInvoicesError) {
      return (
        <TableRowError
          colSpan={NUM_COLS}
          message="There was an error retrieving your billing activity."
        />
      );
    }
    if (orderedPaginatedData.length === 0) {
      return (
        <TableRowEmpty
          colSpan={NUM_COLS}
          message="No Billing & Payment History found."
        />
      );
    }
    if (orderedPaginatedData.length > 0) {
      return orderedPaginatedData.map((thisItem, idx) => {
        const lastItem = idx === orderedPaginatedData.length - 1;
        return (
          <ActivityFeedItem
            downloadPDF={
              thisItem.type === 'invoice'
                ? downloadInvoicePDF
                : downloadPaymentPDF
            }
            sxRow={
              lastItem
                ? {
                    '& .MuiTableCell-root': {
                      borderBottom: 0,
                    },
                  }
                : {}
            }
            hasError={pdfErrors.has(`${thisItem.type}-${thisItem.id}`)}
            isLoading={pdfLoading.has(`${thisItem.type}-${thisItem.id}`)}
            key={`${thisItem.type}-${thisItem.id}`}
            {...thisItem}
          />
        );
      });
    }

    return null;
  };

  return (
    <Grid data-qa-billing-activity-panel size={12}>
      <Paper variant="outlined">
        <StyledBillingAndPaymentHistoryHeader
          className={classes.headerContainer}
        >
          <div>
            <Typography
              sx={{
                fontSize: '1rem',
                lineHeight: '1.5rem',
              }}
              variant="h2"
            >
              {`${isAkamaiCustomer ? 'Usage' : 'Billing & Payment'} History`}
            </Typography>
            {accountActiveSince ? (
              <Typography className={classes.activeSince} variant="body1">
                Account active since{' '}
                {formatDate(accountActiveSince, {
                  displayTime: false,
                  timezone: profile?.timezone,
                })}
              </Typography>
            ) : null}
            {isAkamaiCustomer ? (
              <TextTooltip
                displayText="Usage History may not reflect finalized invoice"
                placement="right-end"
                tooltipText={AkamaiBillingInvoiceText}
              />
            ) : null}
          </div>
          <div className={classes.headerRight}>
            <Autocomplete
              onChange={(_, item) => {
                setSelectedTransactionType(item);
                pdfErrors.clear();
                pdfLoading.clear();
              }}
              value={transactionTypeOptions.find(
                (option) => option.value === selectedTransactionType.value
              )}
              className={classes.transactionType}
              disableClearable
              label="Transaction Types"
              noMarginTop
              options={transactionTypeOptions}
            />
            <Autocomplete
              onChange={(_, item) => {
                setSelectedTransactionDate(item);
                pdfErrors.clear();
                pdfLoading.clear();
              }}
              value={transactionDateOptions.find(
                (option) => option.value === selectedTransactionDate.value
              )}
              className={classes.transactionDate}
              disableClearable
              label="Transaction Dates"
              noMarginTop
              options={transactionDateOptions}
            />
          </div>
        </StyledBillingAndPaymentHistoryHeader>
        <Table aria-label="List of Invoices and Payments" sx={{ border: 0 }}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.descriptionColumn}>
                Description
              </TableCell>
              <TableCell className={classes.dateColumn}>Date</TableCell>
              <TableSortCell
                active={orderBy === 'total'}
                className={classes.totalColumn}
                direction={order}
                handleClick={handleOrderChange}
                label="total"
              >
                Amount
              </TableSortCell>

              <TableCell className={classes.pdfDownloadColumn} />
            </TableRow>
          </TableHead>
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
        <PaginationFooter
          count={data.length}
          eventCategory="Billing Activity Table"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </Paper>
    </Grid>
  );
});

const StyledBillingAndPaymentHistoryHeader = styled('div', {
  name: 'BillingAndPaymentHistoryHeader',
})(() => ({
  borderBottom: 0,
  padding: `15px 0px 15px 20px`,
}));

// =============================================================================
// <ActivityFeedItem />
// =============================================================================
interface ActivityFeedItemProps extends ActivityFeedItem {
  downloadPDF: (id: number) => void;
  hasError: boolean;
  isLoading: boolean;
  sxRow: SxProps<Theme>;
}

export const ActivityFeedItem = React.memo((props: ActivityFeedItemProps) => {
  const { classes } = useStyles();

  const {
    date,
    downloadPDF,
    hasError,
    id,
    isLoading,
    label,
    sxRow,
    total,
    type,
  } = props;

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      downloadPDF(id);
    },
    [id, downloadPDF]
  );

  const action = {
    className: hasError ? classes.pdfError : '',
    onClick: handleClick,
    title: hasError ? 'Error. Click to try again.' : 'Download PDF',
  };

  return (
    <TableRow data-testid={`${type}-${id}`} sx={sxRow}>
      <TableCell>
        {type === 'invoice' ? (
          <Link to={`/account/billing/invoices/${id}`}>{label}</Link>
        ) : (
          label
        )}
      </TableCell>
      <TableCell>
        <DateTimeDisplay value={date} />
      </TableCell>
      <TableCell className={classes.totalColumn}>
        <Currency quantity={total} wrapInParentheses={total < 0} />
      </TableCell>
      <TableCell className={classes.pdfDownloadColumn}>
        <InlineMenuAction
          actionText={action.title}
          className={action.className}
          loading={isLoading}
          onClick={action.onClick}
        />
      </TableCell>
    </TableRow>
  );
});

// =============================================================================
// Utilities
// =============================================================================
const getAllInvoiceItems = (invoiceId: number) =>
  getAll<InvoiceItem>((params, filter) =>
    getInvoiceItems(invoiceId, params, filter)
  )().then((data) => data.data);

export const invoiceToActivityFeedItem = (
  invoice: Invoice
): ActivityFeedItem => {
  return {
    ...invoice,
    type: 'invoice',
  };
};

export const paymentToActivityFeedItem = (
  payment: Payment
): ActivityFeedItem => {
  const { date, id, usd } = payment;
  // Refunds are issued as negative payments.
  const label = usd < 0 ? 'Refund' : `Payment #${payment.id}`;

  const total = Math.abs(usd);

  return {
    date,
    id,
    label,
    total,
    type: 'payment',
  };
};
/**
 * @param currentDatetime ISO format date
 * @returns ISO format beginning of the range date
 */
export const getCutoffFromDateRange = (
  range: TransactionDateOptions,
  currentDatetime?: string
): null | string => {
  if (range === transactionDateOptions[5]) {
    return null;
  }

  const date = currentDatetime ? parseAPIDate(currentDatetime) : DateTime.utc();

  let outputDate: DateTime;
  switch (range) {
    case transactionDateOptions[0]:
      outputDate = date.minus({ days: 30 });
      break;
    case transactionDateOptions[1]:
      outputDate = date.minus({ days: 60 });
      break;
    case transactionDateOptions[2]:
      outputDate = date.minus({ days: 90 });
      break;
    case transactionDateOptions[3]:
      outputDate = date.minus({ months: 6 });
      break;
    case transactionDateOptions[4]:
      outputDate = date.minus({ months: 12 });
      break;
    default:
      outputDate = DateTime.fromMillis(0, { zone: 'utc' });
      break;
  }
  return outputDate.startOf('day').toISO();
};

/**
 * @param endDate in ISO format
 */
export const makeFilter = (endDate: null | string) => {
  const filter: any = {
    '+order': 'desc',
    '+order_by': 'date',
  };
  if (endDate) {
    const filterEndDate = parseAPIDate(endDate);
    filter.date = {
      '+gte': filterEndDate.toFormat(ISO_DATETIME_NO_TZ_FORMAT),
    };
  }

  return filter;
};
