import { storiesOf } from '@storybook/react';
import * as React from 'react';
import EntityDetail from './EntityDetail';
import EntityHeader from '../EntityHeader';
import ActionMenu from 'src/components/ActionMenu';
import Chip from 'src/components/core/Chip';
import LinodeEntityDetailBody from 'src/features/linodes/LinodeEntityDetailBody';
import LinodeEntityDetailFooter from 'src/features/linodes/LinodeEntityDetailFooter';

const LinodeEntityHeader = (
  <div style={{ padding: '12px' }}>
    <EntityHeader
      title="My-linode-12345"
      parentLink="/linodes"
      parentText="Linodes"
      iconType="linode"
      actions={
        <ActionMenu ariaLabel="linode-detail" createActions={() => []} />
      }
      body={
        <Chip
          style={{
            backgroundColor: '#00b159',
            color: 'white',
            fontSize: '1.1 rem',
            padding: '10px'
          }}
          label={'RUNNING'}
          component="span"
          clickable={false}
        />
      }
    />
  </div>
);

const Body = (
  <LinodeEntityDetailBody
    numCPUs={2}
    gbRAM={8}
    gbStorage={160}
    distro={'Arch Linux'}
    numVolumes={2}
    region="us-east"
    ipv4={['192.168.0.0', '192.168.0.1']}
    ipv6="2600:3c00::f03c:92ff:fee2:6c40/64"
  />
);
const Footer = <LinodeEntityDetailFooter />;

storiesOf('EntityDetail', module).add('Linode', () => (
  <div style={{ padding: '12px' }}>
    <EntityDetail header={LinodeEntityHeader} body={Body} footer={Footer} />
  </div>
));
