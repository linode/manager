import { PaymentMethod, PaymentType } from '@linode/api-v4';
import * as React from 'react';
import Chip from 'src/components/core/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import {
  getIcon as getTPPIcon,
  thirdPartyPaymentMap,
} from 'src/components/PaymentMethodRow/ThirdPartyPayment';
import SelectionCard from 'src/components/SelectionCard';
import { getIcon as getCreditCardIcon } from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import isCreditCardExpired, { formatExpiry } from 'src/utilities/creditCard';
import { useTheme } from '@mui/material/styles';

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

export const PaymentMethodCard = (props: Props) => {
  const theme = useTheme();
  const { paymentMethod, paymentMethodId, handlePaymentMethodChange } = props;
  const { id, type, is_default } = paymentMethod;

  const heading = getHeading(paymentMethod, type);
  const cardIsExpired = getIsCardExpired(paymentMethod);
  const subHeading = getSubHeading(paymentMethod, cardIsExpired);

  const renderIcon = () => {
    const Icon = getIcon(paymentMethod);
    return <Icon />;
  };

  const renderVariant = () => {
    return is_default ? (
      <Grid xs={3} md={2}>
        <Chip label="DEFAULT" component="span" size="small" />
      </Grid>
    ) : null;
  };

  return (
    <Grid
      sx={{
        marginBottom: theme.spacing(),
      }}
    >
      <SelectionCard
        checked={id === paymentMethodId}
        onClick={() => handlePaymentMethodChange(id, cardIsExpired)}
        renderIcon={renderIcon}
        renderVariant={renderVariant}
        heading={heading}
        subheadings={[subHeading]}
        sxCardBaseIcon={{
          justifyContent: 'center',
          padding: 0,
          width: 45,
        }}
        sxGrid={{
          marginBottom: theme.spacing(),
          minWidth: '100%',
          padding: 0,
        }}
        sxCardBase={{
          flexWrap: 'nowrap',
        }}
        sxCardBaseHeading={{
          flex: 'inherit',
        }}
        sxCardBaseSubheading={{
          color: cardIsExpired ? theme.color.red : undefined,
        }}
      />
    </Grid>
  );
};

export default PaymentMethodCard;
