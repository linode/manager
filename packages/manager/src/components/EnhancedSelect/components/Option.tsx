import * as React from 'react';
import { components, OptionProps } from 'react-select';

interface Props extends OptionProps<any> {
  value: number | string;
  attrs?: Record<string, string | boolean>;
}

const Option: React.FC<Props> = (props) => {
  return (
    <div data-qa-option={String(props.value)} {...props.attrs}>
      <components.Option {...props} />
    </div>
  );
};

export default Option;
