import * as React from 'react';
import { useHistory } from 'react-router-dom';

import KubernetesSvg from 'src/assets/icons/entityIcons/kubernetes.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './KubernetesLandingEmptyStateData';

export const KubernetesEmptyState = () => {
  const { push } = useHistory();

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_lke_clusters',
  });

  return (
    <ResourcesSection
      buttonProps={[
        {
          children: 'Create Cluster',
          disabled: isRestricted,
          onClick: () => {
            sendEvent({
              action: 'Click:button',
              category: linkAnalyticsEvent.category,
              label: 'Create Cluster',
            });
            push('/kubernetes/create');
          },
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Clusters',
          }),
        },
      ]}
      gettingStartedGuidesData={gettingStartedGuides}
      headers={headers}
      icon={KubernetesSvg}
      linkAnalyticsEvent={linkAnalyticsEvent}
      youtubeLinkData={youtubeLinkData}
    />
  );
};
