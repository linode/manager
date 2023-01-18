import { render } from '@testing-library/react';
import * as React from 'react';
import StrengthIndicator, { convertStrengthScore } from './StrengthIndicator';
import { wrapWithTheme } from 'src/utilities/testHelpers';

describe('StrengthIndicator', () => {
  it('renders a StrengthIndicator', () => {
    const { queryByText } = render(
      wrapWithTheme(
        <StrengthIndicator strength={1} hideStrengthLabel={false} />
      )
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
    expect(convertStrengthScore(3)).toBe(' Good');
  });
});
