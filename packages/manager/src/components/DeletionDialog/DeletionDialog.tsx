import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Notice from 'src/components/Notice';
import { titlecase } from 'src/features/linodes/presentation';
import { capitalize } from 'src/utilities/capitalize';
import { DialogProps } from '../Dialog';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';

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

type CombinedProps = Props & PreferencesProps;

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
    preferences,
    typeToConfirm,
    getUserPreferences,
    updateUserPreferences,
    ...rest
  } = props;
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

export default compose<CombinedProps, Props>(
  React.memo,
  withPreferences()
)(DeletionDialog);
