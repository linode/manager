import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateUserMutation } from '@linode/queries';
import { ActionsPanel, Box, Drawer, Notice, TextField } from '@linode/ui';
import { CreateUserSchema } from '@linode/validation';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const CreateUserDrawer = (props: Props) => {
  const { onClose, open } = props;
  const { mutateAsync: createUserMutation } = useCreateUserMutation();

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
    <Drawer onClose={handleClose} open={open} title="Add a User">
      {errors.root?.message && (
        <Notice text={errors.root?.message} variant="error" />
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="username"
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
          rules={{ required: 'Username is required' }}
        />

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              data-qa-create-email
              errorText={fieldState.error?.message}
              label="Email"
              onBlur={field.onBlur}
              onChange={field.onChange}
              required
              trimmed
              type="email"
              value={field.value}
            />
          )}
        />

        <Box sx={{ marginTop: 2 }}>
          <Notice
            text="The user will be sent an email to set their password."
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
