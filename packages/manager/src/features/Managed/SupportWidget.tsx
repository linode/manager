import { Button } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

import type { AttachmentError } from '../Support/SupportTicketDetail/SupportTicketDetail';

export const SupportWidget = () => {
  const navigate = useNavigate();

  const [open, setOpen] = React.useState<boolean>(false);
  const onTicketCreated = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    navigate({
      to: '/support/tickets/$ticketId',
      params: { ticketId },
      state: (prev) => ({
        ...prev,
        attachmentErrors,
      }),
    });
  };

  return (
    <>
      <StyledButton buttonType="secondary" onClick={() => setOpen(true)}>
        Open Support Ticket
      </StyledButton>
      <SupportTicketDialog
        onClose={() => setOpen(false)}
        onSuccess={onTicketCreated}
        open={open}
      />
    </>
  );
};

const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
}));

export default React.memo(SupportWidget);
