import { yupResolver } from '@hookform/resolvers/yup';
import { Button, CircleProgress, Notice, Paper, Stack } from '@linode/ui';
import { stackScriptSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import {
  useStackScriptQuery,
  useUpdateStackScriptMutation,
} from 'src/queries/stackscripts';
import { arrayToList } from 'src/utilities/arrayToList';

import { getRestrictedResourceText } from '../Account/utils';
import { StackScriptForm } from './StackScriptForm/StackScriptForm';
import { stackscriptFieldNameOverrides } from './stackScriptUtils';

import type { StackScriptPayload } from '@linode/api-v4';

export const StackScriptEdit = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { stackScriptID } = useParams<{ stackScriptID: string }>();
  const history = useHistory();
  const id = Number(stackScriptID);

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: stackscript, error, isLoading } = useStackScriptQuery(id);
  const { mutateAsync: updateStackScript } = useUpdateStackScriptMutation(id);

  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);

  const values = {
    description: stackscript?.description ?? '',
    images: stackscript?.images ?? [],
    label: stackscript?.label ?? '',
    rev_note: stackscript?.rev_note ?? '',
    script: stackscript?.script ?? '',
  };

  const form = useForm<StackScriptPayload>({
    defaultValues: values,
    resolver: yupResolver(stackScriptSchema),
    values,
  });

  const hasPermissionToEdit =
    !profile?.restricted ||
    grants?.stackscript.some(
      (grant) => grant.id === id && grant.permissions === 'read_write'
    );

  const disabled = !hasPermissionToEdit;

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

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  if (!stackscript) {
    return <NotFound />;
  }

  return (
    <FormProvider {...form}>
      <DocumentTitleSegment
        segment={`${stackscript.label} | Edit StackScript`}
      />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            { label: 'StackScripts', position: 1 },
            { label: stackscript?.label, noCap: true, position: 2 },
          ],
          pathname: location.pathname,
        }}
      />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Paper>
            {!hasPermissionToEdit && (
              <Notice
                text={getRestrictedResourceText({
                  action: 'edit',
                  isSingular: true,
                  resourceType: 'StackScripts',
                })}
                spacingBottom={12}
                variant="error"
              />
            )}
            {form.formState.errors.root && (
              <Notice
                text={form.formState.errors.root?.message}
                variant="error"
              />
            )}
            <StackScriptForm
              disabled={disabled}
              username={stackscript?.username ?? ''}
            />
          </Paper>
          <Stack
            data-qa-buttons
            direction="row"
            justifyContent="flex-end"
            spacing={1}
          >
            <Button
              data-testid="cancel"
              disabled={disabled || !form.formState.isDirty}
              onClick={() => setIsResetConfirmationOpen(true)}
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
              Save Changes
            </Button>
          </Stack>
        </Stack>
      </form>
      <ConfirmationDialog
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              buttonType="secondary"
              onClick={() => setIsResetConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                form.reset();
                setIsResetConfirmationOpen(false);
              }}
              buttonType="primary"
            >
              Reset
            </Button>
          </Stack>
        }
        onClose={() => setIsResetConfirmationOpen(false)}
        open={isResetConfirmationOpen}
        title="Reset StackScript From?"
      >
        You made changes to the{' '}
        {arrayToList(
          Object.keys(form.formState.dirtyFields).map(
            (field: keyof StackScriptPayload) =>
              stackscriptFieldNameOverrides[field] ?? field
          )
        )}
        . Are you sure you want to reset the form and discard your current
        changes?
      </ConfirmationDialog>
    </FormProvider>
  );
};
