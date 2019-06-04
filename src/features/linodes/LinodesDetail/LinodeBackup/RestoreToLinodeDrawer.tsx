import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import withProfile from 'src/containers/profile.container';
import { getLinodes, restoreBackup } from 'src/services/linodes';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector.ts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {}
  });

interface Props {
  open: boolean;
  linodeID: number;
  linodeRegion: string;
  backupCreated: string;
  backupID?: number;
  onClose: () => void;
  onSubmit: () => void;
}

interface State {
  linodes: string[][];
  overwrite: boolean;
  selectedLinode?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props &
  WithStyles<ClassNames> & {
    profile?: Linode.Profile;
  };

const canEditLinode = (
  profile: Linode.Profile | null,
  linodeId: number
): boolean => {
  return getPermissionsForLinode(profile, linodeId) === 'read_only';
};
export class RestoreToLinodeDrawer extends React.Component<
  CombinedProps,
  State
> {
  defaultState = {
    linodes: [],
    overwrite: false,
    selectedLinode: 'none',
    errors: []
  };

  mounted: boolean = false;

  state: State = this.defaultState;

  reset = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({ ...this.defaultState, linodes: this.state.linodes });
  };

  componentDidMount() {
    this.mounted = true;
    const { linodeRegion } = this.props;
    getLinodes({ page: 1 }, { region: linodeRegion }).then(response => {
      if (!this.mounted) {
        return;
      }
      const linodeChoices = response.data.map(linode => {
        return [`${linode.id}`, linode.label];
      });
      this.setState({ linodes: linodeChoices });
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  restoreToLinode = () => {
    const { onSubmit, linodeID, backupID } = this.props;
    const { selectedLinode, overwrite } = this.state;
    if (!this.mounted) {
      return;
    }
    if (!selectedLinode || selectedLinode === 'none') {
      this.setState(
        {
          errors: [
            ...(this.state.errors || []),
            { field: 'linode_id', reason: 'You must select a Linode' }
          ]
        },
        () => {
          scrollErrorIntoView();
        }
      );
      return;
    }
    restoreBackup(linodeID, Number(backupID), Number(selectedLinode), overwrite)
      .then(() => {
        this.reset();
        onSubmit();
      })
      .catch(errResponse => {
        if (!this.mounted) {
          return;
        }
        this.setState({ errors: getAPIErrorOrDefault(errResponse) }, () => {
          scrollErrorIntoView();
        });
      });
  };

  handleSelectLinode = (e: Item<string>) => {
    this.setState({ selectedLinode: e.value });
  };

  handleToggleOverwrite = () => {
    this.setState({ overwrite: !this.state.overwrite });
  };

  handleCloseDrawer = () => {
    this.reset();
    this.props.onClose();
  };

  errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite'
  };

  render() {
    const { open, backupCreated, profile } = this.props;
    const { linodes, selectedLinode, overwrite, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);
    const linodeError = hasErrorFor('linode_id');
    const overwriteError = hasErrorFor('overwrite');
    const generalError = hasErrorFor('none');

    const readOnly = canEditLinode(profile || null, Number(selectedLinode));
    const selectError = Boolean(linodeError) || readOnly;

    const linodeList =
      linodes &&
      linodes.map(l => {
        const label = l[1];
        return { label, value: l[0] };
      });

    return (
      <Drawer
        open={open}
        onClose={this.handleCloseDrawer}
        title={`Restore Backup from ${backupCreated}`}
      >
        <FormControl fullWidth>
          <InputLabel
            htmlFor="linode"
            disableAnimation
            shrink={true}
            error={Boolean(linodeError)}
          >
            Linode
          </InputLabel>
          <Select
            textFieldProps={{
              'data-qa-select-linode': true
            }}
            defaultValue={selectedLinode || ''}
            options={linodeList}
            onChange={this.handleSelectLinode}
            errorText={linodeError}
            placeholder="Select a Linode"
            isClearable={false}
          />
          {selectError && (
            <FormHelperText error>
              {linodeError || "You don't have permission to edit this Linode."}
            </FormHelperText>
          )}
        </FormControl>
        <FormControlLabel
          control={
            <CheckBox
              checked={overwrite}
              onChange={this.handleToggleOverwrite}
            />
          }
          label="Overwrite Linode"
        />
        {overwrite && (
          <Notice
            warning
            text="This will delete all disks and configs on this Linode"
          />
        )}
        {Boolean(overwriteError) && (
          <FormHelperText error>{overwriteError}</FormHelperText>
        )}
        {Boolean(generalError) && (
          <FormHelperText error>{generalError}</FormHelperText>
        )}
        <ActionsPanel>
          <Button
           buttonType="primary"
            onClick={this.restoreToLinode}
            data-qa-restore-submit
            disabled={readOnly}
          >
            Restore
          </Button>
          <Button data-qa-restore-cancel onClick={this.handleCloseDrawer}>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withProfile((ownProps, profile) => {
    return {
      ...ownProps,
      profile: profile.data
    };
  })
);

export default enhanced(RestoreToLinodeDrawer);
