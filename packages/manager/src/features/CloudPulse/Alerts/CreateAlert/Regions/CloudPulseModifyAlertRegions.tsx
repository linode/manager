import { Box, Typography } from '@linode/ui';
import React from 'react';
import {
  Controller,
  type FieldPathByValue,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { AlertRegions } from '../../AlertRegions/AlertRegions';
import { getAlertBoxStyles } from '../../Utils/utils';

import type { CreateAlertDefinitionForm } from '../types';

interface CloudPulseModifyAlertRegionsProp {
  name: FieldPathByValue<CreateAlertDefinitionForm, string[] | undefined>;
}

export const CloudPulseModifyAlertRegions = React.memo(
  (props: CloudPulseModifyAlertRegionsProp) => {
    const { name } = props;
    const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();
    const serviceTypeWatcher = useWatch({ control, name: 'serviceType' });

    const handleRegionsChange = (regionIds: string[]) => {
      setValue(name, regionIds, {
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
              2. Regions
            </Typography>
            <Box
              sx={(theme) => ({
                ...getAlertBoxStyles(theme),
                overflow: 'auto',
              })}
            >
              <AlertRegions
                handleChange={handleRegionsChange}
                serviceType={serviceTypeWatcher}
              />
            </Box>
          </Box>
        )}
      />
    );
  }
);
