import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useSMSOptOutMutation } from 'src/queries/profile';
import { useProfile } from 'src/queries/profile';

import { getFormattedNumber } from './PhoneVerification/helpers';

export const SMSMessaging = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const {
    error,
    isLoading,
    mutateAsync: optOut,
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
        hasVerifiedPhoneNumber={hasVerifiedPhoneNumber}
        spacingBottom={16}
        spacingLeft={1}
        spacingTop={12}
        variant={hasVerifiedPhoneNumber ? 'success' : 'warning'}
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
          <ActionsPanel
            primaryButtonProps={{
              label: 'Opt Out',
              loading: isLoading,
              onClick: onOptOut,
            }}
            secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
          />
        )}
        error={error?.[0].reason}
        onClose={onClose}
        open={open}
        title={'Opt out of SMS messaging for phone verification'}
      >
        <Typography>
          Opting out of SMS messaging will reduce security and limit the ways
          you can securely access your account.{' '}
          <Link to="https://www.linode.com/docs/guides/linode-manager-security-controls/">
            Learn more about security options.
          </Link>
        </Typography>
        <Notice
          spacingBottom={0}
          spacingTop={16}
          sx={{ fontSize: '0.875rem !important' }}
          variant="error"
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
  lineHeight: '20px',
  maxWidth: 960,
}));

const StyledNotice = styled(Notice, {
  label: 'StyledNotice',
})<{ hasVerifiedPhoneNumber: boolean }>(
  ({ hasVerifiedPhoneNumber, theme }) => ({
    borderLeft: hasVerifiedPhoneNumber
      ? `5px solid ${theme.color.green}`
      : `5px solid ${theme.color.yellow}`,
  })
);
