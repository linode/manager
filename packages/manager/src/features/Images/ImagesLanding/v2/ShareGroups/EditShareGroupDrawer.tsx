import { useUpdateShareGroupMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Stack, TextField, Typography } from '@linode/ui';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { EDIT_SHARE_GROUP_PENDO_IDS } from '../constants';

import type {
  APIError,
  Sharegroup,
  UpdateSharegroupPayload,
} from '@linode/api-v4';

interface Props {
  errors?: APIError[] | null;
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  shareGroup: Sharegroup | undefined;
}

export const EditShareGroupDrawer = (props: Props) => {
  const { errors, isFetching, onClose, open, shareGroup } = props;

  const { label, description, id } = shareGroup ?? {};

  const initialValues = {
    label: label ?? '',
    description: description ?? '',
  };

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<UpdateSharegroupPayload>({
    values: initialValues,
    mode: 'onBlur',
  });

  const { mutateAsync: updateShareGroup } = useUpdateShareGroupMutation();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateShareGroup({ data: values, sharegroupId: String(id) });
      onClose();
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          setError(error.field, { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer
      closeButtonPendoId={EDIT_SHARE_GROUP_PENDO_IDS.xButton}
      error={errors}
      isFetching={isFetching}
      onClose={handleClose}
      open={open}
      title="Edit Group Details"
    >
      <form onSubmit={onSubmit}>
        {!errors && (
          <>
            <Stack spacing={2}>
              <Typography>
                Note: details are visible to all group members.
              </Typography>
              <Controller
                control={control}
                name="label"
                render={({ field, fieldState }) => {
                  return (
                    <TextField
                      label="Share group name"
                      noMarginTop
                      {...field}
                      data-pendo-id={EDIT_SHARE_GROUP_PENDO_IDS.label}
                      errorText={fieldState.error?.message}
                    />
                  );
                }}
              />
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <TextField
                    errorText={fieldState.error?.message}
                    label="Description"
                    multiline
                    noMarginTop
                    {...field}
                    data-pendo-id={EDIT_SHARE_GROUP_PENDO_IDS.description}
                    rows={1}
                  />
                )}
              />
            </Stack>
            <ActionsPanel
              primaryButtonProps={{
                disabled: !isDirty,
                label: 'Save Changes',
                loading: isSubmitting,
                onClick: onSubmit,
                'data-pendo-id': EDIT_SHARE_GROUP_PENDO_IDS.saveButton,
              }}
              secondaryButtonProps={{
                label: 'Cancel',
                onClick: handleClose,
                'data-pendo-id': EDIT_SHARE_GROUP_PENDO_IDS.cancelButton,
              }}
              style={{ marginTop: 16 }}
            />
          </>
        )}
      </form>
    </Drawer>
  );
};
