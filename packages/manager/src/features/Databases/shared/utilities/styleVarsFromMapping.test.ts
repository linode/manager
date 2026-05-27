import { cssPropertyVariablesFromMapping } from './styleVarsFromMapping';

const mapping = {
  marginBottom: '--divider-margin-bottom',
  marginTop: '--divider-margin-top',
} as const;

describe('styleVarsFromMapping', () => {
  it('returns undefined when no mapped values are set', () => {
    expect(cssPropertyVariablesFromMapping({}, mapping)).toBeUndefined();
    expect(
      cssPropertyVariablesFromMapping(
        { marginBottom: undefined, marginTop: undefined },
        mapping
      )
    ).toBeUndefined();
  });

  it('sets only defined entries', () => {
    expect(
      cssPropertyVariablesFromMapping({ marginTop: '1rem' }, mapping)
    ).toEqual({
      '--divider-margin-top': '1rem',
    });

    expect(
      cssPropertyVariablesFromMapping(
        { marginBottom: 0, marginTop: '2rem' },
        mapping
      )
    ).toEqual({
      '--divider-margin-bottom': 0,
      '--divider-margin-top': '2rem',
    });
  });
});
