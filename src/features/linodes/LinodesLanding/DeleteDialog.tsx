import * as React from 'react';
import { compose } from 'recompose';

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

type CombinedProps = Props;

const DeleteLinodeDialog: React.FC<CombinedProps> = props => {
  const [isDeleting, setDeleting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<
    Linode.ApiFieldError[] | undefined
  >(undefined);

  React.useEffect(() => {
    if (props.open) {
      /**
       * reset error state, username, and disabled status when we open the modal
       * intentionally not resetting comments
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
      .catch(e => {
        setErrors(e);
        setDeleting(false);
      });
  };

  return (
    <Dialog
      open={props.open}
      title={`Are you sure you want to delete ${props.linodeLabel}?`}
      onClose={props.onClose}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={props.onClose}
          loading={isDeleting}
          onSubmit={handleSubmit}
        />
      }
    >
      <Typography>
        Are you sure you want to delete your Linode? This will result in
        permanent data loss.
      </Typography>
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const Actions: React.FC<ActionsProps> = props => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="secondary">
        Cancel
      </Button>
      <Button
        onClick={props.onSubmit}
        loading={props.loading}
        destructive
        buttonType="secondary"
      >
        Delete
      </Button>
    </ActionsPanel>
  );
};

export default compose<CombinedProps, Props>(React.memo)(DeleteLinodeDialog);
