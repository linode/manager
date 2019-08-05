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
    justifyContent: 'space-between'
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
        <strong>Credit Card: </strong>
        {lastFour ? `Ending in ${lastFour}` : 'None'}
      </div>
      <div
        className={`${classes.section} ${classes.root}`}
        data-qa-contact-cc-exp-date
      >
        <strong>Expiration Date: </strong>
        <div>
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
