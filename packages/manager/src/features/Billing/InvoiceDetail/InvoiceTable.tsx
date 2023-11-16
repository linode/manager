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
import { useRegionsQuery } from 'src/queries/regions';

import { getInvoiceRegion } from '../PdfGenerator/utils';

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
  shouldShowRegion: boolean;
}

export const InvoiceTable = (props: Props) => {
  const { classes } = useStyles();
  const MIN_PAGE_SIZE = 25;

  const {
    data: regions,
    error: regionsError,
    isLoading: regionsLoading,
  } = useRegionsQuery();

  const { errors, items, loading, shouldShowRegion } = props;
  const NUM_COLUMNS = shouldShowRegion ? 9 : 8;

  const renderTableContent = () => {
    if (loading || regionsLoading) {
      return <TableRowLoading columns={NUM_COLUMNS} />;
    }

    if (regionsError) {
      return (
        <TableRowError
          colSpan={NUM_COLUMNS}
          message="Unable to retrieve regions for this invoice."
        />
      );
    }

    if (errors) {
      return (
        <TableRowError
          colSpan={NUM_COLUMNS}
          message="Unable to retrieve invoice items."
        />
      );
    }

    if (items && items.length > 0) {
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
              {paginatedData.map((invoiceItem: InvoiceItem) => (
                <TableRow
                  key={`${invoiceItem.label}-${invoiceItem.from}-${invoiceItem.to}`}
                >
                  <TableCell data-qa-description parentColumn="Description">
                    {invoiceItem.label}
                  </TableCell>
                  <TableCell data-qa-from parentColumn="From">
                    {renderDate(invoiceItem.from)}
                  </TableCell>
                  <TableCell data-qa-to parentColumn="To">
                    {renderDate(invoiceItem.to)}
                  </TableCell>
                  <TableCell data-qa-quantity parentColumn="Quantity">
                    {renderQuantity(invoiceItem.quantity)}
                  </TableCell>
                  {shouldShowRegion && (
                    <TableCell data-qa-region parentColumn="Region">
                      {getInvoiceRegion(invoiceItem, regions ?? [])}
                    </TableCell>
                  )}
                  <TableCell data-qa-unit-price parentColumn="Unit Price">
                    {invoiceItem.unit_price !== 'None' &&
                      renderUnitPrice(invoiceItem.unit_price)}
                  </TableCell>
                  <TableCell data-qa-amount parentColumn="Amount (USD)">
                    <Currency
                      quantity={invoiceItem.amount}
                      wrapInParentheses={invoiceItem.amount < 0}
                    />
                  </TableCell>
                  <TableCell data-qa-tax parentColumn="Tax (USD)">
                    <Currency quantity={invoiceItem.tax} />
                  </TableCell>
                  <TableCell data-qa-total parentColumn="Total (USD)">
                    <Currency
                      quantity={invoiceItem.total}
                      wrapInParentheses={invoiceItem.total < 0}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {count > MIN_PAGE_SIZE && (
                <TableRow>
                  <TableCell
                    colSpan={NUM_COLUMNS}
                    sx={{ paddingLeft: '0px !important' }}
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
    }

    return <TableRowEmpty colSpan={NUM_COLUMNS} />;
  };

  return (
    <Table aria-label="Invoice Details" className={classes.table} noBorder>
      <TableHead>
        <TableRow>
          <TableCell>Description</TableCell>
          <TableCell sx={{ minWidth: '125px' }}>From</TableCell>
          <TableCell sx={{ minWidth: '125px' }}>To</TableCell>
          <TableCell>Quantity</TableCell>
          {shouldShowRegion && <TableCell>Region</TableCell>}
          <TableCell noWrap>Unit Price</TableCell>
          <TableCell>Amount (USD)</TableCell>
          <TableCell>Tax (USD)</TableCell>
          <TableCell>Total (USD)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{renderTableContent()}</TableBody>
    </Table>
  );
};

const renderDate = (v: null | string) =>
  v ? <DateTimeDisplay value={v} /> : null;

const renderQuantity = (v: null | number) => (v ? v : null);
