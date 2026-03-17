import { useProfile } from '@linode/queries';
import { useOpenClose } from '@linode/utilities';
import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { SecretTokenDialog } from 'src/features/Profile/SecretTokenDialog/SecretTokenDialog';
import {
  useCreateAccessKeyMutation,
  useObjectStorageAccessKey,
  useUpdateAccessKeyMutation,
} from 'src/queries/object-storage/queries';
import {
  sendCreateAccessKeyEvent,
  sendEditAccessKeyEvent,
} from 'src/utilities/analytics/customEventAnalytics';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

import { AccessKeyDrawer } from '../AccessKeyLanding/AccessKeyDrawer';
import { OMC_AccessKeyDrawer } from '../AccessKeyLanding/OMC_AccessKeyDrawer';
import { useIsObjMultiClusterEnabled } from '../hooks/useIsObjectStorageGen2Enabled';
import { AccessKeyPermissionsDrawer } from './AccessKeyPermissionsDrawer';

import type {
  CreateObjectStorageKeyPayload,
  ObjectStorageKey,
  UpdateObjectStorageKeyPayload,
} from '@linode/api-v4/lib/object-storage';
import type { FormikHelpers } from 'formik';

export const AccessKeyDrawers = () => {
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });
  const { accessKeyId } = useParams({ strict: false });

  const { data: profile } = useProfile();
  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();

  const isRestrictedUser = !!profile?.restricted;
  const isCreating = routeId.endsWith('/access-keys/create');
  const mode = isCreating ? 'creating' : 'editing';

  // TODO: Move into the drawer component itself
  const isCreateEditOpened =
    isCreating || routeId.endsWith(`$accessKeyId/update`);

  const isPermissionsOpened = routeId.endsWith(`$accessKeyId/details`);

  const displayKeysDialog = useOpenClose();

  // Key to display in Confirmation Modal upon creation
  const [keyToDisplay, setKeyToDisplay] =
    React.useState<null | ObjectStorageKey>(null);

  const { data: accessKey } = useObjectStorageAccessKey(accessKeyId || -1);
  const { mutateAsync: createAccessKey } = useCreateAccessKeyMutation();
  const { mutateAsync: updateAccessKey } = useUpdateAccessKeyMutation();

  const onClose = () => navigate({ to: '/object-storage/access-keys' });

  const handleCreateKey = (
    values: CreateObjectStorageKeyPayload,
    {
      setErrors,
      setStatus,
      setSubmitting,
    }: FormikHelpers<CreateObjectStorageKeyPayload>
  ) => {
    // Clear out status (used for general errors)
    setStatus(null);
    setSubmitting(true);

    createAccessKey(values)
      .then((data) => {
        setSubmitting(false);
        setKeyToDisplay(data);

        onClose();
        displayKeysDialog.open();

        // @analytics
        sendCreateAccessKeyEvent();
      })
      .catch((errorResponse) => {
        setSubmitting(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue creating your Access Key.'
        );
        const mappedErrors = getErrorMap(['label'], errors);

        // `status` holds general errors
        if (mappedErrors.none) {
          setStatus(mappedErrors.none);
        }

        setErrors(mappedErrors);
      });
  };

  const handleEditKey = (
    values: UpdateObjectStorageKeyPayload,
    {
      setErrors,
      setStatus,
      setSubmitting,
    }: FormikHelpers<UpdateObjectStorageKeyPayload>
  ) => {
    // This shouldn't happen, but just in case.
    if (!accessKey) {
      onClose();
      return;
    }

    // Clear out status (used for general errors)
    setStatus(null);

    // If the new label is the same as the old one, no need to make an API
    // request. Just close the drawer and return early.
    if (values.label === accessKey.label) {
      onClose();
      return;
    }

    setSubmitting(true);

    updateAccessKey({
      id: accessKey.id,
      data: isObjMultiClusterEnabled ? values : { label: values.label },
    })
      .then(() => {
        setSubmitting(false);

        onClose();

        // @analytics
        sendEditAccessKeyEvent();
      })
      .catch((errorResponse) => {
        setSubmitting(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue updating your Access Key.'
        );
        const mappedErrors = getErrorMap(['label'], errors);

        // `status` holds general errors
        if (mappedErrors.none) {
          setStatus(mappedErrors.none);
        }

        setErrors(mappedErrors);
      });
  };

  return (
    <>
      {isObjMultiClusterEnabled ? (
        <OMC_AccessKeyDrawer
          isRestrictedUser={isRestrictedUser}
          mode={mode}
          objectStorageKey={mode === 'creating' ? undefined : accessKey}
          onClose={onClose}
          onSubmit={mode === 'creating' ? handleCreateKey : handleEditKey}
          open={isCreateEditOpened}
        />
      ) : (
        <AccessKeyDrawer
          isRestrictedUser={isRestrictedUser}
          mode={mode}
          objectStorageKey={mode === 'creating' ? undefined : accessKey}
          onClose={onClose}
          onSubmit={mode === 'creating' ? handleCreateKey : handleEditKey}
          open={isCreateEditOpened}
        />
      )}

      {accessKey && (
        <AccessKeyPermissionsDrawer
          isOpened={isPermissionsOpened}
          objcetStorageKey={accessKey}
          onClose={onClose}
        />
      )}

      {/* TODO: Move into the drawer component itself */}
      <SecretTokenDialog
        objectStorageKey={keyToDisplay}
        onClose={displayKeysDialog.close}
        open={displayKeysDialog.isOpen}
        title="Access Keys"
      />
    </>
  );
};
