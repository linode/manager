import Warning from '@mui/icons-material/CheckCircle';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Typography } from 'src/components/Typography';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import { SupportTicketDialog } from 'src/features/Support/SupportTickets/SupportTicketDialog';

const useStyles = makeStyles()((theme: Theme) => ({
  cta: {
    ...theme.applyLinkStyles,
  },
  errorHeading: {
    marginBottom: theme.spacing(2),
  },
  subheading: {
    margin: '0 auto',
    maxWidth: '60%',
  },
}));

const AccountActivationLanding = () => {
  const { classes } = useStyles();
  const history = useHistory();

  const [supportDrawerIsOpen, toggleSupportDrawer] = React.useState<boolean>(
    false
  );

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
    <ErrorState
      errorText={
        <React.Fragment>
          <Typography className={classes.errorHeading} variant="h2">
            Your account is currently being reviewed.
          </Typography>
          <Typography className={classes.subheading}>
            Thanks for signing up! You&rsquo;ll receive an email from us once
            our review is complete, so hang tight. If you have questions during
            this process{' '}
            <button
              className={classes.cta}
              onClick={() => toggleSupportDrawer(true)}
            >
              please open a Support ticket
            </button>
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
      CustomIcon={Warning}
      CustomIconStyles={{ color: '#63A701' }}
    />
  );
};

export default React.memo(AccountActivationLanding);
