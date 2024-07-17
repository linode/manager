import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

export interface AggregateFunctionProperties {
  availableAggregateFunctions: Array<string>;
  defaultAggregateFunction?: string | undefined;
  onAggregateFuncChange: any;
}

export const CloudPulseAggregateFunction = React.memo(
  (props: AggregateFunctionProperties) => {
    // Convert list of available_aggregate_fun into a proper response structure accepted by Autocomplete component
    const available_aggregate_func = props.availableAggregateFunctions?.map(
      (aggregate_func) => {
        return {
          label: aggregate_func,
          value: aggregate_func,
        };
      }
    );

    let default_aggregate_func = available_aggregate_func.find(
      (obj) => obj.label === props.defaultAggregateFunction
    );
    let default_agg_unavailable = false;

    // if default aggregate func not available in available_aggregate_function
    if (!default_aggregate_func) {
      default_aggregate_func = available_aggregate_func[0];

      if (
        props.defaultAggregateFunction &&
        props.defaultAggregateFunction.length > 0
      ) {
        default_agg_unavailable = true;
      }
    }

    return (
      <>
        <Autocomplete
          isOptionEqualToValue={(option, value) => {
            return option.label == value.label;
          }}
          onChange={(_: any, selectedAggregateFunc: any) => {
            props.onAggregateFuncChange(selectedAggregateFunc.label);
          }}
          defaultValue={default_aggregate_func}
          disableClearable
          fullWidth={false}
          label=""
          noMarginTop={true}
          options={available_aggregate_func}
        />
        {default_agg_unavailable && (
          <p style={{ color: 'rgb(210 165 28)', fontSize: 'smaller' }}>
            Invalid agg function '{props.defaultAggregateFunction}'
          </p>
        )}
      </>
    );
  }
);
