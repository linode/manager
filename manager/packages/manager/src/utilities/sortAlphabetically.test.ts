import { sortAlphabetically } from './sort-by';

describe('sortAlphabetically', () => {
  it('returns -1 if the first value is smaller', () => {
    expect(sortAlphabetically('hello', 'world')).toBe(-1);
    expect(sortAlphabetically('HELLO', 'world')).toBe(-1);
    expect(sortAlphabetically('HELLO', 'HELLO!')).toBe(-1);
    expect(sortAlphabetically('   ', '       ')).toBe(-1);
  });
  it('returns 0 if the values are equal', () => {
    expect(sortAlphabetically('hello', 'hello')).toBe(0);
    expect(sortAlphabetically('!', '!')).toBe(0);
    expect(sortAlphabetically('', '')).toBe(0);
    expect(sortAlphabetically('   ', '   ')).toBe(0);
  });
  it('returns -1 if the first value is smaller', () => {
    expect(sortAlphabetically('world', 'hello')).toBe(1);
    expect(sortAlphabetically('world', 'HELLO')).toBe(1);
    expect(sortAlphabetically('HELLO!', 'HELLO')).toBe(1);
    expect(sortAlphabetically('     ', '   ')).toBe(1);
  });
});
