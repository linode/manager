import {
  DEFAULT_IPV4_ERROR,
  DEFAULT_LABEL_ERROR,
  calculateAvailableIPv4s,
  validateSubnets,
} from './subnets';

describe('calculateAvailableIPv4s', () => {
  it('should return a number if the input is a valid IPv4 with a mask', () => {
    const availIP24 = calculateAvailableIPv4s('10.0.0.0/24');
    expect(availIP24).toBe(256);
    const availIP32 = calculateAvailableIPv4s('10.0.0.0/32');
    expect(availIP32).toBe(1);
  });

  it('should return undefined if the input is a valid IPv4 without a mask', () => {
    const noMask = calculateAvailableIPv4s('10.0.0.0');
    expect(noMask).toBe(undefined);
  });

  it('should return undefined if the input is not IPv4', () => {
    const badIP = calculateAvailableIPv4s('bad ip');
    expect(badIP).toBe(undefined);

    const ipv6 = calculateAvailableIPv4s(
      '98d7:1707:3b5c:55b5:9481:f856:fd14:0eb4'
    );
    expect(ipv6).toBe(undefined);

    const badMask = calculateAvailableIPv4s('10.0.0.0/bad mask');
    expect(badMask).toBe(undefined);
    const badMask2 = calculateAvailableIPv4s('10.0.0.0/100');
    expect(badMask2).toBe(undefined);
  });
});

describe('validateSubnets', () => {
  const emptyIP = {
    ip: { ipv4: '', ipv4Error: '' },
    label: 'empty ip',
    labelError: '',
  };

  const badIP = {
    ip: { ipv4: 'bad ip', ipv4Error: '' },
    label: '',
    labelError: '',
  };

  const missingMask = {
    ip: { ipv4: '10.0.0.0', ipv4Error: '' },
    label: 'needs a mask',
    labelError: '',
  };

  const missingLabel = {
    ip: { ipv4: '10.0.0.0/24', ipv4Error: '' },
    label: '',
    labelError: '',
  };

  const goodSubnets = [
    {
      ip: { ipv4: '', ipv4Error: '' },
      label: '',
      labelError: '',
    },
    {
      ip: { ipv4: '10.0.0.0/24', ipv4Error: '' },
      label: 'good subnet',
      labelError: '',
    },
  ];

  it('should use the error messages passed in and error for ip and label', () => {
    const erroredSubnets = validateSubnets([badIP], {
      ipv4Error: 'this is a bad ip',
      labelError: 'this is a bad label',
    });

    expect(erroredSubnets).toHaveLength(1);
    expect(erroredSubnets).toStrictEqual([
      {
        ip: {
          ipv4: 'bad ip',
          ipv4Error: 'this is a bad ip',
        },
        label: '',
        labelError: 'this is a bad label',
      },
    ]);
  });

  it('should return error for IPs', () => {
    const erroredSubnets = validateSubnets([missingMask, emptyIP]);
    expect(erroredSubnets).toHaveLength(2);
    expect(erroredSubnets).toStrictEqual([
      {
        ip: {
          ipv4: '10.0.0.0',
          ipv4Error: DEFAULT_IPV4_ERROR,
        },
        label: 'needs a mask',
        labelError: '',
      },
      {
        ip: {
          ipv4: '',
          ipv4Error: DEFAULT_IPV4_ERROR,
        },
        label: 'empty ip',
        labelError: '',
      },
    ]);
  });

  it('should return error for label', () => {
    const erroredSubnets = validateSubnets([missingLabel]);
    expect(erroredSubnets).toHaveLength(1);
    expect(erroredSubnets).toStrictEqual([
      {
        ip: {
          ipv4: '10.0.0.0/24',
          ipv4Error: '',
        },
        label: '',
        labelError: DEFAULT_LABEL_ERROR,
      },
    ]);
  });

  it('should not return error messages', () => {
    const subnets = validateSubnets(goodSubnets);
    expect(subnets).toHaveLength(2);
    expect(subnets).toStrictEqual(goodSubnets);
  });
});
