import * as React from 'react';
import * as classNames from 'classnames';
import { cond, defaultTo, equals, lensPath, path, pathOr, pick, set } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  MenuItem,
} from 'material-ui';
import Button, { ButtonProps } from 'material-ui/Button';

import { createDomainRecord, updateDomainRecord } from 'src/services/domains';
import defaultNumeric from 'src/utilities/defaultNumeric';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import ActionsPanel from 'src/components/ActionsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import Notice from 'src/components/Notice';
import { AxiosError, AxiosResponse } from 'axios';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
  domainId: number;
  mode: 'create' | 'edit';
  type: Linode.RecordType;
  updateRecords: () => void;

  // Used to populate fields on edits.
  id?: number;
  name?: string;
  port?: number;
  priority?: number;
  protocol?: null | string;
  service?: null | string;
  tag?: null | string;
  target?: string;
  ttl_sec?: number;
  weight?: number;
}

interface CreateFieldState {
  name?: string;
  port?: number;
  priority?: number;
  protocol?: string;
  service?: string;
  tag?: string;
  target?: string;
  ttl_sec?: number;
  weight?: number;
}

interface UpdateFieldState extends CreateFieldState {
  id: number;
}

interface State {
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  fields: CreateFieldState | UpdateFieldState;
}

type CombinedProps = Props & WithStyles<ClassNames>;


interface TextFieldProps {
  label: string;
  field: keyof CreateFieldState;
}

interface NumberFieldProps extends TextFieldProps {
  defaultValue?: number;
}

class DomainRecordDrawer extends React.Component<CombinedProps, State> {

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
  })

  state: State = {
    submitting: false,
    fields: DomainRecordDrawer.defaultFieldsState(this.props),
  };

  updateField = (key: keyof CreateFieldState) => (value: any) => this.setState(
    set(lensPath(['fields', key]), value),
  )

  setProtocol = this.updateField('protocol');
  setTag = this.updateField('tag');
  setTTLSec = this.updateField('ttl_sec');

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
  };

  TextField = ({ label, field }: TextFieldProps) => <TextField
    label={label}
    errorText={
      getAPIErrorsFor(
        DomainRecordDrawer.errorFields,
        this.state.errors)(field,
      )
    }
    value={defaultTo('', this.state.fields[field])}
    onChange={e => this.updateField(field)(e.target.value)}
  />

  NumberField = ({ label, field, defaultValue = 0 }: NumberFieldProps) => <TextField
    label={label}
    type="number"
    errorText={
      getAPIErrorsFor(
        DomainRecordDrawer.errorFields,
        this.state.errors)(field,
      )
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

  TTLField = ({ label }: { label: string }) =>
    <TextField
      label={label}
      select
      value={defaultTo(0, this.state.fields.ttl_sec)}
      onChange={e => this.setTTLSec(+e.target.value)}
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
      <MenuItem value={604600}>1 week</MenuItem>
      <MenuItem value={120960}>2 weeks</MenuItem>
      <MenuItem value={2419200}>4 weeks</MenuItem>
    </TextField>

  ProtocolField = () =>
    <TextField
      select
      label="Protocol"
      value={defaultTo('tcp', this.state.fields.protocol)}
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
      value={defaultTo('issue', this.state.fields.tag)}
      onChange={e => this.setTag(e.target.value)}
    >
      <MenuItem value="issue">issue</MenuItem>
      <MenuItem value="issuewild">issuewild</MenuItem>
      <MenuItem value="iodef">iodef</MenuItem>
    </TextField>

  handleSubmissionErrors = (errorResponse: AxiosError) => {
    const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'])(errorResponse);
    if (errors) {
      this.setState({ errors, submitting: false });
      return;
    }

    this.setState({
      submitting: false,
      errors: [{ reason: 'An unknown error has occured.', field: '_unknown' }],
    });
  }

  handleSubmissionSuccess = (response: AxiosResponse) => {
    this.props.updateRecords();
    this.onClose();
  }

  onCreate = () => {
    this.setState({ submitting: true, errors: undefined });
    const data = {
      type: this.props.type,
      ...this.filterDataByType(this.state.fields, this.props.type),
    };

    createDomainRecord(this.props.domainId, data)
      .then(this.handleSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  }

  onEdit = () => {
    this.setState({ submitting: true, errors: undefined });
    const fields = this.state.fields as UpdateFieldState;

    const data = {
      ...this.filterDataByType(fields, this.props.type),
    };

    updateDomainRecord(this.props.domainId, fields.id, data)
      .then(this.handleSubmissionSuccess)
      .catch(this.handleSubmissionErrors);
  }

  filterDataByType =
    (fields: CreateFieldState, t: Linode.RecordType): Partial<CreateFieldState> => cond([
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
    AAAA: {
      fields: [
        (idx: number) => <this.NameField label="Hostname" key={idx} />,
        (idx: number) => <this.TargetField label="IP Address" key={idx} />,
        (idx: number) => <this.TTLField label="TTL" key={idx} />,
      ],
    },
    NS: {
      fields: [
        (idx: number) => <this.TargetField label="Name Server" key={idx} />,
        (idx: number) => <this.NameField label="Subdomain" key={idx} />,
        (idx: number) => <this.TTLField label="TTL" key={idx} />,
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
        (idx: number) => <this.TTLField label="TTL" key={idx} />, ,
      ],
    },
    TXT: {
      fields: [
        (idx: number) => <this.NameField label="Hostname" key={idx} />,
        (idx: number) => <this.TargetField label="Value" key={idx} />,
        (idx: number) => <this.TTLField label="TTL" key={idx} />,
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
        (idx: number) => <this.TTLField label="TTL" key={idx} />,
      ],
    },
    CAA: {
      fields: [
        (idx: number) => <this.NameField label="Name" key={idx} />,
        (idx: number) => <this.TagField key={idx} />,
        (idx: number) => <this.TargetField label="Value" key={idx} />,
        (idx: number) => <this.TTLField label="TTL" key={idx} />,
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
    const creating = mode === 'create';

    const buttonProps: ButtonProps = {
      variant: 'raised',
      color: submitting ? 'secondary' : 'primary',
      disabled: submitting,
      className: classNames({ loading: submitting }),
      onClick: creating ? this.onCreate : this.onEdit,
      children: creating ? 'Add' : 'Edit',
    };

    const otherErrors = [
      getAPIErrorsFor({}, this.state.errors)('_unknown'),
      getAPIErrorsFor({}, this.state.errors)('none'),
    ].filter(Boolean);

    return (
      <Drawer title={`${mode} ${type} Record`} open={open} onClose={this.onClose}>
        {otherErrors.length > 0 && otherErrors.map(err => <Notice error text={err} />)}
        {fields.map((field: any, idx: number) => field(idx))}
        <ActionsPanel>
          <Button {...buttonProps} />
          <Button onClick={this.onClose}>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer >
    );
  }
}



const styled = withStyles(styles, { withTheme: true });

export default styled(DomainRecordDrawer);
