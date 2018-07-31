import { compose, lensPath, pathOr, set } from 'ramda';
import * as React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import PasswordInput from 'src/components/PasswordInput';
import Select from 'src/components/Select';
import { changeLinodeDiskPassword } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeDisks: Linode.Disk[];
  linodeStatus: string;
}

interface State {
  linodeDisks: Linode.Disk[];
  value: string;
  diskId: string | number;
  submitting: boolean;
  success?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeSettingsPasswordPanel extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    const linodeDisks = this.props.linodeDisks
    .filter((disk: Linode.Disk) => disk.filesystem !== 'swap');
    const diskId = linodeDisks.length === 1 ?
                   linodeDisks[0].id :
                   pathOr('', ['disks', 'response', 0, 'id'], this.props);

    this.state = {
      diskId,
      linodeDisks,
      submitting: false,
      value: '',
    }
  };

  changeDiskPassword = () => {
    this.setState(compose(
      set(lensPath(['submitting']), true),
      set(lensPath(['success']), undefined),
      set(lensPath(['errors']), undefined),
    ));

    changeLinodeDiskPassword(
      this.props.linodeId,
      Number(this.state.diskId),
      this.state.value,
    )
      .then((linode) => {
        this.setState(compose(
          set(lensPath(['success']), `Linode password changed successfully.`),
          set(lensPath(['submitting']), false),
          set(lensPath(['value']), ''),
          set(lensPath(['diskId']), ''),
        ));
      })
      .catch((error) => {
        this.setState(compose(
          set(lensPath(['errors']), error.response.data.errors),
          set(lensPath(['submitting']), false),
        ), () => {
          scrollErrorIntoView('linode-settings-password');
        });
      });
  }

  handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(set(lensPath(['value']), e.target.value))
  }

  handleDiskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState(set(lensPath(['diskId']), Number(e.target.value)))
  }

  renderExpansionActions = () => {
    const { submitting } = this.state;
    const { linodeStatus } = this.props;

    return <ActionsPanel>
              <Button
                type="primary"
                onClick={this.changeDiskPassword}
                loading={submitting}
                disabled={linodeStatus !== 'offline' || submitting}
                data-qa-password-save
                tooltipText={
                  linodeStatus !== 'offline'
                  ?
                    'Your Linode must be fully powered down in order to change your root password'
                  : ''
                }
              >
                Save
              </Button>
            </ActionsPanel>
  }

  render() {
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const passwordError = hasErrorFor('password');
    const diskIdError = hasErrorFor('diskId');
    const generalError = hasErrorFor('none');
    const singleDisk = this.state.linodeDisks.length === 1;


    return (
      <ExpansionPanel
        heading="Reset Root Password"
        success={this.state.success}
        actions={this.renderExpansionActions}
      >
        {generalError && <Notice text={generalError} error />}
        <FormControl fullWidth>
          <InputLabel
            htmlFor="disk"
            disableAnimation
            shrink={true}
            error={Boolean(diskIdError)}
          >
            Disk
          </InputLabel>
          <div>
            <Select
              value={this.state.diskId}
              disabled={singleDisk}
              onChange={this.handleDiskChange}
              inputProps={{ name: 'disk', id: 'disk' }}
              error={Boolean(diskIdError)}
              data-qa-select-disk={singleDisk}
              tooltipText={singleDisk ? 'This option is available for Linodes with multiple disks.' : ''}
            >
              {
                this.state.linodeDisks.map(disk =>
                  <MenuItem
                    key={disk.id}
                    value={disk.id}
                    data-qa-disk={disk.label}
                  >
                    {disk.label}
                  </MenuItem>)
              }
            </Select>
          </div>
          {
            diskIdError &&
            <FormHelperText error={Boolean(diskIdError)}>{diskIdError}</FormHelperText>
          }
        </FormControl>
        <PasswordInput
          label="Password"
          value={this.state.value}
          onChange={this.handlePasswordChange}
          errorText={passwordError}
          errorGroup="linode-settings-password"
          error={Boolean(passwordError)}
        />
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const errorBoundary = PanelErrorBoundary({ heading: 'Reset Root Password' });

export default compose(
  errorBoundary,
  styled,
)(LinodeSettingsPasswordPanel) as React.ComponentType<Props>;
