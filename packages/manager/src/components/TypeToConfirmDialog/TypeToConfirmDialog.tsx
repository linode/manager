import { usePreferences } from '@linode/queries';
import { ActionsPanel } from '@linode/ui';
import { FormLabel } from '@mui/material';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';

import type { APIError } from '@linode/api-v4/lib/types';
import type { ActionButtonsProps } from '@linode/ui';
import type { ConfirmationDialogProps } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import type { TypeToConfirmProps } from 'src/components/TypeToConfirm/TypeToConfirm';

interface EntityInfo {
  action?:
    | 'cancellation'
    | 'deletion'
    | 'detachment'
    | 'resizing'
    | 'restoration';
  error?: APIError[] | null | string | undefined;
  name?: string | undefined;
  primaryBtnText: string;
  subType?: 'CloseAccount' | 'Cluster' | 'ObjectStorage';
  type:
    | 'AccountSetting'
    | 'Alert'
    | 'Bucket'
    | 'Database'
    | 'Domain'
    | 'Kubernetes'
    | 'Linode'
    | 'Load Balancer'
    | 'NodeBalancer'
    | 'Placement Group'
    | 'Subnet'
    | 'Volume'
    | 'VPC';
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
  /**
   * Makes the TextField use 100% of the available width
   * @default false
   */
  expand?: boolean;
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
    expand,
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

  const [confirmationValues, setConfirmationValues] = React.useState({
    confirmText: '',
    services: false,
    users: false,
  });

  const handleDeleteAccountServices = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmationValues({
      ...confirmationValues,
      [e.target.name]: e?.target.checked,
    });
  };

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  const isCloseAccount = entity.subType === 'CloseAccount';
  const isTypeToConfirmEnabled =
    Boolean(typeToConfirmPreference) || isCloseAccount;
  const isTextConfirmationValid =
    confirmationValues.confirmText === entity.name;
  const isCloseAccountValid =
    !isCloseAccount ||
    (confirmationValues.services && confirmationValues.users);

  const isPrimaryButtonDisabled =
    (isTypeToConfirmEnabled && !isTextConfirmationValid) ||
    !isCloseAccountValid ||
    disableTypeToConfirmSubmit;

  React.useEffect(() => {
    if (open) {
      setConfirmationValues({
        ...confirmationValues,
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
      ...(reversePrimaryButtonPosition && { color: 'error' }),
    };

    const cancelProps: ActionButtonsProps = {
      ...secondaryButtonProps,
      'data-testid': 'cancel',
      label: 'Cancel',
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
          reversePrimaryButtonPosition={reversePrimaryButtonPosition}
          style={{ padding: 0 }}
        />
      }
      entityError={entity.error}
      error={errors ? errors[0].reason : undefined}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title={title}
    >
      {children}
      <TypeToConfirm
        {...getTypeToConfirmProps()}
        data-testid={'dialog-confirm-text-input'}
        disabled={disableTypeToConfirmInput}
        expand={expand}
        handleDeleteAccountServices={handleDeleteAccountServices}
        inputProps={inputProps}
        isCloseAccount={isCloseAccount}
        label={label}
        onChange={(input) => {
          setConfirmationValues({
            ...confirmationValues,
            confirmText: input,
          });
        }}
        textFieldStyle={textFieldStyle}
        typographyStyle={typographyStyle}
        typographyStyleSx={typographyStyleSx}
        value={confirmationValues.confirmText}
        visible={typeToConfirmPreference || isCloseAccount}
      />
    </ConfirmationDialog>
  );
};
