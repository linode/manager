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
        >
          Volume
          </InputLabel>
        <Select
          value={selectedVolume || ''}
          onChange={e => onChange('selectedVolume', e.target.value)}
          inputProps={{ name: 'volumes', id: 'volumes' }}
          error={Boolean(volumeError)}
        >
          <MenuItem value="" disabled><em>Select a Volume</em></MenuItem>
          {
            volumes && volumes.map((v: Linode.Volume) => {
              return <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>;
            })
          }
        </Select>
        { Boolean(volumeError) && <FormHelperText error>{ volumeError }</FormHelperText> }
      </FormControl>
      <ActionsPanel>
        <Button variant="raised" color="primary" onClick={() => onSubmit()}>Attach</Button>
        <Button onClick={onClose}> Cancel </Button>
      </ActionsPanel>
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(AttachVolumeDrawer);
