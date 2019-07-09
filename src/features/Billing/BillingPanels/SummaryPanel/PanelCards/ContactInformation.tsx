import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';

import Dialog from './CancelAccountDialog';

import styled, { StyleProps } from 'src/containers/SummaryPanels.styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  title: {},
  summarySection: {},
  section: {},
  main: {},
  sidebar: {},
  domainSidebar: {},
  titleWrapper: {},
  region: {},
  regionInner: {},
  volumeLink: {},
  wordWrap: {
    wordBreak: 'break-all'
  },
  cancel: {
    marginTop: theme.spacing(2),
    color: theme.palette.primary.main,
    cursor: 'pointer'
  }
}));

interface Props {
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
  username: string;
}

type CombinedProps = Props & StyleProps;

const ContactInformation: React.FC<CombinedProps> = props => {
  const localClasses = useStyles();

  const [modalOpen, toggleModal] = React.useState<boolean>(false);

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
    username,
    phone,
    activeSince,
    classes
  } = props;

  return (
    <React.Fragment>
      <Paper className={classes.summarySection} data-qa-contact-summary>
        <Typography variant="h3" className={classes.title}>
          Contact Information
        </Typography>

        <div className={classes.section} data-qa-company>
          <strong>Company Name:&nbsp;</strong>
          <div className={localClasses.wordWrap}>
            {company ? company : 'None'}
          </div>
        </div>
        <div className={classes.section} data-qa-contact-name>
          <strong>Name:&nbsp;</strong>
          {!(firstName || lastName) && 'None'}
          <div
            className={localClasses.wordWrap}
          >{`${firstName} ${lastName}`}</div>
        </div>
        <div className={classes.section} data-qa-contact-address>
          <div>
            <strong>Address:&nbsp;</strong>
          </div>
          <div>
            {!(address1 || address2 || city || state || zip) && 'None'}
            <span>{address1}</span>
            <div>{address2}</div>
            <div>{`${city} ${city && state && ', '} ${state} ${zip}`}</div>
          </div>
        </div>
        <div className={classes.section} data-qa-contact-email>
          <strong>Email:&nbsp;</strong>
          <div className={localClasses.wordWrap}>{email}</div>
        </div>
        <div className={classes.section} data-qa-contact-phone>
          <strong>Phone Number:&nbsp;</strong>
          {phone ? phone : 'None'}
        </div>
        <div className={classes.section}>
          <strong>Active Since:&nbsp;</strong>
          <DateTimeDisplay value={activeSince} format="MMMM D, YYYY" />
        </div>
        <Typography
          onClick={() => toggleModal(true)}
          className={localClasses.cancel}
        >
          <strong>Cancel Account</strong>
        </Typography>
      </Paper>
      <Dialog
        username={username}
        closeDialog={() => toggleModal(false)}
        open={modalOpen}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(ContactInformation);
