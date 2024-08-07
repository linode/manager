import * as React from 'react';
import { useHistory } from 'react-router-dom';

import KubernetesSvg from 'src/assets/icons/entityIcons/kubernetes.svg';
import { ResourcesSection } from 'src/components/EmptyLandingPageResources/ResourcesSection';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { sendEvent } from 'src/utilities/analytics/utils';

import {
  gettingStartedGuides,
  headers,
  linkAnalyticsEvent,
  youtubeLinkData,
} from './KubernetesLandingEmptyStateData';

interface Props {
  isRestricted: boolean;
}

export const KubernetesEmptyState = (props: Props) => {
  const { isRestricted = false } = props;

  const { push } = useHistory();

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
