import { cleanup } from '@testing-library/react';

import { cleanExpiryDate } from './UpdateCreditCardDrawer';

afterEach(cleanup);

const cases = [
  { s: '10/2020', y: 2020, m: 10 },
  { s: '102020', y: 2020, m: 10 },
  { s: '10/20', y: 2020, m: 10 },
  { s: '1020', y: 2020, m: 10 },
  { s: '1/20', y: 2020, m: 1 },
  { s: '120', y: 2020, m: 1 },
  { s: '12020', y: 2020, m: 1 }
];

describe('expiry date parsing', () => {
  cases.forEach(c => {
    return it(c.s, () => {
      expect(cleanExpiryDate(c.s)).toEqual({ y: c.y, m: c.m });
    });
  });
});
