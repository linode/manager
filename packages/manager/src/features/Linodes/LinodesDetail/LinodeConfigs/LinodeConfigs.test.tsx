import { linodeFactory } from '@linode/utilities';

import 'src/mocks/testServer';

import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import LinodeConfigs from './LinodeConfigs';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: {
      create_linode_config_profile: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
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

    const { queryByText } = renderWithTheme(<LinodeConfigs />);

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

    const { queryByText } = renderWithTheme(<LinodeConfigs />);

    expect(queryByText('Network Interfaces')).not.toBeInTheDocument();
  });

  it('should disable "Add Configuration" button if the user does not have permissions', async () => {
    const { queryByText } = renderWithTheme(<LinodeConfigs />);

    const addConfigBtn = queryByText('Add Configuration');
    expect(addConfigBtn).toBeInTheDocument();

    expect(addConfigBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Add Configuration" button if the user has permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        create_linode_config_profile: true,
      },
    });
    const { queryByText } = renderWithTheme(<LinodeConfigs />);

    const addConfigBtn = queryByText('Add Configuration');
    expect(addConfigBtn).toBeInTheDocument();

    expect(addConfigBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
