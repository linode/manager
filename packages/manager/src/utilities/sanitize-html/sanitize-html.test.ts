import { isURLValid, sanitizeHTML } from './sanitizeHTML';

describe('sanitizeHTML', () => {
  it('should escape non-whitelisted tags', () => {
    expect(sanitizeHTML('<script>')).not.toContain('<script>');
  });

  it('should strip non-whitelisted attributes', () => {
    expect(sanitizeHTML('<a onmouseover>')).not.toContain('onmouseover');
  });

  it('should strip invalid href values', () => {
    expect(sanitizeHTML('<a href="javascript:void"/>')).not.toContain('href');
  });
});

describe('isURLValid', () => {
  it('returns `false` for long URLS', () => {
    let url = 'https://';
    for (let i = 0; i < 2001; i++) {
      url += 'a';
    }
    url += '.com';
    expect(isURLValid(url)).toBe(false);
  });
  it('returns `false` for javascript URLs', () => {
    expect(isURLValid('javascript:void')).toBe(false);
  });
  it('returns `true` for OK urls', () => {
    expect(isURLValid('https://linode.com')).toBe(true);
    expect(isURLValid('https://linode.com?q1=1&q2=2')).toBe(true);
    expect(isURLValid('linode.com')).toBe(true);
    expect(isURLValid('mailto:linode@linode.com')).toBe(true);
  });
});
