import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useTheme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { Notice } from 'src/components/Notice/Notice';
import { titlecase } from 'src/features/Linodes/presentation';
import { capitalize } from 'src/utilities/capitalize';
import { DialogProps } from '../Dialog/Dialog';
import { usePreferences } from 'src/queries/preferences';

interface DeletionDialogProps extends Omit<DialogProps, 'title'> {
  open: boolean;
  error?: string;
  entity: string;
  onClose: () => void;
  onDelete: () => void;
  label: string;
  loading: boolean;
  typeToConfirm?: boolean;
}

const _DeletionDialog = (props: DeletionDialogProps) => {
  const theme = useTheme();
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
    <ActionsPanel
      style={{ padding: 0 }}
      secondary
      secondaryButtonText="Cancel"
      secondaryButtonHandler={onClose}
      secondaryButtonDataTestId="cancel"
      primary
      primaryButtonHandler={onDelete}
      primaryButtonDisabled={
        typeToConfirmRequired && confirmationText !== label
      }
      primaryButtonLoading={loading}
      primaryButtonDataTestId="confirm"
      primaryButtonText={` Delete {titlecase(entity)}`}
    />
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
          <Typography
            component={'span'}
            sx={{
              paddingTop: theme.spacing(2),
              paddingBottom: theme.spacing(),
            }}
          >
            To confirm deletion, type the name of the {entity} (
            <strong>{label}</strong>) in the field below:
          </Typography>
        }
      />
    </ConfirmationDialog>
  );
};

const DeletionDialog = React.memo(_DeletionDialog);

export { DeletionDialog };
