import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueProps } from 'react-select';

interface Props extends MultiValueProps<any> {}

type CombinedProps = Props;

const MultiValueLabel: React.StatelessComponent<CombinedProps> = props => {
  return (
    <div data-qa-multi-option={props.children}>
      <reactSelectComponents.MultiValueLabel {...props} />
    </div>
  );
};

export default MultiValueLabel;
