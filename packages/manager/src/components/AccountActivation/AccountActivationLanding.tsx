import { Box, ErrorState, Stack, Typography, useTheme } from '@linode/ui';
import CheckIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

import { LinkButton } from '../LinkButton';

import type { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';

export const AccountActivationLanding = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [supportDrawerIsOpen, toggleSupportDrawer] =
    React.useState<boolean>(false);

  const handleTicketSubmitSuccess = (
    ticketId: number,
    attachmentErrors?: AttachmentError[]
  ) => {
    navigate({
      to: '/support/tickets/$ticketId',
      params: { ticketId },
      state: (prev) => ({
        ...prev,
        attachmentErrors,
      }),
    });

    toggleSupportDrawer(false);
  };

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      height="calc(100vh - 200px)"
      justifyContent="center"
    >
      <ErrorState
        CustomIcon={CheckIcon}
        CustomIconStyles={{ color: theme.palette.success.dark }}
        errorText={
          <Stack alignItems="center" textAlign="center">
            <Typography
              sx={(theme) => ({ marginBottom: theme.spacingFunction(16) })}
              variant="h2"
            >
              Your account is currently being reviewed.
            </Typography>
            <Typography sx={{ maxWidth: { lg: '60%' } }}>
              Thanks for signing up! You&rsquo;ll receive an email from us once
              our review is complete, so hang tight. If you have questions
              during this process{' '}
              <LinkButton onClick={() => toggleSupportDrawer(true)}>
                please open a Support ticket
              </LinkButton>
              .
            </Typography>
            <SupportTicketDialog
              hideProductSelection
              keepOpenOnSuccess={true}
              onClose={() => toggleSupportDrawer(false)}
              onSuccess={handleTicketSubmitSuccess}
              open={supportDrawerIsOpen}
              prefilledTitle="Help me activate my account"
            />
          </Stack>
        }
      />
    </Box>
  );
};
