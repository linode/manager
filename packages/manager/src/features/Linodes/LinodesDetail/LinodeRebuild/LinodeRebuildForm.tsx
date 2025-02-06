import { Autocomplete, Divider, Notice, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useRebuildLinodeMutation } from 'src/queries/linodes/linodes';
import { usePreferences } from 'src/queries/profile/preferences';
import { utoa } from 'src/utilities/metadata';

import { StackScriptSelectionList } from '../../LinodeCreate/Tabs/StackScripts/StackScriptSelectionList';
import { Actions } from './Actions';
import { Confirmation } from './Confirmation';
import { DiskEncryption } from './DiskEncryption';
import { Image } from './Image';
import { Password } from './Password';
import { SSHKeys } from './SSHKeys';
import { UserData } from './UserData';
import { UserDefinedFields } from './UserDefinedFields';
import { REBUILD_OPTIONS, resolver } from './utils';

import type {
  Context,
  LinodeRebuildType,
  RebuildLinodeFormValues,
} from './utils';
import type { Linode } from '@linode/api-v4';

interface Props {
  linode: Linode;
  onSuccess: () => void;
}

export const LinodeRebuildForm = (props: Props) => {
  const { linode, onSuccess } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [type, setType] = useState<LinodeRebuildType>('Image');

  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm
  );

  const isTypeToConfirmEnabled =
    typeToConfirmPreference === undefined || typeToConfirmPreference === true;

  const { mutateAsync: rebuildLinode } = useRebuildLinodeMutation(linode.id);

  const form = useForm<RebuildLinodeFormValues, Context>({
    context: {
      isTypeToConfirmEnabled,
      linodeLabel: linode.label,
    },
    defaultValues: {
      disk_encryption: linode.disk_encryption,
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
        <Stack divider={<Divider />} spacing={2}>
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
            onChange={(e, value) => {
              form.reset((values) => ({
                ...values,
                image: '',
                stackscript_data: undefined,
                stackscript_id: undefined,
              }));
              setType(value.label);
            }}
            disableClearable
            label="Rebuild From"
            noMarginTop
            options={REBUILD_OPTIONS}
            value={REBUILD_OPTIONS.find((o) => o.label === type)}
          />
          {type === 'Account StackScript' && (
            <StackScriptSelectionList type="Account" />
          )}
          {type === 'Community StackScript' && (
            <StackScriptSelectionList type="Community" />
          )}
          {type.includes('StackScript') && <UserDefinedFields />}
          <Image />
          <Password />
          <SSHKeys />
          <DiskEncryption
            isLKELinode={linode.lke_cluster_id !== null}
            linodeRegion={linode.region}
          />
          <UserData linodeId={linode.id} />
          <Confirmation linodeLabel={linode.label} />
          <Actions />
        </Stack>
      </form>
    </FormProvider>
  );
};
