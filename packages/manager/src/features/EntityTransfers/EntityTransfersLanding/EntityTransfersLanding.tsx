import { EntityTransfer } from '@linode/api-v4/lib/entity-transfers';
import { partition } from 'ramda';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
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

  const { data, isLoading, error: transfersError } = useEntityTransfersQuery();
  const allEntityTransfers = Object.values(data ?? {});

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
      <TransferControls />
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
