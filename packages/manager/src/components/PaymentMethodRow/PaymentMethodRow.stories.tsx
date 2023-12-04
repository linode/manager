import { CardType } from '@linode/api-v4';
import React from 'react';

import { paymentMethodFactory } from 'src/factories';

import { PaymentMethodRow } from './PaymentMethodRow';

import type { PaymentMethodRowProps } from './PaymentMethodRow';
import type { Meta, StoryObj } from '@storybook/react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const onDelete = () => {};

const supportedCreditCards: CardType[] = [
  'Visa',
  'MasterCard',
  'American Express',
  'Discover',
  'JCB',
];

const CreditCards = () =>
  supportedCreditCards.map((creditCard) => (
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
