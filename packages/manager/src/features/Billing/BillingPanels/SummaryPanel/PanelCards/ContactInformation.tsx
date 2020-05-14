import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';

import BillingContactDrawer from './EditBillingContactDrawer';

import styled from 'src/containers/SummaryPanels.styles';
import * as classNames from 'classnames';

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
  switchWrapperFlex: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
    '& > div:nth-last-child(2)': {
      flexGrow: 1
    },
    '& > div:last-child': {
      alignSelf: 'end'
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
    fontWeight: 700,
    background: 'none',
    border: 'none'
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
    <Grid item xs={6}>
      <Paper className={classes.summarySection} data-qa-contact-summary>
        <Grid container spacing={2} className={classes.grid}>
          <Grid item className={classes.switchWrapper}>
            <Typography variant="h3" className={classes.title}>
              Billing Contact
            </Typography>
          </Grid>

          <Grid item>
            <button
              className={classes.editBtn}
              onClick={() => {
                handleEditDrawerOpen();
              }}
            >
              Edit
            </button>
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
              </div>
            </div>

            <div className={classes.section}>
              <div>
                <div>{`${city}${city && state && ','} ${state} ${zip}`}</div>
              </div>
            </div>
          </Grid>

          <Grid
            item
            className={classNames({
              [classes.switchWrapper]: true,
              [classes.switchWrapperFlex]:
                taxId !== undefined && taxId !== null && taxId !== ''
            })}
          >
            <div className={classes.section} data-qa-contact-email>
              <div className={classes.wordWrap}>{email}</div>
            </div>
            {phone ? (
              <div className={classes.section} data-qa-contact-phone>
                {phone}
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
    </Grid>
  );
};

export default compose<CombinedProps, Props>(React.memo)(ContactInformation);
