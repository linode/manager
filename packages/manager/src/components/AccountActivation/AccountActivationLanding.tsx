import Warning from '@material-ui/icons/CheckCircle';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Theme, useTheme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import SupportTicketDrawer from 'src/features/Support/SupportTickets/SupportTicketDrawer';

const useStyles = makeStyles((theme: Theme) => ({
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
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme<Theme>();

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
      CustomIcon={Warning}
      CustomIconStyles={{
        color: theme.color.blue,
      }}
      errorText={
        <React.Fragment>
          <Typography variant="h2" className={classes.errorHeading}>
            Thanks for signing up!
          </Typography>
          <Typography className={classes.subheading}>
            Your account is currently being reviewed. You&rsquo;ll receive an
            email from us once our review is complete, so hang tight! If you
            have questions during this process{' '}
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
