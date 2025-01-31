import { Autocomplete, Notice, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import { PasswordInput } from 'src/components/PasswordInput/PasswordInput';
import { useRebuildLinodeMutation } from 'src/queries/linodes/linodes';
import { usePreferences } from 'src/queries/profile/preferences';
import { utoa } from 'src/utilities/metadata';

import { StackScriptSelectionList } from '../../LinodeCreate/Tabs/StackScripts/StackScriptSelectionList';
import { Actions } from './Actions';
import { Confirmation } from './Confirmation';
import { DiskEncryption } from './DiskEncryption';
import { UserData } from './UserData';
import { UserDefinedFields } from './UserDefinedFields';
import { REBUILD_OPTIONS, resolver } from './utils';

import type {
  Context,
  LinodeRebuildType,
  RebuildLinodeFormValues,
} from './utils';

interface Props {
  linodeId: number;
  linodeLabel: string;
  onSuccess: () => void;
}

export const LinodeRebuildForm = (props: Props) => {
  const { linodeId, linodeLabel, onSuccess } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [type, setType] = useState<LinodeRebuildType>('From Image');

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm
  );

  const isTypeToConfirmEnabled =
    typeToConfirmPreference === undefined || typeToConfirmPreference === true;

  const { mutateAsync: rebuildLinode } = useRebuildLinodeMutation(linodeId);

  const form = useForm<RebuildLinodeFormValues, Context>({
    context: {
      isTypeToConfirmEnabled,
      linodeLabel,
    },
    resolver,
  });

  const onSubmit = async (values: RebuildLinodeFormValues) => {
    if (values.metadata?.user_data) {
      values.metadata.user_data = utoa(values.metadata.user_data);
    } else {
      values.metadata = undefined;
    }

    try {
      await rebuildLinode(values);
      enqueueSnackbar('Linode rebuild started.', { variant: 'info' });
      onSuccess();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {form.formState.errors.root && (
            <Notice text={form.formState.errors.root.message} variant="error" />
          )}
          <Typography>
            If you can’t rescue an existing disk, it’s time to rebuild your
            Linode. There are a couple of different ways you can do this: either
            restore from a backup or start over with a fresh Linux distribution.{' '}
            <strong>
              Rebuilding will destroy all data on all existing disks on this
              Linode.
            </strong>
          </Typography>
          <Autocomplete
            disableClearable
            label="Rebuild From"
            noMarginTop
            onChange={(e, value) => setType(value.label)}
            options={REBUILD_OPTIONS}
            textFieldProps={{ hideLabel: true }}
            value={REBUILD_OPTIONS.find((o) => o.label === type)}
          />
          {type === 'From Account StackScript' && (
            <StackScriptSelectionList type="Account" />
          )}
          {type === 'From Community StackScript' && (
            <StackScriptSelectionList type="Community" />
          )}
          {(type === 'From Community StackScript' ||
            type === 'From Account StackScript') && <UserDefinedFields />}
          <Controller
            render={({ field, fieldState }) => (
              <ImageSelect
                errorText={fieldState.error?.message}
                noMarginTop
                onChange={(value) => field.onChange(value?.id ?? null)}
                value={field.value ?? null}
                variant="all"
              />
            )}
            control={form.control}
            name="image"
          />
          <Controller
            render={({ field, fieldState }) => (
              <PasswordInput
                autoComplete="off"
                errorText={fieldState.error?.message}
                helperText="Set a password for your rebuilt Linode."
                label="Root Password"
                noMarginTop
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="Enter a password."
                value={field.value ?? ''}
              />
            )}
            control={form.control}
            name="root_pass"
          />
          <Controller
            render={({ field }) => (
              <UserSSHKeyPanel
                authorizedUsers={field.value ?? []}
                setAuthorizedUsers={field.onChange}
              />
            )}
            control={form.control}
            name="authorized_users"
          />
          <DiskEncryption />
          <UserData linodeId={linodeId} />
          <Confirmation linodeLabel={linodeLabel} />
          <Actions />
        </Stack>
      </form>
    </FormProvider>
  );
};
