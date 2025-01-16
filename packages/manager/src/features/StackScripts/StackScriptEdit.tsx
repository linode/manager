import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Paper, Stack } from '@linode/ui';
import { stackScriptSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import {
  useStackScriptQuery,
  useUpdateStackScriptMutation,
} from 'src/queries/stackscripts';

import { StackScriptForm } from './StackScriptForm/StackScriptForm';

import type { StackScriptPayload } from '@linode/api-v4';

export const StackScriptEdit = () => {
  const { stackScriptID } = useParams<{ stackScriptID: string }>();
  const id = Number(stackScriptID);
  const { data: stackscript } = useStackScriptQuery(id);
  const { mutateAsync: updateStackScript } = useUpdateStackScriptMutation(id);
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const values = {
    description: stackscript?.description ?? '',
    images: stackscript?.images ?? [],
    label: stackscript?.label ?? '',
    rev_note: '',
    script: stackscript?.script ?? '',
  };

  const form = useForm<StackScriptPayload>({
    defaultValues: values,
    resolver: yupResolver(stackScriptSchema),
    values,
  });

  const disabled = false;

  const onSubmit = async (values: StackScriptPayload) => {
    try {
      const stackscript = await updateStackScript(values);
      enqueueSnackbar(`Successfully updated StackScript ${stackscript.label}`, {
        variant: 'success',
      });
      history.push(`/stackscripts/${stackscript.id}`);
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <FormProvider {...form}>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            { label: 'StackScripts', position: 1 },
            { label: stackscript?.label, noCap: true, position: 2 },
          ],
          pathname: location.pathname,
        }}
      />
      <Paper>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <StackScriptForm
              disabled={disabled}
              username={stackscript?.username ?? ''}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                data-testid="cancel"
                disabled={disabled}
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button
                buttonType="primary"
                data-testid="save"
                disabled={disabled || !form.formState.isDirty}
                loading={form.formState.isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </FormProvider>
  );
};
