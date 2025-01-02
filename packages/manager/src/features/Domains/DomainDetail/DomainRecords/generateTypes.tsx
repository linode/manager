import { Button } from '@linode/ui';
import { compose, isEmpty, pathOr } from 'ramda';
import React from 'react';

import { truncateEnd } from 'src/utilities/truncate';

import { DomainRecordActionMenu } from './DomainRecordActionMenu';
import {
  getNSRecords,
  getTTL,
  msToReadable,
  typeEq,
} from './DomainRecordsUtils';

import type { Props as DomainRecordsProps } from './DomainRecords';
import type { Domain, DomainRecord } from '@linode/api-v4/lib/domains';

export interface IType {
  columns: {
    render: (r: Domain | DomainRecord) => JSX.Element | null | string;
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
  handleOpenSOADrawer: (d: Domain) => void;
  openForCreateARecord: () => void;
  openForCreateCAARecord: () => void;
  openForCreateCNAMERecord: () => void;
  openForCreateMXRecord: () => void;
  openForCreateNSRecord: () => void;
  openForCreateSRVRecord: () => void;
  openForCreateTXTRecord: () => void;
  openForEditARecord: (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditCAARecord: (
    f: Pick<DomainRecord, 'id' | 'name' | 'tag' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditCNAMERecord: (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditMXRecord: (
    f: Pick<DomainRecord, 'id' | 'name' | 'priority' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditNSRecord: (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => void;
  openForEditSRVRecord: (
    f: Pick<
      DomainRecord,
      'id' | 'name' | 'port' | 'priority' | 'protocol' | 'target' | 'weight'
    >
  ) => void;
  openForEditTXTRecord: (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
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
        render: (d: Domain) => d.domain,
        title: 'Primary Domain',
      },
      {
        render: (d: Domain) => d.soa_email,
        title: 'Email',
      },
      {
        render: getTTL,
        title: 'Default TTL',
      },
      {
        render: compose(msToReadable, pathOr(0, ['refresh_sec'])),
        title: 'Refresh Rate',
      },
      {
        render: compose(msToReadable, pathOr(0, ['retry_sec'])),
        title: 'Retry Rate',
      },
      {
        render: compose(msToReadable, pathOr(0, ['expire_sec'])),
        title: 'Expire Time',
      },
      {
        render: (d: Domain) => {
          return d.type === 'master' ? (
            <DomainRecordActionMenu
              editPayload={d}
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
        render: (r: DomainRecord) => r.target,
        title: 'Name Server',
      },
      {
        render: (r: DomainRecord) => {
          const sd = r.name;
          return isEmpty(sd)
            ? props.domain.domain
            : `${sd}.${props.domain.domain}`;
        },
        title: 'Subdomain',
      },
      {
        render: getTTL,
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
        render: (r: DomainRecord) => r.target,
        title: 'Mail Server',
      },
      {
        render: (r: DomainRecord) => String(r.priority),
        title: 'Preference',
      },
      {
        render: (r: DomainRecord) => r.name,
        title: 'Subdomain',
      },
      {
        render: getTTL,
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
        render: (r: DomainRecord) => r.name || props.domain.domain,
        title: 'Hostname',
      },
      { render: (r: DomainRecord) => r.target, title: 'IP Address' },
      { render: getTTL, title: 'TTL' },
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
      (r) => typeEq('AAAA', r) || typeEq('A', r)
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
      { render: (r: DomainRecord) => r.name, title: 'Hostname' },
      { render: (r: DomainRecord) => r.target, title: 'Aliases to' },
      { render: getTTL, title: 'TTL' },
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
        render: (r: DomainRecord) => r.name || props.domain.domain,
        title: 'Hostname',
      },
      {
        render: (r: DomainRecord) => truncateEnd(r.target, 100),
        title: 'Value',
      },
      { render: getTTL, title: 'TTL' },
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
      { render: (r: DomainRecord) => r.name, title: 'Service/Protocol' },
      {
        render: () => props.domain.domain,
        title: 'Name',
      },
      {
        render: (r: DomainRecord) => String(r.priority),
        title: 'Priority',
      },
      {
        render: (r: DomainRecord) => String(r.weight),
        title: 'Weight',
      },
      { render: (r: DomainRecord) => String(r.port), title: 'Port' },
      { render: (r: DomainRecord) => r.target, title: 'Target' },
      { render: getTTL, title: 'TTL' },
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
      { render: (r: DomainRecord) => r.name, title: 'Name' },
      { render: (r: DomainRecord) => r.tag, title: 'Tag' },
      {
        render: (r: DomainRecord) => r.target,
        title: 'Value',
      },
      { render: getTTL, title: 'TTL' },
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
