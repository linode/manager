import { CreditCardSchema } from '@linode/validation';
import { Settings } from 'luxon';
import { take, takeLast } from 'ramda';

import {
  formatExpiry,
  isCreditCardExpired,
  parseExpiryYear,
} from './creditCard';

const currentYear = new Date().getFullYear();
const currentYearFirstTwoDigits = take(2, String(currentYear));

describe('isCreditCardExpired', () => {
  describe('given today is 01/01/2019', () => {
    // Mock that the current date is 1/1/2019
    Settings.now = () => new Date(2019, 0, 1).valueOf();

    [
      ['01/2018', true],
      ['02/2018', true],
      ['03/2018', true],
      ['04/2018', true],
      ['05/2018', true],
      ['06/2018', true],
      ['07/2018', true],
      ['08/2018', true],
      ['09/2018', true],
      ['10/2018', true],
      ['11/2018', true],
      ['12/2018', true],
      ['01/2019', false], // A card is still valid until the end of the month
      ['02/2019', false],
      ['03/2019', false],
      ['04/2019', false],
      ['05/2019', false],
      ['06/2019', false],
      ['07/2019', false],
      ['08/2019', false],
      ['09/2019', false],
      ['10/2019', false],
      ['11/2019', false],
      ['12/2019', false],
    ].forEach(([expiration, result]: [string, boolean]) => {
      describe(`and a expiration date of ${expiration}`, () => {
        it(`should return ${result}`, () => {
          expect(isCreditCardExpired(expiration)).toBe(result);
        });
      });
    });
  });
});

describe('formatExpiry', () => {
  [
    ['01/2018', '01/18'],
    ['05/2024', '05/24'],
    ['01/18', '01/18'],
    ['12/22', '12/22'],
  ].forEach(([expiry, result]: [string, string]) => {
    describe(`Expiry date of ${expiry}`, () => {
      it(`should return ${result}`, () => {
        expect(formatExpiry(expiry)).toBe(result);
      });
    });
  });
});

describe('parseExpiryYear', () => {
  [
    [undefined, undefined],
    ['2024', '2024'],
    ['24', `${currentYearFirstTwoDigits}24`],
    ['2', `${currentYearFirstTwoDigits}2`],
    ['196', '196'],
    ['9879', '9879'],
  ].forEach(([expiry, result]) => {
    describe(`Expiry year of ${expiry}`, () => {
      it(`should return ${result}`, () => {
        expect(parseExpiryYear(expiry)).toBe(result);
      });
    });
  });
});

describe('credit card expiry date parsing and validation', () => {
  [
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: `09/${takeLast(2, String(currentYear + 19))}`,
      },
      result: true,
    },
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: `09/${takeLast(2, String(currentYear + 1))}`,
      },
      result: true,
    },
    {
      data: {
        card_number: '1111111111111111',
        // Credit Card expiry years can't be more than 20 years in the future.
        // We also use currentYear to make sure this test does not fail in many
        // years down the road.
        cvv: '123',
        // Using takeLast to simulate a user entering the year in a 2 digit format.
        expiry: `09/${takeLast(2, String(currentYear + 21))}`,
      },
      result: 'Expiry too far in the future.',
    },
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: `09/${String(currentYear + 19)}`,
      },
      result: true,
    },
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: `09/${String(currentYear + 21)}`,
      },
      result: 'Expiry too far in the future.',
    },
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: '01/2000',
      },
      result: 'Expiration year must not be in the past.',
    },
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: '00/24',
      },
      result: 'Expiration month must be a number from 1 to 12.',
    },
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: '05/999',
      },
      result: 'Expiration year must be 2 or 4 digits.',
    },
    {
      data: {
        card_number: '1111111111111111',
        cvv: '123',
        expiry: '05/99999',
      },
      result: 'Expiration year must be 2 or 4 digits.',
    },
  ].forEach(({ data, result }) => {
    describe(`Expiry year of ${data.expiry}`, () => {
      const message =
        typeof result === 'string'
          ? `Should give validation error: ${result}`
          : 'should be valid';
      it(message, async () => {
        // Same logic as the credit card form
        const expiryData = data.expiry.split('/');

        const parsedYear = parseExpiryYear(expiryData[1]);

        try {
          const valid = await CreditCardSchema.validate({
            card_number: data.card_number,
            cvv: data.cvv,
            expiry_month: expiryData[0],
            expiry_year: parsedYear,
          });

          expect(valid);
        } catch (error) {
          expect(error.errors[0]).toBe(result);
        }
      });
    });
  });
});
