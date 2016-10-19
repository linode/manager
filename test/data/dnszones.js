export const apiTestDNSZone = {
  dnszone: 'example.com',
  axfr_ips: ['44.55.66.77'],
  display_group: 'Example Display Group',
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

export const testDNSZone = {
  ...apiTestDNSZone,
  _polling: false,
};

export const dnszones = { 1: testDNSZone };
