import { restoreBackup } from 'linode-js-sdk/lib/linodes';
import { Profile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import withProfile from 'src/containers/profile.container';
import withLinodes, {
  Props as LinodeProps
} from 'src/containers/withLinodes.container';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector.ts';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

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
  overwrite: boolean;
  selectedLinode?: string;
  errors?: APIError[];
}

interface ProfileProps {
  profile?: Profile;
}

export type CombinedProps = Props & ProfileProps & LinodeProps;

const canEditLinode = (profile: Profile | null, linodeId: number): boolean => {
  return getPermissionsForLinode(profile, linodeId) === 'read_only';
};
export class RestoreToLinodeDrawer extends React.Component<
  CombinedProps,
  State
> {
  defaultState = {
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
    this.setState({ ...this.defaultState });
  };

  componentDidMount() {
    this.mounted = true;
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
    const { selectedLinode, overwrite, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);
    const linodeError = hasErrorFor('linode_id');
    const overwriteError = hasErrorFor('overwrite');
    const generalError = hasErrorFor('none');

    const readOnly = canEditLinode(profile || null, Number(selectedLinode));
    const selectError = Boolean(linodeError) || readOnly;

    const linodeOptions = this.props.linodesData
      .filter(linode => linode.region === this.props.linodeRegion)
      .map(({ label, id }) => {
        return { label, value: id };
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
              dataAttrs: {
                'data-qa-select-linode': true
              }
            }}
            defaultValue={selectedLinode || ''}
            options={linodeOptions}
            onChange={this.handleSelectLinode}
            errorText={linodeError}
            placeholder="Select a Linode"
            isClearable={false}
            label="Select a Linode"
            hideLabel
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

const enhanced = compose<CombinedProps, Props>(
  withProfile<ProfileProps, Props>((ownProps, { profileData: profile }) => {
    return {
      profile
    };
  }),
  withLinodes()
);

export default enhanced(RestoreToLinodeDrawer);
