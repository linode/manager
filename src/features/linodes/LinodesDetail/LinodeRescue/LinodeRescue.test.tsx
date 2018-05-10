import * as React from 'react';
import { shallow } from 'enzyme';
import { LinodeRescue } from './LinodeRescue';
import { ExtendedVolume } from './DeviceSelection';
import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

describe('LinodeRescue', () => {
  describe('volumes', () => {
    const filesystem: 'ext4' = 'ext4';
    const status: 'ready' = 'ready';
    const volumeStatus: 'active' = 'active';
    const disks = createPromiseLoaderResponse([
      {
        id: 17435341,
        label: 'CentOS 7 Disk',
        status,
        created: '2018-05-02T12:33:21',
        updated: '2018-05-02T12:33:41',
        size: 19968,
        filesystem,
        _id: 'disk-17435341',
      },
      {
        id: 17435342,
        label: '512 MB Swap Image',
        status,
        created: '2018-05-02T12:33:21',
        updated: '2018-05-02T12:33:41',
        size: 512,
        filesystem,
        _id: 'disk-17435342',
      },
    ]);
    const volumes = createPromiseLoaderResponse([
      {
        status: volumeStatus,
        filesystem_path: '/dev/disk/by-id/scsi-0Linode_Volume_test_volume',
        created: '2018-05-02T12:36:49',
        id: 6572,
        linode_id: 7843027,
        label: 'test_volume',
        updated: '2018-05-02T12:36:49',
        region: 'us-east',
        size: 20,
        filesystem,
        _id: 'volume-6572',
      },
      {
        status: volumeStatus,
        filesystem_path: '/dev/disk/by-id/scsi-0Linode_Volume_test_volume2',
        linode_id: null,
        label: 'test_volume2',
        id: 6573,
        updated: '2018-05-02T12:38:02',
        region: 'us-east',
        created: '2018-05-02T12:38:02',
        size: 20,
        filesystem,
        _id: 'volume-6573',
      },
      {
        status: volumeStatus,
        filesystem_path: '/dev/disk/by-id/scsi-0Linode_Volume_outside_region',
        linode_id: 123,
        label: 'outside_region',
        id: 6575,
        updated: '2018-05-02T13:11:02',
        region: 'us-central',
        created: '2018-05-02T13:11:02',
        size: 20,
        filesystem,
        _id: 'volume-6575',
      },
      {
        status: volumeStatus,
        filesystem_path: '/dev/disk/by-id/scsi-0Linode_Volume_outside_region2',
        linode_id: null,
        label: 'outside_region2',
        id: 6577,
        updated: '2018-05-02T13:12:21',
        region: 'us-central',
        created: '2018-05-02T13:12:21',
        size: 20,
        filesystem,
        _id: 'volume-6577',
      },
    ]);

    const component = shallow(
      <LinodeThemeWrapper>
        <LinodeRescue
          classes={{
            root: '',
            title: '',
            intro: '',
            actionPanel: '',
          }}
          disks={disks}
          linodeId={7843027}
          linodeRegion="us-east"
          volumes={volumes}
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
