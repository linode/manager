import { Box, Button, Divider, Paper, Stack, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import * as React from 'react';

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
        <Button
          buttonType="outlined"
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
          disabled={!enableSubmit}
          loading={isSubmitting}
          onClick={onSubmit}
          sx={(theme) => ({
            [theme.breakpoints.down('lg')]: {
              alignSelf: 'flex-end',
            },
          })}
        >
          {capitalize(mode)} {capitalizedFormType}
        </Button>
      </Stack>
    </Paper>
  );
};
