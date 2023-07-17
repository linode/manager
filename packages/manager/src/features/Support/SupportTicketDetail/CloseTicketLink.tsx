import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
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
    error,
    isLoading,
    mutateAsync: closeSupportTicket,
  } = useSupportTicketCloseMutation(ticketId);

  const closeTicket = async () => {
    await closeSupportTicket();
    setIsDialogOpen(false);
  };

  const actions = (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        data-qa-dialog-cancel
        onClick={() => setIsDialogOpen(false)}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        data-qa-dialog-submit
        loading={isLoading}
        onClick={closeTicket}
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
          className={classes.closeLink}
          data-qa-close-ticket-link
          onClick={() => setIsDialogOpen(true)}
          title="Close this ticket"
          type="button"
        >
          close this ticket
        </button>
        .
      </Typography>
      <ConfirmationDialog
        actions={actions}
        error={error?.[0].reason}
        onClose={() => setIsDialogOpen(false)}
        open={isDialogOpen}
        title={`Confirm Ticket Close`}
      >
        <Typography>{`Are you sure you want to close this ticket?`}</Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};
