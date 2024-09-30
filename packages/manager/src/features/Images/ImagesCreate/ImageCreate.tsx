import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { NavTabs } from 'src/components/NavTabs/NavTabs';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import type { NavTab } from 'src/components/NavTabs/NavTabs';

const ImageUpload = React.lazy(() =>
  import('./ImageUpload').then((module) => ({ default: module.ImageUpload }))
);

const CreateImageTab = React.lazy(() =>
  import('./CreateImageTab').then((module) => ({
    default: module.CreateImageTab,
  }))
);

export const ImageCreate = () => {
  const { url } = useRouteMatch();

  const tabs: NavTab[] = [
    {
      render: <CreateImageTab />,
      routeName: `${url}/disk`,
      title: 'Capture Image',
    },
    {
      render: <ImageUpload />,
      routeName: `${url}/upload`,
      title: 'Upload Image',
    },
  ];

  return (
    <>
      <DocumentTitleSegment segment="Create Image" />
      <React.Suspense fallback={<SuspenseLoader />}>
        <NavTabs tabs={tabs} />
      </React.Suspense>
    </>
  );
};

export const ImageCreateLazyRoute = createLazyRoute('/images/create')({
  component: ImageCreate,
});

export default ImageCreate;
