import * as React from 'react';
import { OptionProps, components } from 'react-select';

interface Props extends OptionProps<any, any> {
  attrs?: Record<string, boolean | string>;
  value: number | string;
}
export const Option = (props: Props) => {
  return (
    <div data-qa-option={String(props.value)} {...props.attrs}>
      <components.Option {...props} />
    </div>
  );
};
