import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { QuotaUsageBar } from './QuotaUsageBar';

describe('QuotaUsageBanner', () => {
  it('should display quota usage in proper units', () => {
    const { getByText } = renderWithTheme(
      <QuotaUsageBar limit={10} resourceMetric="byte" usage={1} />
    );

    const quotaUsageText = getByText('1 of 10 Bytes used');
    expect(quotaUsageText).toBeVisible();
  });
});
