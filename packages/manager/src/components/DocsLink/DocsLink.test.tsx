import userEvent from '@testing-library/user-event';
import React from 'react';

import { sendHelpButtonClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DocsLink } from './DocsLink';

import type { DocsLinkProps } from './DocsLink';

vi.mock('src/utilities/analytics/customEventAnalytics', () => ({
  sendHelpButtonClickEvent: vi.fn(),
}));

const mockLabel = 'Custom Doc Link Label';
const mockHref =
  'https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances';
const mockAnalyticsLabel = 'Label';

const defaultProps: DocsLinkProps = {
  analyticsLabel: mockAnalyticsLabel,
  href: mockHref,
  label: mockLabel,
};

describe('DocsLink', () => {
  it('should render the label', () => {
    const { getByText } = renderWithTheme(<DocsLink {...defaultProps} />);
    expect(getByText(mockLabel)).toBeVisible();
  });

  it('should allow user to click the label and redirect to the url', async () => {
    const { getByRole } = renderWithTheme(<DocsLink {...defaultProps} />);
    const link = getByRole('link', {
      name: 'Custom Doc Link Label - link opens in a new tab',
    });
    expect(link).toBeInTheDocument();
    await userEvent.click(link);
    expect(sendHelpButtonClickEvent).toHaveBeenCalledTimes(1);
    expect(sendHelpButtonClickEvent).toHaveBeenCalledWith(
      mockHref,
      mockAnalyticsLabel
    );
  });
});
