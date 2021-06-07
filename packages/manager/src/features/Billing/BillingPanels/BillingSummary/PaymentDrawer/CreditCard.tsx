import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import { CardType } from '@linode/api-v4/lib/account/types';
import Typography from 'src/components/core/Typography';
import styled from 'src/containers/SummaryPanels.styles';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';
import VisaIcon from 'src/assets/icons/payment/visa.svg';
import MastercardIcon from 'src/assets/icons/payment/mastercard.svg';
import AmexIcon from 'src/assets/icons/payment/amex.svg';
import DiscoverIcon from 'src/assets/icons/payment/discover.svg';
import JCBIcon from 'src/assets/icons/payment/jcb.svg';
import GenericCardIcon from 'src/assets/icons/credit-card.svg';

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

const iconMap = {
  Visa: VisaIcon,
  Mastercard: MastercardIcon,
  Amex: AmexIcon,
  Discover: DiscoverIcon,
  JCB: JCBIcon,
};

interface Props {
  type?: CardType;
  lastFour?: string | null;
  expiry?: string | null;
}

const getIcon = (type: CardType) => {
  return iconMap[type] ?? GenericCardIcon;
};

export type CombinedProps = Props;

export const CreditCard: React.FC<CombinedProps> = (props) => {
  const { type, lastFour, expiry } = props;

  const classes = useStyles();

  const Icon = type && getIcon(type);
  const isCardExpired = expiry && isCreditCardExpired(expiry);

  return (
    <div className={classes.root}>
      <span className={classes.icon}>
        <Icon />
      </span>
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
  );
};

export default CreditCard;
