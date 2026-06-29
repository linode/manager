import { NotificationBanner } from '@akamai/cds-components/react';
import { Font, Spacing } from '@akamai/cds-tokens';
import { useGenerateShareGroupTokenMutation } from '@linode/queries';
import { ActionsPanel, Drawer, Stack, TextField, Typography } from '@linode/ui';
import { useLocation, useNavigate } from '@tanstack/react-router';
import copy from 'copy-to-clipboard';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';

import {
  REQUEST_MEMBERSHIP_DRAWER_FINAL_STEP_COPY,
  REQUEST_MEMBERSHIP_DRAWER_INFO_NOTICE,
  REQUEST_MEMBERSHIP_DRAWER_INITIAL_COPY,
  REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS,
} from '../../constants';
import { StyledButton } from './MembershipRequestDrawer.styles';

import type { APIError, SharegroupToken } from '@linode/api-v4';

interface FormValues {
  shareGroupUuid: string;
}

export const MembershipRequestDrawer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isTokenGenerated, setIsTokenGenerated] = React.useState(false);
  const [generatedTokenObject, setGeneratedTokenObject] =
    React.useState<null | SharegroupToken>(null);

  const {
    clearErrors,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { shareGroupUuid: '' },
    mode: 'onBlur',
  });

  const { mutateAsync: generateToken } = useGenerateShareGroupTokenMutation();

  const open = pathname === '/images/share-groups/membership-requests/request';

  const onClose = () => {
    reset();
    setIsTokenGenerated(false);
    setGeneratedTokenObject(null);
    navigate({
      params: { shareGroupsType: 'membership-requests' },
      to: '/images/share-groups/$shareGroupsType',
    });
  };

  const onSubmit = handleSubmit(async ({ shareGroupUuid }) => {
    try {
      const result = await generateToken({ sharegroupUuid: shareGroupUuid });
      setGeneratedTokenObject(result);
      setIsTokenGenerated(true);
    } catch (err) {
      for (const error of err as APIError[]) {
        if (error.field === 'sharegroupUuid') {
          setError('shareGroupUuid', { message: error.reason });
        } else {
          setError('root', { message: error.reason });
        }
      }
    }
  });

  return (
    <Drawer
      data-pendo-id={REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.xButton}
      onClose={onClose}
      open={open}
      title="Request membership"
    >
      {!isTokenGenerated ? (
        <form onSubmit={onSubmit}>
          <Stack spacing={0.25}>
            <Typography>{REQUEST_MEMBERSHIP_DRAWER_INITIAL_COPY}</Typography>
            <Controller
              control={control}
              name="shareGroupUuid"
              render={({ field, fieldState }) => (
                <TextField
                  clearable
                  data-pendo-id={
                    REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.shareGroupUuid
                  }
                  errorText={fieldState.error?.message ?? errors.root?.message}
                  label="Share group UUID"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    clearErrors('root');
                  }}
                />
              )}
            />
            <ActionsPanel
              primaryButtonProps={{
                'data-pendo-id':
                  REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.generateToken,
                label: 'Generate Token',
                loading: isSubmitting,
                onClick: onSubmit,
              }}
            />
          </Stack>
        </form>
      ) : (
        <Stack>
          <Typography sx={{ whiteSpace: 'pre-line' }}>
            {REQUEST_MEMBERSHIP_DRAWER_FINAL_STEP_COPY}
          </Typography>
          <NotificationBanner
            data-pendo-id={
              REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.notificationBanner
            }
            dismissible
            style={{ margin: `${Spacing.S16} 0 ${Spacing.S16} 0` }}
            type="info"
          >
            <Typography sx={{ fontSize: Font.FontSize.Xs }}>
              {REQUEST_MEMBERSHIP_DRAWER_INFO_NOTICE}
            </Typography>
          </NotificationBanner>
          <CopyableTextField
            data-pendo-id={REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.copyToken}
            expand
            label="Token"
            multiline
            noMarginTop
            rows={1}
            value={generatedTokenObject?.token}
          />
          <StyledButton
            buttonType="outlined"
            data-pendo-id={REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.copyTokenButton}
            onClick={() => copy(generatedTokenObject?.token ?? '')}
          >
            Copy Token
          </StyledButton>
          <CopyableTextField
            data-pendo-id={REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.copyDraftEmail}
            expand
            label="Draft email"
            multiline
            noMarginTop
            rows={1}
            value={draftEmail(
              generatedTokenObject?.valid_for_sharegroup_uuid ?? '',
              generatedTokenObject?.token ?? ''
            )}
          />
          <StyledButton
            buttonType="outlined"
            data-pendo-id={
              REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.copyDraftEmailButton
            }
            onClick={() =>
              copy(
                draftEmail(
                  generatedTokenObject?.valid_for_sharegroup_uuid ?? '',
                  generatedTokenObject?.token ?? ''
                )
              )
            }
          >
            Copy Draft Email
          </StyledButton>
          <ActionsPanel
            secondaryButtonProps={{
              buttonType: 'outlined',
              label: 'Close',
              onClick: onClose,
              'data-pendo-id': REQUEST_MEMBERSHIP_DRAWER_PENDO_IDS.closeButton,
            }}
          />
        </Stack>
      )}
    </Drawer>
  );
};

const draftEmail = (shareGroupUuid: string, token: string) => {
  return `This token authorizes the verification needed to be added to the Share Group (UUID ${shareGroupUuid}), and will be valid for 30 days from its creation on ${new Date().toLocaleDateString()}.

Token:
${token}`;
};
