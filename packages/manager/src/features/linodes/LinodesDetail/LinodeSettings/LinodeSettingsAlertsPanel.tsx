import { GrantLevel } from 'linode-js-sdk/lib/account';
import { compose, lensPath, set } from 'ramda';
import * as React from 'react';
import { compose as rCompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import AlertSection from './AlertSection';

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
  endAdornment: string;
}

type CombinedProps = Props & ContextProps & LinodeActionsProps;

const maybeNumber = (v: string) => (v === '' ? '' : Number(v));

class LinodeSettingsAlertsPanel extends React.Component<CombinedProps, State> {
  public state: State = {
    submitting: false,
    cpuusage: {
      state: this.props.linodeAlerts.cpu > 0,
      value: this.props.linodeAlerts.cpu
    },
    diskio: {
      state: this.props.linodeAlerts.io > 0,
      value: this.props.linodeAlerts.io
    },
    incoming: {
      state: this.props.linodeAlerts.network_in > 0,
      value: this.props.linodeAlerts.network_in
    },
    outbound: {
      state: this.props.linodeAlerts.network_out > 0,
      value: this.props.linodeAlerts.network_out
    },
    transfer: {
      state: this.props.linodeAlerts.transfer_quota > 0,
      value: this.props.linodeAlerts.transfer_quota
    }
  };

  renderAlertSections = () => {
    const hasErrorFor = getAPIErrorFor(
      {
        'alerts.cpu': 'CPU',
        'alerts.network_in': 'Incoming traffic',
        'alerts.network_out': 'Outbound traffic',
        'alerts.transfer_quota': 'Transfer quota',
        'alerts.io': 'Disk IO rate'
      },
      this.state.errors
    );

    return [
      {
        title: 'CPU Usage',
        textTitle: 'Usage Threshold',
        radioInputLabel: 'cpu_usage_state',
        textInputLabel: 'cpu_usage_threshold',
        copy:
          'Average CPU usage over 2 hours exceeding this value triggers this alert.',
        state: this.state.cpuusage.state,
        value: this.state.cpuusage.value,
        onStateChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          checked: boolean
        ) => this.setState(set(lensPath(['cpuusage', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          this.setState(
            set(lensPath(['cpuusage', 'value']), maybeNumber(e.target.value))
          );
        },
        error: hasErrorFor('alerts.cpu'),
        endAdornment: '%'
      },
      {
        radioInputLabel: 'disk_io_state',
        textInputLabel: 'disk_io_threshold',
        textTitle: 'IO Threshold',
        title: 'Disk IO Rate',
        copy:
          'Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert.',
        state: this.state.diskio.state,
        value: this.state.diskio.value,
        onStateChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          checked: boolean
        ) => this.setState(set(lensPath(['diskio', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          this.setState(
            set(lensPath(['diskio', 'value']), maybeNumber(e.target.value))
          ),
        error: hasErrorFor('alerts.io'),
        endAdornment: 'IOPS'
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
        onStateChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          checked: boolean
        ) => this.setState(set(lensPath(['incoming', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          this.setState(
            set(lensPath(['incoming', 'value']), maybeNumber(e.target.value))
          ),
        error: hasErrorFor('alerts.network_in'),
        endAdornment: 'Mb/s'
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
        onStateChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          checked: boolean
        ) => this.setState(set(lensPath(['outbound', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          this.setState(
            set(lensPath(['outbound', 'value']), maybeNumber(e.target.value))
          ),
        error: hasErrorFor('alerts.network_out'),
        endAdornment: 'Mb/s'
      },
      {
        radioInputLabel: 'transfer_quota_state',
        textInputLabel: 'transfer_quota_threshold',
        textTitle: 'Quota Threshold',
        title: 'Transfer Quota',
        copy: `Percentage of network transfer quota used being greater than this value will trigger
          this alert.`,
        state: this.state.transfer.state,
        value: this.state.transfer.value,
        onStateChange: (
          e: React.ChangeEvent<HTMLInputElement>,
          checked: boolean
        ) => this.setState(set(lensPath(['transfer', 'state']), checked)),
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          this.setState(
            set(lensPath(['transfer', 'value']), maybeNumber(e.target.value))
          ),
        error: hasErrorFor('alerts.transfer_quota'),
        endAdornment: '%'
      }
    ];
  };

  renderExpansionActions = () => {
    const noError =
      this.state.submitting &&
      !this.renderAlertSections().reduce(
        (result, s) => result || Boolean(s.error),
        false
      );

    const { permissions } = this.props;

    return (
      <ActionsPanel>
        <Button
          buttonType="primary"
          onClick={this.setLinodeAlertThresholds}
          disabled={noError || permissions === 'read_only'}
          loading={noError}
          data-qa-alerts-save
        >
          Save
        </Button>
      </ActionsPanel>
    );
  };

  setLinodeAlertThresholds = () => {
    const {
      linodeActions: { updateLinode }
    } = this.props;
    this.setState(set(lensPath(['errors']), undefined));
    this.setState(set(lensPath(['success']), undefined));
    this.setState(set(lensPath(['submitting']), true));

    updateLinode({
      linodeId: this.props.linodeId,
      alerts: {
        cpu: valueUnlessOff(this.state.cpuusage),
        network_in: valueUnlessOff(this.state.incoming),
        network_out: valueUnlessOff(this.state.outbound),
        transfer_quota: valueUnlessOff(this.state.transfer),
        io: valueUnlessOff(this.state.diskio)
      }
    })
      .then(_ => {
        this.setState(
          compose(
            set(
              lensPath(['success']),
              `Linode alert thresholds changed successfully.`
            ),
            set(lensPath(['submitting']), false)
          )
        );
      })
      .catch(error => {
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(
              error,
              'Unable to update alerts thresholds.'
            )
          },
          () => scrollErrorIntoView()
        );
      });
  };

  public render() {
    const { permissions } = this.props;
    const alertSections: Section[] = this.renderAlertSections();
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const generalError = hasErrorFor('none');

    return (
      <ExpansionPanel
        heading="Notification Thresholds"
        success={this.state.success}
        actions={this.renderExpansionActions}
      >
        {generalError && <Notice error>{generalError}</Notice>}
        {alertSections.map((p, idx) => (
          <AlertSection
            updateFor={[p.state, p.value, this.state.errors]}
            key={idx}
            {...p}
            readOnly={permissions === 'read_only'}
          />
        ))}
      </ExpansionPanel>
    );
  }
}

const valueUnlessOff = ({ state, value }: { state: boolean; value: number }) =>
  state ? value : 0;

const errorBoundary = PanelErrorBoundary({
  heading: 'Notification Thresholds'
});

interface ContextProps {
  permissions: GrantLevel;
}

const linodeContext = withLinodeDetailContext<ContextProps>(({ linode }) => ({
  permissions: linode._permissions
}));

export default rCompose<CombinedProps, Props>(
  errorBoundary,
  linodeContext,
  withLinodeActions
)(LinodeSettingsAlertsPanel) as React.ComponentType<Props>;
