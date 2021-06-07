import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import styled from 'src/containers/SummaryPanels.styles';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  root: {
    display: 'flex',
  },
  expired: {
    color: theme.color.red,
  },
}));

interface Props {
  lastFour?: string;
  expiry?: string;
}

export type CombinedProps = Props;

/**
 * @TODO: delete this component once google pay is released.
 * this component will be replaced by the Payment Method Row Component
 */
export const CreditCardInfo: React.FC<CombinedProps> = (props) => {
  const { expiry, lastFour } = props;
  const classes = useStyles();

  return (
    <>
      <div className={`${classes.section} ${classes.root}`} data-qa-contact-cc>
        <div>
          {lastFour
            ? `Card ending in ${lastFour}`
            : 'No payment method has been specified for this account.'}
        </div>
      </div>
      <div
        className={`${classes.section} ${classes.root}`}
        data-qa-contact-cc-exp-date
      >
        <div>
          {expiry && `Expires ${expiry}`}
          {expiry && isCreditCardExpired(expiry) && (
            <span className={classes.expired}> (Expired)</span>
          )}
        </div>
      </div>
    </>
  );
};

export default CreditCardInfo;
