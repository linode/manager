import { TRANSFER_FILTERS, useEntityTransfersQuery } from '@linode/queries';
import { CircleProgress } from '@linode/ui';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { TransfersTable } from '../TransfersTable';
import { CreateTransferSuccessDialog } from './CreateTransferSuccessDialog';
import { TransferControls } from './TransferControls';

import type { EntityTransfer } from '@linode/api-v4';

export const EntityTransfersLanding = () => {
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(true);
  const [transfer, setTransfer] = React.useState<EntityTransfer | undefined>(
    undefined
  );

  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFlags();

  const url = flags?.iamRbacPrimaryNavChanges
    ? '/service-transfers'
    : '/account/service-transfers';

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    setTransfer(undefined);
    navigate({
      to: url,
      state: (prev) => ({ ...prev, transfer: undefined }),
    });
  };

  const locationState = location.state as { transfer?: EntityTransfer };

  React.useEffect(() => {
    if (locationState?.transfer) {
      setSuccessDialogOpen(true);
      setTransfer(locationState.transfer);
    }
  }, [location]);

  const initialPage = 1;
  // Three separate preference keys to allow users to set the page size they want for each individual table.
  const pendingTransfersTablePreferenceKey = 'pending-transfers-table';
  const receivedTransfersTablePreferenceKey = 'received-transfers-table';
  const sentTransfersTablePreferenceKey = 'sent-transfers-table';

  const paginationPendingTransfers = usePaginationV2({
    initialPage,
    currentRoute: url,
    preferenceKey: pendingTransfersTablePreferenceKey,
    queryParamsPrefix: pendingTransfersTablePreferenceKey,
  });
  const paginationReceivedTransfers = usePaginationV2({
    initialPage,
    currentRoute: url,
    preferenceKey: receivedTransfersTablePreferenceKey,
    queryParamsPrefix: receivedTransfersTablePreferenceKey,
  });
  const paginationSentTransfers = usePaginationV2({
    initialPage,
    currentRoute: url,
    preferenceKey: sentTransfersTablePreferenceKey,
    queryParamsPrefix: sentTransfersTablePreferenceKey,
  });

  // Fetch the Pending Transfers
  const {
    data: pendingTransfersData,
    error: pendingTransfersError,
    isLoading: pendingTransfersLoading,
  } = useEntityTransfersQuery(
    {
      page: paginationPendingTransfers.page,
      page_size: paginationPendingTransfers.pageSize,
    },
    TRANSFER_FILTERS.pending
  );
  const pendingTransfers = Object.values(
    pendingTransfersData?.entityTransfers ?? {}
  );
  const pendingTransfersResults = pendingTransfersData?.results ?? 0;

  // Fetch the Received Transfers
  const {
    data: receivedTransfersData,
    error: receivedTransfersError,
    isLoading: receivedTransfersLoading,
  } = useEntityTransfersQuery(
    {
      page: paginationReceivedTransfers.page,
      page_size: paginationReceivedTransfers.pageSize,
    },
    TRANSFER_FILTERS.received
  );
  const receivedTransfers = Object.values(
    receivedTransfersData?.entityTransfers ?? {}
  );

  const receivedTransfersResults = receivedTransfersData?.results ?? 0;

  // Fetch the Sent Transfers
  const {
    data: sentTransfersData,
    error: sentTransfersError,
    isLoading: sentTransfersLoading,
  } = useEntityTransfersQuery(
    {
      page: paginationSentTransfers.page,
      page_size: paginationSentTransfers.pageSize,
    },
    TRANSFER_FILTERS.sent
  );
  const sentTransfers = Object.values(sentTransfersData?.entityTransfers ?? {});
  const sentTransfersResults = sentTransfersData?.results ?? 0;

  const { data: permissions } = usePermissions('account', [
    'accept_service_transfer',
    'create_service_transfer',
    'cancel_service_transfer',
  ]);

  return (
    <div style={{ overflowX: 'hidden' }}>
      <TransferControls permissions={permissions} />
      <CreateTransferSuccessDialog
        isOpen={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        transfer={transfer}
      />
      {pendingTransfersLoading ||
      receivedTransfersLoading ||
      sentTransfersLoading ? (
        <CircleProgress />
      ) : (
        <>
          {pendingTransfersResults > 0 ? (
            <TransfersTable
              error={pendingTransfersError}
              handlePageChange={paginationPendingTransfers.handlePageChange}
              handlePageSizeChange={
                paginationPendingTransfers.handlePageSizeChange
              }
              isLoading={pendingTransfersLoading}
              page={paginationPendingTransfers.page}
              pageSize={paginationPendingTransfers.pageSize}
              permissions={permissions}
              results={pendingTransfersResults}
              transfers={pendingTransfers}
              transferType="pending"
            />
          ) : null}
          <TransfersTable
            error={receivedTransfersError}
            handlePageChange={paginationReceivedTransfers.handlePageChange}
            handlePageSizeChange={
              paginationReceivedTransfers.handlePageSizeChange
            }
            isLoading={receivedTransfersLoading}
            page={paginationReceivedTransfers.page}
            pageSize={paginationReceivedTransfers.pageSize}
            results={receivedTransfersResults}
            transfers={receivedTransfers}
            transferType="received"
          />
          <TransfersTable
            error={sentTransfersError}
            handlePageChange={paginationSentTransfers.handlePageChange}
            handlePageSizeChange={paginationSentTransfers.handlePageSizeChange}
            isLoading={sentTransfersLoading}
            page={paginationSentTransfers.page}
            pageSize={paginationSentTransfers.pageSize}
            results={sentTransfersResults}
            transfers={sentTransfers}
            transferType="sent"
          />
        </>
      )}
    </div>
  );
};
