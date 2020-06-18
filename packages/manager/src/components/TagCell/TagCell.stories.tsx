import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Table from 'src/components/core/Table';
import TableRow from 'src/components/TableRow';
import TableHeader from 'src/components/TableHeader';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/TableCell';
import TagCell from './TagCell';

storiesOf('TagCell', module)
  .add('small number of tags', () => (
    <div style={{ width: '50%', margin: 'auto' }}>
      <Table>
        <TableHeader title="Tag cell story">
          <TableRow>
            {' '}
            <TableCell style={{ width: '500px' }}>Tags</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TagCell tags={['tag1', 'tag2']} addTag={() => null} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ))
  .add('large number of tags', () => (
    <div style={{ width: '50%', margin: 'auto' }}>
      <Table>
        <Table>
          <TableHeader title="Tag cell story">
            <TableRow>
              {' '}
              <TableCell>Tags</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TagCell tags={['tag1', 'tag2']} addTag={() => null} />
            </TableRow>
          </TableBody>
        </Table>
      </Table>
    </div>
  ));
