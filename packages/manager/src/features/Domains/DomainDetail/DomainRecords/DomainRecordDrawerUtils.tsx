import produce from 'immer';
import { cond, equals, pick } from 'ramda';

import { maybeCastToNumber } from 'src/utilities/maybeCastToNumber';

import { getInitialIPs } from '../../domainUtils';

import type {
  DomainRecordDrawerProps,
  EditableDomainFields,
  EditableRecordFields,
} from './DomainRecordDrawer';
import type { DomainType, RecordType } from '@linode/api-v4/lib/domains';

export const noARecordsNoticeText =
  'Please create an A/AAAA record for this domain to avoid a Zone File invalidation.';

export const modeMap = {
  create: 'Create',
  edit: 'Edit',
};

export const typeMap = {
  A: 'A',
  AAAA: 'A/AAAA',
  CAA: 'CAA',
  CNAME: 'CNAME',
  MX: 'MX',
  NS: 'NS',
  PTR: 'PTR',
  SRV: 'SRV',
  TXT: 'TXT',
  master: 'SOA',
  slave: 'SOA',
};

export const shouldResolve = (type: string, field: string) => {
  switch (type) {
    case 'AAAA':
      return field === 'name';
    case 'SRV':
      return field === 'target';
    case 'CNAME':
      return field === 'target';
    case 'TXT':
      return field === 'name';
    default:
      return false;
  }
};

export const resolve = (value: string, domain: string) =>
  value.replace(/\@/, domain);

export const resolveAlias = (
  data: Record<string, any>,
  domain: string,
  type: string
) => {
  // Replace a single @ with a reference to the Domain
  const clone = { ...data };
  for (const [key, value] of Object.entries(clone)) {
    if (shouldResolve(type, key) && typeof value === 'string') {
      clone[key] = resolve(value, domain);
    }
  }
  return clone;
};

const numericFields = ['port', 'weight', 'priority'];
export const castFormValuesToNumeric = (
  data: Record<string, any>,
  fieldNames: string[] = numericFields
) => {
  return produce(data, (draft) => {
    fieldNames.forEach((thisField) => {
      draft[thisField] = maybeCastToNumber(draft[thisField]);
    });
  });
};

export const filterDataByType = (
  fields: EditableDomainFields | EditableRecordFields,
  t: DomainType | RecordType
): Partial<EditableDomainFields | EditableRecordFields> =>
  cond([
    [
      () => equals('master', t),
      () =>
        pick(
          [
            'domain',
            'soa_email',
            'refresh_sec',
            'retry_sec',
            'expire_sec',
            'ttl_sec',
            'axfr_ips',
          ],
          fields
        ),
    ],
    // [
    //   () => equals('slave', t),
    //   () => pick([], fields),
    // ],
    [() => equals('A', t), () => pick(['name', 'target', 'ttl_sec'], fields)],
    [
      () => equals('AAAA', t),
      () => pick(['name', 'target', 'ttl_sec'], fields),
    ],
    [
      () => equals('CAA', t),
      () => pick(['name', 'tag', 'target', 'ttl_sec'], fields),
    ],
    [
      () => equals('CNAME', t),
      () => pick(['name', 'target', 'ttl_sec'], fields),
    ],
    [
      () => equals('MX', t),
      () => pick(['target', 'priority', 'ttl_sec', 'name'], fields),
    ],
    [() => equals('NS', t), () => pick(['target', 'name', 'ttl_sec'], fields)],
    [
      () => equals('SRV', t),
      () =>
        pick(
          [
            'service',
            'protocol',
            'priority',
            'port',
            'weight',
            'target',
            'ttl_sec',
          ],
          fields
        ),
    ],
    [() => equals('TXT', t), () => pick(['name', 'target', 'ttl_sec'], fields)],
  ])();

/**
 * the defaultFieldState is used to pre-populate the drawer with either
 * editable data or defaults.
 */
export const defaultFieldsState = (
  props: Partial<DomainRecordDrawerProps>
) => ({
  axfr_ips: getInitialIPs(props.axfr_ips),
  description: '',
  domain: props.domain,
  expire_sec: props.expire_sec ?? 0,
  id: props.id,
  name: props.name ?? '',
  port: props.port ?? '80',
  priority: props.priority ?? '10',
  protocol: props.protocol ?? 'tcp',
  refresh_sec: props.refresh_sec ?? 0,
  retry_sec: props.retry_sec ?? 0,
  service: props.service ?? '',
  soa_email: props.soa_email ?? '',
  tag: props.tag ?? 'issue',
  target: props.target ?? '',
  ttl_sec: props.ttl_sec ?? 0,
  weight: props.weight ?? '5',
});
