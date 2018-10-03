import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import { path } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
import { resetEventsPolling } from 'src/events';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { getLinodeConfigs, getLinodes } from 'src/services/linodes';
import { attachVolume } from 'src/services/volumes';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  volumeID: number;
  volumeLabel: string;
  linodeRegion: string;
  onClose: () => void;
}

interface State {
  linodes: string[][];
  configs: string[][];
  selectedLinode?: string;
  selectedConfig?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class VolumeAttachmentDrawer extends React.Component<CombinedProps, State> {
  defaultState = {
    linodes: [],
    configs: [],
    selectedLinode: 'none',
    selectedConfig: 'none',
    errors: [],
  };

  state: State = this.defaultState;

  reset = () => {
    this.setState({ ...this.defaultState });
  }

  updateLinodes = (linodeRegion: string) => {
    /*
     * @todo: We're only getting page 1 here, what if the account has over 100
     * Linodes?
     */
    getLinodes({ page: 1 }, { region: linodeRegion })
      .then((response) => {
        const linodeChoices = response.data.map((linode) => {
          return [`${linode.id}`, linode.label];
        });
        this.setState({ linodes: linodeChoices });
      });
  }

  updateConfigs(linodeID: number) {
    getLinodeConfigs(linodeID)
      .then((response) => {
        const configChoices = response.data.map((config) => {
          return [`${config.id}`, config.label];
        });
        this.setState({ configs: configChoices });
        if (configChoices.length > 1) {
          this.setState({
            selectedConfig: configChoices[0][0],
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

  changeSelectedLinode = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ selectedLinode: e.target.value });
    if (e.target.value) { this.updateConfigs(+e.target.value); }
  }

  changeSelectedConfig = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedConfig: e.target.value });
  }

  handleClose = () => {
    this.reset();
    this.props.onClose();
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    if (nextProps.linodeRegion
        && (this.props.linodeRegion !== nextProps.linodeRegion)) {
      this.updateLinodes(nextProps.linodeRegion);
    }
    this.setState({ configs: [] });
  }

  attachToLinode = () => {
    const { volumeID, onClose } = this.props;
    const { selectedLinode } = this.state;
    if (!selectedLinode || selectedLinode === 'none') {
      this.setState({ errors: [
        ...(this.state.errors || []),
        { field: 'linode_id', reason: 'You must select a Linode' },
      ]}, () => {
        scrollErrorIntoView();
      });
      return;
    }

    attachVolume(Number(volumeID), { linode_id: Number(selectedLinode) })
      .then((response) => {
        resetEventsPolling();
        onClose();
      })
      .catch((error) => {
        this.setState({ errors: path(['response', 'data', 'errors'], error) }, () => {
          scrollErrorIntoView();
        });
      });
  }

  errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  render() {
    const { open, volumeLabel } = this.props;
    const { linodes, configs, selectedLinode, selectedConfig, errors } = this.state;

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

        <LinodeSelect
          linodes={linodes}
          selectedLinode={selectedLinode}
          handleChange={this.changeSelectedLinode}
          linodeError={linodeError}
          generalError={generalError}
        />

        {/* Config Selection */}
        {configs.length > 1 &&
          <FormControl fullWidth>
            <InputLabel
              htmlFor="config"
              disableAnimation
              shrink={true}
              error={Boolean(configError)}
            >
              Config
            </InputLabel>
            <Select
              value={selectedConfig || ''}
              onChange={this.changeSelectedConfig}
              inputProps={{ name: 'config', id: 'config' }}
              error={Boolean(configError)}
            >
              {
                configs && configs.map((el) => {
                  return <MenuItem key={el[0]} value={el[0]}>{el[1]}</MenuItem>;
                })
              }
            </Select>
            { Boolean(configError) && <FormHelperText error>{ configError }</FormHelperText> }
          </FormControl>
        }

        <ActionsPanel>
          <Button
            variant="raised"
            color="primary"
            onClick={this.attachToLinode}
          >
            Save
          </Button>
          <Button onClick={this.handleClose}>
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(VolumeAttachmentDrawer);
