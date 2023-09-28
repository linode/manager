import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { FormLabel } from 'src/components/FormLabel';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { capitalize } from 'src/utilities/capitalize';

import type { MigrationTypes } from '@linode/api-v4/lib/linodes';
import type { ResizeLinodePayload } from '@linode/api-v4/lib/linodes/types';
import type { FormikProps } from 'formik';

interface Props {
  formik: FormikProps<ResizeLinodePayload>;
  isLinodeOffline: boolean;
  migrationTypeOptions: { [key in MigrationTypes]: key };
}

export const UnifiedMigrationPanel = (props: Props) => {
  const { formik, isLinodeOffline, migrationTypeOptions } = props;
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.bg.offWhite,
        marginBottom: '8px',
        padding: '16px 22px 0 22px',
      }}
    >
      <Typography variant="h2">Choose Your Resize Type</Typography>
      <Box
        sx={{
          marginTop: 1,
        }}
        component="p"
      >
        During a <strong>warm resize</strong>, your Compute Instance will remain
        up and running for the duration of the process and will be rebooted to
        complete the resize. In some cases, you will need to reboot the instance
        manually (you will receive a notification to do so if necessary). During
        a <strong>cold resize</strong>, your Compute Instance will be shut down,
        migrated to a new host machine, and restored to its previous state
        (booted or powered off) once the resize is complete.
      </Box>
      <FormControl sx={{ marginTop: 0 }}>
        <FormLabel id="resize-migration-types" sx={{ marginBottom: 0 }}>
          Migration Types
        </FormLabel>
        <RadioGroup
          aria-labelledby="resize-migration-types"
          onChange={(e, value) => formik.setFieldValue('migration_type', value)}
          row
          value={formik.values.migration_type}
        >
          <FormControlLabel
            control={<Radio />}
            data-qa-radio={migrationTypeOptions.warm}
            disabled={isLinodeOffline}
            key={migrationTypeOptions.warm}
            label={`${capitalize(migrationTypeOptions.warm)} resize`}
            value={migrationTypeOptions.warm}
          />
          <FormControlLabel
            control={<Radio />}
            data-qa-radio={migrationTypeOptions.cold}
            disabled={isLinodeOffline}
            key={migrationTypeOptions.cold}
            label={`${capitalize(migrationTypeOptions.cold)} resize`}
            value={migrationTypeOptions.cold}
          />
          {isLinodeOffline && (
            <TooltipIcon
              sxTooltipIcon={{
                marginLeft: '-15px',
              }}
              status="help"
              text={`The warm resize option is currently disabled in this context as the instance is offline, and a cold resize is required to initiate the instance restart.`}
              tooltipPosition="right"
              width={300}
            />
          )}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};
