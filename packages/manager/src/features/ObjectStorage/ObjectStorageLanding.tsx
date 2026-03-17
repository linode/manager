import { useAccountSettings, useProfile } from '@linode/queries';
import { useMatch, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { useFlags } from 'src/hooks/useFlags';

import { getRestrictedResourceText } from '../Account/utils';
import { BucketsLandingPage } from './BucketsLandingPage';
import { AccessKeyDrawers } from './ObjectStorageDrawers/AccessKeyDrawers';
import { CreateBucketDrawer } from './ObjectStorageDrawers/CreateBucketDrawer';
import { ObjectStorageTabs } from './ObjectStorageTabs';

export const ObjectStorageLanding = () => {
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });

  const { objSummaryPage } = useFlags();

  const { data: profile } = useProfile();
  const { data: accountSettings } = useAccountSettings();

  const isRestrictedUser = profile?.restricted ?? false;
  const isObjectStorageEnabled = accountSettings?.object_storage === 'active';
  const isLandingPageShown = !isObjectStorageEnabled || isRestrictedUser;

  const isSummaryOpened = routeId === '/object-storage/summary';
  const isAccessKeysOpened = routeId === '/object-storage/access-keys';

  // TODO: Cover all the cases
  const pageTitleText = isLandingPageShown
    ? 'Create a Bucket'
    : 'Object Storage';

  const createButtonText = isAccessKeysOpened
    ? 'Create Access Key'
    : 'Create Bucket';

  const createButtonAction = () => {
    if (isAccessKeysOpened) {
      navigate({ to: '/object-storage/access-keys/create' });
    } else {
      navigate({ to: '/object-storage/buckets/create' });
    }
  };

  if (!isLandingPageShown && routeId === '/object-storage/') {
    // TODO: Remove condition when OBJ Summary is enabled
    navigate({
      to: objSummaryPage
        ? '/object-storage/summary'
        : '/object-storage/buckets',
    });
  }

  if (
    isLandingPageShown &&
    routeId !== '/object-storage/' &&
    !routeId.endsWith('/create')
  ) {
    navigate({ to: '/object-storage' });
  }

  return (
    <>
      <DocumentTitleSegment segment={pageTitleText} />

      {!isLandingPageShown && (
        <LandingHeader
          breadcrumbProps={{ pathname: '/object-storage' }}
          buttonDataAttrs={{
            tooltipText: getRestrictedResourceText({
              action: 'create',
              isSingular: false,
              resourceType: 'Buckets',
            }),
          }}
          createButtonText={createButtonText}
          disabledCreateButton={isRestrictedUser}
          docsLink="https://www.linode.com/docs/platform/object-storage/"
          entity="Object Storage"
          onButtonClick={isSummaryOpened ? undefined : createButtonAction}
          removeCrumbX={1}
          spacingBottom={4}
          title="Object Storage"
        />
      )}

      {isLandingPageShown ? (
        <BucketsLandingPage isRestrictedUser={isRestrictedUser} />
      ) : (
        <ObjectStorageTabs />
      )}

      <CreateBucketDrawer />
      <AccessKeyDrawers />
    </>
  );
};
