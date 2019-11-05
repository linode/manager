import { Check, Protocol } from 'linode-js-sdk/lib/nodebalancers';
import * as React from 'react';
import Select, {
  BaseSelectProps as Props,
  Item
} from 'src/components/EnhancedSelect/Select';

import { checkOptions } from '../react-select-utils';

type CombinedProps = Omit<Props, 'value'> & {
  protocol: Protocol;
  value: Check;
};

const CheckField: React.FC<CombinedProps> = props => {
  const _checkOptions = checkOptions(props.protocol);
  return (
    <Select
      {...props}
      options={_checkOptions}
      value={
        _checkOptions.find((e: Item<Check>) => e.value === props.value) ||
        _checkOptions[0]
      }
      label="Type"
      textFieldProps={{
        dataAttrs: {
          'data-qa-active-check-select': true
        },
        helperText: generateCheckHelperText(props.protocol)
      }}
      small
      isClearable={false}
      noMarginTop
    />
  );
};

export default React.memo(CheckField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled &&
    prevProps.protocol === newProps.protocol
  );
});

const generateCheckHelperText = (protocol: Protocol) => {
  let baseText =
    'Active health checks proactively check the health of back-end nodes.';

  if (protocol === 'https' || protocol === 'http') {
    return (baseText +=
      " HTTP Valid Status' requires a 2xx or 3xx response from the backend node. 'HTTP Body Regex' uses a regex to match against an expected result body.");
  } else {
    return (baseText +=
      " TCP Connection' requires a successful TCP handshake.");
  }
};
