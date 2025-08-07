import * as React from 'react';

import { routeTree } from 'src/routes';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DomainsLanding } from './DomainsLanding';

vi.mock('src/queries/domains', async () => {
  const actual = await vi.importActual('src/queries/domains');
  return {
    ...actual,
    useDomainsQuery: vi.fn().mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
    }),
  };
});

describe('Domains Landing', () => {
  it('should initially render a loading state', async () => {
    const { getByTestId } = renderWithTheme(<DomainsLanding />, {
      initialRoute: '/domains',
      routeTree,
    });
    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });
});
