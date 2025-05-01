import { isEmpty } from '@linode/api-v4';
import { usePreferences, useRebuildLinodeMutation } from '@linode/queries';
import { Divider, Notice, Stack, Typography } from '@linode/ui';
import { scrollErrorIntoView, utoa } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useEventsPollingActions } from 'src/queries/events/events';

import { StackScriptSelectionList } from '../../LinodeCreate/Tabs/StackScripts/StackScriptSelectionList';
import { LinodePermissionsError } from '../LinodePermissionsError';
import { Actions } from './Actions';
import { Confirmation } from './Confirmation';
import { DiskEncryption } from './DiskEncryption';
import { Image } from './Image';
import { Password } from './Password';
import { RebuildFromSelect } from './RebuildFrom';
import { SSHKeys } from './SSHKeys';
import { UserData } from './UserData';
import { UserDefinedFields } from './UserDefinedFields';
import { REBUILD_LINODE_IMAGE_PARAM_NAME, resolver } from './utils';

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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [type, setType] = useState<LinodeRebuildType>('Image');

  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linode.id,
  });

  const { data: isTypeToConfirmEnabled } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  const queryClient = useQueryClient();
  const { mutateAsync: rebuildLinode } = useRebuildLinodeMutation(linode.id);
  const { checkForNewEvents } = useEventsPollingActions();

  const form = useForm<RebuildLinodeFormValues, Context>({
    context: {
      isTypeToConfirmEnabled,
      linodeLabel: linode.label,
      queryClient,
      type,
    },
    defaultValues: {
      disk_encryption: linode.disk_encryption,
      image: queryParams.get(REBUILD_LINODE_IMAGE_PARAM_NAME) ?? undefined,
      metadata: {
        user_data: null,
      },
      reuseUserData: false,
    },
    resolver,
  });

  const onSubmit = async (values: RebuildLinodeFormValues) => {
    /**
     * User Data logic (see https://github.com/linode/manager/pull/8850)
     * 1) if user data has been provided, encode it and include it in the payload
     *    The backend will use the newly provided user data.
     * 2) if the "Reuse User Data" checkbox is checked, remove the Metadata property from the payload
     *    The backend will continue to use the existing user data.
     * 3) if user data has not been provided and the Reuse User Data checkbox is not checked, send null in the payload
     *    The backend deletes the Linode's user data. The Linode will no longer use user data.
     */
    if (values.metadata?.user_data) {
      values.metadata.user_data = utoa(values.metadata.user_data);
    } else if (values.reuseUserData) {
      values.metadata = undefined;
    } else {
      values.metadata = { user_data: null };
    }

    // Distributed instances are encrypted by default and disk_encryption should not be included in the payload.
    if (linode.site_type === 'distributed') {
      values.disk_encryption = undefined;
    }

    try {
      await rebuildLinode(values);

      enqueueSnackbar('Linode rebuild started.', { variant: 'info' });
      checkForNewEvents();
      onSuccess();
    } catch (errors) {
      for (const error of errors) {
        form.setError(error.field ?? 'root', { message: error.reason });
      }
    }
  };

  const previousSubmitCount = useRef<number>(0);

  useEffect(() => {
    if (
      !isEmpty(form.formState.errors) &&
      form.formState.submitCount > previousSubmitCount.current
    ) {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
    previousSubmitCount.current = form.formState.submitCount;
  }, [form.formState]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {isLinodeReadOnly && <LinodePermissionsError />}
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
          <Stack
            divider={<Divider />}
            spacing={2}
            sx={{
              'hr + hr': {
                display: 'none',
              },
            }}
          >
            <RebuildFromSelect
              disabled={isLinodeReadOnly}
              setType={setType}
              type={type}
            />
            {form.formState.errors.stackscript_id?.message && (
              <Notice
                text={form.formState.errors.stackscript_id?.message}
                variant="error"
              />
            )}
            {type === 'Account StackScript' && (
              <StackScriptSelectionList type="Account" />
            )}
            {type === 'Community StackScript' && (
              <StackScriptSelectionList type="Community" />
            )}
            {type.includes('StackScript') && <UserDefinedFields />}
            <Image disabled={isLinodeReadOnly} />
            <Password disabled={isLinodeReadOnly} />
            <SSHKeys disabled={isLinodeReadOnly} />
            <DiskEncryption
              disabled={isLinodeReadOnly}
              isLKELinode={linode.lke_cluster_id !== null}
              linodeRegion={linode.region}
            />
            <UserData disabled={isLinodeReadOnly} linodeId={linode.id} />
            <Confirmation
              disabled={isLinodeReadOnly}
              linodeLabel={linode.label}
            />
          </Stack>
          <Actions disabled={isLinodeReadOnly} />
        </Stack>
      </form>
    </FormProvider>
  );
};
