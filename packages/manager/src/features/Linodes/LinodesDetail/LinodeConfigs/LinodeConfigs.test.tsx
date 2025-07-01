import { linodeFactory } from '@linode/utilities';
import React from 'react';

import 'src/mocks/testServer';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import LinodeConfigs from './LinodeConfigs';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
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

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeConfigs', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      linodeId: '1',
    });
  });

  it('should show the Network Interfaces column for legacy config Linodes', async () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build,
    });

    const { queryByText } = await renderWithThemeAndRouter(<LinodeConfigs />);

    expect(queryByText('Network Interfaces')).toBeVisible();
  });

  it('should hide the Network Interfaces column for new Linode interface Linodes', async () => {
    const linode = linodeFactory.build({ interface_generation: 'linode' });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: linode,
    });

    queryMocks.useFlags.mockReturnValue({
      linodeInterfaces: { enabled: true },
    });

    const { queryByText } = await renderWithThemeAndRouter(<LinodeConfigs />);

    expect(queryByText('Network Interfaces')).not.toBeInTheDocument();
  });
});
