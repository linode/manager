import { linodeDiskFactory } from 'src/factories';

import { getSelectedDeviceOption } from './utilities';

describe('Select device option', () => {
  it('should return the right device using the selected value and device options', () => {
    const mockDisks = [
      linodeDiskFactory.build({ filesystem: 'ext4', label: 'Debian 10 Disk' }),
      linodeDiskFactory.build({
        filesystem: 'swap',
        label: '512 MB Swap Image',
      }),
    ];

    const deviceList = mockDisks.map((disk) => ({
      deviceType: 'Disks',
      label: disk.label,
      value: `disk ${disk.id}`,
    }));

    expect(getSelectedDeviceOption(deviceList[0].value, deviceList)).toEqual(
      deviceList[0]
    );
  });
});
