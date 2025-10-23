import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesLanding } from './ImagesLanding';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ privateImageSharing: false }),
  usePermissions: vi.fn().mockReturnValue({ data: { create_image: true } }),
  useQueryWithPermissions: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(),
}));

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

// Mock ImagesLandingTable component so it doesn't lazy load in tests
vi.mock('./ImagesLandingTable', () => ({
  ImagesLandingTable: () => <div>ImagesLandingTable Component</div>,
}));

describe('ImagesLanding', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue({});
  });

  it("should render Images tab always and hides Share Groups tab if 'privateImageSharing' feature flag is false", () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });

    const { queryByRole, getByRole } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(getByRole('tab', { name: /images/i })).toBeVisible();
    expect(queryByRole('tab', { name: /share groups/i })).toBeNull();
  });

  it('should render Share Groups tab when privateImageSharing feature flag is true', () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: true });

    const { getByRole } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(getByRole('tab', { name: /images/i })).toBeVisible();
    expect(getByRole('tab', { name: /share groups/i })).toBeVisible();
  });

  it('should disable create button if user lacks create_image permission', async () => {
    queryMocks.usePermissions.mockReturnValue({
      data: { create_image: false },
    });

    const { getByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    const createButton = getByText('Create Image');
    expect(createButton).toBeDisabled();
    expect(createButton).toHaveAttribute(
      'data-qa-tooltip',
      "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
    );
  });

  it('should enable create button if user has create_image permission', async () => {
    queryMocks.usePermissions.mockReturnValue({ data: { create_image: true } });

    const { getByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    const createButton = getByText('Create Image');
    expect(createButton).toBeEnabled();
  });

  it('should trigger navigation to /images/create when create button is clicked', async () => {
    queryMocks.usePermissions.mockReturnValue({ data: { create_image: true } });

    const { getByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    const createButton = getByText('Create Image');
    await userEvent.click(createButton);

    expect(queryMocks.useNavigate).toHaveBeenCalledWith({
      to: '/images/create',
      search: expect.any(Function),
    });
  });

  it('should render ImagesLandingTable component in the Images tab panel', () => {
    queryMocks.usePermissions.mockReturnValue({ data: { create_image: true } });

    const { getByText } = renderWithTheme(<ImagesLanding />, {
      initialRoute: '/images',
    });

    expect(getByText('ImagesLandingTable Component')).toBeVisible();
  });
});
