import { compose } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import MenuItem from 'src/components/MenuItem';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  generalError?: string;
  diskError?: string;
  disks: Linode.Disk[];
  selectedDisk?: string;
  disabled?: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DiskSelect: React.StatelessComponent<CombinedProps> = props => {
  return (
    <FormControl fullWidth>
      <TextField
        value={props.selectedDisk || 'none'}
        onChange={props.handleChange}
        inputProps={{ name: 'linode', id: 'linode' }}
        error={Boolean(props.diskError)}
        disabled={props.disabled}
        select
        data-qa-disk-select
        label="Disk"
      >
        <MenuItem value="none" disabled>
          Select a Disk
        </MenuItem>
        {props.disks &&
          props.disks.map(disk => {
            return (
              <MenuItem
                key={disk.id}
                value={'' + disk.id}
                data-qa-disk-menu-item={disk.label}
              >
                {disk.label}
              </MenuItem>
            );
          })}
      </TextField>
      {Boolean(props.diskError) && (
        <FormHelperText error>{props.diskError}</FormHelperText>
      )}
      {Boolean(props.generalError) && (
        <FormHelperText error>{props.generalError}</FormHelperText>
      )}
    </FormControl>
  );
};

const styled = withStyles(styles);

export default compose<any, any, any>(
  styled,
  RenderGuard
)(DiskSelect);
