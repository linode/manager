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
import { FormControlLabel } from 'material-ui/Form';

import Notice from 'src/components/Notice';
import { getLinodes, restoreBackup } from 'src/services/linodes';
import Select from 'src/components/Select';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import CheckBox from 'src/components/CheckBox';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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

type CombinedProps = Props & WithStyles<ClassNames>;

class RestoreToLinodeDrawer extends React.Component<CombinedProps, State> {
  defaultState = {
    linodes: [],
    overwrite: false,
    selectedLinode: 'none',
    errors: [],
  };

  state: State = this.defaultState;

  reset() {
    this.setState({ ...this.defaultState });
  }

  componentDidMount() {
    const { linodeRegion } = this.props;
    getLinodes({ page: 1 }, { region: linodeRegion })
      .then((response) => {
        const linodeChoices = response.data.map((linode) => {
          return [`${linode.id}`, linode.label];
        });
        this.setState({ linodes: linodeChoices });
      });
  }

  restoreToLinode() {
    const { onSubmit, linodeID, backupID } = this.props;
    const { selectedLinode, overwrite } = this.state;
    if (!selectedLinode || selectedLinode === 'none') {
      this.setState({ errors: [
        ...(this.state.errors || []),
        { field: 'linode_id', reason: 'You must select a Linode' },
      ]});
      return;
    }
    restoreBackup(linodeID, Number(backupID), Number(selectedLinode), overwrite)
      .then(() => {
        this.reset();
        onSubmit();
      })
      .catch((errResponse) => {
        this.setState({ errors: path(['response', 'data', 'errors'], errResponse) });
      });
  }

  errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  render() {
    const { open, backupCreated, onClose } = this.props;
    const { linodes, selectedLinode, overwrite, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);
    const linodeError = hasErrorFor('linode_id');
    const overwriteError = hasErrorFor('overwrite');
    const generalError = hasErrorFor('none');

    return (
      <Drawer
        open={open}
        onClose={() => { this.reset(); onClose(); }}
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
        </FormControl>
        <FormControlLabel
          control={
            <CheckBox
              checked={overwrite}
              onChange={e => this.setState({ overwrite: !overwrite })}
            />
          }
          label="Overwrite Linode"
        />
        {overwrite &&
          <Notice warning text="This will delete all disks and configs on this Linode"/>
        }
        { Boolean(overwriteError) && <FormHelperText error>{ overwriteError }</FormHelperText> }
        { Boolean(generalError) && <FormHelperText error>{ generalError }</FormHelperText> }
        <ActionsPanel>
          <Button
            variant="raised"
            color="primary"
            onClick={() => this.restoreToLinode()}
          >
            Restore
          </Button>
          <Button onClick={() => { this.reset(); onClose(); }}>Cancel</Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(RestoreToLinodeDrawer);
