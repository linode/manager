import { useGrants, useUpdateVolumeMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Notice } from '@linode/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { TagsInput } from 'src/components/TagsInput/TagsInput';

import type { APIError, Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: undefined | Volume;
}

export const ManageTagsDrawer = (props: Props) => {
  const { isFetching, onClose: _onClose, open, volume } = props;

  const { data: grants } = useGrants();

  const { mutateAsync: updateVolume } = useUpdateVolumeMutation();

  const isReadOnly =
    grants !== undefined &&
    grants.volume.find((grant) => grant.id === volume?.id)?.permissions ===
      'read_only';

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
      await updateVolume({
        label: volume?.label ?? '',
        tags: values.tags,
        volumeId: volume?.id ?? -1,
      });

      onClose();
    } catch (errors) {
      errors.forEach((error: APIError) => {
        if (error.field == 'tags') {
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
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title="Manage Volume Tags"
    >
      <form onSubmit={onSubmit}>
        {isReadOnly && (
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
              disabled={isReadOnly}
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
            disabled: isReadOnly || !isDirty,
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
