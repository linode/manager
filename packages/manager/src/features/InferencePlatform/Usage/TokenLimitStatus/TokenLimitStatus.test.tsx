import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TokenLimitStatus } from './TokenLimitStatus';

import type { InferenceUsageCredits } from '@linode/api-v4';

const MAX_CREDITS = 10_000_000;

// Build a mock InferenceUsageCredits object from a target percent; the widget
// derives `percent_used` from `used_credits / max_credits`.
const makeTokenLimit = (percentUsed: number): InferenceUsageCredits => ({
  max_credits: MAX_CREDITS,
  used_credits: Math.round((percentUsed / 100) * MAX_CREDITS),
});

const SUPPORT_COPY = /Contact support to increase limit/;

describe('TokenLimitStatus', () => {
  it('renders nothing while loading', () => {
    const { container } = renderWithTheme(
      <TokenLimitStatus
        animateBar={false}
        isLoading
        tokenLimit={makeTokenLimit(50)}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no token limit data', () => {
    const { container } = renderWithTheme(
      <TokenLimitStatus animateBar={false} tokenLimit={undefined} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and percentage once data is ready', () => {
    const { getAllByText, getByText } = renderWithTheme(
      <TokenLimitStatus animateBar={false} tokenLimit={makeTokenLimit(42)} />
    );

    expect(getByText('Monthly Tokens Credits Status')).toBeVisible();
    // The percentage is shown in both the gauge and the description sentence.
    expect(getAllByText('42%').length).toBeGreaterThan(0);
  });

  it('applies the Nominal risk tier below 75%', () => {
    const { container } = renderWithTheme(
      <TokenLimitStatus animateBar={false} tokenLimit={makeTokenLimit(74)} />
    );

    expect((container.firstChild as HTMLElement).className).toMatch(/Nominal/);
  });

  it('applies the MediumRisk tier at exactly 75%', () => {
    const { container } = renderWithTheme(
      <TokenLimitStatus animateBar={false} tokenLimit={makeTokenLimit(75)} />
    );

    expect((container.firstChild as HTMLElement).className).toMatch(
      /MediumRisk/
    );
  });

  it('applies the HighRisk tier at exactly 90%', () => {
    const { container } = renderWithTheme(
      <TokenLimitStatus animateBar={false} tokenLimit={makeTokenLimit(90)} />
    );

    expect((container.firstChild as HTMLElement).className).toMatch(/HighRisk/);
  });

  it('hides the contact-support copy below 75%', () => {
    const { queryByText } = renderWithTheme(
      <TokenLimitStatus animateBar={false} tokenLimit={makeTokenLimit(74)} />
    );

    expect(queryByText(SUPPORT_COPY)).toBeNull();
  });

  it('shows the contact-support copy at exactly 75%', () => {
    const { getByText } = renderWithTheme(
      <TokenLimitStatus animateBar={false} tokenLimit={makeTokenLimit(75)} />
    );

    getByText(SUPPORT_COPY);
  });
});
