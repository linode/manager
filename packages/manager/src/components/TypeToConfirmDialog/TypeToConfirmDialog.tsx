import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import {
  ConfirmationDialog,
  ConfirmationDialogProps,
} from 'src/components/ConfirmationDialog/ConfirmationDialog';
import {
  TypeToConfirm,
  TypeToConfirmProps,
} from 'src/components/TypeToConfirm/TypeToConfirm';
import { usePreferences } from 'src/queries/preferences';

interface EntityInfo {
  action?: 'cancellation' | 'deletion' | 'detachment' | 'restoration';
  name?: string | undefined;
  primaryBtnText: string;
  subType?: 'CloseAccount' | 'Cluster' | 'ObjectStorage';
  type:
    | 'AccountSetting'
    | 'Bucket'
    | 'Database'
    | 'Kubernetes'
    | 'Linode'
    | 'Load Balancer'
    | 'NodeBalancer'
    | 'VPC'
    | 'Volume';
}

interface TypeToConfirmDialogProps {
  children?: React.ReactNode;
  entity: EntityInfo;
  errors?: APIError[] | null | undefined;
  label: string;
  loading: boolean;
  onClick: () => void;
  open: boolean;
}

type CombinedProps = TypeToConfirmDialogProps &
  ConfirmationDialogProps &
  Partial<TypeToConfirmProps>;

export const TypeToConfirmDialog = (props: CombinedProps) => {
  const {
    children,
    entity,
    errors,
    label,
    loading,
    onClick,
    onClose,
    open,
    textFieldStyle,
    title,
    typographyStyle,
  } = props;

  const [confirmText, setConfirmText] = React.useState('');

  const { data: preferences } = usePreferences();
  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== entity.name;

  React.useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);

  const typeInstructions =
    entity.action === 'cancellation'
      ? `type your Username `
      : `type  the name of the ${entity.type} ${entity.subType || ''} `;

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        disabled,
        label: entity.primaryBtnText,
        loading,
        onClick,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={errors ? errors[0].reason : undefined}
      onClose={onClose}
      open={open}
      title={title}
    >
      {children}
      <TypeToConfirm
        confirmationText={
          entity.subType === 'CloseAccount' ? (
            ''
          ) : (
            <span>
              To confirm {entity.action}, {typeInstructions}(
              <b>{entity.name}</b>) in the field below:
            </span>
          )
        }
        onChange={(input) => {
          setConfirmText(input);
        }}
        data-testid={'dialog-confirm-text-input'}
        expand
        hideInstructions={entity.subType === 'CloseAccount'}
        label={label}
        placeholder={entity.subType === 'CloseAccount' ? 'Username' : ''}
        textFieldStyle={textFieldStyle}
        typographyStyle={typographyStyle}
        value={confirmText}
        visible={preferences?.type_to_confirm}
      />
    </ConfirmationDialog>
  );
};
