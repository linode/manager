import { Box, Button, Divider, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import { StyledHeader } from 'src/features/DataStream/Streams/StreamCreate/CheckoutBar/StreamCreateCheckoutBar.styles';

import type { CreateStreamAndDestinationForm } from 'src/features/DataStream/Streams/StreamCreate/types';

type StreamCreateSidebarProps = {
  createStream: () => void;
};

export const StreamCreateSubmitBar = (props: StreamCreateSidebarProps) => {
  const { createStream } = props;

  const { control } = useFormContext<CreateStreamAndDestinationForm>();
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
          onClick={createStream}
          sx={(theme) => ({
            mt: `${theme.spacingFunction(24)} !important`,
            [theme.breakpoints.down('lg')]: {
              alignSelf: 'flex-end',
            },
          })}
        >
          Create Stream
        </Button>
      </Stack>
    </Paper>
  );
};
