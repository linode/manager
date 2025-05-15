import { maybeCastToNumber } from '@linode/utilities';
import produce from 'immer';

import { getInitialIPs } from '../../domainUtils';

import type {
  DomainRecordDrawerProps,
  EditableDomainFields,
  EditableRecordFields,
} from './DomainRecordDrawer';
import type { DomainType, RecordType } from '@linode/api-v4/lib/domains';

type ValuesOfEditableData = Partial<
  EditableDomainFields & EditableRecordFields
>[keyof Partial<EditableDomainFields & EditableRecordFields>];

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
    case 'CNAME':
      return field === 'target';
    case 'SRV':
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
  data: Record<string, ValuesOfEditableData>,
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
  data: Record<string, ValuesOfEditableData>,
  fieldNames: string[] = numericFields
) => {
  return produce(data, (draft) => {
    fieldNames.forEach((thisField) => {
      draft[thisField] = maybeCastToNumber(draft[thisField] as number | string);
    });
  });
};

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

const getMasterData = (
  fields: EditableDomainFields
): Pick<
  EditableDomainFields,
  | 'axfr_ips'
  | 'domain'
  | 'expire_sec'
  | 'refresh_sec'
  | 'retry_sec'
  | 'soa_email'
  | 'ttl_sec'
> => {
  return {
    axfr_ips: fields.axfr_ips,
    domain: fields.domain,
    expire_sec: fields.expire_sec,
    refresh_sec: fields.refresh_sec,
    retry_sec: fields.retry_sec,
    soa_email: fields.soa_email,
    ttl_sec: fields.ttl_sec,
  };
};

/**
 * Get data for `A`, `AAAA`, `CNAME`, `NS`, `TXT` records
 * @param fields - (unfiltered) Domain Record form data fields
 */
const getSharedRecordData = (
  fields: EditableRecordFields
): Pick<EditableRecordFields, 'name' | 'target' | 'ttl_sec'> => {
  return {
    name: fields.name,
    target: fields.target,
    ttl_sec: fields.ttl_sec,
  };
};

const getCAARecordData = (
  fields: EditableRecordFields
): Pick<EditableRecordFields, 'name' | 'tag' | 'target' | 'ttl_sec'> => {
  return {
    name: fields.name,
    tag: fields.tag,
    target: fields.target,
    ttl_sec: fields.ttl_sec,
  };
};

const getMXRecordData = (
  fields: EditableRecordFields
): Pick<EditableRecordFields, 'name' | 'priority' | 'target' | 'ttl_sec'> => {
  return {
    name: fields.name,
    priority: fields.priority,
    target: fields.target,
    ttl_sec: fields.ttl_sec,
  };
};

const getSRVRecordData = (
  fields: EditableRecordFields
): Pick<
  EditableRecordFields,
  'port' | 'priority' | 'protocol' | 'service' | 'target' | 'ttl_sec' | 'weight'
> => {
  return {
    port: fields.port,
    priority: fields.priority,
    protocol: fields.protocol,
    service: fields.service,
    target: fields.target,
    ttl_sec: fields.ttl_sec,
    weight: fields.weight,
  };
};

export const filterDataByType = (
  fields: EditableDomainFields | EditableRecordFields,
  type: DomainType | RecordType
): Partial<EditableDomainFields | EditableRecordFields> => {
  switch (type) {
    case 'A':

    // eslint-disable-next-line no-fallthrough
    case 'AAAA':
    case 'CNAME':
    case 'NS':
    case 'TXT':
      return getSharedRecordData(fields);
    case 'CAA':
      return getCAARecordData(fields);

    case 'master':
      return getMasterData(fields);

    case 'MX':
      return getMXRecordData(fields);

    case 'SRV':
      return getSRVRecordData(fields);

    default:
      return {};
  }
};
