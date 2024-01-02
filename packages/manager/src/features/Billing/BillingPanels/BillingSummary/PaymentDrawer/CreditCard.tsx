import { CardType, CreditCardData } from '@linode/api-v4/lib/account/types';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import GenericCardIcon from 'src/assets/icons/credit-card.svg';
import AmexIcon from 'src/assets/icons/payment/amex.svg';
import DiscoverIcon from 'src/assets/icons/payment/discover.svg';
import JCBIcon from 'src/assets/icons/payment/jcb.svg';
import MastercardIcon from 'src/assets/icons/payment/mastercard.svg';
import VisaIcon from 'src/assets/icons/payment/visa.svg';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import { formatExpiry, hasExpirationPassedFor } from 'src/utilities/creditCard';

const useStyles = makeStyles()((theme: Theme) => ({
  card: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  cardInfo: {
    fontFamily: theme.font.bold,
    marginRight: 10,
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
    },
  },
  expired: {
    color: theme.color.red,
  },
  icon: {
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    width: 45,
  },
  root: {
    alignItems: 'center',
    display: 'flex',
  },
}));

const iconMap = {
  'American Express': AmexIcon,
  Discover: DiscoverIcon,
  JCB: JCBIcon,
  MasterCard: MastercardIcon,
  Visa: VisaIcon,
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

export const CreditCard = (props: Props) => {
  const {
    creditCard: { card_type: type = undefined, expiry, last_four: lastFour },
    showIcon = true,
  } = props;

  const { classes } = useStyles();
  const Icon = type ? getIcon(type) : GenericCardIcon;

  return (
    <>
      <Box className={classes.root}>
        {showIcon ? (
          <span className={classes.icon}>
            <Icon />
          </span>
        ) : null}
      </Box>
      <Box className={classes.card}>
        <Typography className={classes.cardInfo} data-qa-contact-cc>
          {`${type || 'Card ending in'} ****${lastFour}`}
        </Typography>
        <Typography data-qa-contact-cc-exp-date>
          {expiry && hasExpirationPassedFor(expiry) ? (
            <span className={classes.expired}>{`Expired ${formatExpiry(
              expiry
            )}`}</span>
          ) : expiry ? (
            <span>{`Expires ${formatExpiry(expiry)}`}</span>
          ) : null}
        </Typography>
      </Box>
    </>
  );
};

export default CreditCard;
