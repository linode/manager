import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowLoading from 'src/components/TableRowLoading';

const renderTableHead = (
  w1?: number,
  w2?: number,
  w3?: number,
  w4?: number
) => (
  <TableHead>
    <TableRow>
      <TableCell style={{ width: w1 ? `${w1}%` : '25%' }}>Label</TableCell>
      <TableCell style={{ width: w2 ? `${w2}%` : '25%' }}>Status</TableCell>
      <TableCell style={{ width: w3 ? `${w3}%` : '25%' }}>Date</TableCell>
      <TableCell style={{ width: w4 ? `${w4}%` : '25%' }}>What up?</TableCell>
    </TableRow>
  </TableHead>
);

export default {
  title: 'Skeleton',
};

export const DefaultTable = () => (
  <Table>
    {renderTableHead(40, 20, 20, 20)}
    <TableBody>
      <TableRowLoading colSpan={4} widths={[40, 20, 20, 20]} />
    </TableBody>
  </Table>
);

DefaultTable.story = {
  name: 'Default Table ',
};

export const TableWithWidthsDefinedForAllColumns = () => (
  <Table>
    {renderTableHead(40, 20, 20, 20)}
    <TableBody>
      <TableRowLoading colSpan={4} widths={[40, 20, 20, 20]} />
    </TableBody>
  </Table>
);

TableWithWidthsDefinedForAllColumns.story = {
  name: 'Table with widths defined for all columns',
};

export const TableWithSomeWidthsDefinedTableHeaderIsFullyDefined = () => (
  <Table>
    {renderTableHead(40, 35, 12.5, 12.5)}
    <TableBody>
      <TableRowLoading colSpan={4} widths={[40, 35]} />
    </TableBody>
  </Table>
);

TableWithSomeWidthsDefinedTableHeaderIsFullyDefined.story = {
  name: 'Table with some widths defined (table header is fully defined)',
};

export const TableWithNoWidthsDefined = () => (
  <Table>
    {renderTableHead()}
    <TableBody>
      <TableRowLoading colSpan={4} />
    </TableBody>
  </Table>
);

TableWithNoWidthsDefined.story = {
  name: 'Table with no widths defined',
};

export const TableWithWidthsDefinedForAllColumnsOneLineSkeleton = () => (
  <Table>
    {renderTableHead(40, 20, 20, 20)}
    <TableBody>
      <TableRowLoading colSpan={4} widths={[40, 20, 20, 20]} oneLine />
    </TableBody>
  </Table>
);

TableWithWidthsDefinedForAllColumnsOneLineSkeleton.story = {
  name: 'Table with widths defined for all columns, one line skeleton',
};

export const TableWithWidthsDefinedForAllColumnsOneLineSkeletonAndEntityIcon = () => (
  <Table>
    {renderTableHead(40, 20, 20, 20)}
    <TableBody>
      <TableRowLoading
        colSpan={4}
        widths={[40, 20, 20, 20]}
        oneLine
        hasEntityIcon
      />
    </TableBody>
  </Table>
);

TableWithWidthsDefinedForAllColumnsOneLineSkeletonAndEntityIcon.story = {
  name:
    'Table with widths defined for all columns, one line skeleton and entity icon',
};
