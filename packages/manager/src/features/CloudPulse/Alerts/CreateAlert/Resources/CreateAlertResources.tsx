import { Box, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { AlertResources } from '../../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../../Utils/utils';

import type { CreateAlertDefinitionForm } from '../types';
import type { FieldPathByValue } from 'react-hook-form';

export interface CreateAlertResourcesProp {
  /**
   * name used for the component in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, string[]>;
}

export const CreateAlertResources = React.memo(
  (props: CreateAlertResourcesProp) => {
    const { name } = props;

    const theme = useTheme();
    const {
      control,
      formState,
      setValue,
    } = useFormContext<CreateAlertDefinitionForm>();
    const serviceTypeWatcher = useWatch({ control, name: 'serviceType' });

    const handleResourcesSelection = (resourceIds: string[]) => {
      setValue('entity_ids', resourceIds, {
        shouldTouch: true,
        shouldValidate: true,
      });
    };

    React.useEffect(() => {
      if (!serviceTypeWatcher) {
        setValue('entity_ids', [], { shouldValidate: true });
      }
    }, [serviceTypeWatcher, setValue]);

    return (
      <Controller
        render={({ field, fieldState }) => (
          <Box mt={3}>
            <Box
              alignItems="center"
              display="flex"
              gap={2}
              sx={{ marginBottom: 1 }}
            >
              <Typography variant="h2">2. Resources</Typography>
            </Box>
            <Box sx={{ ...getAlertBoxStyles(theme), overflow: 'auto' }}>
              <AlertResources
                noSelectionErrorText={
                  (formState.isSubmitted || fieldState.isTouched) &&
                  fieldState.error
                    ? fieldState.error.message
                    : undefined
                }
                alertResourceIds={field.value}
                handleResourcesSelection={handleResourcesSelection}
                hideLabel
                isSelectionsNeeded
                serviceType={serviceTypeWatcher || undefined}
              />
            </Box>
          </Box>
        )}
        control={control}
        name={name}
      />
    );
  }
);
