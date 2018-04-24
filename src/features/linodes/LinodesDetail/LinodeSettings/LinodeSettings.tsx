import * as React from 'react';
import {
  compose,
  lensPath,
  pathOr,
  set,
} from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
  Typography,
  Divider,
} from 'material-ui';
import Button from 'material-ui/Button';
import InputLabel from 'material-ui/Input/InputLabel';
import MenuItem from 'material-ui/Menu/MenuItem';
import FormControl from 'material-ui/Form/FormControl';
import FormHelperText from 'material-ui/Form/FormHelperText';
import RadioGroup from 'material-ui/Radio/RadioGroup';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import Grid from 'src/components/Grid';

import { updateLinode, getLinodeDisks, changeLinodeDiskPassword } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { events$ } from 'src/events';
import { genEvent } from 'src/features/linodes/LinodesLanding/powerActions';
import PasswordInput from 'src/components/PasswordInput';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import TextField from 'src/components/TextField';
import Select from 'src/components/Select';
import Radio from 'src/components//Radio';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';

interface Section {
  title: string;
  textTitle: string;
  radioInputLabel: string;
  textInputLabel: string;
  copy: string;
  state: boolean;
  value: number;
  onStateChange: (e: React.ChangeEvent<{}>, v: string) => void;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  alerts: Linode.LinodeAlerts;
}

interface PromiseLoaderProps {
  disks: PromiseLoaderResponse<Linode.Disk[]>;
}

interface LabelFormState {
  initialValue: string;
  updatedValue: string;
  submitting: boolean;
  success?: string;
}

interface PasswordFormState {
  value: string;
  diskId: string | number;
  submitting: boolean;
  success?: string;
}

interface AlertState {
  state: boolean;
  value: number;
}

interface AlertsFormState {
  submitting: boolean;
  success?: string;
  cpuusage: AlertState;
  diskio: AlertState;
  incoming: AlertState;
  outbound: AlertState;
  transfer: AlertState;
}

interface State {
  disks: Linode.Disk[];
  labelForm: LabelFormState;
  passwordForm: PasswordFormState;
  alertsForm: AlertsFormState;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames>;

class LinodeSettings extends React.Component<CombinedProps, State> {
  state: State = {
    disks: this.props.disks.response,
    labelForm: {
      initialValue: this.props.linodeLabel,
      updatedValue: this.props.linodeLabel,
      submitting: false,
    },
    passwordForm: {
      value: '',
      diskId: pathOr('', ['disks', 'response', 0, 'id'], this.props),
      submitting: false,
    },
    alertsForm: {
      submitting: false,
      cpuusage: {
        state: this.props.alerts.cpu > 0,
        value: this.props.alerts.cpu,
      },
      diskio: {
        state: this.props.alerts.io > 0,
        value: this.props.alerts.io,
      },
      incoming: {
        state: this.props.alerts.network_in > 0,
        value: this.props.alerts.network_in,
      },
      outbound: {
        state: this.props.alerts.network_out > 0,
        value: this.props.alerts.network_out,
      },
      transfer: {
        state: this.props.alerts.transfer_quota > 0,
        value: this.props.alerts.transfer_quota,
      },
    },
  };

  changeLabel = () => {
    this.setState(set(lensPath(['labelForm', 'submitting']), true));
    this.setState(set(lensPath(['labelForm', 'success']), undefined));
    this.setState(set(lensPath(['errors']), undefined));

    updateLinode(this.props.linodeId, { label: this.state.labelForm.updatedValue })
      .then(response => response.data)
      .then((linode) => {
        this.setState(compose(
          set(lensPath(['labelForm', 'success']), `Linode label changes successfully.`),
          set(lensPath(['labelForm', 'submitting']), false),
        ));
        events$.next(genEvent('linode_reboot', linode.id, linode.label));
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors));
      });
  }

  changeDiskPassword = () => {
    this.setState(set(lensPath(['passwordForm', 'submitting']), true));
    this.setState(set(lensPath(['passwordForm', 'success']), undefined));
    this.setState(set(lensPath(['errors']), undefined));

    changeLinodeDiskPassword(
      this.props.linodeId,
      Number(this.state.passwordForm.diskId),
      this.state.passwordForm.value,
    )
      .then(response => response.data)
      .then((linode) => {
        this.setState(compose(
          set(lensPath(['passwordForm', 'success']), `Linode password changed successfully.`),
          set(lensPath(['passwordForm', 'submitting']), false),
          set(lensPath(['passwordForm', 'value']), ''),
          set(lensPath(['passwordForm', 'diskId']), ''),
        ));
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors));
      });
  }

  setLinodeAlertThresholds = () => {
    this.setState(set(lensPath(['errors']), undefined));
    this.setState(set(lensPath(['alertsForm', 'success']), undefined));
    this.setState(set(lensPath(['alertsForm', 'submitting']), true));

    updateLinode(
      this.props.linodeId,
      {
        alerts: {
          cpu: valueUnlessOff(this.state.alertsForm.cpuusage),
          network_in: valueUnlessOff(this.state.alertsForm.incoming),
          network_out: valueUnlessOff(this.state.alertsForm.outbound),
          transfer_quota: valueUnlessOff(this.state.alertsForm.transfer),
          io: valueUnlessOff(this.state.alertsForm.diskio),
        },
      },
    )
      .then((response) => {
        this.setState(compose(
          set(lensPath(['alertsForm', 'success']), `Linode alert thresholds changed successfully.`),
          set(lensPath(['alertsForm', 'submitting']), false),
        ));
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors));
      });
  }

  AlertSection = (props: Section) => {
    return (
      <React.Fragment>
        <Grid container>
          <Grid item>
            <RadioGroup
              name={props.radioInputLabel}
              value={String(props.state)}
              onChange={props.onStateChange}
            >
              <FormControlLabel value="true" label="On" control={<Radio />} />
              <FormControlLabel value="false" label="Off" control={<Radio />} />
            </RadioGroup>
          </Grid>
          <Grid item>
            <Typography>{props.title}</Typography>
            <Typography>{props.copy}</Typography>
          </Grid>
          <Grid item>
            {props.state && <TextField
              label={props.textTitle}
              type="number"
              value={props.value}
              InputProps={{
                endAdornment: <span>%</span>,
              }}
              error={Boolean(props.error)}
              errorText={props.error}
              /**
               * input type of NUMBER and maxlength do not work well together.
               * https://github.com/mui-org/material-ui/issues/5309#issuecomment-355462588
               */
              inputProps={{
                maxLength: 2,
              }}
              onChange={props.onValueChange}
            />}
          </Grid>
        </Grid>
        <Divider />
      </React.Fragment>
    );
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    if (nextProps.linodeLabel !== this.state.labelForm.initialValue) {
      this.setState(compose(
        set(lensPath(['labelForm', 'initialValue']), nextProps.linodeLabel),
        set(lensPath(['labelForm', 'updatedValue']), nextProps.linodeLabel),
      ));
    }
  }

  render() {
    const { classes } = this.props;
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const labelError = hasErrorFor('label');
    const passwordError = hasErrorFor('password');
    const diskIdError = hasErrorFor('diskId');

    const alertSections: Section[] = [
      {
        title: 'CPU Usage',
        textTitle: 'Usage Threshold',
        radioInputLabel: 'cpu_usage_state',
        textInputLabel: 'cpu_usage_threshold',
        copy: 'Average CPU usage over 2 hours exceeding this value triggers this alert.',
        state: this.state.alertsForm.cpuusage.state,
        value: this.state.alertsForm.cpuusage.value,
        onStateChange: (e: React.ChangeEvent<{}>, v: string) =>
          this.setState(
            set(lensPath(['alertsForm', 'cpuusage', 'state']), v === 'true')),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['alertsForm', 'cpuusage', 'value']), Number(e.target.value)),
            )
            : () => null,
        error: hasErrorFor('alerts.cpu'),
      },
      {
        radioInputLabel: 'disk_io_state',
        textInputLabel: 'disk_io_threshold',
        textTitle: 'IO Threshold',
        title: 'Disk IO Rate',
        copy: 'Average Disk IO ops/sec over 2 horus exceeding this value triggers this alert.',
        state: this.state.alertsForm.diskio.state,
        value: this.state.alertsForm.diskio.value,
        onStateChange: (e: React.ChangeEvent<{}>, v: string) =>
          this.setState(
            set(lensPath(['alertsForm', 'diskio', 'state']), v === 'true')),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['alertsForm', 'diskio', 'value']), Number(e.target.value)),
            )
            : () => null,
        error: hasErrorFor('alerts.io'),
      },
      {
        radioInputLabel: 'incoming_traffic_state',
        textInputLabel: 'incoming_traffic_threshold',
        textTitle: 'Traffic Threshold',
        title: 'Incoming Traffic',
        copy: `Average incoming traffic over a 2 hour period exceeding this value triggers this
        alert.`,
        state: this.state.alertsForm.incoming.state,
        value: this.state.alertsForm.incoming.value,
        onStateChange: (e: React.ChangeEvent<{}>, v: string) =>
          this.setState(
            set(lensPath(['alertsForm', 'incoming', 'state']), v === 'true')),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['alertsForm', 'incoming', 'value']), Number(e.target.value)),
            )
            : () => null,
        error: hasErrorFor('alerts.network_in'),
      },
      {
        radioInputLabel: 'outbound_traffic_state',
        textInputLabel: 'outbound_traffic_threshold',
        textTitle: 'Traffic Threshold',
        title: 'Outbound Traffic',
        copy: `Average outbound traffic over a 2 hour period exceeding this value triggers this
        alert.`,
        state: this.state.alertsForm.outbound.state,
        value: this.state.alertsForm.outbound.value,
        onStateChange: (e: React.ChangeEvent<{}>, v: string) =>
          this.setState(
            set(lensPath(['alertsForm', 'outbound', 'state']), v === 'true')),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['alertsForm', 'outbound', 'value']), Number(e.target.value)),
            )
            : () => null,
        error: hasErrorFor('alerts.network_out'),
      },
      {
        radioInputLabel: 'transfer_quota_state',
        textInputLabel: 'transfer_quota_threshold',
        textTitle: 'Quota Threshold',
        title: 'Transfer Quota',
        copy: `Percentage of network transfer quota used being breater than this value will trigger
          this alert.`,
        state: this.state.alertsForm.transfer.state,
        value: this.state.alertsForm.transfer.value,
        onStateChange: (e: React.ChangeEvent<{}>, v: string) =>
          this.setState(
            set(lensPath(['alertsForm', 'transfer', 'state']), v === 'true'),
          ),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['alertsForm', 'transfer', 'value']), Number(e.target.value)),
            )
            : () => null,
        error: hasErrorFor('alerts.transfer_quota'),
      },
    ];

    return (
      <React.Fragment>
        <Typography variant="headline" className={classes.title}>Settings</Typography>
        <ExpansionPanel
          defaultExpanded
          heading="Linode Label"
          loading={this.state.labelForm.submitting}
          success={this.state.labelForm.success}
          actions={() =>
            <ActionsPanel>
              <Button variant="raised" color="primary" onClick={this.changeLabel} >Save</Button>
            </ActionsPanel>
          }
        >
          <TextField
            label="Label"
            value={this.state.labelForm.updatedValue}
            onChange={e =>
              this.setState(set(lensPath(['labelForm', 'updatedValue']), Number(e.target.value)))}
            errorText={labelError}
            error={Boolean(labelError)}
          />
        </ExpansionPanel>
        <ExpansionPanel
          defaultExpanded
          heading="Reset Root Password"
          loading={this.state.passwordForm.submitting}
          success={this.state.passwordForm.success}
          actions={() =>
            <ActionsPanel>
              <Button variant="raised" color="primary" onClick={this.changeDiskPassword}>
                Save
              </Button>
            </ActionsPanel>
          }
        >
          <FormControl fullWidth>
            <InputLabel
              htmlFor="disk"
              disableAnimation
              shrink={true}
              error={Boolean(diskIdError)}
            >
              Disk
          </InputLabel>
            <Select
              value={this.state.passwordForm.diskId}
              onChange={e =>
                this.setState(set(lensPath(['passwordForm', 'diskId']), Number(e.target.value)))}
              inputProps={{ name: 'disk', id: 'disk' }}
              error={Boolean(diskIdError)}
            >
              {
                this.state.disks.map(disk =>
                  <MenuItem key={disk.id} value={disk.id}>{disk.label}</MenuItem>)
              }
            </Select>
            {
              diskIdError &&
              <FormHelperText error={Boolean(diskIdError)}>Here's some action text!</FormHelperText>
            }
          </FormControl>
          <PasswordInput
            label="Password"
            value={this.state.passwordForm.value}
            onChange={e =>
              this.setState(set(lensPath(['passwordForm', 'value']), Number(e.target.value)))}
            errorText={passwordError}
            error={Boolean(passwordError)}
          />
        </ExpansionPanel>
        <ExpansionPanel
          defaultExpanded
          heading="Notification Thresholds"
          success={this.state.alertsForm.success}
          actions={() =>
            <ActionsPanel>
              <Button
                variant="raised"
                color="primary"
                onClick={this.setLinodeAlertThresholds}
              >
                Save
            </Button>
            </ActionsPanel>
          }
        >
          {
            alertSections.map((p, idx) => <this.AlertSection key={idx} {...p} />)
          }
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Shutdown Watchdog"></ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Advanced Configurations"></ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Delete Linode"></ExpansionPanel>
      </React.Fragment >
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const loaded = PromiseLoader<Props>({
  disks: ({ linodeId }) => getLinodeDisks(linodeId)
    .then(response => response.data)
    .then(disks => disks.filter(disk => disk.filesystem !== 'swap')),
});

const valueUnlessOff = ({ state, value }: { state: boolean, value: number }) => state ? value : 0;

export default loaded(styled(LinodeSettings));
