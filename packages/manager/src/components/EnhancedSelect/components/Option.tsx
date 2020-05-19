import * as React from 'react';
import { components, OptionProps } from 'react-select';
import MenuItem from 'src/components/core/MenuItem';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    padding: 0
  }
}));

interface Props extends OptionProps<any> {
  value: number | string;
  attrs?: Record<string, string | boolean>;
  selected: boolean;
}

const Option: React.StatelessComponent<Props> = props => {
  const classes = useStyles();
  return (
    <MenuItem
      data-qa-option={String(props.value)}
      key={props.value}
      {...props.attrs}
      value={props.value}
      selected={props.selected}
      role="option"
      className={classes.menuItem}
    >
      <components.Option {...props} />
    </MenuItem>
  );
};

export default Option;
