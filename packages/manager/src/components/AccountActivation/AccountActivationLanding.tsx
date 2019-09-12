import Warning from '@material-ui/icons/CheckCircle';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

import SupportTicketDrawer from 'src/features/Support/SupportTickets/SupportTicketDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  errorHeading: {
    marginBottom: theme.spacing(2)
  },
  subheading: {
    margin: '0 auto',
    maxWidth: '60%'
  },
  cta: {
    color: theme.color.blue,
    cursor: 'pointer'
  }
}));

type CombinedProps = WithTheme;

const AccountActivationLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [supportDrawerIsOpen, toggleSupportDrawer] = React.useState<boolean>(
    false
  );
  const [ticketSubmitSuccess, setTicketSubmitSuccess] = React.useState<boolean>(
    false
  );

  return (
    <ErrorState
      CustomIcon={Warning}
      CustomIconStyles={{
        color: props.theme.color.blue
      }}
      errorText={
        <React.Fragment>
          <Typography variant="h2" className={classes.errorHeading}>
            Thanks for signing up!
          </Typography>
          <Typography className={classes.subheading}>
            Your account is currently being reviewed. You'll receive an email
            from us once our review is complete, so hang tight! If you have
            questions during this process{' '}
            <span
              onClick={() => toggleSupportDrawer(true)}
              className={classes.cta}
            >
              please open a Support ticket.
            </span>
          </Typography>
          <SupportTicketDrawer
            open={supportDrawerIsOpen}
            onClose={() => toggleSupportDrawer(false)}
            onSuccess={() => setTicketSubmitSuccess(true)}
            keepOpenOnSuccess={true}
            hideProductSelection
            prefilledTitle="Help me activate my account"
          >
            {ticketSubmitSuccess ? (
              <React.Fragment>
                <Typography variant="subtitle2">
                  Your support ticket has been submitted. We will reach out as
                  soon as possible.
                </Typography>
                <ActionsPanel style={{ marginTop: 16 }}>
                  <Button
                    onClick={() => toggleSupportDrawer(false)}
                    buttonType="primary"
                  >
                    OK
                  </Button>
                </ActionsPanel>
              </React.Fragment>
            ) : null}
          </SupportTicketDrawer>
        </React.Fragment>
      }
    />
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withTheme
)(AccountActivationLanding);
