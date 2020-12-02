import { linodeFactory } from 'src/factories/linodes';
import { interceptGeneralError } from './AttachVLANDrawer';

const mockLinode = linodeFactory.build({ label: 'test-label', id: 1 });
const mockLinodeData = { '1': mockLinode };

const generateLinodeError = (id: number) =>
  `Too many interfaces for Linode with ID ${id}. Max allowed is 3.`;

describe('Attach Linode to VLAN drawer', () => {
  describe('Error interceptor', () => {
    it("should not intercept errors that don't contain a Linode ID", () => {
      expect(interceptGeneralError('A general error', mockLinodeData)).toMatch(
        'A general error'
      );
    });

    it("should return sane output when the linode ID doesn't match anything in the store", () => {
      expect(
        interceptGeneralError(generateLinodeError(10000), mockLinodeData)
      ).toMatch('Linode has reached its interface limit.');
    });

    it('should return a message including the Linode label when the ID matches successfully', () => {
      expect(
        interceptGeneralError(generateLinodeError(1), mockLinodeData)
      ).toMatch('Linode test-label has reached its interface limit.');
    });

    it('should return null for empty input', () => {
      expect(interceptGeneralError(undefined, mockLinodeData)).toBeNull();
    });
  });
});
