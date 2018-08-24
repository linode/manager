import truncateText from './truncateText';

const stringOver140 = truncateText(`hello world hello world hello world hello world hello world
hello world hello world hello world hello world hello world hello world hello world hello world
hello world hello world hello world hello world hello world hello world hello world hello world
hello world hello world hello world hello world hello world hello world hello world`, 140);

const stringUnder140 = truncateText('hello world hello world hello world hello world', 140);

it('string over 140 chars should contain an ellipses as last 3 chars', () => {
  const last3Chars = stringOver140.substr(stringOver140.length - 3);
  expect(last3Chars).toBe('...');
})

it('string over 140 chars should have at least 144 chars', () => {
  const isOver144Chars = stringOver140.length >= 144;
  expect(isOver144Chars).toBeTruthy();
})

it('string under 140 chars should not contain an elipses as last 3 chars', () => {
  const last3Chars = stringUnder140.substr(stringUnder140.length - 3);
  expect(last3Chars).not.toBe('...');
})

it('string under 140 chars should have 144 chars max', () => {
  const greaterThan144 = stringUnder140.length > 144;
  expect(greaterThan144).toBeFalsy();
})
