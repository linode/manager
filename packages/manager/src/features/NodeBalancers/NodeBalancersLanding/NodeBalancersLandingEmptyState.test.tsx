import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerLandingEmptyState } from './NodeBalancersLandingEmptyState';

vi.mock('src/hooks/useRestrictedGlobalGrantCheck');

// Note: An integration test confirming the helper text and enabled Create NodeBalancer button already exists, so we're just checking for a disabled create button here
describe('NodeBalancersLandingEmptyState', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('disables the Create NodeBalancer button if user does not have permissions to create a NodeBalancer', async () => {
    // disables the create button
    vi.mocked(useRestrictedGlobalGrantCheck).mockReturnValue(true);

    const { getByText } = renderWithTheme(<NodeBalancerLandingEmptyState />);

    await waitFor(() => {
      const createNodeBalancerButton = getByText('Create NodeBalancer').closest(
        'button'
      );

      expect(createNodeBalancerButton).toBeDisabled();
      expect(createNodeBalancerButton).toHaveAttribute(
        'data-qa-tooltip',
        "You don't have permissions to create NodeBalancers. Please contact your account administrator to request the necessary permissions."
      );
    });
  });
});
