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
import TextField from 'src/components/TextField';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  generalError?: string,
  linodes: string[][],
  linodeError?: string,
  selectedLinode?: string,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

type CombinedProps = Props & WithStyles<ClassNames>;
  
const LinodeSelect: React.StatelessComponent<CombinedProps> = (props) => {
    return(
        <FormControl fullWidth>
        <InputLabel
            htmlFor="linode"
            disableAnimation
            shrink={true}
            error={Boolean(props.linodeError)}
        >
        Linode
        </InputLabel>
        <TextField
            value={props.selectedLinode || 'none'}
            onChange={props.handleChange}
            inputProps={{ name: 'linode', id: 'linode' }}
            error={Boolean(props.linodeError)}
            select
        >
        <MenuItem value="none" disabled>Select a Linode</MenuItem>
        {
            props.linodes && props.linodes.map((l) => {
            return <MenuItem key={l[0]} value={l[0]}>{l[1]}</MenuItem>;
            })
        }
        </TextField>
        { Boolean(props.linodeError) && <FormHelperText error>{ props.linodeError }</FormHelperText> }
        { Boolean(props.generalError) && <FormHelperText error>{ props.generalError }</FormHelperText> }
    </FormControl>
    );
}

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeSelect);