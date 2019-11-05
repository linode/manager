import { Protocol } from 'linode-js-sdk/lib/nodebalancers';
import * as React from 'react';
import Select, {
  BaseSelectProps as Props
} from 'src/components/EnhancedSelect/Select';

import { protocolOptions } from '../react-select-utils';

type CombinedProps = Omit<Props, 'value'> & {
  value: Protocol;
};

const ProtocolField: React.FC<CombinedProps> = props => {
  return (
    <Select
      {...props}
      options={protocolOptions}
      value={
        protocolOptions.find(v => v.value === props.value) || protocolOptions[0]
      }
      label="Protocol"
      textFieldProps={{
        dataAttrs: {
          'data-qa-protocol-select': true
        }
      }}
      noMarginTop
      small
      isClearable={false}
    />
  );
};

export default React.memo(ProtocolField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
