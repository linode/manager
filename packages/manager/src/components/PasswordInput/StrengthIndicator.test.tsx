import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { convertStrengthScore, StrengthIndicator } from './StrengthIndicator';

describe('StrengthIndicator', () => {
  it('renders a StrengthIndicator', () => {
    const { queryByText } = renderWithTheme(
      <StrengthIndicator hideStrengthLabel={false} strength={1} />
    );
    expect(queryByText('Strength:')).toBeTruthy();
  });
});

describe('convertStrengthScore', () => {
  it('converts the scores into the correct scale', () => {
    expect(convertStrengthScore(null)).toBe(' Weak');
    expect(convertStrengthScore(0)).toBe(' Weak');
    expect(convertStrengthScore(1)).toBe(' Weak');
    expect(convertStrengthScore(2)).toBe(' Fair');
    expect(convertStrengthScore(3)).toBe(' Fair');
    expect(convertStrengthScore(4)).toBe(' Good');
  });
});
