import { extractDiskOrVolumeId, adjustedErrorText } from './DeviceSelection';

const errors = [
  { input: 'disk ID 2005 is referenced more than once', expected: 'disk-2005' },
  {
    input: 'volume ID 3005 is referenced more than once',
    expected: 'volume-3005',
  },
  { input: 'disk ID 4005 is referenced more than once', expected: 'disk-4005' },
  {
    input: 'volume ID 5005 is referenced more than once',
    expected: 'volume-5005',
  },
  { input: 'is referenced more than once', expected: null },
];

describe('Device selection component', () => {
  describe('Grabbing the disk_id or volume_id from the error reason', () => {
    it('should create a string out of the disk_id or volume_id in the format {type}-{id}', () => {
      errors.forEach((thisError) => {
        expect(extractDiskOrVolumeId(thisError.input)).toBe(thisError.expected);
      });
    });
  });

  describe('Using the device label in the error message', () => {
    it('should use the device label in the error message if it is available', () => {
      expect(adjustedErrorText(errors[0].input, 'test-label')).toBe(
        'test-label is already in use.'
      );
    });

    it('should fall back to the error returned by the API if the device label is unavailable', () => {
      expect(adjustedErrorText(errors[0].input, undefined)).toBe(
        errors[0].input
      );
    });
  });
});
