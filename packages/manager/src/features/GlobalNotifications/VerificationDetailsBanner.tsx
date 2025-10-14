import { Box, Button, Notice, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

interface Props {
  hasSecurityQuestions: boolean;
  hasVerifiedPhoneNumber: boolean;
}

export const VerificationDetailsBanner = ({
  hasSecurityQuestions,
  hasVerifiedPhoneNumber,
}: Props) => {
  const navigate = useNavigate();
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
          onClick={() => {
            const { focusSecurityQuestions, focusTel } = focusOptions;
            navigate({
              to: '/profile/auth',
              search: {
                focusSecurityQuestions,
                focusTel,
              },
            });
          }}
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
