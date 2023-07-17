import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

interface Props {
  closeDialog: () => void;
  deleteClient: (id: number) => Promise<{}>;
  open: boolean;
  selectedLongviewClientID?: number;
  selectedLongviewClientLabel: string;
}

type CombinedProps = Props;

const LongviewDeleteDialog: React.FC<CombinedProps> = (props) => {
  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const {
    closeDialog,
    open,
    selectedLongviewClientID,
    selectedLongviewClientLabel: label,
  } = props;

  /** reset errors on open */
  React.useEffect(() => {
    if (open) {
      setErrors(undefined);
    }
  }, [open]);

  const handleDelete = () => {
    if (!selectedLongviewClientID) {
      return setErrors([
        {
          reason: 'There was an issue deleting this Longview Client.',
        },
      ]);
    }

    setDeleting(true);

    props
      .deleteClient(selectedLongviewClientID)
      .then(() => {
        setDeleting(false);
        closeDialog();
      })
      .catch((e: APIError[]) => {
        setDeleting(false);
        setErrors(e);
      });
  };

  return (
    <ConfirmationDialog
      actions={
        <Actions
          isDeleting={isDeleting}
          onClose={props.closeDialog}
          onSubmit={handleDelete}
        />
      }
      error={errors ? errors[0].reason : ''}
      onClose={props.closeDialog}
      open={open}
      title={`Delete ${label ? label : 'this Longview Client'}?`}
    >
      Are you sure you want to delete this Longview Client?
    </ConfirmationDialog>
  );
};

interface ActionsProps {
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const Actions: React.FC<ActionsProps> = (props) => {
  return (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={props.onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        data-testid="delete-button"
        loading={props.isDeleting}
        onClick={props.onSubmit}
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(LongviewDeleteDialog);
