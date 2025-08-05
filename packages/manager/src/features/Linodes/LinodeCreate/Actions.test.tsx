import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Actions } from './Actions';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
      clone_linode: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
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

describe('Actions', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render a disabled create button, if user does not have create_linode permission', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('Create Linode').closest('button');

    expect(button).toBeVisible();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
  });

  it('should render a disabled create button for cloning, if user does not have clone_linode permission', () => {
    queryMocks.useParams.mockReturnValue({ type: 'Clone Linode' });

    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('Create Linode').closest('button');

    expect(button).toBeVisible();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
  });

  it('should render an enabled create button, if user has create_linode permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
        clone_linode: true,
      },
    });
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('Create Linode').closest('button');

    expect(button).toBeVisible();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeEnabled();
  });

  it('should render an enabled create button for cloning, if user has clone_linode permission', () => {
    queryMocks.useParams.mockReturnValue({ type: 'Clone Linode' });
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
        clone_linode: true,
      },
    });
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('Create Linode').closest('button');

    expect(button).toBeVisible();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeEnabled();
  });

  it("should render a 'View Code Snippets' button", () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Actions />,
    });

    const button = getByText('View Code Snippets').closest('button');

    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });
});
