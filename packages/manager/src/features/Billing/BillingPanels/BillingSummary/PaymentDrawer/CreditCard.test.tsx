import { Settings } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import CreditCard from './CreditCard';

import type { CreditCardData } from '@linode/api-v4';

it('Displays credit card type and last four digits', () => {
  const creditCardData: CreditCardData = {
    card_type: 'Visa',
    expiry: '12/2022',
    last_four: '1111',
  };

  const { getByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(getByText('Visa ****1111')).toBeVisible();
});

it('Displays formatted expiration date for cards with expiration', () => {
  // Mock that the current date is in 2023 so that the card is not expired.
  Settings.now = () => new Date(2023, 11, 7).valueOf();

  const creditCardData: CreditCardData = {
    card_type: 'Visa',
    expiry: '12/2023',
    last_four: '1111',
  };

  const { getByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(getByText('Expires 12/23')).toBeVisible();
});

it('Displays "expired" notice for cards that are expired', () => {
  const creditCardData: CreditCardData = {
    card_type: 'Visa',
    expiry: '12/2021',
    last_four: '1111',
  };

  const { getByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(getByText('Expired 12/21')).toBeVisible();
});

it('Does not display expiration information for cards with no expiration date', () => {
  const creditCardData: CreditCardData = {
    card_type: 'Visa',
    expiry: null,
    last_four: '1111',
  };

  const { queryByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(queryByText('expires', { exact: false })).toBeNull();
  expect(queryByText('expired', { exact: false })).toBeNull();
});
