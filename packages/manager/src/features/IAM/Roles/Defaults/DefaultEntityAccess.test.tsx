import { screen } from '@testing-library/react';
import React from 'react';

import {
  ERROR_STATE_TEXT,
  ERROR_STATE_TITLE,
  NO_ASSIGNED_DEFAULT_ENTITIES_TEXT,
} from '../../Shared/constants';
import { expectNotificationBannerText } from '../../utilities/testHelpers';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { DefaultEntityAccess } from './DefaultEntityAccess';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useGetDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: true }),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('../../hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetDefaultDelegationAccessQuery:
      queryMocks.useGetDefaultDelegationAccessQuery,
  };
});

vi.mock('../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
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

beforeAll(() => mockMatchMedia());

describe('DefaultEntityAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.usePermissions.mockReturnValue({
      data: {
        list_entities: true,
        update_default_delegate_access: true,
        view_default_delegate_access: true,
      },
      isLoading: false,
    });
  });
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
    const { container } = renderWithProviders(<DefaultEntityAccess />);

    expect(
      screen.getByText('Default Entity Access for Delegate Users')
    ).toBeVisible();
    expect(container.querySelector('cds-search-field')).toBeVisible();
    expect(container.querySelector('cds-select')).toBeVisible();
    expect(screen.getByLabelText('Assigned Entities')).toBeVisible();
  });
  it('should render empty state', async () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: { entity_access: [] },
      isLoading: false,
    });

    renderWithProviders(<DefaultEntityAccess />);

    expect(screen.getByText(NO_ASSIGNED_DEFAULT_ENTITIES_TEXT)).toBeVisible();
  });

  it('should show error state when api fails', () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithProviders(<DefaultEntityAccess />);
    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('should not render if user does not have permissions', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        view_default_delegate_access: false,
      },
      isLoading: false,
    });

    renderWithProviders(<DefaultEntityAccess />);

    return expectNotificationBannerText(
      'You do not have permission to view default entity access for delegate users.'
    );
  });
});
