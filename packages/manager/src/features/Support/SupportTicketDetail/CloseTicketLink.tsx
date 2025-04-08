import { useSupportTicketCloseMutation } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';

import type { Theme } from '@mui/material/styles';

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
    isPending,
    mutateAsync: closeSupportTicket,
  } = useSupportTicketCloseMutation(ticketId);

  const closeTicket = async () => {
    await closeSupportTicket();
    setIsDialogOpen(false);
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'dialog-submit',
        label: 'Confirm',
        loading: isPending,
        onClick: closeTicket,
      }}
      secondaryButtonProps={{
        'data-testid': 'dialog-cancel',
        label: 'Cancel',
        onClick: () => setIsDialogOpen(false),
      }}
    />
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
