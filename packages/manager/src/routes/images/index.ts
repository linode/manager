import { createRoute, redirect } from '@tanstack/react-router';

import { imageLibrarySubTabs } from 'src/features/Images/ImagesLanding/v2/ImageLibrary/imageLibraryTabsConfig';

import { rootRoute } from '../root';
import { ImagesRoute } from './ImagesRoute';

import type { TableSearchParams } from '../types';
import type { ImageLibraryType } from 'src/features/Images/utils';

export interface ImagesSearchParams extends TableSearchParams {
  query?: string;
  subType?: ImageLibraryType;
}

export interface ImageCreateDiskSearchParams {
  selectedDisk?: string;
  selectedLinode?: string;
}

export interface ImageCreateUploadSearchParams {
  imageDescription?: string;
  imageLabel?: string;
}

type ImageActionRouteParams = {
  action: ImageAction;
  imageId: string;
};

type ImageLibraryTypeRouteParams = {
  imageType: ImageLibraryType;
};

const imageActions = {
  delete: 'delete',
  deploy: 'deploy',
  edit: 'edit',
  'manage-replicas': 'manage-replicas',
  rebuild: 'rebuild',
} as const;

export type ImageAction = (typeof imageActions)[keyof typeof imageActions];

const imagesRoute = createRoute({
  component: ImagesRoute,
  getParentRoute: () => rootRoute,
  path: 'images',
  validateSearch: (search: ImagesSearchParams) => search,
});

const imagesIndexRoute = createRoute({
  beforeLoad: ({ context }) => {
    // When private image sharing is enabled, redirect to Image Library tab with default 'owned-by-me' sub-tab
    if (context.isPrivateImageSharingEnabled) {
      throw redirect({
        to: '/images/image-library/$imageType',
        params: { imageType: 'owned-by-me' },
      });
    }
  },
  getParentRoute: () => imagesRoute,
  path: '/',
  validateSearch: (search: ImagesSearchParams) => search,
}).lazy(() =>
  import('src/features/Images/ImagesLanding/imagesLandingLazyRoute').then(
    (m) => m.imagesLandingLazyRoute
  )
);

const imageActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in imageActions)) {
      throw redirect({
        search: () => ({}),
        to: '/images',
      });
    }
  },
  getParentRoute: () => imagesRoute,
  params: {
    parse: ({ action, imageId }: ImageActionRouteParams) => ({
      action,
      imageId,
    }),
    stringify: ({ action, imageId }: ImageActionRouteParams) => ({
      action,
      imageId,
    }),
  },
  path: '$imageId/$action',
  validateSearch: (search: ImagesSearchParams) => search,
}).lazy(() =>
  import('src/features/Images/ImagesLanding/imagesLandingLazyRoute').then(
    (m) => m.imagesLandingLazyRoute
  )
);

const imagesCreateRoute = createRoute({
  getParentRoute: () => imagesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Images/ImagesCreate/imagesCreateLazyRoute').then(
    (m) => m.imageCreateLazyRoute
  )
);

const imagesCreateIndexRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      to: '/images/create/disk',
    });
  },
  getParentRoute: () => imagesCreateRoute,
  path: '/',
});

const imagesCreateDiskRoute = createRoute({
  getParentRoute: () => imagesCreateRoute,
  path: 'disk',
  validateSearch: (search: ImageCreateDiskSearchParams) => search,
}).lazy(() =>
  import('src/features/Images/ImagesCreate/imagesCreateLazyRoute').then(
    (m) => m.imageCreateLazyRoute
  )
);

const imagesCreateUploadRoute = createRoute({
  getParentRoute: () => imagesCreateRoute,
  path: 'upload',
  validateSearch: (search: ImageCreateUploadSearchParams) => search,
}).lazy(() =>
  import('src/features/Images/ImagesCreate/imagesCreateLazyRoute').then(
    (m) => m.imageCreateLazyRoute
  )
);

// V2 routes - Image Library tab and Share Groups tab

// Image Library tab - contains sub-tabs for 'Owned by me', 'Shared with me', and 'Recovery images'
const imageLibraryLandingRoute = createRoute({
  getParentRoute: () => imagesRoute,
  path: 'image-library',
  validateSearch: (search: ImagesSearchParams) => search,
}).lazy(() =>
  import('src/features/Images/ImagesLanding/v2/imagesLandingV2LazyRoute').then(
    (m) => m.imagesLandingV2LazyRoute
  )
);

const imageLibraryIndexRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (!context.isPrivateImageSharingEnabled) {
      throw redirect({
        to: '/images',
      });
    }
    if (
      context.isPrivateImageSharingEnabled &&
      location.pathname === '/images/image-library'
    ) {
      throw redirect({
        to: '/images/image-library/$imageType',
        params: { imageType: 'owned-by-me' },
      });
    }
  },
  getParentRoute: () => imageLibraryLandingRoute,
  path: '/',
  validateSearch: (search: ImagesSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ImageLibrary/imageLibraryTabsLazyRoute'
  ).then((m) => m.imageLibraryTabsLazyRoute)
);

const imageLibraryTypeRoute = createRoute({
  beforeLoad: async ({ context, params }) => {
    if (
      context.isPrivateImageSharingEnabled &&
      !imageLibrarySubTabs.map((tab) => tab.type).includes(params.imageType)
    ) {
      throw redirect({
        to: '/images/image-library/$imageType',
        params: { imageType: 'owned-by-me' },
      });
    }
  },
  getParentRoute: () => imageLibraryIndexRoute,
  params: {
    parse: ({ imageType }: ImageLibraryTypeRouteParams) => ({
      imageType,
    }),
    stringify: ({ imageType }: ImageLibraryTypeRouteParams) => ({
      imageType,
    }),
  },
  path: '$imageType',
  validateSearch: (search: ImagesSearchParams) => search,
});

const imageActionRouteV2 = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in imageActions)) {
      throw redirect({
        search: () => ({}),
        to: '/images',
      });
    }
  },
  getParentRoute: () => imageLibraryTypeRoute,
  params: {
    parse: ({ action, imageId }: ImageActionRouteParams) => ({
      action,
      imageId,
    }),
    stringify: ({ action, imageId }: ImageActionRouteParams) => ({
      action,
      imageId,
    }),
  },
  path: '$imageId/$action',
  validateSearch: (search: ImagesSearchParams) => search,
}).lazy(() =>
  import('src/features/Images/ImagesLanding/v2/imagesLandingV2LazyRoute').then(
    (m) => m.imagesLandingV2LazyRoute
  )
);

// Share Groups tab
const shareGroupsLandingRoute = createRoute({
  getParentRoute: () => imagesRoute,
  path: 'share-groups',
  validateSearch: (search: ImagesSearchParams) => search,
}).lazy(() =>
  import('src/features/Images/ImagesLanding/v2/imagesLandingV2LazyRoute').then(
    (m) => m.imagesLandingV2LazyRoute
  )
);

const shareGroupsIndexRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (!context.isPrivateImageSharingEnabled) {
      throw redirect({
        to: '/images',
      });
    }
  },
  getParentRoute: () => shareGroupsLandingRoute,
  path: '/',
  validateSearch: (search: ImagesSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ShareGroups/shareGroupsTabsLazyRoute'
  ).then((m) => m.shareGroupsTabsLazyRoute)
);

export const imagesRouteTree = imagesRoute.addChildren([
  imagesIndexRoute.addChildren([imageActionRoute]),
  imageLibraryLandingRoute.addChildren([
    imageLibraryIndexRoute.addChildren([
      imageLibraryTypeRoute.addChildren([imageActionRouteV2]),
    ]),
  ]),
  shareGroupsLandingRoute.addChildren([shareGroupsIndexRoute]),
  imagesCreateRoute.addChildren([
    imagesCreateIndexRoute,
    imagesCreateDiskRoute,
    imagesCreateUploadRoute,
  ]),
]);
