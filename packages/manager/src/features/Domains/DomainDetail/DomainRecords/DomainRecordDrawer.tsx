import {
  createDomainRecord,
  updateDomainRecord,
} from '@linode/api-v4/lib/domains';
import { Notice } from '@linode/ui';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
// import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import { scrollErrorIntoViewV2 } from 'src/utilities/scrollErrorIntoViewV2';

import { isValidCNAME, isValidDomainRecord } from '../../domainUtils';
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
import {
  castFormValuesToNumeric,
  defaultFieldsState,
  filterDataByType,
  modeMap,
  resolveAlias,
  typeMap,
} from './DomainRecordDrawerUtils';

import type {
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  UpdateDomainPayload,
} from '@linode/api-v4/lib/domains';
import type { APIError } from '@linode/api-v4/lib/types';

interface UpdateDomainDataProps extends UpdateDomainPayload {
  id: number;
}

export interface DomainRecordDrawerProps
  extends Partial<Omit<DomainRecord, 'type'>>,
    Partial<Omit<Domain, 'type'>> {
  domain: string;
  domainId: number;
  /**
   * Used to populate fields on edits.
   */
  id?: number;
  mode: 'create' | 'edit';
  onClose: () => void;
  open: boolean;
  records: DomainRecord[];
  type: DomainType | RecordType;

  updateDomain: (data: UpdateDomainDataProps) => Promise<Domain>;
  updateRecords: () => void;
}

interface EditableSharedFields {
  ttl_sec?: number;
}
export interface EditableRecordFields extends EditableSharedFields {
  name?: string;
  port?: string;
  priority?: string;
  protocol?: null | string;
  service?: null | string;
  tag?: null | string;
  target?: string;
  weight?: string;
}

export interface EditableDomainFields extends EditableSharedFields {
  axfr_ips?: string[];
  description?: string;
  domain?: string;
  expire_sec?: number;
  refresh_sec?: number;
  retry_sec?: number;
  soa_email?: string;
  ttl_sec?: number;
}

// interface State {
//   errors?: APIError[];
//   fields: EditableDomainFields | EditableRecordFields;
//   submitting: boolean;
// }

export const DomainRecordDrawer = (props: DomainRecordDrawerProps) => {
  const formContainerRef = React.useRef<HTMLFormElement>(null);

  // const errorFields = {
  //   axfr_ips: 'domain transfers',
  //   domain: 'domain',
  //   expire_sec: 'expire rate',
  //   name: 'name',
  //   port: 'port',
  //   priority: 'priority',
  //   protocol: 'protocol',
  //   refresh_sec: 'refresh rate',
  //   retry_sec: 'retry rate',
  //   service: 'service',
  //   soa_email: 'SOA email address',
  //   tag: 'tag',
  //   target: 'target',
  //   ttl_sec: 'ttl_sec',
  //   type: 'type',
  //   weight: 'weight',
  // };

  const handleRecordSubmissionSuccess = () => {
    props.updateRecords();
    handleClose();
  };

  const handleSubmissionErrors = (errorResponse: APIError[]) => {
    const errors = getAPIErrorOrDefault(errorResponse);
    // setState((prevState) => {
    //   const newState = { ...prevState, errors, submitting: false };
    //   scrollErrorIntoView();
    //   return newState;
    // });

    for (const error of errors) {
      const errorField = error.field as
        | keyof EditableDomainFields
        | keyof EditableRecordFields
        | undefined;

      if (errorField) {
        setError(errorField, {
          message: error.reason,
        });
      } else {
        setError('root', { message: error.reason });
      }

      scrollErrorIntoViewV2(formContainerRef);
    }

    // console.log('errors --->', errors);
  };

  const handleClose = () => {
    // setState({
    //   errors: undefined,
    //   fields: defaultFieldsState({}),
    //   submitting: false,
    // });
    reset();
    props.onClose();
  };

  const onDomainEdit = async (formData: EditableDomainFields) => {
    const { domainId, type, updateDomain } = props;

    const data = {
      ...filterDataByType(formData, type),
    } as Partial<EditableDomainFields>;

    if (data.axfr_ips) {
      /**
       * Don't submit blank strings to the API.
       * Also trim the resulting array, since '192.0.2.0, 192.0.2.1'
       * will submit ' 192.0.2.1', which is an invalid value.
       */
      data.axfr_ips = data.axfr_ips
        .filter((ip) => ip !== '')
        .map((ip) => ip.trim());
    }

    await updateDomain({ id: domainId, ...data, status: 'active' })
      .then(() => {
        handleClose();
      })
      .catch(handleSubmissionErrors);
  };

  const onRecordCreate = async (formData: EditableRecordFields) => {
    const { domain, records, type } = props;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave') {
      return;
    }

    const _data = {
      type,
      ...filterDataByType(formData, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);

    /**
     * Validation
     *
     * This should be done on the API side, but several breaking
     * configurations will currently succeed on their end.
     */
    const _domain = data?.name ?? '';
    const invalidCNAME =
      data.type === 'CNAME' && !isValidCNAME(_domain, records);

    if (!isValidDomainRecord(_domain, records) || invalidCNAME) {
      const error = {
        field: 'name',
        reason: 'Record conflict - CNAMES must be unique',
      };
      handleSubmissionErrors([error]);
      return;
    }

    await createDomainRecord(props.domainId, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  const onRecordEdit = async (formData: EditableRecordFields) => {
    const { domain, domainId, id, type } = props;
    const fields = formData;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave' || !id) {
      return;
    }

    const _data = {
      ...filterDataByType(fields, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);
    await updateDomainRecord(domainId, id, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  // const updateField = (
  //   key: keyof EditableDomainFields | keyof EditableRecordFields
  // ) => (value: any) => {
  //   // NOTE: Issue is somewhere here...
  //   //setState((prevState) => set(lensPath(['fields', key]), value, prevState));
  //   // setState((prevState) => ({
  //   //   ...prevState,
  //   //   fields: {
  //   //     ...prevState.fields,
  //   //     [key]: value,
  //   //   },
  //   // }));
  // };

  // eslint-disable-next-line perfectionist/sort-classes
  // const setExpireSec = updateField('expire_sec');

  // const setProtocol = updateField('protocol');

  // const setRefreshSec = updateField('refresh_sec');

  // const setRetrySec = updateField('retry_sec');

  // const setTTLSec = updateField('ttl_sec');

  // const setTag = updateField('tag');

  // const [state, setState] = React.useState<State>({
  //   fields: defaultFieldsState(props),
  //   submitting: false,
  // });

  // React.useEffect(() => {
  //   if (props.open) {
  //     setState((prevState) => ({
  //       ...prevState,
  //       fields: defaultFieldsState(props),
  //     }));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props.open]);

  const types = {
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
            render={({ field }) => (
              <ServiceField
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
            render={({ field }) => (
              <WeightField
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
            render={({ field }) => (
              <PortField
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
            key={idx}
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
            key={idx}
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
            key={idx}
            name="expire_sec"
          />
        ),
      ],
    },
    slave: {
      fields: [],
    },
  };

  const { mode, open, records, type } = props;
  const { fields } = types[type];
  const isCreating = mode === 'create';
  const isDomain = type === 'master' || type === 'slave';

  // If there are no A/AAAA records and a user tries to add an NS record, they'll see a warning message asking them to add an A/AAAA record.
  const hasARecords = records.find((thisRecord) =>
    ['A', 'AAAA'].includes(thisRecord.type)
  );

  const noARecordsNoticeText =
    'Please create an A/AAAA record for this domain to avoid a Zone File invalidation.';

  // @todo: [Purvesh] - Need to handle other errors

  // const otherErrors = [
  //   getAPIErrorFor({}, state.errors)('_unknown'),
  //   getAPIErrorFor({}, state.errors)('none'),
  // ].filter(Boolean);

  const defaultValues = defaultFieldsState(props);

  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm<Partial<EditableDomainFields | EditableRecordFields>>({
    defaultValues,
    mode: 'onBlur',
    values: defaultValues,
  });

  const onSubmit = handleSubmit(async (data) => {
    if (isDomain) {
      await onDomainEdit(data);
    } else if (isCreating) {
      await onRecordCreate(data);
    } else {
      await onRecordEdit(data);
    }
  });

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`${path([mode], modeMap)} ${path([type], typeMap)} Record`}
    >
      <form onSubmit={onSubmit} ref={formContainerRef}>
        {/* {otherErrors.length > 0 &&
          otherErrors.map((err, index) => {
            return <Notice key={index} text={err} variant="error" />;
          })} */}
        {!hasARecords && type === 'NS' && (
          <Notice
            spacingTop={8}
            text={noARecordsNoticeText}
            variant="warning"
          />
        )}
        {fields.map((field, idx) =>
          field && typeof field === 'function' ? field(idx) : null
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save',
            disabled: isSubmitting,
            label: 'Save',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};
