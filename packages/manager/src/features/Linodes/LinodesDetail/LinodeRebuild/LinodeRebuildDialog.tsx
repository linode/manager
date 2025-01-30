import { Autocomplete, Button, Stack, Typography } from '@linode/ui';
import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { UserSSHKeyPanel } from 'src/components/AccessPanel/UserSSHKeyPanel';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Encryption } from 'src/components/Encryption/Encryption';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { ImageSelect } from 'src/components/ImageSelect/ImageSelect';
import PasswordInput from 'src/components/PasswordInput/PasswordInput';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';
import { useRebuildLinodeMutation } from 'src/queries/linodes/linodes';
import { usePreferences } from 'src/queries/profile/preferences';
import { utoa } from 'src/utilities/metadata';

import { StackScriptSelectionList } from '../../LinodeCreate/Tabs/StackScripts/StackScriptSelectionList';
import { UserDefinedFields } from '../../LinodeCreate/Tabs/StackScripts/UserDefinedFields/UserDefinedFields';
import { UserData } from './UserData';
import { REBUILD_OPTIONS, resolver } from './utils';

import type {
  Context,
  LinodeRebuildType,
  RebuildLinodeFormValues,
} from './utils';

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
  const { data: isTypeToConfirmEnabled } = usePreferences(
    (preferences) => preferences?.type_to_confirm
  );

  const { mutateAsync: rebuildLinode } = useRebuildLinodeMutation(
    linodeId ?? 0
  );

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
    }

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
            {isDiskEncryptionFeatureEnabled && (
              <Controller
                render={({ field, fieldState }) => (
                  <Encryption
                    onChange={(checked) =>
                      field.onChange(checked ? 'enabled' : 'disabled')
                    }
                    descriptionCopy="Secure this Linode using data at rest encryption."
                    disabledReason=""
                    error={fieldState.error?.message}
                    isEncryptEntityChecked={field.value === 'enabled'}
                  />
                )}
                control={form.control}
                name="disk_encryption"
              />
            )}
            <UserData linodeId={linodeId ?? 0} />
            <Controller
              render={({ field, fieldState }) => (
                <TypeToConfirm
                  confirmationText={
                    <span>
                      To confirm these changes, type the label of the Linode (
                      <strong>{linodeLabel}</strong>) in the field below:
                    </span>
                  }
                  errorText={fieldState.error?.message}
                  hideLabel
                  label="Linode Label"
                  onChange={field.onChange}
                  title="Confirm"
                  value={field.value ?? ''}
                  visible={isTypeToConfirmEnabled}
                />
              )}
              control={form.control}
              name="confirmationText"
            />
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
