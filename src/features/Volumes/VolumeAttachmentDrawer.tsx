import { path, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import Select from 'src/components/Select';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { resetEventsPolling } from 'src/events';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import { getLinodeConfigs } from 'src/services/linodes';
import { MapState } from 'src/store/types';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  open: boolean;
  volumeId: number;
  volumeLabel: string;
  linodeRegion: string;
  onClose: () => void;
  disabled?: boolean;
}

interface State {
  configs: string[][];
  selectedLinode: number | null;
  selectedConfig?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props &
  VolumesRequests &
  WithStyles<ClassNames> &
  StateProps;

class VolumeAttachmentDrawer extends React.Component<CombinedProps, State> {
  defaultState = {
    configs: [],
    selectedLinode: null,
    selectedConfig: 'none',
    errors: []
  };

  state: State = this.defaultState;

  reset = () => {
    this.setState({ ...this.defaultState });
  };

  updateConfigs(linodeID: number) {
    getLinodeConfigs(linodeID)
      .then(response => {
        const configChoices = response.data.map(config => {
          return [`${config.id}`, config.label];
        });
        this.setState({ configs: configChoices });
        if (configChoices.length > 1) {
          this.setState({
            selectedConfig: configChoices[0][0]
          });
        }
      })
      .catch(() => {
        /*
         * @note: If we can't get configs for the Linode, then the user can
         * still create the volume, so we probably shouldn't show any error
         * state if this fails.
         */
      });
  }

  changeSelectedLinode = (linodeId: number | null) => {
    this.setState({ selectedLinode: linodeId });
    if (linodeId) {
      this.updateConfigs(linodeId);
    }
  };

  changeSelectedConfig = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedConfig: e.target.value });
  };

  handleClose = () => {
    this.reset();
    this.props.onClose();
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({ configs: [] });
  }

  attachToLinode = () => {
    const { volumeId, attachVolume } = this.props;
    const { selectedLinode, selectedConfig } = this.state;
    if (!selectedLinode) {
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

    attachVolume({
      volumeId,
      linode_id: Number(selectedLinode),
      config_id: Number(selectedConfig) || undefined
    })
      .then(_ => {
        resetEventsPolling();
        this.handleClose();
      })
      .catch(error => {
        this.setState(
          { errors: path(['response', 'data', 'errors'], error) },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite'
  };

  render() {
    const { open, volumeLabel, disabled, linodeRegion, readOnly } = this.props;
    const { configs, selectedLinode, selectedConfig, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);
    const linodeError = hasErrorFor('linode_id');
    const configError = hasErrorFor('config_id');
    const generalError = hasErrorFor('none');

    return (
      <Drawer
        open={open}
        onClose={this.handleClose}
        title={`Attach Volume ${volumeLabel}`}
      >
        {readOnly && (
          <Notice
            text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
            error={true}
            important
          />
        )}
        <LinodeSelect
          selectedLinode={selectedLinode}
          region={linodeRegion}
          handleChange={this.changeSelectedLinode}
          linodeError={linodeError}
          generalError={generalError}
          disabled={disabled || readOnly}
        />
        {!linodeError ||
          (!generalError && (
            <FormHelperText>
              Only Linodes in this Volume's region are displayed.
            </FormHelperText>
          ))}

        {/* Config Selection */}
        {configs.length > 1 && (
          <FormControl fullWidth>
            <InputLabel
              htmlFor="config"
              disableAnimation
              shrink={true}
              error={Boolean(configError)}
              disabled={disabled || readOnly}
            >
              Config
            </InputLabel>
            <Select
              value={selectedConfig || ''}
              onChange={this.changeSelectedConfig}
              inputProps={{ name: 'config', id: 'config' }}
              error={Boolean(configError)}
              disabled={disabled || readOnly}
            >
              {configs &&
                configs.map(el => {
                  return (
                    <MenuItem key={el[0]} value={el[0]}>
                      {el[1]}
                    </MenuItem>
                  );
                })}
            </Select>
            {Boolean(configError) && (
              <FormHelperText error>{configError}</FormHelperText>
            )}
          </FormControl>
        )}

        <ActionsPanel>
          <Button
            disabled={disabled || readOnly}
            type="primary"
            onClick={this.attachToLinode}
            data-qa-submit
          >
            Save
          </Button>
          <Button onClick={this.handleClose} data-qa-cancel>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

interface StateProps {
  readOnly?: boolean;
}

const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => {
  const volumesPermissions = pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'volume'],
    state
  );
  const volumePermissions = volumesPermissions.find(
    (v: Linode.Grant) => v.id === ownProps.volumeId
  );

  return {
    readOnly:
      isRestrictedUser(state) &&
      volumePermissions &&
      volumePermissions.permissions === 'read_only'
  };
};

const connected = connect(mapStateToProps);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  styled,
  withVolumesRequests,
  connected
);

export default enhanced(VolumeAttachmentDrawer);
