import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from 'src/components/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import Button from 'src/components/Button';
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
  linodeLabel: string;
  errors?: Linode.ApiFieldError[];
  volumes: Linode.Volume[];
  selectedVolume: null | number;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (k: string, v: any) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  volume: 'Volume',
};

const AttachVolumeDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    open,
    linodeLabel,
    volumes,
    selectedVolume,
    errors,
    onClose,
    onSubmit,
    onChange,
  } = props;

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);
  const volumeError = hasErrorFor('volume');

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Attach Volume to ${linodeLabel}`}
    >
      <FormControl fullWidth>
        <InputLabel
          htmlFor="volumes"
          disableAnimation
          shrink={true}
          error={Boolean(volumeError)}
          data-qa-label-field
        >
          Volume
          </InputLabel>
        <Select
          value={selectedVolume || ''}
          onChange={e => onChange('selectedVolume', e.target.value)}
          inputProps={{ name: 'volumes', id: 'volumes' }}
          error={Boolean(volumeError)}
          data-qa-volume-select
        >
          <MenuItem value="" disabled><em>Select a Volume</em></MenuItem>
          {
            volumes && volumes.map((v: Linode.Volume) => {
              return <MenuItem
                key={v.id}
                value={v.id}
                data-qa-volume-option
              >
                {v.label}
              </MenuItem>;
            })
          }
        </Select>
        { Boolean(volumeError) && <FormHelperText error>{ volumeError }</FormHelperText> }
      </FormControl>
      <ActionsPanel>
        <Button
          type="primary"
          onClick={() => onSubmit()}
          data-qa-confirm-attach
        >
          Attach
        </Button>
        <Button
          onClick={onClose}
          data-qa-cancel
          type="cancel"
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(AttachVolumeDrawer);
