import {
  getInvoices,
  getPayments,
  Invoice,
  Payment
} from 'linode-js-sdk/lib/account';
import { makeStyles, Theme } from 'src/components/core/styles';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import TableRow, { TableRowProps } from 'src/components/TableRow';
import { getAll } from 'src/utilities/getAll';
import { APIError } from 'linode-js-sdk/lib/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const getAllInvoices = getAll<Invoice>(getInvoices);
const getAllPayments = getAll<Payment>(getPayments);

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing()
  },
  totalColumn: {
    textAlign: 'right',
    width: '10%'
  }
}));

interface ActivityFeedItem {
  label: string;
  total: number;
  date: string;
  type: 'payment' | 'invoice';
  id: number;
}

export const BillingActivityPanel: React.FC<{}> = () => {
  const classes = useStyles();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<APIError[] | undefined>();
  const [combinedData, setCombinedData] = React.useState<ActivityFeedItem[]>(
    []
  );

  React.useEffect(() => {
    setLoading(true);

    Promise.all([getAllInvoices(), getAllPayments()])
      .then(([invoices, payments]) => {
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

  return (
    <>
      <Typography variant="h2" className={classes.header}>
        Activity
      </Typography>
      <OrderBy data={combinedData} orderBy={'date'} order={'desc'}>
        {({ data: orderedData }) => (
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
                        <TableCell style={{ width: '17%' }}>
                          Description
                        </TableCell>
                        <TableCell style={{ width: '10%' }}>Date</TableCell>
                        <TableCell className={classes.totalColumn}>
                          Amount
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableContentWrapper
                        length={paginatedAndOrderedData.length}
                        loading={loading}
                        error={error}
                      >
                        {paginatedAndOrderedData.map(thisItem => (
                          <ActivityFeedItem key={thisItem.id} {...thisItem} />
                        ))}
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
        )}
      </OrderBy>
    </>
  );
};

export const ActivityFeedItem: React.FC<ActivityFeedItem> = React.memo(
  props => {
    const classes = useStyles();

    const { date, label, total, id, type } = props;

    const rowProps: TableRowProps = {};
    if (type === 'invoice') {
      rowProps.rowLink = `/account/billing/invoices/${id}`;
    }

    return (
      <TableRow {...rowProps}>
        <TableCell>{label}</TableCell>
        <TableCell>
          <DateTimeDisplay format="YYYY-MM-DD" value={date} />
        </TableCell>
        <TableCell className={classes.totalColumn}>
          <Currency quantity={total} wrapInParentheses={total < 0} />
        </TableCell>
        {/* @todo icon */}
        <TableCell />
      </TableRow>
    );
  }
);

export default React.memo(BillingActivityPanel);

// =============================================================================
// Utilities
// =============================================================================
export const invoiceToActivityFeedItem = (
  invoice: Invoice
): ActivityFeedItem => {
  const { id, label, date, total } = invoice;

  // Negative invoice totals are effectively credits, so replace the label.
  const adjustedLabel = total < 0 ? label.replace('Invoice', 'Credit') : label;

  return {
    id,
    label: adjustedLabel,
    date,
    total,
    type: 'invoice'
  };
};

export const paymentToActivityFeedItem = (
  payment: Payment
): ActivityFeedItem => {
  const { date, id, usd } = payment;

  // Negative payments are effectively credits.
  const label = usd < 0 ? 'Credit' : 'Payment';

  // We always want Payments (and negative Payments, i.e. Credits) to appear as a negative number.
  // The delineation between these two types comes from the label ("Credit" or "Payment").
  const total = usd > 0 ? -usd : usd;

  return {
    label,
    date,
    id,
    total,
    type: 'payment'
  };
};
