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
import { usePreferences } from 'src/queries/profile/preferences';

interface EntityInfo {
  action?:
    | 'cancellation'
    | 'deletion'
    | 'detachment'
    | 'resizing'
    | 'restoration';
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
    | 'Placement Group'
    | 'Subnet'
    | 'VPC'
    | 'Volume';
}

interface TypeToConfirmDialogProps {
  /**
   * Props to be allow disabling the input
   */
  disableTypeToConfirmInput?: boolean;
  /**
   * Props to be allow disabling the submit button
   */
  disableTypeToConfirmSubmit?: boolean;
  /**
   * The entity being confirmed
   */
  entity: EntityInfo;
  /**
   * Error to be displayed in the dialog
   */
  errors?: APIError[] | null | undefined;
  /*
   * The label for the dialog
   */
  label: string;
  /**
   * The loading state of dialog
   */
  loading: boolean;
  /**
   * The click handler for the primary button
   */
  onClick: () => void;
  /**
   * The open/closed state of the dialog
   */
  open: boolean;
}

type CombinedProps = TypeToConfirmDialogProps &
  ConfirmationDialogProps &
  Partial<Omit<TypeToConfirmProps, 'disabled'>>;

export const TypeToConfirmDialog = (props: CombinedProps) => {
  const {
    children,
    disableTypeToConfirmInput,
    disableTypeToConfirmSubmit,
    entity,
    errors,
    inputProps,
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
  const isPrimaryButtonDisabled =
    (preferences?.type_to_confirm !== false && confirmText !== entity.name) ||
    disableTypeToConfirmSubmit;
  const isTypeToConfirmInputDisabled = disableTypeToConfirmInput;

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
        disabled: isPrimaryButtonDisabled,
        label: entity.primaryBtnText,
        loading,
        onClick,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose ? () => onClose({}, 'escapeKeyDown') : undefined,
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
        disabled={isTypeToConfirmInputDisabled}
        expand
        hideInstructions={entity.subType === 'CloseAccount'}
        inputProps={inputProps}
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
