import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { useProfile } from 'src/queries/profile';

const useStyles = makeStyles((theme: Theme) => ({
  notice: {
    fontSize: '0.875rem !important',
    fontFamily: theme.font.bold,
  },
}));

export const SMSMessageing = () => {
  const classes = useStyles();
  const { data: profile } = useProfile();

  const hasVerifiedPhoneNumber = Boolean(profile?.phone_number);

  return (
    <Box>
      <Notice
        spacingTop={12}
        spacingBottom={16}
        success={hasVerifiedPhoneNumber}
        warning={!hasVerifiedPhoneNumber}
      >
        <Typography className={classes.notice}>
          {hasVerifiedPhoneNumber
            ? 'You have opted in to SMS messaging for phone verification'
            : 'You are opted out of SMS messaging for phone verification'}
        </Typography>
      </Notice>
      <Typography>
        An authentication code is sent via SMS as part of the verification
        process. Messages are not sent for any other reason. SMS authentication
        by verified phone number provides an important degree of account
        security. You may opt out at any time and your verified phone number
        will be deleted.
      </Typography>
      {hasVerifiedPhoneNumber ? (
        <Box display="flex" justifyContent="flex-end">
          <Button buttonType="primary">Opt Out</Button>
        </Box>
      ) : null}
    </Box>
  );
};
