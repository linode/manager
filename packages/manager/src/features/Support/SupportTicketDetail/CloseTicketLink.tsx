import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
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
    mutateAsync: closeSupportTicket,
    isLoading,
    error,
  } = useSupportTicketCloseMutation(ticketId);

  const closeTicket = async () => {
    await closeSupportTicket();
    setIsDialogOpen(false);
  };

  const actions = (
    <ActionsPanel
      primary
      primaryButtonDataTestId="dialog-submit"
      primaryButtonHandler={closeTicket}
      primaryButtonLoading={isLoading}
      primaryButtonText="Confrim"
      secondary
      secondaryButtonDataTestId="dialog-cancel"
      secondaryButtonHandler={() => setIsDialogOpen(false)}
      secondaryButtonText="Cancel"
    />
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
