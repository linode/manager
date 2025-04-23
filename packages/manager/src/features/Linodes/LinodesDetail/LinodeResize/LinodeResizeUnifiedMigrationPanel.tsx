import { FormControlLabel, Typography } from '@linode/ui';
import {
  Box,
  Divider,
  FormControl,
  Radio,
  RadioGroup,
  TooltipIcon,
} from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';

import type { MigrationTypes } from '@linode/api-v4/lib/linodes';
import type { ResizeLinodePayload } from '@linode/api-v4/lib/linodes/types';
import type { FormikProps } from 'formik';

const RADIO_GROUP_ID = 'resize-migration-types';

interface Props {
  formik: FormikProps<ResizeLinodePayload>;
  isLinodeOffline: boolean;
  migrationTypeOptions: { [key in MigrationTypes]: key };
}

export const UnifiedMigrationPanel = (props: Props) => {
  const { formik, isLinodeOffline, migrationTypeOptions } = props;
  const theme = useTheme();

  return (
    <Box>
      <Typography id={RADIO_GROUP_ID} variant="h2">
        Resize Type
      </Typography>
      <FormControl>
        <RadioGroup
          aria-labelledby={RADIO_GROUP_ID}
          onChange={(e, value) => formik.setFieldValue('migration_type', value)}
          row
          sx={{ marginTop: '0 !important' }}
          value={formik.values.migration_type}
        >
          <Box alignItems="center" display="flex" width="100%">
            <FormControlLabel
              control={<Radio />}
              data-qa-radio={migrationTypeOptions.warm}
              disabled={isLinodeOffline}
              key={migrationTypeOptions.warm}
              label={`${capitalize(migrationTypeOptions.warm)} resize`}
              value={migrationTypeOptions.warm}
            />
            <Box
              sx={{
                marginLeft: '-10px',
              }}
            >
              <Typography
                sx={(theme) => ({
                  font: theme.font.bold,
                  fontSize: '0.85rem',
                  opacity: isLinodeOffline ? 0.5 : 1,
                })}
              >
                (Recommended)
              </Typography>
            </Box>
            <TooltipIcon
              text={
                <>
                  During a <strong>warm resize</strong>, your Linode will remain
                  up and running for the duration of the process and will be
                  rebooted to complete the resize.{' '}
                  <Link to="https://techdocs.akamai.com/cloud-computing/docs/resize-a-compute-instance">
                    Learn more.
                  </Link>
                  {isLinodeOffline && (
                    <Typography sx={{ font: theme.font.bold, mt: 1 }}>
                      Your Linode must be powered on to select a warm resize.
                    </Typography>
                  )}
                </>
              }
              status="help"
              tooltipPosition="right"
              width={375}
            />
          </Box>
          <Box width="100%">
            <FormControlLabel
              control={<Radio />}
              data-qa-radio={migrationTypeOptions.cold}
              disabled={isLinodeOffline}
              key={migrationTypeOptions.cold}
              label={`${capitalize(migrationTypeOptions.cold)} resize`}
              value={migrationTypeOptions.cold}
            />
            <TooltipIcon
              sxTooltipIcon={{
                marginLeft: '-15px',
              }}
              text={
                <>
                  During a <strong>cold resize</strong>, your Linode will be
                  shut down, migrated to a new host machine, and restored to its
                  previous state (booted or powered off) once the resize is
                  complete.{' '}
                  <Link to="https://techdocs.akamai.com/cloud-computing/docs/resize-a-compute-instance">
                    Learn more.
                  </Link>
                </>
              }
              status="help"
              tooltipPosition="right"
              width={450}
            />
          </Box>
        </RadioGroup>
      </FormControl>
      <Divider />
    </Box>
  );
};
