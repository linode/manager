import {
  FormField,
  FormLabel,
  NotificationBanner,
  Select,
  Switch,
} from '@akamai/cds-components/react';
import { getErrorStringOrDefault } from '@akamai/compute-ui-core/api';
import { capitalize } from '@akamai/compute-ui-core/formatting';
import { useOpenClose } from '@linode/utilities';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import {
  useBucketAccess,
  useObjectAccess,
  useUpdateBucketAccessMutation,
  useUpdateObjectAccessMutation,
} from 'src/queries/object-storage/queries';

import { getEndpointCapabilities } from '../../../shared/endpointCapabilities';
import { bucketACLOptions, objectACLOptions } from '../../utils/utilities';
import { ActionsPanel } from '../ActionsPanel/ActionsPanel';
import { Link } from '../Link/Link';
import { copy } from './AccessControls.data';

import type {
  ACLType,
  ObjectStorageBucketAccess,
  ObjectStorageEndpointTypes,
  ObjectStorageObjectACL,
  UpdateObjectStorageBucketAccessPayload,
} from '@linode/api-v4';

export interface Props {
  bucketName?: string; // used only when variant is 'object'
  endpointType?: ObjectStorageEndpointTypes;
  name: string; // either bucket name or object name
  regionId: string;
  variant: 'bucket' | 'object';
}

function isUpdateObjectStorageBucketAccessPayload(
  response: ObjectStorageBucketAccess | ObjectStorageObjectACL
): response is ObjectStorageBucketAccess {
  return 'cors_enabled' in response;
}

// TODO: separate to Object ACL and Bucket ACL Access Select components
export const AccessControls = React.memo((props: Props) => {
  const { bucketName, regionId, endpointType, name, variant } = props;

  const { close: closeDialog, isOpen, open: openDialog } = useOpenClose();
  const label = capitalize(variant);
  const endpointCapabilities = getEndpointCapabilities(endpointType);

  // CORS is only available at a bucket level, not at an object level.
  const isCorsAvailable = variant === 'bucket' && endpointCapabilities.cors;

  const {
    data: bucketAccessData,
    error: bucketAccessError,
    isFetching: bucketAccessIsFetching,
  } = useBucketAccess(regionId, name, variant === 'bucket');

  const {
    data: objectAccessData,
    error: objectAccessError,
    isFetching: objectAccessIsFetching,
  } = useObjectAccess(
    bucketName ?? '',
    regionId,
    { objectName: name },
    variant === 'object'
  );

  const {
    error: updateBucketAccessError,
    isSuccess: updateBucketAccessSuccess,
    mutateAsync: updateBucketAccess,
  } = useUpdateBucketAccessMutation(regionId, name);

  const {
    error: updateObjectAccessError,
    isSuccess: updateObjectAccessSuccess,
    mutateAsync: updateObjectAccess,
  } = useUpdateObjectAccessMutation(regionId, bucketName ?? '', name);

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
      <div
        style={{
          marginBottom: 'var(--token-global-spacing-s8)',
          marginTop: 'var(--token-global-spacing-s8)',
        }}
      >
        {(updateBucketAccessSuccess || updateObjectAccessSuccess) && (
          <NotificationBanner
            text={`${label} access updated successfully.`}
            type="success"
          />
        )}

        {errorText && (
          <NotificationBanner text={'An error has occured'} type="error" />
        )}
      </div>

      <Controller
        control={control}
        name="acl"
        render={({ field }) => (
          <FormField>
            <FormLabel
              style={{ marginBottom: 'var(--token-global-spacing-s8)' }}
            >
              Access Control List (ACL)
            </FormLabel>
            <Select
              autocomplete={true}
              data-testid="acl-select"
              disabled={bucketAccessIsFetching || objectAccessIsFetching}
              isLoading={bucketAccessIsFetching || objectAccessIsFetching}
              items={_options}
              onChange={(event: CustomEvent) => {
                const selected = event.detail;
                if (selected) {
                  field.onChange(selected.value);
                }
              }}
              placeholder={
                bucketAccessIsFetching || objectAccessIsFetching
                  ? 'Loading access...'
                  : 'Select an ACL...'
              }
              selected={_options.find((option) => option.value === field.value)}
              valueFn={(option: { label: string; value: ACLType }) =>
                option.label
              }
            />
          </FormField>
        )}
        rules={{ required: 'ACL is required' }}
      />

      {aclLabel && aclCopy && (
        <p>
          {aclLabel}: {aclCopy}
        </p>
      )}

      {isCorsAvailable && (
        <Controller
          control={control}
          name="cors_enabled"
          render={({ field }) => (
            <Switch
              checked={field.value}
              data-testid="cors-switch"
              disabled={bucketAccessIsFetching || objectAccessIsFetching}
              onChange={(event) => field.onChange(event.detail)}
              style={{ marginTop: 'var(--token-global-spacing-s24)' }}
            >
              {bucketAccessIsFetching || objectAccessIsFetching
                ? 'Loading access...'
                : field.value
                  ? 'CORS Enabled'
                  : 'CORS Disabled'}
            </Switch>
          )}
        />
      )}

      {isCorsAvailable ? (
        <p style={{ marginTop: 'var(--token-global-spacing-s12)' }}>
          Whether Cross-Origin Resource Sharing is enabled for all origins. For
          more fine-grained control of CORS, please use another{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-object-storage#object-storage-tools">
            S3-compatible tool
          </Link>
          .
        </p>
      ) : endpointType && variant === 'bucket' ? (
        <NotificationBanner
          style={{ marginTop: 'var(--token-global-spacing-s16)' }}
          type="warning"
        >
          CORS (Cross Origin Sharing) is not available for endpoint types E2 and
          E3.{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/define-access-and-permissions-using-acls-access-control-lists">
            Learn more
          </Link>
          .
        </NotificationBanner>
      ) : null}

      <ActionsPanel
        primaryButtonProps={{
          disabled:
            bucketAccessIsFetching || objectAccessIsFetching || !isDirty,
          label: 'Save',
          processing: isSubmitting,
          'data-testid': 'save-access-changes',
          onClick: () => {
            if (selectedACL === 'public-read-write') {
              openDialog();
            } else {
              onSubmit();
            }
          },
        }}
        style={{ marginTop: 'var(--token-global-spacing-s24)' }}
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
