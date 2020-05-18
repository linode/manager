import { cleanup } from '@testing-library/react';

import { parseExpiryDate } from './UpdateCreditCardDrawer';

afterEach(cleanup);

const cases = [
  { s: '10/2020', year: 2020, month: 10 },
  { s: '102020', year: 2020, month: 10 },
  { s: '10/20', year: 2020, month: 10 },
  { s: '1020', year: 2020, month: 10 },
  { s: '1/20', year: 2020, month: 1 },
  { s: '120', year: 2020, month: 1 },
  { s: '12020', year: 2020, month: 1 }
];

describe('expiry date parsing', () => {
  cases.forEach(c => {
    return it(c.s, () => {
      expect(parseExpiryDate(c.s)).toEqual({
        expYear: c.year,
        expMonth: c.month
      });
    });
  });
});
