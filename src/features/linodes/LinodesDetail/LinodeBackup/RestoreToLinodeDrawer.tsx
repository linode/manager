import * as React from 'react';

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

import { getLinodesPage } from 'src/services/linode';
import Select from 'src/components/Select';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import CheckBox from 'src/components/CheckBox';
import { FormControlLabel } from 'material-ui/Form';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  backupCreated: string;
  onClose: () => void;
  onSubmit: () => void;
}

interface State {
  linodes: [string, string][];
  overwrite: boolean;
  selectedLinode?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class RestoreToLinodeDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    linodes: [],
    overwrite: false,
    selectedLinode: '',
  };

  onComponentDidMount() {
    getLinodesPage(1)
      .then((response) => {
        response.data.map((linode) => {
          return [`${linode.id}`, linode.label];
        });
      });
  }

  errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  render() {
    const { open, backupCreated, onClose, onSubmit } = this.props;
    const { linodes, selectedLinode, overwrite, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);
    const linodeError = hasErrorFor('linode_id');
    const overwriteError = hasErrorFor('overwrite');

    return (
      <Drawer
        open={open}
        onClose={onClose}
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
            <MenuItem value="" disabled>Select a Linode</MenuItem>
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
        { Boolean(overwriteError) && <FormHelperText error>{ overwriteError }</FormHelperText> }
        <ActionsPanel>
          <Button variant="raised" color="primary" onClick={() => onSubmit()}>Restore</Button>
          <Button onClick={onClose}>Cancel</Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(RestoreToLinodeDrawer);
