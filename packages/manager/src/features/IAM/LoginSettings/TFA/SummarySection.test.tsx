import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { SummarySection } from './SummarySection';

const mocks = vi.hoisted(() => ({
  useFormContext: vi.fn(),
  usePermissions: vi.fn(),
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ render }: { render: (props: any) => React.ReactNode }) =>
      render({
        field: {
          onChange: vi.fn(),
          value: false,
        },
        fieldState: {},
      }),
    useFormContext: mocks.useFormContext,
  };
});

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: mocks.usePermissions,
}));

beforeEach(() => {
  vi.clearAllMocks();

  mocks.usePermissions.mockReturnValue({
    data: { update_account_settings: true },
  });

  mocks.useFormContext.mockReturnValue({
    control: {},
    formState: { dirtyFields: {} },
    watch: vi.fn().mockReturnValue([]),
  });
});

describe('SummarySection', () => {
  it('shows enforced and optional counts when enforcement is enabled and optional users exist', () => {
    mocks.useFormContext.mockReturnValue({
      control: {},
      formState: { dirtyFields: {} },
      watch: vi.fn().mockReturnValue(['alice', 'bob']),
    });
    renderWithProviders(<SummarySection isEnforced={true} totalUsers={3} />, {
      initialEntries: ['/iam/settings/tfa-enforcement'],
      initialRoute: '/iam/settings/tfa-enforcement',
    });

    expect(screen.getByText(/1 of 3 users/i)).toBeVisible();
    expect(screen.getByText(/The remaining/i)).toHaveTextContent(
      /2\s*user\s*s/i
    );
  });

  it('does not render a negative enforced count when optional users exceed total users', () => {
    mocks.useFormContext.mockReturnValue({
      control: {},
      formState: { dirtyFields: {} },
      watch: vi.fn().mockReturnValue(['alice']),
    });

    renderWithProviders(<SummarySection isEnforced={true} totalUsers={0} />, {
      initialEntries: ['/iam/settings/tfa-enforcement'],
      initialRoute: '/iam/settings/tfa-enforcement',
    });

    expect(screen.getByText(/0 of 0 users/i)).toBeVisible();
    expect(
      screen.queryByText(/-1 of 0 account users/i)
    ).not.toBeInTheDocument();
  });

  it('shows zero enforced users when enforcement is disabled', () => {
    mocks.useFormContext.mockReturnValue({
      control: {},
      formState: { dirtyFields: {} },
      watch: vi.fn().mockReturnValue(['alice']),
    });

    renderWithProviders(<SummarySection isEnforced={false} totalUsers={5} />, {
      initialEntries: ['/iam/settings/tfa-enforcement'],
      initialRoute: '/iam/settings/tfa-enforcement',
    });

    expect(
      screen.getByText(/2FA is no longer mandatory for this account/i)
    ).toBeVisible();
  });

  it('renders acknowledgement checkbox when form settings changed', () => {
    mocks.useFormContext.mockReturnValue({
      control: {},
      formState: { dirtyFields: { tfa_enforced: true } },
      watch: vi.fn().mockReturnValue([]),
    });

    const { container } = renderWithProviders(
      <SummarySection isEnforced={true} totalUsers={3} />,
      {
        initialEntries: ['/iam/settings/tfa-enforcement'],
        initialRoute: '/iam/settings/tfa-enforcement',
      }
    );

    const checkboxHost = container.querySelector('cds-checkbox');
    expect(checkboxHost).toBeTruthy();
    expect(checkboxHost).toHaveProperty('disabled', false);
  });

  it('disables acknowledgement checkbox when update permission is missing', () => {
    mocks.usePermissions.mockReturnValue({
      data: { update_account_settings: false },
    });
    mocks.useFormContext.mockReturnValue({
      control: {},
      formState: { dirtyFields: { tfaOptionalUsers: true } },
      watch: vi.fn().mockReturnValue([]),
    });

    const { container } = renderWithProviders(
      <SummarySection isEnforced={false} totalUsers={3} />,
      {
        initialEntries: ['/iam/settings/tfa-enforcement'],
        initialRoute: '/iam/settings/tfa-enforcement',
      }
    );

    const checkboxHost = container.querySelector('cds-checkbox');

    expect(checkboxHost).toBeTruthy();
    expect(checkboxHost).toHaveProperty('disabled', true);
  });
});
