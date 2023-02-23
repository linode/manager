import * as React from 'react';
import { components as reactSelectComponents } from 'react-select';
import { MultiValueProps } from 'react-select';

const MultiValueLabel: React.FC<React.PropsWithChildren<MultiValueProps<any>>> = (props) => {
  return (
    <div data-qa-multi-option={props.children}>
      <reactSelectComponents.MultiValueLabel {...props} />
    </div>
  );
};

export default MultiValueLabel;
