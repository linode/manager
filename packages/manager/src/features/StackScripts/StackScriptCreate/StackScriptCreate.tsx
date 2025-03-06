import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Notice, Paper, Stack } from '@linode/ui';
import { stackScriptSchema } from '@linode/validation';
import { useSnackbar } from 'notistack';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useCreateStackScriptMutation } from 'src/queries/stackscripts';

import { StackScriptForm } from '../StackScriptForm/StackScriptForm';

import type { StackScriptPayload } from '@linode/api-v4';

export const StackScriptCreate = () => {
  const { mutateAsync: createStackScript } = useCreateStackScriptMutation();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const form = useForm<StackScriptPayload>({
    defaultValues: {
      description: '',
      images: [],
      is_public: false,
      label: '',
      script: '',
    },
    resolver: yupResolver(stackScriptSchema),
  });

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const username = profile?.username ?? '';

  const isStackScriptCreationRestricted = Boolean(
    profile?.restricted && !grants?.global.add_stackscripts
  );

  const onSubmit = async (values: StackScriptPayload) => {
    try {
      const stackscript = await createStackScript(values);

      enqueueSnackbar(`Successfully created StackScript ${stackscript.label}`, {
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
      <DocumentTitleSegment segment="Create a StackScript" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [{ label: 'StackScripts', position: 1 }],
        }}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/create-a-stackscript"
      />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {isStackScriptCreationRestricted && (
            <Notice
              text={getRestrictedResourceText({
                action: 'create',
                isSingular: false,
                resourceType: 'StackScripts',
              })}
              important
              spacingBottom={12}
              variant="error"
            />
          )}
          <Paper>
            {form.formState.errors.root && (
              <Notice
                text={form.formState.errors.root?.message}
                variant="error"
              />
            )}
            <StackScriptForm
              disabled={isStackScriptCreationRestricted}
              username={username}
            />
          </Paper>
          <Box data-qa-buttons display="flex" justifyContent="flex-end">
            <Button
              buttonType="primary"
              data-testid="save"
              disabled={isStackScriptCreationRestricted}
              loading={form.formState.isSubmitting}
              type="submit"
            >
              Create StackScript
            </Button>
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
};
