import * as React from 'react';

import {
    StyleRulesCallback,
    Theme,
    WithStyles,
    withStyles,
  } from '@material-ui/core/styles';  

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from 'src/components/MenuItem';

import Select from 'src/components/Select';



  type ClassNames = 'root';
  
  const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
    root: {},
  });

  
  interface Props {
    generalError?: string,
    diskError?: string,
    disks: Linode.Disk[],
    selectedDisk?: string,
    handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
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
        <Select
        value={props.selectedDisk || ''}
        onChange={props.handleChange}
        inputProps={{ name: 'linode', id: 'linode' }}
        error={Boolean(props.diskError)}
        >
        <MenuItem value="none" disabled>Select a Disk</MenuItem>
        {
            props.disks && props.disks.map((disk) => {
            return <MenuItem key={disk.id} value={disk.id}>{disk.label}</MenuItem>;
            })
        }
        </Select>
        { Boolean(props.diskError) && <FormHelperText error>{ props.diskError }</FormHelperText> }
        { Boolean(props.generalError) && <FormHelperText error>{ props.generalError }</FormHelperText> }
    </FormControl>
    );
}

const styled = withStyles(styles, { withTheme: true });

export default styled(DiskSelect);