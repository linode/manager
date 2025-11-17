import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ASSIGNED_DEFAULT_ENTITIES_TEXT } from '../../Shared/constants';
import { DefaultEntityAccess } from './DefaultEntityAccess';

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useGetDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: true }),
}));

vi.mock('src/features/IAM/hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useGetDefaultDelegationAccessQuery:
      queryMocks.useGetDefaultDelegationAccessQuery,
  };
});

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual('src/queries/entities/entities');
  return {
    ...actual,
    useAllAccountEntities: queryMocks.useAllAccountEntities,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

describe('DefaultEntityAccess', () => {
  it('should render', async () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: {
        entity_access: [
          { id: 1, type: 'linode', label: 'Linode 1' },
          { id: 2, type: 'volume', label: 'Volume 1' },
        ],
      },
      isLoading: false,
    });
    renderWithTheme(<DefaultEntityAccess />);

    expect(
      screen.getByText('Default Entity Access for Delegate Users')
    ).toBeVisible();
    expect(screen.getByPlaceholderText('Search')).toBeVisible();
    expect(screen.getByPlaceholderText('All Entities')).toBeVisible();
    expect(screen.getByRole('table')).toBeVisible();
  });
  it('should render empty state', async () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: { entity_access: [] },
      isLoading: false,
    });

    renderWithTheme(<DefaultEntityAccess />);

    expect(screen.getByText(NO_ASSIGNED_DEFAULT_ENTITIES_TEXT)).toBeVisible();
  });
});
