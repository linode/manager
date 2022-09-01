import { CardType, CreditCardData } from '@linode/api-v4/lib/account/types';
import * as React from 'react';
import GenericCardIcon from 'src/assets/icons/credit-card.svg';
import AmexIcon from 'src/assets/icons/payment/amex.svg';
import DiscoverIcon from 'src/assets/icons/payment/discover.svg';
import JCBIcon from 'src/assets/icons/payment/jcb.svg';
import MastercardIcon from 'src/assets/icons/payment/mastercard.svg';
import VisaIcon from 'src/assets/icons/payment/visa.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import isCreditCardExpired, { formatExpiry } from 'src/utilities/creditCard';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  cardInfo: {
    fontFamily: theme.font.bold,
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
  MasterCard: MastercardIcon,
  'American Express': AmexIcon,
  Discover: DiscoverIcon,
  JCB: JCBIcon,
};

interface Props {
  creditCard: CreditCardData;
  showIcon?: boolean;
}

export const getIcon = (type: CardType | undefined) => {
  if (!type || !iconMap[type]) {
    return GenericCardIcon;
  }

  return iconMap[type];
};

export type CombinedProps = Props;

export const CreditCard: React.FC<CombinedProps> = (props) => {
  const {
    creditCard: { card_type: type = undefined, last_four: lastFour, expiry },
    showIcon = true,
  } = props;

  const classes = useStyles();
  const Icon = type ? getIcon(type) : GenericCardIcon;

  return (
    <div className={classes.root}>
      {showIcon ? (
        <span className={classes.icon}>
          <Icon />
        </span>
      ) : null}
      <div className={classes.card}>
        <Typography className={classes.cardInfo} data-qa-contact-cc>
          {`${type || 'Card ending in'} ****${lastFour}`}
        </Typography>
        <Typography data-qa-contact-cc-exp-date>
          {expiry && isCreditCardExpired(expiry) ? (
            <span className={classes.expired}>{`Expired ${formatExpiry(
              expiry
            )}`}</span>
          ) : expiry ? (
            <span>{`Expires ${formatExpiry(expiry)}`}</span>
          ) : null}
        </Typography>
      </div>
    </div>
  );
};

export default CreditCard;
