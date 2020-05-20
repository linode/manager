import { cleanup } from '@testing-library/react';
import { linodeFactory } from 'src/factories/linodes';

import { generateDefaultDomainRecords } from './DomainDrawer';

afterEach(cleanup);

const testLinode = linodeFactory.build({
  ipv6: null
});

const request = require.requireMock('@linode/api-v4/lib/domains');
jest.mock('@linode/api-v4/lib/domains');

request.createDomainRecord = jest.fn().mockResolvedValue({
  id: 2,
  name: 'TestRecord',
  port: 80,
  priority: 1,
  protocol: null,
  service: null,
  tag: null,
  target: 'example.com',
  ttl_sec: 100,
  type: 'AAAA',
  weight: 1
});

const testDomain = 'example.com';
const testDomainID = testLinode.id;
const testIPv4 = testLinode.ipv4[0];
const nullTestIPv6 = testLinode.ipv6;

const notNullTestIPv6 = '2600:3c03:e000:3cb::2';

describe('Do not force IPv6 creation', () => {
  it('should not make IPv6 records for DNS records being created from a Linode with no IPv6', async () => {
    const testDefaultDomainRecords = await generateDefaultDomainRecords(
      testDomain,
      testDomainID,
      testIPv4,
      nullTestIPv6
    );

    // Because testIPv6 = null, generateDefaultDomainRecords() should only return the 3 baseIPv4Requests and skip the creation of the other 4 records for IPv6.
    expect(testDefaultDomainRecords.length).toBe(3);
  });

  it('should make IPv6 records for DNS records being created from a Linode with an IPv6', async () => {
    const testDefaultDomainRecords = await generateDefaultDomainRecords(
      testDomain,
      testDomainID,
      testIPv4,
      notNullTestIPv6
    );

    // Because testIPv6 is not null or undefined, generateDefaultDomainRecords() should return the 3 baseIPv4Requests and create the other 4 records for IPv6.
    expect(testDefaultDomainRecords.length).toBe(7);
  });
});
