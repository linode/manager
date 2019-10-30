import { storiesOf } from '@storybook/react';
import * as React from 'react';

import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';

import EditableTableRowLabel from './EditableTableRowLabel';

storiesOf('EditableTableRowLabel', module).add('default', () => (
  <Table aria-label="List of Your Images">
    <TableHead>
      <TableRow>
        <TableCell>Label</TableCell>
        <TableCell>Value</TableCell>
        <TableCell>Created</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <EditableTableRowLabel
          text="sample text"
          iconVariant="linode"
          subText="Waiting for data..."
        />
        <TableCell>Table Value</TableCell>
        <TableCell>2 days ago</TableCell>
      </TableRow>
    </TableBody>
  </Table>
));
