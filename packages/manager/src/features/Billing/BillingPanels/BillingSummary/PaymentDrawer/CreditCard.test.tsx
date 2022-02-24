import CreditCard from './CreditCard';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CreditCardData } from '@linode/api-v4';
import * as React from 'react';

it('Displays credit card type and last four digits', () => {
  const creditCardData: CreditCardData = {
    last_four: '1111',
    card_type: 'Visa',
    expiry: '12/2022',
  };

  const { getByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(getByText('Visa ****1111')).toBeVisible();
});

it('Displays formatted expiration date for cards with expiration', () => {
  const creditCardData: CreditCardData = {
    last_four: '1111',
    card_type: 'Visa',
    expiry: '12/2022',
  };

  const { getByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(getByText('Expires 12/22')).toBeVisible();
});

it('Displays "expired" notice for cards that are expired', () => {
  const creditCardData: CreditCardData = {
    last_four: '1111',
    card_type: 'Visa',
    expiry: '12/2021',
  };

  const { getByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(getByText('Expired 12/21')).toBeVisible();
});

it('Does not display expiration information for cards with no expiration date', () => {
  const creditCardData: CreditCardData = {
    last_four: '1111',
    card_type: 'Visa',
    expiry: null,
  };

  const { queryByText } = renderWithTheme(
    <CreditCard creditCard={creditCardData} />
  );

  expect(queryByText('expires', { exact: false })).toBeNull();
  expect(queryByText('expired', { exact: false })).toBeNull();
});
