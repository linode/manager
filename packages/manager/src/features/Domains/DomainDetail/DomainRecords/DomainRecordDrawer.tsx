import {
  createDomainRecord,
  updateDomainRecord,
} from '@linode/api-v4/lib/domains';
import { TextField as _TextField, Autocomplete, Notice } from '@linode/ui';
import { defaultTo, path, pathOr } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import { extendedIPToString, stringToExtendedIP } from 'src/utilities/ipUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import {
  transferHelperText as helperText,
  isValidCNAME,
  isValidDomainRecord,
} from '../../domainUtils';
import {
  castFormValuesToNumeric,
  defaultFieldsState,
  filterDataByType,
  modeMap,
  resolve,
  resolveAlias,
  shouldResolve,
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
import type { ExtendedIP } from 'src/utilities/ipUtils';

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

interface State {
  errors?: APIError[];
  fields: EditableDomainFields | EditableRecordFields;
  submitting: boolean;
}

interface AdjustedTextFieldProps {
  field: keyof EditableDomainFields | keyof EditableRecordFields;
  helperText?: string;
  label: string;
  max?: number;
  min?: number;
  multiline?: boolean;
  placeholder?: string;
  trimmed?: boolean;
}

interface NumberFieldProps extends AdjustedTextFieldProps {
  defaultValue?: number;
}

export const DomainRecordDrawer = (props: DomainRecordDrawerProps) => {
  const errorFields = {
    axfr_ips: 'domain transfers',
    domain: 'domain',
    expire_sec: 'expire rate',
    name: 'name',
    port: 'port',
    priority: 'priority',
    protocol: 'protocol',
    refresh_sec: 'refresh rate',
    retry_sec: 'retry rate',
    service: 'service',
    soa_email: 'SOA email address',
    tag: 'tag',
    target: 'target',
    ttl_sec: 'ttl_sec',
    type: 'type',
    weight: 'weight',
  };

  const DefaultTTLField = () => (
    <MSSelect field="ttl_sec" fn={setTTLSec} label="Default TTL" />
  );

  const DomainTransferField = () => {
    const finalIPs = (
      (state.fields as EditableDomainFields).axfr_ips ?? ['']
    ).map(stringToExtendedIP);
    return (
      <MultipleIPInput
        error={getAPIErrorFor(errorFields, state.errors)('axfr_ips')}
        helperText={helperText}
        ips={finalIPs}
        onChange={handleTransferUpdate}
        title="Domain Transfer IPs"
      />
    );
  };

  const ExpireField = () => {
    const rateOptions = [
      { label: 'Default', value: 0 },
      { label: '1 week', value: 604800 },
      { label: '2 weeks', value: 1209600 },
      { label: '4 weeks', value: 2419200 },
    ];

    const defaultRate = rateOptions.find((eachRate) => {
      return (
        eachRate.value ===
        defaultTo(
          defaultFieldsState(props).expire_sec,
          (state.fields as EditableDomainFields).expire_sec
        )
      );
    });

    return (
      <Autocomplete
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'Expire Rate',
          },
        }}
        disableClearable
        label="Expire Rate"
        onChange={(_, selected) => setExpireSec(selected?.value)}
        options={rateOptions}
        value={defaultRate}
      />
    );
  };

  const MSSelect = ({
    field,
    fn,
    label,
  }: {
    field: keyof EditableDomainFields | keyof EditableRecordFields;
    fn: (v: number) => void;
    label: string;
  }) => {
    const MSSelectOptions = [
      { label: 'Default', value: 0 },
      { label: '30 seconds', value: 30 },
      { label: '2 minutes', value: 120 },
      { label: '5 minutes', value: 300 },
      { label: '1 hour', value: 3600 },
      { label: '2 hours', value: 7200 },
      { label: '4 hours', value: 14400 },
      { label: '8 hours', value: 28800 },
      { label: '16 hours', value: 57600 },
      { label: '1 day', value: 86400 },
      { label: '2 days', value: 172800 },
      { label: '4 days', value: 345600 },
      { label: '1 week', value: 604800 },
      { label: '2 weeks', value: 1209600 },
      { label: '4 weeks', value: 2419200 },
    ];

    const defaultOption = MSSelectOptions.find((eachOption) => {
      return (
        eachOption.value ===
        defaultTo(
          defaultFieldsState(props)[field],
          (state.fields as EditableDomainFields & EditableRecordFields)[field]
        )
      );
    });

    return (
      <Autocomplete
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': label,
          },
        }}
        disableClearable
        label={label}
        onChange={(_, selected) => fn(selected.value)}
        options={MSSelectOptions}
        value={defaultOption}
      />
    );
  };

  const NameOrTargetField = ({
    field,
    label,
    multiline,
  }: {
    field: 'name' | 'target';
    label: string;
    multiline?: boolean;
  }) => {
    const { domain, type } = props;
    const value = (state.fields as EditableDomainFields & EditableRecordFields)[
      field
    ];
    const hasAliasToResolve =
      value && value.indexOf('@') >= 0 && shouldResolve(type, field);
    return (
      <TextField
        placeholder={
          shouldResolve(type, field) ? 'hostname or @ for root' : undefined
        }
        field={field}
        helperText={hasAliasToResolve ? resolve(value, domain) : undefined}
        label={label}
        multiline={multiline}
      />
    );
  };

  const NumberField = ({ field, label, ...rest }: NumberFieldProps) => {
    return (
      <_TextField
        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          updateField(field)(e.target.value)
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          updateField(field)(e.target.value)
        }
        value={
          (state.fields as EditableDomainFields & EditableRecordFields)[
            field
          ] as number
        }
        data-qa-target={label}
        errorText={getAPIErrorFor(errorFields, state.errors)(field)}
        label={label}
        type="number"
        {...rest}
      />
    );
  };

  const PortField = () => <NumberField field="port" label="Port" />;

  const PriorityField = (props: {
    label: string;
    max: number;
    min: number;
  }) => <NumberField field="priority" {...props} />;

  const ProtocolField = () => {
    const protocolOptions = [
      { label: 'tcp', value: 'tcp' },
      { label: 'udp', value: 'udp' },
      { label: 'xmpp', value: 'xmpp' },
      { label: 'tls', value: 'tls' },
      { label: 'smtp', value: 'smtp' },
    ];

    const defaultProtocol = protocolOptions.find((eachProtocol) => {
      return (
        eachProtocol.value ===
        defaultTo(
          defaultFieldsState(props).protocol,
          (state.fields as EditableRecordFields).protocol
        )
      );
    });

    return (
      <Autocomplete
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'Protocol',
          },
        }}
        disableClearable
        label="Protocol"
        onChange={(_, selected) => setProtocol(selected.value)}
        options={protocolOptions}
        value={defaultProtocol}
      />
    );
  };

  const RefreshRateField = () => (
    <MSSelect field="refresh_sec" fn={setRefreshSec} label="Refresh Rate" />
  );

  const RetryRateField = () => (
    <MSSelect field="retry_sec" fn={setRetrySec} label="Retry Rate" />
  );

  const ServiceField = () => <TextField field="service" label="Service" />;

  const TTLField = () => (
    <MSSelect field="ttl_sec" fn={setTTLSec} label="TTL" />
  );

  const TagField = () => {
    const tagOptions = [
      { label: 'issue', value: 'issue' },
      { label: 'issuewild', value: 'issuewild' },
      { label: 'iodef', value: 'iodef' },
    ];

    const defaultTag = tagOptions.find((eachTag) => {
      return (
        eachTag.value ===
        defaultTo(
          defaultFieldsState(props).tag,
          (state.fields as EditableRecordFields).tag
        )
      );
    });
    return (
      <Autocomplete
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'caa tag',
          },
        }}
        disableClearable
        label="Tag"
        onChange={(_, selected) => setTag(selected.value)}
        options={tagOptions}
        value={defaultTag}
      />
    );
  };

  const TextField = ({
    field,
    helperText,
    label,
    multiline,
    placeholder,
    trimmed,
  }: AdjustedTextFieldProps) => (
    // NOTE: Need to check this why onChange is causing problem here.....
    <_TextField
      onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        updateField(field)(e.target.value)
      }
      // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      //   updateField(field)(e.target.value)
      // }
      value={defaultTo(
        defaultFieldsState(props)[field] as number | string,
        (state.fields as EditableDomainFields & EditableRecordFields)[field] as
          | number
          | string
      )}
      data-qa-target={label}
      errorText={getAPIErrorFor(errorFields, state.errors)(field)}
      helperText={helperText}
      label={label}
      multiline={multiline}
      placeholder={placeholder}
      trimmed={trimmed}
    />
  );

  const WeightField = () => <NumberField field="weight" label="Weight" />;

  const handleRecordSubmissionSuccess = () => {
    props.updateRecords();
    onClose();
  };

  const handleSubmissionErrors = (errorResponse: APIError[]) => {
    const errors = getAPIErrorOrDefault(errorResponse);
    setState((prevState) => {
      const newState = { ...prevState, errors, submitting: false };
      scrollErrorIntoView();
      return newState;
    });
  };

  const handleTransferUpdate = (transferIPs: ExtendedIP[]) => {
    const axfrIps =
      transferIPs.length > 0 ? transferIPs.map(extendedIPToString) : [''];
    updateField('axfr_ips')(axfrIps);
  };

  const onClose = () => {
    setState({
      errors: undefined,
      fields: defaultFieldsState({}),
      submitting: false,
    });
    props.onClose();
  };

  const onDomainEdit = () => {
    const { domainId, type, updateDomain } = props;
    setState((prevState) => ({
      ...prevState,
      errors: undefined,
      submitting: true,
    }));

    const data = {
      ...filterDataByType(state.fields, type),
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

    updateDomain({ id: domainId, ...data, status: 'active' })
      .then(() => {
        onClose();
      })
      .catch(handleSubmissionErrors);
  };

  const onRecordCreate = () => {
    const { domain, records, type } = props;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave') {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      errors: undefined,
      submitting: true,
    }));

    const _data = {
      type,
      ...filterDataByType(state.fields, type),
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

    createDomainRecord(props.domainId, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  const onRecordEdit = () => {
    const { domain, domainId, id, type } = props;
    const fields = state.fields as EditableRecordFields;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave' || !id) {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      errors: undefined,
      submitting: true,
    }));

    const _data = {
      ...filterDataByType(fields, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);
    updateDomainRecord(domainId, id, data)
      .then(handleRecordSubmissionSuccess)
      .catch(handleSubmissionErrors);
  };

  const updateField = (
    key: keyof EditableDomainFields | keyof EditableRecordFields
  ) => (value: any) => {
    setState((prevState) => ({
      ...prevState,
      fields: {
        ...prevState.fields,
        [key]: value,
      },
    }));
  };

  // eslint-disable-next-line perfectionist/sort-classes
  const setExpireSec = updateField('expire_sec');

  const setProtocol = updateField('protocol');

  const setRefreshSec = updateField('refresh_sec');

  const setRetrySec = updateField('retry_sec');

  const setTTLSec = updateField('ttl_sec');

  const setTag = updateField('tag');

  const [state, setState] = React.useState<State>({
    fields: defaultFieldsState(props),
    submitting: false,
  });

  React.useEffect(() => {
    if (props.open) {
      setState((prevState) => ({
        ...prevState,
        fields: defaultFieldsState(props),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const types = {
    A: {
      fields: [],
    },
    AAAA: {
      fields: [
        (idx: number) => (
          <NameOrTargetField field="name" key={idx} label="Hostname" />
        ),
        (idx: number) => (
          <NameOrTargetField field="target" key={idx} label="IP Address" />
        ),
        (idx: number) => <TTLField key={idx} />,
      ],
    },
    CAA: {
      fields: [
        (idx: number) => (
          <NameOrTargetField field="name" key={idx} label="Name" />
        ),
        (idx: number) => <TagField key={idx} />,
        (idx: number) => (
          <NameOrTargetField field="target" key={idx} label="Value" />
        ),
        (idx: number) => <TTLField key={idx} />,
      ],
    },
    CNAME: {
      fields: [
        (idx: number) => (
          <NameOrTargetField field="name" key={idx} label="Hostname" />
        ),
        (idx: number) => (
          <NameOrTargetField field="target" key={idx} label="Alias to" />
        ),
        (idx: number) => <TTLField key={idx} />,
        ,
      ],
    },
    MX: {
      fields: [
        (idx: number) => (
          <NameOrTargetField field="target" key={idx} label="Mail Server" />
        ),
        ,
        (idx: number) => (
          <PriorityField key={idx} label="Preference" max={255} min={0} />
        ),
        (idx: number) => <TTLField key={idx} />,
        (idx: number) => (
          <NameOrTargetField field="name" key={idx} label="Subdomain" />
        ),
      ],
    },
    NS: {
      fields: [
        (idx: number) => (
          <NameOrTargetField field="target" key={idx} label="Name Server" />
        ),
        (idx: number) => (
          <NameOrTargetField field="name" key={idx} label="Subdomain" />
        ),
        (idx: number) => <TTLField key={idx} />,
      ],
    },
    PTR: {
      fields: [],
    },
    SRV: {
      fields: [
        (idx: number) => <ServiceField key={idx} />,
        (idx: number) => <ProtocolField key={idx} />,
        (idx: number) => (
          <PriorityField key={idx} label="Priority" max={255} min={0} />
        ),
        (idx: number) => <WeightField key={idx} />,
        (idx: number) => <PortField key={idx} />,
        (idx: number) => (
          <NameOrTargetField field="target" key={idx} label="Target" />
        ),
        (idx: number) => <TTLField key={idx} />,
      ],
    },
    TXT: {
      fields: [
        (idx: number) => (
          <NameOrTargetField field="name" key={idx} label="Hostname" />
        ),
        (idx: number) => (
          <NameOrTargetField field="target" key={idx} label="Value" multiline />
        ),
        (idx: number) => <TTLField key={idx} />,
      ],
    },
    master: {
      fields: [
        (idx: number) => <TextField field="domain" key={idx} label="Domain" />,
        (idx: number) => (
          <TextField field="soa_email" key={idx} label="SOA Email" trimmed />
        ),
        (idx: number) => <DomainTransferField key={idx} />,
        (idx: number) => <DefaultTTLField key={idx} />,
        (idx: number) => <RefreshRateField key={idx} />,
        (idx: number) => <RetryRateField key={idx} />,
        (idx: number) => <ExpireField key={idx} />,
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

  const otherErrors = [
    getAPIErrorFor({}, state.errors)('_unknown'),
    getAPIErrorFor({}, state.errors)('none'),
  ].filter(Boolean);

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`${path([mode], modeMap)} ${path([type], typeMap)} Record`}
    >
      {otherErrors.length > 0 &&
        otherErrors.map((err, index) => {
          return <Notice key={index} text={err} variant="error" />;
        })}
      {!hasARecords && type === 'NS' && (
        <Notice spacingTop={8} text={noARecordsNoticeText} variant="warning" />
      )}
      {fields.map((field, idx) =>
        field && typeof field === 'function' ? field(idx) : null
      )}

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'save',
          disabled: state.submitting,
          label: 'Save',
          loading: state.submitting,
          onClick: isDomain
            ? onDomainEdit
            : isCreating
            ? onRecordCreate
            : onRecordEdit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Cancel',
          onClick: onClose,
        }}
      />
    </Drawer>
  );
};
