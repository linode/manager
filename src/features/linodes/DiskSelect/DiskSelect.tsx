import { compose } from 'ramda';
import * as React from 'react';

import {
    StyleRulesCallback,
    
    WithStyles,
    withStyles,
  } from '@material-ui/core/styles';  

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from 'src/components/MenuItem';
import RenderGuard from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  generalError?: string,
  diskError?: string,
  disks: Linode.Disk[],
  selectedDisk?: string,
  disabled?: boolean,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DiskSelect: React.StatelessComponent<CombinedProps> = (props) => {
  return(
    <FormControl fullWidth>
      <InputLabel
        htmlFor="disk"
        disableAnimation
        shrink={true}
        error={Boolean(props.diskError)}
      >
        Disk
      </InputLabel>
      <TextField
        value={props.selectedDisk || 'none'}
        onChange={props.handleChange}
        inputProps={{ name: 'linode', id: 'linode' }}
        error={Boolean(props.diskError)}
        disabled={props.disabled}
        select
        data-qa-disk-select
      >
        <MenuItem value="none" disabled>Select a Disk</MenuItem>
        {
          props.disks && props.disks.map((disk) => {
            return (
              <MenuItem
                key={disk.id}
                value={'' + disk.id}
                data-qa-disk-menu-item={disk.label}
              >
                {disk.label}
              </MenuItem>
            );
          })
        }
      </TextField>
      { Boolean(props.diskError) && <FormHelperText error>{ props.diskError }</FormHelperText> }
      { Boolean(props.generalError) && <FormHelperText error>{ props.generalError }</FormHelperText> }
    </FormControl>
    );
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  styled,
  RenderGuard
  )(DiskSelect);
