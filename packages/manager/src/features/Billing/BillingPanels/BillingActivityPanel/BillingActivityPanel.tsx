import * as React from 'react';
import {
  getInvoiceItems,
  Invoice,
  InvoiceItem,
  Payment,
} from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import InlineMenuAction from 'src/components/InlineMenuAction';
import Link from 'src/components/Link';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import TableRow from 'src/components/TableRow';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import {
  printInvoice,
  printPayment,
} from 'src/features/Billing/PdfGenerator/PdfGenerator';
import useFlags from 'src/hooks/useFlags';
import { useSet } from 'src/hooks/useSet';
import { useAccount } from 'src/queries/account';
import { isAfter, parseAPIDate } from 'src/utilities/date';
import formatDate from 'src/utilities/formatDate';
import { getAllWithArguments } from 'src/utilities/getAll';
import { getTaxID } from '../../billingUtils';
import {
  useAllAccountInvoices,
  useAllAccountPayments,
} from 'src/queries/accountBilling';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '8px 0',
  },
  headerContainer: {
    backgroundColor: theme.color.white,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginLeft: 15,
      paddingLeft: 0,
    },
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem',
  },
  activeSince: {
    marginRight: theme.spacing() + 2,
  },
  cancelButton: {
    '&:focus, &:hover': {
      backgroundColor: 'inherit !important',
    },
    borderLeft: `solid 1px ${
      theme.name === 'lightTheme' ? theme.color.border2 : theme.color.border3
    } !important`,
    fontSize: '0.875rem !important',
    padding: 6,
    marginRight: theme.spacing() + 2,
    '& :first-child': {
      marginLeft: 2,
    },
  },
  transactionType: {
    marginRight: theme.spacing(),
    width: 200,
  },
  transactionDate: {
    width: 130,
  },
  descriptionColumn: {
    width: '25%',
  },
  dateColumn: {
    width: '25%',
  },
  totalColumn: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
      width: '10%',
    },
  },
  pdfDownloadColumn: {
    textAlign: 'right',
    '& > .loading': {
      width: 115,
    },
  },
  pdfError: {
    color: theme.color.red,
  },
}));

interface ActivityFeedItem {
  label: string;
  total: number;
  date: string;
  type: 'payment' | 'invoice';
  id: number;
}

type TransactionTypes = ActivityFeedItem['type'] | 'all';
const transactionTypeOptions: Item<TransactionTypes>[] = [
  { label: 'Invoices', value: 'invoice' },
  { label: 'Payments', value: 'payment' },
  { label: 'All Transaction Types', value: 'all' },
];

type DateRange =
  | '30 Days'
  | '60 Days'
  | '90 Days'
  | '6 Months'
  | '12 Months'
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

// =============================================================================
// <BillingActivityPanel />
// =============================================================================
export interface Props {
  accountActiveSince?: string;
}

export const BillingActivityPanel: React.FC<Props> = (props) => {
  const { accountActiveSince } = props;

  const { data: account } = useAccount();

  const classes = useStyles();
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

  const {
    data: payments,
    isLoading: accountPaymentsLoading,
    error: accountPaymentsError,
  } = useAllAccountPayments(
    {},
    makeFilter(getCutoffFromDateRange(selectedTransactionDate))
  );

  const {
    data: invoices,
    isLoading: accountInvoicesLoading,
    error: accountInvoicesError,
  } = useAllAccountInvoices(
    {},
    makeFilter(getCutoffFromDateRange(selectedTransactionDate))
  );

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

      pdfErrors.delete(id);
      pdfLoading.add(id);

      getAllInvoiceItems([invoiceId])
        .then((response) => {
          pdfLoading.delete(id);

          const invoiceItems = response.data;
          const result = printInvoice(
            account!,
            invoice,
            invoiceItems,
            flags.taxBanner
          );

          if (result.status === 'error') {
            pdfErrors.add(id);
          }
        })
        .catch(() => {
          pdfLoading.delete(id);
          pdfErrors.add(id);
        });
    },
    [account, flags.taxBanner, invoices, pdfErrors, pdfLoading]
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

      pdfErrors.delete(id);

      const taxBanner = flags.taxBanner;
      const taxId = getTaxID(
        payment.date,
        taxBanner?.date,
        taxBanner?.linode_tax_id
      );
      const result = printPayment(account, payment, taxId);

      if (result.status === 'error') {
        pdfErrors.add(id);
      }
    },
    [payments, flags.taxBanner, account, pdfErrors]
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

  // Filter on transaction type and transaction date.
  const filteredData = React.useMemo(() => {
    return combinedData.filter((thisBillingItem) => {
      const matchesType =
        selectedTransactionType !== 'all'
          ? thisBillingItem.type === selectedTransactionType
          : true;

      const dateCutoff = getCutoffFromDateRange(selectedTransactionDate);

      const matchesDate = isAfter(thisBillingItem.date, dateCutoff);

      return matchesType && matchesDate;
    });
  }, [selectedTransactionType, selectedTransactionDate, combinedData]);

  return (
    <div className={classes.root}>
      <div className={classes.headerContainer}>
        <Typography variant="h2" className={classes.headline}>
          Billing &amp; Payment History
        </Typography>
        <div className={classes.headerRight}>
          {accountActiveSince && (
            <div className={classes.flexContainer}>
              <Typography variant="body1" className={classes.activeSince}>
                Account active since{' '}
                {formatDate(accountActiveSince, {
                  displayTime: false,
                })}
              </Typography>
            </div>
          )}
          <div className={classes.flexContainer}>
            <Select
              className={classes.transactionType}
              label="Transaction Types"
              onChange={handleTransactionTypeChange}
              value={
                transactionTypeOptions.find(
                  (thisOption) => thisOption.value === selectedTransactionType
                ) || null
              }
              isClearable={false}
              isSearchable={false}
              options={transactionTypeOptions}
              inline
              small
              hideLabel
            />
            <Select
              className={classes.transactionDate}
              label="Transaction Dates"
              onChange={handleTransactionDateChange}
              value={
                transactionDateOptions.find(
                  (thisOption) => thisOption.value === selectedTransactionDate
                ) || null
              }
              isClearable={false}
              isSearchable={false}
              options={transactionDateOptions}
              inline
              small
              hideLabel
            />
          </div>
        </div>
      </div>
      <OrderBy data={filteredData} orderBy={'date'} order={'desc'}>
        {React.useCallback(
          ({ data: orderedData }) => (
            <Paginate pageSize={25} data={orderedData} shouldScroll={false}>
              {({
                data: paginatedAndOrderedData,
                count,
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
                        length={paginatedAndOrderedData.length}
                        loading={
                          accountPaymentsLoading || accountInvoicesLoading
                        }
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
                      >
                        {paginatedAndOrderedData.map((thisItem) => {
                          return (
                            <ActivityFeedItem
                              key={`${thisItem.type}-${thisItem.id}`}
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
                              {...thisItem}
                            />
                          );
                        })}
                      </TableContentWrapper>
                    </TableBody>
                  </Table>
                  <PaginationFooter
                    count={count}
                    handlePageChange={handlePageChange}
                    handleSizeChange={handlePageSizeChange}
                    page={page}
                    pageSize={pageSize}
                    eventCategory="Billing Activity Table"
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

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = React.memo(
  (props) => {
    const classes = useStyles();

    const {
      date,
      label,
      total,
      id,
      type,
      downloadPDF,
      hasError,
      isLoading,
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
      title: hasError ? 'Error. Click to try again.' : 'Download PDF',
      className: hasError ? classes.pdfError : '',
      onClick: handleClick,
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
            onClick={action.onClick}
            loading={isLoading}
          />
        </TableCell>
      </TableRow>
    );
  }
);

// =============================================================================
// Utilities
// =============================================================================
const getAllInvoiceItems = getAllWithArguments<InvoiceItem>(getInvoiceItems);

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
    label,
    date,
    id,
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
): string => {
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
  return outputDate.toISO();
};

/**
 * @param endDate in ISO format
 */
export const makeFilter = (endDate?: string): any => {
  const filter: any = {
    '+order_by': 'date',
    '+order': 'desc',
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
