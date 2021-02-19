import { EntityTransfer } from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import usePagination from 'src/hooks/usePagination';
import { useEntityTransfersQuery } from 'src/queries/entityTransfers';
import TransfersTable from '../TransfersTable';
import CreateTransferSuccessDialog from './CreateTransferSuccessDialog';
import TransferControls from './TransferControls';

export const EntityTransfersLanding: React.FC<{}> = _ => {
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(true);
  const [transfer, setTransfer] = React.useState<EntityTransfer | undefined>(
    undefined
  );

  const location = useLocation();
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

  const paginationPendingTransfers = usePagination();
  const paginationReceivedTransfers = usePagination();
  const paginationSentTransfers = usePagination();

  // Fetch the Pending Transfers
  const {
    data: pendingTransfersData,
    isLoading: pendingTransfersLoading,
    error: pendingTransfersError
  } = useEntityTransfersQuery(
    {
      page: paginationPendingTransfers.page,
      page_size: paginationPendingTransfers.pageSize,
      handlePageChange: paginationPendingTransfers.handlePageChange
    },
    {
      status: 'pending',
      is_sender: true
    }
  );
  const pendingTransfers = Object.values(
    pendingTransfersData?.entityTransfers ?? {}
  );
  const numPendingTransfers = pendingTransfersData?.results ?? 0;

  // Fetch the Received Transfers
  const {
    data: receivedTransfersData,
    isLoading: receivedTransfersLoading,
    error: receivedTransfersError
  } = useEntityTransfersQuery(
    {
      page: paginationReceivedTransfers.page,
      page_size: paginationReceivedTransfers.pageSize,
      handlePageChange: paginationReceivedTransfers.handlePageChange
    },
    {
      status: 'received'
    }
  );
  const receivedTransfers = Object.values(
    receivedTransfersData?.entityTransfers ?? {}
  );

  // Fetch the Sent Transfers
  const {
    data: sentTransfersData,
    isLoading: sentTransfersLoading,
    error: sentTransfersError
  } = useEntityTransfersQuery(
    {
      page: paginationSentTransfers.page,
      page_size: paginationSentTransfers.pageSize,
      handlePageChange: paginationSentTransfers.handlePageChange
    },
    {
      is_sender: true,
      status: { '+neq': 'pending' }
    }
  );
  const sentTransfers = Object.values(sentTransfersData?.entityTransfers ?? {});

  return (
    <div style={{ overflowX: 'hidden' }}>
      <DocumentTitleSegment segment="Transfers" />
      <TransferControls />
      <CreateTransferSuccessDialog
        isOpen={successDialogOpen}
        transfer={transfer}
        onClose={handleCloseSuccessDialog}
      />
      {numPendingTransfers > 0 ? (
        <TransfersTable
          transferType="pending"
          error={pendingTransfersError}
          isLoading={pendingTransfersLoading}
          transfers={pendingTransfers}
          page={paginationPendingTransfers.page}
          pageSize={paginationPendingTransfers.pageSize}
          handlePageChange={paginationPendingTransfers.handlePageChange}
        />
      ) : null}
      <TransfersTable
        transferType="received"
        error={receivedTransfersError}
        isLoading={receivedTransfersLoading}
        transfers={receivedTransfers}
        page={paginationReceivedTransfers.page}
        pageSize={paginationReceivedTransfers.pageSize}
        handlePageChange={paginationReceivedTransfers.handlePageChange}
      />
      <TransfersTable
        transferType="sent"
        error={sentTransfersError}
        isLoading={sentTransfersLoading}
        transfers={sentTransfers}
        page={paginationSentTransfers.page}
        pageSize={paginationSentTransfers.pageSize}
        handlePageChange={paginationSentTransfers.handlePageChange}
      />
    </div>
  );
};

export default EntityTransfersLanding;
