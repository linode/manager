import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';

import styled from 'src/containers/SummaryPanels.styles';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  expired: {
    color: theme.color.red
  },
  root: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'space-between'
    }
  },
  label: {
    [theme.breakpoints.only('sm')]: {
      minWidth: 150
    }
  },
  result: {
    marginLeft: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      textAlign: 'right'
    }
  }
}));

interface Props {
  lastFour?: string;
  expiry?: string;
}

export type CombinedProps = Props;

export const CreditCard: React.FC<CombinedProps> = props => {
  const { expiry, lastFour } = props;
  const classes = useStyles();
  return (
    <>
      <div className={`${classes.section} ${classes.root}`} data-qa-contact-cc>
        <div className={classes.label}>
          <strong>Credit Card: </strong>
        </div>
        <div className={classes.result}>
          {lastFour ? `Ending in ${lastFour}` : 'None'}
        </div>
      </div>
      <div
        className={`${classes.section} ${classes.root}`}
        data-qa-contact-cc-exp-date
      >
        <div className={classes.label}>
          <strong>Expiration Date: </strong>
        </div>
        <div className={classes.result}>
          {expiry ? `${expiry} ` : 'None'}
          {expiry && isCreditCardExpired(expiry) && (
            <span className={classes.expired}>(Expired)</span>
          )}
        </div>
      </div>
    </>
  );
};

export default CreditCard;
