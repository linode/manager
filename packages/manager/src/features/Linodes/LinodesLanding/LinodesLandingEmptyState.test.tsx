import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodesLandingEmptyState } from './LinodesLandingEmptyState';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
    },
  })),
  useNavigate: vi.fn(),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

describe('LinodesLandingEmptyState', () => {
  it('should disable "Create Linode" button if the user does not have create_linode permission', () => {
    const { getByRole } = renderWithTheme(<LinodesLandingEmptyState />);

    const createLinodeBtn = getByRole('button', { name: 'Create Linode' });

    expect(createLinodeBtn).toBeInTheDocument();
    expect(createLinodeBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Create Linode" button if the user has create_linode permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const { getByRole } = renderWithTheme(<LinodesLandingEmptyState />);

    const createLinodeBtn = getByRole('button', { name: 'Create Linode' });

    expect(createLinodeBtn).toBeInTheDocument();
    expect(createLinodeBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
