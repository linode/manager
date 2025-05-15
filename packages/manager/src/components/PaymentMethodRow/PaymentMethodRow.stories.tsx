import { action } from '@storybook/addon-actions';
import React from 'react';

import { paymentMethodFactory } from 'src/factories';

import { PaymentMethodRow } from './PaymentMethodRow';

import type { CardType } from '@linode/api-v4';
import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof PaymentMethodRow>;

const onDelete = action('onDelete');

const supportedCreditCards: (CardType | undefined)[] = [
  'Visa',
  'MasterCard',
  'American Express',
  'Discover',
  'JCB',
  undefined,
];

const CreditCardExamples = () => {
  const paymentMethods = supportedCreditCards.map((creditCard) => (
    <PaymentMethodRow
      key={creditCard ?? 'undefined-credit-card'}
      onDelete={onDelete}
      paymentMethod={paymentMethodFactory.build({
        data: {
          card_type: creditCard,
        },
        type: 'credit_card',
      })}
    />
  ));

  return <>{paymentMethods}</>;
};

export const CreditCards: Story = {
  render: () => <CreditCardExamples />,
};

export const GooglePay: Story = {
  render: (args) => <PaymentMethodRow {...args} />,
};

export const PayPal: Story = {
  render: (args) => (
    <PaymentMethodRow
      {...args}
      paymentMethod={paymentMethodFactory.build({
        data: {
          email: 'testemail@gmail.com',
          paypal_id: 'ABCDEFG123',
        },
        type: 'paypal',
      })}
    />
  ),
};

const meta: Meta<typeof PaymentMethodRow> = {
  args: {
    onDelete,
    paymentMethod: paymentMethodFactory.build({
      data: {
        card_type: 'Visa',
      },
      type: 'google_pay',
    }),
  },
  component: PaymentMethodRow,
  title: 'Components/Payment Method Row',
};

export default meta;
