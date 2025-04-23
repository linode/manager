import { Button } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';

import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

import type { AttachmentError } from '../Support/SupportTicketDetail/SupportTicketDetail';

export const SupportWidget = () => {
  const history = useHistory();

  const [open, setOpen] = React.useState<boolean>(false);
  const onTicketCreated = (
    ticketId: number,
    attachmentErrors: AttachmentError[] = []
  ) => {
    history.push({
      pathname: `/support/tickets/${ticketId}`,
      state: { attachmentErrors },
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
