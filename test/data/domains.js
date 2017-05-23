export const apiTestDomain = {
  domain: 'example.com',
  axfr_ips: ['44.55.66.77'],
  group: 'Example Display Group',
  retry_sec: 3600,
  refresh_sec: 14400,
  description: 'Example Description',
  id: 1,
  status: 'active',
  master_ips: ['127.0.0.1', '255.255.255.1', '123.123.123.7'],
  type: 'master',
  soa_email: 'admin@example.com',
  ttl_sec: 3600,
  expire_sec: 604800,
};

export const testDomain = {
  ...apiTestDomain,
  _polling: false,
  _records: {
    records: {
      1: {
        type: 'A',
        ttl_sec: 0,
        name: 'sub1',
        port: 80,
        service: null,
        priority: 10,
        id: 1,
        protocol: null,
        weight: 5,
        target: '4.4.4.4',
      },
      2: {
        type: 'CNAME',
        ttl_sec: 0,
        name: 'sub2',
        port: 80,
        service: null,
        priority: 10,
        id: 2,
        protocol: null,
        weight: 5,
        target: 'sub1.example.com',
      },
      3: {
        type: 'MX',
        ttl_sec: 0,
        name: '',
        port: 0,
        service: null,
        priority: 10,
        id: 3,
        protocol: null,
        weight: 0,
        target: 'mail1.example.com',
      },
      4: {
        type: 'NS',
        ttl_sec: 0,
        name: '',
        port: 0,
        service: null,
        priority: 0,
        id: 4,
        protocol: null,
        weight: 0,
        target: 'ns5.linode.com',
      },
      5: {
        type: 'TXT',
        ttl_sec: 0,
        name: 'key',
        port: 80,
        service: null,
        priority: 10,
        id: 5,
        protocol: null,
        weight: 5,
        target: 'value',
      },
      6: {
        type: 'SRV',
        ttl_sec: 0,
        // TODO: api support for _sip._tcp
        name: '_sip',
        port: 80,
        service: '_sip',
        priority: 10,
        id: 6,
        protocol: '_tcp',
        weight: 5,
        target: 'ns1.service.com',
      },
    },
  },
};

export const domains = {
  1: testDomain,
  2: {
    ...testDomain,
    id: 2,
    domain: 'example1.com',
    _records: { records: {} },
  },
};
