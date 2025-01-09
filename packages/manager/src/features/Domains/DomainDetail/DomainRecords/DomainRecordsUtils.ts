import { compose, filter, flatten, pathOr, prepend, propEq } from 'ramda';

import type { Props } from './DomainRecords';
import type { DomainRecord } from '@linode/api-v4/lib/domains';

export const msToReadableTime = (v: number): null | string =>
  pathOr(null, [v], {
    0: 'Default',
    30: '30 seconds',
    120: '2 minutes',
    300: '5 minutes',
    3600: '1 hour',
    7200: '2 hours',
    14400: '4 hours',
    28800: '8 hours',
    57600: '16 hours',
    86400: '1 day',
    172800: '2 days',
    345600: '4 days',
    604800: '1 week',
    1209600: '2 weeks',
    2419200: '4 weeks',
  });

export const getTTL = compose(msToReadableTime, pathOr(0, ['ttl_sec']));

export const typeEq = propEq('type');

export const prependLinodeNS = compose<any, any, DomainRecord[]>(
  flatten,
  prepend([
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns1.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns2.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns3.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns4.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns5.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
  ])
);

export const getNSRecords = compose<
  Props,
  DomainRecord[],
  DomainRecord[],
  DomainRecord[]
>(prependLinodeNS, filter(typeEq('NS')), pathOr([], ['domainRecords']));
