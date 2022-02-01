import classNames from 'classnames';
import * as React from 'react';
import {
  RouteComponentProps,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import styled from 'src/containers/SummaryPanels.styles';
import BillingContactDrawer from './EditBillingContactDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  wordWrap: {
    wordBreak: 'break-all',
  },
  switchWrapper: {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    '&.mlMain': {
      [theme.breakpoints.up('lg')]: {
        maxWidth: '78.8%',
      },
    },
  },
  switchWrapperFlex: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
    '& > div:nth-last-child(2)': {
      flexGrow: 1,
    },
    '& > div:last-child': {
      alignSelf: 'end',
    },
  },
  edit: {
    color: theme.cmrTextColors.linkActiveLight,
    fontFamily: theme.font.normal,
    fontSize: '.875rem',
    fontWeight: 700,
    minHeight: 'unset',
    minWidth: 'auto',
    padding: 0,
    '&:hover, &:focus': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
  },
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

const ContactInformation: React.FC<CombinedProps> = (props) => {
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
    taxId,
  } = props;

  const classes = useStyles();

  const history = useHistory<{
    contactDrawerOpen?: boolean;
    focusEmail?: boolean;
  }>();

  const [
    editContactDrawerOpen,
    setEditContactDrawerOpen,
  ] = React.useState<boolean>(false);

  const [focusEmail, setFocusEmail] = React.useState(false);

  const handleEditDrawerOpen = React.useCallback(
    () => setEditContactDrawerOpen(true),
    [setEditContactDrawerOpen]
  );

  // On-the-fly route matching so this component can open the drawer itself.
  const editBillingContactRouteMatch = Boolean(
    useRouteMatch('/account/billing/edit')
  );

  React.useEffect(() => {
    if (editBillingContactRouteMatch) {
      handleEditDrawerOpen();
    }
  }, [editBillingContactRouteMatch, handleEditDrawerOpen]);

  // Listen for changes to history state and open the drawer if necessary.
  // This is currently in use by the EmailBounceNotification, which navigates
  // the user to the Account page and opens the drawer to prompt them to change
  // their billing email address.
  React.useEffect(() => {
    if (!editContactDrawerOpen && history.location.state?.contactDrawerOpen) {
      setEditContactDrawerOpen(true);
      if (history.location.state?.focusEmail) {
        setFocusEmail(true);
      }
    }
  }, [editContactDrawerOpen, history.location.state]);

  return (
    <Grid item xs={12} md={6}>
      <Paper className={classes.summarySection} data-qa-contact-summary>
        <Grid container spacing={2}>
          <Grid item className={classes.switchWrapper}>
            <Typography variant="h3" className={classes.title}>
              Billing Contact
            </Typography>
          </Grid>
          <Grid item>
            <Button
              className={classes.edit}
              onClick={() => {
                history.push('/account/billing/edit');
                handleEditDrawerOpen();
              }}
            >
              Edit
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {(firstName ||
            lastName ||
            company ||
            address1 ||
            address2 ||
            city ||
            state ||
            zip) && (
            <Grid item className={classes.switchWrapper}>
              {(firstName || lastName) && (
                <div className={classes.section} data-qa-contact-name>
                  <div
                    className={classes.wordWrap}
                  >{`${firstName} ${lastName}`}</div>
                </div>
              )}

              {company && (
                <div className={classes.section} data-qa-company>
                  <div className={classes.wordWrap}>{company}</div>
                </div>
              )}

              {(address1 || address2 || city || state || zip) && (
                <div>
                  <div className={classes.section} data-qa-contact-address>
                    <div>
                      <span>{address1}</span>
                    </div>
                  </div>

                  <div className={classes.section}>
                    <div>
                      <div>{address2}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className={classes.section}>
                <div>
                  <div>{`${city}${city && state && ','} ${state} ${zip}`}</div>
                </div>
              </div>
            </Grid>
          )}

          <Grid
            item
            className={classNames({
              [classes.switchWrapper]: true,
              [classes.switchWrapperFlex]:
                taxId !== undefined && taxId !== null && taxId !== '',
            })}
          >
            <div className={classes.section} data-qa-contact-email>
              <div className={classes.wordWrap}>{email}</div>
            </div>

            {phone && (
              <div className={classes.section} data-qa-contact-phone>
                {phone}
              </div>
            )}

            {taxId && (
              <div className={classes.section}>{'Tax ID ' + taxId}</div>
            )}
          </Grid>
        </Grid>
      </Paper>
      <BillingContactDrawer
        open={editContactDrawerOpen}
        onClose={() => {
          history.replace('/account/billing', { contactDrawerOpen: false });
          setEditContactDrawerOpen(false);
          setFocusEmail(false);
        }}
        focusEmail={focusEmail}
      />
    </Grid>
  );
};

export default compose<CombinedProps, Props>(React.memo)(ContactInformation);
