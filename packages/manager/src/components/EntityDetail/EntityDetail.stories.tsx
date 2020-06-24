import { storiesOf } from '@storybook/react';
import * as React from 'react';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import { linodeFactory } from 'src/factories/linodes';

storiesOf('EntityDetail', module).add('Linode', () => (
  <div style={{ width: 1280, margin: 20 }}>
    <LinodeEntityDetail
      linode={linodeFactory.build()}
      distro={'Debian 10'}
      numVolumes={2}
      username="linode-user"
      openLishConsole={() => null}
    />
  </div>
));
