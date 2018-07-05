import { shallow } from 'enzyme';
import * as React from 'react';

import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

import { linodeConfigs } from 'src/__data__/linodeConfigs';
import { volumes } from 'src/__data__/volumes';

import { LinodeVolumes } from './LinodeVolumes';

describe('Linode Volumes', () => {
  const linodeConfigsAsPromiseResponse = createPromiseLoaderResponse(linodeConfigs);
  const volumesAsPromiseResponse = createPromiseLoaderResponse(volumes);

  const component = shallow(
    <LinodeVolumes
      classes={{ title: '' }}
      volumes={volumesAsPromiseResponse}
      linodeConfigs={linodeConfigsAsPromiseResponse}
      linodeVolumes={volumes}
      linodeLabel="test"
      linodeRegion="us-east"
      linodeID={100}
    />
  )
  it('should render Update Volume Drawer', () => {
    expect(component.find('WithStyles(UpdateVolumeDrawer)')).toHaveLength(1);
  });
});