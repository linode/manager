import { isURLValid, sanitizeHTML } from './sanitizeHTML';

describe('sanitizeHTML', () => {
  it('should escape non-allowlisted tags', () => {
    // safe
    expect(sanitizeHTML('<script>')).not.toContain('<script>');
  });

  it('should strip non-allowlisted attributes', () => {
    // safe
    expect(sanitizeHTML('<a onmouseover>')).not.toContain('onmouseover');
  });

  it('should strip invalid href values', () => {
    // safe
    expect(sanitizeHTML('<a href="javascript:void"/>')).not.toContain('href');
  });

  it('only allows "version" class, and only for spans', () => {
    // safe
    expect(sanitizeHTML('<div class="version" />')).not.toContain('class');
    // safe
    expect(sanitizeHTML('<div class="other-class" />')).not.toContain('class');
    // safe
    expect(sanitizeHTML('<span class="version" />')).toContain('class');
    // safe
    expect(sanitizeHTML('<span class="other-class" />')).not.toContain('class');
  });

  it('should add a "rel" attribute when target="_blank" is included', () => {
    // safe
    expect(
      sanitizeHTML('<a target="_blank" href="https://linode.com">click me</a>')
    ).toContain('rel="noopener noreferrer"');
  });

  it('should not allow custom "rel" attribute', () => {
    // safe
    expect(
      sanitizeHTML(
        '<a rel="dns-prefetch" href="https://linode.com">click me</a>'
      )
    ).not.toContain('rel=');
    // safe
    expect(
      sanitizeHTML(
        '<a target="custom" rel="dns-prefetch" href="https://linode.com">click me</a>'
      )
    ).not.toContain('rel=');
    // safe
    expect(
      sanitizeHTML(
        '<a target="_blank" rel="dns-prefetch" href="https://linode.com">click me</a>'
      )
    ).not.toContain('rel="dns-prefetch"');
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
