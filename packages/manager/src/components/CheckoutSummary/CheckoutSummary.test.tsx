import * as React from 'react';
import { CheckoutSummary } from './CheckoutSummary';
import { renderWithTheme } from 'src/utilities/testHelpers';

const displaySections1 = [
  {
    title: 'Dedicated 4 GB',
    details: '$30/month',
  },
];

const displaySections2 = [
  {
    title: 'Dedicated 4 GB',
    details: '$30/month',
    monthly: 30,
    hourly: 0.045,
  },
];

const numberOfNodesForUDFSummary = 3;

describe('CheckoutSummary', () => {
  it('should not show a blurb about temporary nodes if a One-Click App without clusters is selected', () => {
    const { queryByTestId } = renderWithTheme(
      <CheckoutSummary heading="Summary" displaySections={displaySections1} />
    );

    expect(queryByTestId('summary-blurb-clusters')).not.toBeInTheDocument();
  });

  it('should show a blurb about temporary nodes if a One-Click App with clusters is selected', () => {
    const { queryByTestId } = renderWithTheme(
      <CheckoutSummary
        heading="Summary"
        displaySections={displaySections2}
        numberOfNodesForUDFSummary={numberOfNodesForUDFSummary}
      />
    );

    expect(queryByTestId('summary-blurb-clusters')).toBeInTheDocument();
  });
});
