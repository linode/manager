import { NotificationBanner } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useShareGroupQuery,
  useShareGroupsAddMembersMutation,
} from '@linode/queries';
import { ActionsPanel, Drawer, Stack, TextField, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { ADD_MEMBERS_DRAWER_PENDO_IDS } from '../../constants';

import type { AddSharegroupMemberPayload } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  shareGroupId?: string;
}

export const AddMembersDrawer = (props: Props) => {
  const { onClose, onSuccess, open, shareGroupId } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors: formErrors, isSubmitting },
    reset,
  } = useForm<AddSharegroupMemberPayload>();

  const {
    data: shareGroup,
    isLoading,
    error: shareGroupError,
  } = useShareGroupQuery(shareGroupId ?? '', !!shareGroupId);

  const { mutateAsync: addMembersToSharegroup } =
    useShareGroupsAddMembersMutation({});

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addMembersToSharegroup({
        sharegroupId: Number(shareGroupId),
        data: values,
      });
      enqueueSnackbar('Access to the share group has been granted', {
        variant: 'success',
      });
      reset();
      onSuccess();
    } catch (errors) {
      for (const error of errors) {
        if (error.field === 'label' || error.field === 'token') {
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
      closeButtonPendoId={ADD_MEMBERS_DRAWER_PENDO_IDS.xButton}
      error={shareGroupError}
      isFetching={isLoading}
      onClose={handleClose}
      open={open}
      title="Add Members"
    >
      {formErrors?.root?.message && (
        <NotificationBanner
          dismissible
          style={{ marginBottom: Spacing.S16 }}
          text={formErrors?.root?.message}
          type="error"
        />
      )}
      <Stack mb={2} spacing={1}>
        <Typography variant="h3">Share group</Typography>
        <Typography>{shareGroup?.label}</Typography>
      </Stack>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <Stack>
                <TextField
                  data-pendo-id={ADD_MEMBERS_DRAWER_PENDO_IDS.label}
                  errorText={fieldState.error?.message}
                  label="Member name"
                  noMarginTop
                  required
                  {...field}
                />
                <Typography
                  sx={(theme) => ({
                    marginTop: theme.spacingFunction(4),
                    color: theme.color.grey4,
                    fontSize: '12px',
                  })}
                >
                  Only visible to the group owner
                </Typography>
              </Stack>
            )}
          />
          <Controller
            control={control}
            name="token"
            render={({ field, fieldState }) => (
              <TextField
                data-pendo-id={ADD_MEMBERS_DRAWER_PENDO_IDS.token}
                errorText={fieldState.error?.message}
                label="Token"
                multiline
                noMarginTop
                required
                {...field}
                rows={1}
              />
            )}
          />
        </Stack>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Save',
            loading: isSubmitting,
            onClick: onSubmit,
            'data-pendo-id': ADD_MEMBERS_DRAWER_PENDO_IDS.saveButton,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
            'data-pendo-id': ADD_MEMBERS_DRAWER_PENDO_IDS.cancelButton,
          }}
          style={{ marginTop: 16 }}
        />
      </form>
    </Drawer>
  );
};
