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
} from 'material-ui';
import InputLabel from 'material-ui/Input/InputLabel';
import MenuItem from 'material-ui/Menu/MenuItem';
import FormControl from 'material-ui/Form/FormControl';
import FormHelperText from 'material-ui/Form/FormHelperText';

import { changeLinodeDiskPassword } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import Button from 'src/components/Button';
import PasswordInput from 'src/components/PasswordInput';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Select from 'src/components/Select';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import Notice from 'src/components/Notice';
type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeDisks: Linode.Disk[];
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
  state: State = {
    linodeDisks: this.props.linodeDisks
      .filter((disk: Linode.Disk) => disk.filesystem !== 'swap'),
    value: '',
    diskId: pathOr('', ['disks', 'response', 0, 'id'], this.props),
    submitting: false,
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
        ));
      });
  }

  render() {
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const passwordError = hasErrorFor('password');
    const diskIdError = hasErrorFor('diskId');
    const generalError = hasErrorFor('none');
    const { submitting } = this.state;

    return (
      <ExpansionPanel
        defaultExpanded
        heading="Reset Root Password"
        success={this.state.success}
        actions={() =>
          <ActionsPanel>
            <Button
              variant="raised"
              color="primary"
              onClick={this.changeDiskPassword}
              loading={submitting}
              disabled={submitting}
              data-qa-password-save
            >
              Save
            </Button>
          </ActionsPanel>
        }
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
          <Select
            value={this.state.diskId}
            onChange={e =>
              this.setState(set(lensPath(['diskId']), Number(e.target.value)))}
            inputProps={{ name: 'disk', id: 'disk' }}
            error={Boolean(diskIdError)}
            data-qa-select-disk
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
          {
            diskIdError &&
            <FormHelperText error={Boolean(diskIdError)}>{diskIdError}</FormHelperText>
          }
        </FormControl>
        <PasswordInput
          label="Password"
          value={this.state.value}
          onChange={e =>
            this.setState(set(lensPath(['value']), e.target.value))}
          errorText={passwordError}
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
