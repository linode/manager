import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from 'src/features/Support/SupportTickets/SupportTicketDrawer';

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
      <SupportTicketDrawer
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={onTicketCreated}
      />
    </>
  );
};

const enhanced = compose<CombinedProps, {}>(React.memo, withRouter);
export default enhanced(SupportWidget);
