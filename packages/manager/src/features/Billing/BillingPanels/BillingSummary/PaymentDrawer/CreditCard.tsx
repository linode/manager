import * as React from 'react';
import * as classnames from 'classnames';
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
  align: {
    marginLeft: theme.spacing(),
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
  type?: CardType | null;
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

  return (
    <div className={classes.root}>
      {type ? <span className={classes.icon}>{<Icon />}</span> : null}
      <div
        className={classnames({
          [classes.card]: true,
          [classes.align]: !type,
        })}
      >
        <Typography className={classes.cardInfo} data-qa-contact-cc>
          {lastFour ? `${type} ****${lastFour}` : 'No credit card on file.'}
        </Typography>
        <Typography data-qa-contact-cc-exp-date>
          {expiry && isCreditCardExpired(expiry) ? (
            <span className={classes.expired}>{`Expired ${expiry}`}</span>
          ) : expiry ? (
            <span>{`Expires ${expiry}`}</span>
          ) : null}
        </Typography>
      </div>
    </div>
  );
};

export default CreditCard;
