import { Box, Divider, TextField, Typography } from '@linode/ui';
import { capitalize } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HideShowText } from 'src/components/PasswordInput/HideShowText';
import { PathSample } from 'src/features/Delivery/Shared/PathSample';

import type { FormMode, FormType } from 'src/features/Delivery/Shared/types';

interface DestinationLinodeObjectStorageDetailsFormProps {
  controlPaths?: {
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    host: string;
    path: string;
  };
  entity: FormType;
  mode: FormMode;
}

const defaultPaths = {
  accessKeyId: 'details.access_key_id',
  accessKeySecret: 'details.access_key_secret',
  bucketName: 'details.bucket_name',
  host: 'details.host',
  path: 'details.path',
};

export const DestinationAkamaiObjectStorageDetailsForm = ({
  controlPaths = defaultPaths,
  entity,
  mode,
}: DestinationLinodeObjectStorageDetailsFormProps) => {
  const { control } = useFormContext();
  const path = useWatch({
    control,
    name: controlPaths?.path,
  });
  const pendoPageId = `Logs Delivery ${capitalize(entity)}s ${capitalize(mode)}${entity === 'destination' ? '' : ' New Destination'}-`;

  return (
    <>
      <Controller
        control={control}
        name={controlPaths.host}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            data-pendo-id={`${pendoPageId}Host`}
            errorText={fieldState.error?.message}
            label="Host"
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
            placeholder="Host"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={controlPaths.bucketName}
        render={({ field, fieldState }) => (
          <TextField
            aria-required
            data-pendo-id={`${pendoPageId}Bucket`}
            errorText={fieldState.error?.message}
            label="Bucket"
            onBlur={field.onBlur}
            onChange={(value) => {
              field.onChange(value);
            }}
            placeholder="Bucket"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={controlPaths.accessKeyId}
        render={({ field, fieldState }) => (
          <HideShowText
            aria-required
            data-pendo-id={`${pendoPageId}Access Key ID`}
            errorText={fieldState.error?.message}
            label="Access Key ID"
            onBlur={field.onBlur}
            onChange={(value) => field.onChange(value)}
            placeholder="Access Key ID"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name={controlPaths.accessKeySecret}
        render={({ field, fieldState }) => (
          <HideShowText
            aria-required
            data-pendo-id={`${pendoPageId}Secret Access Key`}
            errorText={fieldState.error?.message}
            label="Secret Access Key"
            onBlur={field.onBlur}
            onChange={(value) => field.onChange(value)}
            placeholder="Secret Access Key"
            value={field.value}
          />
        )}
      />
      <Divider sx={{ my: 3 }} />
      <Typography variant="h2">Path</Typography>
      <Box
        alignItems="baseline"
        display="flex"
        flexWrap="wrap"
        gap="16px"
        sx={{ '> *': { width: '100%' } }}
      >
        <Controller
          control={control}
          name={controlPaths.path}
          render={({ field, fieldState }) => (
            <TextField
              aria-required
              data-pendo-id={`${pendoPageId}Log Path Prefix`}
              errorText={fieldState.error?.message}
              label="Log Path Prefix"
              onBlur={field.onBlur}
              onChange={(value) => field.onChange(value)}
              placeholder="Log Path Prefix"
              sx={{ maxWidth: 416 }}
              value={field.value}
            />
          )}
        />
        <PathSample value={path} />
      </Box>
    </>
  );
};
