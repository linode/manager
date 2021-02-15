import { EntityTransfer } from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ConfirmTransferDialog from './ConfirmTransferDialog';
import CreateTransferSuccessDialog from './CreateTransferSuccessDialog';
import TransferControls from './TransferControls';

export const EntityTransfersLanding: React.FC<{}> = _ => {
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [token, setToken] = React.useState('');
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(true);
  const [transfer, setTransfer] = React.useState<EntityTransfer | undefined>(
    undefined
  );

  const location = useLocation();
  const history = useHistory();

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    // I don't love the UX here but it seems better than leaving a token in the input
    setTimeout(() => setToken(''), 150);
  };

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
        transfer={transfer}
        onClose={handleCloseSuccessDialog}
      />
    </>
  );
};

export default EntityTransfersLanding;
