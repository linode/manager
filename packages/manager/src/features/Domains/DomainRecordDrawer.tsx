import {
  createDomainRecord,
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  updateDomainRecord
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
  set
} from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button, { ButtonProps } from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  DomainActionsProps,
  withDomainActions
} from 'src/store/domains/domains.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP
} from 'src/utilities/ipUtils';
import { maybeCastToNumber } from 'src/utilities/maybeCastToNumber';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  getInitialIPs,
  isValidCNAME,
  isValidDomainRecord,
  transferHelperText as helperText
} from './domainUtils';

interface Props
  extends Partial<Omit<DomainRecord, 'type'>>,
    Partial<Omit<Domain, 'type'>> {
  open: boolean;
  onClose: () => void;
  domainId: number;
  domain: string;
  mode: 'create' | 'edit';
  records: DomainRecord[];
  updateRecords: () => void;

  /**
   * Used to populate fields on edits.
   */
  id?: number;
  type: RecordType | DomainType;
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
  submitting: boolean;
  errors?: APIError[];
  fields: EditableRecordFields | EditableDomainFields;
}

type CombinedProps = Props & DomainActionsProps;

interface AdjustedTextFieldProps {
  label: string;
  field: keyof EditableRecordFields | keyof EditableDomainFields;
  min?: number;
  max?: number;
  placeholder?: string;
  helperText?: string;
}

interface NumberFieldProps extends AdjustedTextFieldProps {
  defaultValue?: number;
}

class DomainRecordDrawer extends React.Component<CombinedProps, State> {
  /**
   * the defaultFieldState is used to pre-populate the drawer with either
   * editable data or defaults.
   */
  static defaultFieldsState = (props: Partial<CombinedProps>) => ({
    id: props.id,
    name: props.name ?? '',
    port: props.port ?? '80',
    priority: props.priority ?? '10',
    protocol: props.protocol ?? 'tcp',
    service: props.service ?? '',
    tag: props.tag ?? 'issue',
    target: props.target ?? '',
    ttl_sec: props.ttl_sec ?? 0,
    weight: props.weight ?? '5',
    domain: props.domain,
    soa_email: props.soa_email ?? '',
    axfr_ips: getInitialIPs(props.axfr_ips),
    refresh_sec: props.refresh_sec ?? 0,
    retry_sec: props.retry_sec ?? 0,
    expire_sec: props.expire_sec ?? 0
  });

  state: State = {
    submitting: false,
    fields: DomainRecordDrawer.defaultFieldsState(this.props)
  };

  updateField = (
    key: keyof EditableRecordFields | keyof EditableDomainFields
  ) => (value: any) => this.setState(set(lensPath(['fields', key]), value));

  setProtocol = this.updateField('protocol');
  setTag = this.updateField('tag');
  setTTLSec = this.updateField('ttl_sec');
  setRefreshSec = this.updateField('refresh_sec');
  setRetrySec = this.updateField('retry_sec');
  setExpireSec = this.updateField('expire_sec');

  static errorFields = {
    name: 'name',
    port: 'port',
    priority: 'priority',
    protocol: 'protocol',
    service: 'service',
    tag: 'tag',
    target: 'target',
    ttl_sec: 'ttl_sec',
    type: 'type',
    weight: 'weight',
    domain: 'domain',
    soa_email: 'SOA email address',
    axfr_ips: 'domain transfers',
    refresh_sec: 'refresh rate',
    retry_sec: 'retry rate',
    expire_sec: 'expire rate'
  };

  handleTransferUpdate = (transferIPs: ExtendedIP[]) => {
    const axfr_ips =
      transferIPs.length > 0 ? transferIPs.map(extendedIPToString) : [''];
    this.updateField('axfr_ips')(axfr_ips);
  };

  TextField = ({
    label,
    field,
    helperText,
    placeholder
  }: AdjustedTextFieldProps) => (
    <TextField
      label={label}
      errorText={getAPIErrorsFor(
        DomainRecordDrawer.errorFields,
        this.state.errors
      )(field)}
      value={defaultTo(
        DomainRecordDrawer.defaultFieldsState(this.props)[field],
        this.state.fields[field]
      )}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        this.updateField(field)(e.target.value)
      }
      placeholder={placeholder}
      helperText={helperText}
      data-qa-target={label}
    />
  );

  NumberField = ({ label, field, ...rest }: NumberFieldProps) => {
    return (
      <TextField
        label={label}
        type="number"
        errorText={getAPIErrorsFor(
          DomainRecordDrawer.errorFields,
          this.state.errors
        )(field)}
        value={this.state.fields[field]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          this.updateField(field)(e.target.value)
        }
        data-qa-target={label}
        {...rest}
      />
    );
  };

  NameOrTargetField = ({
    label,
    field
  }: {
    label: string;
    field: 'name' | 'target';
  }) => {
    const { domain, type } = this.props;
    const value = this.state.fields[field];
    const hasAliasToResolve =
      value.indexOf('@') >= 0 && shouldResolve(type, field);
    return (
      <this.TextField
        field={field}
        label={label}
        placeholder={
          shouldResolve(type, field) ? 'hostname or @ for root' : undefined
        }
        helperText={hasAliasToResolve ? resolve(value, domain) : undefined}
      />
    );
  };

  ServiceField = () => <this.TextField field="service" label="Service" />;

  PriorityField = (props: { label: string; min: number; max: number }) => (
    <this.NumberField field="priority" {...props} />
  );

  PortField = () => <this.NumberField field="port" label="Port" />;

  WeightField = () => <this.NumberField field="weight" label="Weight" />;

  TTLField = () => (
    <this.MSSelect label="TTL" field="ttl_sec" fn={this.setTTLSec} />
  );

  DefaultTTLField = () => (
    <this.MSSelect label="Default TTL" field="ttl_sec" fn={this.setTTLSec} />
  );

  RefreshRateField = () => (
    <this.MSSelect
      label="Refresh Rate"
      field="refresh_sec"
      fn={this.setRefreshSec}
    />
  );

  RetryRateField = () => (
    <this.MSSelect label="Retry Rate" field="retry_sec" fn={this.setRetrySec} />
  );

  ExpireField = () => {
    const rateOptions = [
      { label: 'Default', value: 0 },
      { label: '1 week', value: 604800 },
      { label: '2 weeks', value: 1209600 },
      { label: '4 weeks', value: 2419200 }
    ];

    const defaultRate = rateOptions.find(eachRate => {
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
        options={rateOptions}
        label="Expire Rate"
        defaultValue={defaultRate}
        onChange={(e: Item) => this.setExpireSec(+e.value)}
        isClearable={false}
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'Expire Rate'
          }
        }}
      />
    );
  };

  MSSelect = ({
    label,
    field,
    fn
  }: {
    label: string;
    field: keyof EditableRecordFields | keyof EditableDomainFields;
    fn: (v: number) => void;
  }) => {
    const MSSelectOptions = [
      { label: 'Default', value: 0 },
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
      { label: '4 weeks', value: 2419200 }
    ];

    const defaultOption = MSSelectOptions.find(eachOption => {
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
        options={MSSelectOptions}
        label={label}
        defaultValue={defaultOption}
        onChange={(e: Item) => fn(+e.value)}
        isClearable={false}
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': label
          }
        }}
      />
    );
  };

  ProtocolField = () => {
    const protocolOptions = [
      { label: 'tcp', value: 'tcp' },
      { label: 'udp', value: 'udp' },
      { label: 'xmpp', value: 'xmpp' },
      { label: 'tls', value: 'tls' },
      { label: 'smtp', value: 'smtp' }
    ];

    const defaultProtocol = protocolOptions.find(eachProtocol => {
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
        options={protocolOptions}
        label="Protocol"
        defaultValue={defaultProtocol}
        onChange={(e: Item) => this.setProtocol(e.value)}
        isClearable={false}
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'Protocol'
          }
        }}
      />
    );
  };

  TagField = () => {
    const tagOptions = [
      { label: 'issue', value: 'issue' },
      { label: 'issuewild', value: 'issuewild' },
      { label: 'iodef', value: 'iodef' }
    ];

    const defaultTag = tagOptions.find(eachTag => {
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
        label="Tag"
        options={tagOptions}
        defaultValue={defaultTag || tagOptions[0]}
        onChange={(e: Item) => this.setTag(e.value)}
        isClearable={false}
        textFieldProps={{
          dataAttrs: {
            'data-qa-domain-select': 'caa tag'
          }
        }}
      />
    );
  };

  DomainTransferField = () => {
    const finalIPs = (
      (this.state.fields as EditableDomainFields).axfr_ips ?? ['']
    ).map(stringToExtendedIP);
    return (
      <MultipleIPInput
        title="Domain Transfer IPs"
        helperText={helperText}
        error={getAPIErrorsFor(
          DomainRecordDrawer.errorFields,
          this.state.errors
        )('axfr_ips')}
        ips={finalIPs}
        onChange={this.handleTransferUpdate}
      />
    );
  };

  handleSubmissionErrors = (errorResponse: any) => {
    const errors = getAPIErrorOrDefault(errorResponse);
    this.setState({ errors, submitting: false }, () => {
      scrollErrorIntoView();
    });
  };

  handleRecordSubmissionSuccess = () => {
    this.props.updateRecords();
    this.onClose();
  };

  onDomainEdit = () => {
    const { domainId, type, domainActions } = this.props;
    this.setState({ submitting: true, errors: undefined });

    const data = {
      ...this.filterDataByType(this.state.fields, type)
    } as Partial<EditableDomainFields>;

    if (data.axfr_ips) {
      /**
       * Don't submit blank strings to the API.
       * Also trim the resulting array, since '192.0.2.0, 192.0.2.1'
       * will submit ' 192.0.2.1', which is an invalid value.
       */
      data.axfr_ips = data.axfr_ips
        .filter(ip => ip !== '')
        .map(ip => ip.trim());
    }

    domainActions
      .updateDomain({ domainId, ...data, status: 'active' })
      .then(() => {
        this.onClose();
      })
      .catch(this.handleSubmissionErrors);
  };

  onRecordCreate = () => {
    const { records, domain, type } = this.props;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave') {
      return;
    }

    this.setState({ submitting: true, errors: undefined });
    const _data = {
      type,
      ...this.filterDataByType(this.state.fields, type)
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
        reason: 'Record conflict - CNAMES must be unique'
      };
      this.handleSubmissionErrors([error]);
      return;
    }

    createDomainRecord(this.props.domainId, data)
      .then(this.handleRecordSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  };

  onRecordEdit = () => {
    const { type, id, domain, domainId } = this.props;
    const fields = this.state.fields as EditableRecordFields;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave' || !id) {
      return;
    }

    this.setState({ submitting: true, errors: undefined });

    const _data = {
      ...this.filterDataByType(fields, type)
    };

    // Expand @ to the Domain in appropriate fields
    let data = resolveAlias(_data, domain, type);
    // Convert string values to numeric, replacing '' with undefined
    data = castFormValuesToNumeric(data);
    updateDomainRecord(domainId, id, data)
      .then(this.handleRecordSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  };

  filterDataByType = (
    fields: EditableRecordFields | EditableDomainFields,
    t: RecordType | DomainType
  ): Partial<EditableRecordFields | EditableDomainFields> =>
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
              'axfr_ips'
            ],
            fields
          )
      ],
      // [
      //   () => equals('slave', t),
      //   () => pick([], fields),
      // ],
      [() => equals('A', t), () => pick(['name', 'target', 'ttl_sec'], fields)],
      [
        () => equals('AAAA', t),
        () => pick(['name', 'target', 'ttl_sec'], fields)
      ],
      [
        () => equals('CAA', t),
        () => pick(['name', 'tag', 'target', 'ttl_sec'], fields)
      ],
      [
        () => equals('CNAME', t),
        () => pick(['name', 'target', 'ttl_sec'], fields)
      ],
      [
        () => equals('MX', t),
        () => pick(['target', 'priority', 'ttl_sec', 'name'], fields)
      ],
      [
        () => equals('NS', t),
        () => pick(['target', 'name', 'ttl_sec'], fields)
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
              'ttl_sec'
            ],
            fields
          )
      ],
      [
        () => equals('TXT', t),
        () => pick(['name', 'target', 'ttl_sec'], fields)
      ]
    ])();

  types = {
    master: {
      fields: [
        (idx: number) => (
          <this.TextField field="domain" label="Domain" key={idx} />
        ),
        (idx: number) => (
          <this.TextField field="soa_email" label="SOA Email" key={idx} />
        ),
        (idx: number) => <this.DomainTransferField key={idx} />,
        (idx: number) => <this.DefaultTTLField key={idx} />,
        (idx: number) => <this.RefreshRateField key={idx} />,
        (idx: number) => <this.RetryRateField key={idx} />,
        (idx: number) => <this.ExpireField key={idx} />
      ]
    },
    // slave: {
    //   fields: [
    //     (idx: number) => <this.NameField label="Hostname" key={idx} />,
    //     (idx: number) => <this.TargetField label="IP Address" key={idx} />,
    //     (idx: number) => <this.TTLField label="TTL" key={idx} />,
    //   ],
    // },
    AAAA: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField label="Hostname" field="name" key={idx} />
        ),
        (idx: number) => (
          <this.NameOrTargetField label="IP Address" field="target" key={idx} />
        ),
        (idx: number) => <this.TTLField key={idx} />
      ]
    },
    NS: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField
            label="Name Server"
            field="target"
            key={idx}
          />
        ),
        (idx: number) => (
          <this.NameOrTargetField label="Subdomain" field="name" key={idx} />
        ),
        (idx: number) => <this.TTLField key={idx} />
      ]
    },
    MX: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField
            label="Mail Server"
            field="target"
            key={idx}
          />
        ),
        ,
        (idx: number) => (
          <this.PriorityField min={0} max={255} label="Preference" key={idx} />
        ),
        (idx: number) => <this.TTLField key={idx} />,
        (idx: number) => (
          <this.NameOrTargetField label="Subdomain" field="name" key={idx} />
        )
      ]
    },
    CNAME: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField label="Hostname" field="name" key={idx} />
        ),
        (idx: number) => (
          <this.NameOrTargetField label="Alias to" field="target" key={idx} />
        ),
        (idx: number) => <this.TTLField key={idx} />,
        ,
      ]
    },
    TXT: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField label="Hostname" field="name" key={idx} />
        ),
        (idx: number) => (
          <this.NameOrTargetField label="Value" field="target" key={idx} />
        ),
        (idx: number) => <this.TTLField key={idx} />
      ]
    },
    SRV: {
      fields: [
        (idx: number) => <this.ServiceField key={idx} />,
        (idx: number) => <this.ProtocolField key={idx} />,
        (idx: number) => (
          <this.PriorityField min={0} max={255} label="Priority" key={idx} />
        ),
        (idx: number) => <this.WeightField key={idx} />,
        (idx: number) => <this.PortField key={idx} />,
        (idx: number) => (
          <this.NameOrTargetField label="Target" field="target" key={idx} />
        ),
        (idx: number) => <this.TTLField key={idx} />
      ]
    },
    CAA: {
      fields: [
        (idx: number) => (
          <this.NameOrTargetField label="Name" field="name" key={idx} />
        ),
        (idx: number) => <this.TagField key={idx} />,
        (idx: number) => (
          <this.NameOrTargetField label="Value" field="name" key={idx} />
        ),
        (idx: number) => <this.TTLField key={idx} />
      ]
    }
  };

  onClose = () => {
    this.setState({
      submitting: false,
      errors: undefined,
      fields: DomainRecordDrawer.defaultFieldsState({})
    });
    this.props.onClose();
  };

  componentDidUpdate(prevProps: CombinedProps) {
    if (this.props.open && !prevProps.open) {
      // Drawer is opening, set the fields according to props
      this.setState({
        fields: DomainRecordDrawer.defaultFieldsState(this.props)
      });
    }
  }

  render() {
    const { submitting } = this.state;
    const { open, mode, type } = this.props;
    const { fields } = this.types[type];
    const isCreating = mode === 'create';
    const isDomain = type === 'master' || type === 'slave';

    const buttonProps: ButtonProps = {
      buttonType: 'primary',
      disabled: submitting,
      loading: submitting,
      onClick: isDomain
        ? this.onDomainEdit
        : isCreating
        ? this.onRecordCreate
        : this.onRecordEdit,
      children: 'Save'
    };

    const otherErrors = [
      getAPIErrorsFor({}, this.state.errors)('_unknown'),
      getAPIErrorsFor({}, this.state.errors)('none')
    ].filter(Boolean);

    return (
      <Drawer
        title={`${path([mode], modeMap)} ${path([type], typeMap)} Record`}
        open={open}
        onClose={this.onClose}
      >
        {otherErrors.length > 0 &&
          otherErrors.map((err, index) => {
            return <Notice error key={index} text={err} />;
          })}
        {fields.map((field: any, idx: number) => field(idx))}
        <ActionsPanel>
          <Button {...buttonProps} data-qa-record-save />
          <Button
            buttonType="secondary"
            className="cancel"
            onClick={this.onClose}
            data-qa-record-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const modeMap = {
  create: 'Create',
  edit: 'Edit'
};

const typeMap = {
  master: 'SOA',
  slave: 'SOA',
  A: 'A',
  AAAA: 'A/AAAA',
  CAA: 'CAA',
  CNAME: 'CNAME',
  MX: 'MX',
  NS: 'NS',
  PTR: 'PTR',
  SRV: 'SRV',
  TXT: 'TXT'
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
  return produce(data, draft => {
    fieldNames.forEach(thisField => {
      draft[thisField] = maybeCastToNumber(draft[thisField]);
    });
  });
};

const enhanced = compose<CombinedProps, Props>(withDomainActions);

export default enhanced(DomainRecordDrawer);
