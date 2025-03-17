import { Button } from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
import React from 'react';

import { DomainRecordActionMenu } from './DomainRecordActionMenu';
import { getNSRecords, getTimeColumn, typeEq } from './DomainRecordsUtils';

import type { Props as DomainRecordsProps } from './DomainRecords';
import type { Domain, DomainRecord } from '@linode/api-v4/lib/domains';

export interface IType {
  columns: {
    render: (record: Domain | DomainRecord) => JSX.Element | null | string;
    title: string;
  }[];
  data: any[];
  link?: () => JSX.Element | null;
  order: 'asc' | 'desc';
  orderBy: 'domain' | 'name' | 'target';
  title: string;
}

export interface GenerateTypesHandlers {
  confirmDeletion: (recordId: number) => void;
  handleOpenSOADrawer: (domain: Domain) => void;
  openForCreateARecord: () => void;
  openForCreateCAARecord: () => void;
  openForCreateCNAMERecord: () => void;
  openForCreateMXRecord: () => void;
  openForCreateNSRecord: () => void;
  openForCreateSRVRecord: () => void;
  openForCreateTXTRecord: () => void;
  openForEditARecord: (
    fields: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditCAARecord: (
    fields: Pick<DomainRecord, 'id' | 'name' | 'tag' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditCNAMERecord: (
    fields: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditMXRecord: (
    fields: Pick<
      DomainRecord,
      'id' | 'name' | 'priority' | 'target' | 'ttl_sec'
    >
  ) => void;
  openForEditNSRecord: (
    fields: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditSRVRecord: (
    fields: Pick<
      DomainRecord,
      'id' | 'name' | 'port' | 'priority' | 'protocol' | 'target' | 'weight'
    >
  ) => void;
  openForEditTXTRecord: (
    fields: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => void;
}

const createLink = (title: string, handler: () => void) => (
  <Button buttonType="primary" className="domain-btn" onClick={handler}>
    {title}
  </Button>
);

export const generateTypes = (
  props: DomainRecordsProps,
  handlers: GenerateTypesHandlers
): IType[] => [
  /** SOA Record */
  {
    columns: [
      {
        render: (domain: Domain) => domain.domain,
        title: 'Primary Domain',
      },
      {
        render: (domain: Domain) => domain.soa_email,
        title: 'Email',
      },
      {
        render: (domain: Domain) => getTimeColumn(domain, 'ttl_sec'),
        title: 'Default TTL',
      },
      {
        render: (domain: Domain) => getTimeColumn(domain, 'refresh_sec'),
        title: 'Refresh Rate',
      },
      {
        render: (domain: Domain) => getTimeColumn(domain, 'retry_sec'),
        title: 'Retry Rate',
      },
      {
        render: (domain: Domain) => getTimeColumn(domain, 'expire_sec'),
        title: 'Expire Time',
      },
      {
        render: (domain: Domain) => {
          return domain.type === 'master' ? (
            <DomainRecordActionMenu
              editPayload={domain}
              label={props.domain.domain}
              onEdit={handlers.handleOpenSOADrawer}
            />
          ) : null;
        },
        title: '',
      },
    ],
    data: [props.domain],
    order: 'asc',
    orderBy: 'domain',
    title: 'SOA Record',
  },

  /** NS Record */
  {
    columns: [
      {
        render: (record: DomainRecord) => record.target,
        title: 'Name Server',
      },
      {
        render: (record: DomainRecord) => {
          const subdomain = record.name;
          return Boolean(subdomain)
            ? `${subdomain}.${props.domain.domain}`
            : props.domain.domain;
        },
        title: 'Subdomain',
      },
      {
        render: (record: DomainRecord) => getTimeColumn(record, 'ttl_sec'),
        title: 'TTL',
      },
      {
        /**
         * If the NS is one of Linode's, don't display the Action menu since the user
         * cannot make changes to Linode's nameservers.
         */
        render: (domainRecordParams: DomainRecord) => {
          const { id, name, target, ttl_sec } = domainRecordParams;

          if (id === -1) {
            return null;
          }

          return (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: handlers.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={handlers.openForEditNSRecord}
            />
          );
        },
        title: '',
      },
    ],
    data: getNSRecords(props),
    link: () => createLink('Add an NS Record', handlers.openForCreateNSRecord),
    order: 'asc',
    orderBy: 'target',
    title: 'NS Record',
  },

  /** MX Record */
  {
    columns: [
      {
        render: (record: DomainRecord) => record.target,
        title: 'Mail Server',
      },
      {
        render: (record: DomainRecord) => String(record.priority),
        title: 'Preference',
      },
      {
        render: (record: DomainRecord) => record.name,
        title: 'Subdomain',
      },
      {
        render: (record: DomainRecord) => getTimeColumn(record, 'ttl_sec'),
        title: 'TTL',
      },
      {
        render: (domainRecordParams: DomainRecord) => {
          const { id, name, priority, target, ttl_sec } = domainRecordParams;
          return (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: handlers.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                priority,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={handlers.openForEditMXRecord}
            />
          );
        },
        title: '',
      },
    ],
    data: props.domainRecords.filter(typeEq('MX')),
    link: () => createLink('Add a MX Record', handlers.openForCreateMXRecord),
    order: 'asc',
    orderBy: 'target',
    title: 'MX Record',
  },

  /** A/AAAA Record */
  {
    columns: [
      {
        render: (record: DomainRecord) => record.name || props.domain.domain,
        title: 'Hostname',
      },
      { render: (record: DomainRecord) => record.target, title: 'IP Address' },
      {
        render: (record: DomainRecord) => getTimeColumn(record, 'ttl_sec'),
        title: 'TTL',
      },
      {
        render: (domainRecordParams: DomainRecord) => {
          const { id, name, target, ttl_sec } = domainRecordParams;
          return (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: handlers.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name || props.domain.domain}
              onEdit={handlers.openForEditARecord}
            />
          );
        },
        title: '',
      },
    ],
    data: props.domainRecords.filter(
      (record) => typeEq('AAAA')(record) || typeEq('A')(record)
    ),
    link: () =>
      createLink('Add an A/AAAA Record', handlers.openForCreateARecord),
    order: 'asc',
    orderBy: 'name',
    title: 'A/AAAA Record',
  },

  /** CNAME Record */
  {
    columns: [
      { render: (record: DomainRecord) => record.name, title: 'Hostname' },
      { render: (record: DomainRecord) => record.target, title: 'Aliases to' },
      {
        render: (record: DomainRecord) => getTimeColumn(record, 'ttl_sec'),
        title: 'TTL',
      },
      {
        render: (domainRecordParams: DomainRecord) => {
          const { id, name, target, ttl_sec } = domainRecordParams;
          return (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: handlers.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={handlers.openForEditCNAMERecord}
            />
          );
        },
        title: '',
      },
    ],
    data: props.domainRecords.filter(typeEq('CNAME')),
    link: () =>
      createLink('Add a CNAME Record', handlers.openForCreateCNAMERecord),
    order: 'asc',
    orderBy: 'name',
    title: 'CNAME Record',
  },

  /** TXT Record */
  {
    columns: [
      {
        render: (record: DomainRecord) => record.name || props.domain.domain,
        title: 'Hostname',
      },
      {
        render: (record: DomainRecord) => truncateEnd(record.target, 100),
        title: 'Value',
      },
      {
        render: (record: DomainRecord) => getTimeColumn(record, 'ttl_sec'),
        title: 'TTL',
      },
      {
        render: (domainRecordParams: DomainRecord) => {
          const { id, name, target, ttl_sec } = domainRecordParams;
          return (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: handlers.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={handlers.openForEditTXTRecord}
            />
          );
        },
        title: '',
      },
    ],
    data: props.domainRecords.filter(typeEq('TXT')),
    link: () => createLink('Add a TXT Record', handlers.openForCreateTXTRecord),
    order: 'asc',
    orderBy: 'name',
    title: 'TXT Record',
  },
  /** SRV Record */
  {
    columns: [
      {
        render: (record: DomainRecord) => record.name,
        title: 'Service/Protocol',
      },
      {
        render: () => props.domain.domain,
        title: 'Name',
      },
      {
        render: (record: DomainRecord) => String(record.priority),
        title: 'Priority',
      },
      {
        render: (record: DomainRecord) => String(record.weight),
        title: 'Weight',
      },
      { render: (record: DomainRecord) => String(record.port), title: 'Port' },
      { render: (record: DomainRecord) => record.target, title: 'Target' },
      {
        render: (record: DomainRecord) => getTimeColumn(record, 'ttl_sec'),
        title: 'TTL',
      },
      {
        render: ({
          id,
          port,
          priority,
          protocol,
          service,
          target,
          weight,
        }: DomainRecord) => (
          <DomainRecordActionMenu
            deleteData={{
              onDelete: handlers.confirmDeletion,
              recordID: id,
            }}
            editPayload={{
              id,
              port,
              priority,
              protocol,
              service,
              target,
              weight,
            }}
            label={props.domain.domain}
            onEdit={handlers.openForEditSRVRecord}
          />
        ),
        title: '',
      },
    ],
    data: props.domainRecords.filter(typeEq('SRV')),
    link: () =>
      createLink('Add an SRV Record', handlers.openForCreateSRVRecord),
    order: 'asc',
    orderBy: 'name',
    title: 'SRV Record',
  },

  /** CAA Record */
  {
    columns: [
      { render: (record: DomainRecord) => record.name, title: 'Name' },
      { render: (record: DomainRecord) => record.tag, title: 'Tag' },
      {
        render: (record: DomainRecord) => record.target,
        title: 'Value',
      },
      {
        render: (record: DomainRecord) => getTimeColumn(record, 'ttl_sec'),
        title: 'TTL',
      },
      {
        render: (domainRecordParams: DomainRecord) => {
          const { id, name, tag, target, ttl_sec } = domainRecordParams;
          return (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: handlers.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                tag,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={handlers.openForEditCAARecord}
            />
          );
        },
        title: '',
      },
    ],
    data: props.domainRecords.filter(typeEq('CAA')),
    link: () => createLink('Add a CAA Record', handlers.openForCreateCAARecord),
    order: 'asc',
    orderBy: 'name',
    title: 'CAA Record',
  },
];
