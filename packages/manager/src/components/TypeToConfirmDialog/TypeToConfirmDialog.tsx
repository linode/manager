import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
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
    | 'Cluster'
    | 'Database';
  label: string | undefined;
}

interface TypeToConfirmDialogProps {
  entity: EntityInfo;
  children: React.ReactNode;
  loading: boolean;
  confirmationText?: string | JSX.Element;
  errors?: APIError[] | undefined | null;
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
    children,
    confirmationText,
    errors,
    typographyStyle,
  } = props;

  const [confirmText, setConfirmText] = React.useState('');

  const { data: preferences } = usePreferences();
  const disabled =
    preferences?.type_to_confirm !== false && confirmText !== entity.label;

  React.useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);

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
        {entity.type === 'Volume' && title.startsWith('Detach')
          ? 'Detach'
          : 'Delete'}
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
        label={`${entity.type} ${entity.type !== 'Bucket' ? 'Label' : 'Name'}`}
        confirmationText={
          confirmationText ? (
            confirmationText
          ) : (
            <span>
              To confirm deletion, type the name of the {entity.type} (
              <b>{entity.label}</b>) in the field below:
            </span>
          )
        }
        value={confirmText}
        typographyStyle={typographyStyle}
        data-testid={'dialog-confirm-text-input'}
        expand
        onChange={(input) => {
          setConfirmText(input);
        }}
        visible={preferences?.type_to_confirm}
      />
    </ConfirmationDialog>
  );
};
