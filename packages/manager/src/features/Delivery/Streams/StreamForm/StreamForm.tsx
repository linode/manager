import {
  type CreateDestinationPayload,
  type StreamStatus,
  streamType,
} from '@linode/api-v4';
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

import {
  getDestinationPayloadDetails,
  getStreamPayloadDetails,
} from 'src/features/Delivery/deliveryUtils';
import { FormSubmitBar } from 'src/features/Delivery/Shared/FormSubmitBar/FormSubmitBar';
import { useVerifyDestination } from 'src/features/Delivery/Shared/useVerifyDestination';
import { StreamFormDelivery } from 'src/features/Delivery/Streams/StreamForm/Delivery/StreamFormDelivery';

import { StreamFormClusters } from './Clusters/StreamFormClusters';
import { StreamFormGeneralInfo } from './StreamFormGeneralInfo';

import type { UpdateDestinationPayload } from '@linode/api-v4';
import type { FormMode } from 'src/features/Delivery/Shared/types';
import type { StreamAndDestinationFormType } from 'src/features/Delivery/Streams/StreamForm/types';

interface StreamFormProps {
  mode: FormMode;
  streamId?: number;
}

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
        const destinationPayload:
          | CreateDestinationPayload
          | UpdateDestinationPayload = {
          ...destination,
          details: getDestinationPayloadDetails(destination.details),
        };
        const { id } = await createDestination(destinationPayload);
        destinationId = id;
        enqueueSnackbar(
          `Destination ${destination.label} created successfully`,
          { variant: 'success' }
        );
        form.setValue('stream.destinations', [id]);
      } catch (errors) {
        for (const error of errors) {
          if (error.field) {
            form.setError(error.field, { message: error.reason });
          } else {
            form.setError('root', { message: error.reason });
          }
        }

        enqueueSnackbar('There was an issue creating your destination', {
          variant: 'error',
        });
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

      navigate({ to: '/logs/delivery/streams' });
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          form.setError(error.field, { message: error.reason });
        } else {
          form.setError('root', { message: error.reason });
        }
      }

      enqueueSnackbar(
        `There was an issue ${mode === 'create' ? 'creating' : 'editing'} your stream`,
        {
          variant: 'error',
        }
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
