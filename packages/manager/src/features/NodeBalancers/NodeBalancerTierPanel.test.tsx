import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  NodeBalancerTierPanel,
  PREMIUM_NON_PREMIUM_NB_LINK,
} from './NodeBalancerTierPanel';

import type { Props } from './NodeBalancerTierPanel';

const makeProps = (overrides: Partial<Props> = {}): Props => ({
  tierChange: vi.fn(),
  tierSelected: 'common',
  ...overrides,
});

describe('NodeBalancerTierPanel', () => {
  it('renders the heading, description, and learn more link', () => {
    const { getByRole, getByText } = renderWithTheme(
      <NodeBalancerTierPanel {...makeProps()} />
    );

    expect(
      getByRole('heading', { level: 2, name: 'NodeBalancer Tier' })
    ).toBeVisible();
    expect(
      getByText(
        /Choose the NodeBalancer that best aligns with your application's performance, scale, and protocol requirements\./
      )
    ).toBeVisible();

    const learnMore = getByText('Learn more').closest('a');
    expect(learnMore).toHaveAttribute('href', PREMIUM_NON_PREMIUM_NB_LINK);
  });

  it('renders both Basic and Premium selection cards', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerTierPanel {...makeProps()} />
    );

    expect(getByText('Basic')).toBeVisible();
    expect(getByText('Premium')).toBeVisible();
    // Premium-specific subheading
    expect(
      getByText('For high-scale workloads and LKE-Enterprise clusters')
    ).toBeVisible();
    // Basic-specific subheading
    expect(getByText('For general purpose workloads')).toBeVisible();
  });

  it('marks the Basic card as checked when tierSelected is "common"', () => {
    const { getAllByTestId } = renderWithTheme(
      <NodeBalancerTierPanel {...makeProps({ tierSelected: 'common' })} />
    );

    const [basicCard, premiumCard] = getAllByTestId('selection-card');
    expect(basicCard).toHaveAttribute('data-qa-selection-card-checked', 'true');
    expect(premiumCard).toHaveAttribute(
      'data-qa-selection-card-checked',
      'false'
    );
  });

  it('marks the Premium card as checked when tierSelected is "premium"', () => {
    const { getAllByTestId } = renderWithTheme(
      <NodeBalancerTierPanel {...makeProps({ tierSelected: 'premium' })} />
    );

    const [basicCard, premiumCard] = getAllByTestId('selection-card');
    expect(basicCard).toHaveAttribute(
      'data-qa-selection-card-checked',
      'false'
    );
    expect(premiumCard).toHaveAttribute(
      'data-qa-selection-card-checked',
      'true'
    );
  });

  it('renders the error notice when an error is provided', () => {
    const { getByText } = renderWithTheme(
      <NodeBalancerTierPanel
        {...makeProps({ error: 'Please select a tier.' })}
      />
    );

    expect(getByText('Please select a tier.')).toBeVisible();
  });

  it('does not render an error notice when no error is provided', () => {
    const { queryByText } = renderWithTheme(
      <NodeBalancerTierPanel {...makeProps()} />
    );

    expect(queryByText('Please select a tier.')).not.toBeInTheDocument();
  });
});
