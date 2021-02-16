import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
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
