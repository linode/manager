import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TableEditor from './TableEditor';

const linodeTableColumns = [
  { label: 'Status', id: 'linode-status', selected: true },
  { label: 'CPU', id: 'linode-cpu', selected: false },
  { label: 'RAM', id: 'linode-ram', selected: false },
  { label: 'Storage', id: 'linode-storage', selected: false },
  { label: 'IP Address', id: 'linode-ips', selected: true },
  { label: 'Last Backup', id: 'linode-backups', selected: true },
  { label: 'Region', id: 'linode-region', selected: false },
  { label: 'Tags', id: 'linode-tags', selected: true },
];

storiesOf('Table Editor', module).add('Default', () => (
  <div style={{ textAlign: 'center' }}>
    <TableEditor
      ariaLabel={'Options to edit table'}
      optionsTitle={'Display columns:'}
      options={linodeTableColumns}
    />
  </div>
));
