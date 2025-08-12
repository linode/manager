import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Images } from './Images';

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

describe('Images', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('renders a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Images />,
    });

    const header = getByText('Choose an Image');

    expect(header).toBeVisible();
    expect(header.tagName).toBe('H2');
  });

  it('renders a disabled image select, if user does not have create_linode permission', () => {
    const { getByLabelText, getByPlaceholderText } =
      renderWithThemeAndHookFormContext({
        component: <Images />,
      });

    expect(getByLabelText('Images')).toBeVisible();
    expect(getByPlaceholderText('Choose an image')).toBeVisible();
    expect(getByPlaceholderText('Choose an image')).toBeDisabled();
  });

  it('renders an enables image select, if user has create_linode permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const { getByLabelText, getByPlaceholderText } =
      renderWithThemeAndHookFormContext({
        component: <Images />,
      });

    expect(getByLabelText('Images')).toBeVisible();
    expect(getByPlaceholderText('Choose an image')).toBeVisible();
    expect(getByPlaceholderText('Choose an image')).toBeEnabled();
  });
});
