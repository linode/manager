import { Box, Button, Divider, Paper, Stack, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Link } from '@mui/material';
import * as React from 'react';
import { useMemo } from 'react';

import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';
import { StyledHeader } from 'src/features/Delivery/Shared/FormSubmitBar/FormSubmitBar.styles';

import type { DestinationType } from '@linode/api-v4';
import type { FormMode, FormType } from 'src/features/Delivery/Shared/types';

interface StreamFormSubmitBarProps {
  blockSubmit?: boolean;
  connectionTested: boolean;
  destinationType?: DestinationType;
  disableTestConnection?: boolean;
  formType: FormType;
  isSubmitting: boolean;
  isTesting: boolean;
  mode: FormMode;
  onSubmit: () => void;
  onTestConnection: () => void;
}

export const FormSubmitBar = (props: StreamFormSubmitBarProps) => {
  const {
    blockSubmit,
    connectionTested,
    destinationType,
    formType,
    mode,
    onSubmit,
    onTestConnection,
    isSubmitting,
    isTesting,
    disableTestConnection = false,
  } = props;

  const capitalizedFormType = capitalize(formType);
  const enableSubmit = !blockSubmit || connectionTested;
  const buttonLabel = useMemo(
    () =>
      mode === 'edit' ? 'Save' : `${capitalize(mode)} ${capitalizedFormType}`,
    [mode, capitalizedFormType]
  );
  const pagePendoId = useMemo(
    () => `Logs Delivery ${capitalizedFormType}s ${capitalize(mode)}`,
    [mode, capitalizedFormType]
  );

  return (
    <Paper sx={{ position: 'sticky', top: 0 }}>
      <Stack spacing={2}>
        <Typography variant="h2">{capitalizedFormType} Summary</Typography>
        {formType === 'stream' && destinationType && (
          <>
            <Divider dark spacingBottom={16} spacingTop={16} />
            <Box>
              <StyledHeader mb={1}>Delivery</StyledHeader>
              <Typography mb={1}>
                {getDestinationTypeOption(destinationType)?.label ?? ''}
              </Typography>
            </Box>
          </>
        )}
        <Divider dark spacingBottom={0} spacingTop={16} />
        {formType === 'stream' && (
          <Typography mb={1}>
            Stream provisioning may take up to 45 minutes.
          </Typography>
        )}
        <Button
          buttonType="outlined"
          data-pendo-id={`${pagePendoId}-Test Connection`}
          disabled={disableTestConnection}
          loading={isTesting}
          onClick={onTestConnection}
          sx={(theme) => ({
            mt: `${theme.spacingFunction(24)} !important`,
            [theme.breakpoints.down('lg')]: {
              alignSelf: 'flex-end',
            },
          })}
        >
          Test Connection
        </Button>
        <Button
          buttonType="primary"
          data-pendo-id={`${pagePendoId}-${buttonLabel}`}
          disabled={!enableSubmit}
          loading={isSubmitting}
          onClick={onSubmit}
          sx={(theme) => ({
            [theme.breakpoints.down('lg')]: {
              alignSelf: 'flex-end',
            },
          })}
        >
          {buttonLabel}
        </Button>
        {formType === 'stream' && (
          <Typography mb={1}>
            By using this service, you acknowledge your obligations under the
            United States Department of Justice Bulk Sensitive Data Transaction
            Rule (&#34;BSD Rule&#34;). You also agree that you will not use the
            service to transfer, onward transfer, or otherwise make accessible
            any United States government-related data or bulk United States
            sensitive personal data to countries of concern or a covered person,
            as each of those terms and concepts are defined in the{' '}
            <Link href="https://www.federalregister.gov/documents/2024/03/01/2024-04573/preventing-access-to-americans-bulk-sensitive-personal-data-and-united-states-government-related">
              BSD Rule
            </Link>
            . Anyone using the service is solely responsible for compliance with
            the BSD Rule.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};
