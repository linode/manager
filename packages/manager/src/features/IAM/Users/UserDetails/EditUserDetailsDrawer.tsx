import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormError,
  FormField,
  FormLabel,
  Icon,
  TextField,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutateProfile, useUpdateUserMutation } from '@linode/queries';
import {
  UpdateUserEmailSchema,
  UpdateUserNameSchema,
} from '@linode/validation';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useDelegationRole } from '../../hooks/useDelegationRole';
import { IAM_USERS_USER_DETAILS_PENDO_IDS } from '../../LoginSettings/constants';
import { Box } from '../../Shared/Box/Box';
import { RESTRICTED_FIELD_TOOLTIP } from '../../Shared/constants';
import { Drawer, DrawerInlineActions } from '../../Shared/Drawer';

import type { User } from '@linode/api-v4';

interface Props {
  activeUser: User;
  canUpdateUser: boolean;
  onClose: () => void;
  open: boolean;
}

export const EditUserDetailsDrawer = (props: Props) => {
  const { activeUser, canUpdateUser, onClose, open } = props;
  const navigate = useNavigate();
  const { profileUserName } = useDelegationRole();

  const isDelegateUserType = activeUser?.user_type === 'delegate';

  const { mutateAsync: updateUsername, isPending: isUpdatingUsername } =
    useUpdateUserMutation(activeUser.username);
  const { mutateAsync: updateProfile, isPending: isUpdatingEmail } =
    useMutateProfile();

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm({
    resolver: yupResolver(UpdateUserNameSchema.concat(UpdateUserEmailSchema)),
    defaultValues: { username: activeUser.username, email: activeUser.email },
    values: { username: activeUser.username, email: activeUser.email },
  });

  const onSubmit = async (values: { email: string; username: string }) => {
    let hasError = false;

    if (values.username !== activeUser.username) {
      try {
        const user = await updateUsername({ username: values.username });
        navigate({
          to: '/iam/users/$username/details',
          params: { username: user.username },
        });
        toast.open({
          text: 'Username updated successfully',
          type: 'success',
        });
      } catch (error) {
        setError('username', { message: error[0].reason });
        hasError = true;
      }
    }

    if (values.email !== activeUser.email) {
      try {
        await updateProfile({ email: values.email });
        toast.open({
          text: 'Email updated successfully',
          type: 'success',
        });
      } catch (error) {
        setError('email', { message: error[0].reason });
        hasError = true;
      }
    }

    // If the username changed, navigation already handled routing to the new URL.
    // Calling handleClose() would navigate back to the old username URL via onClose().
    if (!hasError && values.username === activeUser.username) {
      handleClose();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  let tooltipForDisabledUsernameField: string | undefined;
  if (!canUpdateUser) {
    tooltipForDisabledUsernameField =
      'Restricted users cannot update their username. Please contact an account administrator.';
  } else if (isDelegateUserType) {
    tooltipForDisabledUsernameField = RESTRICTED_FIELD_TOOLTIP;
  }

  let emailDisabledReason: string | undefined;
  if (isDelegateUserType) {
    emailDisabledReason = RESTRICTED_FIELD_TOOLTIP;
  } else if (profileUserName !== activeUser.username) {
    emailDisabledReason = 'You can’t change another user’s email address.';
  }

  const disableEmailField =
    profileUserName !== activeUser.username || isDelegateUserType;

  return (
    <Drawer aria-label="Edit user details" onClose={handleClose} open={open}>
      <div slot="header">Edit user details</div>
      <form noValidate onSubmit={handleSubmit(onSubmit)} slot="body">
        <Box spacing={1}>
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
                  }}
                >
                  Username
                </FormLabel>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    disabled={tooltipForDisabledUsernameField !== undefined}
                    error={Boolean(fieldState.error?.message)}
                    id="username"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    required
                    style={{ boxSizing: 'border-box' }}
                    value={field.value}
                  />
                  {!canUpdateUser || isDelegateUserType ? (
                    <Tooltip
                      disabled={tooltipForDisabledUsernameField === undefined}
                      key={tooltipForDisabledUsernameField}
                      style={{
                        textAlign: 'left',
                        whiteSpace: 'normal',
                        marginLeft: Spacing.S12,
                      }}
                      tooltipPlacement="left"
                      tooltipText={tooltipForDisabledUsernameField}
                    >
                      <Icon icon="info-outline" size="m" />
                    </Tooltip>
                  ) : null}
                </div>
                {Boolean(fieldState.error?.message) && (
                  <FormError slot="error">
                    {fieldState.error?.message}
                  </FormError>
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
              >
                <FormLabel
                  htmlFor="email"
                  slot="label"
                  style={{
                    textAlign: 'left',
                    padding: Spacing.S0,
                    marginBottom: Spacing.S8,
                  }}
                >
                  Email
                </FormLabel>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    disabled={disableEmailField}
                    error={Boolean(fieldState.error?.message)}
                    id="email"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    required
                    style={{ boxSizing: 'border-box' }}
                    value={field.value}
                  />
                  {disableEmailField ? (
                    <Tooltip
                      disabled={!disableEmailField}
                      key={tooltipForDisabledUsernameField}
                      style={{
                        textAlign: 'left',
                        whiteSpace: 'normal',
                        marginLeft: Spacing.S12,
                      }}
                      tooltipPlacement="left"
                      tooltipText={emailDisabledReason}
                    >
                      <Icon icon="info-outline" size="m" />
                    </Tooltip>
                  ) : null}
                </div>
                {Boolean(fieldState.error?.message) && (
                  <FormError slot="error">
                    {fieldState.error?.message}
                  </FormError>
                )}
              </FormField>
            )}
          />
        </Box>
        <DrawerInlineActions>
          <Button
            data-pendo-id={IAM_USERS_USER_DETAILS_PENDO_IDS.editDetailsCancel}
            data-testid="cancel"
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            data-pendo-id={IAM_USERS_USER_DETAILS_PENDO_IDS.editDetailsEdit}
            data-testid="submit"
            disabled={!isDirty}
            processing={isSubmitting || isUpdatingUsername || isUpdatingEmail}
            type="submit"
            variant="primary"
          >
            Save
          </Button>
        </DrawerInlineActions>
      </form>
    </Drawer>
  );
};
