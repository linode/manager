import { disableIPRow } from './utilities';

describe('disableIPRow', () => {
  describe('linode interface', () => {
    it('disables both IPv6 and IPv4 rows if no interfaces', () => {
      expect(
        disableIPRow({
          hasLinodeInterfaces: false,
          hasPublicLinodeInterface: false,
          isVPCOnlyLinode: false,
          ipType: 'Public – IPv4',
          isLinodeInterface: true,
        })
      ).toBe(true);

      expect(
        disableIPRow({
          hasLinodeInterfaces: false,
          hasPublicLinodeInterface: false,
          isVPCOnlyLinode: false,
          ipType: 'Public – IPv6 – SLAAC',
          isLinodeInterface: true,
        })
      ).toBe(true);
    });

    it('disables both IPv6 and IPv4 rows if no public interface and isVPCOnlyLinode', () => {
      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: false,
          isVPCOnlyLinode: true,
          ipType: 'Public – IPv4',
          isLinodeInterface: true,
        })
      ).toBe(true);

      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: false,
          isVPCOnlyLinode: true,
          ipType: 'Public – IPv6 – SLAAC',
          isLinodeInterface: true,
        })
      ).toBe(true);
    });

    it('disables only public IPv4, not IPv6 rows if there is a public interface and isVPCOnlyLinode', () => {
      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: true,
          isVPCOnlyLinode: true,
          ipType: 'Public – IPv4',
          isLinodeInterface: true,
        })
      ).toBe(true);

      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: true,
          isVPCOnlyLinode: true,
          ipType: 'Public – IPv6 – SLAAC',
          isLinodeInterface: true,
        })
      ).toBe(false);
    });

    it('does not disable IPv4/IPv6 if there is a public interface and not isVPCOnlyLinode', () => {
      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: true,
          isVPCOnlyLinode: false,
          ipType: 'Public – IPv4',
          isLinodeInterface: true,
        })
      ).toBe(false);

      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: true,
          isVPCOnlyLinode: false,
          ipType: 'Public – IPv6 – SLAAC',
          isLinodeInterface: true,
        })
      ).toBe(false);
    });

    it('it disables IPv6 if there is no public interface (and not isVPCOnlyLinode)', () => {
      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: false,
          isVPCOnlyLinode: false,
          ipType: 'Public – IPv4',
          isLinodeInterface: true,
        })
      ).toBe(false);

      expect(
        disableIPRow({
          hasLinodeInterfaces: true,
          hasPublicLinodeInterface: false,
          isVPCOnlyLinode: false,
          ipType: 'Public – IPv6 – SLAAC',
          isLinodeInterface: true,
        })
      ).toBe(true);
    });
  });

  describe('legacy interfaces', () => {
    it('it disables IPv4 if isVPCOnlyLinode is true', () => {
      expect(
        disableIPRow({
          hasLinodeInterfaces: undefined,
          hasPublicLinodeInterface: undefined,
          isVPCOnlyLinode: true,
          ipType: 'Public – IPv4',
          isLinodeInterface: false,
        })
      ).toBe(true);
    });
  });
});
