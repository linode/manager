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

export interface Props {
  open: boolean;
  title: string;
  label: string;
  cloneLabel?: string;
  cloning?: boolean;
  size: number;
  region: string;
  linodeId: number;
  disabled?: {
    label?: boolean;
    size?: boolean;
    region?: boolean;
    linode?: boolean;
  };
  errors?: Linode.ApiFieldError[];

  onClose: () => void;
  onSubmit: () => void;
  onLabelChange?: (id: string) => void;
  onCloneLabelChange?: (id: string) => void;
  onSizeChange?: (id: string) => void;
  onRegionChange?: (id: string) => void;
  onLinodeChange?: (id: string) => void;
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
    cloneLabel,
    cloning,
    size,
    region,
    linodeId,
    onLabelChange,
    onCloneLabelChange,
    onSizeChange,
    onRegionChange,
    onLinodeChange,
    onClose,
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
      {cloning && <TextField
        label="Cloned Label"
        value={cloneLabel}
        {...(onCloneLabelChange && { onChange: e => onCloneLabelChange(e.target.value) })}
        error={Boolean(labelError)}
        errorText={labelError}
        />}

      <TextField
        label="Label"
        value={label}
        {...(onLabelChange && { onChange: e => onLabelChange(e.target.value) })}
        error={Boolean(labelError)}
        errorText={labelError}
        disabled={disabled && disabled.label}
        />

      <TextField
        label="Size"
        value={size}
        {...(onSizeChange && { onChange: e => onSizeChange(e.target.value) })}
        error={Boolean(sizeError)}
        errorText={sizeError}
        disabled={disabled && disabled.size}
        />

      {/** Needs to be Select */}
      <TextField
        label="Region"
        {...(onRegionChange && { onChange: e => onRegionChange(e.target.value) })}
        value={region && dcDisplayNames[region]}
        error={Boolean(regionError)}
        errorText={regionError}
        disabled={disabled && disabled.region}
        />

      {/** Needs to be Select */}
      <TextField
        label="Attached To"
        {...(onLinodeChange && { onChange: e => onLinodeChange(e.target.value) })}
        value={linodeId}
        error={Boolean(linodeError)}
        errorText={linodeError}
        disabled={disabled && disabled.linode}
      />

      <ActionsPanel>
        <Button
          onClick={onSubmit}
          variant="raised"
          color="primary"
        >
          Submit
        </Button>
        <Button
          onClick={onClose}
          variant="raised"
          color="secondary"
          className="cancel"
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(UpdateVolumeDrawer);
