import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import CopyableTextField from 'src/components/CopyableTextField';
import Box from 'src/components/core/Box';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import Notice from 'src/components/Notice';

interface Props {
  secretID?: string;
  secret: string;
  label: string;
  modalErrors?: APIError[];
  secretModalOpen: boolean;
  deleteModalOpen: boolean;
  secretSuccessOpen: boolean;
  closeDialogs: () => void;
  resetClient: (id?: string) => void;
  deleteClient: (id?: string) => void;
  isResetting: boolean;
  isDeleting: boolean;
}

const useStyles = makeStyles(() => ({
  key: {
    wordBreak: 'break-word',
  },
  noticeText: {
    '& .noticeText': {
      color: 'inherit',
      lineHeight: 'inherit',
      fontFamily: 'inherit',
      fontSize: '0.875rem',
    },
  },
}));

type CombinedProps = Props;

const Modals: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { modalErrors, label, resetClient, isResetting, closeDialogs } = props;

  return (
    <>
      <Dialog
        title="Client Secret"
        open={props.secretSuccessOpen}
        onClose={props.closeDialogs}
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="sm"
      >
        <Notice
          spacingTop={16}
          warning
          className={classes.noticeText}
          text={`For security purposes, we can only display your client secret once, after which it can't be recovered. Be sure to keep it in a safe place.`}
        />
        <Box marginBottom="16px">
          <CopyableTextField
            expand
            label="Client Secret"
            value={props.secret || ''}
          />
        </Box>
      </Dialog>

      <ConfirmationDialog
        error={modalErrors ? modalErrors[0].reason : undefined}
        title={`Delete ${label}?`}
        open={props.deleteModalOpen}
        actions={deleteDialogActions({
          loading: props.isDeleting,
          deleteSecret: () => props.deleteClient(props.secretID),
          closeDialogs,
        })}
        onClose={props.closeDialogs}
      >
        <Typography>
          Are you sure you want to permanently delete this app?
        </Typography>
      </ConfirmationDialog>

      <ConfirmationDialog
        error={modalErrors ? modalErrors[0].reason : undefined}
        title={`Reset secret for ${label}?`}
        open={props.secretModalOpen}
        actions={resetDialogActions({
          closeDialogs,
          resetSecret: () => resetClient(props.secretID),
          loading: isResetting,
        })}
        onClose={props.closeDialogs}
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
