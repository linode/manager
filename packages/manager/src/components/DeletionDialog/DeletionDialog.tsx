import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { Typography } from 'src/components/Typography';
import { titlecase } from 'src/features/Linodes/presentation';
import { usePreferences } from 'src/queries/preferences';
import { capitalize } from 'src/utilities/capitalize';

import { DialogProps } from '../Dialog/Dialog';

interface DeletionDialogProps extends Omit<DialogProps, 'title'> {
  entity: string;
  error?: string;
  label: string;
  loading: boolean;
  onClose: () => void;
  onDelete: () => void;
  open: boolean;
  typeToConfirm?: boolean;
}

/**
 * A Deletion Dialog is used for deleting entities such as Linodes, NodeBalancers, Volumes, or other entities.
 *
 * Require `typeToConfirm` when an action would have a significant negative impact if done in error, consider requiring the user to enter a unique identifier such as entity label before activating the action button.
 * If a user has opted out of type-to-confirm this will be ignored
 */
export const DeletionDialog = React.memo((props: DeletionDialogProps) => {
  const theme = useTheme();
  const {
    entity,
    error,
    label,
    loading,
    onClose,
    onDelete,
    open,
    typeToConfirm,
    ...rest
  } = props;
  const { data: preferences } = usePreferences();
  const [confirmationText, setConfirmationText] = React.useState('');
  const typeToConfirmRequired =
    typeToConfirm && preferences?.type_to_confirm !== false;
  const renderActions = () => (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        disabled: typeToConfirmRequired && confirmationText !== label,
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
      onClose={onClose}
      open={open}
      title={`Delete ${titlecase(entity)} ${label}?`}
      {...rest}
    >
      {error && <Notice variant="error" text={error} />}
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
        label={`${capitalize(entity)} Name:`}
        placeholder={label}
        value={confirmationText}
        visible={typeToConfirmRequired}
      />
    </ConfirmationDialog>
  );
});
