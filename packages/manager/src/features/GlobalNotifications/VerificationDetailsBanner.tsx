import { Box, Button, Notice, Typography } from '@linode/ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

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
    <Notice forceImportantIconVerticalCenter variant="warning">
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        justifyContent="space-between"
        sx={{
          width: '100%',
        }}
      >
        <Typography variant="body1">
          Add verification details to enhance account security and ensure prompt
          assistance when needed.
        </Typography>
        <Button
          buttonType="primary"
          data-testid="confirmButton"
          onClick={() => history.push('/profile/auth', focusOptions)}
          sx={{
            width: 250,
          }}
        >
          Add verification details
        </Button>
      </Box>
    </Notice>
  );
};
