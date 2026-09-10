import { linodeFactory } from '@linode/utilities';

import {
  getCustomIPOptions,
  getPrivateIPOptions,
  useIsCustomIPCustomer,
} from './ConfigNodeIPSelect.utils';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn(),
  useFlags: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

vi.mock('src/hooks/useFlags', async () => {
  const actual = await vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

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

describe('getCustomIPOptions', () => {
  it('returns an empty array when VPC IPs are undefined', () => {
    expect(getCustomIPOptions(undefined)).toStrictEqual([]);
  });

  it('returns options for VPC IP addresses and skips entries without an address', () => {
    expect(
      getCustomIPOptions([
        { address: '10.0.0.2' },
        { address: undefined },
        { address: '10.0.0.3' },
      ] as any)
    ).toStrictEqual([
      { label: '10.0.0.2', value: '10.0.0.2' },
      { label: '10.0.0.3', value: '10.0.0.3' },
    ]);
  });
});

describe('useIsCustomIPCustomer', () => {
  it('returns true when account has Custom VPC IPv4 Ranges capability and nitro feature flag is enabled', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['Linodes', 'Custom VPC IPv4 Ranges'],
      },
      error: undefined,
    });

    queryMocks.useFlags.mockReturnValue({
      nitro: true,
    });

    expect(useIsCustomIPCustomer()).toBe(true);
  });

  it('returns false when account query returns an error', () => {
    queryMocks.useAccount.mockReturnValue({
      data: undefined,
      error: [{ reason: 'request failed' }],
    });

    expect(useIsCustomIPCustomer()).toBe(false);
  });

  it('returns false when capability is not present', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['Linodes'],
      },
      error: undefined,
    });

    expect(useIsCustomIPCustomer()).toBe(false);
  });
});
