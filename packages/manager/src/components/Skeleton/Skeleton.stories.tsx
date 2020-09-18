import { storiesOf } from '@storybook/react';
import * as React from 'react';

import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Table from 'src/components/Table';
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

storiesOf('Skeleton', module)
  .add('Default Table ', () => (
    <Table>
      {renderTableHead()}
      <TableBody>
        <TableRowLoading colSpan={4} />
      </TableBody>
    </Table>
  ))
  .add('Table with first col width defined', () => (
    <Table>
      {renderTableHead(40, 20, 20, 20)}
      <TableBody>
        <TableRowLoading colSpan={4} widths={[40, 20, 20, 20]} />
      </TableBody>
    </Table>
  ))
  .add('Table with first col width defined, one line skeleton', () => (
    <Table>
      {renderTableHead(40, 20, 20, 20)}
      <TableBody>
        <TableRowLoading colSpan={4} widths={[40, 20, 20, 20]} oneLine />
      </TableBody>
    </Table>
  ))
  .add(
    'Table with first col width defined, one line skeleton and entity icon',
    () => (
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
    )
  );
