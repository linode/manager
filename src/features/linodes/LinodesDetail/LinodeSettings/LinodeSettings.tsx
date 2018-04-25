import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

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
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import Grid from 'src/components/Grid';

import {
  updateLinode,
  getLinodeDisks,
  changeLinodeDiskPassword,
  deleteLinode,
} from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import PasswordInput from 'src/components/PasswordInput';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import TextField from 'src/components/TextField';
import Select from 'src/components/Select';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Toggle from 'src/components/Toggle';

import LinodeSettingsLabelPanel from './LinodeSettingsLabelPanel';

interface Section {
  title: string;
  textTitle: string;
  radioInputLabel: string;
  textInputLabel: string;
  copy: string;
  state: boolean;
  value: number;
  onStateChange: (e: React.ChangeEvent<{}>, checked: boolean) => void;
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

interface DeleteDialog {
  open: boolean;
}

interface State {
  linodeLabel: string;
  disks: Linode.Disk[];
  passwordForm: PasswordFormState;
  alertsForm: AlertsFormState;
  deleteDialog: DeleteDialog;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props
  & PromiseLoaderProps
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

class LinodeSettings extends React.Component<CombinedProps, State> {
  state: State = {
    disks: this.props.disks.response,
    linodeLabel: this.props.linodeLabel,
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
    deleteDialog: {
      open: false,
    },
  };



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

  deleteLinode = () => {
    this.setState(set(lensPath(['deleteForm', 'submitting']), true));
    deleteLinode(this.props.linodeId)
      .then((response) => {
        this.props.history.push('/');
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors));
      });
  }

  openDeleteDialog = () => {
    this.setState({ deleteDialog: { open: true } });
  }

  AlertSection = (props: Section) => {
    return (
      <React.Fragment>
        <Grid container>
          <Grid item>
            <FormControlLabel
              className="toggleLabel"
              control={<Toggle checked={props.state} onChange={props.onStateChange} />}
              label={props.textTitle}
            />
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
    if (nextProps.linodeLabel !== this.state.linodeLabel) {
      this.setState(compose(
        set(lensPath(['linodeLabel']), nextProps.linodeLabel),
      ));
    }
  }

  render() {
    const { classes } = this.props;
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
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
        onStateChange: (e, checked) =>
          this.setState(set(lensPath(['alertsForm', 'cpuusage', 'state']), checked)),
        onValueChange: e =>
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
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['alertsForm', 'diskio', 'state']), checked)),
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
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['alertsForm', 'incoming', 'state']), checked)),
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
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['alertsForm', 'outbound', 'state']), checked)),
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
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['alertsForm', 'transfer', 'state']), checked),
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
        <LinodeSettingsLabelPanel
          linodeLabel={this.state.linodeLabel}
          linodeId={this.props.linodeId}
        />
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
        <ExpansionPanel defaultExpanded heading="Delete Linode">
          <Typography>Deleting a Linode will result in permenant data loss.</Typography>
          <Button
            variant="raised"
            color="secondary"
            className="destructive"
            onClick={this.openDeleteDialog}
          >
            Delete
          </Button>
        </ExpansionPanel>
        <ConfirmationDialog
          title="Confirm Deletion"
          actions={() =>
            <ActionsPanel>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={this.deleteLinode}
              >
                Delete
          </Button>
              <Button onClick={() => this.setState({ deleteDialog: { open: false } })}>
                Cancel
              </Button>
            </ActionsPanel>
          }
          open={this.state.deleteDialog.open}
        >
          Deleting a Linode will result in permenant data loss. Are you sure?
        </ConfirmationDialog>
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

export default compose<any, any, any, any>(
  withRouter,
  loaded,
  styled,
)(LinodeSettings);
