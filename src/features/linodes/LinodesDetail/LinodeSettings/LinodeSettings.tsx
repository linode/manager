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

interface AlertsFormState {
  submitting: boolean;
  success?: string;
  cpuusage: {
    state: boolean;
    value: string;
  };
  diskio: {
    state: boolean;
    value: string;
  };
  incoming: {
    state: boolean;
    value: string;
  };
  outbound: {
    state: boolean;
    value: string;
  };
  transfer: {
    state: boolean;
    value: string;
  };
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
        state: true,
        value: '',
      },
      diskio: {
        state: true,
        value: '',
      },
      incoming: {
        state: true,
        value: '',
      },
      outbound: {
        state: true,
        value: '',
      },
      transfer: {
        state: true,
        value: '',
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
    const hasErrorFor = getAPIErrorFor({ label: 'label', password: 'password' }, this.state.errors);
    const labelError = hasErrorFor('label');
    const passwordError = hasErrorFor('password');
    const diskIdError = hasErrorFor('diskId');

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
              this.setState(set(lensPath(['labelForm', 'updatedValue']), e.target.value))}
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
                this.setState(set(lensPath(['passwordForm', 'diskId']), e.target.value))}
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
            onChange={e => this.setState(set(lensPath(['passwordForm', 'value']), e.target.value))}
            errorText={passwordError}
            error={Boolean(passwordError)}
          />
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Notification Thresholds">
          CPU Usage
          <RadioGroup
            aria-label="cpu_usage"
            name="gender"
            value={String(this.state.alertsForm.cpuusage.state)}
            onChange={(e, v) =>
              this.setState(set(lensPath(['alertsForm', 'cpuusage', 'state']), v))}
          >
            <FormControlLabel value="true" label="On" control={<Radio />} />
            <FormControlLabel value="false" label="Off" control={<Radio />} />
          </RadioGroup>
            <TextField
              label="Usage Threshold"
              type="number"
              value={this.state.alertsForm.cpuusage.value}
              inputProps={{
                maxLength: 2,
                endAdornment: <span>%</span>,
              }}
              onChange={e =>
                  this.setState(set(lensPath(['alertsForm', 'cpuusage', 'value']), e.target.value))}
            />
          <Divider />
          {/* Disk IO Rate
              <RadioGroup
            aria-label="gender"
            name="gender"
            value={this.state.value}
            onChange={this.handleChange}
          >
            <FormControlLabel value="Disabled" label="Disabled" control={<Radio disabled />} />
            <FormControlLabel value="D" label="Default" control={<Radio />} />
            <FormControlLabel value="B" label="Warning" control={<Radio variant="warning" />} />
            <FormControlLabel value="A" label="Error" control={<Radio variant="error" />} />
          </RadioGroup>
          <Divider />
          Incoming Traffic
              <RadioGroup
            aria-label="gender"
            name="gender"
            value={this.state.value}
            onChange={this.handleChange}
          >
            <FormControlLabel value="Disabled" label="Disabled" control={<Radio disabled />} />
            <FormControlLabel value="D" label="Default" control={<Radio />} />
            <FormControlLabel value="B" label="Warning" control={<Radio variant="warning" />} />
            <FormControlLabel value="A" label="Error" control={<Radio variant="error" />} />
          </RadioGroup>
          <Divider />
          Outbound Traffic
              <RadioGroup
            aria-label="gender"
            name="gender"
            value={this.state.value}
            onChange={this.handleChange}
          >
            <FormControlLabel value="Disabled" label="Disabled" control={<Radio disabled />} />
            <FormControlLabel value="D" label="Default" control={<Radio />} />
            <FormControlLabel value="B" label="Warning" control={<Radio variant="warning" />} />
            <FormControlLabel value="A" label="Error" control={<Radio variant="error" />} />
          </RadioGroup>
          <Divider />
          Transfer Quota
              <RadioGroup
            aria-label="gender"
            name="gender"
            value={this.state.value}
            onChange={this.handleChange}
          >
            <FormControlLabel value="Disabled" label="Disabled" control={<Radio disabled />} />
            <FormControlLabel value="D" label="Default" control={<Radio />} />
            <FormControlLabel value="B" label="Warning" control={<Radio variant="warning" />} />
            <FormControlLabel value="A" label="Error" control={<Radio variant="error" />} />
          </RadioGroup> */}
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Shutdown Watchdog"></ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Advanced Configurations"></ExpansionPanel>
        <ExpansionPanel defaultExpanded heading="Delete Linode"></ExpansionPanel>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const loaded = PromiseLoader<Props>({
  disks: ({ linodeId }) => getLinodeDisks(linodeId)
    .then(response => response.data)
    .then(disks => disks.filter(disk => disk.filesystem !== 'swap')),
});

export default loaded(styled(LinodeSettings));
