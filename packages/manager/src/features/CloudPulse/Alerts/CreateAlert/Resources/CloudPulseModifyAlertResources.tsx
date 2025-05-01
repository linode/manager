import { Box, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { useFlags } from 'src/hooks/useFlags';

import { AlertResources } from '../../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../../Utils/utils';

import type { CreateAlertDefinitionForm } from '../types';

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

    const flags = useFlags();

    const maxSelectionCount = React.useMemo(() => {
      if (!serviceTypeWatcher || !flags.aclpAlertServiceTypeConfig) {
        return undefined;
      }

      return flags.aclpAlertServiceTypeConfig?.find(
        (config) =>
          config.serviceType && config.serviceType === serviceTypeWatcher
      )?.maxResourceSelectionCount;
    }, [flags.aclpAlertServiceTypeConfig, serviceTypeWatcher]);

    const handleResourcesSelection = (resourceIds: string[]) => {
      setValue(name, resourceIds, {
        shouldTouch: true,
        shouldValidate: true,
      });
    };

    const titleRef = React.useRef<HTMLDivElement>(null);

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Box display="flex" flexDirection="column" gap={3} paddingTop={3}>
            <Typography ref={titleRef} variant="h2">
              2. Entities
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
                errorText={fieldState.error?.message}
                handleResourcesSelection={handleResourcesSelection}
                hideLabel
                isSelectionsNeeded
                maxSelectionCount={maxSelectionCount}
                scrollElement={titleRef.current}
                serviceType={serviceTypeWatcher || undefined}
              />
            </Box>
          </Box>
        )}
      />
    );
  }
);
