import { getReactDocgenTSFileGlobs } from './utils';

describe('getReactDocgenTSFileGlobs', () => {
  const typeScriptFileGlobs = getReactDocgenTSFileGlobs();
  it('should return component and feature globs for storybook files', () => {
    console.log(typeScriptFileGlobs);
    expect(
      typeScriptFileGlobs.some(
        (file) => file === '../manager/src/components/Button/**/*.{ts,tsx}'
      )
    ).toBe(true);
    expect(
      typeScriptFileGlobs.some(
        (file) => file === '../ui/src/components/Paper/**/*.{ts,tsx}'
      )
    ).toBe(true);
    expect(
      typeScriptFileGlobs.some(
        (file) => file === '../manager/src/features/TopMenu/**/*.{ts,tsx}'
      )
    ).toBe(true);
    expect(
      typeScriptFileGlobs.some(
        (file) => file === '../manager/src/features/Longview/**/*.{ts,tsx}'
      )
    ).toBe(false);
  });
});
