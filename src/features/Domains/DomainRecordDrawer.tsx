import * as classNames from 'classnames';
import { cond, defaultTo, equals, lensPath, path, pathOr, pick, set } from 'ramda';
import * as React from 'react';

import Button, { ButtonProps } from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import { default as _TextField, Props as TextFieldProps } from 'src/components/TextField';
import { createDomainRecord, updateDomain, updateDomainRecord } from 'src/services/domains';
import defaultNumeric from 'src/utilities/defaultNumeric';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

const TextField = (props: TextFieldProps) =>
  <_TextField {...props} />;

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props extends EditableRecordFields, EditableDomainFields {
  open: boolean;
  onClose: () => void;
  domainId: number;
  mode: 'create' | 'edit';
  updateRecords: () => void;
  updateDomain: () => void;

  /**
   * Used to populate fields on edits.
   */
  id?: number;
  type: Linode.RecordType | Linode.DomainType;
}

interface EditableSharedFields {
  ttl_sec?: number;
}

interface EditableRecordFields extends EditableSharedFields {
  name?: string;
  port?: number;
  priority?: number;
  protocol?: null | string;
  service?: null | string;
  tag?: null | string;
  target?: string;
  weight?: number;
}

interface EditableDomainFields extends EditableSharedFields {
  axfr_ips?: string[];
  description?: string;
  domain?: string;
  expire_sec?: number;
  group?: string;
  master_ips?: string[];
  refresh_sec?: number;
  retry_sec?: number;
  soa_email?: string;
  ttl_sec?: number;
  zonefile?: Linode.ZoneFile;
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  fields: EditableRecordFields | EditableDomainFields;
}

type CombinedProps = Props & WithStyles<ClassNames>;

/* tslint:disable-next-line */
interface _TextFieldProps {
  label: string;
  field: keyof EditableRecordFields | keyof EditableDomainFields;
}

interface NumberFieldProps extends _TextFieldProps {
  defaultValue?: number;
}

class DomainRecordDrawer extends React.Component<CombinedProps, State> {
  /**
   * the defaultFieldState is used to prepopulate the drawer with either
   * editable data or defaults.
   */
  static defaultFieldsState = (props: Partial<CombinedProps>) => ({
    id: pathOr(undefined, ['id'], props),
    name: pathOr(undefined, ['name'], props),
    port: pathOr(80, ['port'], props),
    priority: pathOr(10, ['priority'], props),
    protocol: pathOr(undefined, ['protocol'], props),
    service: pathOr(undefined, ['service'], props),
    tag: pathOr('issue', ['tag'], props),
    target: pathOr(undefined, ['target'], props),
    ttl_sec: pathOr(undefined, ['ttl_sec'], props),
    weight: pathOr(5, ['weight'], props),
    domain: pathOr(undefined, ['domain'], props),
    soa_email: pathOr(undefined, ['soa_email'], props),
    axfr_ips: pathOr(0, ['axfr_ips'], props),
    refresh_sec: pathOr(0, ['refresh_sec'], props),
    retry_sec: pathOr(0, ['retry_sec'], props),
    expire_sec: pathOr(0, ['expire_sec'], props),
  })

  state: State = {
    submitting: false,
    fields: DomainRecordDrawer.defaultFieldsState(this.props),
  };

  updateField = (key: keyof EditableRecordFields | keyof EditableDomainFields) =>
    (value: any) => this.setState(
      set(lensPath(['fields', key]), value),
    )

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
    expire_sec: 'expire rate',
  };

  TextField = ({ label, field }: _TextFieldProps) =>
    <TextField
      label={label}
      errorText={
        getAPIErrorsFor(
          DomainRecordDrawer.errorFields,
          this.state.errors,
        )(field)
      }
      value={defaultTo('', this.state.fields[field])}
      onChange={e => this.updateField(field)(e.target.value)}
      data-qa-target={label}
    />

  NumberField = ({ label, field, defaultValue = 0 }: NumberFieldProps) =>
    <TextField
      label={label}
      type="number"
      errorText={
        getAPIErrorsFor(
          DomainRecordDrawer.errorFields,
          this.state.errors,
        )(field)
      }
      value={defaultTo(defaultValue, this.state.fields[field])}
      onChange={e => this.updateField(field)(defaultNumeric(defaultValue)(e.target.value))}
    />

  NameField = ({ label }: { label: string }) => <this.TextField field="name" label={label} />;

  TargetField = ({ label }: { label: string }) => <this.TextField field="target" label={label} />;

  ServiceField = () => <this.TextField field="service" label="Service" />;

  PriorityField = ({ label }: { label: string }) =>
    <this.NumberField field="priority" label={label} defaultValue={5} />

  PortField = () =>
    <this.NumberField field="port" label="Port" />

  WeightField = () =>
    <this.NumberField field="weight" label="Weight" />

  TTLField = () =>
    <this.MSSelect label="TTL" field="ttl_sec" fn={this.setTTLSec} />

  DefaultTTLField = () =>
    <this.MSSelect label="Default TTL" field="ttl_sec" fn={this.setTTLSec} />

  RefreshRateField = () =>
    <this.MSSelect label="Refresh Rate" field="refresh_sec" fn={this.setRefreshSec} />

  RetryRateField = () =>
    <this.MSSelect label="Retry Rate" field="retry_sec" fn={this.setRetrySec} />

  ExpireField = () =>
    <TextField
      label="Expire Rate"
      select
      value={defaultTo(0, (this.state.fields as EditableDomainFields).expire_sec)}
      onChange={e => this.setExpireSec(+e.target.value)}
    >
      <MenuItem value={0}>Default</MenuItem>
      <MenuItem value={604800}>1 week</MenuItem>
      <MenuItem value={1209600}>2 weeks</MenuItem>
      <MenuItem value={2419200}>4 weeks</MenuItem>
    </TextField>

  MSSelect = ({
    label,
    field,
    fn,
  }: {
    label: string,
    field: keyof EditableRecordFields | keyof EditableDomainFields,
    fn: (v: number) => void,
  }) =>
    <TextField
      label={label}
      select
      value={defaultTo(0, this.state.fields[field])}
      onChange={e => fn(+e.target.value)}
      data-qa-ns-select={label}
    >
      <MenuItem value={0}>Default</MenuItem>
      <MenuItem value={300}>5 minutes</MenuItem>
      <MenuItem value={3600}>1 hours</MenuItem>
      <MenuItem value={7200}>2 hours</MenuItem>
      <MenuItem value={14400}>4 hours</MenuItem>
      <MenuItem value={28800}>8 hours</MenuItem>
      <MenuItem value={57600}>16 hours</MenuItem>
      <MenuItem value={86400}>1 day</MenuItem>
      <MenuItem value={172800}>2 days</MenuItem>
      <MenuItem value={345600}>4 days</MenuItem>
      <MenuItem value={604800}>1 week</MenuItem>
      <MenuItem value={1209600}>2 weeks</MenuItem>
      <MenuItem value={2419200}>4 weeks</MenuItem>
    </TextField>

  ProtocolField = () =>
    <TextField
      select
      label="Protocol"
      value={defaultTo('tcp', (this.state.fields as EditableRecordFields).protocol)}
      onChange={e => this.setProtocol(e.target.value)}
    >
      <MenuItem value="tcp">tcp</MenuItem>
      <MenuItem value="udp">udp</MenuItem>
      <MenuItem value="xmpp">xmpp</MenuItem>
      <MenuItem value="tls">tls</MenuItem>
      <MenuItem value="smtp">smtp</MenuItem>
    </TextField>

  TagField = () =>
    <TextField
      label="Tag"
      select
      value={defaultTo('issue', (this.state.fields as EditableRecordFields).tag)}
      onChange={e => this.setTag(e.target.value)}
    >
      <MenuItem value="issue">issue</MenuItem>
      <MenuItem value="issuewild">issuewild</MenuItem>
      <MenuItem value="iodef">iodef</MenuItem>
    </TextField>

  DomainTrainsferField = () =>
    <TextField
      multiline
      label="Domain Transfers"
      errorText={
        getAPIErrorsFor(
          DomainRecordDrawer.errorFields,
          this.state.errors,
        )('axfr_ips')
      }
      rows="3"
      value={defaultTo('', (this.state.fields as EditableDomainFields).axfr_ips)}
      onChange={e => this.updateField('axfr_ips')(e.target.value)}
    />

  handleSubmissionErrors = (errorResponse: any) => {
    const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'])(errorResponse);
    if (errors) {
      this.setState({ errors, submitting: false }, () => {
        scrollErrorIntoView();
      });
      return;
    }

    this.setState({
      submitting: false,
      errors: [{ reason: 'An unknown error has occured.', field: '_unknown' }],
    }, () => {
      scrollErrorIntoView();
    });
  }

  handleRecordSubmissionSuccess = () => {
    this.props.updateRecords();
    this.onClose();
  }

  onDomainEdit = () => {
    const { domainId, type } = this.props;
    this.setState({ submitting: true, errors: undefined });

    const data = {
      ...this.filterDataByType(this.state.fields, type),
    };

    updateDomain(domainId, data)
      .then(() => {
        this.props.updateDomain();
        this.onClose();
      })
      .catch(this.handleSubmissionErrors);
  }

  onRecordCreate = () => {
    const { type } = this.props;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave') { return; }

    this.setState({ submitting: true, errors: undefined });
    const data = {
      type,
      ...this.filterDataByType(this.state.fields, type),
    };

    createDomainRecord(this.props.domainId, data)
      .then(this.handleRecordSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  }

  onRecordEdit = () => {
    const { type, id, domainId } = this.props;
    const fields = this.state.fields as EditableRecordFields;

    /** Appease TS ensuring we won't use it during Record create. */
    if (type === 'master' || type === 'slave' || !id) { return; }

    this.setState({ submitting: true, errors: undefined });

    const data = {
      ...this.filterDataByType(fields, type),
    };

    updateDomainRecord(domainId, id, data)
      .then(this.handleRecordSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  }

  filterDataByType = (
    fields: EditableRecordFields | EditableDomainFields,
    t: Linode.RecordType | Linode.DomainType,
  ): Partial<EditableRecordFields | EditableDomainFields> => cond([
    [
      () => equals('master', t),
      () => pick([
        'domain',
        'soa_email',
        'refresh_sec',
        'retry_sec',
        'expire_sec',
        'ttl_sec',
        'axfr_ips',
      ], fields),
    ],
    // [
    //   () => equals('slave', t),
    //   () => pick([], fields),
    // ],
    [
      () => equals('A', t),
      () => pick(['name', 'target', 'ttl_sec'], fields),
    ],
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
      () => pick(['target', 'priority', 'name'], fields),
    ],
    [
      () => equals('NS', t),
      () => pick(['target', 'name', 'ttl_sec'], fields),
    ],
    [
      () => equals('SRV', t),
      () => pick([
        'service', 'protocol', 'priority', 'port', 'weight', 'target', 'ttl_sec',
      ], fields),
    ],
    [
      () => equals('TXT', t),
      () => pick(['name', 'target', 'ttl_sec'], fields),
    ],
  ])()

  types = {
    master: {
      fields: [
        (idx: number) => <this.TextField field="domain" label="Domain" key={idx} />,
        (idx: number) => <this.TextField field="soa_email" label="SOA Email" key={idx} />,
        (idx: number) => <this.DomainTrainsferField key={idx} />,
        (idx: number) => <this.DefaultTTLField key={idx} />,
        (idx: number) => <this.RefreshRateField key={idx} />,
        (idx: number) => <this.RetryRateField key={idx} />,
        (idx: number) => <this.ExpireField key={idx} />,
      ],
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
        (idx: number) => <this.NameField label="Hostname" key={idx} />,
        (idx: number) => <this.TargetField label="IP Address" key={idx} />,
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    NS: {
      fields: [
        (idx: number) => <this.TargetField label="Name Server" key={idx} />,
        (idx: number) => <this.NameField label="Subdomain" key={idx} />,
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    MX: {
      fields: [
        (idx: number) => <this.TargetField label="Mail Server" key={idx} />, ,
        (idx: number) => <this.PriorityField label="Preference" key={idx} />,
        (idx: number) => <this.NameField label="Subdomain" key={idx} />,
      ],
    },
    CNAME: {
      fields: [
        (idx: number) => <this.NameField label="Hostname" key={idx} />,
        (idx: number) => <this.TargetField label="Alias to" key={idx} />,
        (idx: number) => <this.TTLField key={idx} />, ,
      ],
    },
    TXT: {
      fields: [
        (idx: number) => <this.NameField label="Hostname" key={idx} />,
        (idx: number) => <this.TargetField label="Value" key={idx} />,
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    SRV: {
      fields: [
        (idx: number) => <this.ServiceField key={idx} />,
        (idx: number) => <this.ProtocolField key={idx} />,
        (idx: number) => <this.PriorityField label="Priority" key={idx} />,
        (idx: number) => <this.WeightField key={idx} />,
        (idx: number) => <this.PortField key={idx} />,
        (idx: number) => <this.TargetField label="Target" key={idx} />,
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
    CAA: {
      fields: [
        (idx: number) => <this.NameField label="Name" key={idx} />,
        (idx: number) => <this.TagField key={idx} />,
        (idx: number) => <this.TargetField label="Value" key={idx} />,
        (idx: number) => <this.TTLField key={idx} />,
      ],
    },
  };

  onClose = () => {
    this.setState({
      submitting: false,
      errors: undefined,
      fields: DomainRecordDrawer.defaultFieldsState({}),
    });
    this.props.onClose();
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({ fields: DomainRecordDrawer.defaultFieldsState(nextProps) });
  }

  render() {
    const { submitting } = this.state;
    const { open, mode, type } = this.props;
    const { fields } = this.types[type];
    const isCreating = mode === 'create';
    const isDomain = type === 'master' || type === 'slave';

    const buttonProps: ButtonProps = {
      variant: 'raised',
      color: submitting ? 'secondary' : 'primary',
      disabled: submitting,
      className: classNames({ loading: submitting }),
      onClick: isDomain
        ? this.onDomainEdit
        : isCreating
          ? this.onRecordCreate
          : this.onRecordEdit,
      children: 'Save',
    };

    const otherErrors = [
      getAPIErrorsFor({}, this.state.errors)('_unknown'),
      getAPIErrorsFor({}, this.state.errors)('none'),
    ].filter(Boolean);

    return (
      <Drawer
        title={`${path([mode], modeMap)} ${path([type], typeMap)} Record`}
        open={open}
        onClose={this.onClose}
      >
        {otherErrors.length > 0 && otherErrors.map((err, index) => {
          return <Notice error key={index} text={err} />
        })
        }
        {fields.map((field: any, idx: number) => field(idx))}
        <ActionsPanel>
          <Button {...buttonProps} data-qa-record-save />
          <Button
            variant="raised"
            color="secondary"
            className="cancel"
            onClick={this.onClose}
            data-qa-record-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer >
    );
  }
}

const modeMap = {
  create: 'Create',
  edit: 'Edit',
};

const typeMap = {
  master: 'SOA',
  slave: 'SOA',
  A: 'A',
  AAAA: 'AAAA',
  CAA: 'CAA',
  CNAME: 'CNAME',
  MX: 'MX',
  NS: 'NS',
  PTR: 'PTR',
  SRV: 'SRV',
  TXT: 'TXT',
};

const styled = withStyles(styles, { withTheme: true });

export default styled(DomainRecordDrawer);
