import { styled } from '@mui/material';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

export interface AggregateFunctionProperties {
  /**
   * List of aggregate functions available to display
   */
  availableAggregateFunctions: string[];

  /**
   * Default aggregate function to be selected
   */
  defaultAggregateFunction?: string | undefined;

  /**
   * Function to be triggered on aggregate function changed from dropdown
   */
  onAggregateFuncChange: any;
}

export const CloudPulseAggregateFunction = React.memo(
  (props: AggregateFunctionProperties) => {
    // Convert list of availableAggregateFunc into a proper response structure accepted by Autocomplete component
    const availableAggregateFunc = props.availableAggregateFunctions?.map(
      (aggrFunc) => {
        return {
          label: aggrFunc,
          value: aggrFunc,
        };
      }
    );

    const defaultAggregateFunc =
      availableAggregateFunc.find(
        (obj) => obj.label === props.defaultAggregateFunction
      ) || props.availableAggregateFunctions[0];

    return (
      <StyledAutocomplete
        isOptionEqualToValue={(option, value) => {
          return option.label == value.label;
        }}
        onChange={(_: any, selectedAggregateFunc: any) => {
          props.onAggregateFuncChange(selectedAggregateFunc.label);
        }}
        textFieldProps={{
          hideLabel: true,
        }}
        defaultValue={defaultAggregateFunc}
        disableClearable
        fullWidth={false}
        label="Select an Aggregate Function"
        noMarginTop={true}
        options={availableAggregateFunc}
        sx={{ width: '100%' }}
      />
    );
  }
);

const StyledAutocomplete = styled(Autocomplete, {
  label: 'StyledAutocomplete',
})(() => ({
  '&& .MuiInput-input': {
    padding: '1px',
  },
  '&& .MuiInput-root': {
    height: '22px',
    minHeight: '22px',
    width: '90px',
  },
}));
