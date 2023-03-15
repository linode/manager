import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Notice from 'src/components/Notice';
import { titlecase } from 'src/features/linodes/presentation';
import { capitalize } from 'src/utilities/capitalize';
import { DialogProps } from '../Dialog';
import { usePreferences } from 'src/queries/preferences';

interface Props extends Omit<DialogProps, 'title'> {
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

const DeletionDialog: React.FC<Props> = (props) => {
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
    ...rest
  } = props;
  const { data: preferences } = usePreferences();
  const [confirmationText, setConfirmationText] = React.useState('');
  const typeToConfirmRequired =
    typeToConfirm && preferences?.type_to_confirm !== false;
  const renderActions = () => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="secondary" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onDelete}
        disabled={typeToConfirmRequired && confirmationText !== label}
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
      {...rest}
    >
      {error && <Notice error text={error} />}
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting this {entity} is permanent and
          can&rsquo;t be undone.
        </Typography>
      </Notice>
      <TypeToConfirm
        onChange={(input) => {
          setConfirmationText(input);
        }}
        value={confirmationText}
        label={`${capitalize(entity)} Name:`}
        placeholder={label}
        visible={typeToConfirmRequired}
        confirmationText={
          <Typography component={'span'} className={classes.text}>
            To confirm deletion, type the name of the {entity} (
            <strong>{label}</strong>) in the field below:
          </Typography>
        }
      />
    </ConfirmationDialog>
  );
};

export default React.memo(DeletionDialog);
