import { compose } from 'ramda';
import * as React from 'react';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
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
  linodes: string[][];
  linodeError?: string;
  selectedLinode?: string;
  disabled?: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeSelect: React.StatelessComponent<CombinedProps> = props => {
  return (
    <FormControl fullWidth>
      <InputLabel
        htmlFor="linode"
        disableAnimation
        shrink={true}
        error={Boolean(props.linodeError)}
        disabled={props.disabled}
      >
        Linode
      </InputLabel>
      <TextField
        value={props.selectedLinode || 'none'}
        onChange={props.handleChange}
        inputProps={{ name: 'linode', id: 'linode' }}
        error={Boolean(props.linodeError)}
        select
        data-qa-linode-select
        disabled={props.disabled}
      >
        <MenuItem value="none" disabled>
          Select a Linode
        </MenuItem>
        {props.linodes &&
          props.linodes.map(l => {
            return (
              <MenuItem key={l[0]} value={l[0]} data-qa-linode-menu-item={l[1]}>
                {l[1]}
              </MenuItem>
            );
          })}
      </TextField>
      {Boolean(props.linodeError) && (
        <FormHelperText error>{props.linodeError}</FormHelperText>
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
)(LinodeSelect);
