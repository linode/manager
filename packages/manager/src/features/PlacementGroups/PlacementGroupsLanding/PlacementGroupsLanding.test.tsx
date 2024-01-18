import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

// Error will go away after merging Alban's PR for [M3-7609].
import { PlacementGroupsLanding } from './PlacementGroupsLanding';

const queryClient = new QueryClient();

const loadingTestId = 'circle-progress';

describe('PlacementGroup Landing Page', () => {
  it('should render placement group landing with empty state', async () => {
    server.use(
      rest.get('*/placement/groups', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <PlacementGroupsLanding />,
      {
        queryClient,
      }
    );

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(
      getByText(
        'Control the physical placement or distribution of virtual machines (VMs) instances within a data center or availability zone.'
      )
    ).toBeInTheDocument();
  });
});
