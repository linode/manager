import * as React from 'react';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  confirmationCopy: {
    marginTop: theme.spacing(1)
  }
}));

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
  const [confirmationText, setConfirmationText] = React.useState<string>('');

  const classes = useStyles();

  React.useEffect(() => {
    if (props.open) {
      /**
       * reset error and loading states
       */
      setErrors(undefined);
      setDeleting(false);
      setConfirmationText('');
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
          disabled={confirmationText !== props.linodeLabel}
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
      <Typography className={classes.confirmationCopy}>
        To confirm deletion, type the name of the Linode ({props.linodeLabel})
        in the field below:
      </Typography>
      <TextField
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmationText(e.target.value)
        }
        expand
      />
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}

const Actions: React.FC<ActionsProps> = props => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="secondary">
        Cancel
      </Button>
      <Button
        disabled={props.disabled}
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
