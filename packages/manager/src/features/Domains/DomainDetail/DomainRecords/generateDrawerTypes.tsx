import * as React from 'react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import {
  DefaultTTLField,
  DomainTransferField,
  ExpireField,
  NameOrTargetField,
  PortField,
  PriorityField,
  ProtocolField,
  RefreshRateField,
  RetryRateField,
  ServiceField,
  TagField,
  TextField,
  TTLField,
  WeightField,
} from './DomainRecordDrawerFields';
import { defaultFieldsState } from './DomainRecordDrawerUtils';

import type {
  DomainRecordDrawerProps,
  EditableDomainFields,
  EditableRecordFields,
} from './DomainRecordDrawer';

type FieldRenderFunction = (idx: number) => JSX.Element;

interface RecordTypeFields {
  fields: FieldRenderFunction[];
}

interface DrawerTypes {
  A: RecordTypeFields;
  AAAA: RecordTypeFields;
  CAA: RecordTypeFields;
  CNAME: RecordTypeFields;
  master: RecordTypeFields;
  MX: RecordTypeFields;
  NS: RecordTypeFields;
  PTR: RecordTypeFields;
  slave: RecordTypeFields;
  SRV: RecordTypeFields;
  TXT: RecordTypeFields;
}

export const generateDrawerTypes = (
  props: Pick<DomainRecordDrawerProps, 'domain' | 'type'>,
  control: Control<EditableDomainFields | EditableRecordFields>
): DrawerTypes => {
  return {
    A: {
      fields: [],
    },
    AAAA: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`aaaa-name-${idx}`}
            name="name"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="name"
                label="Hostname"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['name']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`aaaa-target-${idx}`}
            name="target"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="target"
                label="IP Address"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['target']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`aaaa-ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <TTLField
                data-testid="aaaa-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
      ],
    },
    CAA: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`caa-name-${idx}`}
            name="name"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="name"
                label="Name"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['name']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`caa-tag-${idx}`}
            name="tag"
            render={({ field }) => (
              <TagField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['tag']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`caa-target-${idx}`}
            name="target"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="target"
                label="Value"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['target']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`caa-ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <TTLField
                data-testid="caa-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
      ],
    },
    CNAME: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`cname-name-${idx}`}
            name="name"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                data-testid="cname-name"
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="name"
                label="Hostname"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['name']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`cname-target-${idx}`}
            name="target"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="target"
                label="Alias to"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['target']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`cname-ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <TTLField
                data-testid="cname-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
      ],
    },
    MX: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`mx-target-${idx}`}
            name="target"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="target"
                label="Mail Server"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['target']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`mx-priority-${idx}`}
            name="priority"
            render={({ field, fieldState }) => (
              <PriorityField
                errorText={fieldState.error?.message}
                label="Preference"
                max={255}
                min={0}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['priority']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`mx-ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <TTLField
                data-testid="mx-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`mx-name-${idx}`}
            name="name"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="name"
                label="Subdomain"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['name']}
              />
            )}
          />
        ),
      ],
    },
    NS: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`ns-target-${idx}`}
            name="target"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="target"
                label="Name Server"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['target']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`ns-name-${idx}`}
            name="name"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                data-testid="ns-name"
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="name"
                label="Subdomain"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['name']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`ns-ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <TTLField
                data-testid="ns-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
      ],
    },
    PTR: {
      fields: [],
    },
    SRV: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`srv-service-${idx}`}
            name="service"
            render={({ field, fieldState }) => (
              <ServiceField
                errorText={fieldState.error?.message}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['service']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`srv-protocol-${idx}`}
            name="protocol"
            render={({ field }) => (
              <ProtocolField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['protocol']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`srv-priority-${idx}`}
            name="priority"
            render={({ field, fieldState }) => (
              <PriorityField
                errorText={fieldState.error?.message}
                label="Priority"
                max={255}
                min={0}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['priority']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`srv-weight-${idx}`}
            name="weight"
            render={({ field, fieldState }) => (
              <WeightField
                errorText={fieldState.error?.message}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['weight']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`srv-port-${idx}`}
            name="port"
            render={({ field, fieldState }) => (
              <PortField
                errorText={fieldState.error?.message}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['port']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`srv-target-${idx}`}
            name="target"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="target"
                label="Target"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['target']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`srv-ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <TTLField
                data-testid="srv-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
      ],
    },
    TXT: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`txt-name-${idx}`}
            name="name"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                data-testid="txt-name"
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="name"
                label="Hostname"
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['name']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`txt-target-${idx}`}
            name="target"
            render={({ field, fieldState }) => (
              <NameOrTargetField
                domain={props.domain}
                errorText={fieldState.error?.message}
                field="target"
                label="Value"
                multiline
                onBlur={field.onBlur}
                onChange={field.onChange}
                type={props.type}
                value={field.value ?? defaultFieldsState(props)['target']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`txt-ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <TTLField
                data-testid="txt-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
      ],
    },
    master: {
      fields: [
        (idx: number) => (
          <Controller
            control={control}
            key={`domain-${idx}`}
            name="domain"
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="Domain"
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={
                  field.value ??
                  (defaultFieldsState(props)['domain'] as number | string)
                }
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`soa-email-${idx}`}
            name="soa_email"
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                label="SOA Email"
                onBlur={field.onBlur}
                onChange={field.onChange}
                trimmed
                value={
                  field.value ??
                  (defaultFieldsState(props)['soa_email'] as number | string)
                }
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`axfr-ips-${idx}`}
            name="axfr_ips"
            render={({ field, fieldState }) => (
              <DomainTransferField
                errorText={fieldState.error?.message}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`ttl-sec-${idx}`}
            name="ttl_sec"
            render={({ field }) => (
              <DefaultTTLField
                data-testid="ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`refresh-sec-${idx}`}
            name="refresh_sec"
            render={({ field }) => (
              <RefreshRateField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['refresh_sec']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`retry-sec-${idx}`}
            name="retry_sec"
            render={({ field }) => (
              <RetryRateField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['retry_sec']}
              />
            )}
          />
        ),
        (idx: number) => (
          <Controller
            control={control}
            key={`expire-sec-${idx}`}
            name="expire_sec"
            render={({ field }) => (
              <ExpireField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['expire_sec']}
              />
            )}
          />
        ),
      ],
    },
    slave: {
      fields: [],
    },
  };
};
