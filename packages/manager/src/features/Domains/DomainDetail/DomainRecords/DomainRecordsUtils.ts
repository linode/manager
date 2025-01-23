import type { Props } from './DomainRecords';
import type {
  Domain,
  DomainRecord,
  RecordType,
} from '@linode/api-v4/lib/domains';

type DomainTimeFields = Pick<
  Domain,
  'expire_sec' | 'refresh_sec' | 'retry_sec' | 'ttl_sec'
>;

type DomainRecordTimeFields = Pick<DomainRecord, 'ttl_sec'>;

export const msToReadableTime = (v: number): null | string => {
  const msToReadableTimeMap: { [key: number]: string } = {
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
  };

  return v in msToReadableTimeMap ? msToReadableTimeMap[v] : null;
};

export function getTimeColumn(
  record: Domain,
  keyPath: keyof DomainTimeFields
): null | string;

export function getTimeColumn(
  record: DomainRecord,
  keyPath: keyof DomainRecordTimeFields
): null | string;

export function getTimeColumn(
  record: Domain | DomainRecord,
  keyPath: keyof (DomainRecordTimeFields | DomainTimeFields)
) {
  return msToReadableTime(record[keyPath] ?? 0);
}

export const typeEq = (type: RecordType) => (record: DomainRecord): boolean =>
  record.type === type;

const prependLinodeNS: Partial<DomainRecord>[] = [
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
];

export const getNSRecords = (props: Props): Partial<DomainRecord>[] => {
  const domainRecords = props.domainRecords || [];
  const filteredNSRecords = domainRecords.filter(typeEq('NS'));
  return [...prependLinodeNS, ...filteredNSRecords];
};
