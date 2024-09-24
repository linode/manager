import React from 'react';

import { StyledWidgetAutocomplete } from '../../Utils/CloudPulseWidgetUtils';

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
  onAggregateFuncChange: (aggregatevalue: string) => void;
}

export const CloudPulseAggregateFunction = React.memo(
  (props: AggregateFunctionProperties) => {
    const {
      availableAggregateFunctions,
      defaultAggregateFunction,
      onAggregateFuncChange,
    } = props;

    // Convert list of availableAggregateFunc into a proper response structure accepted by Autocomplete component
    const availableAggregateFunc = availableAggregateFunctions?.map(
      (aggrFunc) => {
        return {
          label: aggrFunc,
          value: aggrFunc,
        };
      }
    );
    const defaultValue =
      availableAggregateFunc.find(
        (obj) => obj.label === defaultAggregateFunction
      ) || availableAggregateFunctions[0];

    const [
      selectedAggregateFunction,
      setSelectedAggregateFunction,
    ] = React.useState(defaultValue);

    return (
      <StyledWidgetAutocomplete
        isOptionEqualToValue={(option, value) => {
          return option.label == value.label;
        }}
        onChange={(_: any, selectedAggregateFunc: any) => {
          setSelectedAggregateFunction(selectedAggregateFunc);
          onAggregateFuncChange(selectedAggregateFunc.label);
        }}
        textFieldProps={{
          hideLabel: true,
        }}
        disableClearable
        fullWidth={false}
        label="Select an Aggregate Function"
        noMarginTop={true}
        options={availableAggregateFunc}
        sx={{ width: '100%' }}
        value={selectedAggregateFunction}
      />
    );
  }
);
