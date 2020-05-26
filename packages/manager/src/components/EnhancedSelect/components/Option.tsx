import * as React from 'react';
import { components, OptionProps } from 'react-select';
import MenuItem from 'src/components/core/MenuItem';

interface Props extends OptionProps<any> {
  value: number | string;
  attrs?: Record<string, string | boolean>;
}

const Option: React.FC<Props> = props => {
  return (
    <MenuItem
      data-qa-option={String(props.value)}
      key={props.value}
      {...props.attrs}
      value={props.value}
      role="option"
      dense
      disableGutters
      selected={props.isSelected}
      disabled={props.isDisabled}
      // Adding this causes console errors, but is the only way to get the menu to scroll and follow focused item.
      {...props}
    >
      <components.Option {...props} />
    </MenuItem>
  );
};

export default Option;
