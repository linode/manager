import React from 'react';
import { describe, expect, it } from 'vitest';

import { getFeatureChip } from './getFeatureChip';
import { renderWithWrappers, ThemeWrapper } from './wrap';

describe('getFeatureChip', () => {
  it('returns a BetaChip when flag.beta is true', () => {
    const chip = getFeatureChip({ beta: true });
    const { getByTestId } = renderWithWrappers(<>{chip}</>, [ThemeWrapper()]);
    expect(getByTestId('betaChip')).toBeVisible();
  });

  it('returns a NewFeatureChip when flag.new is true', () => {
    const chip = getFeatureChip({ new: true });
    const { getByTestId } = renderWithWrappers(<>{chip}</>, [ThemeWrapper()]);
    expect(getByTestId('newFeatureChip')).toBeVisible();
  });

  it('returns null when neither flag.beta nor flag.new is set', () => {
    const chip = getFeatureChip({});
    const { container } = renderWithWrappers(<>{chip}</>, [ThemeWrapper()]);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when both flag.beta and flag.new are false', () => {
    const chip = getFeatureChip({ beta: false, new: false });
    const { container } = renderWithWrappers(<>{chip}</>, [ThemeWrapper()]);
    expect(container).toBeEmptyDOMElement();
  });

  it('prioritizes BetaChip over NewFeatureChip when both flags are true', () => {
    const chip = getFeatureChip({ beta: true, new: true });
    const { getByTestId, queryByTestId } = renderWithWrappers(<>{chip}</>, [
      ThemeWrapper(),
    ]);
    expect(getByTestId('betaChip')).toBeVisible();
    expect(queryByTestId('newFeatureChip')).not.toBeInTheDocument();
  });
});
