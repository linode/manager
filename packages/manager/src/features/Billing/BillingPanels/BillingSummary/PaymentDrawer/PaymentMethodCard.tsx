import { PaymentMethod, PaymentType } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Chip } from 'src/components/Chip';
import {
  getIcon as getTPPIcon,
  thirdPartyPaymentMap,
} from 'src/components/PaymentMethodRow/ThirdPartyPayment';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { getIcon as getCreditCardIcon } from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import { formatExpiry, hasExpirationPassedFor } from 'src/utilities/creditCard';

interface Props {
  handlePaymentMethodChange: (id: number, cardExpired: boolean) => void;
  paymentMethod: PaymentMethod;
  paymentMethodId: number;
}

const getIsCardExpired = (paymentMethod: PaymentMethod) => {
  if (paymentMethod.type === 'paypal') {
    return false;
  }
  return Boolean(
    paymentMethod.data.expiry &&
      hasExpirationPassedFor(paymentMethod.data.expiry)
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
  const { handlePaymentMethodChange, paymentMethod, paymentMethodId } = props;
  const { id, is_default, type } = paymentMethod;

  const heading = getHeading(paymentMethod, type);
  const cardIsExpired = getIsCardExpired(paymentMethod);
  const subHeading = getSubHeading(paymentMethod, cardIsExpired);

  const renderIcon = () => {
    const Icon = getIcon(paymentMethod);
    return <Icon />;
  };

  const sxVariant = {
    flexShrink: 0,
    paddingLeft: { sm: 1, xs: 0 },
  };

  const renderVariant = () => {
    return is_default ? (
      <Grid md={2} sx={sxVariant} xs={3}>
        <Chip component="span" label="DEFAULT" size="small" />
      </Grid>
    ) : null;
  };

  return (
    <Grid xs={12}>
      <SelectionCard
        sxCardBase={{
          flexWrap: 'nowrap',
        }}
        sxCardBaseHeading={{
          flex: 'inherit',
        }}
        sxCardBaseIcon={{
          justifyContent: 'center',
          padding: 0,
          width: 45,
        }}
        sxCardBaseSubheading={{
          color: cardIsExpired ? theme.color.red : undefined,
        }}
        sxGrid={{
          minWidth: '100%',
          padding: 0,
        }}
        checked={id === paymentMethodId}
        heading={heading}
        onClick={() => handlePaymentMethodChange(id, cardIsExpired)}
        renderIcon={renderIcon}
        renderVariant={renderVariant}
        subheadings={[subHeading]}
      />
    </Grid>
  );
};

export default PaymentMethodCard;
