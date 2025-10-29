import * as React from 'react';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { ImagesLandingTable } from './ImagesLandingTable';

const queryMocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ privateImageSharing: false }),
  useLocation: vi.fn(),
  usePermissions: vi.fn().mockReturnValue({ data: { create_image: false } }),
  useQueryWithPermissions: vi.fn().mockReturnValue({}),
  useLinodesPermissionsCheck: vi.fn().mockReturnValue({}),
  useSearch: vi.fn(),
}));

vi.mock('src/hooks/useFlags', () => ({
  useFlags: queryMocks.useFlags,
}));

// Mock ImagesCustom component so it doesn't lazy load in tests
vi.mock('./ImagesCustom', () => ({
  ImagesCustom: () => <div>ImagesCustom Component</div>,
}));

// Mock ImagesRecovery component so it doesn't lazy load in tests
vi.mock('./ImagesRecovery', () => ({
  ImagesRecovery: () => <div>ImagesCustom Component</div>,
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
  useQueryWithPermissions: queryMocks.useQueryWithPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('../utils.ts', async () => {
  const actual = await vi.importActual('../utils');
  return {
    ...actual,
    useLinodesPermissionsCheck: queryMocks.useLinodesPermissionsCheck,
  };
});

beforeAll(() => mockMatchMedia());

describe('Images Landing Table', () => {
  beforeEach(() => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        update_image: true,
        delete_image: true,
        rebuild_linode: true,
        create_linode: true,
        replicate_image: true,
      },
    });

    queryMocks.useLocation.mockReturnValue({
      pathname: '/images/images',
    });
    queryMocks.useSearch.mockReturnValue({});
  });

  it("should render 'My custom images' tab", async () => {
    const { getByText } = renderWithTheme(<ImagesLandingTable />, {
      initialRoute: '/images',
    });

    expect(getByText('My custom images')).toBeVisible();
  });

  it("should render 'Shared with me' tab only if 'privateImageSharing' feature flag enabled", async () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: true });

    const { getByText } = renderWithTheme(<ImagesLandingTable />, {
      initialRoute: '/images',
    });

    expect(getByText('Shared with me')).toBeVisible();
  });

  it("should not render 'Shared with me' tab if 'privateImageSharing' feature flag disabled", async () => {
    queryMocks.useFlags.mockReturnValue({ privateImageSharing: false });

    const { getByText, queryByText } = renderWithTheme(<ImagesLandingTable />, {
      initialRoute: '/images',
    });

    expect(getByText('My custom images')).toBeVisible();
    expect(queryByText('Shared with me')).toBeNull(); // Not visible
    expect(getByText('Recovery images')).toBeVisible();
  });

  it("should render 'My custom images' tab", async () => {
    const { getByText } = renderWithTheme(<ImagesLandingTable />, {
      initialRoute: '/images',
    });

    expect(getByText('Recovery images')).toBeVisible();
  });

  // @TODO - check if we need this test or not
  // it('should render images landing empty state', async () => {
  //   server.use(
  //     http.get('*/images', () => {
  //       return HttpResponse.json(makeResourcePage([]));
  //     })
  //   );
  //   const { getByText, queryByTestId } = renderWithTheme(
  //     <ImagesLandingTable />,
  //     {
  //       initialRoute: '/images',
  //     }
  //   );
  //   const loadingElement = queryByTestId(loadingTestId);
  //   await waitForElementToBeRemoved(loadingElement);
  //   expect(
  //     getByText((text) => text.includes('Store custom Linux images'))
  //   ).toBeVisible();
  // });
});
