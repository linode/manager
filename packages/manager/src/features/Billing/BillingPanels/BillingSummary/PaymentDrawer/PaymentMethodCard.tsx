import { PaymentMethod, PaymentType } from '@linode/api-v4';
import classNames from 'classnames';
import * as React from 'react';
import Chip from 'src/components/core/Chip';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import {
  getIcon as getTPPIcon,
  thirdPartyPaymentMap,
} from 'src/components/PaymentMethodRow/ThirdPartyPayment';
import SelectionCard from 'src/components/SelectionCard';
import { getIcon as getCreditCardIcon } from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import isCreditCardExpired, { formatExpiry } from 'src/utilities/creditCard';

const useStyles = makeStyles((theme: Theme) => ({
  paymentMethod: {
    marginBottom: theme.spacing(),
  },
  selectionCard: {
    minWidth: '100%',
    padding: 0,
    marginBottom: theme.spacing(),
    '& .cardBaseGrid': {
      flexWrap: 'nowrap',
    },
    '& .cardBaseIcon': {
      width: 45,
      padding: 0,
      justifyContent: 'center',
    },
    '& .cardBaseHeadings': {
      flex: 'inherit',
    },
  },
  expired: {
    '& .cardBaseSubHeading': {
      color: theme.color.red,
    },
  },
  chip: {
    '& span': {
      color: 'inherit !important',
    },
  },
}));

interface Props {
  paymentMethod: PaymentMethod;
  paymentMethodId: number;
  handlePaymentMethodChange: (id: number, cardExpired: boolean) => void;
}

const getIsCardExpired = (paymentMethod: PaymentMethod) => {
  if (paymentMethod.type === 'paypal') {
    return false;
  }
  return Boolean(
    paymentMethod.data.expiry && isCreditCardExpired(paymentMethod.data.expiry)
  );
};

const getIcon = (paymentMethod: PaymentMethod) => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (paymentMethod.type) {
    case 'credit_card':
      return getCreditCardIcon(paymentMethod.data.card_type);
    default:
      return getTPPIcon(paymentMethod.type);
  }
};

const getHeading = (paymentMethod: PaymentMethod, type: PaymentType) => {
  switch (paymentMethod.type) {
    case 'paypal':
      return thirdPartyPaymentMap[type].label;
    case 'google_pay':
      return `${thirdPartyPaymentMap[type].label} ${paymentMethod.data.card_type} ****${paymentMethod.data.last_four}`;
    default:
      return `${paymentMethod.data.card_type} ****${paymentMethod.data.last_four}`;
  }
};

const getSubHeading = (paymentMethod: PaymentMethod, isExpired: boolean) => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (paymentMethod.type) {
    case 'paypal':
      return paymentMethod.data.email;
    default:
      return `${isExpired ? 'Expired' : 'Expires'} ${formatExpiry(
        paymentMethod.data.expiry ?? ''
      )}`;
  }
};

export const PaymentMethodCard: React.FC<Props> = (props) => {
  const { paymentMethod, paymentMethodId, handlePaymentMethodChange } = props;
  const { id, type, is_default } = paymentMethod;

  const classes = useStyles();

  const heading = getHeading(paymentMethod, type);
  const cardIsExpired = getIsCardExpired(paymentMethod);
  const subHeading = getSubHeading(paymentMethod, cardIsExpired);

  const renderIcon = () => {
    const Icon = getIcon(paymentMethod);
    return <Icon />;
  };

  const renderVariant = () => {
    return is_default ? (
      <Grid item className={classes.chip} xs={3} md={2}>
        <Chip label="DEFAULT" component="span" size="small" />
      </Grid>
    ) : null;
  };

  return (
    <Grid className={classes.paymentMethod}>
      <SelectionCard
        className={classNames({
          [classes.selectionCard]: true,
          [classes.expired]: cardIsExpired,
        })}
        checked={id === paymentMethodId}
        onClick={() => handlePaymentMethodChange(id, cardIsExpired)}
        renderIcon={renderIcon}
        renderVariant={renderVariant}
        heading={heading}
        subheadings={[subHeading]}
      />
    </Grid>
  );
};

export default PaymentMethodCard;
