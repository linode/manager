import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import styled from 'src/containers/SummaryPanels.styles';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import Visa from 'src/assets/icons/payment/visa.svg';
import Mastercard from 'src/assets/icons/payment/mastercard.svg';
import Amex from 'src/assets/icons/payment/amex.svg';
import Discover from 'src/assets/icons/payment/discover.svg';
import JCB from 'src/assets/icons/payment/jcb.svg';
import GenericCreditCard from 'src/assets/icons/credit-card.svg';
import useFlags from 'src/hooks/useFlags';

// @TODO: remove unused code and feature flag logic once google pay is released
const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    display: 'flex',
    marginLeft: 2,
    [theme.breakpoints.down('xs')]: {
      display: 'grid',
    },
  },
  cardInfo: {
    fontWeight: 'bold',
    marginRight: 10,
    [theme.breakpoints.down('xs')]: {
      marginRight: 0,
    },
  },
  expired: {
    color: theme.color.red,
  },
  icon: {
    display: 'flex',
    justifyContent: 'center',
    width: 45,
  },
}));

export type CardType = 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'JCB';

interface Props {
  type?: string;
  lastFour?: string;
  expiry?: string;
}

export type CombinedProps = Props;

export const CreditCard: React.FC<CombinedProps> = (props) => {
  const { type, expiry, lastFour } = props;
  const classes = useStyles();
  const flags = useFlags();

  const isCardExpired = expiry && isCreditCardExpired(expiry);

  const paymentIcon = (): any => {
    switch (type) {
      case 'Visa':
        return <Visa />;
      case 'Mastercard':
        return <Mastercard />;
      case 'Amex':
        return <Amex />;
      case 'Discover':
        return <Discover />;
      case 'JCB':
        return <JCB />;
      default:
        return <GenericCreditCard />;
    }
  };

  return flags.additionalPaymentMethods?.includes('google_pay') && type ? (
    <div className={classes.root}>
      <span className={classes.icon}>{paymentIcon()}</span>
      <div className={classes.card}>
        <Typography className={classes.cardInfo} data-qa-contact-cc>
          {lastFour
            ? `${type} ****${lastFour}`
            : 'No payment method has been specified for this account.'}
        </Typography>
        <Typography data-qa-contact-cc-exp-date>
          {isCardExpired ? (
            <span className={classes.expired}>{`Expired ${expiry}`}</span>
          ) : (
            <span>{`Expires ${expiry}`}</span>
          )}
        </Typography>
      </div>
    </div>
  ) : (
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

export default CreditCard;
