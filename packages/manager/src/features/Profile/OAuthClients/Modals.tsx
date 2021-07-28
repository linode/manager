import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import SecretTokenDialog from 'src/features/Profile/SecretTokenDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface Props {
  secretID?: string;
  secret: string;
  label: string;
  modalErrors?: APIError[];
  secretModalOpen: boolean;
  deleteModalOpen: boolean;
  secretSuccessOpen: boolean;
  isResetting: boolean;
  isDeleting: boolean;
  closeDialogs: () => void;
  resetClient: (id?: string) => void;
  deleteClient: (id?: string) => void;
}

type CombinedProps = Props;

const Modals: React.FC<CombinedProps> = (props) => {
  const {
    secretID,
    secret,
    label,
    modalErrors,
    secretModalOpen,
    deleteModalOpen,
    secretSuccessOpen,
    isResetting,
    isDeleting,
    closeDialogs,
    resetClient,
    deleteClient,
  } = props;

  return (
    <>
      <SecretTokenDialog
        title="Client Secret"
        open={secretSuccessOpen}
        onClose={closeDialogs}
        value={secret}
      />

      <ConfirmationDialog
        error={modalErrors ? modalErrors[0].reason : undefined}
        title={`Delete ${label}?`}
        open={deleteModalOpen}
        actions={deleteDialogActions({
          loading: isDeleting,
          deleteSecret: () => deleteClient(secretID),
          closeDialogs,
        })}
        onClose={closeDialogs}
      >
        <Typography>
          Are you sure you want to permanently delete this app?
        </Typography>
      </ConfirmationDialog>

      <ConfirmationDialog
        error={modalErrors ? modalErrors[0].reason : undefined}
        title={`Reset secret for ${label}?`}
        open={secretModalOpen}
        actions={resetDialogActions({
          closeDialogs,
          resetSecret: () => resetClient(secretID),
          loading: isResetting,
        })}
        onClose={closeDialogs}
      >
        <Typography>
          Are you sure you want to permanently reset the secret for this app?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default compose<CombinedProps, Props>(React.memo)(Modals);

interface ActionsProps {
  resetSecret: () => void;
  closeDialogs: () => void;
  loading: boolean;
}

const resetDialogActions = ({
  closeDialogs,
  resetSecret,
  loading,
}: ActionsProps) => {
  return (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={closeDialogs}
        data-qa-button-cancel
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={resetSecret}
        loading={loading}
        data-qa-button-confirm
      >
        Reset Secret
      </Button>
    </ActionsPanel>
  );
};

interface DeleteActionsProps {
  deleteSecret: () => void;
  closeDialogs: () => void;
  loading: boolean;
}

const deleteDialogActions = ({
  loading,
  deleteSecret,
  closeDialogs,
}: DeleteActionsProps) => {
  return (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={closeDialogs}
        data-qa-button-cancel
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={deleteSecret}
        data-qa-button-confirm
        loading={loading}
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};
