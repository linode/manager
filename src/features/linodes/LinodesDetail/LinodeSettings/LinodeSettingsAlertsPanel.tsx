import * as React from 'react';

import {
  compose,
  lensPath,
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
import FormControlLabel from 'material-ui/Form/FormControlLabel';

import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import { updateLinode } from 'src/services/linodes';
import Grid from 'src/components/Grid';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import TextField from 'src/components/TextField';
import Toggle from 'src/components/Toggle';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeAlerts: Linode.LinodeAlerts;
}

interface State {
  submitting: boolean;
  success?: string;
  cpuusage: AlertState;
  diskio: AlertState;
  incoming: AlertState;
  outbound: AlertState;
  transfer: AlertState;
  errors?: Linode.ApiFieldError[];
}

interface AlertState {
  state: boolean;
  value: number;
}

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

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeSettingsAlertsPanel extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    cpuusage: {
      state: this.props.linodeAlerts.cpu > 0,
      value: this.props.linodeAlerts.cpu,
    },
    diskio: {
      state: this.props.linodeAlerts.io > 0,
      value: this.props.linodeAlerts.io,
    },
    incoming: {
      state: this.props.linodeAlerts.network_in > 0,
      value: this.props.linodeAlerts.network_in,
    },
    outbound: {
      state: this.props.linodeAlerts.network_out > 0,
      value: this.props.linodeAlerts.network_out,
    },
    transfer: {
      state: this.props.linodeAlerts.transfer_quota > 0,
      value: this.props.linodeAlerts.transfer_quota,
    },
  };

  setLinodeAlertThresholds = () => {
    this.setState(set(lensPath(['errors']), undefined));
    this.setState(set(lensPath(['success']), undefined));
    this.setState(set(lensPath(['submitting']), true));

    updateLinode(
      this.props.linodeId,
      {
        alerts: {
          cpu: valueUnlessOff(this.state.cpuusage),
          network_in: valueUnlessOff(this.state.incoming),
          network_out: valueUnlessOff(this.state.outbound),
          transfer_quota: valueUnlessOff(this.state.transfer),
          io: valueUnlessOff(this.state.diskio),
        },
      },
    )
      .then((response) => {
        this.setState(compose(
          set(lensPath(['success']), `Linode alert thresholds changed successfully.`),
          set(lensPath(['submitting']), false),
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

  render() {
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);

    const alertSections: Section[] = [
      {
        title: 'CPU Usage',
        textTitle: 'Usage Threshold',
        radioInputLabel: 'cpu_usage_state',
        textInputLabel: 'cpu_usage_threshold',
        copy: 'Average CPU usage over 2 hours exceeding this value triggers this alert.',
        state: this.state.cpuusage.state,
        value: this.state.cpuusage.value,
        onStateChange: (e, checked) =>
          this.setState(set(lensPath(['cpuusage', 'state']), checked)),
        onValueChange: e =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['cpuusage', 'value']), Number(e.target.value)),
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
        state: this.state.diskio.state,
        value: this.state.diskio.value,
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['diskio', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['diskio', 'value']), Number(e.target.value)),
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
        state: this.state.incoming.state,
        value: this.state.incoming.value,
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['incoming', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['incoming', 'value']), Number(e.target.value)),
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
        state: this.state.outbound.state,
        value: this.state.outbound.value,
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['outbound', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['outbound', 'value']), Number(e.target.value)),
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
        state: this.state.transfer.state,
        value: this.state.transfer.value,
        onStateChange: (e, checked) =>
          this.setState(
            set(lensPath(['transfer', 'state']), checked),
          ),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.target.value.length <= 2
            ? this.setState(
              set(lensPath(['transfer', 'value']), Number(e.target.value)),
            )
            : () => null,
        error: hasErrorFor('alerts.transfer_quota'),
      },
    ];

    return (
      <ExpansionPanel
        defaultExpanded
        heading="Notification Thresholds"
        success={this.state.success}
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
    );
  }
}

const valueUnlessOff = ({ state, value }: { state: boolean, value: number }) => state ? value : 0;

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeSettingsAlertsPanel);
