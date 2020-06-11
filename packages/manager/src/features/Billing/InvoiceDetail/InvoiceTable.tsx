import { InvoiceItem } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';

interface Props {
  loading: boolean;
  errors?: APIError[];
  items?: InvoiceItem[];
}

const InvoiceTable: React.FC<Props> = props => {
  const { loading, errors, items } = props;

  return (
    <Table border aria-label="Invoice Details">
      <TableHead>
        <TableRow>
          <TableCell data-qa-column="Description">Description</TableCell>
          <TableCell data-qa-column="From">From</TableCell>
          <TableCell data-qa-column="To">To</TableCell>
          <TableCell data-qa-column="Quantity">Quantity</TableCell>
          <TableCell noWrap data-qa-column="Unit Price">
            Unit Price
          </TableCell>
          <TableCell data-qa-column="Amount">Amount (USD)</TableCell>
          <TableCell data-qa-column="Taxes">Tax (USD)</TableCell>
          <TableCell data-qa-column="Total">Total (USD)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <MaybeRenderContent loading={loading} errors={errors} items={items} />
      </TableBody>
    </Table>
  );
};

const renderDate = (v: null | string) =>
  v ? (
    <DateTimeDisplay
      value={v}
      format={`Y-MM-DD HH:mm:ss`}
      data-qa-invoice-date
    />
  ) : null;

const renderUnitPrice = (v: null | number) => (v ? `$${v}` : null);

const renderQuantity = (v: null | number) => (v ? v : null);

const RenderData: React.FC<{
  items: InvoiceItem[];
}> = props => {
  const { items } = props;

  const MIN_PAGE_SIZE = 25;

  return (
    <Paginate data={items} pageSize={25}>
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize
      }) => (
        <React.Fragment>
          {paginatedData.map(
            ({ label, from, to, quantity, unit_price, amount, tax, total }) => (
              <TableRow key={`${label}-${from}-${to}`}>
                <TableCell parentColumn="Description" data-qa-description>
                  {label}
                </TableCell>
                <TableCell parentColumn="From" data-qa-from>
                  {renderDate(from)}
                </TableCell>
                <TableCell parentColumn="To" data-qa-to>
                  {renderDate(to)}
                </TableCell>
                <TableCell parentColumn="Quantity" data-qa-quantity>
                  {renderQuantity(quantity)}
                </TableCell>
                <TableCell parentColumn="Unit Price" data-qa-unit-price>
                  {unit_price !== 'None' && renderUnitPrice(unit_price)}
                </TableCell>
                <TableCell parentColumn="Amount (USD)" data-qa-amount>
                  <Currency wrapInParentheses={amount < 0} quantity={amount} />
                </TableCell>
                <TableCell parentColumn="Tax (USD)" data-qa-tax>
                  <Currency quantity={tax} />
                </TableCell>
                <TableCell parentColumn="Total (USD)" data-qa-total>
                  <Currency wrapInParentheses={total < 0} quantity={total} />
                </TableCell>
              </TableRow>
            )
          )}
          {count > MIN_PAGE_SIZE && (
            <TableRow>
              <TableCell
                style={{
                  paddingTop: 2
                }}
                colSpan={8}
              >
                <PaginationFooter
                  eventCategory="invoice_items"
                  count={count}
                  page={page}
                  pageSize={pageSize}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                />
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      )}
    </Paginate>
  );
};

const RenderLoading: React.FC<{}> = () => {
  return <TableRowLoading colSpan={8} />;
};

const RenderErrors: React.FC<{
  errors: APIError[];
}> = props => {
  return (
    <TableRowError colSpan={8} message="Unable to retrieve invoice items." />
  );
};

const RenderEmpty: React.FC<{}> = () => {
  return <TableRowEmptyState colSpan={8} />;
};

const MaybeRenderContent: React.FC<{
  loading: boolean;
  errors?: APIError[];
  items?: any[];
}> = props => {
  const { loading, errors, items } = props;

  if (loading) {
    return <RenderLoading />;
  }

  if (errors) {
    return <RenderErrors errors={errors} />;
  }

  if (items && items.length > 0) {
    return <RenderData items={items} />;
  }

  return <RenderEmpty />;
};

export default InvoiceTable;
