import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';

import TextField from 'src/components/TextField';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';
import { dcDisplayNames } from 'src/constants';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  title: string;
  label?: string;
  size?: number;
  region?: string;
  linodeId?: number;
  disabled?: {
    label?: boolean;
    size?: boolean;
    region?: boolean;
    linode?: boolean;
  };
  errors?: Linode.ApiFieldError[];

  onClose: () => void;
  onChange: (k: string, v: any) => void;
  onSubmit: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const thingy = {
  size: 'size',
};

const UpdateVolumeDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    open,
    title,
    errors,
    disabled,
    label,
    size,
    region,
    linodeId,

    onClose,
    onChange,
    onSubmit,
  } = props;

  const hasErrorFor = getAPIErrorFor(thingy, errors);
  const labelError = hasErrorFor('label');
  const sizeError = hasErrorFor('size');
  const regionError = hasErrorFor('region');
  const linodeError = hasErrorFor('linode_id');

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
    >
      <TextField
        label="Label"
        value={label}
        onChange={e => onChange('label', e.target.value)}
        error={Boolean(labelError)}
        errorText={labelError}
        disabled={disabled!.label}
      />
      <TextField
        label="Size"
        value={size}
        onChange={e => onChange('size', e.target.value)}
        error={Boolean(sizeError)}
        errorText={sizeError}
        disabled={disabled!.size}
        />

      {/** Needs to be Select */}
      <TextField
        label="Region"
        onChange={e => onChange('region', e.target.value)}
        value={dcDisplayNames[region!]}
        error={Boolean(regionError)}
        errorText={regionError}
        disabled={disabled!.region}
      />

      {/** Needs to be Select */}
      <TextField
        label="Attached To"
        onChange={e => onChange('linodeId', e.target.value)}
        value={linodeId}
        error={Boolean(linodeError)}
        errorText={linodeError}
        disabled={disabled!.linode}
      />

      <ActionsPanel>
        <Button onClick={onSubmit} variant="raised" color="primary">Submit</Button>
        <Button onClick={onClose}>Cancel</Button>
      </ActionsPanel>
    </Drawer>
  );
};

UpdateVolumeDrawer.defaultProps = {
  label: '',
  region: '',
  linodeId: 0,
  size: 20,
  disabled: {},
};

const styled = withStyles(styles, { withTheme: true });

export default styled(UpdateVolumeDrawer);
