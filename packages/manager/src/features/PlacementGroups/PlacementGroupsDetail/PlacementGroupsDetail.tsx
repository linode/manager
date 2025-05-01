import { PLACEMENT_GROUP_TYPES } from '@linode/api-v4';
import {
  useMutatePlacementGroup,
  usePlacementGroupQuery,
  useRegionsQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState, Notice } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { PLACEMENT_GROUPS_DOCS_LINK } from '../constants';
import { PlacementGroupsLinodes } from './PlacementGroupsLinodes/PlacementGroupsLinodes';
import { PlacementGroupsSummary } from './PlacementGroupsSummary/PlacementGroupsSummary';

export const PlacementGroupsDetail = () => {
  const { id: placementGroupId } = useParams({ from: '/placement-groups/$id' });

  const {
    data: placementGroup,
    error: placementGroupError,
    isLoading,
  } = usePlacementGroupQuery(placementGroupId);
  const { data: regions } = useRegionsQuery();

  const region = regions?.find(
    (region) => region.id === placementGroup?.region
  );

  const isLinodeReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const {
    error: updatePlacementGroupError,
    mutateAsync: updatePlacementGroup,
    reset,
  } = useMutatePlacementGroup(placementGroupId);

  const errorText = getErrorStringOrDefault(updatePlacementGroupError ?? '');

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!placementGroup) {
    return <NotFound />;
  }

  if (placementGroupError) {
    return (
      <ErrorState errorText="There was a problem retrieving your Placement Group. Please try again." />
    );
  }

  const { label, placement_group_type } = placementGroup;

  const resetEditableLabel = () => {
    return `${label} (${PLACEMENT_GROUP_TYPES[placement_group_type]})`;
  };

  const handleLabelEdit = (newLabel: string) => {
    if (updatePlacementGroupError) {
      reset();
    }

    return updatePlacementGroup({ label: newLabel });
  };

  return (
    <>
      <DocumentTitleSegment segment={label} />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Placement Groups',
              position: 1,
            },
          ],
          onEditHandlers: {
            editableTextTitle: label,
            errorText,
            onCancel: resetEditableLabel,
            onEdit: handleLabelEdit,
          },
          pathname: `/placement-groups/${label}`,
        }}
        disabledBreadcrumbEditButton={isLinodeReadOnly}
        docsLabel="Docs"
        docsLink={PLACEMENT_GROUPS_DOCS_LINK}
        title="Placement Group Detail"
      />
      {isLinodeReadOnly && (
        <Notice
          spacingTop={16}
          text={getRestrictedResourceText({
            action: 'edit',
            resourceType: 'Placement Groups',
          })}
          variant="warning"
        />
      )}
      <PlacementGroupsSummary placementGroup={placementGroup} region={region} />
      <PlacementGroupsLinodes
        isLinodeReadOnly={isLinodeReadOnly}
        placementGroup={placementGroup}
        region={region}
      />
    </>
  );
};
