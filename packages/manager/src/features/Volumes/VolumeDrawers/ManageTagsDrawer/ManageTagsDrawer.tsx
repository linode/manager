import { useVolumeUpdateMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice } from '@linode/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import type { APIError, Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
  volumeError?: APIError[] | null;
}

export const ManageTagsDrawer = (props: Props) => {
  const { isFetching, onClose: _onClose, open, volume, volumeError } = props;

  const { data: accountPermissions } = usePermissions('account', [
    'is_account_admin',
  ]);

  const { data: permissions } = usePermissions(
    'volume',
    ['update_volume'],
    volume?.id
  );
  const canUpdateVolume = permissions?.update_volume;

  const { mutateAsync: updateVolume } = useVolumeUpdateMutation(
    volume?.id ?? -1
  );

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm<{ tags: string[] }>({
    values: { tags: volume?.tags ?? [] },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateVolume({ tags: values.tags });

      onClose();
    } catch (errors) {
      errors.forEach((error: APIError) => {
        if (error.field === 'tags') {
          setError('tags', {
            message: error.reason,
          });
        } else {
          setError('root', {
            message:
              'Unable to edit this Volume at this time. Please try again later.',
          });
        }
      });
    }
  });

  const onClose = () => {
    _onClose();
    reset({ tags: volume?.tags });
  };

  return (
    <Drawer
      error={volumeError}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title="Manage Volume Tags"
    >
      <form onSubmit={onSubmit}>
        {!canUpdateVolume && (
          <Notice
            spacingBottom={0}
            text="You don't have permission to edit this volume."
            variant="error"
          />
        )}
        {errors?.root && <Notice text={errors.root.message} variant="error" />}

        <Controller
          control={control}
          name="tags"
          render={({ field, fieldState }) => (
            <TagsInput
              disabled={!accountPermissions?.is_account_admin}
              label="Tags"
              name="tags"
              onChange={(selected) =>
                field.onChange(selected.map((item) => item.value))
              }
              tagError={fieldState.error?.message}
              value={field.value.map((t) => ({ label: t, value: t })) ?? []}
            />
          )}
        />

        <ActionsPanel
          primaryButtonProps={{
            disabled: !canUpdateVolume || !isDirty,
            label: 'Save Changes',
            loading: isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
