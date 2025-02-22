import { Chip } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import {
  getIcon as getTPPIcon,
  thirdPartyPaymentMap,
} from 'src/components/PaymentMethodRow/ThirdPartyPayment';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { getIcon as getCreditCardIcon } from 'src/features/Billing/BillingPanels/BillingSummary/PaymentDrawer/CreditCard';
import { formatExpiry, isCreditCardExpired } from 'src/utilities/creditCard';

import type { PaymentMethod } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  handlePaymentMethodChange: (id: number, cardExpired: boolean) => void;
  paymentMethod: PaymentMethod;
  paymentMethodId: number;
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

const getHeading = (paymentMethod: PaymentMethod) => {
  switch (paymentMethod.type) {
    case 'paypal':
      return thirdPartyPaymentMap[paymentMethod.type].label;
    case 'google_pay':
      return `${thirdPartyPaymentMap[paymentMethod.type].label} ${
        paymentMethod.data.card_type
      } ****${paymentMethod.data.last_four}`;
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
  const {
    disabled,
    handlePaymentMethodChange,
    paymentMethod,
    paymentMethodId,
  } = props;
  const { id, is_default } = paymentMethod;

  const heading = getHeading(paymentMethod);
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
      <Grid
        sx={sxVariant}
        size={{
          md: 2,
          xs: 3,
        }}
      >
        <Chip component="span" label="DEFAULT" size="small" />
      </Grid>
    ) : null;
  };

  return (
    <Grid size={12}>
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
        disabled={disabled}
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
