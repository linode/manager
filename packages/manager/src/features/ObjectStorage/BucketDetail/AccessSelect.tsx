import {
  ActionsPanel,
  Autocomplete,
  FormControlLabel,
  Notice,
  Toggle,
  Typography,
} from '@linode/ui';
import { capitalize, useOpenClose } from '@linode/utilities';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import {
  useBucketAccess,
  useObjectAccess,
  useUpdateBucketAccessMutation,
  useUpdateObjectAccessMutation,
} from 'src/queries/object-storage/queries';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { bucketACLOptions, objectACLOptions } from '../utilities';
import { copy } from './AccessSelect.data';

import type {
  ACLType,
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

  // CORS is only available at a bucket level, not at an object level.
  const isCorsAvailable =
    variant === 'bucket' && endpointType !== 'E2' && endpointType !== 'E3';

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

  const formValues = React.useMemo(() => {
    const data = variant === 'object' ? objectAccessData : bucketAccessData;

    if (data) {
      const { acl } = data;
      // Don't show "public-read-write" for Objects here; use "custom" instead
      // since "public-read-write" Objects are basically the same as "public-read".
      const _acl =
        variant === 'object' && acl === 'public-read-write' ? 'custom' : acl;
      const cors_enabled = isUpdateObjectStorageBucketAccessPayload(data)
        ? (data.cors_enabled ?? false)
        : true;
      return { acl: _acl as ACLType, cors_enabled };
    }
    return { acl: 'private' as ACLType, cors_enabled: true };
  }, [bucketAccessData, objectAccessData, variant]);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    watch,
  } = useForm<Required<UpdateObjectStorageBucketAccessPayload>>({
    defaultValues: formValues,
    values: formValues,
  });

  const selectedACL = watch('acl');

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

  const aclLabel = _options.find(
    (option) => option.value === selectedACL
  )?.label;
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
          spacingBottom={0}
          spacingTop={8}
          text={`${label} access updated successfully.`}
          variant="success"
        />
      )}

      {errorText && (
        <Notice
          spacingBottom={0}
          spacingTop={8}
          text={'An error has occured'}
          variant="error"
        />
      )}

      <Controller
        control={control}
        name="acl"
        render={({ field }) => (
          <Autocomplete
            data-testid="acl-select"
            disableClearable
            disabled={bucketAccessIsFetching || objectAccessIsFetching}
            label="Access Control List (ACL)"
            loading={bucketAccessIsFetching || objectAccessIsFetching}
            onChange={(_, selected: { label: string; value: ACLType }) => {
              if (selected) {
                field.onChange(selected.value);
              }
            }}
            options={_options}
            placeholder={
              bucketAccessIsFetching || objectAccessIsFetching
                ? 'Loading access...'
                : 'Select an ACL...'
            }
            value={_options.find((option) => option.value === field.value)}
          />
        )}
        rules={{ required: 'ACL is required' }}
      />

      <div style={{ marginTop: 8, minHeight: 16 }}>
        {aclLabel && aclCopy && (
          <Typography>
            {aclLabel}: {aclCopy}
          </Typography>
        )}
      </div>

      {isCorsAvailable && (
        <Controller
          control={control}
          name="cors_enabled"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Toggle
                  checked={field.value}
                  disabled={bucketAccessIsFetching || objectAccessIsFetching}
                  onChange={field.onChange}
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
        />
      )}

      {isCorsAvailable ? (
        <Typography>
          Whether Cross-Origin Resource Sharing is enabled for all origins. For
          more fine-grained control of CORS, please use another{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-object-storage#object-storage-tools">
            S3-compatible tool
          </Link>
          .
        </Typography>
      ) : endpointType && variant === 'bucket' ? (
        <Notice spacingBottom={0} spacingTop={16} variant="warning">
          <Typography
            sx={(theme) => ({
              font: theme.font.bold,
            })}
          >
            CORS (Cross Origin Sharing) is not available for endpoint types E2
            and E3.{' '}
            <Link to="https://techdocs.akamai.com/cloud-computing/docs/define-access-and-permissions-using-acls-access-control-lists">
              Learn more
            </Link>
            .
          </Typography>
        </Notice>
      ) : null}

      <ActionsPanel
        primaryButtonProps={{
          disabled:
            bucketAccessIsFetching || objectAccessIsFetching || !isDirty,
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
            primaryButtonProps={{ label: 'Confirm', onClick: onSubmit }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: closeDialog,
            }}
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
