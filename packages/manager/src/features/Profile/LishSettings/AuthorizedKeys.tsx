import { useMutateProfile, useProfile } from '@linode/queries';
import {
  Box,
  Button,
  Notice,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';

export const AuthorizedKeys = () => {
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();

  const { enqueueSnackbar } = useSnackbar();

  const values = {
    // I'm mapping the keys from a string to an object because react-hook-form's
    // `useFieldArray` helper only works on arrays of objects.
    authorized_keys: profile?.authorized_keys?.map((key) => ({ key })) ?? [
      { key: '' },
    ],
  };

  const form = useForm({
    values,
    defaultValues: values,
  });

  const { insert, append, remove, fields } = useFieldArray({
    control: form.control,
    name: 'authorized_keys',
  });

  const onSubmit = async (value: typeof values) => {
    try {
      await updateProfile({
        authorized_keys: value.authorized_keys.reduce<string[]>(
          (keys, { key }) => {
            if (key) {
              keys.push(key);
            }
            return keys;
          },
          []
        ),
      });

      enqueueSnackbar('Authorized keys updated successfully.', {
        variant: 'success',
      });
      form.reset();
    } catch (errors) {
      for (const error of errors) {
        if (error.reason.startsWith('SSH Key ')) {
          const sshKeyIndex = Number(error.reason.split(' ')[2]) - 1;
          form.setError(`authorized_keys.${sshKeyIndex}.key`, {
            message: error.reason,
          });
        } else {
          form.setError(error.field ?? 'root', { message: error.reason });
        }
      }
    }
  };

  return (
    <Paper>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h2">Authorized Keys</Typography>
            <DocsLink href="https://techdocs.akamai.com/cloud-computing/docs/access-your-system-console-using-lish#add-your-public-key" />
          </Stack>
          {form.formState.errors.root?.message && (
            <Notice text={form.formState.errors.root.message} variant="error" />
          )}
          {form.formState.errors.authorized_keys?.message && (
            <Notice
              text={form.formState.errors.authorized_keys.message}
              variant="error"
            />
          )}
          <Typography>
            Place your SSH public keys here for use with Lish console access.
          </Typography>
          {fields.map((field, idx) => (
            <Stack key={field.id} spacing={2}>
              <Controller
                control={form.control}
                name={`authorized_keys.${idx}.key`}
                render={({ fieldState, field }) => (
                  <TextField
                    errorText={fieldState.error?.message}
                    inputId={`ssh-public-key-${idx}`}
                    inputRef={field.ref}
                    label="SSH Public Key"
                    multiline
                    noMarginTop
                    onChange={field.onChange}
                    onPaste={(e) => {
                      // Allows pasting comma seperated lists of ssh keys
                      e.preventDefault();
                      const pastedItems = e.clipboardData
                        .getData('text')
                        .split(',')
                        .map((item) => item.trim());

                      if (pastedItems.length > 1) {
                        for (let i = 0; i < pastedItems.length; i++) {
                          if (i === 0) {
                            form.setValue(
                              `authorized_keys.${idx}.key`,
                              pastedItems[i]
                            );
                          } else {
                            insert(idx + i, { key: pastedItems[i] });
                          }
                        }
                      } else {
                        field.onChange(pastedItems[0]);
                      }
                    }}
                    rows={1}
                    value={field.value}
                  />
                )}
              />
              {(idx > 0 || (idx === 0 && fields.length > 1)) && (
                <Box>
                  <Button
                    buttonType="outlined"
                    data-qa-remove
                    onClick={() => remove(idx)}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Stack>
          ))}
          <Box>
            <Button buttonType="outlined" onClick={() => append({ key: '' })}>
              Add Another SSH Public Key
            </Button>
          </Box>
          <Stack alignItems="flex-end">
            <Button
              buttonType="primary"
              disabled={!form.formState.isDirty}
              loading={form.formState.isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};
