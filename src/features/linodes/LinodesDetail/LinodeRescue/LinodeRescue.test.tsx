import { shallow } from 'enzyme';
import * as React from 'react';

import { disks } from 'src/__data__/disks';
import { volumes } from 'src/__data__/volumes';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

import { ExtendedVolume } from './DeviceSelection';
import { LinodeRescue } from './LinodeRescue';

describe('LinodeRescue', () => {
  describe('volumes', () => {

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
    })
    const disksAsPromise = createPromiseLoaderResponse(extendedDisks);
    const volumesAsPromise = createPromiseLoaderResponse(extendedVolumes);

    const component = shallow(
      <LinodeThemeWrapper>
        <LinodeRescue
          classes={{
            root: '',
            title: '',
            intro: '',
          }}
          disks={disksAsPromise}
          linodeId={7843027}
          linodeRegion="us-east"
          volumes={volumesAsPromise}
          linodeLabel=""
        />
      </LinodeThemeWrapper>,
    );
    const rescueComponent: any = component.find('LinodeRescue').dive();
    const rescueComponentProps = component.props().children.props.children.props;
    it(
      `volumes in the rescue dropdowns should only display volumes
      that are in the same region as the Linode`,
      () => {
        const linodeRegion = rescueComponentProps.linodeRegion;
        let volumesAndLinodeSameRegion = true;
        rescueComponent
          .state()
          .devices
          .volumes
          .map((element: ExtendedVolume) => {
            if (element.region !== linodeRegion) {
              volumesAndLinodeSameRegion = false;
            }
          });
        expect(volumesAndLinodeSameRegion).toBeTruthy();
      });

    it(
      `volumes in the rescue dropdowns should only display volumes
        that are either attached to the current Linode or no Linode`,
      () => {
        const linodeId = rescueComponentProps.linodeId;
        let volumeCanBeRescued = true;
        rescueComponent
          .state()
          .devices
          .volumes
          .map((element: ExtendedVolume) => {
            if (element.linode_id !== null && element.linode_id !== linodeId) {
              volumeCanBeRescued = false;
            }
          });
        expect(volumeCanBeRescued).toBeTruthy();
      });
  });
});
