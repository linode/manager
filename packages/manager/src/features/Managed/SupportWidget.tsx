import { styled } from '@mui/material/styles';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { Button } from 'src/components/Button/Button';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

import { AttachmentError } from '../Support/SupportTicketDetail/SupportTicketDetail';

export type SupportWidgetProps = RouteComponentProps<{}>;

export const SupportWidget = (props: SupportWidgetProps) => {
  const { history } = props;

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

const enhanced = compose<SupportWidgetProps, {}>(React.memo, withRouter);
export default enhanced(SupportWidget);
