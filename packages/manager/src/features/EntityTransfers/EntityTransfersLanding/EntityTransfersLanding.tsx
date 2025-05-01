import { CircleProgress } from '@linode/ui';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { usePagination } from 'src/hooks/usePagination';
import {
  TRANSFER_FILTERS,
  useEntityTransfersQuery,
} from 'src/queries/entityTransfers';

import { TransfersTable } from '../TransfersTable';
import { CreateTransferSuccessDialog } from './CreateTransferSuccessDialog';
import { TransferControls } from './TransferControls';

import type { EntityTransfer } from '@linode/api-v4/lib/entity-transfers';

export const EntityTransfersLanding = () => {
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(true);
  const [transfer, setTransfer] = React.useState<EntityTransfer | undefined>(
    undefined
  );

  const location = useLocation<{ transfer?: EntityTransfer }>();
  const history = useHistory();

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    setTransfer(undefined);
    history.replace({ state: undefined });
  };

  React.useEffect(() => {
    if (location.state?.transfer) {
      setSuccessDialogOpen(true);
      setTransfer(location.state.transfer);
    }
  }, [location]);

  const initialPage = 1;
  // Three separate preference keys to allow users to set the page size they want for each individual table.
  const pendingTransfersTablePreferenceKey = 'pending-transfers-table';
  const receivedTransfersTablePreferenceKey = 'received-transfers-table';
  const sentTransfersTablePreferenceKey = 'sent-transfers-table';

  const paginationPendingTransfers = usePagination(
    initialPage,
    pendingTransfersTablePreferenceKey,
    pendingTransfersTablePreferenceKey
  );
  const paginationReceivedTransfers = usePagination(
    initialPage,
    receivedTransfersTablePreferenceKey,
    receivedTransfersTablePreferenceKey
  );
  const paginationSentTransfers = usePagination(
    initialPage,
    sentTransfersTablePreferenceKey,
    sentTransfersTablePreferenceKey
  );

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

  return (
    <div style={{ overflowX: 'hidden' }}>
      <DocumentTitleSegment segment="Transfers" />
      <TransferControls />
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
