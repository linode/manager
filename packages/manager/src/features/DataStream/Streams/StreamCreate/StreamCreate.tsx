import { destinationType, streamType } from '@linode/api-v4';
import { useCreateStreamMutation } from '@linode/queries';
import { omitProps, Stack } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { StreamCreateSubmitBar } from 'src/features/DataStream/Streams/StreamCreate/CheckoutBar/StreamCreateSubmitBar';
import { sendCreateStreamEvent } from 'src/utilities/analytics/customEventAnalytics';

import { StreamCreateClusters } from './StreamCreateClusters';
import { StreamCreateDelivery } from './StreamCreateDelivery';
import { StreamCreateGeneralInfo } from './StreamCreateGeneralInfo';

import type { CreateStreamPayload } from '@linode/api-v4';
import type { CreateStreamForm } from 'src/features/DataStream/Streams/StreamCreate/types';

export const StreamCreate = () => {
  const { mutateAsync: createStream } = useCreateStreamMutation();
  const navigate = useNavigate();

  const form = useForm<CreateStreamForm>({
    defaultValues: {
      type: streamType.AuditLogs,
      destination_type: destinationType.LinodeObjectStorage,
      region: '',
      details: {
        is_auto_add_all_clusters_enabled: false,
      },
    },
  });

  const { control, handleSubmit } = form;
  const selectedStreamType = useWatch({
    control,
    name: 'type',
  });

  const landingHeaderProps = {
    breadcrumbProps: {
      pathname: '/datastream/streams/create',
      crumbOverrides: [
        {
          label: 'DataStream',
          linkTo: '/datastream/streams',
          position: 1,
        },
      ],
    },
    removeCrumbX: 2,
    title: 'Create Stream',
  };

  const onSubmit = () => {
    const { label, type, destinations, details } = form.getValues();
    const payload: CreateStreamPayload = {
      label,
      type,
      destinations,
    };
    if (type === streamType.LKEAuditLogs && details) {
      if (details.is_auto_add_all_clusters_enabled) {
        payload['details'] = omitProps(details, ['cluster_ids']);
      } else {
        payload['details'] = omitProps(details, [
          'is_auto_add_all_clusters_enabled',
        ]);
      }
    }

    createStream(payload).then(() => {
      sendCreateStreamEvent('Stream Create Page');
      navigate({ to: '/datastream/streams' });
    });
  };

  return (
    <>
      <DocumentTitleSegment segment="Create Stream" />
      <LandingHeader {...landingHeaderProps} />
      <FormProvider {...form}>
        <form>
          <Grid container spacing={2}>
            <Grid size={{ lg: 9, md: 12, sm: 12, xs: 12 }}>
              <Stack spacing={2}>
                <StreamCreateGeneralInfo />
                {selectedStreamType === streamType.LKEAuditLogs && (
                  <StreamCreateClusters />
                )}
                <StreamCreateDelivery />
              </Stack>
            </Grid>
            <Grid size={{ lg: 3, md: 12, sm: 12, xs: 12 }}>
              <StreamCreateSubmitBar createStream={handleSubmit(onSubmit)} />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </>
  );
};
