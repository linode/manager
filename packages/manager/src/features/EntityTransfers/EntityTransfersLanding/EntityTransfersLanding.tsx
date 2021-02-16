import { partition } from 'ramda';
import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useEntityTransfersQuery } from 'src/queries/entityTransfers';
import TransfersTable from '../TransfersTable';
import ConfirmTransferDialog from './ConfirmTransferDialog';
import CreateTransferSuccessDialog from './CreateTransferSuccessDialog';
import TransferControls from './TransferControls';

export const EntityTransfersLanding: React.FC<{}> = _ => {
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [token, setToken] = React.useState('');
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(true);

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    // I don't love the UX here but it seems better than leaving a token in the input
    setTimeout(() => setToken(''), 150);
  };

  const {
    data: allEntityTransfers,
    isLoading,
    error
  } = useEntityTransfersQuery();

  const pendingTransfers = allEntityTransfers?.filter(
    transfer => transfer.status === 'pending'
  );
  const numPendingTransfers = pendingTransfers?.length ?? 0;

  const [sentTransfers, receivedTransfers] = partition(
    transfer => transfer.is_sender,
    allEntityTransfers ?? []
  );

  return (
    <>
      <DocumentTitleSegment segment="Transfers" />
      <TransferControls
        token={token}
        openConfirmTransferDialog={() => setConfirmDialogOpen(true)}
        onTokenInput={setToken}
      />
      <ConfirmTransferDialog
        open={confirmDialogOpen}
        token={token}
        onClose={handleCloseDialog}
      />
      <CreateTransferSuccessDialog
        isOpen={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
      />
      {numPendingTransfers > 0 ? (
        <TransfersTable
          transferType="pending"
          error={error}
          isLoading={isLoading}
          transfers={pendingTransfers}
        />
      ) : null}
      <TransfersTable
        transferType="received"
        error={error}
        isLoading={isLoading}
        transfers={receivedTransfers}
      />
      <TransfersTable
        transferType="sent"
        error={error}
        isLoading={isLoading}
        transfers={sentTransfers}
      />
    </>
  );
};

export default EntityTransfersLanding;
