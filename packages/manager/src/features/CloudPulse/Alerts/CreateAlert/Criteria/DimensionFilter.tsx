import { Box } from '@linode/ui';
import { Button, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { DimensionFilterField } from './DimensionFilterField';

import type { CreateAlertDefinitionForm, DimensionFilterForm } from '../types';
import type { Dimension } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface DimensionFilterProps {
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
  const { dimensionOptions, name } = props;
  const { control } = useFormContext<CreateAlertDefinitionForm>();

  const { append, fields, remove } = useFieldArray({
    control,
    name,
  });
  return (
    <Box sx={(theme) => ({ marginTop: theme.spacing(2) })}>
      <>
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Typography variant="h3">
            Dimension Filter
            <Typography component="span"> (optional)</Typography>
          </Typography>
        </Box>

        <Stack>
          {fields !== null &&
            fields.length !== 0 &&
            fields.map((field, index) => (
              <DimensionFilterField
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
          compactX={true}
          size="small"
          sx={(theme) => ({ marginTop: theme.spacing(1) })}
        >
          Add dimension filter
        </Button>
      </>
    </Box>
  );
};
