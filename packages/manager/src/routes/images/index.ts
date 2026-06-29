import { createRoute, redirect } from '@tanstack/react-router';

import { imageLibrarySubTabs } from 'src/features/Images/ImagesLanding/v2/ImageLibrary/imageLibraryTabsConfig';
import { shareGroupsSubTabs } from 'src/features/Images/ImagesLanding/v2/ShareGroups/shareGroupsTabsConfig';

import { rootRoute } from '../root';
import { ImagesRoute } from './ImagesRoute';

import type { TableSearchParams } from '../types';
import type {
  ImageLibraryType,
  ShareGroupsType,
} from 'src/features/Images/utils';

export interface ImagesSearchParams extends TableSearchParams {
  query?: string;
}

export interface ImageCreateDiskSearchParams {
  selectedDisk?: string;
  selectedLinode?: string;
}

export interface ImageCreateUploadSearchParams {
  imageDescription?: string;
  imageLabel?: string;
}

export interface ShareGroupDetailsSearchParams extends TableSearchParams {
  imagesQuery?: string;
  membersQuery?: string;
}

type ImageActionRouteParams = {
  action: ImageAction;
  imageId: string;
};

type ImageLibraryTypeRouteParams = {
  imageType: ImageLibraryType;
};

type ShareGroupsTypeRouteParams = {
  shareGroupsType: ShareGroupsType;
};
type ShareGroupDetailsRouteParams = {
  shareGroupId: string;
};

type JoinedGroupDetailsRouteParams = {
  tokenUuid: string;
};

interface ShareGroupActionRouteParams extends ShareGroupDetailsRouteParams {
  action: ShareGroupAction;
}

const imageActions = {
  delete: 'delete',
  deploy: 'deploy',
  edit: 'edit',
  'manage-replicas': 'manage-replicas',
  rebuild: 'rebuild',
  view: 'view',
  'view-share-groups': 'view-share-groups',
} as const;

const shareGroupActions = {
  'add-images': 'add-images',
  'add-members': 'add-members',
  delete: 'delete',
  edit: 'edit',
} as const;

const IMAGE_LIBRARY_REDIRECT_TO = '/images/image-library/$imageType' as const;
const IMAGE_LIBRARY_REDIRECT_PARAMS = {
  imageType: 'owned-by-me' as const,
};

export type ImageAction = (typeof imageActions)[keyof typeof imageActions];
export type ShareGroupAction =
  (typeof shareGroupActions)[keyof typeof shareGroupActions];

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
        to: IMAGE_LIBRARY_REDIRECT_TO,
        params: IMAGE_LIBRARY_REDIRECT_PARAMS,
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
  beforeLoad: async ({ context, params }) => {
    // Prevent access if private image sharing is enabled
    if (context.isPrivateImageSharingEnabled) {
      throw redirect({
        to: IMAGE_LIBRARY_REDIRECT_TO,
        params: IMAGE_LIBRARY_REDIRECT_PARAMS,
      });
    }
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

    const normalizedPath = location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;

    if (
      context.isPrivateImageSharingEnabled &&
      normalizedPath === '/images/image-library'
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
        to: IMAGE_LIBRARY_REDIRECT_TO,
        params: IMAGE_LIBRARY_REDIRECT_PARAMS,
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

    const normalizedPath = location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;

    if (
      context.isPrivateImageSharingEnabled &&
      normalizedPath === '/images/share-groups'
    ) {
      throw redirect({
        to: '/images/share-groups/$shareGroupsType',
        params: { shareGroupsType: 'owned-groups' },
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

const shareGroupsTypeRoute = createRoute({
  beforeLoad: async ({ context, params }) => {
    if (
      context.isPrivateImageSharingEnabled &&
      !shareGroupsSubTabs
        .map((tab) => tab.type)
        .includes(params.shareGroupsType)
    ) {
      throw redirect({
        to: '/images/share-groups/$shareGroupsType',
        params: { shareGroupsType: 'owned-groups' },
      });
    }
  },
  getParentRoute: () => shareGroupsIndexRoute,
  params: {
    parse: ({ shareGroupsType }: ShareGroupsTypeRouteParams) => ({
      shareGroupsType,
    }),
    stringify: ({ shareGroupsType }: ShareGroupsTypeRouteParams) => ({
      shareGroupsType,
    }),
  },
  path: '$shareGroupsType',
  validateSearch: (search: ImagesSearchParams) => search,
});

const shareGroupsCreateRoute = createRoute({
  getParentRoute: () => imagesRoute,
  path: 'share-groups/create',
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ShareGroups/ShareGroupsCreate/ShareGroupsCreateLazyRoute'
  ).then((m) => m.shareGroupsCreateLazyRoute)
);

const shareGroupActionRoute = createRoute({
  beforeLoad: async ({ params }) => {
    if (!(params.action in shareGroupActions)) {
      throw redirect({
        search: () => ({}),
        to: '/images/share-groups',
      });
    }
  },
  getParentRoute: () => imagesRoute,
  params: {
    parse: ({ action, shareGroupId }: ShareGroupActionRouteParams) => ({
      action,
      shareGroupId,
    }),
    stringify: ({ action, shareGroupId }: ShareGroupActionRouteParams) => ({
      action,
      shareGroupId,
    }),
  },
  path: 'share-groups/owned-groups/$shareGroupId/$action',
  validateSearch: (search: ShareGroupDetailsSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ShareGroups/shareGroupsTabsLazyRoute'
  ).then((m) => m.shareGroupsTabsLazyRoute)
);

const shareGroupsMembershipRequestRoute = createRoute({
  beforeLoad: ({ params }) => {
    if (params.shareGroupsType !== 'membership-requests') {
      throw redirect({
        params: { shareGroupsType: 'membership-requests' },
        to: '/images/share-groups/$shareGroupsType',
      });
    }
  },
  getParentRoute: () => shareGroupsTypeRoute,
  path: 'request',
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ShareGroups/shareGroupsTabsLazyRoute'
  ).then((m) => m.shareGroupsTabsLazyRoute)
);

const shareGroupDetailsRoute = createRoute({
  getParentRoute: () => imagesRoute,
  params: {
    parse: ({ shareGroupId }: ShareGroupDetailsRouteParams) => ({
      shareGroupId,
    }),
    stringify: ({ shareGroupId }: ShareGroupDetailsRouteParams) => ({
      shareGroupId,
    }),
  },
  path: 'share-groups/owned-groups/$shareGroupId',
  validateSearch: (search: ShareGroupDetailsSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ShareGroups/ShareGroupsDetails/ShareGroupDetailsLazyRoute'
  ).then((m) => m.shareGroupDetailsLazyRoute)
);

const joinedGroupDetailsRoute = createRoute({
  getParentRoute: () => imagesRoute,
  params: {
    parse: ({ tokenUuid }: JoinedGroupDetailsRouteParams) => ({
      tokenUuid,
    }),
    stringify: ({ tokenUuid }: JoinedGroupDetailsRouteParams) => ({
      tokenUuid,
    }),
  },
  path: 'share-groups/joined-groups/$tokenUuid',
  validateSearch: (search: ShareGroupDetailsSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ShareGroups/JoinedGroupsDetails/JoinedGroupDetailsLazyRoute'
  ).then((m) => m.joinedGroupDetailsLazyRoute)
);

const shareGroupsAddImagesRoute = createRoute({
  getParentRoute: () => imagesRoute,
  params: {
    parse: ({ shareGroupId }: ShareGroupDetailsRouteParams) => ({
      shareGroupId,
    }),
    stringify: ({ shareGroupId }: ShareGroupDetailsRouteParams) => ({
      shareGroupId,
    }),
  },
  path: 'share-groups/owned-groups/$shareGroupId/add-images',
}).lazy(() =>
  import(
    'src/features/Images/ImagesLanding/v2/ShareGroups/AddImagesLazyRoute'
  ).then((m) => m.addImagesLazyRoute)
);

export const imagesRouteTree = imagesRoute.addChildren([
  imagesIndexRoute.addChildren([imageActionRoute]),
  imageLibraryLandingRoute.addChildren([
    imageLibraryIndexRoute.addChildren([
      imageLibraryTypeRoute.addChildren([imageActionRouteV2]),
    ]),
  ]),
  shareGroupsLandingRoute.addChildren([
    shareGroupsIndexRoute.addChildren([
      shareGroupsTypeRoute.addChildren([shareGroupsMembershipRequestRoute]),
    ]),
    shareGroupsCreateRoute,
    shareGroupsAddImagesRoute,
    shareGroupActionRoute,
    shareGroupDetailsRoute,
    joinedGroupDetailsRoute,
  ]),
  imagesCreateRoute.addChildren([
    imagesCreateIndexRoute,
    imagesCreateDiskRoute,
    imagesCreateUploadRoute,
  ]),
]);
