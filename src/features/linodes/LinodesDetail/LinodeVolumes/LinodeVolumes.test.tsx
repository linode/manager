import { mount, ReactWrapper, shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter } from 'react-router';

import { linodeConfigs } from 'src/__data__/linodeConfigs';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { volumes } from 'src/__data__/volumes';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

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
      updateVolumes={jest.fn()}
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
    expect(component.find('WithStyles(VolumeDrawer)')).toHaveLength(1);
  });

  it('should display placeholder if Linode has no configurations.', () => {
    const component = mount(
      <StaticRouter context={{}}>
        <LinodeThemeWrapper>
          <LinodeVolumes
            updateVolumes={jest.fn()}
            classes={{ title: '' }}
            volumes={volumesAsPromiseResponse}
            linodeConfigs={createPromiseLoaderResponse([])}
            linodeVolumes={[]}
            linodeLabel="test"
            linodeRegion="us-east"
            linodeID={100}
            {...reactRouterProps}
          />
        </LinodeThemeWrapper>
      </StaticRouter>
    );
    const noConfigsMessage = component.find(`Typography[data-qa-placeholder-title]`);

    expect(noConfigsMessage.text()).toBe('No configs available')
  });

  it('should display placeholder if Linode has no attached volumes.', () => {
    const component = mount(
      <StaticRouter context={{}}>
        <LinodeThemeWrapper>
          <LinodeVolumes
            updateVolumes={jest.fn()}
            classes={{ title: '' }}
            volumes={volumesAsPromiseResponse}
            linodeConfigs={linodeConfigsAsPromiseResponse}
            linodeVolumes={[]}
            linodeLabel="test"
            linodeRegion="us-east"
            linodeID={100}
            {...reactRouterProps}
          />
        </LinodeThemeWrapper>
      </StaticRouter>
    );
    const noConfigsMessage = component.find(`Typography[data-qa-placeholder-title]`);

    expect(noConfigsMessage.text()).toBe('No volumes found')
  });

  describe('Table', () => {
    let wrapper: ReactWrapper;

    beforeAll(() => {
      wrapper = mount(
        <StaticRouter context={{}}>
          <LinodeThemeWrapper>
            <LinodeVolumes
              updateVolumes={jest.fn()}
              classes={{ title: '' }}
              volumes={volumesAsPromiseResponse}
              linodeConfigs={linodeConfigsAsPromiseResponse}
              linodeVolumes={volumes}
              linodeLabel="test"
              linodeRegion="us-east"
              linodeID={100}
              {...reactRouterProps}
            />
          </LinodeThemeWrapper>
        </StaticRouter>
      );
    });

    it('should render table', () => {
      const volumesTable = wrapper.find('Table');
      const volumesTableHead = wrapper.find('TableHead TableCell');

      expect(volumesTable.length).toBe(1);
      expect(volumesTableHead.at(0).text()).toBe('Label')
      expect(volumesTableHead.at(1).text()).toBe('Size')
      expect(volumesTableHead.at(2).text()).toBe('File System Path')
    });

    it('should render Add a Volume link', () => {
      const iconTextLink = wrapper.find('IconTextLink');
      expect(iconTextLink.length).toBe(1);
    });

    it('should render a row for each volume', () => {
      volumes.forEach((v) => {
        expect(wrapper.find(`TableRow[data-qa-volume-cell=${v.id}]`).length).toBe(1)
      })
    });

    it('should have expected values in each row', () => {
      const v = volumes[0];
      const cells = getVolumeRowCells(wrapper, v.id);
      const label = cells.at(0).text();
      const size = cells.at(1).text();
      const fsp = cells.at(2).text();
      const actionMenu = cells.at(3).find('LinodeVolumeActionMenu');

      expect(label).toBe(v.label);
      expect(size).toContain(v.size);
      expect(fsp).toBe(v.filesystem_path);
      expect(actionMenu.length).toBe(1);
    });
  });
});

const getVolumeRowCells = (w: ReactWrapper, volumeId: number) =>
  w.find(`TableRow[data-qa-volume-cell=${volumeId}] TableCell`);
