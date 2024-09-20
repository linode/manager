import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import { useOpenClose } from 'src/hooks/useOpenClose';
import {
  useBucketAccess,
  useObjectAccess,
  useUpdateBucketAccessMutation,
  useUpdateObjectAccessMutation,
} from 'src/queries/object-storage/queries';
import { capitalize } from 'src/utilities/capitalize';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { bucketACLOptions, objectACLOptions } from '../utilities';
import { copy } from './AccessSelect.data';

import type {
  ObjectStorageBucketAccess,
  ObjectStorageEndpointTypes,
  ObjectStorageObjectACL,
  UpdateObjectStorageBucketAccessPayload,
} from '@linode/api-v4/lib/object-storage';
import type { Theme } from '@mui/material/styles';

export interface Props {
  bucketName?: string;
  clusterOrRegion: string;
  endpointType?: ObjectStorageEndpointTypes;
  name: string;
  variant: 'bucket' | 'object';
}

function isUpdateObjectStorageBucketAccessPayload(
  response: ObjectStorageBucketAccess | ObjectStorageObjectACL
): response is ObjectStorageBucketAccess {
  return 'cors_enabled' in response;
}

export const AccessSelect = React.memo((props: Props) => {
  const { bucketName, clusterOrRegion, endpointType, name, variant } = props;

  const { close: closeDialog, isOpen, open: openDialog } = useOpenClose();
  const label = capitalize(variant);
  const isCorsEnabled =
    (variant === 'bucket' || variant == 'object') &&
    endpointType !== 'E2' &&
    endpointType !== 'E3';

  const {
    data: bucketAccessData,
    error: bucketAccessError,
    isFetching: bucketAccessIsFetching,
  } = useBucketAccess(clusterOrRegion, name, variant === 'bucket');

  const {
    data: objectAccessData,
    error: objectAccessError,
    isFetching: objectAccessIsFetching,
  } = useObjectAccess(
    bucketName || '',
    clusterOrRegion,
    { name },
    variant === 'object'
  );

  const {
    error: updateBucketAccessError,
    isSuccess: updateBucketAccessSuccess,
    mutateAsync: updateBucketAccess,
  } = useUpdateBucketAccessMutation(clusterOrRegion, name);

  const {
    error: updateObjectAccessError,
    isSuccess: updateObjectAccessSuccess,
    mutateAsync: updateObjectAccess,
  } = useUpdateObjectAccessMutation(clusterOrRegion, bucketName || '', name);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    watch,
  } = useForm<Required<UpdateObjectStorageBucketAccessPayload>>({
    defaultValues: {
      acl: 'private',
      cors_enabled: true,
    },
  });

  const selectedACL = watch('acl');

  React.useEffect(() => {
    const data = variant === 'object' ? objectAccessData : bucketAccessData;
    if (data) {
      const { acl } = data;
      // Don't show "public-read-write" for Objects here; use "custom" instead
      // since "public-read-write" Objects are basically the same as "public-read".
      const _acl =
        variant === 'object' && acl === 'public-read-write' ? 'custom' : acl;
      const cors_enabled = isUpdateObjectStorageBucketAccessPayload(data)
        ? data?.cors_enabled || undefined
        : true;
      reset({ acl: _acl || undefined, cors_enabled });
    }
  }, [bucketAccessData, objectAccessData, variant, reset]);

  const aclOptions = variant === 'bucket' ? bucketACLOptions : objectACLOptions;

  // An Object/Bucket's ACL is "custom" if the user has done things with the S3
  // API directly (instead of using one of the canned ACLs). "Custom" is not a
  // valid option, but it is (potentially) returned by the API, so we
  // present it here (though the form cannot be submitted with it selected.)
  //
  // Another situation where this may happen is if the user has used the API to
  // select "public-read-write" as an Object ACL, which is just equivalent to
  // "public-read", so we don't present it as an option.
  const _options =
    selectedACL === 'custom'
      ? [{ label: 'Custom', value: 'custom' }, ...aclOptions]
      : aclOptions;

  const aclLabel = _options.find((option) => option.value === selectedACL)
    ?.label;
  const aclCopy = selectedACL ? copy[variant][selectedACL] : null;

  const errorText =
    getErrorStringOrDefault(bucketAccessError || '') ||
    getErrorStringOrDefault(objectAccessError || '') ||
    getErrorStringOrDefault(updateBucketAccessError || '') ||
    getErrorStringOrDefault(updateObjectAccessError || '') ||
    errors.acl?.message;

  const onSubmit = handleSubmit(async (data) => {
    closeDialog();
    if (errorText) {
      return;
    }

    if (variant === 'bucket') {
      // Don't send the ACL with the payload if it's "custom", since it's
      // not valid (though it's a valid return type).
      const payload =
        data.acl === 'custom' ? { cors_enabled: data.cors_enabled } : data;
      await updateBucketAccess(payload);
    } else {
      await updateObjectAccess(data.acl);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      {(updateBucketAccessSuccess || updateObjectAccessSuccess) && (
        <Notice
          text={`${label} access updated successfully.`}
          variant="success"
        />
      )}

      {errorText && <Notice text={errorText} variant="error" />}

      <Controller
        render={({ field }) => (
          <Autocomplete
            {...field}
            onChange={(_, selected) => {
              if (selected) {
                field.onChange(selected.value);
              }
            }}
            placeholder={
              bucketAccessIsFetching || objectAccessIsFetching
                ? 'Loading access...'
                : 'Select an ACL...'
            }
            data-testid="acl-select"
            disableClearable
            disabled={bucketAccessIsFetching || objectAccessIsFetching}
            label="Access Control List (ACL)"
            loading={bucketAccessIsFetching || objectAccessIsFetching}
            options={_options}
            value={_options.find((option) => option.value === field.value)}
          />
        )}
        control={control}
        name="acl"
        rules={{ required: 'ACL is required' }}
      />

      <div style={{ marginTop: 8, minHeight: 16 }}>
        {aclLabel && aclCopy && (
          <Typography>
            {aclLabel}: {aclCopy}
          </Typography>
        )}
      </div>

      {isCorsEnabled && (
        <Controller
          render={({ field }) => (
            <FormControlLabel
              control={
                <Toggle
                  {...field}
                  checked={field.value}
                  disabled={bucketAccessIsFetching || objectAccessIsFetching}
                />
              }
              label={
                bucketAccessIsFetching || objectAccessIsFetching
                  ? 'Loading access...'
                  : field.value
                  ? 'CORS Enabled'
                  : 'CORS Disabled'
              }
              style={{ display: 'block', marginTop: 16 }}
            />
          )}
          control={control}
          name="cors_enabled"
        />
      )}

      {isCorsEnabled ? (
        <Typography>
          Whether Cross-Origin Resource Sharing is enabled for all origins. For
          more fine-grained control of CORS, please use another{' '}
          <Link to="https://www.linode.com/docs/guides/how-to-use-object-storage/#object-storage-tools">
            S3-compatible tool
          </Link>
          .
        </Typography>
      ) : endpointType && variant === 'bucket' ? (
        <Notice spacingBottom={0} spacingTop={16} variant="warning">
          <Typography
            sx={(theme) => ({
              fontFamily: theme.font.bold,
            })}
          >
            CORS (Cross Origin Sharing) is not available for endpoint types E2
            and E3. <Link to="#">Learn more</Link>.
          </Typography>
        </Notice>
      ) : null}

      <ActionsPanel
        primaryButtonProps={{
          disabled: bucketAccessIsFetching || objectAccessIsFetching,
          label: 'Save',
          loading: isSubmitting,
          onClick: () => {
            if (selectedACL === 'public-read-write') {
              openDialog();
            } else {
              onSubmit();
            }
          },
          sx: (theme: Theme) => ({
            marginTop: theme.spacing(3),
          }),
        }}
        style={{ padding: 0 }}
      />

      <ConfirmationDialog
        actions={() => (
          <ActionsPanel
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: closeDialog,
            }}
            primaryButtonProps={{ label: 'Confirm', onClick: onSubmit }}
            style={{ padding: 0 }}
          />
        )}
        onClose={closeDialog}
        open={isOpen}
        title={`Confirm ${label} Access`}
      >
        Are you sure you want to set access for {name} to Public Read/Write?
        Everyone will be able to list, create, overwrite, and delete Objects in
        this Bucket. <strong>This is not recommended.</strong>
      </ConfirmationDialog>
    </form>
  );
});
