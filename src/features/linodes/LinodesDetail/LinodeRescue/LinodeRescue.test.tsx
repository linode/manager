import * as React from 'react';
import { mount } from 'enzyme';
import { LinodeRescue } from './LinodeRescue';
import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';
describe('LinodeRescue', () => {
  describe('volumes', () => {
    const filesystem: 'ext4' = 'ext4';
    const status: 'ready' = 'ready';
    const volumeStatus: 'active' = 'active';
    // look at APITokens.test.tsx. Must be wrapped in promise loader functions
    // const disks: PromiseLoaderResponse<Linode.ResourcePage<ExtendedDisk[]>> = {
    // createPromiseLoaderResponse(createResourcePage(
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
    // const volumes: PromiseLoaderResponse<Linode.ResourcePage<ExtendedVolume[]>> = {
    const volumes = createPromiseLoaderResponse([{
      status: volumeStatus,
      filesystem_path: '/dev/disk/by-id/scsi-0Linode_Volume_test_volume',
      created: '2018-05-02T12:36:49',
      id: 6572,
      linode_id: 7843027,
      label: 'test_volume',
      updated: '2018-05-02T12:36:49',
      region: 'us-east',
      size: 20,
      _id: 'volume-6572',
    }]);

    const component = mount(
      <LinodeRescue
        classes={{
          root: '',
          title: '',
          intro: '',
          actionPanel: '',
        }}
        disks={disks}
        linodeId={7843027}
        volumes={volumes}
      />,
    );
    it(
      `volumes in the rescue dropdowns should only display volumes
      that are in the same region as the Linode and aren't already attached to another Linode`,
      () => {
        console.log(component.debug());
      });
  });
});
