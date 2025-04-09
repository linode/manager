import React from 'react';

import { linodeFactory } from 'src/factories';
import 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import LinodeConfigs from './LinodeConfigs';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useLinodeQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

describe('LinodeConfigs', () => {
  it('should show the Network Interfaces column for legacy config Linodes', () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build,
    });

    const { queryByText } = renderWithTheme(<LinodeConfigs />);

    expect(queryByText('Network Interfaces')).toBeVisible();
  });

  it('should hide the Network Interfaces column for new Linode interface Linodes', () => {
    const linode = linodeFactory.build({ interface_generation: 'linode' });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linode,
    });

    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: { enabled: true },
    });

    const { queryByText } = renderWithTheme(<LinodeConfigs />);

    expect(queryByText('Network Interfaces')).not.toBeInTheDocument();
  });
});
