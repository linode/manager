import { shallow } from 'enzyme';
import * as React from 'react';

import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

import { linodeConfigs } from 'src/__data__/linodeConfigs';
import { volumes } from 'src/__data__/volumes';

import { LinodeVolumes } from './LinodeVolumes';

describe('Linode Volumes', () => {
  const linodeConfigsAsPromiseResponse = createPromiseLoaderResponse(linodeConfigs);
  const volumesAsPromiseResponse = createPromiseLoaderResponse(volumes);

  const mockLocation = {
    pathname: 'localhost',
    search: 'search',
    state: 'hello',
    hash: 'hash',
  }

  const component = shallow(
    <LinodeVolumes
      classes={{ title: '' }}
      volumes={volumesAsPromiseResponse}
      linodeConfigs={linodeConfigsAsPromiseResponse}
      linodeVolumes={volumes}
      linodeLabel="test"
      linodeRegion="us-east"
      linodeID={100}
      history={{
        length: 2,
        action: 'PUSH',
        location: mockLocation,
        push: jest.fn(),
        replace: jest.fn(),
        go: jest.fn(),
        goBack: jest.fn(),
        goForward: jest.fn(),
        block: jest.fn(),
        listen: jest.fn(),
        createHref: jest.fn(),
      }}
      location={mockLocation}
      match={{
        params: 'test',
        isExact: false,
        path: 'localhost',
        url: 'localhost'
      }}
      staticContext={undefined}
    />
  )
  it('should render Update Volume Drawer', () => {
    expect(component.find('WithStyles(UpdateVolumeDrawer)')).toHaveLength(1);
  });
});