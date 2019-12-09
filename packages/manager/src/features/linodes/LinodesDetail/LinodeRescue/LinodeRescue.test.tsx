import { shallow } from 'enzyme';
import * as React from 'react';

import { disks } from 'src/__data__/disks';
import { volumes } from 'src/__data__/volumes';

import { ExtendedVolume } from './DeviceSelection';
import { getDefaultDeviceMapAndCounter, LinodeRescue } from './LinodeRescue';

describe('LinodeRescue', () => {
  describe('volumes', () => {
    const extendedDisks = disks.map(disk => {
      return {
        ...disk,
        _id: 'test-disk'
      };
    });
    const extendedVolumes = volumes.map(volume => {
      return {
        ...volume,
        _id: 'test-volume'
      };
    });

    const component = shallow<LinodeRescue>(
      <LinodeRescue
        closeSnackbar={jest.fn()}
        enqueueSnackbar={jest.fn()}
        classes={{
          root: '',
          title: '',
          intro: ''
        }}
        linodeDisks={extendedDisks}
        linodeId={7843027}
        linodeRegion="us-east"
        volumesData={extendedVolumes}
        linodeLabel=""
        permissions="read_write"
      />
    );
    const rescueComponentProps = component.instance().props;
    it(`volumes in the rescue dropdowns should only display volumes
      that are in the same region as the Linode`, () => {
      const linodeRegion = rescueComponentProps.linodeRegion;
      let volumesAndLinodeSameRegion = true;
      component.state().devices.volumes.map((element: ExtendedVolume) => {
        if (element.region !== linodeRegion) {
          volumesAndLinodeSameRegion = false;
        }
      });
      expect(volumesAndLinodeSameRegion).toBeTruthy();
    });

    it(`volumes in the rescue dropdowns should only display volumes
        that are either attached to the current Linode or no Linode`, () => {
      const linodeId = rescueComponentProps.linodeId;
      let volumeCanBeRescued = true;
      component.state().devices.volumes.map((element: ExtendedVolume) => {
        if (element.linode_id !== null && element.linode_id !== linodeId) {
          volumeCanBeRescued = false;
        }
      });
      expect(volumeCanBeRescued).toBeTruthy();
    });
  });

  describe('calculating initial device map and counter', () => {
    const extendedDisks = disks.map((disk, idx) => {
      return {
        ...disk,
        _id: `test-disk-${idx}`
      };
    });

    it('should map a single disk + swap to sda and sdb', () => {
      const [map, counter] = getDefaultDeviceMapAndCounter(extendedDisks);
      expect(counter).toBe(2);
      expect(map).toHaveProperty('sda', 'test-disk-0');
      expect(map).toHaveProperty('sdb', 'test-disk-1');
      expect(map).toHaveProperty('sdc', undefined);
      expect(map).toHaveProperty('sdd', undefined);
      expect(map).toHaveProperty('sde', undefined);
      expect(map).toHaveProperty('sdf', undefined);
      expect(map).toHaveProperty('sdg', undefined);
      expect(map).toHaveProperty('sdh', undefined);
    });

    it('should handle an empty input', () => {
      const [map, counter] = getDefaultDeviceMapAndCounter([]);
      expect(counter).toBe(0);
      expect(map).toHaveProperty('sda', undefined);
      expect(map).toHaveProperty('sdb', undefined);
    });
  });
});
