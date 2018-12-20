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

interface Props {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  items?: any[];
}

const InvoiceTable: React.StatelessComponent<Props> = (props) => {
  const { loading, errors, items } = props;
  return (
    <Table border aria-label="Invoice Details">
      <TableHead>
        <TableRow>
          <TableCell>Description</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell noWrap>Unit Price</TableCell>
          <TableCell>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <MaybeRenderContent loading={loading} errors={errors} items={items} />
      </TableBody>
    </Table>
  );
};

const renderDate = (v: null | string) => v ? <DateTimeDisplay value={v} format={`Y-MM-DD HH:mm:ss`} /> : null;

const renderUnitPrice = (v: null | number) => v ? `$${v}` : null;

const renderQuantity = (v: null | number) => v ? v : null;

const RenderData: React.StatelessComponent<{ items: Linode.InvoiceItem[] }> = (props) => {
  const { items } = props;
  return (
    <>
      {items.map(({ label, from, to, quantity, unit_price, amount }) => (
        <TableRow key={`${label}-${from}-${to}`}>
          <TableCell parentColumn="Description">{label}</TableCell>
          <TableCell parentColumn="From">{renderDate(from)}</TableCell>
          <TableCell parentColumn="To">{renderDate(to)}</TableCell>
          <TableCell parentColumn="Quantity">{renderQuantity(quantity)}</TableCell>
          <TableCell parentColumn="Unit Price">{renderUnitPrice(unit_price)}</TableCell>
          <TableCell parentColumn="Amount">${amount}</TableCell>
        </TableRow>
      ))}
    </>
  );
};

const RenderLoading: React.StatelessComponent<{}> = () => {
  return (
    <TableRowLoading colSpan={6} />
  );
};

const RenderErrors: React.StatelessComponent<{ errors: Linode.ApiFieldError[] }> = (props) => {
  return (
    <TableRowError colSpan={6} message="Unable to retrieve invoice items." />
  );

};

const RenderEmpty: React.StatelessComponent<{}> = () => {
  return (
    <TableRowEmptyState colSpan={6} />
  );
};

const MaybeRenderContent: React.StatelessComponent<{ loading: boolean; errors?: Linode.ApiFieldError[]; items?: any[]; }> = (props) => {
  const { loading, errors, items } = props

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
