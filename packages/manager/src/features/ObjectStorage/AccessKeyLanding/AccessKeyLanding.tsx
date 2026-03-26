import { useErrors, useOpenClose } from '@linode/utilities';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  useDeleteAccessKeyMutation,
  useObjectStorageAccessKeys,
} from 'src/queries/object-storage/queries';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AccessKeyDrawer } from './AccessKeyDrawer';
import { AccessKeyTable } from './AccessKeyTable/AccessKeyTable';
import { RevokeAccessKeyDialog } from './RevokeAccessKeyDialog';
import { ViewPermissionsDrawer } from './ViewPermissionsDrawer';

import type { MODE, OpenAccessDrawer } from './types';
import type {
  CreateObjectStorageKeyPayload,
  ObjectStorageKey,
} from '@linode/api-v4/lib/object-storage';
import type { FormikBag } from 'formik';

interface Props {
  accessDrawerOpen: boolean;
  closeAccessDrawer: () => void;
  isRestrictedUser: boolean;
  mode: MODE;
  openAccessDrawer: (mode: MODE) => void;
}

export type FormikProps = FormikBag<Props, CreateObjectStorageKeyPayload>;

export const AccessKeyLanding = (props: Props) => {
  const {
    accessDrawerOpen,
    closeAccessDrawer,
    isRestrictedUser,
    mode,
    openAccessDrawer,
  } = props;

  const navigate = useNavigate();
  const pagination = usePaginationV2({
    currentRoute: '/object-storage/access-keys',
    initialPage: 1,
    preferenceKey: 'object-storage-keys-table',
  });

  const { data, error, isLoading } = useObjectStorageAccessKeys({
    page: pagination.page,
    page_size: pagination.pageSize,
  });
  const { mutateAsync: deleteAccessKey } = useDeleteAccessKeyMutation();

  // Key to rename (by clicking on a key's kebab menu )
  const [keyToEdit, setKeyToEdit] = React.useState<null | ObjectStorageKey>(
    null
  );

  // Key to revoke (by clicking on a key's kebab menu )
  const [keyToRevoke, setKeyToRevoke] = React.useState<null | ObjectStorageKey>(
    null
  );
  const [isRevoking, setIsRevoking] = React.useState<boolean>(false);
  const [revokeErrors, setRevokeErrors] = useErrors();

  const revokeKeysDialog = useOpenClose();

  // Redirect to base access keys route if current page has no data
  // TODO: Remove this implementation and replace `usePagination` with `usePaginate` hook. See [M3-10442]
  React.useEffect(() => {
    const currentPage = Number(pagination.page);

    // Only redirect if we have data, no results, and we're not on page 1
    if (
      !isLoading &&
      data &&
      (data.results === 0 || data.data.length === 0) &&
      currentPage > 1
    ) {
      navigate({
        to: '/object-storage/access-keys',
        search: { page: undefined, pageSize: undefined },
      });
    }
  }, [data, isLoading, pagination.page, navigate]);

  const handleRevokeKeys = () => {
    // This shouldn't happen, but just in case.
    if (!keyToRevoke) {
      return;
    }

    setIsRevoking(true);
    setRevokeErrors([]);

    deleteAccessKey(keyToRevoke.id)
      .then((_) => {
        setIsRevoking(false);

        revokeKeysDialog.close();
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
    objectStorageKey: null | ObjectStorageKey = null
  ) => {
    setKeyToEdit(objectStorageKey);
    if (mode !== 'creating') {
      openAccessDrawer(mode);
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

  return (
    <div>
      <DocumentTitleSegment
        segment={`${accessDrawerOpen ? `Create an Access Key` : `Access Keys`}`}
      />
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

      <AccessKeyDrawer
        isRestrictedUser={props.isRestrictedUser}
        mode={mode}
        objectStorageKey={keyToEdit ? keyToEdit : undefined}
        onClose={closeAccessDrawer}
        open={accessDrawerOpen}
      />

      <ViewPermissionsDrawer
        objectStorageKey={keyToEdit}
        onClose={closeAccessDrawer}
        open={mode === 'viewing' && accessDrawerOpen}
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
