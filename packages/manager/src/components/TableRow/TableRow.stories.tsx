import { storiesOf } from '@storybook/react';
import * as React from 'react';
import LinodeRowHeadCell from 'src/features/linodes/LinodesLanding/LinodeRow/LinodeRowHeadCell';
import TableCell_CMR from '../TableCell/TableCell_CMR';
import TableRow_CMR from './TableRow_CMR';

const linodeBackups = {
  enabled: false,
  schedule: {
    window: null,
    day: null
  },
  last_successful: null
};

storiesOf('TableRow', module).add('CMR', () => (
  <div>
    <TableRow_CMR>
      <LinodeRowHeadCell
        loading={false}
        recentEvent={undefined}
        backups={linodeBackups}
        id={0}
        type={null}
        ipv4={[]}
        ipv6={''}
        label={'Label'}
        region={''}
        status="running"
        displayStatus="running"
        tags={[]}
        mostRecentBackup={null}
        disk={0}
        vcpus={0}
        memory={0}
        image={null}
        maintenance={undefined}
      />
      <TableCell_CMR>Label</TableCell_CMR>
    </TableRow_CMR>
  </div>
));
