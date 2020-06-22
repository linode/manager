import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Table from 'src/components/Table';
import TableRow from 'src/components/TableRow';
import TableHead from 'src/components/core/TableHead';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/TableCell';
import TagCell from './TagCell';

const tags = [
  'tag1',
  'tag2',
  'tagwithextremelylongname',
  'tag3',
  'tag4',
  'tag5',
  'yet another tag with a very long name'
];

storiesOf('TagCell', module).add('small number of tags', () => (
  <div style={{ width: '500px', margin: 'auto' }}>
    <Table>
      <TableHead title="Tag cell story">
        <TableRow>
          <TableCell>Tags</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TagCell tags={tags} addTag={() => null} width={'500px'} />
        </TableRow>
      </TableBody>
    </Table>
  </div>
));
