import { extractDiskOrVolumeId } from './DeviceSelection';

const errorReasons = [
  'disk ID 2005 is referenced more than once',
  'volume ID 3005 is referenced more than once',
  'disk ID 4005 is referenced more than once',
  'volume ID 5005 is referenced more than once',
];

describe('Device selection component', () => {
  describe('Grabbing the disk_id or volume_id from the error reason', () => {
    it('should create a string out of the disk_id or volume_id in the format {type}-{id}', () => {
      expect(extractDiskOrVolumeId(errorReasons[0])).toBe('disk-2005');
      expect(extractDiskOrVolumeId(errorReasons[1])).toBe('volume-3005');
      expect(extractDiskOrVolumeId(errorReasons[2])).toBe('disk-4005');
      expect(extractDiskOrVolumeId(errorReasons[3])).toBe('volume-5005');
    });
  });
});
