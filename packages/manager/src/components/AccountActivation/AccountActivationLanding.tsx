import Warning from '@material-ui/icons/CheckCircle';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

import { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
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

type CombinedProps = WithTheme & RouteComponentProps;

const AccountActivationLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [supportDrawerIsOpen, toggleSupportDrawer] = React.useState<boolean>(
    false
  );

  const handleTicketSubmitSuccess = (
    ticketID: number,
    attachmentErrors?: AttachmentError[]
  ) => {
    props.history.push({
      pathname: `/support/tickets/${ticketID}`,
      state: { attachmentErrors }
    });

    toggleSupportDrawer(false);
  };

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
              role="button"
            >
              please open a Support ticket.
            </span>
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

export default compose<CombinedProps, {}>(
  React.memo,
  withTheme
)(AccountActivationLanding);
