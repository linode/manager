import { sanitizeHTML } from './sanitizeHTML';

/** not allowed */
const script = '<script src=""></script>';
const aClick = '<a onClick="() => console.log("hello world")"></a>';
const aClickLang =
  '<a lang="en-us" onClick="() => console.log("hello world")"></a>';

/** allowed */
const a = '<a href="helloworld.com">Hello world</a>';
const aLang = '<a lang="en-us"></a>';

it('should get rid of all script tags', () => {
  expect(sanitizeHTML(script)).toBe('');
});

it('should only allow blacklisted HTML attributes', () => {
  expect(sanitizeHTML(aClick)).toBe('<a></a>');
  expect(sanitizeHTML(aLang)).toBe(aLang);
  expect(sanitizeHTML(aClickLang)).toBe(aLang);
});

it('should allow for a tag with href', () => {
  expect(sanitizeHTML(a)).toBe(a);
});
