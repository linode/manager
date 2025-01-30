import { yupResolver } from '@hookform/resolvers/yup';
import { Autocomplete, Button, Stack, Typography } from '@linode/ui';
import { RebuildLinodeSchema } from '@linode/validation';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Encryption } from 'src/components/Encryption/Encryption';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import PasswordInput from 'src/components/PasswordInput/PasswordInput';
import { useRebuildLinodeMutation } from 'src/queries/linodes/linodes';

import { StackScriptSelectionList } from '../../LinodeCreate/Tabs/StackScripts/StackScriptSelectionList';
import { REBUILD_OPTIONS } from './utils';

import type { LinodeRebuildType } from './utils';
import type { RebuildRequest } from '@linode/api-v4';
import type { Resolver } from 'react-hook-form';

interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const LinodeRebuildDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, open } = props;

  const [type, setType] = useState<LinodeRebuildType>('From Image');
  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const { mutateAsync: rebuildLinode } = useRebuildLinodeMutation(
    linodeId ?? 0
  );

  const form = useForm<RebuildRequest>({
    resolver: yupResolver(RebuildLinodeSchema) as Resolver<RebuildRequest>,
  });

  const onSubmit = async (values: RebuildRequest) => {
    try {
      await rebuildLinode(values);
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  return (
    <Dialog
      fullHeight
      fullWidth
      onClose={onClose}
      open={open}
      title={`Rebuild Linode ${linodeLabel}`}
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Typography>
              If you can’t rescue an existing disk, it’s time to rebuild your
              Linode. There are a couple of different ways you can do this:
              either restore from a backup or start over with a fresh Linux
              distribution.{' '}
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
            {isDiskEncryptionFeatureEnabled && (
              <Controller
                render={({ field, fieldState }) => (
                  <Encryption
                    onChange={(checked) =>
                      field.onChange(checked ? 'enabled' : 'disabled')
                    }
                    descriptionCopy={''}
                    disabledReason={''}
                    error={fieldState.error?.message}
                    isEncryptEntityChecked={field.value === 'enabled'}
                  />
                )}
                control={form.control}
                name="disk_encryption"
              />
            )}
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="flex-end"
            >
              <Button
                buttonType="primary"
                loading={form.formState.isSubmitting}
                type="submit"
              >
                Rebuild Linode
              </Button>
            </Stack>
          </Stack>
        </form>
      </FormProvider>
    </Dialog>
  );
};
