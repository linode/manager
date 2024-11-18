import { Box, Button, Notice } from '@linode/ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Typography } from 'src/components/Typography';

interface Props {
  hasSecurityQuestions: boolean;
  hasVerifiedPhoneNumber: boolean;
}

export const VerificationDetailsBanner = ({
  hasSecurityQuestions,
  hasVerifiedPhoneNumber,
}: Props) => {
  const history = useHistory();
  const focusOptions = {
    focusSecurityQuestions: false,
    focusTel: false,
  };

  if (!hasSecurityQuestions) {
    focusOptions.focusSecurityQuestions = true;
  } else if (!hasVerifiedPhoneNumber) {
    focusOptions.focusTel = true;
  }

  return (
    <Notice important spacing={1} variant="warning">
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        justifyContent="space-between"
      >
        <Typography variant="body1">
          Add verification details to enhance account security and ensure prompt
          assistance when needed.
        </Typography>
        <Button
          buttonType="primary"
          data-testid="confirmButton"
          onClick={() => history.push('/profile/auth', focusOptions)}
        >
          Add verification details
        </Button>
      </Box>
    </Notice>
  );
};
