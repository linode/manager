import * as React from 'react';
import _Option, { OptionProps } from 'react-select/lib/components/Option';

interface Props extends OptionProps<any> {
  value: number;
}

const Option: React.StatelessComponent<Props> = props => {
  return (
    <div data-qa-option={String(props.value)}>
      <_Option {...props} />
    </div>
  );
};

export default Option;
