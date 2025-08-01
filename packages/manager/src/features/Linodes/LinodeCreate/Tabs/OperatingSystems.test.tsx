import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { OperatingSystems } from './OperatingSystems';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
    },
  })),
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

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('OperatingSystems', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <OperatingSystems />,
    });

    const header = getByText('Choose an OS');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders an image select', () => {
    const { getByLabelText, getByPlaceholderText } =
      renderWithThemeAndHookFormContext({
        component: <OperatingSystems />,
      });

    expect(getByLabelText('Linux Distribution')).toBeVisible();
    expect(getByPlaceholderText('Choose a Linux distribution')).toBeVisible();
  });

  it('should disable "ImageSelect" component if the user does not have create_linode permission', async () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <OperatingSystems />,
    });

    const imageSelect = getByPlaceholderText('Choose a Linux distribution');
    expect(imageSelect).toBeInTheDocument();
    expect(imageSelect).toBeDisabled();
  });

  it('should enable "ImageSelect" component if the user does has create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <OperatingSystems />,
    });

    const imageSelect = getByPlaceholderText('Choose a Linux distribution');
    expect(imageSelect).toBeInTheDocument();
    expect(imageSelect).toBeEnabled();
  });
});
