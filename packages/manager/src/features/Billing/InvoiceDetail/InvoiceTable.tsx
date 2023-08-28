import { InvoiceItem } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Currency } from 'src/components/Currency';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { renderUnitPrice } from 'src/features/Billing/billingUtils';
import { useFlags } from 'src/hooks/useFlags';

const useStyles = makeStyles()((theme: Theme) => ({
  table: {
    '& thead th': {
      '&:last-of-type': {
        paddingRight: 15,
      },
      borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    },
    border: `1px solid ${theme.borderColors.borderTable}`,
  },
}));

interface Props {
  errors?: APIError[];
  items?: InvoiceItem[];
  loading: boolean;
}

const InvoiceTable = (props: Props) => {
  const { classes } = useStyles();
  const flags = useFlags();

  const { errors, items, loading } = props;

  return (
    <Table aria-label="Invoice Details" className={classes.table} noBorder>
      <TableHead>
        <TableRow>
          <TableCell>Description</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Quantity</TableCell>
          {flags.dcSpecificPricing && <TableCell>Region</TableCell>}
          <TableCell noWrap>Unit Price</TableCell>
          <TableCell>Amount (USD)</TableCell>
          <TableCell>Tax (USD)</TableCell>
          <TableCell>Total (USD)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <MaybeRenderContent errors={errors} items={items} loading={loading} />
      </TableBody>
    </Table>
  );
};

const renderDate = (v: null | string) =>
  v ? <DateTimeDisplay data-qa-invoice-date value={v} /> : null;

const renderQuantity = (v: null | number) => (v ? v : null);

const RenderData = (props: { items: InvoiceItem[] }) => {
  const flags = useFlags();
  const { items } = props;

  const MIN_PAGE_SIZE = 25;

  return (
    <Paginate data={items} pageSize={25}>
      {({
        count,
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => (
        <React.Fragment>
          {paginatedData.map(
            ({
              amount,
              from,
              label,
              quantity,
              region,
              tax,
              to,
              total,
              unit_price,
            }) => (
              <TableRow key={`${label}-${from}-${to}`}>
                <TableCell data-qa-description parentColumn="Description">
                  {label}
                </TableCell>
                <TableCell data-qa-from parentColumn="From">
                  {renderDate(from)}
                </TableCell>
                <TableCell data-qa-to parentColumn="To">
                  {renderDate(to)}
                </TableCell>
                <TableCell data-qa-quantity parentColumn="Quantity">
                  {renderQuantity(quantity)}
                </TableCell>
                {flags.dcSpecificPricing && (
                  <TableCell parentColumn="Region">{region}</TableCell>
                )}
                <TableCell data-qa-unit-price parentColumn="Unit Price">
                  {unit_price !== 'None' && renderUnitPrice(unit_price)}
                </TableCell>
                <TableCell data-qa-amount parentColumn="Amount (USD)">
                  <Currency quantity={amount} wrapInParentheses={amount < 0} />
                </TableCell>
                <TableCell data-qa-tax parentColumn="Tax (USD)">
                  <Currency quantity={tax} />
                </TableCell>
                <TableCell data-qa-total parentColumn="Total (USD)">
                  <Currency quantity={total} wrapInParentheses={total < 0} />
                </TableCell>
              </TableRow>
            )
          )}
          {count > MIN_PAGE_SIZE && (
            <TableRow>
              <TableCell
                style={{
                  paddingTop: 2,
                }}
                colSpan={8}
              >
                <PaginationFooter
                  count={count}
                  eventCategory="invoice_items"
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                />
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      )}
    </Paginate>
  );
};

const MaybeRenderContent = (props: {
  errors?: APIError[];
  items?: any[];
  loading: boolean;
}) => {
  const { errors, items, loading } = props;

  if (loading) {
    return <TableRowLoading columns={8} />;
  }

  if (errors) {
    return (
      <TableRowError colSpan={8} message="Unable to retrieve invoice items." />
    );
  }

  if (items && items.length > 0) {
    return <RenderData items={items} />;
  }

  return <TableRowEmpty colSpan={8} />;
};

export default InvoiceTable;
