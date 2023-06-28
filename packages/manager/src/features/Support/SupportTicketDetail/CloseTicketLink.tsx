import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { useSupportTicketCloseMutation } from 'src/queries/support';

const useStyles = makeStyles()((theme: Theme) => ({
  closeLink: {
    ...theme.applyLinkStyles,
  },
}));

interface Props {
  ticketId: number;
}

export const CloseTicketLink = ({ ticketId }: Props) => {
  const { classes } = useStyles();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const {
    mutateAsync: closeSupportTicket,
    isLoading,
    error,
  } = useSupportTicketCloseMutation(ticketId);

  const closeTicket = async () => {
    await closeSupportTicket();
    setIsDialogOpen(false);
  };

  const actions = (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={() => setIsDialogOpen(false)}
        data-qa-dialog-cancel
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={closeTicket}
        loading={isLoading}
        data-qa-dialog-submit
      >
        Confirm
      </Button>
    </ActionsPanel>
  );

  return (
    <React.Fragment>
      <Typography>
        {`If everything is resolved, you can `}
        <button
          onClick={() => setIsDialogOpen(true)}
          type="button"
          title="Close this ticket"
          className={classes.closeLink}
          data-qa-close-ticket-link
        >
          close this ticket
        </button>
        .
      </Typography>
      <ConfirmationDialog
        open={isDialogOpen}
        title={`Confirm Ticket Close`}
        onClose={() => setIsDialogOpen(false)}
        actions={actions}
        error={error?.[0].reason}
      >
        <Typography>{`Are you sure you want to close this ticket?`}</Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};
