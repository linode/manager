import { cssVars } from './cssVars';

describe('cssVars', () => {
  it('returns undefined when no values are set', () => {
    expect(cssVars({})).toBeUndefined();
    expect(
      cssVars({ '--margin-bottom': undefined, '--margin-top': undefined })
    ).toBeUndefined();
  });

  it('sets only defined entries', () => {
    expect(cssVars({ '--margin-top': '1rem' })).toEqual({
      '--margin-top': '1rem',
    });

    expect(cssVars({ '--margin-bottom': 0, '--margin-top': '2rem' })).toEqual({
      '--margin-bottom': 0,
      '--margin-top': '2rem',
    });
  });
});
