import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { QuotaUsageBar } from './QuotaUsageBar';

describe('QuotaUsageBanner', () => {
  it.each([
    { usage: 1, limit: 10, expectedText: '1 of 10 Bytes used' },
    { usage: 0, limit: 109951162777600, expectedText: '0 of 100 TB used' },
    {
      usage: 1000000,
      limit: 109951162777600,
      expectedText: '<0.01 of 100 TB used',
    },
    {
      usage: 10000000,
      limit: 109951162777600,
      expectedText: '<0.01 of 100 TB used',
    },
    {
      usage: 100000000,
      limit: 109951162777600,
      expectedText: '<0.01 of 100 TB used',
    },
    {
      usage: 1000000000,
      limit: 109951162777600,
      expectedText: '<0.01 of 100 TB used',
    },
    { usage: 1, limit: 107374182400, expectedText: '<0.01 of 100 GB used' },
    {
      usage: 10737419,
      limit: 107374182400,
      expectedText: '0.01 of 100 GB used',
    },
    {
      usage: 5368709,
      limit: 107374182400,
      expectedText: '<0.01 of 100 GB used',
    },
  ])(
    'should display correct byte quota usage text for $usage bytes used out of $limit bytes',
    ({ usage, limit, expectedText }) => {
      const { getByText } = renderWithTheme(
        <QuotaUsageBar limit={limit} resourceMetric="byte" usage={usage} />
      );
      const quotaUsageText = getByText(expectedText);
      expect(quotaUsageText).toBeVisible();
    }
  );
});
