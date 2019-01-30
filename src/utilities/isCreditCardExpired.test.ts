import { hasExpirationPassedFor } from './isCreditCardExpired';

describe('isCreditCardExpired', () => {
  describe('give today is 01/01/2019', () => {
    const date = new Date();
    date.setFullYear(2019, 0, 1);

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
      ['01/2019', true],
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
      ['12/2019', false]
    ].forEach(([expiration, result]: [string, boolean]) => {
      describe(`and a expiration date of ${expiration}`, () => {
        it(`should return ${result}`, () => {
          expect(isCreditCardExpired(expiration)).toBe(result);
        });
      });
    });
  });
});
