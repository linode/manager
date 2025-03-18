import { useCreateUserMutation } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  Drawer,
  FormControlLabel,
  Notice,
  TextField,
  Toggle,
} from '@linode/ui';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { NotFound } from 'src/components/NotFound';

import type { User } from '@linode/api-v4/lib/account';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const CreateUserDrawer = (props: Props) => {
  const { onClose, open } = props;
  const history = useHistory();
  const { mutateAsync: createUserMutation } = useCreateUserMutation();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      restricted: false,
      username: '',
    },
  });

  const onSubmit = async (data: {
    email: string;
    restricted: boolean;
    username: string;
  }) => {
    try {
      const user: User = await createUserMutation(data);
      handleClose();

      if (user.restricted) {
        history.push(`/account/users/${data.username}/permissions`, {
          newUsername: user.username,
        });
      }
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
    <Drawer
      NotFoundComponent={NotFound}
      onClose={handleClose}
      open={open}
      title="Add a User"
    >
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          render={({ field, fieldState }) => (
            <TextField
              data-qa-create-username
              errorText={fieldState.error?.message}
              label="Username"
              onBlur={field.onBlur}
              onChange={field.onChange}
              required
              trimmed
              value={field.value}
            />
          )}
          control={control}
          name="username"
          rules={{ required: 'Username is required' }}
        />

        <Controller
          render={({ field, fieldState }) => (
            <TextField
              data-qa-create-email
              errorText={fieldState.error?.message}
              label="Email"
              onChange={field.onChange}
              required
              trimmed
              type="email"
              value={field.value}
            />
          )}
          control={control}
          name="email"
          rules={{ required: 'Email is required' }}
        />

        <Controller
          render={({ field }) => (
            <FormControlLabel
              label={`This user will have ${
                field.value ? 'limited' : 'full'
              } access to account features.
                    This can be changed later.`}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(!e.target.checked);
              }}
              checked={!field.value}
              control={<Toggle data-qa-create-restricted />}
              sx={{ marginTop: 1 }}
            />
          )}
          control={control}
          name="restricted"
        />

        <Box sx={{ marginTop: 1 }}>
          <Notice
            text="The user will be sent an email to set their password"
            variant="warning"
          />
        </Box>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add User',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};
