import { Box, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { AlertResources } from '../../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../../Utils/utils';

import type { CreateAlertDefinitionForm } from '../types';
import type { FieldPathByValue } from 'react-hook-form';

export interface CloudPulseModifyAlertResourcesProp {
  /**
   * Name used for the component in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, string[]>;
}

export const CloudPulseModifyAlertResources = React.memo(
  (props: CloudPulseModifyAlertResourcesProp) => {
    const { name } = props;
    const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();
    const serviceTypeWatcher = useWatch({ control, name: 'serviceType' });

    const handleResourcesSelection = (resourceIds: string[]) => {
      setValue(name, resourceIds, {
        shouldTouch: true,
        shouldValidate: true,
      });
    };

    const titleRef = React.useRef<HTMLDivElement>(null);

    return (
      <Controller
        render={({ field }) => (
          <Box display="flex" flexDirection="column" gap={3} paddingTop={3}>
            <Typography ref={titleRef} variant="h2">
              2. Resources
            </Typography>
            <Box
              sx={(theme) => ({
                ...getAlertBoxStyles(theme),
                overflow: 'auto',
              })}
            >
              <AlertResources
                alertResourceIds={field.value}
                alertType="user"
                handleResourcesSelection={handleResourcesSelection}
                hideLabel
                isSelectionsNeeded
                scrollElement={titleRef.current}
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
