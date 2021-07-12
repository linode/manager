import { DateTime } from 'luxon';
import { formatExpiry, hasExpirationPassedFor } from './creditCard';

describe('isCreditCardExpired', () => {
  describe('give today is 01/01/2019', () => {
    const date = DateTime.fromObject({ year: 2019, month: 1, day: 1 });

    const isCreditCardExpired = hasExpirationPassedFor(date);

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
      ['01/2019', false],
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
