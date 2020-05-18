import { cleanup } from '@testing-library/react';
// import * as React from 'react';
// import { UpdateCreditCardDrawer } from './UpdateCreditCardDrawer';

afterEach(cleanup);

const cases = [
  { s: '10/2020', y: 2020, m: 10 },
  { s: '102020', y: 2020, m: 10 },
  { s: '1020', y: 2020, m: 10 },
  { s: '10 / 20', y: 2020, m: 10 },
  { s: '1/20', y: 2020, m: 1 },
  { s: '120', y: 2020, m: 1 },
  { s: '12020', y: 2020, m: 1 }
];
const parseCcExp = (s: string) => {
  const clean = s.replace(/[^0-9]/g, '');
  const yearLength = clean.length > 4 ? 4 : 2;
  const month = +clean.substring(0, clean.length - yearLength);
  const year = +clean.substring(clean.length - yearLength);
  return {
    y: year + (yearLength == 4 ? 0 : 2000),
    m: month
  };
};
describe('expiry date parsing', () => {
  cases.forEach(c => {
    return it(c.s, () => {
      expect(parseCcExp(c.s)).toEqual({ y: c.y, m: c.m });
    });
  });
});
