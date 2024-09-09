import { useTheme } from '@mui/material';
import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { themes } from 'src/utilities/theme';
import { WIDGET_FILTERS_COMMON_FONT_SIZE, WIDGET_FILTERS_COMMON_HEIGHT } from '../../Utils/constants';

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

    const theme = useTheme();

    return (
      <Autocomplete
        isOptionEqualToValue={(option, value) => {
          return option.label == value.label;
        }}
        onChange={(_: any, selectedAggregateFunc: any) => {
          props.onAggregateFuncChange(selectedAggregateFunc.label);
        }}
        textFieldProps={{
          InputProps: {
            sx: {
              height: WIDGET_FILTERS_COMMON_HEIGHT,
              input: {
                fontSize: WIDGET_FILTERS_COMMON_FONT_SIZE,
              },
              minHeight: WIDGET_FILTERS_COMMON_HEIGHT,
              svg: {
                color: theme.color.grey3,
              },
            },
          },
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
