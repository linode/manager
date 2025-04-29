import { ActionsPanel, Notice, Typography } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { titlecase } from 'src/features/Linodes/presentation';
import { usePreferences } from '@linode/queries';

import type { DialogProps } from '@linode/ui';

export interface DeletionDialogProps extends Omit<DialogProps, 'title'> {
  entity: string;
  error?: string;
  label: string;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
  open: boolean;
}

/**
 * @deprecated
 * Use the ConfirmationDialog component instead.
 */
export const DeletionDialog = React.memo((props: DeletionDialogProps) => {
  const theme = useTheme();
  const { entity, error, label, loading, onClose, onDelete, open, ...rest } =
    props;

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  const [confirmationText, setConfirmationText] = React.useState('');

  const renderActions = () => (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        disabled:
          Boolean(typeToConfirmPreference) && confirmationText !== label,
        label: ` Delete ${titlecase(entity)}`,
        loading,
        onClick: onDelete,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
      style={{ padding: 0 }}
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
      actions={renderActions}
      error={error}
      isFetching={loading}
      onClose={onClose}
      open={open}
      title={`Delete ${titlecase(entity)} ${label}?`}
      {...rest}
    >
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Deleting this {entity} is permanent and
          can&rsquo;t be undone.
        </Typography>
      </Notice>
      <TypeToConfirm
        confirmationText={
          <Typography
            sx={{
              paddingBottom: theme.spacing(),
              paddingTop: theme.spacing(2),
            }}
            component={'span'}
          >
            To confirm deletion, type the name of the {entity} (
            <strong>{label}</strong>) in the field below:
          </Typography>
        }
        onChange={(input) => {
          setConfirmationText(input);
        }}
        expand
        label={`${capitalize(entity)} Name:`}
        placeholder={label}
        value={confirmationText}
        visible={Boolean(typeToConfirmPreference)}
      />
    </ConfirmationDialog>
  );
});
