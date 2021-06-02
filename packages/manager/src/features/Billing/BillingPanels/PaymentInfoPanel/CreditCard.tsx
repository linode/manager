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

export type CardProvider = 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'JCB';

interface Props {
  provider: string;
  lastFour?: string;
  expiry?: string;
}

export type CombinedProps = Props;

const paymentIcon = (provider: string): any => {
  switch (provider) {
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

export const CreditCard: React.FC<CombinedProps> = (props) => {
  const { provider, expiry, lastFour } = props;
  const classes = useStyles();

  const isCardExpired = expiry && isCreditCardExpired(expiry);

  return (
    <div className={classes.root}>
      <span className={classes.icon}>{paymentIcon(provider)}</span>
      <div className={classes.card}>
        <Typography className={classes.cardInfo} data-qa-contact-cc>
          {lastFour
            ? `${provider} ****${lastFour}`
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
  );
};

export default CreditCard;
