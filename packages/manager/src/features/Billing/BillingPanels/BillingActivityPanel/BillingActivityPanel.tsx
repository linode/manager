import {
  getInvoices,
  getPayments,
  Invoice,
  Payment
} from 'linode-js-sdk/lib/account';
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
import TableRow from 'src/components/TableRow';
import { getAll } from 'src/utilities/getAll';

const getAllInvoices = getAll<Invoice>(getInvoices);
const getAllPayments = getAll<Payment>(getPayments);

interface ActivityFeedItem {
  label: string;
  total: number;
  date: string;
  type: string;
  // type: 'payment' | 'invoice';
  id: number;
}

export const BillingActivityPanel: React.FC<{}> = props => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [combinedData, setCombinedData] = React.useState<ActivityFeedItem[]>(
    []
  );

  React.useEffect(() => {
    setLoading(true);

    Promise.all([getAllInvoices(), getAllPayments()])
      .then(([invoices, payments]) => {
        const _combinedData: ActivityFeedItem[] = [
          ...invoices.data.map(({ id, label, date, total }) => ({
            id,
            label,
            date,
            total,
            type: 'invoice'
          })),
          ...payments.data.map(({ id, date, usd }) => ({
            label: 'Payment',
            date,
            id,
            total: usd,
            type: 'payment'
          }))
        ];
        setCombinedData(_combinedData);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Typography variant="h2">Activity</Typography>
      <Paper>
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
                  <Table aria-label="List of Recent Invoices">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '17%' }}>
                          Description
                        </TableCell>
                        <TableCell style={{ width: '17%' }}>Date</TableCell>
                        <TableCell style={{ width: '17%' }}>Amount</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableContentWrapper
                        length={paginatedAndOrderedData.length}
                        loading={loading}
                        // @todo error state
                        error={[]}
                      >
                        {paginatedAndOrderedData.map((thisItem, index) => (
                          <ActivityFeedItem key={thisItem.id} {...thisItem} />
                        ))}
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
          )}
        </OrderBy>
      </Paper>
    </>
  );
};

export const ActivityFeedItem: React.FC<ActivityFeedItem> = props => {
  const { date, label, total } = props;
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell>
        <DateTimeDisplay format="YYYY-MM-DD" value={date} />
      </TableCell>
      <TableCell>
        <Currency quantity={total} />
      </TableCell>
      {/* @todo action menu */}
      <TableCell />
    </TableRow>
  );
};

export default BillingActivityPanel;
