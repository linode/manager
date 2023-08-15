import {
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  UpdateDomainPayload,
  createDomainRecord,
  updateDomainRecord,
} from '@linode/api-v4/lib/domains';
import { APIError } from '@linode/api-v4/lib/types';
import produce from 'immer';
import {
  cond,
  defaultTo,
  equals,
  lensPath,
  path,
  pathOr,
  pick,
  set,
} from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP,
} from 'src/utilities/ipUtils';
import { maybeCastToNumber } from 'src/utilities/maybeCastToNumber';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import {
  getInitialIPs,
  transferHelperText as helperText,
  isValidCNAME,
  isValidDomainRecord,
} from './domainUtils';

interface DomainRecordDrawerProps
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

  updateDomain: (data: { id: number } & UpdateDomainPayload) => Promise<Domain>;
  updateRecords: () => void;
}

interface EditableSharedFields {
  ttl_sec?: number;
}
interface EditableRecordFields extends EditableSharedFields {
  name?: string;
  port?: string;
  priority?: string;
  protocol?: null | string;
  service?: null | string;
  tag?: null | string;
  target?: string;
  weight?: string;
}

interface EditableDomainFields extends EditableSharedFields {
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
}

interface NumberFieldProps extends AdjustedTextFieldProps {
  defaultValue?: number;
}

export class DomainRecordDrawer extends React.Component<
  DomainRecordDrawerProps,
  State
> {
  componentDidUpdate(prevProps: DomainRecordDrawerProps) {
    if (this.props.open && !prevProps.open) {
      // Drawer is opening, set the fields according to props
      this.setState({
        fields: DomainRecordDrawer.defaultFieldsState(this.props),
      });
    }
  }

  render() {
    const { submitting } = this.state;
    const { mode, open, records, type } = this.props;
    const { fields } = this.types[type];
    const isCreating = mode === 'create';
    const isDomain = type === 'master' || type === 'slave';

    const hasARecords = records.find((thisRecord) =>
      ['A', 'AAAA'].includes(thisRecord.type)
    ); // If there are no A/AAAA records and a user tries to add an NS record, they'll see a warning message asking them to add an A/AAAA record.

    const noARecordsNoticeText =
      'Please create an A/AAAA record for this domain to avoid a Zone File invalidation.';

    const otherErrors = [
      getAPIErrorsFor({}, this.state.errors)('_unknown'),
      getAPIErrorsFor({}, this.state.errors)('none'),
    ].filter(Boolean);

    return (
      <Drawer
        onClose={this.onClose}
        open={open}
        title={`${path([mode], modeMap)} ${path([type], typeMap)} Record`}
      >
        {otherErrors.length > 0 &&
          otherErrors.map((err, index) => {
            return <Notice key={index} variant="error" text={err} />;
          })}
        {!hasARecords && type === 'NS' && (
          <Notice
            spacingTop={8}
            variant="warning"
            text={noARecordsNoticeText}
          />
        )}
        {fields.map((field: any, idx: number) => field(idx))}

        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save',
            disabled: submitting,
            label: 'Save',
            loading: submitting,
            onClick: isDomain
              ? this.onDomainEdit
              : isCreating
              ? this.onRecordCreate
              : this.onRecordEdit,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: this.onClose,
          }}
        />
      </Drawer>
    );
  }

  DefaultTTLField = () => (
    <this.MSSelect field="ttl_sec" fn={this.setTTLSec} label="Default TTL" />
  );

  DomainTransferField = () => {
    const finalIPs = (
      (this.state.fields as EditableDomainFields).axfr_ips ?? ['']
    ).map(stringToExtendedIP);
    return (
      <MultipleIPInput
        error={getAPIErrorsFor(
          DomainRecordDrawer.errorFields,
          this.state.errors
        )('axfr_ips')}
        helperText={helperText}
        ips={finalIPs}
        onChange={this.handleTransferUpdate}
        title="Domain Transfer IPs"
      />
    );
  };
  ExpireField = () => {
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
          DomainRecordDrawer.defaultFieldsState(this.props).expire_sec,
          (this.state.fields as EditableDomainFields).expire_sec
        )
      );
    });

    return (
      <Select
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'Expire Rate',
          },
        }}
        defaultValue={defaultRate}
        isClearable={false}
        label="Expire Rate"
        onChange={(e) => this.setExpireSec(e.value)}
        options={rateOptions}
      />
    );
  };
  MSSelect = ({
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
          DomainRecordDrawer.defaultFieldsState(this.props)[field],
          this.state.fields[field]
        )
      );
    });

    return (
      <Select
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': label,
          },
        }}
        defaultValue={defaultOption}
        isClearable={false}
        label={label}
        onChange={(e) => fn(e.value)}
        options={MSSelectOptions}
      />
    );
  };
  NameOrTargetField = ({
    field,
    label,
    multiline,
  }: {
    field: 'name' | 'target';
    label: string;
    multiline?: boolean;
  }) => {
    const { domain, type } = this.props;
    const value = this.state.fields[field];
    const hasAliasToResolve =
      value.indexOf('@') >= 0 && shouldResolve(type, field);
    return (
      <this.TextField
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
  NumberField = ({ field, label, ...rest }: NumberFieldProps) => {
    return (
      <TextField
        errorText={getAPIErrorsFor(
          DomainRecordDrawer.errorFields,
          this.state.errors
        )(field)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          this.updateField(field)(e.target.value)
        }
        data-qa-target={label}
        label={label}
        type="number"
        value={this.state.fields[field]}
        {...rest}
      />
    );
  };
  PortField = () => <this.NumberField field="port" label="Port" />;

  PriorityField = (props: { label: string; max: number; min: number }) => (
    <this.NumberField field="priority" {...props} />
  );

  ProtocolField = () => {
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
          DomainRecordDrawer.defaultFieldsState(this.props).protocol,
          (this.state.fields as EditableRecordFields).protocol
        )
      );
    });

    return (
      <Select
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'Protocol',
          },
        }}
        defaultValue={defaultProtocol}
        isClearable={false}
        label="Protocol"
        onChange={(e) => this.setProtocol(e.value)}
        options={protocolOptions}
      />
    );
  };

  RefreshRateField = () => (
    <this.MSSelect
      field="refresh_sec"
      fn={this.setRefreshSec}
      label="Refresh Rate"
    />
  );

  RetryRateField = () => (
    <this.MSSelect field="retry_sec" fn={this.setRetrySec} label="Retry Rate" />
  );

  ServiceField = () => <this.TextField field="service" label="Service" />;

  TTLField = () => (
    <this.MSSelect field="ttl_sec" fn={this.setTTLSec} label="TTL" />
  );

  TagField = () => {
    const tagOptions = [
      { label: 'issue', value: 'issue' },
      { label: 'issuewild', value: 'issuewild' },
      { label: 'iodef', value: 'iodef' },
    ];

    const defaultTag = tagOptions.find((eachTag) => {
      return (
        eachTag.value ===
        defaultTo(
          DomainRecordDrawer.defaultFieldsState(this.props).tag,
          (this.state.fields as EditableRecordFields).tag
        )
      );
    });
    return (
      <Select
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'caa tag',
          },
        }}
        defaultValue={defaultTag || tagOptions[0]}
        isClearable={false}
        label="Tag"
        onChange={(e: Item) => this.setTag(e.value)}
        options={tagOptions}
      />
    );
  };

  TextField = ({
    field,
    helperText,
    label,
    multiline,
    placeholder,
  }: AdjustedTextFieldProps) => (
    <TextField
      errorText={getAPIErrorsFor(
        DomainRecordDrawer.errorFields,
        this.state.errors
      )(field)}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        this.updateField(field)(e.target.value)
      }
      value={defaultTo(
        DomainRecordDrawer.defaultFieldsState(this.props)[field],
        this.state.fields[field]
      )}
      data-qa-target={label}
      helperText={helperText}
      label={label}
      multiline={multiline}
      placeholder={placeholder}
    />
  );

  WeightField = () => <this.NumberField field="weight" label="Weight" />;

  /**
   * the defaultFieldState is used to pre-populate the drawer with either
   * editable data or defaults.
   */
  static defaultFieldsState = (props: Partial<DomainRecordDrawerProps>) => ({
    axfr_ips: getInitialIPs(props.axfr_ips),
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

  static errorFields = {
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

  filterDataByType = (
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
      [
        () => equals('NS', t),
        () => pick(['target', 'name', 'ttl_sec'], fields),
      ],
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
      [
        () => equals('TXT', t),
        () => pick(['name', 'target', 'ttl_sec'], fields),
      ],
    ])();

  handleRecordSubmissionSuccess = () => {
    this.props.updateRecords();
    this.onClose();
  };

  handleSubmissionErrors = (errorResponse: any) => {
    const errors = getAPIErrorOrDefault(errorResponse);
    this.setState({ errors, submitting: false }, () => {
      scrollErrorIntoView();
    });
  };

  handleTransferUpdate = (transferIPs: ExtendedIP[]) => {
    const axfr_ips =
      transferIPs.length > 0 ? transferIPs.map(extendedIPToString) : [''];
    this.updateField('axfr_ips')(axfr_ips);
  };

  onClose = () => {
    this.setState({
      errors: undefined,
      fields: DomainRecordDrawer.defaultFieldsState({}),
      submitting: false,
    });
    this.props.onClose();
  };

  onDomainEdit = () => {
    const { domainId, type, updateDomain } = this.props;
    this.setState({ errors: undefined, submitting: true });

    const data = {
      ...this.filterDataByType(this.state.fields, type),
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
        this.onClose();
      })
      .catch(this.handleSubmissionErrors);
  };

  onRecordCreate = () => {
    const { domain, records, type } = this.props;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave') {
      return;
    }

    this.setState({ errors: undefined, submitting: true });
    const _data = {
      type,
      ...this.filterDataByType(this.state.fields, type),
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
    const _domain = pathOr('', ['name'], data);
    const invalidCNAME =
      data.type === 'CNAME' && !isValidCNAME(_domain, records);

    if (!isValidDomainRecord(_domain, records) || invalidCNAME) {
      const error = {
        field: 'name',
        reason: 'Record conflict - CNAMES must be unique',
      };
      this.handleSubmissionErrors([error]);
      return;
    }

    createDomainRecord(this.props.domainId, data)
      .then(this.handleRecordSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  };

  onRecordEdit = () => {
    const { domain, domainId, id, type } = this.props;
    const fields = this.state.fields as EditableRecordFields;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave' || !id) {
      return;
    }

    this.setState({ errors: undefined, submitting: true });

    const _data = {
      ...this.filterDataByType(fields, type),
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);
    updateDomainRecord(domainId, id, data)
      .then(this.handleRecordSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  };

  updateField = (
    key: keyof EditableDomainFields | keyof EditableRecordFields
  ) => (value: any) => this.setState(set(lensPath(['fields', key]), value));

  setExpireSec = this.updateField('expire_sec');

  setProtocol = this.updateField('protocol');

  setRefreshSec = this.updateField('refresh_sec');

  setRetrySec = this.updateField('retry_sec');

  setTTLSec = this.updateField('ttl_sec');

  setTag = this.updateField('tag');

  state: State = {
    fields: DomainRecordDrawer.defaultFieldsState(this.props),
    submitting: false,
  };

  types = {
    // },
    AAAA: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField field="name" key={idx} label="Hostname" />
        ),
        (idx: number) => (
          <this.NameOrTargetField field="target" key={idx} label="IP Address" />
        ),
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    // slave: {
    //   fields: [
    //     (idx: number) => <this.NameField label="Hostname" key={idx} />,
    //     (idx: number) => <this.TargetField label="IP Address" key={idx} />,
    //     (idx: number) => <this.TTLField label="TTL" key={idx} />,
    //   ],
    CAA: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField field="name" key={idx} label="Name" />
        ),
        (idx: number) => <this.TagField key={idx} />,
        (idx: number) => (
          <this.NameOrTargetField field="target" key={idx} label="Value" />
        ),
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    CNAME: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField field="name" key={idx} label="Hostname" />
        ),
        (idx: number) => (
          <this.NameOrTargetField field="target" key={idx} label="Alias to" />
        ),
        (idx: number) => <this.TTLField key={idx} />,
        ,
      ],
    },
    MX: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField
            field="target"
            key={idx}
            label="Mail Server"
          />
        ),
        ,
        (idx: number) => (
          <this.PriorityField key={idx} label="Preference" max={255} min={0} />
        ),
        (idx: number) => <this.TTLField key={idx} />,
        (idx: number) => (
          <this.NameOrTargetField field="name" key={idx} label="Subdomain" />
        ),
      ],
    },
    NS: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField
            field="target"
            key={idx}
            label="Name Server"
          />
        ),
        (idx: number) => (
          <this.NameOrTargetField field="name" key={idx} label="Subdomain" />
        ),
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    SRV: {
      fields: [
        (idx: number) => <this.ServiceField key={idx} />,
        (idx: number) => <this.ProtocolField key={idx} />,
        (idx: number) => (
          <this.PriorityField key={idx} label="Priority" max={255} min={0} />
        ),
        (idx: number) => <this.WeightField key={idx} />,
        (idx: number) => <this.PortField key={idx} />,
        (idx: number) => (
          <this.NameOrTargetField field="target" key={idx} label="Target" />
        ),
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    TXT: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField field="name" key={idx} label="Hostname" />
        ),
        (idx: number) => (
          <this.NameOrTargetField
            field="target"
            key={idx}
            label="Value"
            multiline
          />
        ),
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    master: {
      fields: [
        (idx: number) => (
          <this.TextField field="domain" key={idx} label="Domain" />
        ),
        (idx: number) => (
          <this.TextField field="soa_email" key={idx} label="SOA Email" />
        ),
        (idx: number) => <this.DomainTransferField key={idx} />,
        (idx: number) => <this.DefaultTTLField key={idx} />,
        (idx: number) => <this.RefreshRateField key={idx} />,
        (idx: number) => <this.RetryRateField key={idx} />,
        (idx: number) => <this.ExpireField key={idx} />,
      ],
    },
  };
}

const modeMap = {
  create: 'Create',
  edit: 'Edit',
};

const typeMap = {
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
