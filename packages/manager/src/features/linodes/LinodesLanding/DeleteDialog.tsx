import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TypeToConfirm from 'src/components/TypeToConfirm';
import usePreferences from 'src/hooks/usePreferences';

interface Props {
  linodeID?: number;
  linodeLabel?: string;
  open: boolean;
  onClose: () => void;
  handleDelete: (linodeID: number) => Promise<{}>;
}

type CombinedProps = Props;

const DeleteLinodeDialog: React.FC<CombinedProps> = (props) => {
  const { linodeID, linodeLabel, open, onClose, handleDelete } = props;

  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [confirmText, setConfirmText] = React.useState('');

  const { preferences } = usePreferences();

  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== linodeLabel;

  React.useEffect(() => {
    if (open) {
      /**
       * reset error and loading states
       */
      setErrors(undefined);
      setDeleting(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!linodeID) {
      return setErrors([{ reason: 'Something went wrong.' }]);
    }

    setDeleting(true);

    handleDelete(linodeID)
      .then(() => {
        onClose();
      })
      .catch((e) => {
        setErrors(e);
        setDeleting(false);
      });
  };

  const confirmationActions = (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel-delete>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        loading={isDeleting}
        disabled={disabled}
        onClick={handleSubmit}
        data-qa-confirm-delete
      >
        Delete
      </Button>
    </ActionsPanel>
  );

  return (
    <Dialog
      open={open}
      title={`Delete Linode ${linodeLabel}?`}
      onClose={onClose}
      error={errors ? errors[0].reason : ''}
      actions={confirmationActions}
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting your Linode will result in
          permanent data loss.
        </Typography>
      </Notice>
      <TypeToConfirm
        label="Linode Label"
        confirmationText={
          <span>
            To confirm deletion, type the name of the Linode (
            <b>{linodeLabel}</b>) in the field below:
          </span>
        }
        value={confirmText}
        data-testid={'dialog-confirm-text-input'}
        expand
        onChange={(input) => {
          setConfirmText(input);
        }}
        visible={preferences?.type_to_confirm}
      />
    </Dialog>
  );
};

export default compose<CombinedProps, Props>(React.memo)(DeleteLinodeDialog);
