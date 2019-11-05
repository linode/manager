import { Stickiness } from 'linode-js-sdk/lib/nodebalancers';
import * as React from 'react';
import Select, {
  BaseSelectProps as Props,
  Item
} from 'src/components/EnhancedSelect/Select';

import { stickinessOptions } from '../react-select-utils';

type CombinedProps = Omit<Props, 'value'> & {
  value: Stickiness;
};

const StickinessField: React.FC<CombinedProps> = props => {
  return (
    <Select
      {...props}
      options={stickinessOptions}
      label="Session Stickiness"
      value={
        stickinessOptions.find(
          (e: Item<Stickiness>) => e.value === props.value
        ) || stickinessOptions[0]
      }
      textFieldProps={{
        dataAttrs: {
          'data-qa-session-stickiness-select': true
        },
        helperText:
          'Route subsequent requests from the client to the same backend'
      }}
      small
      isClearable={false}
      noMarginTop
    />
  );
};

export default React.memo(StickinessField, (prevProps, newProps) => {
  return (
    prevProps.value === newProps.value &&
    prevProps.errorText === newProps.errorText &&
    prevProps.disabled === newProps.disabled
  );
});
