import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';

import BillingContactDrawer from './EditBillingContactDrawer';

import Dialog from './CancelAccountDialog';

import styled from 'src/containers/SummaryPanels.styles';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  wordWrap: {
    wordBreak: 'break-all'
  },
  cancel: {
    marginTop: theme.spacing(2)
  },
  grid: {
    [theme.breakpoints.up('lg')]: {
      height: '100%'
    }
  },
  switchWrapper: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%'
      }
    }
  },
  editBtn: {
    marginBottom: theme.spacing(1),
    ...theme.typography.body1,
    '& .dif': {
      position: 'relative',
      width: 'auto',
      '& .chip': {
        position: 'absolute',
        top: '-4px',
        right: -10
      }
    },
    cursor: 'pointer',
    color: '#3683dc',
    fontWeight: 700
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
  username: string;
  isRestrictedUser: boolean;
  taxId: string;
}

type CombinedProps = Props;

const ContactInformation: React.FC<CombinedProps> = props => {
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
    taxId
  } = props;

  const classes = useStyles();

  const [editContactDrawerOpen, setEditContactDrawerOpen] = React.useState<
    boolean
  >(false);

  const handleEditDrawerOpen = () => {
    setEditContactDrawerOpen(true);
  };

  return (
    <React.Fragment>
      <Paper className={classes.summarySection} data-qa-contact-summary>
        <Grid container spacing={2} className={classes.grid}>
          <Grid item className={classes.switchWrapper}>
            <Typography variant="h3" className={classes.title}>
              Billing Contact
            </Typography>
          </Grid>

          <Grid item>
            {/* need to fix styling, Edit should look like a link and be on same horizontal level as Billing Contact. */}
            <div
              className={classes.editBtn}
              onClick={() => {
                handleEditDrawerOpen();
              }}
            >
              Edit
            </div>
          </Grid>
        </Grid>

        <Grid container spacing={2} className={classes.grid}>
          <Grid item className={classes.switchWrapper}>
            <div className={classes.section} data-qa-contact-name>
              {!(firstName || lastName) && 'None'}
              <div
                className={classes.wordWrap}
              >{`${firstName} ${lastName}`}</div>
            </div>

            {company ? (
              <div className={classes.section} data-qa-company>
                <div className={classes.wordWrap}>{company}</div>
              </div>
            ) : null}

            <div className={classes.section} data-qa-contact-address>
              <div>
                {!(address1 || address2 || city || state || zip) && 'None'}
                <span>{address1}</span>
                <div>{address2}</div>
                <div>{`${city}${city && state && ','} ${state} ${zip}`}</div>
              </div>
            </div>
          </Grid>

          <Grid item className={classes.switchWrapper}>
            <div className={classes.section} data-qa-contact-email>
              <div className={classes.wordWrap}>{email}</div>
            </div>

            {phone ? (
              <div className={classes.section} data-qa-contact-phone>
                {phone ? phone : 'No Phone Number Provided'}
              </div>
            ) : null}

            {taxId ? (
              <div className={classes.section}>{'Tax ID ' + taxId}</div>
            ) : null}
          </Grid>
        </Grid>
      </Paper>
      <BillingContactDrawer
        open={editContactDrawerOpen}
        onClose={() => setEditContactDrawerOpen(false)}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(ContactInformation);
