import { type StreamStatus, streamType } from '@linode/api-v4';
import {
  useCreateDestinationMutation,
  useCreateStreamMutation,
  useUpdateStreamMutation,
} from '@linode/queries';
import { Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect } from 'react';
import { type SubmitHandler, useFormContext, useWatch } from 'react-hook-form';

import { getStreamPayloadDetails } from 'src/features/DataStream/dataStreamUtils';
import { FormSubmitBar } from 'src/features/DataStream/Shared/FormSubmitBar/FormSubmitBar';
import { useVerifyDestination } from 'src/features/DataStream/Shared/useVerifyDestination';
import { StreamFormDelivery } from 'src/features/DataStream/Streams/StreamForm/Delivery/StreamFormDelivery';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { StreamFormClusters } from './StreamFormClusters';
import { StreamFormGeneralInfo } from './StreamFormGeneralInfo';

import type { FormMode } from 'src/features/DataStream/Shared/types';
import type { StreamAndDestinationFormType } from 'src/features/DataStream/Streams/StreamForm/types';

type StreamFormProps = {
  mode: FormMode;
  streamId?: number;
};

export const StreamForm = (props: StreamFormProps) => {
  const { mode, streamId } = props;

  const navigate = useNavigate();
  const { mutateAsync: createDestination, isPending: isCreatingDestination } =
    useCreateDestinationMutation();
  const { mutateAsync: createStream, isPending: isCreatingStream } =
    useCreateStreamMutation();
  const { mutateAsync: updateStream, isPending: isUpdatingStream } =
    useUpdateStreamMutation();
  const {
    verifyDestination,
    isPending: isVerifyingDestination,
    destinationVerified,
    setDestinationVerified,
  } = useVerifyDestination();

  const form = useFormContext<StreamAndDestinationFormType>();
  const { control, handleSubmit, trigger } = form;

  const selectedStreamType = useWatch({
    control,
    name: 'stream.type',
  });

  const selectedDestinations = useWatch({
    control,
    name: 'stream.destinations',
  });

  const destination = useWatch({
    control,
    name: 'destination',
  });

  useEffect(() => {
    setDestinationVerified(false);
  }, [destination, setDestinationVerified]);

  const isSubmitting =
    isCreatingDestination || isCreatingStream || isUpdatingStream;

  const onSubmit: SubmitHandler<StreamAndDestinationFormType> = async () => {
    const {
      stream: { label, type, details, status, destinations },
      destination,
    } = form.getValues();

    let destinationId = destinations?.[0];
    if (!destinationId) {
      try {
        const { id } = await createDestination(destination);
        destinationId = id;
        enqueueSnackbar(
          `Destination ${destination.label} created successfully`,
          { variant: 'success' }
        );
        form.setValue('stream.destinations', [id]);
      } catch (error) {
        enqueueSnackbar(
          getAPIErrorOrDefault(
            error,
            'There was an issue creating your destination'
          )[0].reason,
          { variant: 'error' }
        );
        return;
      }
    }

    const payloadDetails = getStreamPayloadDetails(type, details);

    try {
      if (mode === 'create') {
        await createStream({
          label,
          type,
          destinations: [destinationId],
          details: payloadDetails,
        });
        enqueueSnackbar(`Stream ${label} created successfully`, {
          variant: 'success',
        });
      } else if (mode === 'edit' && streamId) {
        await updateStream({
          id: streamId,
          label,
          type,
          status: status as StreamStatus,
          destinations: [destinationId],
          details: payloadDetails,
        });
        enqueueSnackbar(`Stream ${label} edited successfully`, {
          variant: 'success',
        });
      }

      navigate({ to: '/datastream/streams' });
    } catch (error) {
      enqueueSnackbar(
        getAPIErrorOrDefault(
          error,
          `There was an issue ${mode === 'create' ? 'creating' : 'editing'} your stream`
        )[0].reason,
        { variant: 'error' }
      );
    }
  };

  const handleTestConnection = async () => {
    const isValid = await trigger(['destination']);

    if (isValid) {
      await verifyDestination(destination);
    }
  };

  return (
    <form>
      <Grid container spacing={2}>
        <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
          <Stack spacing={2}>
            <StreamFormGeneralInfo mode={mode} />
            {selectedStreamType === streamType.LKEAuditLogs && (
              <StreamFormClusters />
            )}
            <StreamFormDelivery />
          </Stack>
        </Grid>
        <Grid size={{ lg: 3, md: 12, sm: 12, xs: 12 }}>
          <FormSubmitBar
            blockSubmit={!selectedDestinations?.length}
            connectionTested={destinationVerified}
            destinationType={destination.type}
            formType={'stream'}
            isSubmitting={isSubmitting}
            isTesting={isVerifyingDestination}
            mode={mode}
            onSubmit={handleSubmit(onSubmit)}
            onTestConnection={handleTestConnection}
          />
        </Grid>
      </Grid>
    </form>
  );
};
