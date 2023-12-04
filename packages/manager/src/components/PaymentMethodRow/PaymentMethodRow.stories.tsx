import { CardType } from '@linode/api-v4';
import React from 'react';

import { paymentMethodFactory } from 'src/factories';

import { PaymentMethodRow } from './PaymentMethodRow';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof PaymentMethodRow>;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const onDelete = () => {};

const supportedCreditCards: CardType[] = [
  'Visa',
  'MasterCard',
  'American Express',
  'Discover',
  'JCB',
];

const CreditCards = () => {
  const paymentMethods = supportedCreditCards.map((creditCard) => (
    <PaymentMethodRow
      paymentMethod={paymentMethodFactory.build({
        data: {
          card_type: creditCard,
        },
        type: 'credit_card',
      })}
      key={creditCard}
      onDelete={onDelete}
    />
  ));

  return <>{paymentMethods}</>;
};

export const CreditCardsExample: Story = {
  render: () => <CreditCards />,
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
  title: 'Features/Payment Method Row',
};

export default meta;
