import * as React from 'react';
import {
  components as reactSelectComponents,
  MultiValueProps,
} from 'react-select';

const MultiValueLabel: React.FC<MultiValueProps<any>> = (props) => {
  return (
    <div data-qa-multi-option={props.children}>
      <reactSelectComponents.MultiValueLabel {...props} />
    </div>
  );
};

export default MultiValueLabel;
