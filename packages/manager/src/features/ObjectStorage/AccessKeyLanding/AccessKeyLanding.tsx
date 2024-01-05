import {
  ObjectStorageKey,
  ObjectStorageKeyRequest,
  createObjectStorageKeys,
  revokeObjectStorageKey,
  updateObjectStorageKey,
} from '@linode/api-v4/lib/object-storage';
import { FormikBag } from 'formik';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { SecretTokenDialog } from 'src/features/Profile/SecretTokenDialog/SecretTokenDialog';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useErrors } from 'src/hooks/useErrors';
import { useFlags } from 'src/hooks/useFlags';
import { useOpenClose } from 'src/hooks/useOpenClose';
import { usePagination } from 'src/hooks/usePagination';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useObjectStorageAccessKeys } from 'src/queries/objectStorage';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import {
  sendCreateAccessKeyEvent,
  sendEditAccessKeyEvent,
  sendRevokeAccessKeyEvent,
} from 'src/utilities/analytics';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

import { AccessKeyDrawer } from './AccessKeyDrawer';
import { AccessKeyTable } from './AccessKeyTable';
import { OMC_AccessKeyDrawer } from './OMC_AccessKeyDrawer';
import { RevokeAccessKeyDialog } from './RevokeAccessKeyDialog';
import ViewPermissionsDrawer from './ViewPermissionsDrawer';
import { MODE, OpenAccessDrawer } from './types';

interface Props {
  accessDrawerOpen: boolean;
  closeAccessDrawer: () => void;
  isRestrictedUser: boolean;
  mode: MODE;
  openAccessDrawer: (mode: MODE) => void;
}

export type FormikProps = FormikBag<Props, ObjectStorageKeyRequest>;

export const AccessKeyLanding = (props: Props) => {
  const {
    accessDrawerOpen,
    closeAccessDrawer,
    isRestrictedUser,
    mode,
    openAccessDrawer,
  } = props;

  const pagination = usePagination(1);

  const { data, error, isLoading, refetch } = useObjectStorageAccessKeys({
    page: pagination.page,
    page_size: pagination.pageSize,
  });

  const {
    data: accountSettings,
    refetch: requestAccountSettings,
  } = useAccountSettings();

  // Key to display in Confirmation Modal upon creation
  const [
    keyToDisplay,
    setKeyToDisplay,
  ] = React.useState<ObjectStorageKey | null>(null);

  // Key to rename (by clicking on a key's kebab menu )
  const [keyToEdit, setKeyToEdit] = React.useState<ObjectStorageKey | null>(
    null
  );

  // Key to revoke (by clicking on a key's kebab menu )
  const [keyToRevoke, setKeyToRevoke] = React.useState<ObjectStorageKey | null>(
    null
  );
  const [isRevoking, setIsRevoking] = React.useState<boolean>(false);
  const [revokeErrors, setRevokeErrors] = useErrors();

  const displayKeysDialog = useOpenClose();
  const revokeKeysDialog = useOpenClose();
  const viewPermissionsDrawer = useOpenClose();
  const flags = useFlags();
  const { account } = useAccountManagement();

  const handleCreateKey = (
    values: ObjectStorageKeyRequest,
    { setErrors, setStatus, setSubmitting }: FormikProps
  ) => {
    // Clear out status (used for general errors)
    setStatus(null);
    setSubmitting(true);

    createObjectStorageKeys(values)
      .then((data) => {
        setSubmitting(false);

        setKeyToDisplay(data);

        // "Refresh" keys to include the newly created key
        refetch();

        props.closeAccessDrawer();
        displayKeysDialog.open();

        // If our Redux Store says that the user doesn't have OBJ enabled,
        // it probably means they have just enabled it with the creation
        // of this key. In that case, update the Redux Store so that
        // subsequently created keys don't need to go through the
        // confirmation flow.
        if (accountSettings?.object_storage === 'disabled') {
          requestAccountSettings();
        }

        // @analytics
        sendCreateAccessKeyEvent();
      })
      .catch((errorResponse) => {
        // We also need to refresh account settings on failure, since, depending
        // on the error, Object Storage service might have actually been enabled.
        if (accountSettings?.object_storage === 'disabled') {
          requestAccountSettings();
        }

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
    values: ObjectStorageKeyRequest,
    { setErrors, setStatus, setSubmitting }: FormikProps
  ) => {
    // This shouldn't happen, but just in case.
    if (!keyToEdit) {
      return;
    }

    // Clear out status (used for general errors)
    setStatus(null);

    // If the new label is the same as the old one, no need to make an API
    // request. Just close the drawer and return early.
    if (values.label === keyToEdit.label) {
      return closeAccessDrawer();
    }

    setSubmitting(true);

    updateObjectStorageKey(keyToEdit.id, { label: values.label })
      .then((_) => {
        setSubmitting(false);

        // "Refresh" keys to display the newly updated key
        refetch();

        closeAccessDrawer();

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

  const handleRevokeKeys = () => {
    // This shouldn't happen, but just in case.
    if (!keyToRevoke) {
      return;
    }

    setIsRevoking(true);
    setRevokeErrors([]);

    revokeObjectStorageKey(keyToRevoke.id)
      .then((_) => {
        setIsRevoking(false);

        // "Refresh" keys to remove the newly revoked key
        refetch();

        revokeKeysDialog.close();

        // @analytics
        sendRevokeAccessKeyEvent();
      })
      .catch((errorResponse) => {
        setIsRevoking(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue revoking your Access Key.'
        );
        setRevokeErrors(errors);
      });
  };

  const openDrawer: OpenAccessDrawer = (
    mode: MODE,
    objectStorageKey: ObjectStorageKey | null = null
  ) => {
    setKeyToEdit(objectStorageKey);
    switch (mode) {
      case 'creating':
      case 'editing':
        openAccessDrawer(mode);
        break;
      case 'viewing':
        viewPermissionsDrawer.open();
    }
  };

  const openRevokeDialog = (objectStorageKey: ObjectStorageKey) => {
    setKeyToRevoke(objectStorageKey);
    revokeKeysDialog.open();
  };

  const closeRevokeDialog = () => {
    setRevokeErrors([]);
    revokeKeysDialog.close();
  };

  const isObjMultiClusterFlagEnabled = isFeatureEnabled(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  return (
    <div>
      <DocumentTitleSegment segment="Access Keys" />
      <AccessKeyTable
        data={data?.data}
        data-qa-access-key-table
        error={error}
        isLoading={isLoading}
        isRestrictedUser={isRestrictedUser}
        openDrawer={openDrawer}
        openRevokeDialog={openRevokeDialog}
      />
      <PaginationFooter
        count={data?.results || 0}
        eventCategory="object storage keys table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      {isObjMultiClusterFlagEnabled ? (
        <OMC_AccessKeyDrawer
          isRestrictedUser={props.isRestrictedUser}
          mode={mode}
          objectStorageKey={keyToEdit ? keyToEdit : undefined}
          onClose={closeAccessDrawer}
          onSubmit={mode === 'creating' ? handleCreateKey : handleEditKey}
          open={accessDrawerOpen}
        />
      ) : (
        <AccessKeyDrawer
          isRestrictedUser={props.isRestrictedUser}
          mode={mode}
          objectStorageKey={keyToEdit ? keyToEdit : undefined}
          onClose={closeAccessDrawer}
          onSubmit={mode === 'creating' ? handleCreateKey : handleEditKey}
          open={accessDrawerOpen}
        />
      )}

      <ViewPermissionsDrawer
        objectStorageKey={keyToEdit}
        onClose={viewPermissionsDrawer.close}
        open={viewPermissionsDrawer.isOpen}
      />
      <SecretTokenDialog
        objectStorageKey={keyToDisplay}
        onClose={displayKeysDialog.close}
        open={displayKeysDialog.isOpen}
        title="Access Keys"
      />
      <RevokeAccessKeyDialog
        errors={revokeErrors}
        handleClose={closeRevokeDialog}
        handleSubmit={handleRevokeKeys}
        isLoading={isRevoking}
        isOpen={revokeKeysDialog.isOpen}
        label={keyToRevoke?.label || ''}
        numAccessKeys={data?.results || 0}
      />
    </div>
  );
};
