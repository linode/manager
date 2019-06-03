import { WithStyles } from '@material-ui/core/styles';
import { compose, lensPath, set } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import PasswordInput from 'src/components/PasswordInput';
import { changeLinodeDiskPassword, getLinodeDisks } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { debounce } from 'throttle-debounce';
import { withLinodeDetailContext } from '../linodeDetailContext';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeStatus: string;
}

interface State {
  value: string;
  submitting: boolean;

  disksLoading: boolean;
  disks: Item[];
  disksError?: string;
  diskId?: number;

  success?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & ContextProps & WithStyles<ClassNames>;

interface ContextProps {
  permissions: Linode.GrantLevel;
}

class LinodeSettingsPasswordPanel extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    submitting: false,
    value: '',
    disksLoading: true,
    disks: []
  };

  changeDiskPassword = () => {
    const { diskId, value } = this.state;
    const { linodeId } = this.props;

    if (!diskId) {
      return;
    }
    this.setState(
      compose(
        set(lensPath(['submitting']), true),
        set(lensPath(['success']), undefined),
        set(lensPath(['errors']), undefined)
      )
    );

    changeLinodeDiskPassword(linodeId, diskId, value)
      .then(linode => {
        this.setState(
          compose(
            set(lensPath(['success']), `Linode password changed successfully.`),
            set(lensPath(['submitting']), false),
            set(lensPath(['value']), '')
          )
        );
      })
      .catch((errors: Linode.ApiFieldError[]) => {
        this.setState(
          compose(
            set(lensPath(['errors']), errors),
            set(lensPath(['submitting']), false)
          ),
          () => {
            scrollErrorIntoView('linode-settings-password');
          }
        );
      });
  };

  handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(set(lensPath(['value']), e.target.value));
  };

  renderExpansionActions = () => {
    const { submitting } = this.state;
    const { linodeStatus, permissions } = this.props;
    const disabled = permissions === 'read_only';

    return (
      <ActionsPanel>
        <Button
          type="primary"
          onClick={this.changeDiskPassword}
          loading={submitting}
          disabled={disabled || linodeStatus !== 'offline' || submitting}
          data-qa-password-save
          tooltipText={
            linodeStatus !== 'offline'
              ? 'Your Linode must be fully powered down in order to change your root password'
              : ''
          }
        >
          Save
        </Button>
      </ActionsPanel>
    );
  };

  searchDisks = (value: string = '') => {
    if (this.state.disksLoading === false) {
      this.setState({ disksLoading: true });
    }

    return getLinodeDisks(
      this.props.linodeId,
      {},
      { label: { '+contains': value } }
    )
      .then(response =>
        response.data
          .filter((disk: Linode.Disk) => disk.filesystem !== 'swap')
          .map(disk => ({
            value: disk.id,
            label: disk.label,
            data: disk
          }))
      )
      .then(disks => {
        this.setState({ disks, disksLoading: false });

        /** TLDR; If we only have one disk we set that to state after the disks have been set */
        if (disks.length === 1) {
          this.handleDiskSelection(disks[0]);
        }
      })
      .catch(error =>
        this.setState({
          disksError: 'An error occured while searching for disks.',
          disksLoading: false
        })
      );
  };

  debouncedSearch = debounce(400, false, this.searchDisks);

  onInputChange = (inputValue: string, actionMeta: { action: string }) => {
    if (actionMeta.action !== 'input-change') {
      return;
    }
    this.setState({ disksLoading: true });
    this.debouncedSearch(inputValue);
  };

  handleDiskSelection = (selected: Item) => {
    if (selected) {
      return this.setState({ diskId: Number(selected.value) });
    }

    return this.setState({ diskId: undefined });
  };

  handlePanelChange = (e: React.ChangeEvent<{}>, open: boolean) => {
    if (open) {
      this.searchDisks();
    }
  };

  getSelectedDisk = (diskId: number) => {
    const { disks } = this.state;
    const idx = disks.findIndex(disk => disk.value === diskId);
    if (idx > -1) {
      return disks[idx];
    } else {
      return null;
    }
  };

  render() {
    const { diskId, disks, disksError, disksLoading } = this.state;
    const { permissions } = this.props;
    const selectedDisk = diskId ? this.getSelectedDisk(diskId) : null;
    const disabled = permissions === 'read_only';

    const hasErrorFor = getAPIErrorFor({}, this.state.errors);
    const passwordError = hasErrorFor('password');
    const diskIdError = hasErrorFor('diskId');
    const generalError = hasErrorFor('none');

    return (
      <ExpansionPanel
        heading="Reset Root Password"
        success={this.state.success}
        actions={this.renderExpansionActions}
        onChange={this.handlePanelChange}
      >
        {generalError && <Notice text={generalError} error />}
        <EnhancedSelect
          label="Disk"
          placeholder="Find a Disk"
          isLoading={disksLoading}
          errorText={disksError || diskIdError}
          options={disks}
          onChange={this.handleDiskSelection}
          onInputChange={this.onInputChange}
          value={selectedDisk}
          data-qa-select-linode
          disabled={disabled}
          isClearable={false}
        />
        <PasswordInput
          autoComplete="new-password"
          label="Password"
          value={this.state.value}
          onChange={this.handlePasswordChange}
          errorText={passwordError}
          errorGroup="linode-settings-password"
          error={Boolean(passwordError)}
          data-qa-password-input
          disabled={disabled}
          disabledReason={
            disabled
              ? "You don't have permissions to modify this Linode"
              : undefined
          }
        />
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext<ContextProps>(({ linode }) => ({
  permissions: linode._permissions
}));

const errorBoundary = PanelErrorBoundary({ heading: 'Reset Root Password' });

export default compose(
  errorBoundary,
  linodeContext,
  styled
)(LinodeSettingsPasswordPanel) as React.ComponentType<Props>;
