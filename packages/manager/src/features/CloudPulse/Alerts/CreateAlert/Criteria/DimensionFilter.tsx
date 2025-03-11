import { Box } from '@linode/ui';
import { Button, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { DimensionFilterField } from './DimensionFilterField';

import type { CreateAlertDefinitionForm, DimensionFilterForm } from '../types';
import type { Dimension } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface DimensionFilterProps {
  /**
   * boolean value to disable the Data Field in dimension filter
   */
  dataFieldDisabled: boolean;
  /**
   * dimension filter data for the selected metric
   */
  dimensionOptions: Dimension[];
  /**
   * name used for the component to set in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, DimensionFilterForm[]>;
}
export const DimensionFilters = (props: DimensionFilterProps) => {
  const { dataFieldDisabled, dimensionOptions, name } = props;
  const { control } = useFormContext<CreateAlertDefinitionForm>();

  const { append, fields, remove } = useFieldArray({
    control,
    name,
  });

  const dimensionFilterWatcher = useWatch({ control, name });

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Typography variant="h3">
        Dimension Filter
        <Typography component="span"> (optional)</Typography>
      </Typography>

      <Stack gap={1}>
        {fields?.length > 0 &&
          fields.map((field, index) => (
            <DimensionFilterField
              dataFieldDisabled={dataFieldDisabled}
              dimensionOptions={dimensionOptions}
              key={field.id}
              name={`${name}.${index}`}
              onFilterDelete={() => remove(index)}
            />
          ))}
      </Stack>
      <Button
        onClick={() =>
          append({
            dimension_label: null,
            operator: null,
            value: null,
          })
        }
        buttonType="secondary"
        compactX
        data-qa-buttons="true"
        disabled={dimensionFilterWatcher && dimensionFilterWatcher.length === 5}
        size="small"
        sx={{ justifyContent: 'start', width: '150px' }}
        sxEndIcon={{ display: 'none' }}
        tooltipText="You can add up to 5 dimension filters."
      >
        Add dimension filter
      </Button>
    </Box>
  );
};
