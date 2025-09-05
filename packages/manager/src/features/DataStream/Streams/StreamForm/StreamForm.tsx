import { streamType } from '@linode/api-v4';
import { Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';

import { StreamFormSubmitBar } from 'src/features/DataStream/Streams/StreamForm/CheckoutBar/StreamFormSubmitBar';
import { StreamFormDelivery } from 'src/features/DataStream/Streams/StreamForm/Delivery/StreamFormDelivery';

import { StreamFormClusters } from './StreamFormClusters';
import { StreamFormGeneralInfo } from './StreamFormGeneralInfo';

import type { FormMode } from 'src/features/DataStream/Shared/types';
import type { StreamAndDestinationFormType } from 'src/features/DataStream/Streams/StreamForm/types';

type StreamFormProps = {
  mode: FormMode;
  onSubmit: SubmitHandler<StreamAndDestinationFormType>;
  streamId?: string;
};

export const StreamForm = (props: StreamFormProps) => {
  const { mode, onSubmit, streamId } = props;

  const { control, handleSubmit } =
    useFormContext<StreamAndDestinationFormType>();

  const selectedStreamType = useWatch({
    control,
    name: 'stream.type',
  });

  return (
    <form>
      <Grid container spacing={2}>
        <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
          <Stack spacing={2}>
            <StreamFormGeneralInfo mode={mode} streamId={streamId} />
            {selectedStreamType === streamType.LKEAuditLogs && (
              <StreamFormClusters />
            )}
            <StreamFormDelivery />
          </Stack>
        </Grid>
        <Grid size={{ lg: 3, md: 12, sm: 12, xs: 12 }}>
          <StreamFormSubmitBar mode={mode} onSubmit={handleSubmit(onSubmit)} />
        </Grid>
      </Grid>
    </form>
  );
};
