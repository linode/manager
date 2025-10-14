import { Box, ErrorState, LinkButton, Typography } from '@linode/ui';
import Warning from '@mui/icons-material/CheckCircle';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import Logo from 'src/assets/logo/akamai-logo.svg';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

import type { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';

export const AccountActivationLanding = () => {
  const navigate = useNavigate();

  const [supportDrawerIsOpen, toggleSupportDrawer] =
    React.useState<boolean>(false);

  const handleTicketSubmitSuccess = (
    ticketID: number,
    attachmentErrors?: AttachmentError[]
  ) => {
    navigate({
      to: '/support/tickets/$ticketId',
      params: { ticketId: ticketID },
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
      height="100%"
      justifyContent="center"
    >
      <Logo width={215} />
      <ErrorState
        CustomIcon={Warning}
        CustomIconStyles={{ color: '#63A701' }}
        errorText={
          <React.Fragment>
            <Typography
              sx={(theme) => ({ marginBottom: theme.spacingFunction(16) })}
              variant="h2"
            >
              Your account is currently being reviewed.
            </Typography>
            <Typography
              sx={{
                margin: '0 auto',
                maxWidth: '60%',
              }}
            >
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
          </React.Fragment>
        }
      />
    </Box>
  );
};
