import * as React from 'react';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import { linodeFactory, linodeBackupsFactory } from 'src/factories/linodes';
import { Provider } from 'react-redux';
import store from 'src/store';
import { linodeConfigFactory } from 'src/factories/linodeConfigs';

export default {
  title: 'EntityDetail',
};

export const Linode = () => (
  <Provider store={store}>
    <div style={{ width: 1280, margin: 20 }}>
      <h2>Linode Details:</h2>
      <LinodeEntityDetail
        variant="details"
        numVolumes={2}
        id={0}
        linode={linodeFactory.build()}
        username="linode-user"
        openTagDrawer={() => null}
        openDialog={() => null}
        openPowerActionDialog={() => null}
        backups={linodeBackupsFactory.build()}
        linodeConfigs={linodeConfigFactory.buildList(2)}
      />
    </div>
    <div style={{ width: 1280, margin: 20 }}>
      <h2 style={{ marginTop: 60 }}>Dashboard/Linodes Landing</h2>
      <LinodeEntityDetail
        variant="landing"
        numVolumes={2}
        id={0}
        linode={linodeFactory.build()}
        username="linode-user"
        openTagDrawer={() => null}
        openDialog={() => null}
        openPowerActionDialog={() => null}
        backups={linodeBackupsFactory.build()}
        linodeConfigs={linodeConfigFactory.buildList(2)}
      />
    </div>
  </Provider>
);
