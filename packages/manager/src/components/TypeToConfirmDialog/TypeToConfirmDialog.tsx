import { FormLabel } from '@mui/material';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { usePreferences } from 'src/queries/profile/preferences';

import type { APIError } from '@linode/api-v4/lib/types';
import type { ActionButtonsProps } from 'src/components/ActionsPanel/ActionsPanel';
import type { ConfirmationDialogProps } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import type { TypeToConfirmProps } from 'src/components/TypeToConfirm/TypeToConfirm';

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
  /** Props for the primary button */
  primaryButtonProps?: Omit<ActionButtonsProps, 'label'>;
  /**
   * Determines the order of the primary and secondary buttons within the actions panel.
   * If true, the primary button will be on the left and the secondary button on the right.
   */
  reversePrimaryButtonPosition?: boolean;
  /** Props for the secondary button */
  secondaryButtonProps?: Omit<ActionButtonsProps, 'label'>;
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
    isFetching,
    label,
    loading,
    onClick,
    onClose,
    open,
    primaryButtonProps,
    reversePrimaryButtonPosition,
    secondaryButtonProps,
    textFieldStyle,
    title,
    typographyStyle,
    typographyStyleSx,
  } = props;

  const [deleteAccount, setDeleteAccount] = React.useState({
    confirmText: '',
    services: false,
    users: false,
  });

  const handleDeleteAccountServices = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDeleteAccount({
      ...deleteAccount,
      [e.target.name]: e?.target.checked,
    });
  };

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm
  );

  const isTypeToConfirmEnabled = typeToConfirmPreference !== false;
  const isTextConfirmationValid = deleteAccount.confirmText === entity.name;
  const isCloseAccount = entity.subType === 'CloseAccount';
  const isCloseAccountValid =
    !isCloseAccount || (deleteAccount.services && deleteAccount.users);

  const isPrimaryButtonDisabled =
    (isTypeToConfirmEnabled && !isTextConfirmationValid) ||
    !isCloseAccountValid ||
    disableTypeToConfirmSubmit;

  React.useEffect(() => {
    if (open) {
      setDeleteAccount({
        ...deleteAccount,
        confirmText: '',
      });
    }
  }, [open]);

  const getButtonProps = () => {
    const confirmProps: ActionButtonsProps = {
      ...primaryButtonProps,
      'data-testid': 'confirm',
      disabled: isPrimaryButtonDisabled,
      label: entity.primaryBtnText,
      loading,
      onClick,
      ...(reversePrimaryButtonPosition && { color: 'warning' }),
    };

    const cancelProps: ActionButtonsProps = {
      ...secondaryButtonProps,
      'data-testid': 'cancel',
      label: 'Cancel',
      loading,
      onClick: () => onClose?.({}, 'escapeKeyDown'),
    };

    return {
      primaryButtonProps: reversePrimaryButtonPosition
        ? cancelProps
        : confirmProps,
      secondaryButtonProps: reversePrimaryButtonPosition
        ? confirmProps
        : cancelProps,
    };
  };

  const getTypeToConfirmProps = () => {
    if (isCloseAccount) {
      return {
        confirmationText: (
          <FormLabel>
            Please confirm you want to close your cloud computing services
            account
          </FormLabel>
        ),
        hideInstructions: true,
        placeholder: 'Email',
      };
    }

    const typeInstructions =
      entity.action === 'cancellation'
        ? 'type your Username '
        : `type the name of the ${entity.type} ${entity.subType || ''} `;

    return {
      confirmationText: (
        <span>
          To confirm {entity.action}, {typeInstructions}(<b>{entity.name}</b>)
          in the field below:
        </span>
      ),
      hideInstructions: false,
      placeholder: '',
    };
  };

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          {...getButtonProps()}
          reversePrimaryButtonPosition
          style={{ padding: 0 }}
        />
      }
      error={errors ? errors[0].reason : undefined}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={title}
    >
      {children}
      <TypeToConfirm
        {...getTypeToConfirmProps()}
        onChange={(input) => {
          setDeleteAccount({
            ...deleteAccount,
            confirmText: input,
          });
        }}
        data-testid={'dialog-confirm-text-input'}
        disabled={disableTypeToConfirmInput}
        expand
        handleDeleteAccountServices={handleDeleteAccountServices}
        inputProps={inputProps}
        isCloseAccount={isCloseAccount}
        label={label}
        textFieldStyle={textFieldStyle}
        typographyStyle={typographyStyle}
        typographyStyleSx={typographyStyleSx}
        value={deleteAccount.confirmText}
        visible={typeToConfirmPreference}
      />
    </ConfirmationDialog>
  );
};
