import * as React from 'react';
import { mount } from 'enzyme';
import { LinodeRescue } from './LinodeRescue';

describe('LinodeRescue', () => {
  describe('volumes', () => {
    // look at APITokens.test.tsx. Must be wrapped in promise loader functions
    // const disks: PromiseLoaderResponse<Linode.ResourcePage<ExtendedDisk[]>> = {
    // createPromiseLoaderResponse(createResourcePage(
    const disks = {
      response: [
        {
          id: 17435341,
          label: 'CentOS 7 Disk',
          status: 'ready',
          created: '2018-05-02T12:33:21',
          updated: '2018-05-02T12:33:41',
          size: 19968,
          filesystem: 'ext4',
          _id: 'disk-17435341',
        },
        {
          id: 17435342,
          label: '512 MB Swap Image',
          status: 'ready',
          created: '2018-05-02T12:33:21',
          updated: '2018-05-02T12:33:41',
          size: 512,
          filesystem: 'swap',
          _id: 'disk-17435342',
        },
      ],
    };
    // const volumes: PromiseLoaderResponse<Linode.ResourcePage<ExtendedVolume[]>> = {
    const volumes = {
      response: [{
        status: 'active',
        filesystem_path: '/dev/disk/by-id/scsi-0Linode_Volume_test_volume',
        created: '2018-05-02T12:36:49',
        id: 6572,
        linode_id: 7843027,
        label: 'test_volume',
        updated: '2018-05-02T12:36:49',
        region: 'us-east',
        size: 20,
        _id: 'volume-6572',
      }],
    };
    const component = mount(
      <LinodeRescue
        classes={{
          root: '',
          title: '',
          intro: ''
          actionPanel: '',
        }}
        disks={disks}
        linodeId={7843027}
        volumes={volumes}
        linodeRegion="us-east"
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
