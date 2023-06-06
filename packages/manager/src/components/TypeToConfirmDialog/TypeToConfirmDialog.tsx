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
    | 'Database'
    | 'Kubernetes'
    | 'AccountSetting';
  label: string | undefined;
  subType?: 'Backup' | 'Cluster' | 'ObjectStorage' | 'CloseAccount';
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

  const getPrimaryBtnText = (entity: EntityInfo) => {
    if (entity.type === 'Volume' && title?.startsWith('Detach')) {
      return 'Detach';
    }

    switch (entity.subType) {
      case 'Backup':
        return 'Restore Database';
      case 'Cluster':
        return 'Delete Cluster';
      case 'ObjectStorage':
        return 'Confirm Cancellation';
      case 'CloseAccount':
        return 'Close Account';
      default:
        return 'Delete';
    }
  };

  const getLabelText = (entity: EntityInfo) => {
    if (entity.type === 'AccountSetting' && entity.subType === 'CloseAccount') {
      return `Please enter your username (${entity.label}) to confirm.`;
    }

    const ttcLabelText =
      entity.type === 'Bucket' || entity.subType === 'Cluster'
        ? 'Name'
        : 'Label';

    switch (entity.subType) {
      case 'ObjectStorage':
        return `Username`;
      case 'Cluster':
        return `Cluster ${ttcLabelText}`;
      default:
        return `${entity.type} ${ttcLabelText}`;
    }
  };

  const getConfirmationText = (entity: EntityInfo) => {
    if (entity.subType === 'CloseAccount') {
      return '';
    }

    let ttcAction = '';
    if (entity.subType === 'Backup') {
      ttcAction = 'restoration';
    } else if (entity.subType === 'ObjectStorage') {
      ttcAction = 'cancellation';
    } else {
      ttcAction = 'deletion';
    }

    let ttcEntityName = '';
    if (entity.type === 'Kubernetes') {
      ttcEntityName = 'cluster';
    } else if (entity.subType === 'Backup' || entity.subType === 'Cluster') {
      ttcEntityName = 'database cluster';
    } else if (entity.subType === 'ObjectStorage') {
      ttcEntityName = 'username';
    } else {
      ttcEntityName = entity.type;
    }

    return (
      <span>
        To confirm {ttcAction}, type{' '}
        {entity.subType === 'ObjectStorage' ? 'your' : 'the name of the'}{' '}
        {ttcEntityName} (<b>{entity.label}</b>) in the field below:
      </span>
    );
  };

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
        {getPrimaryBtnText(entity)}
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
        label={getLabelText(entity)}
        confirmationText={confirmationText || getConfirmationText(entity)}
        value={confirmText}
        typographyStyle={typographyStyle}
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
