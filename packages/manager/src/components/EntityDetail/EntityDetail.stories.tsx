import { storiesOf } from '@storybook/react';
import * as React from 'react';
import EntityDetail from './EntityDetail';
import EntityHeader from '../EntityHeader';
import ActionMenu from 'src/components/ActionMenu';
import Chip from 'src/components/core/Chip';
import LinodeEntityDetailBody from 'src/features/linodes/LinodeEntityDetailBody';
import LinodeEntityDetailFooter from 'src/features/linodes/LinodeEntityDetailFooter';

const LinodeEntityHeader = (
  <EntityHeader
    title="My-linode-12345"
    parentLink="/linodes"
    parentText="Linodes"
    iconType="linode"
    actions={<ActionMenu ariaLabel="linode-detail" createActions={() => []} />}
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
);

const Body = (
  <LinodeEntityDetailBody
    numCPUs={2}
    gbRAM={8}
    gbStorage={160}
    distro={'Arch Linux'}
    numVolumes={2}
    region="us-east"
    ipv4={['192.168.0.0']}
    ipv6={null}
    username="linode-user"
    linodeLabel="my-linode"
    openLishConsole={() => null}
  />
);
const Footer = (
  <LinodeEntityDetailFooter
    linodeId={50091}
    linodeCreated="2020-06-12T23:43:00"
    linodeTags={[]}
  />
);

storiesOf('EntityDetail', module).add('Linode', () => (
  <div style={{ width: 1280, margin: 20 }}>
    <EntityDetail header={LinodeEntityHeader} body={Body} footer={Footer} />
  </div>
));
