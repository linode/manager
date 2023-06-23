import Warning from '@mui/icons-material/CheckCircle';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from 'src/features/Support/SupportTickets/SupportTicketDrawer';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  errorHeading: {
    marginBottom: theme.spacing(2),
  },
  subheading: {
    margin: '0 auto',
    maxWidth: '60%',
  },
  cta: {
    ...theme.applyLinkStyles,
  },
}));

const AccountActivationLanding = () => {
  const { classes } = useStyles();
  const history = useHistory();

  const [supportDrawerIsOpen, toggleSupportDrawer] =
    React.useState<boolean>(false);

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
      CustomIcon={Warning}
      CustomIconStyles={{ color: '#63A701' }}
      errorText={
        <React.Fragment>
          <Typography variant="h2" className={classes.errorHeading}>
            Your account is currently being reviewed.
          </Typography>
          <Typography className={classes.subheading}>
            Thanks for signing up! You&rsquo;ll receive an email from us once
            our review is complete, so hang tight. If you have questions during
            this process{' '}
            <button
              onClick={() => toggleSupportDrawer(true)}
              className={classes.cta}
            >
              please open a Support ticket
            </button>
            .
          </Typography>
          <SupportTicketDrawer
            open={supportDrawerIsOpen}
            onClose={() => toggleSupportDrawer(false)}
            onSuccess={handleTicketSubmitSuccess}
            keepOpenOnSuccess={true}
            hideProductSelection
            prefilledTitle="Help me activate my account"
          />
        </React.Fragment>
      }
    />
  );
};

export default React.memo(AccountActivationLanding);
