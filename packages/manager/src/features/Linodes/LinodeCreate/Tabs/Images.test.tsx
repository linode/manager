import React from 'react';

import {
  renderWithThemeAndHookFormContext,
  resizeScreenSize,
} from 'src/utilities/testHelpers';

import { Images } from './Images';

const queryMocks = vi.hoisted(() => ({
  useIsPrivateImageSharingEnabled: vi.fn(() => ({
    isPrivateImageSharingEnabled: false,
  })),
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

vi.mock('src/features/Images/utils', async () => {
  const actual = await vi.importActual('src/features/Images/utils');
  return {
    ...actual,
    useIsPrivateImageSharingEnabled: queryMocks.useIsPrivateImageSharingEnabled,
  };
});

describe('Images', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
    queryMocks.useIsPrivateImageSharingEnabled.mockReturnValue({
      isPrivateImageSharingEnabled: false,
    });
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

  describe('when isPrivateImageSharingEnabled is true', () => {
    beforeEach(() => {
      queryMocks.useIsPrivateImageSharingEnabled.mockReturnValue({
        isPrivateImageSharingEnabled: true,
      });
      // Mock matchMedia at a width wider than MUI's `lg` breakpoint (1200px)
      // so that columns wrapped in <Hidden lgDown> are not hidden.
      resizeScreenSize(1280);
    });

    it('renders the search images field', () => {
      const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
        component: <Images />,
      });

      expect(getByPlaceholderText('Search images')).toBeVisible();
    });

    it('renders the filter by tag field', () => {
      const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
        component: <Images />,
      });

      expect(getByPlaceholderText('Filter by tag')).toBeVisible();
    });

    it('renders the filter by region field', () => {
      const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
        component: <Images />,
      });

      expect(getByPlaceholderText('Filter by region')).toBeVisible();
    });

    it('renders the table column headers', () => {
      const { getByText } = renderWithThemeAndHookFormContext({
        component: <Images />,
      });

      expect(getByText('Image')).toBeVisible();
      expect(getByText('Replicated in')).toBeVisible();
      expect(getByText('Share Group')).toBeVisible();
      expect(getByText('Size')).toBeVisible();
      expect(getByText('Created')).toBeVisible();
      expect(getByText('Image ID')).toBeVisible();
    });
  });
});
