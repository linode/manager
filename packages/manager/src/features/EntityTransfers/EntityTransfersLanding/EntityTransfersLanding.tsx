import { EntityTransfer } from '@linode/api-v4/lib/entity-transfers';
import { useHistory, useLocation } from 'react-router-dom';
import { partition } from 'ramda';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import { useEntityTransfersQuery } from 'src/queries/entityTransfers';
import TransfersTable from '../TransfersTable';
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

  const {
    data: allEntityTransfers,
    isLoading,
    error: transfersError
  } = useEntityTransfersQuery();

  let [sentTransfers, receivedTransfers] = partition(
    transfer => transfer.is_sender,
    allEntityTransfers ?? []
  );
  sentTransfers = sentTransfers.filter(
    transfer => transfer.status !== 'pending'
  );
  receivedTransfers = receivedTransfers.filter(
    transfer => transfer.status !== 'pending'
  );

  const pendingTransfers = allEntityTransfers?.filter(
    transfer => transfer.status === 'pending'
  );
  const numPendingTransfers = pendingTransfers?.length ?? 0;

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
      {isLoading ? (
        <CircleProgress />
      ) : transfersError ? (
        <ErrorState errorText={transfersError[0].reason} />
      ) : (
        <>
          {numPendingTransfers > 0 ? (
            <TransfersTable
              transferType="pending"
              error={transfersError}
              isLoading={isLoading}
              transfers={pendingTransfers}
            />
          ) : null}
          <TransfersTable
            transferType="received"
            error={transfersError}
            isLoading={isLoading}
            transfers={receivedTransfers}
          />
          <TransfersTable
            transferType="sent"
            error={transfersError}
            isLoading={isLoading}
            transfers={sentTransfers}
          />
        </>
      )}
    </>
  );
};

export default EntityTransfersLanding;
