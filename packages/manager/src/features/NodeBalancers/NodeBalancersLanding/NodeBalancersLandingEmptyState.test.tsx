import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { grantsFactory, profileFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodeBalancerLandingEmptyState } from './NodeBalancersLandingEmptyState';

describe('NodeBalancersLandingEmptyState', () => {
  // Note: An integration test confirming the helper text and enabled Create NodeBalancer button already exists, so we're just checking for a disabled create button here

  it('disables the Create NodeBalancer button if user does not have permissions to create a NodeBalancer', async () => {
    server.use(
      http.get('*/v4/profile', () => {
        const profile = profileFactory.build({ restricted: true });
        return HttpResponse.json(profile);
      }),
      http.get('*/v4/profile/grants', () => {
        const grants = grantsFactory.build({
          global: { add_nodebalancers: false },
        });
        return HttpResponse.json(grants);
      })
    );

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
