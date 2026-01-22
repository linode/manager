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

  it.each([1000000000, 100000000, 10000000, 1000000])(
    'should display content usage in proper format',
    (usage) => {
      const { getByText } = renderWithTheme(
        <QuotaUsageBar
          limit={109951162777600}
          resourceMetric="byte"
          usage={usage}
        />
      );

      const quotaUsageText = getByText('<0.01 of 100 TB used');
      expect(quotaUsageText).toBeVisible();
    }
  );
});
