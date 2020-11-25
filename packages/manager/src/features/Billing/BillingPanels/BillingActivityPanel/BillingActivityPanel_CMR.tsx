import {
  getInvoiceItems,
  getInvoices,
  getPayments,
  Invoice,
  InvoiceItem,
  Payment
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import { parseAPIDate } from 'src/utilities/date';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableContentWrapper from 'src/components/TableContentWrapper/TableContentWrapper_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import {
  printInvoice,
  printPayment
} from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { useAccount } from 'src/hooks/useAccount';
import useFlags from 'src/hooks/useFlags';
import { ISO_DATE_FORMAT, ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { useSet } from 'src/hooks/useSet';
import { isAfter } from 'src/utilities/date';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { getAll, getAllWithArguments } from 'src/utilities/getAll';
import { getTaxID } from '../../billingUtils';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles((theme: Theme) => ({
  headerContainer: {
    backgroundColor: theme.color.white,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
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
      paddingLeft: 0
    }
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem'
  },
  activeSince: {
    marginRight: theme.spacing() + 2
  },
  cancelButton: {
    '&:focus, &:hover': {
      backgroundColor: 'inherit !important'
    },
    borderLeft: `solid 1px ${
      theme.name === 'lightTheme' ? theme.color.border2 : theme.color.border3
    } !important`,
    fontSize: '0.875rem !important',
    padding: 6,
    marginRight: theme.spacing() + 2,
    '& :first-child': {
      marginLeft: 2
    }
  },
  transactionType: {
    marginRight: theme.spacing() + 2,
    width: 200,
    [theme.breakpoints.down('sm')]: {
      marginTop: 4
    }
  },
  transactionDate: {
    width: 130,
    [theme.breakpoints.down('sm')]: {
      marginTop: 4
    }
  },
  descriptionColumn: {
    width: '25%'
  },
  dateColumn: {
    width: '25%'
  },
  totalColumn: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
      width: '10%'
    }
  },
  pdfDownloadColumn: {
    textAlign: 'right',
    '& > .loading': {
      width: 115
    }
  },
  pdfError: {
    color: theme.color.red
  }
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
  { label: 'All Transaction Types', value: 'all' }
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
  { label: 'All Time', value: 'All Time' }
];

const defaultDateRange: DateRange = '6 Months';

// =============================================================================
// <BillingActivityPanel />
// =============================================================================
export interface Props {
  mostRecentInvoiceId?: number;
  setMostRecentInvoiceId: (id: number) => void;
  accountActiveSince?: string;
}

export const BillingActivityPanel: React.FC<Props> = props => {
  const {
    mostRecentInvoiceId,
    setMostRecentInvoiceId,
    accountActiveSince
  } = props;

  const classes = useStyles();
  const flags = useFlags();
  const { account } = useAccount();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  const pdfErrors = useSet();
  const pdfLoading = useSet();

  const [selectedTransactionType, setSelectedTransactionType] = React.useState<
    TransactionTypes
  >('all');

  const [selectedTransactionDate, setSelectedTransactionDate] = React.useState<
    DateRange
  >(defaultDateRange);

  const requestAllInvoicesAndPayments = React.useCallback(
    (endDate?: string) => {
      const filter = makeFilter(endDate);

      setLoading(true);
      setError(undefined);

      Promise.all([getAllInvoices({}, filter), getAllPayments({}, filter)])
        .then(([invoices, payments]) => {
          setLoading(false);
          setInvoices(invoices.data);
          setPayments(payments.data);

          if (!mostRecentInvoiceId && invoices.data.length > 0) {
            setMostRecentInvoiceId(invoices.data[0].id);
          }
        })
        .catch(_error => {
          setError(
            getAPIErrorOrDefault(
              _error,
              'There was an error retrieving your billing activity.'
            )
          );
          setLoading(false);
        });
    },
    [mostRecentInvoiceId, setMostRecentInvoiceId]
  );

  // Request all invoices and payments when component mounts.
  React.useEffect(() => {
    const defaultDateCutoff = getCutoffFromDateRange(defaultDateRange);
    requestAllInvoicesAndPayments(defaultDateCutoff);
    // eslint-disable-next-line
  }, []);

  const downloadInvoicePDF = React.useCallback(
    (invoiceId: number) => {
      const invoice = invoices.find(
        thisInvoice => thisInvoice.id === invoiceId
      );

      const id = `invoice-${invoiceId}`;

      // TS Safeguard.
      if (!account.data || !invoice) {
        pdfErrors.add(id);
        return;
      }

      pdfErrors.delete(id);
      pdfLoading.add(id);

      getAllInvoiceItems([invoiceId])
        .then(response => {
          pdfLoading.delete(id);

          const invoiceItems = response.data;
          const result = printInvoice(
            account.data!,
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
    [account.data, flags.taxBanner, invoices, pdfErrors, pdfLoading]
  );

  const downloadPaymentPDF = React.useCallback(
    (paymentId: number) => {
      const payment = payments.find(
        thisPayment => thisPayment.id === paymentId
      );

      const id = `payment-${paymentId}`;

      // TS Safeguard.
      if (!account.data || !payment) {
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
      const result = printPayment(account.data, payment, taxId);

      if (result.status === 'error') {
        pdfErrors.add(id);
      }
    },
    [payments, flags.taxBanner, account.data, pdfErrors]
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

      const earliestInvoiceDate =
        invoices[invoices.length - 1]?.date ||
        DateTime.utc().toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const earliestPaymentDate =
        payments[payments.length - 1]?.date ||
        DateTime.utc().toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const dateCutoff = getCutoffFromDateRange(item.value);

      // If the data we already have falls within the selected date range,
      // no need to request more data.
      if (
        isAfter(dateCutoff, earliestInvoiceDate) &&
        isAfter(dateCutoff, earliestPaymentDate)
      ) {
        return;
      }

      requestAllInvoicesAndPayments(dateCutoff);
    },
    [requestAllInvoicesAndPayments, invoices, payments, pdfErrors, pdfLoading]
  );

  // Combine Invoices and Payments
  const combinedData = React.useMemo(
    () => [
      ...invoices.map(invoiceToActivityFeedItem),
      ...payments.map(paymentToActivityFeedItem)
    ],
    [invoices, payments]
  );

  // Filter on transaction type and transaction date.
  const filteredData = React.useMemo(() => {
    return combinedData.filter(thisBillingItem => {
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
    <>
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
                  format: ISO_DATE_FORMAT
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
                  thisOption => thisOption.value === selectedTransactionType
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
                  thisOption => thisOption.value === selectedTransactionDate
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
                pageSize
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
                        loading={loading}
                        error={error}
                      >
                        {paginatedAndOrderedData.map(thisItem => {
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
            loading,
            error,
            downloadInvoicePDF,
            downloadPaymentPDF,
            pdfErrors,
            pdfLoading
          ]
        )}
      </OrderBy>
    </>
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
  props => {
    const classes = useStyles();

    const {
      date,
      label,
      total,
      id,
      type,
      downloadPDF,
      hasError,
      isLoading
    } = props;
    const rowProps = { rowLink: '' };
    if (type === 'invoice' && !isLoading) {
      rowProps.rowLink = `/account/billing/invoices/${id}`;
    }

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
      onClick: handleClick
    };

    return (
      <TableRow {...rowProps} data-testid={`${type}-${id}`}>
        <TableCell>{label}</TableCell>
        <TableCell>
          <DateTimeDisplay format={ISO_DATE_FORMAT} value={date} />
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
const getAllInvoices = getAll<Invoice>(getInvoices);
const getAllPayments = getAll<Payment>(getPayments);
const getAllInvoiceItems = getAllWithArguments<InvoiceItem>(getInvoiceItems);

export const invoiceToActivityFeedItem = (
  invoice: Invoice
): ActivityFeedItem => {
  return {
    ...invoice,
    type: 'invoice'
  };
};

export const paymentToActivityFeedItem = (
  payment: Payment
): ActivityFeedItem => {
  const { date, id, usd } = payment;
  // Refunds are issued as negative payments.
  const label = usd < 0 ? 'Refund' : `Payment #${payment.id}`;

  // Note: this is confusing.
  // We flip the polarity here, since we display a positive payment as e.g. "-($5.00)"
  // and a negative payment (i.e. refund) as e.g. "$5.00"
  const total = usd <= 0 ? Math.abs(usd) : -usd;

  return {
    label,
    date,
    id,
    total,
    type: 'payment'
  };
};
/**
 * @param currentDatetime ISO format date
 * @returns ISO format beginning of the range date
 */
export const getCutoffFromDateRange = (
  range: DateRange,
  currentDatetime?: string
) => {
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
export const makeFilter = (endDate?: string) => {
  const filter: any = {
    '+order_by': 'date',
    '+order': 'desc'
  };
  if (endDate) {
    const filterEndDate = parseAPIDate(endDate);
    filter.date = {
      '+gte': filterEndDate.toFormat(ISO_DATETIME_NO_TZ_FORMAT)
    };
  }

  return filter;
};

export default React.memo(BillingActivityPanel);
