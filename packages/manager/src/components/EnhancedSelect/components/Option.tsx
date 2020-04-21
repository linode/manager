import * as React from 'react';
import { components } from 'react-select';
import { OptionProps } from 'react-select/src/components/Option';

interface Props extends OptionProps<any> {
  value: number | string;
  attrs?: Record<string, string | boolean>;
}

const Option: React.StatelessComponent<Props> = props => {
  return (
    <div data-qa-option={String(props.value)} {...props.attrs}>
      <components.Option {...props} />
    </div>
  );
};

export { OptionProps };

export default Option;
