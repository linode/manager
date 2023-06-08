import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Box from 'src/components/core/Box';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getFormattedNumber } from './PhoneVerification/helpers';
import { Notice } from 'src/components/Notice/Notice';
import { styled } from '@mui/material/styles';
import { useProfile } from 'src/queries/profile';
import { useSMSOptOutMutation } from 'src/queries/profile';
import { useSnackbar } from 'notistack';

export const SMSMessaging = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const {
    mutateAsync: optOut,
    error,
    isLoading,
    reset,
  } = useSMSOptOutMutation();
  const hasVerifiedPhoneNumber = Boolean(profile?.verified_phone_number);
  const [open, setOpen] = React.useState(false);

  const onOpen = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
    if (error) {
      reset();
    }
  };

  const onOptOut = () => {
    optOut().then(() => {
      onClose();
      enqueueSnackbar('Successfully opted out of SMS messaging', {
        variant: 'success',
      });
    });
  };

  return (
    <>
      <StyledNotice
        spacingBottom={16}
        spacingLeft={1}
        spacingTop={12}
        success={hasVerifiedPhoneNumber}
        warning={!hasVerifiedPhoneNumber}
        hasVerifiedPhoneNumber={hasVerifiedPhoneNumber}
      >
        <Typography sx={{ fontSize: '0.875rem !important' }}>
          <b>
            {hasVerifiedPhoneNumber
              ? 'You have opted in to SMS messaging.'
              : 'You are opted out of SMS messaging.'}
          </b>
        </Typography>
      </StyledNotice>
      <StyledCopy>
        An authentication code is sent via SMS as part of the phone verification
        process. Messages are not sent for any other reason. SMS authentication
        is optional and provides an important degree of account security. You
        may opt out at any time and your verified phone number will be deleted.
      </StyledCopy>
      {hasVerifiedPhoneNumber ? (
        <Box display="flex" justifyContent="flex-end">
          <StyledButton buttonType="primary" onClick={onOpen}>
            Opt Out
          </StyledButton>
        </Box>
      ) : null}
      <ConfirmationDialog
        actions={() => (
          <ActionsPanel>
            <Button buttonType="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button buttonType="primary" loading={isLoading} onClick={onOptOut}>
              Opt Out
            </Button>
          </ActionsPanel>
        )}
        error={error?.[0].reason}
        onClose={onClose}
        open={open}
        title={'Opt out of SMS messaging for phone verification'}
      >
        <Typography>
          Opting out of SMS messaging will reduce security and limit the ways
          you can securely access your account.{' '}
          <a href="https://www.linode.com/docs/guides/linode-manager-security-controls/">
            Learn more about security options.
          </a>
        </Typography>
        <Notice
          error
          spacingBottom={0}
          spacingTop={16}
          sx={{ fontSize: '0.875rem !important' }}
        >
          <b>Warning:</b> As part of this action, your verified phone number{' '}
          {profile?.verified_phone_number
            ? getFormattedNumber(profile.verified_phone_number)
            : 'No Phone Number'}{' '}
          will be deleted.
        </Notice>
      </ConfirmationDialog>
    </>
  );
};

const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  marginTop: theme.spacing(),
  width: '150px',
}));

const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(() => ({
  maxWidth: 960,
  lineHeight: '20px',
}));

const StyledNotice = styled(Notice, {
  label: 'StyledNotice',
})<{ hasVerifiedPhoneNumber: boolean }>(
  ({ theme, hasVerifiedPhoneNumber }) => ({
    borderLeft: hasVerifiedPhoneNumber
      ? `5px solid ${theme.color.green}`
      : `5px solid ${theme.color.yellow}`,
  })
);
