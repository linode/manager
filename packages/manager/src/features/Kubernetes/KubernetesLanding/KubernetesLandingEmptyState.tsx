import * as React from 'react';
import { useHistory } from 'react-router-dom';

import ComputeIcon from 'src/assets/icons/entityIcons/compute.svg';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
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
    <React.Fragment>
      <DocumentTitleSegment segment="Kubernetes Clusters" />
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
              resourceType: 'LKE Clusters',
            }),
          },
        ]}
        gettingStartedGuidesData={gettingStartedGuides}
        headers={headers}
        icon={ComputeIcon}
        linkAnalyticsEvent={linkAnalyticsEvent}
        youtubeLinkData={youtubeLinkData}
      />
    </React.Fragment>
  );
};
