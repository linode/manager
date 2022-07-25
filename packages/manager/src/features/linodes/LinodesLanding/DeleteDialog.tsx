import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';

interface Props {
  linodeID?: number;
  linodeLabel?: string;
  onClose: () => void;
  open: boolean;
  handleDelete: (linodeID: number) => Promise<{}>;
}

const DeleteLinodeDialog = (props: Props) => {
  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  React.useEffect(() => {
    if (props.open) {
      /**
       * reset error and loading states
       */
      setErrors(undefined);
      setDeleting(false);
    }
  }, [props.open]);

  const handleSubmit = () => {
    if (!props.linodeID) {
      return setErrors([{ reason: 'Something went wrong.' }]);
    }

    setDeleting(true);

    props
      .handleDelete(props.linodeID)
      .then(() => {
        props.onClose();
      })
      .catch((e) => {
        setErrors(e);
        setDeleting(false);
      });
  };

  return (
    <Dialog
      open={props.open}
      title={`Delete Linode ${props.linodeLabel}?`}
      onClose={props.onClose}
      error={errors ? errors[0].reason : ''}
      actions={
        <ActionsPanel>
          <Button onClick={props.onClose} buttonType="secondary">
            Cancel
          </Button>
          <Button
            buttonType="primary"
            onClick={handleSubmit}
            loading={isDeleting}
          >
            Delete Linode
          </Button>
        </ActionsPanel>
      }
    >
      <Typography>
        Are you sure you want to delete this Linode? This will result in
        permanent data loss.
      </Typography>
    </Dialog>
  );
};

export default React.memo(DeleteLinodeDialog);
