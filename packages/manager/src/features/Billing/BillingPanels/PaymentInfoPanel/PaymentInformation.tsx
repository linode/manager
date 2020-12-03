import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import styled from 'src/containers/SummaryPanels.styles';
import CreditCard from './CreditCard';
import UpdateCreditCardDrawer from './UpdateCreditCardDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  root: {
    display: 'flex'
  },
  summarySectionHeight: {
    flex: '0 1 auto',
    width: '100%'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  billingGroup: {
    marginBottom: theme.spacing(3)
  },
  edit: {
    fontFamily: theme.font.normal,
    color: theme.palette.primary.main,
    fontSize: '.875rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
    minWidth: 'auto',
    padding: 0,
    '&:hover, &:focus': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main,
      textDecoration: 'underline'
    }
  }
}));

interface Props {
  balanceUninvoiced: number;
  balance: number;
  expiry: string;
  lastFour: string;
  promoCredit?: string;
}

type CombinedProps = Props;

const PaymentInformation: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { lastFour, expiry } = props;

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  return (
    <Grid className={classes.root} item xs={12} md={6}>
      <Paper
        className={`${classes.summarySection} ${classes.summarySectionHeight}`}
        data-qa-billing-summary
      >
        <div className={classes.container}>
          <Typography variant="h3" className={classes.title}>
            Payment Method
          </Typography>

          <Button className={classes.edit} onClick={handleOpenDrawer}>
            Edit
          </Button>
        </div>

        <div className={classes.billingGroup}>
          <CreditCard lastFour={lastFour} expiry={expiry} />
        </div>
        <UpdateCreditCardDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </Paper>
    </Grid>
  );
};

export default compose<CombinedProps, Props>(React.memo)(PaymentInformation);
