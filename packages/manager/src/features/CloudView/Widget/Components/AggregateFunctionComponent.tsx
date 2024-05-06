import React from 'react';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

export interface AggregateFunctionProperties {
  available_aggregate_func: Array<string>;
  default_aggregate_func: string;
  onAggregateFuncChange: any;
}

export const AggregateFunctionComponent = (
  props: AggregateFunctionProperties
) => {
  let default_aggregate_func = props.default_aggregate_func;
  let default_agg_unavailable = false;

  //if default aggregate func not available in available_aggregate_function
  if (
    default_aggregate_func &&
    props.available_aggregate_func.indexOf(default_aggregate_func) < 0
  ) {
    default_agg_unavailable = true;
    if (props.available_aggregate_func.length > 0) {
      default_aggregate_func = props.available_aggregate_func[0];
    } else {
      default_aggregate_func = '';
    }
  }

  //Convert list of available_aggregate_fun into a proper response structure accepted by Autocomplete component
  const available_aggregate_func = props.available_aggregate_func.map(
    (aggregate_func) => {
      return {
        label: aggregate_func,
        value: aggregate_func,
      };
    }
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Autocomplete
        onChange={(_: any, selectedAggregateFunc: any) => {
          props.onAggregateFuncChange(selectedAggregateFunc.label);
        }}
        defaultValue={default_aggregate_func}
        disableClearable
        fullWidth={false}
        label=""
        isOptionEqualToValue={(option, value) => {
          if (value.label) {
            return option.label === value.label;
          }
          return option.label === value;
        }}
        noMarginTop={true}
        options={available_aggregate_func}
      />
      {default_agg_unavailable && (
        <p style={{ color: 'rgb(210 165 28)', fontSize: 'smaller' }}>
          Invalid agg function '{props.default_aggregate_func}'
        </p>
      )}
    </div>
  );
};
