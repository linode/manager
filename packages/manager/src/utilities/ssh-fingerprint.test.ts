import fingerprint from './ssh-fingerprint';

const rsa =
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC0XgxNfQEPJBzd9kCOqMxOY60Z10gMLoqh1qx9eGlYORKoMAbnl2+gnGdrSHuc7ZPlV3+xiQRbcLp8R6LM/zKJECsFY7daNjwI/yeJz8Yv3V7cIcybf6O1neyrweNMW3XTc18cmoHS69KJX9BAecmpWsqJ8CFH/1/Fs16jCH8fyAe14TTvR6KBYcySqaBVZgtjGAV8FvmCP/1PNE2g2POnBZkSgnYdyq2dC8V9fHYece0KP38qyzR8vnMZVzLTTYa0/z1uyCUfkGlXEBbz1ULGvLJQUn5QhRWZXjHgzhMCTv18lPhmvythZ+gQAKVjDNUFgSHus7ZoVA2IuOoHIYyrOfmRTP2WxWpwSPOXlUhbnFj+0OSMAYxzmhAABCw1YQBVltBJ11JM9GdCKKqXmiRpRSn046niybm/m5xw8eQydkL5B48TkTZKE4TmuWZOb3bogPNvXOunfIDtte+6vHGzfL6Unx4chvlYItQyO4cDvmJVbk83eh5fxJOxNwvrYwU= jared@ganymede';
const rsaFingerprint = 'c0:44:ef:87:81:20:47:78:3d:32:ce:ea:6c:c7:48:e5';

const ed25519 =
  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKDsowlNFz0LVJvyImuOMRCxW59+BY3eWXYtD4DI8ZO+ jared@ganymede';

const edFingerprint = '79:48:dc:ed:c9:d4:bc:e1:98:5a:ec:65:bc:a2:0c:54';

describe('Generating SSH key fingerprints', () => {
  it('should correctly fingerprint an ssh-rsa key', () => {
    expect(fingerprint(rsa)).toMatch(rsaFingerprint);
  });

  it('should correctly fingerprint an ssh-ed25519 key', () => {
    expect(fingerprint(ed25519)).toMatch(edFingerprint);
  });

  it('should return a message in the event of an error', () => {
    expect(fingerprint(null as any)).toMatch('Error generating fingerprint');
  });
});
