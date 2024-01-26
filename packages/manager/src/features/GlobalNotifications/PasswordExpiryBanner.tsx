import { styled } from '@mui/system';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Typography } from 'src/components/Typography';
import { LOGIN_ROOT, PASSWORD_EXPIRY_NOTIFICATION_DAYS } from 'src/constants';
import { useProfile } from 'src/queries/profile';

export const PasswordExpiryBanner = () => {
  const { data: profile } = useProfile();

  const password_expiry_timestamp = profile?.password_expiry_timestamp ?? -1;
  const username = profile?.username;
  const dateTime = new Date(password_expiry_timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDateTime = new Intl.DateTimeFormat('en-US', options).format(
      dateTime
  );
  const current_date_timestamp = new Date().getTime();
  const difference_in_milliseconds =
      password_expiry_timestamp - current_date_timestamp;
  const difference_in_days = Math.floor(
      difference_in_milliseconds / (1000 * 60 * 60 * 24)
  );

  if (
      password_expiry_timestamp == null ||
      password_expiry_timestamp < 0 ||
      difference_in_days > PASSWORD_EXPIRY_NOTIFICATION_DAYS
  ) {
    return null;
  }

  const handleButtonClick = () => {
    const url = `${LOGIN_ROOT}/forgot/password?username=${username}`;
    window.location.assign(url);
  };

  const preferenceKeyStamp = new Date().toISOString().slice(0, 10);

  return (
      <DismissibleBanner
          actionButton={
            <StyledActionButton buttonType="primary" onClick={handleButtonClick}>
              Reset password
            </StyledActionButton>
          }
          important
          preferenceKey={`password-expiration-${preferenceKeyStamp}`}
          variant="warning"
      >
        <Box
            alignItems="center"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
        >
          <Typography>
            {password_expiry_timestamp !== null ? (
                password_expiry_timestamp === 0 ? (
                    <span>Your password expires today.</span>
                ) : password_expiry_timestamp < 0 ? (
                    <span>Your password has already expired.</span>
                ) : (
                    <span>
                Your password will expire on{' '}
                      <strong>{formattedDateTime}</strong>
              </span>
                )
            ) : (
                <span>Password expiration information not available.</span>
            )}
          </Typography>
        </Box>
      </DismissibleBanner>
  );
};

const StyledActionButton = styled(Button)(({}) => ({
  marginLeft: 12,
  minWidth: 150,
}));
