import { Box, Button, Divider, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  getDestinationTypeOption,
  isFormInEditMode,
} from 'src/features/DataStream/dataStreamUtils';
import { StyledHeader } from 'src/features/DataStream/Streams/StreamForm/CheckoutBar/StreamFormCheckoutBar.styles';

import type { FormMode } from 'src/features/DataStream/Shared/types';
import type { StreamAndDestinationFormType } from 'src/features/DataStream/Streams/StreamForm/types';

type StreamFormSubmitBarProps = {
  mode: FormMode;
  onSubmit: () => void;
};

export const StreamFormSubmitBar = (props: StreamFormSubmitBarProps) => {
  const { onSubmit, mode } = props;

  const { control } = useFormContext<StreamAndDestinationFormType>();
  const destinationType = useWatch({ control, name: 'destination.type' });

  return (
    <Paper sx={{ position: 'sticky', top: 0 }}>
      <Stack spacing={2}>
        <Typography variant="h2">Stream Summary</Typography>
        <Divider dark spacingBottom={16} spacingTop={16} />
        <Box>
          <StyledHeader mb={1}>Delivery</StyledHeader>
          <Typography mb={1}>
            {getDestinationTypeOption(destinationType)?.label ?? ''}
          </Typography>
        </Box>
        <Divider dark spacingBottom={0} spacingTop={16} />
        <Button
          buttonType="primary"
          data-qa-deploy-linode
          onClick={onSubmit}
          sx={(theme) => ({
            mt: `${theme.spacingFunction(24)} !important`,
            [theme.breakpoints.down('lg')]: {
              alignSelf: 'flex-end',
            },
          })}
        >
          {isFormInEditMode(mode) ? 'Edit' : 'Create'} Stream
        </Button>
      </Stack>
    </Paper>
  );
};
