import * as React from 'react';
import { OptionProps } from 'react-select';
import MenuItem from 'src/components/core/MenuItem';

interface Props extends OptionProps<any> {
  value: number | string;
  attrs?: Record<string, string | boolean>;
}

const Option: React.StatelessComponent<Props> = props => {
  return (
    <MenuItem
      data-qa-option={String(props.value)}
      key={props.value}
      value={props.value}
      {...props.attrs}
      role="option"
    >
      {props.children}
    </MenuItem>
  );
};

export default Option;
