import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { Button } from 'src/components/Button/Button';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

import { AttachmentError } from '../Support/SupportTicketDetail/SupportTicketDetail';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: theme.textColors.linkActiveLight,
  },
}));

export type CombinedProps = RouteComponentProps<{}>;

export const SupportWidget: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

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
      <Button
        buttonType="secondary"
        className={classes.root}
        onClick={() => setOpen(true)}
      >
        Open Support Ticket
      </Button>
      <SupportTicketDialog
        onClose={() => setOpen(false)}
        onSuccess={onTicketCreated}
        open={open}
      />
    </>
  );
};

const enhanced = compose<CombinedProps, {}>(React.memo, withRouter);
export default enhanced(SupportWidget);
