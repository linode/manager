import { storiesOf } from '@storybook/react';
import * as React from 'react';

import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ThemeDecorator from 'src/utilities/storybookDecorators';

import TableWrapper from './Table';

storiesOf('Table', module)
  .addDecorator(ThemeDecorator)
  .add('default', () => (
    <TableWrapper>
      <TableHead data-qa-table>
        <TableRow>
          <TableCell style={{ width: '33%' }} data-qa-column-heading>Head-1-1</TableCell>
          <TableCell style={{ width: '33%' }} data-qa-column-heading>Head-1-2</TableCell>
          <TableCell style={{ width: '33%' }} data-qa-column-heading>Head-1-3</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow data-qa-table-row>
          <TableCell data-qa-table-cell>Col-1-1</TableCell>
          <TableCell data-qa-table-cell>
            Col-1-2 content with a long, unbreakable token slkjdhgf7890LKAJhsf7890234567q23ghjkjhg
          </TableCell>
          <TableCell data-qa-table-cell>Col-1-3</TableCell>
        </TableRow>
        <TableRow data-qa-table-row>
          <TableCell data-qa-table-cell>Col-2-1</TableCell>
          <TableCell data-qa-table-cell>Col-2-2</TableCell>
          <TableCell data-qa-table-cell>Col-2-3</TableCell>
        </TableRow>
        <TableRow data-qa-table-row>
          <TableCell data-qa-table-cell>Col-3-1</TableCell>
          <TableCell data-qa-table-cell>Col-3-2</TableCell>
          <TableCell data-qa-table-cell>Col-3-3</TableCell>
        </TableRow>
      </TableBody>
    </TableWrapper>
));
