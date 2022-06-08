import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useProfile } from 'src/queries/profile';
import { useSnackbar } from 'notistack';
import { useSMSOptOutMutation } from 'src/queries/account';

const useStyles = makeStyles((theme: Theme) => ({
  notice: {
    borderLeft: `5px solid ${theme.color.green}`,
  },
  text: {
    fontSize: '0.875rem !important',
  },
  button: {
    marginTop: theme.spacing(),
    width: '150px',
  },
  copy: {
    maxWidth: 960,
  },
}));

export const SMSMessageing = () => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();
  const { mutateAsync: optOut, error, isLoading } = useSMSOptOutMutation();

  const hasVerifiedPhoneNumber = Boolean(profile?.phone_number);

  const [open, setOpen] = React.useState(false);

  const onOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
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
      <Notice
        spacingTop={12}
        spacingBottom={16}
        success={hasVerifiedPhoneNumber}
        warning={!hasVerifiedPhoneNumber}
        className={hasVerifiedPhoneNumber ? classes.notice : undefined}
      >
        <Typography className={classes.text}>
          <b>
            {hasVerifiedPhoneNumber
              ? 'You have opted in to SMS messaging for phone verification'
              : 'You are opted out of SMS messaging for phone verification'}
          </b>
        </Typography>
      </Notice>
      <Typography className={classes.copy}>
        An authentication code is sent via SMS as part of the verification
        process. Messages are not sent for any other reason. SMS authentication
        by verified phone number provides an important degree of account
        security. You may opt out at any time and your verified phone number
        will be deleted.
      </Typography>
      {hasVerifiedPhoneNumber ? (
        <Box display="flex" justifyContent="flex-end">
          <Button
            className={classes.button}
            buttonType="primary"
            onClick={onOpen}
          >
            Opt Out
          </Button>
        </Box>
      ) : null}
      <ConfirmationDialog
        title={'Opt out of SMS messaging for phone verification'}
        open={open}
        onClose={onClose}
        error={error?.[0].reason}
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
      >
        <Typography>
          Opting out of SMS messaging will reduce security and limit the ways
          you can securly access your account.{' '}
          <a href="https://www.linode.com/docs/guides/linode-manager-security-controls/">
            Learn more about security options.
          </a>
        </Typography>
        <Notice
          spacingTop={16}
          spacingBottom={0}
          className={classes.text}
          error
        >
          <b>Warning:</b> As part of this action, your verified phone number{' '}
          {profile?.phone_number} will be deleted.
        </Notice>
      </ConfirmationDialog>
    </>
  );
};
