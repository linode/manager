import {
  getInvoiceItems,
  getInvoices,
  getPayments,
  Invoice,
  InvoiceItem,
  Payment
} from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as moment from 'moment';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
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
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import TableRow, { TableRowProps } from 'src/components/TableRow';
import { ISO_FORMAT } from 'src/constants';
import {
  printInvoice,
  printPayment
} from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { useAccount } from 'src/hooks/useAccount';
import useFlags from 'src/hooks/useFlags';
import { isAfter } from 'src/utilities/date';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { getTaxID } from '../RecentPaymentsPanel/RecentPaymentsPanel';

const useStyles = makeStyles((theme: Theme) => ({
  headerContainer: {
    marginBottom: theme.spacing() - 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },
  flexContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
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
    width: '17%'
  },
  dateColumn: {
    width: '10%'
  },
  totalColumn: {
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
      width: '10%'
    }
  },
  pdfDownloadColumn: {
    textAlign: 'right'
  },
  pdfDownloadButton: {
    border: 'none',
    backgroundColor: 'inherit',
    cursor: 'pointer',
    color: theme.palette.primary.main,
    padding: 0,
    font: 'inherit',
    '&:hover': {
      textDecoration: 'underline'
    }
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

const PDFError = 'There was an error generating this PDF.';
const defaultDateRange: DateRange = '6 Months';

// =============================================================================
// <BillingActivityPanel />
// =============================================================================
export const BillingActivityPanel: React.FC<{}> = () => {
  const classes = useStyles();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>();
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [combinedData, setCombinedData] = React.useState<ActivityFeedItem[]>(
    []
  );

  const [earliestInvoiceDate, setEarliestInvoiceDate] = React.useState<string>(
    new Date().toISOString()
  );
  const [earliestPaymentDate, setEarliestPaymentDate] = React.useState<string>(
    new Date().toISOString()
  );

  const [selectedTransactionType, setSelectedTransactionType] = React.useState<
    TransactionTypes
  >('all');

  const [selectedTransactionDate, setSelectedTransactionDate] = React.useState<
    DateRange
  >(defaultDateRange);

  const makeRequest = React.useCallback((endDate?: string) => {
    const filter = makeFilter(endDate);

    setLoading(true);

    Promise.all([getAllInvoices({}, filter), getAllPayments({}, filter)])
      .then(([invoices, payments]) => {
        setInvoices(invoices.data);
        setPayments(payments.data);
        // Keep track of earliest Invoice date for reference when the user changes date ranges.
        if (invoices.data.length > 0) {
          setEarliestInvoiceDate(invoices.data[invoices.data.length - 1].date);
        }

        // Keep track of earliest Payment date for reference when the user changes date ranges.
        if (payments.data.length > 0) {
          setEarliestPaymentDate(payments.data[payments.data.length - 1].date);
        }

        const _combinedData: ActivityFeedItem[] = [
          ...invoices.data.map(invoiceToActivityFeedItem),
          ...payments.data.map(paymentToActivityFeedItem)
        ];
        setCombinedData(_combinedData);
        setLoading(false);
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
  }, []);

  const flags = useFlags();
  const { account } = useAccount();

  const [invoicePDFErrors, setInvoicePDFErrors] = React.useState<Set<number>>(
    new Set<number>()
  );
  const [invoicePDFLoading, setInvoicePDFLoading] = React.useState<Set<number>>(
    new Set<number>()
  );
  const [paymentPDFErrors, setPaymentPDFErrors] = React.useState<Set<number>>(
    new Set<number>()
  );

  const downloadInvoicePDF = React.useCallback(
    (invoiceId: number) => {
      const invoice = invoices.find(
        thisInvoice => thisInvoice.id === invoiceId
      );
      if (!account.data || !invoice) {
        setInvoicePDFErrors(prevInvoicePDFErrors => {
          prevInvoicePDFErrors.add(invoiceId);
          return prevInvoicePDFErrors;
        });
        return;
      }

      setInvoicePDFErrors(prevInvoicePDFErrors => {
        prevInvoicePDFErrors.delete(invoiceId);
        return prevInvoicePDFErrors;
      });
      setInvoicePDFLoading(prevInvoicePDFLoading => {
        return new Set(prevInvoicePDFLoading).add(invoiceId);
      });

      getAll<InvoiceItem>((params, filter) =>
        getInvoiceItems(invoiceId, params, filter)
      )()
        .then(response => {
          const invoiceItems = response.data;
          const result = printInvoice(
            account.data!,
            invoice,
            invoiceItems,
            flags.taxBanner
          );
          setInvoicePDFLoading(prevInvoicePDFLoading => {
            const newSet = new Set(prevInvoicePDFLoading);
            newSet.delete(invoiceId);
            return newSet;
          });

          if (result.status === 'error') {
            setInvoicePDFErrors(prevInvoicePDFErrors => {
              prevInvoicePDFErrors.add(invoiceId);
              return prevInvoicePDFErrors;
            });
          }
        })
        .catch(e => {
          // setPDFError(e);
          // setIsDownloadingPDF(false);
        });
    },
    [account.data, flags.taxBanner, invoices]
  );

  const downloadPaymentPDF = React.useCallback(
    (paymentId: number) => {
      const payment = payments.find(
        thisPayment => thisPayment.id === paymentId
      );
      if (!account.data || !payment) {
        setPaymentPDFErrors(prevPaymentPDFErrors => {
          prevPaymentPDFErrors.add(paymentId);
          return prevPaymentPDFErrors;
        });
        return;
      }

      setPaymentPDFErrors(prevPaymentPDFErrors => {
        prevPaymentPDFErrors.delete(paymentId);
        return prevPaymentPDFErrors;
      });

      const taxBanner = flags.taxBanner;
      const taxId = getTaxID(
        payment.date,
        taxBanner?.date,
        taxBanner?.linode_tax_id
      );
      const result = printPayment(account.data, payment, taxId);

      if (result.status === 'error') {
        setPaymentPDFErrors(prevPaymentPDFErrors => {
          prevPaymentPDFErrors.add(paymentId);
          return prevPaymentPDFErrors;
        });
      }
    },
    [payments, flags.taxBanner, account.data]
  );
  React.useEffect(() => {
    const defaultDateCutoff = getCutoffFromDateRange(defaultDateRange);
    makeRequest(defaultDateCutoff);
  }, [makeRequest]);

  // Handlers for <Select /> components.
  const handleTransactionTypeChange = React.useCallback(
    (item: Item<TransactionTypes>) => {
      setSelectedTransactionType(item.value);
    },
    []
  );
  const handleTransactionDateChange = React.useCallback(
    (item: Item<DateRange>) => {
      setSelectedTransactionDate(item.value);

      const dateCutoff = getCutoffFromDateRange(item.value);

      // If the data we already have falls within the selected date range,
      // no need to request more data.
      if (
        isAfter(dateCutoff, earliestInvoiceDate) &&
        isAfter(dateCutoff, earliestPaymentDate)
      ) {
        return;
      }

      makeRequest(dateCutoff);
    },
    [makeRequest, earliestInvoiceDate, earliestPaymentDate]
  );

  // Values for <Select />  components.
  const transactionTypeValue = React.useMemo(
    () =>
      transactionTypeOptions.find(
        thisOption => thisOption.value === selectedTransactionType
      ) || null,
    [selectedTransactionType]
  );
  const transactionDateValue = React.useMemo(
    () =>
      transactionDateOptions.find(
        thisOption => thisOption.value === selectedTransactionDate
      ) || null,
    [selectedTransactionDate]
  );

  // This is the OrderBy render props function. It's wrapped in React.useCallback because otherwise
  // it would be re-created on every render, which was causing a lot of lagging on an account with
  // many invoices. @todo: Re-think how we use the OrderBy and Paginate combo in other components.
  const billingActivityPanel = React.useCallback(
    ({ data: orderedData }) => (
      <Paginate pageSize={25} data={orderedData}>
        {({
          data: paginatedAndOrderedData,
          count,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize
        }) => (
          <>
            <Paper>
              <Table aria-label="List of Invoices and Payments">
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.descriptionColumn}>
                      Description
                    </TableCell>
                    <TableCell className={classes.dateColumn}>Date</TableCell>
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
                          hasPDFError={
                            thisItem.type === 'invoice'
                              ? invoicePDFErrors.has(thisItem.id)
                              : paymentPDFErrors.has(thisItem.id)
                          }
                          isLoading={
                            thisItem.type === 'invoice'
                              ? invoicePDFLoading.has(thisItem.id)
                              : false
                          }
                          {...thisItem}
                        />
                      );
                    })}
                  </TableContentWrapper>
                </TableBody>
              </Table>
            </Paper>
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
      invoicePDFErrors,
      invoicePDFLoading,
      paymentPDFErrors
    ]
  );

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
        <Typography variant="h2">Billing & Payment History</Typography>
        <div className={classes.headerRight}>
          <div className={classes.flexContainer}>
            <Select
              className={classes.transactionType}
              label="Transaction Types"
              onChange={handleTransactionTypeChange}
              value={transactionTypeValue}
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
              value={transactionDateValue}
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
        {billingActivityPanel}
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

    const rowProps: TableRowProps = {};
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

    return (
      <TableRow {...rowProps} data-testid={`${type}-${id}`}>
        <TableCell parentColumn="Description">{label}</TableCell>
        <TableCell parentColumn="Date">
          <DateTimeDisplay format="YYYY-MM-DD" value={date} />
        </TableCell>
        <TableCell parentColumn="Amount" className={classes.totalColumn}>
          <Currency quantity={total} wrapInParentheses={total < 0} />
        </TableCell>
        <TableCell className={classes.pdfDownloadColumn}>
          {isLoading ? (
            <CircleProgress mini />
          ) : (
            <button className={classes.pdfDownloadButton} onClick={handleClick}>
              Download PDF
            </button>
          )}
        </TableCell>
      </TableRow>
    );
  }
);

export default React.memo(BillingActivityPanel);

// =============================================================================
// Utilities
// =============================================================================
const getAllInvoices = getAll<Invoice>(getInvoices);
const getAllPayments = getAll<Payment>(getPayments);

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
  const label = usd < 0 ? 'Refund to Card' : 'Payment';

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

export const getCutoffFromDateRange = (
  range: DateRange,
  currentDatetime?: string
) => {
  const date = currentDatetime ? moment.utc(currentDatetime) : moment.utc();

  let outputDate: moment.Moment;
  switch (range) {
    case '30 Days':
      outputDate = date.subtract(30, 'days');
      break;
    case '60 Days':
      outputDate = date.subtract(60, 'days');
      break;
    case '90 Days':
      outputDate = date.subtract(90, 'days');
      break;
    case '6 Months':
      outputDate = date.subtract(6, 'months');
      break;
    case '12 Months':
      outputDate = date.subtract(12, 'months');
      break;
    default:
      outputDate = moment.utc('1970-01-01T00:00:00.000');
      break;
  }

  return outputDate.format(ISO_FORMAT);
};

export const makeFilter = (endDate?: string) => {
  const filter: any = {
    '+order_by': 'date',
    '+order': 'desc'
  };

  if (endDate) {
    filter.date = { '+gte': moment.utc(endDate).format(ISO_FORMAT) };
  }

  return filter;
};
