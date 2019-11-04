import { storiesOf } from '@storybook/react';
import * as React from 'react';

import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';

import EditableTableRowLabel from './EditableTableRowLabel';

storiesOf('EditableTableRowLabel', module)
  .add('default', () => {
    const [text, setText] = React.useState<string>('sample text');
    const [loading, setLoading] = React.useState<boolean>(false);

    const onEdit = (s: string) => {
      return new Promise((resolve, reject) => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          resolve(setText(s));
        }, 3000);
      });
    };

    return (
      <Table>
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
              text={text}
              iconVariant="linode"
              subText="Waiting for data..."
              onEdit={onEdit}
              loading={loading}
            />
            <TableCell>Table Value</TableCell>
            <TableCell>2 days ago</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  })
  .add('with error', () => {
    const [loading, setLoading] = React.useState<boolean>(false);

    const onEdit = (s: string) => {
      return new Promise((resolve, reject) => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          reject('An error occurred!');
        }, 3000);
      });
    };

    return (
      <Table>
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
              text={'demo text'}
              iconVariant="linode"
              subText="Waiting for data..."
              onEdit={onEdit}
              loading={loading}
            />
            <TableCell>Table Value</TableCell>
            <TableCell>2 days ago</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  });
