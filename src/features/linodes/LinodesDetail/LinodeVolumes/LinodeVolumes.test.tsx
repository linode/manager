import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter } from 'react-router';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
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
    expect(component.find('WithStyles(VolumeDrawer)')).toHaveLength(1);
  });

  it('should display placeholder if Linode has no configurations.', () => {
    const component = mount(
      <StaticRouter context={{}}>
        <LinodeThemeWrapper>
          <LinodeVolumes
            classes={{ title: '' }}
            volumes={volumesAsPromiseResponse}
            linodeConfigs={createPromiseLoaderResponse([])}
            linodeVolumes={[]}
            linodeLabel="test"
            linodeRegion="us-east"
            linodeID={100}
          />
        </LinodeThemeWrapper>
      </StaticRouter>
    );
    const noConfigsMessage = component.find(`Typography[data-qa-placeholder-title]`);
    expect(noConfigsMessage.text()).toBe('No configs available')
  });
});
