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

  const receivedTransfers = allEntityTransfers?.filter(
    transfer => !transfer.is_sender
  );

  const sentTransfers = allEntityTransfers?.filter(
    transfer => transfer.is_sender
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
    </>
  );
};

export default EntityTransfersLanding;
