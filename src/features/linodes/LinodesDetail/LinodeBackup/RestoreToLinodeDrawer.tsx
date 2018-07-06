import * as React from 'react';
import { path } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from 'src/components/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Notice from 'src/components/Notice';
import { getLinodes, restoreBackup } from 'src/services/linodes';
import Select from 'src/components/Select';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import CheckBox from 'src/components/CheckBox';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

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

  mounted: boolean = false;

  state: State = this.defaultState;

  reset() {
    if (!this.mounted) { return; }
    this.setState({ ...this.defaultState });
  }

  componentDidMount() {
    this.mounted = true;
    const { linodeRegion } = this.props;
    getLinodes({ page: 1 }, { region: linodeRegion })
      .then((response) => {
        if (!this.mounted) { return; }
        const linodeChoices = response.data.map((linode) => {
          return [`${linode.id}`, linode.label];
        });
        this.setState({ linodes: linodeChoices });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  restoreToLinode() {
    const { onSubmit, linodeID, backupID } = this.props;
    const { selectedLinode, overwrite } = this.state;
    if (!this.mounted) { return; }
    if (!selectedLinode || selectedLinode === 'none') {
      this.setState({
        errors: [
          ...(this.state.errors || []),
          { field: 'linode_id', reason: 'You must select a Linode' },
        ]
      }, () => {
        scrollErrorIntoView();
      });
      return;
    }
    restoreBackup(linodeID, Number(backupID), Number(selectedLinode), overwrite)
      .then(() => {
        this.reset();
        onSubmit();
      })
      .catch((errResponse) => {
        if (!this.mounted) { return; }
        this.setState({ errors: path(['response', 'data', 'errors'], errResponse) }, () => {
          scrollErrorIntoView();
        });
      });
  }

  handleSelectLinode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedLinode: e.target.value });
  }

  handleToggleOverwrite = () => {
    this.setState({ overwrite: !this.state.overwrite });
  }

  handleCloseDrawer = () => {
    this.reset();
    this.props.onClose();
  }

  errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  render() {
    const { open, backupCreated } = this.props;
    const { linodes, selectedLinode, overwrite, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);
    const linodeError = hasErrorFor('linode_id');
    const overwriteError = hasErrorFor('overwrite');
    const generalError = hasErrorFor('none');

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
            value={selectedLinode || ''}
            onChange={this.handleSelectLinode}
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
          {Boolean(linodeError) && <FormHelperText error>{linodeError}</FormHelperText>}
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
        {overwrite &&
          <Notice warning text="This will delete all disks and configs on this Linode" />
        }
        {Boolean(overwriteError) && <FormHelperText error>{overwriteError}</FormHelperText>}
        {Boolean(generalError) && <FormHelperText error>{generalError}</FormHelperText>}
        <ActionsPanel>
          <Button
            variant="raised"
            color="primary"
            onClick={this.restoreToLinode}
          >
            Restore
          </Button>
          <Button onClick={this.handleCloseDrawer}>Cancel</Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(RestoreToLinodeDrawer);
