import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import styled from 'src/containers/SummaryPanels.styles';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  wordWrap: {
    wordBreak: 'break-all'
  },
  cancel: {
    marginTop: theme.spacing(2)
  }
}));

interface Props extends Pick<RouteComponentProps, 'history'> {
  company: string;
  lastName: string;
  firstName: string;
  zip: string;
  state: string;
  city: string;
  address2: string;
  address1: string;
  email: string;
  phone: string;
  activeSince: string;
}

type CombinedProps = Props;

const ContactInformation: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    city,
    state,
    firstName,
    lastName,
    zip,
    company,
    address1,
    address2,
    email,
    phone,
    activeSince
  } = props;

  return (
    <Paper className={classes.summarySection} data-qa-contact-summary>
      <Typography variant="h3" className={classes.title}>
        Billing Contact
      </Typography>

      <div className={classes.section} data-qa-company>
        <strong>Company Name:&nbsp;</strong>
        <div className={classes.wordWrap}>{company ? company : 'None'}</div>
      </div>
      <div className={classes.section} data-qa-contact-name>
        <strong>Name:&nbsp;</strong>
        {!(firstName || lastName) && 'None'}
        <div className={classes.wordWrap}>{`${firstName} ${lastName}`}</div>
      </div>
      <div className={classes.section} data-qa-contact-address>
        <div>
          <strong>Address:&nbsp;</strong>
        </div>
        <div>
          {!(address1 || address2 || city || state || zip) && 'None'}
          <span>{address1}</span>
          <div>{address2}</div>
          <div>{`${city}${city && state && ','} ${state} ${zip}`}</div>
        </div>
      </div>
      <div className={classes.section} data-qa-contact-email>
        <strong>Email:&nbsp;</strong>
        <div className={classes.wordWrap}>{email}</div>
      </div>
      <div className={classes.section} data-qa-contact-phone>
        <strong>Phone Number:&nbsp;</strong>
        {phone ? phone : 'None'}
      </div>
      <div className={classes.section}>
        <strong>Active Since:&nbsp;</strong>
        <DateTimeDisplay value={activeSince} format="D MMM YYYY" />
      </div>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(ContactInformation);
