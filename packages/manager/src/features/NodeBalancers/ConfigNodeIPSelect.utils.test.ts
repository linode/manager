import { linodeFactory } from '@linode/utilities';

import { getPrivateIPOptions } from './ConfigNodeIPSelect.utils';

describe('getPrivateIPOptions', () => {
  it('returns an empty array when linodes are undefined', () => {
    expect(getPrivateIPOptions(undefined)).toStrictEqual([]);
  });

  it('returns an empty array when there are no Linodes', () => {
    expect(getPrivateIPOptions([])).toStrictEqual([]);
  });

  it('returns an option for each private IPv4 starting with 192.168.x.x on a Linode', () => {
    const linode = linodeFactory.build({
      ipv4: ['192.168.1.1', '172.16.0.1'],
    });

    expect(getPrivateIPOptions([linode])).toStrictEqual([
      { label: '192.168.1.1', linode },
    ]);
  });

  it('does not return an option for public IPv4s on a Linode', () => {
    const linode = linodeFactory.build({
      ipv4: ['143.198.125.230', '192.168.1.1'],
    });

    expect(getPrivateIPOptions([linode])).toStrictEqual([
      { label: '192.168.1.1', linode },
    ]);
  });
});
