import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
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
  type:
    | 'Linode'
    | 'Volume'
    | 'NodeBalancer'
    | 'Bucket'
    | 'Database'
    | 'Kubernetes'
    | 'AccountSetting';
  subType?: 'Cluster' | 'ObjectStorage' | 'CloseAccount';
  action?: 'deletion' | 'detachment' | 'restoration' | 'cancellation';
  name?: string | undefined;
  primaryBtnText: string;
}

interface TypeToConfirmDialogProps {
  entity: EntityInfo;
  children: React.ReactNode;
  loading: boolean;
  errors?: APIError[] | undefined | null;
  label: string;
  onClick: () => void;
}

type CombinedProps = TypeToConfirmDialogProps &
  ConfirmationDialogProps &
  Partial<TypeToConfirmProps>;

export const TypeToConfirmDialog = (props: CombinedProps) => {
  const {
    open,
    title,
    onClose,
    onClick,
    loading,
    entity,
    label,
    children,
    errors,
    typographyStyle,
    textFieldStyle,
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
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="secondary"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        {entity.primaryBtnText}
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title={title}
      onClose={onClose}
      actions={actions}
      error={errors ? errors[0].reason : undefined}
    >
      {children}
      <TypeToConfirm
        hideInstructions={entity.subType === 'CloseAccount'}
        label={label}
        confirmationText={
          entity.subType === 'CloseAccount' ? (
            confirmText
          ) : (
            <span>
              To confirm {entity.action}, {typeInstructions}(
              <b>{entity.name}</b>) in the field below:
            </span>
          )
        }
        value={confirmText}
        typographyStyle={typographyStyle}
        textFieldStyle={textFieldStyle}
        data-testid={'dialog-confirm-text-input'}
        expand
        onChange={(input) => {
          setConfirmText(input);
        }}
        visible={preferences?.type_to_confirm}
        placeholder={entity.subType === 'CloseAccount' ? 'Username' : ''}
      />
    </ConfirmationDialog>
  );
};
