import * as React from 'react';
import { path } from 'ramda';

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

import { resetEventsPolling } from 'src/events';
import { getLinodes } from 'src/services/linodes';
import { attach } from 'src/services/volumes';
import Select from 'src/components/Select';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
  selectedLinode?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class VolumeAttachmentDrawer extends React.Component<CombinedProps, State> {
  defaultState = {
    linodes: [],
    selectedLinode: 'none',
    errors: [],
  };

  state: State = this.defaultState;

  reset() {
    this.setState({ ...this.defaultState });
  }

  updateLinodes(linodeRegion: string) {
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

  componentWillReceiveProps(nextProps: CombinedProps) {
    if (nextProps.linodeRegion
        && (this.props.linodeRegion !== nextProps.linodeRegion)) {
      this.updateLinodes(nextProps.linodeRegion);
    }
  }

  attachToLinode() {
    const { volumeID, onClose } = this.props;
    const { selectedLinode } = this.state;
    if (!selectedLinode || selectedLinode === 'none') {
      this.setState({ errors: [
        ...(this.state.errors || []),
        { field: 'linode_id', reason: 'You must select a Linode' },
      ]});
      return;
    }

    attach(Number(volumeID), { linode_id: Number(selectedLinode) })
      .then((response) => {
        resetEventsPolling();
        onClose();
      })
      .catch((error) => {
        this.setState({ errors: path(['response', 'data', 'errors'], error) });
      });
  }

  errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  render() {
    const { open, onClose, volumeLabel } = this.props;
    const { linodes, selectedLinode, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);
    const linodeError = hasErrorFor('linode_id');
    const generalError = hasErrorFor('none');

    return (
      <Drawer
        open={open}
        onClose={() => { this.reset(); onClose(); }}
        title={`Attach Volume ${volumeLabel}`}
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
            value={selectedLinode || ''}
            onChange={e => this.setState({ selectedLinode: e.target.value })}
            inputProps={{ name: 'linode', id: 'linode' }}
            error={Boolean(linodeError)}
          >
            <MenuItem value="none" disabled>Select a Linode</MenuItem>
            {
              linodes && linodes.map((l) => {
                return <MenuItem key={l[0]} value={l[0]}>{l[1]}</MenuItem>;
              })
            }
          </Select>
          { Boolean(linodeError) && <FormHelperText error>{ linodeError }</FormHelperText> }
          { Boolean(generalError) && <FormHelperText error>{ generalError }</FormHelperText> }
        </FormControl>
        <ActionsPanel>
          <Button
            variant="raised"
            color="primary"
            onClick={() => this.attachToLinode()}
          >
            Save
          </Button>
          <Button onClick={() => { this.reset(); onClose(); }}>Cancel</Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(VolumeAttachmentDrawer);
