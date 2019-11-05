import { Algorithm } from 'linode-js-sdk/lib/nodebalancers';
import * as React from 'react';
import Select, {
  BaseSelectProps as Props,
  Item
} from 'src/components/EnhancedSelect/Select';

import { algorithmOptions } from '../react-select-utils';

type CombinedProps = Omit<Props, 'value'> & {
  value: Algorithm;
};

const AlgorithmField: React.FC<CombinedProps> = props => {
  return (
    <Select
      {...props}
      options={algorithmOptions}
      label="Algorithm"
      value={
        algorithmOptions.find(
          (e: Item<Algorithm>) => e.value === props.value
        ) || algorithmOptions[0]
      }
      textFieldProps={{
        dataAttrs: {
          'data-qa-algorithm-select': true
        },
        helperText:
          "Roundrobin. Least connections assigns connections to the backend with the least connections. Source uses the client's IPv4 address"
      }}
      small
      isClearable={false}
      noMarginTop
    />
  );
};

export default React.memo(AlgorithmField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
