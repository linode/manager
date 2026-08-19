import {
  Button,
  FormError,
  FormField,
  FormLabel,
  NotificationBanner,
  TextField,
} from '@akamai/cds-components/react';
import { Alias, Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateUserMutation } from '@linode/queries';
import { CreateUserSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { usePermissions } from '../../hooks/usePermissions';
import {
  IAM_CHILD_USERS_PENDO_IDS,
  IAM_DELEGATE_USERS_PENDO_IDS,
  IAM_PARENT_USERS_PENDO_IDS,
} from '../../Shared/constants';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const CreateUserDrawer = (props: Props) => {
  const { onClose, open } = props;
  const { mutateAsync: createUserMutation } = useCreateUserMutation();
  const { isParentUserType, isDelegateUserType } = useDelegationRole();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm({
    resolver: yupResolver(CreateUserSchema),
    defaultValues: {
      email: '',
      restricted: true,
      username: '',
    },
  });

  const { data: permissions } = usePermissions('account', ['create_user']);

  const onSubmit = async (data: {
    email: string;
    restricted: boolean;
    username: string;
  }) => {
    try {
      await createUserMutation(data);
      handleClose();
    } catch (errors) {
      for (const error of errors) {
        setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer aria-label="Add a User" onClose={handleClose} open={open}>
      <div slot="header">Add a User</div>
      <form noValidate onSubmit={handleSubmit(onSubmit)} slot="body">
        {!permissions.create_user && (
          <NotificationBanner
            style={{ marginBottom: Spacing.S8 }}
            text="You do not have permission to create other users."
            type="error"
          />
        )}
        {errors.root?.message && (
          <NotificationBanner text={errors.root?.message} type="error" />
        )}
        <Controller
          control={control}
          name="username"
          render={({ field, fieldState }) => (
            <FormField
              error={Boolean(fieldState.error?.message)}
              labelPosition="top"
              style={{ padding: Spacing.S0 }}
            >
              <FormLabel
                htmlFor="username"
                slot="label"
                style={{
                  textAlign: 'left',
                  padding: Spacing.S0,
                  marginBottom: Spacing.S8,
                  marginTop: Spacing.S16,
                }}
              >
                Username{' '}
                <span style={{ font: Alias.Typography.Body.Regular }}>
                  (required)
                </span>
              </FormLabel>
              <TextField
                data-qa-create-username
                error={Boolean(fieldState.error?.message)}
                id="username"
                onBlurred={() => field.onBlur()}
                onChange={(e) => field.onChange(e.detail)}
                required
                value={field.value}
              />
              {Boolean(fieldState.error?.message) && (
                <FormError slot="error">{fieldState.error?.message}</FormError>
              )}
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <FormField
              error={Boolean(fieldState.error?.message)}
              labelPosition="top"
              style={{ padding: Spacing.S0 }}
            >
              <FormLabel
                htmlFor="email"
                slot="label"
                style={{
                  textAlign: 'left',
                  padding: Spacing.S0,
                  marginBottom: Spacing.S8,
                  marginTop: Spacing.S16,
                }}
              >
                Email{' '}
                <span style={{ font: Alias.Typography.Body.Regular }}>
                  (required)
                </span>
              </FormLabel>
              <TextField
                data-qa-create-email
                error={Boolean(fieldState.error?.message)}
                id="email"
                onBlurred={() => field.onBlur()}
                onChange={(e) => field.onChange(e.detail)}
                required
                value={field.value}
              />
              {Boolean(fieldState.error?.message) && (
                <FormError slot="error">{fieldState.error?.message}</FormError>
              )}
            </FormField>
          )}
        />

        <NotificationBanner
          style={{ marginTop: Spacing.S16 }}
          text="The user will be sent an email to set their password."
          type="warning"
        />
        <DrawerInlineActions>
          <Button
            data-testid="cancel"
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            data-pendo-id={
              isDelegateUserType
                ? IAM_DELEGATE_USERS_PENDO_IDS.addUserDrawerSubmit
                : isParentUserType
                  ? IAM_PARENT_USERS_PENDO_IDS.addUserDrawerSubmit
                  : IAM_CHILD_USERS_PENDO_IDS.addUserDrawerSubmit
            }
            data-testid="submit"
            disabled={!permissions.create_user}
            processing={isSubmitting}
            type="submit"
            variant="primary"
          >
            Add User
          </Button>
        </DrawerInlineActions>
      </form>
    </Drawer>
  );
};
