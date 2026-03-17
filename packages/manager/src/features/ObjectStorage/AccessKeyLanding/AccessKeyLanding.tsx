import { revokeObjectStorageKey } from '@linode/api-v4/lib/object-storage';
import { useErrors, useOpenClose } from '@linode/utilities';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useObjectStorageAccessKeys } from 'src/queries/object-storage/queries';
import { sendRevokeAccessKeyEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { AccessKeyTable } from './AccessKeyTable/AccessKeyTable';
import { RevokeAccessKeyDialog } from './RevokeAccessKeyDialog';

import type { MODE, OpenAccessDrawer } from './types';
import type { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

export const AccessKeyLanding = () => {
  const navigate = useNavigate();
  const pagination = usePaginationV2({
    currentRoute: '/object-storage/access-keys',
    initialPage: 1,
    preferenceKey: 'object-storage-keys-table',
  });

  const { data, error, isLoading, refetch } = useObjectStorageAccessKeys({
    page: pagination.page,
    page_size: pagination.pageSize,
  });

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
    objectStorageKey: ObjectStorageKey
  ) => {
    let drawerUrl = `/object-storage/access-keys/${objectStorageKey.id}`;

    if (mode === 'editing') {
      drawerUrl += `/update`;
    }

    if (mode === 'viewing') {
      drawerUrl += `/details`;
    }

    navigate({ to: drawerUrl });
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
    <>
      <DocumentTitleSegment segment="Access Keys" />

      <AccessKeyTable
        data={data?.data}
        data-qa-access-key-table
        error={error}
        isLoading={isLoading}
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

      <RevokeAccessKeyDialog
        errors={revokeErrors}
        handleClose={closeRevokeDialog}
        handleSubmit={handleRevokeKeys}
        isLoading={isRevoking}
        isOpen={revokeKeysDialog.isOpen}
        label={keyToRevoke?.label || ''}
        numAccessKeys={data?.results || 0}
      />
    </>
  );
};
