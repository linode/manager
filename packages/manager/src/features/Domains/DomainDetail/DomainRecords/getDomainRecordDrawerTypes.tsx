import * as React from 'react';
import { Controller } from 'react-hook-form';

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
  TTLField,
  TagField,
  TextField,
  WeightField,
} from './DomainRecordDrawerFields';
import { defaultFieldsState } from './DomainRecordDrawerUtils';

import type {
  DomainRecordDrawerProps,
  EditableDomainFields,
  EditableRecordFields,
} from './DomainRecordDrawer';
import type { Control } from 'react-hook-form';

export const getDomainRecordDrawerTypes = (
  props: Pick<DomainRecordDrawerProps, 'domain' | 'type'>,
  control: Control<Partial<EditableDomainFields | EditableRecordFields>>
) => {
  return {
    A: {
      fields: [],
    },
    AAAA: {
      fields: [
        (idx: number) => (
          // <NameOrTargetField field="name" key={idx} label="Hostname" />
          <Controller
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
            control={control}
            key={`aaaa-name-${idx}`}
            name="name"
          />
        ),
        (idx: number) => (
          // <NameOrTargetField field="target" key={idx} label="IP Address" />
          <Controller
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
            control={control}
            key={`aaaa-target-${idx}`}
            name="target"
          />
        ),
        (idx: number) => (
          // <TTLField key={idx} />
          <Controller
            render={({ field }) => (
              <TTLField
                data-testid="aaaa-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`aaaa-ttl-sec-${idx}`}
            name="ttl_sec"
          />
        ),
      ],
    },
    CAA: {
      fields: [
        (idx: number) => (
          // <NameOrTargetField field="name" key={idx} label="Name" />
          <Controller
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
            control={control}
            key={`caa-name-${idx}`}
            name="name"
          />
        ),
        (idx: number) => (
          // <TagField key={idx} />
          <Controller
            render={({ field }) => (
              <TagField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['tag']}
              />
            )}
            control={control}
            key={`caa-tag-${idx}`}
            name="tag"
          />
        ),
        (idx: number) => (
          // <NameOrTargetField field="target" key={idx} label="Value" />
          <Controller
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
            control={control}
            key={`caa-target-${idx}`}
            name="target"
          />
        ),
        (idx: number) => (
          // <TTLField key={idx} />
          <Controller
            render={({ field }) => (
              <TTLField
                data-testid="caa-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`caa-ttl-sec-${idx}`}
            name="ttl_sec"
          />
        ),
      ],
    },
    CNAME: {
      fields: [
        (idx: number) => (
          // <NameOrTargetField field="name" key={idx} label="Hostname" />
          <Controller
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
            control={control}
            key={`cname-name-${idx}`}
            name="name"
          />
        ),
        (idx: number) => (
          // <NameOrTargetField field="target" key={idx} label="Alias to" />
          <Controller
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
            control={control}
            key={`cname-target-${idx}`}
            name="target"
          />
        ),
        (idx: number) => (
          // <TTLField key={idx} />
          <Controller
            render={({ field }) => (
              <TTLField
                data-testid="cname-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`cname-ttl-sec-${idx}`}
            name="ttl_sec"
          />
        ),
        ,
      ],
    },
    MX: {
      fields: [
        (idx: number) => (
          // <NameOrTargetField field="target" key={idx} label="Mail Server" />
          <Controller
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
            control={control}
            key={`mx-target-${idx}`}
            name="target"
          />
        ),
        ,
        (idx: number) => (
          // <PriorityField key={idx} label="Preference" max={255} min={0} />
          <Controller
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
            control={control}
            key={`mx-priority-${idx}`}
            name="priority"
          />
        ),
        (idx: number) => (
          // <TTLField key={idx} />
          <Controller
            render={({ field }) => (
              <TTLField
                data-testid="mx-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`mx-ttl-sec-${idx}`}
            name="ttl_sec"
          />
        ),
        (idx: number) => (
          // <NameOrTargetField field="name" key={idx} label="Subdomain" />
          <Controller
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
            control={control}
            key={`mx-name-${idx}`}
            name="name"
          />
        ),
      ],
    },
    NS: {
      fields: [
        (idx: number) => (
          // <NameOrTargetField field="target" key={idx} label="Name Server" />
          <Controller
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
            control={control}
            key={`ns-target-${idx}`}
            name="target"
          />
        ),
        (idx: number) => (
          // <NameOrTargetField field="name" key={idx} label="Subdomain" />
          <Controller
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
            control={control}
            key={`ns-name-${idx}`}
            name="name"
          />
        ),
        (idx: number) => (
          // <TTLField key={idx} />
          <Controller
            render={({ field }) => (
              <TTLField
                data-testid="ns-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`ns-ttl-sec-${idx}`}
            name="ttl_sec"
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
          // <ServiceField key={idx} />
          <Controller
            render={({ field, fieldState }) => (
              <ServiceField
                errorText={fieldState.error?.message}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['service']}
              />
            )}
            control={control}
            key={`srv-service-${idx}`}
            name="service"
          />
        ),
        (idx: number) => (
          // <ProtocolField key={idx} />
          <Controller
            render={({ field }) => (
              <ProtocolField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['protocol']}
              />
            )}
            control={control}
            key={`srv-protocol-${idx}`}
            name="protocol"
          />
        ),
        (idx: number) => (
          // <PriorityField key={idx} label="Priority" max={255} min={0} />
          <Controller
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
            control={control}
            key={`srv-priority-${idx}`}
            name="priority"
          />
        ),
        (idx: number) => (
          // <WeightField key={idx} />
          <Controller
            render={({ field, fieldState }) => (
              <WeightField
                errorText={fieldState.error?.message}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['weight']}
              />
            )}
            control={control}
            key={`srv-weight-${idx}`}
            name="weight"
          />
        ),
        (idx: number) => (
          // <PortField key={idx} />
          <Controller
            render={({ field, fieldState }) => (
              <PortField
                errorText={fieldState.error?.message}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['port']}
              />
            )}
            control={control}
            key={`srv-port-${idx}`}
            name="port"
          />
        ),
        (idx: number) => (
          // <NameOrTargetField field="target" key={idx} label="Target" />
          <Controller
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
            control={control}
            key={`srv-target-${idx}`}
            name="target"
          />
        ),
        (idx: number) => (
          // <TTLField key={idx} />
          <Controller
            render={({ field }) => (
              <TTLField
                data-testid="srv-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`srv-ttl-sec-${idx}`}
            name="ttl_sec"
          />
        ),
      ],
    },
    TXT: {
      fields: [
        (idx: number) => (
          // <NameOrTargetField field="name" key={idx} label="Hostname" />
          <Controller
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
            control={control}
            key={`txt-name-${idx}`}
            name="name"
          />
        ),
        (idx: number) => (
          // <NameOrTargetField field="target" key={idx} label="Value" multiline />
          <Controller
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
            control={control}
            key={`txt-target-${idx}`}
            name="target"
          />
        ),
        (idx: number) => (
          // <TTLField key={idx} />
          <Controller
            render={({ field }) => (
              <TTLField
                data-testid="txt-ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`txt-ttl-sec-${idx}`}
            name="ttl_sec"
          />
        ),
      ],
    },
    master: {
      fields: [
        // (idx: number) => <TextField field="domain" key={idx} label="Domain" />,
        (idx: number) => (
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                value={
                  field.value ??
                  (defaultFieldsState(props)['domain'] as number | string)
                }
                errorText={fieldState.error?.message}
                label="Domain"
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
            control={control}
            key={`domain-${idx}`}
            name="domain"
          />
        ),
        (idx: number) => (
          // <TextField field="soa_email" key={idx} label="SOA Email" trimmed />
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                value={
                  field.value ??
                  (defaultFieldsState(props)['soa_email'] as number | string)
                }
                errorText={fieldState.error?.message}
                label="SOA Email"
                onBlur={field.onBlur}
                onChange={field.onChange}
                trimmed
              />
            )}
            control={control}
            key={`soa-email-${idx}`}
            name="soa_email"
          />
        ),
        (idx: number) => (
          // <DomainTransferField key={idx} />
          <Controller
            render={({ field, fieldState }) => (
              <DomainTransferField
                errorText={fieldState.error?.message}
                onChange={field.onChange}
                value={field.value}
              />
            )}
            control={control}
            key={`axfr-ips-${idx}`}
            name="axfr_ips"
          />
        ),
        (idx: number) => (
          // <DefaultTTLField key={idx} />
          <Controller
            render={({ field }) => (
              <DefaultTTLField
                data-testid="ttl-sec"
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['ttl_sec']}
              />
            )}
            control={control}
            key={`ttl-sec-${idx}`}
            name="ttl_sec"
          />
        ),
        (idx: number) => (
          // <RefreshRateField key={idx} />
          <Controller
            render={({ field }) => (
              <RefreshRateField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['refresh_sec']}
              />
            )}
            control={control}
            key={`refresh-sec-${idx}`}
            name="refresh_sec"
          />
        ),
        (idx: number) => (
          // <RetryRateField key={idx} />
          <Controller
            render={({ field }) => (
              <RetryRateField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['retry_sec']}
              />
            )}
            control={control}
            key={`retry-sec-${idx}`}
            name="retry_sec"
          />
        ),
        (idx: number) => (
          // <ExpireField key={idx} />
          <Controller
            render={({ field }) => (
              <ExpireField
                onChange={field.onChange}
                value={field.value ?? defaultFieldsState(props)['expire_sec']}
              />
            )}
            control={control}
            key={`expire-sec-${idx}`}
            name="expire_sec"
          />
        ),
      ],
    },
    slave: {
      fields: [],
    },
  };
};
