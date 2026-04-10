import {
  type CreateDestinationPayload,
  streamStatus,
  type StreamStatus,
  streamType,
} from '@linode/api-v4';
import {
  useCreateDestinationMutation,
  useCreateStreamMutation,
  useUpdateStreamMutation,
} from '@linode/queries';
import { Stack } from '@linode/ui';
import { scrollErrorIntoViewV2 } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
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

  const formRef = React.useRef<HTMLFormElement>(null);
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

  const selectedStreamStatus = useWatch({
    control,
    name: 'stream.status',
  });

  const isStreamStatusBlocking =
    !!selectedStreamStatus &&
    (
      [
        streamStatus.Provisioning,
        streamStatus.Deactivating,
        streamStatus.Failed,
      ] as StreamStatus[]
    ).includes(selectedStreamStatus);

  const submitButtonTooltip = useMemo(
    () =>
      isStreamStatusBlocking
        ? `You cannot save changes while the stream status is ${selectedStreamStatus}`
        : undefined,
    [isStreamStatusBlocking, selectedStreamStatus]
  );

  useEffect(() => {
    setDestinationVerified(false);
  }, [destination, setDestinationVerified]);

  const [disableTestConnection, setDisableTestConnection] =
    useState<boolean>(false);

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
        const destinationPayload: CreateDestinationPayload = {
          ...destination,
          details: getDestinationPayloadDetails(
            destination.details,
            destination.type
          ),
        };
        const { id } = await createDestination(destinationPayload);
        destinationId = id;
        enqueueSnackbar(
          `Destination ${destination.label} created successfully`,
          { variant: 'success' }
        );
        form.setValue('stream.destinations', [id]);
      } catch (errors) {
        let errorMessage = `There was an issue creating your destination`;
        for (const error of errors) {
          if (error.field) {
            form.setError(error.field, { message: error.reason });
          } else {
            errorMessage = error.reason;
            form.setError('root', { message: error.reason });
          }
        }

        enqueueSnackbar(errorMessage, {
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
        enqueueSnackbar(
          `${label} created successfully. Stream is being provisioned, which may take up to 45 minutes`,
          {
            variant: 'success',
            autoHideDuration: 10000,
          }
        );
      } else if (mode === 'edit' && streamId) {
        await updateStream({
          id: streamId,
          label,
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
      let errorMessage = `There was an issue ${mode === 'create' ? 'creating' : 'editing'} your stream`;
      for (const error of errors) {
        if (error.field) {
          form.setError(error.field, { message: error.reason });
        } else {
          errorMessage = error.reason;
          form.setError('root', { message: error.reason });
        }
      }

      enqueueSnackbar(errorMessage, {
        variant: 'error',
      });
    }
  };

  const handleTestConnection = async () => {
    const isValid = await trigger(['destination']);

    if (isValid) {
      await verifyDestination(destination);
    } else {
      scrollErrorIntoViewV2(formRef);
    }
  };

  return (
    <form ref={formRef}>
      <Grid container spacing={2}>
        <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
          <Stack spacing={2}>
            <StreamFormGeneralInfo mode={mode} />
            {selectedStreamType === streamType.LKEAuditLogs && (
              <StreamFormClusters mode={mode} />
            )}
            <StreamFormDelivery
              mode={mode}
              setDisableTestConnection={setDisableTestConnection}
            />
          </Stack>
        </Grid>
        <Grid size={{ lg: 3, md: 12, sm: 12, xs: 12 }}>
          <FormSubmitBar
            blockSubmit={
              isStreamStatusBlocking || !selectedDestinations?.length
            }
            connectionTested={destinationVerified}
            destinationType={destination?.type}
            disableTestConnection={disableTestConnection}
            formType={'stream'}
            isSubmitting={isSubmitting}
            isTesting={isVerifyingDestination}
            mode={mode}
            onSubmit={handleSubmit(onSubmit, () =>
              scrollErrorIntoViewV2(formRef)
            )}
            onTestConnection={handleTestConnection}
            submitButtonTooltip={submitButtonTooltip}
          />
        </Grid>
      </Grid>
    </form>
  );
};
