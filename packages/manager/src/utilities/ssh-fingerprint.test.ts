import fingerprint from './ssh-fingerprint';

const ed2 =
  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGL5mQV7syfg8qndLQ70tSUKPAfERhslyURfuv5X8drO jcoffman@stellarwind';

describe('Generating SSH key fingerprints', () => {
  it('should use the correct algorithm', () => {
    expect(fingerprint(ed2)).toMatch(
      '95:54:c0:82:c0:9b:5c:74:3f:4f:15:4a:41:bf:07:97'
    );
  });
});
