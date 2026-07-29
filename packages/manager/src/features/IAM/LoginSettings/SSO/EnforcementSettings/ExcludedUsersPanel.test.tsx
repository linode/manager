import { screen } from '@testing-library/react';
import * as React from 'react';

import {
  mockMatchMedia,
  renderWithProvidersAndHookFormContext,
} from '../../../utilities/testHelpers';
import { ExcludedUsersPanel } from './ExcludedUsersPanel';

import type { EnforcementSettingsFormValues } from './EnforcementSettings';

const queryMocks = vi.hoisted(() => ({
  useAllAccountUsersQuery: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllAccountUsersQuery: queryMocks.useAllAccountUsersQuery,
  };
});

vi.mock('../../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

const defaultValues: EnforcementSettingsFormValues = {
  excludedUsers: [],
  includedUsers: [],
  isAcknowledged: false,
  ssoEnabled: false,
  ssoEnforced: false,
};

const renderComponent = (
  values: Partial<EnforcementSettingsFormValues> = {},
  excludedUsers?: string[]
) =>
  renderWithProvidersAndHookFormContext<EnforcementSettingsFormValues>({
    component: <ExcludedUsersPanel excludedUsers={excludedUsers} />,
    useFormOptions: { defaultValues: { ...defaultValues, ...values } },
  });

beforeAll(() => mockMatchMedia());

describe('ExcludedUsersPanel', () => {
  beforeEach(() => {
    queryMocks.usePermissions.mockReturnValue({
      data: { view_user: true },
    });
    queryMocks.useAllAccountUsersQuery.mockReturnValue({
      data: [{ username: 'user1' }, { username: 'user2' }],
      error: null,
      isLoading: false,
    });
  });

  it('renders the section heading', () => {
    renderComponent();
    expect(
      screen.getByRole('heading', { name: 'SSO User Exceptions' })
    ).toBeVisible();
    expect(
      screen.getByText(
        /Allow these users to log in through alternative methods/i
      )
    ).toBeVisible();
    expect(document.querySelector('cds-tag-input')).toBeInTheDocument();
  });

  it('shows "Inactive" with neutral color when SSO is disabled', () => {
    renderComponent({ ssoEnabled: false, ssoEnforced: false });
    expect(screen.getByText('Inactive')).toBeVisible();
    expect((document.querySelector('cds-badge') as any).color).toBe('neutral');
  });

  it('shows "Active" with green color when SSO is enabled and enforced', () => {
    renderComponent({ ssoEnabled: true, ssoEnforced: true });
    expect(screen.getByText('Active')).toBeVisible();
    expect((document.querySelector('cds-badge') as any).color).toBe('green');
  });
});
