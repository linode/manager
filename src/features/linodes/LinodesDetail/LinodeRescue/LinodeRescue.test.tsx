import { shallow } from 'enzyme';
import * as React from 'react';

import { disks } from 'src/__data__/disks';
import { volumes } from 'src/__data__/volumes';
import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

import { extendOrFilterVolume, LinodeRescue } from './LinodeRescue';

describe('LinodeRescue', () => {


    const extendedDisks = disks.map(disk => {
      return {
        ...disk,
        _id: 'test-disk'
      }
    });
    const extendedVolumes = volumes.map(volume => {
      return {
        ...volume,
        _id: 'test-volume'
      }
    });

    const disksAsPromise = createPromiseLoaderResponse(extendedDisks);

    const props = {
      onPresentSnackbar: jest.fn(),
      enqueueSnackbar: jest.fn(),
      classes: {
        root: '',
        title: '',
        intro: '',
      },
      disks: disksAsPromise,
      linodeId: 7843027,
      linodeRegion: "us-east",
      volumesData: extendedVolumes,
      volumesLoading: false,
      linodeLabel: ''
    }

    const component = shallow(
      <LinodeRescue {...props} />
    );

    describe('Rescue component', () => {
      it('should render', () => {
        expect(component).toBeDefined();
      });
    });
    describe('reducing volumes from Redux', () => {
      const baseVolume = {...volumes[1], region: 'us-central'};
      it(
        `volumes in the rescue dropdowns should only display volumes
        that are in the same region as the Linode`,
        () => {
          const sameRegion = {...baseVolume, region: 'us-central'};
          const extended = extendOrFilterVolume(123456, 'us-central', sameRegion);
          expect(extended).not.toBeNull();
          expect(extended).toHaveProperty('_id', `volume-${sameRegion.id}`);

          const diffRegion = {...baseVolume, region: 'us-east'}
          expect(extendOrFilterVolume(123456, 'us-central', diffRegion)).toBeNull();
        });

      it(
        `volumes in the rescue dropdowns should only display volumes
          that are either attached to the current Linode or no Linode`,
        () => {
          const attached = {...baseVolume, linode_id: 123456 }
          const unattached = {...baseVolume, linode_id: null }
          const attachedElsewhere = {...baseVolume, linode_id: 987654}
          const [a, b, c] = [attached, unattached, attachedElsewhere].map((volume) =>
            extendOrFilterVolume(123456, 'us-central', volume));
          expect(a).not.toBeNull();
          expect(b).not.toBeNull();
          expect(c).toBeNull();
      });
  });
});
