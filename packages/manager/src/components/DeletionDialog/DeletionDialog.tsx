import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { titlecase } from 'src/features/linodes/presentation';
import { capitalize } from 'src/utilities/capitalize';

interface Props {
  open: boolean;
  error?: string;
  entity: string;
  onClose: () => void;
  onDelete: () => void;
  label: string;
  loading: boolean;
  typeToConfirm?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(),
  },
}));

type CombinedProps = Props;

const DeletionDialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const {
    entity,
    error,
    label,
    onClose,
    onDelete,
    open,
    loading,
    typeToConfirm,
  } = props;
  const [confirmationText, setConfirmationText] = React.useState('');
  const renderActions = () => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onDelete}
        disabled={typeToConfirm && confirmationText !== label}
        loading={loading}
        data-qa-confirm
        data-testid="delete-btn"
      >
        Delete {titlecase(entity)}
      </Button>
    </ActionsPanel>
  );

  React.useEffect(() => {
    /** Reset confirmation text when the modal opens */
    if (open) {
      setConfirmationText('');
    }
  }, [open]);

  return (
    <ConfirmationDialog
      open={open}
      title={`Delete ${titlecase(entity)} ${label}?`}
      onClose={onClose}
      actions={renderActions}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Deleting this {entity} is permanent and can&apos;t be undone.
      </Typography>
      {typeToConfirm && (
        <>
          <Typography className={classes.text}>
            To confirm deletion, type the name of the {entity} (
            <strong>{label}</strong>) in the field below:
          </Typography>
          <TextField
            label={`${capitalize(entity)} Name:`}
            value={confirmationText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmationText(e.target.value)
            }
            placeholder={label}
          />
        </>
      )}
    </ConfirmationDialog>
  );
};

export default React.memo(DeletionDialog);
