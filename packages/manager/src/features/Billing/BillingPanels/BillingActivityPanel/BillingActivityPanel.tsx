import {
  Invoice,
  InvoiceItem,
  Payment,
  getInvoiceItems,
} from '@linode/api-v4/lib/account';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Currency } from 'src/components/Currency';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { Link } from 'src/components/Link';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import {
  printInvoice,
  printPayment,
} from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { getShouldUseAkamaiBilling } from 'src/features/Billing/billingUtils';
import { useFlags } from 'src/hooks/useFlags';
import { useSet } from 'src/hooks/useSet';
import { useAccount } from 'src/queries/account';
import {
  useAllAccountInvoices,
  useAllAccountPayments,
} from 'src/queries/accountBilling';
import { useProfile } from 'src/queries/profile';
import { parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';
import { getAll } from 'src/utilities/getAll';

import { getTaxID } from '../../billingUtils';
import { useRegionsQuery } from 'src/queries/regions';

const useStyles = makeStyles()((theme: Theme) => ({
  activeSince: {
    marginRight: theme.spacing(1.25),
  },
  dateColumn: {
    width: '25%',
  },
  descriptionColumn: {
    width: '25%',
  },
  flexContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  headerContainer: {
    alignItems: 'center',
    backgroundColor: theme.color.white,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
  headerLeft: {
    display: 'flex',
    flexGrow: 2,
    marginLeft: 10,
    paddingLeft: 20,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
    },
  },
  headerRight: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      marginLeft: 15,
      paddingLeft: 0,
    },
  },
  headline: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    marginBottom: 8,
    marginLeft: 15,
    marginTop: 8,
  },
  pdfDownloadColumn: {
    '& > .loading': {
      width: 115,
    },
    textAlign: 'right',
  },
  pdfError: {
    color: theme.color.red,
  },
  root: {
    padding: '8px 0',
  },
  totalColumn: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
      width: '10%',
    },
  },
  transactionDate: {
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

type TransactionTypes = 'all' | ActivityFeedItem['type'];
const transactionTypeOptions: Item<TransactionTypes>[] = [
  { label: 'Invoices', value: 'invoice' },
  { label: 'Payments', value: 'payment' },
  { label: 'All Transaction Types', value: 'all' },
];

type DateRange =
  | '6 Months'
  | '12 Months'
  | '30 Days'
  | '60 Days'
  | '90 Days'
  | 'All Time';
const transactionDateOptions: Item<DateRange>[] = [
  { label: '30 Days', value: '30 Days' },
  { label: '60 Days', value: '60 Days' },
  { label: '90 Days', value: '90 Days' },
  { label: '6 Months', value: '6 Months' },
  { label: '12 Months', value: '12 Months' },
  { label: 'All Time', value: 'All Time' },
];

const defaultDateRange: DateRange = '6 Months';

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
export interface Props {
  accountActiveSince?: string;
}

export const BillingActivityPanel = (props: Props) => {
  const { accountActiveSince } = props;

  const { data: profile } = useProfile();
  const { data: account } = useAccount();
  const { data: regions } = useRegionsQuery();

  const isAkamaiCustomer = account?.billing_source === 'akamai';

  const { classes } = useStyles();
  const flags = useFlags();

  const pdfErrors = useSet();
  const pdfLoading = useSet();

  const [
    selectedTransactionType,
    setSelectedTransactionType,
  ] = React.useState<TransactionTypes>('all');

  const [
    selectedTransactionDate,
    setSelectedTransactionDate,
  ] = React.useState<DateRange>(defaultDateRange);

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
            flags,
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

  // Handlers for <Select /> components.
  const handleTransactionTypeChange = React.useCallback(
    (item: Item<TransactionTypes>) => {
      setSelectedTransactionType(item.value);
      pdfErrors.clear();
      pdfLoading.clear();
    },
    [pdfErrors, pdfLoading]
  );

  const handleTransactionDateChange = React.useCallback(
    (item: Item<DateRange>) => {
      setSelectedTransactionDate(item.value);
      pdfErrors.clear();
      pdfLoading.clear();
    },
    [pdfErrors, pdfLoading]
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
      (thisBillingItem) => thisBillingItem.type === selectedTransactionType
    );
  }, [selectedTransactionType, combinedData]);

  return (
    <Grid xs={12} data-qa-billing-activity-panel>
      <div className={classes.root}>
        <div className={classes.headerContainer}>
          <Typography className={classes.headline} variant="h2">
            {`${isAkamaiCustomer ? 'Usage' : 'Billing & Payment'} History`}
          </Typography>
          {isAkamaiCustomer ? (
            <div className={classes.headerLeft}>
              <TextTooltip
                displayText="Usage History may not reflect finalized invoice"
                sxTypography={{ paddingLeft: '4px' }}
                tooltipText={AkamaiBillingInvoiceText}
              />
            </div>
          ) : null}
          <div className={classes.headerRight}>
            {accountActiveSince && (
              <div className={classes.flexContainer}>
                <Typography className={classes.activeSince} variant="body1">
                  Account active since{' '}
                  {formatDate(accountActiveSince, {
                    displayTime: false,
                    timezone: profile?.timezone,
                  })}
                </Typography>
              </div>
            )}
            <div className={classes.flexContainer}>
              <Select
                value={
                  transactionTypeOptions.find(
                    (thisOption) => thisOption.value === selectedTransactionType
                  ) || null
                }
                className={classes.transactionType}
                hideLabel
                inline
                isClearable={false}
                isSearchable={false}
                label="Transaction Types"
                onChange={handleTransactionTypeChange}
                options={transactionTypeOptions}
                small
              />
              <Select
                value={
                  transactionDateOptions.find(
                    (thisOption) => thisOption.value === selectedTransactionDate
                  ) || null
                }
                className={classes.transactionDate}
                hideLabel
                inline
                isClearable={false}
                isSearchable={false}
                label="Transaction Dates"
                onChange={handleTransactionDateChange}
                options={transactionDateOptions}
                small
              />
            </div>
          </div>
        </div>
        <OrderBy
          data={selectedTransactionType === 'all' ? combinedData : filteredData}
          order={'desc'}
          orderBy={'date'}
        >
          {React.useCallback(
            ({ data: orderedData }) => (
              <Paginate data={orderedData} pageSize={25} shouldScroll={false}>
                {({
                  count,
                  data: paginatedAndOrderedData,
                  handlePageChange,
                  handlePageSizeChange,
                  page,
                  pageSize,
                }) => (
                  <>
                    <Table aria-label="List of Invoices and Payments">
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.descriptionColumn}>
                            Description
                          </TableCell>
                          <TableCell className={classes.dateColumn}>
                            Date
                          </TableCell>
                          <TableCell className={classes.totalColumn}>
                            Amount
                          </TableCell>
                          <TableCell className={classes.pdfDownloadColumn} />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableContentWrapper
                          error={
                            accountPaymentsError || accountInvoicesError
                              ? [
                                  {
                                    reason:
                                      'There was an error retrieving your billing activity.',
                                  },
                                ]
                              : undefined
                          }
                          loading={
                            accountPaymentsLoading || accountInvoicesLoading
                          }
                          loadingProps={{
                            columns: 4,
                          }}
                          length={paginatedAndOrderedData.length}
                        >
                          {paginatedAndOrderedData.map((thisItem) => {
                            return (
                              <ActivityFeedItem
                                downloadPDF={
                                  thisItem.type === 'invoice'
                                    ? downloadInvoicePDF
                                    : downloadPaymentPDF
                                }
                                hasError={pdfErrors.has(
                                  `${thisItem.type}-${thisItem.id}`
                                )}
                                isLoading={pdfLoading.has(
                                  `${thisItem.type}-${thisItem.id}`
                                )}
                                key={`${thisItem.type}-${thisItem.id}`}
                                {...thisItem}
                              />
                            );
                          })}
                        </TableContentWrapper>
                      </TableBody>
                    </Table>
                    <PaginationFooter
                      count={count}
                      eventCategory="Billing Activity Table"
                      handlePageChange={handlePageChange}
                      handleSizeChange={handlePageSizeChange}
                      page={page}
                      pageSize={pageSize}
                    />
                  </>
                )}
              </Paginate>
            ),
            [
              classes.descriptionColumn,
              classes.dateColumn,
              classes.totalColumn,
              classes.pdfDownloadColumn,
              accountPaymentsLoading,
              accountInvoicesLoading,
              accountPaymentsError,
              accountInvoicesError,
              downloadInvoicePDF,
              downloadPaymentPDF,
              pdfErrors,
              pdfLoading,
            ]
          )}
        </OrderBy>
      </div>
    </Grid>
  );
};

// =============================================================================
// <ActivityFeedItem />
// =============================================================================
interface ActivityFeedItemProps extends ActivityFeedItem {
  downloadPDF: (id: number) => void;
  hasError: boolean;
  isLoading: boolean;
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
    <TableRow data-testid={`${type}-${id}`}>
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
  range: DateRange,
  currentDatetime?: string
): string | undefined => {
  if (range === 'All Time') {
    return undefined;
  }

  const date = currentDatetime ? parseAPIDate(currentDatetime) : DateTime.utc();

  let outputDate: DateTime;
  switch (range) {
    case '30 Days':
      outputDate = date.minus({ days: 30 });
      break;
    case '60 Days':
      outputDate = date.minus({ days: 60 });
      break;
    case '90 Days':
      outputDate = date.minus({ days: 90 });
      break;
    case '6 Months':
      outputDate = date.minus({ months: 6 });
      break;
    case '12 Months':
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
export const makeFilter = (endDate?: string): any => {
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

export default React.memo(BillingActivityPanel);
