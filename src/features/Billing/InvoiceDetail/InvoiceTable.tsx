import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
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
  errors?: Linode.ApiFieldError[];
  items?: Linode.InvoiceItem[];
}

const InvoiceTable: React.StatelessComponent<Props> = props => {
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

const RenderData: React.StatelessComponent<{
  items: Linode.InvoiceItem[];
}> = props => {
  const { items } = props;
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
                <TableCell parentColumn="Description" data-qa-descrition>
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
                  {renderUnitPrice(unit_price)}
                </TableCell>
                <TableCell parentColumn="Amount (USD)" data-qa-amount>
                  ${amount}
                </TableCell>
                <TableCell parentColumn="Tax (USD)" data-qa-tax>
                  ${tax}
                </TableCell>
                <TableCell parentColumn="Total (USD)" data-qa-total>
                  ${total}
                </TableCell>
              </TableRow>
            )
          )}
          <TableRow>
            <TableCell
              style={{
                paddingTop: 2,
                '& div:firstChild': {
                  marginTop: 0
                }
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
        </React.Fragment>
      )}
    </Paginate>
  );
};

const RenderLoading: React.StatelessComponent<{}> = () => {
  return <TableRowLoading colSpan={8} />;
};

const RenderErrors: React.StatelessComponent<{
  errors: Linode.ApiFieldError[];
}> = props => {
  return (
    <TableRowError colSpan={8} message="Unable to retrieve invoice items." />
  );
};

const RenderEmpty: React.StatelessComponent<{}> = () => {
  return <TableRowEmptyState colSpan={8} />;
};

const MaybeRenderContent: React.StatelessComponent<{
  loading: boolean;
  errors?: Linode.ApiFieldError[];
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
