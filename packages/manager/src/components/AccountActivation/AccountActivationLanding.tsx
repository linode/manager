import { Box, ErrorState, StyledLinkButton, Typography } from '@linode/ui';
import Warning from '@mui/icons-material/CheckCircle';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import Logo from 'src/assets/logo/akamai-logo.svg';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

import type { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';

export const AccountActivationLanding = () => {
  const history = useHistory();

  const [supportDrawerIsOpen, toggleSupportDrawer] =
    React.useState<boolean>(false);

  const handleTicketSubmitSuccess = (
    ticketID: number,
    attachmentErrors?: AttachmentError[]
  ) => {
    history.push({
      pathname: `/support/tickets/${ticketID}`,
      state: { attachmentErrors },
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
              sx={(theme) => ({ marginBottom: theme.spacing(2) })}
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
              <StyledLinkButton onClick={() => toggleSupportDrawer(true)}>
                please open a Support ticket
              </StyledLinkButton>
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
