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
              {(formState.isSubmitted || fieldState.isTouched) &&
                fieldState.error && (
                  <Typography
                    color={theme.tokens.content.Text.Negative}
                    variant="body2"
                  >
                    ({fieldState.error.message})
                  </Typography>
                )}
            </Box>
            <Box sx={{ ...getAlertBoxStyles(theme), overflow: 'auto' }}>
              <AlertResources
                handleResourcesSelection={handleResourcesSelection}
                isSelectionsNeeded
                resourceIds={field.value}
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
