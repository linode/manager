import { storiesOf } from '@storybook/react';
import * as React from 'react';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import { linodeFactory } from 'src/factories/linodes';
import { Provider } from 'react-redux';
import store from 'src/store';

storiesOf('EntityDetail', module).add('Linode', () => (
  <Provider store={store}>
    <div style={{ width: 1280, margin: 20 }}>
      <LinodeEntityDetail
        linode={linodeFactory.build()}
        numVolumes={2}
        username="linode-user"
        openLishConsole={() => null}
      />
    </div>
  </Provider>
));
