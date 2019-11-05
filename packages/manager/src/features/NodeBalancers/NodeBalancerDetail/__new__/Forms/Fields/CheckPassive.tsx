import * as React from 'react';

import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import Toggle, { ToggleProps } from 'src/components/Toggle';

type CombinedProps = ToggleProps;

const CheckBodyField: React.FC<CombinedProps> = props => {
  return (
    <React.Fragment>
      <FormControlLabel
        control={
          <Toggle {...props} data-qa-passive-checks-toggle={props.checked} />
        }
        label="Passive Checks"
      />
      <FormHelperText>
        Enable passive checks based on observing communication with back-end
        nodes.
      </FormHelperText>
    </React.Fragment>
  );
};

export default React.memo(CheckBodyField, (prevProps, newProps) => {
  return (
    prevProps.checked === newProps.checked &&
    prevProps.disabled === newProps.disabled
  );
});
