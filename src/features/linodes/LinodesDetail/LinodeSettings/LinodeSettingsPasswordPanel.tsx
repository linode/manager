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
import Button from 'material-ui/Button';
import InputLabel from 'material-ui/Input/InputLabel';
import MenuItem from 'material-ui/Menu/MenuItem';
import FormControl from 'material-ui/Form/FormControl';
import FormHelperText from 'material-ui/Form/FormHelperText';

import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import { changeLinodeDiskPassword, getLinodeDisks } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

import PasswordInput from 'src/components/PasswordInput';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Select from 'src/components/Select';
import Reload from 'src/assets/icons/reload.svg';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
  linodeLabel: string;
}

interface PromiseLoaderProps {
  disks: PromiseLoaderResponse<Linode.Disk[]>;
}

interface State {
  disks: Linode.Disk[];
  value: string;
  diskId: string | number;
  submitting: boolean;
  success?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames>;

class LinodeSettingsPasswordPanel extends React.Component<CombinedProps, State> {
  state: State = {
    disks: this.props.disks.response,
    value: '',
    diskId: pathOr('', ['disks', 'response', 0, 'id'], this.props),
    submitting: false,
  };

  changeDiskPassword = () => {
    this.setState(set(lensPath(['submitting']), true));
    this.setState(set(lensPath(['success']), undefined));
    this.setState(set(lensPath(['errors']), undefined));

    changeLinodeDiskPassword(
      this.props.linodeId,
      Number(this.state.diskId),
      this.state.value,
    )
      .then(response => response.data)
      .then((linode) => {
        this.setState(compose(
          set(lensPath(['success']), `Linode password changed successfully.`),
          set(lensPath(['submitting']), false),
          set(lensPath(['value']), ''),
          set(lensPath(['diskId']), ''),
        ));
      })
      .catch((error) => {
        this.setState(set(lensPath(['errors']), error.response.data.errors));
      });
  }

  render() {
    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const passwordError = hasErrorFor('password');
    const diskIdError = hasErrorFor('diskId');
    const { submitting } = this.state;

    return (
      <ExpansionPanel
        defaultExpanded
        heading="Reset Root Password"
        success={this.state.success}
        actions={() =>
          <ActionsPanel>
            {
              (submitting && !passwordError)
              ? (
                <Button
                  variant="raised"
                  color="secondary"
                  disabled
                  className="loading"
                >
                  <Reload />
                </Button>
              )
              : (
                <Button
                  variant="raised"
                  color="primary"
                  onClick={this.changeDiskPassword}
                >
                Save
                </Button>
              )
            }
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
            value={this.state.diskId}
            onChange={e =>
              this.setState(set(lensPath(['diskId']), Number(e.target.value)))}
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
const loaded = PromiseLoader<Props>({
  disks: ({ linodeId }) => getLinodeDisks(linodeId)
    .then(response => response.data)
    .then(disks => disks.filter(disk => disk.filesystem !== 'swap')),
});

const styled = withStyles(styles, { withTheme: true });

export default loaded(styled(LinodeSettingsPasswordPanel));
