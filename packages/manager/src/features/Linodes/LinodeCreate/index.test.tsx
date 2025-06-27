import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeCreate } from '.';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('Linode Create', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('Should not render VLANs when cloning', () => {
    const { queryByText } = renderWithTheme(<LinodeCreate />, {
      MemoryRouter: { initialEntries: ['/linodes/create?type=Clone+Linode'] },
    });

    expect(queryByText('VLAN')).toBeNull();
  });

  it('Should not render access panel items when cloning', () => {
    const { queryByText } = renderWithTheme(<LinodeCreate />, {
      MemoryRouter: { initialEntries: ['/linodes/create?type=Clone+Linode'] },
    });

    expect(queryByText('Root Password')).toBeNull();
    expect(queryByText('SSH Keys')).toBeNull();
  });

  it('Should not render the region select when creating from a backup', () => {
    const { queryByText } = renderWithTheme(<LinodeCreate />, {
      MemoryRouter: { initialEntries: ['/linodes/create?type=Backups'] },
    });

    expect(queryByText('Region')).toBeNull();
  });
});
