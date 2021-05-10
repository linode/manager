import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Volume from 'src/assets/icons/entityIcons/volume.svg';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import Chip from 'src/components/core/Chip';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
  },
  icon: {
    marginLeft: '10px',
  },
  expired: {
    color: theme.color.red,
    paddingLeft: '0',
  },
  actions: {
    marginLeft: 'auto',
  },
  card: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      display: 'grid',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props {
  lastFour?: string;
  expiry?: string;
  isDefault?: boolean;
}

type CombinedProps = Props;

const PaymentMethodRow: React.FC<CombinedProps> = (props) => {
  const { expiry, lastFour, isDefault } = props;
  const classes = useStyles();
  const isCardExpired = expiry && isCreditCardExpired(expiry);

  const actions: Action[] = [
    {
      title: 'Make a Payment',
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Make Default',
      disabled: isDefault,
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Edit',
      onClick: () => {
        ('');
      },
    },
    {
      title: 'Remove',
      onClick: () => {
        ('');
      },
    },
  ];

  return (
    <Paper className={classes.root} border>
      <Grid container>
        <Grid item className={classes.item}>
          <Volume className={classes.icon} />
        </Grid>
        <Grid item className={classes.item}>
          <Grid item className={classes.card}>
            <Typography>Visa ending in {lastFour}</Typography>
            {Boolean(expiry) && (
              <Typography>
                {isCardExpired ? (
                  <span className={classes.expired}>
                    &nbsp;{`(Expired ${expiry})`}
                  </span>
                ) : (
                  <span>&nbsp;{`(Expires ${expiry})`}</span>
                )}
              </Typography>
            )}
          </Grid>
        </Grid>
        <Grid item className={classes.item}>
          {isDefault && <Chip label="Default" component="span" />}
        </Grid>
        <Grid item className={classes.actions}>
          <ActionMenu
            actionsList={actions}
            ariaLabel={`Action menu for card ending in ${lastFour}`}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(PaymentMethodRow);
