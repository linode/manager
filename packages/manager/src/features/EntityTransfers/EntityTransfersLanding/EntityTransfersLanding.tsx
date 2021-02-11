import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ConfirmTransferDialog from './ConfirmTransferDialog';
import TransferControls from './TransferControls';

export const EntityTransfersLanding: React.FC<{}> = _ => {
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [token, setToken] = React.useState('');
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
        onClose={() => setConfirmDialogOpen(false)}
      />
    </>
  );
};

export default EntityTransfersLanding;
