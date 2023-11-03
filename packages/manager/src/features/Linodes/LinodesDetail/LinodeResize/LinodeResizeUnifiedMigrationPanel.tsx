import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { capitalize } from 'src/utilities/capitalize';

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
              <strong>(Recommended)</strong>
            </Box>
            <TooltipIcon
              text={
                <>
                  During a <strong>warm resize</strong>, your Linode will remain
                  up and running for the duration of the process and will be
                  rebooted to complete the resize.{' '}
                  <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/resize/">
                    Learn more.
                  </Link>
                </>
              }
              interactive
              status="help"
              tooltipPosition="right"
              width={[theme.breakpoints.up('sm')] ? 375 : 300}
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
                  <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/resize/">
                    Learn more.
                  </Link>
                </>
              }
              interactive
              status="help"
              tooltipPosition="right"
              width={[theme.breakpoints.up('sm')] ? 450 : 300}
            />
          </Box>
        </RadioGroup>
      </FormControl>
      <Divider />
    </Box>
  );
};
