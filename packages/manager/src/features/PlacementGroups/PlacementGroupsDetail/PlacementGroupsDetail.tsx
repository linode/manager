import { AFFINITY_TYPES } from '@linode/api-v4';
import { useTheme } from '@mui/material';
import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { Notice } from 'src/components/Notice/Notice';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import {
  useMutatePlacementGroup,
  usePlacementGroupQuery,
} from 'src/queries/placementGroups';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { getPlacementGroupLinodeCount } from '../utils';
import { getWarningNoticeText } from '../utils';
import { PlacementGroupsLinodes } from './PlacementGroupsLinodes/PlacementGroupsLinodes';
import { PlacementGroupsSummary } from './PlacementGroupsSummary/PlacementGroupsSummary';

export const PlacementGroupsDetail = () => {
  const flags = useFlags();
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const history = useHistory();
  const theme = useTheme();
  const placementGroupId = Number(id);

  const {
    data: placementGroup,
    error: placementGroupError,
    isLoading,
  } = usePlacementGroupQuery(placementGroupId, Boolean(flags.vmPlacement));

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

  const linodeCount = getPlacementGroupLinodeCount(placementGroup);
  const tabs = [
    {
      routeName: `/placement-groups/${id}`,
      title: 'Summary',
    },
    {
      routeName: `/placement-groups/${id}/linodes`,
      title: `Linodes (${linodeCount})`,
    },
  ];
  const { affinity_type, label } = placementGroup;
  const tabIndex = tab ? tabs.findIndex((t) => t.routeName.endsWith(tab)) : -1;

  const resetEditableLabel = () => {
    return `${label} (${AFFINITY_TYPES[affinity_type]})`;
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
            editableTextTitleSuffix: ` (${AFFINITY_TYPES[affinity_type]})`,
            errorText,
            onCancel: resetEditableLabel,
            onEdit: handleLabelEdit,
          },
          pathname: `/placement-groups/${label}`,
        }}
        docsLabel="Docs"
        docsLink="TODO VM_Placement: add doc link"
        title="Placement Group Detail"
      />
      <Tabs
        index={tabIndex === -1 ? 0 : tabIndex}
        onChange={(i) => history.push(tabs[i].routeName)}
      >
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            {!placementGroup.compliant && (
              <Notice spacingBottom={20} spacingTop={24} variant="warning">
                <Typography fontFamily={theme.font.bold}>
                  {getWarningNoticeText(placementGroup)}
                  {/* TODO VM_Placement: Get link location */}
                  <Link
                    className="secondaryLink"
                    data-testid="pg-non-compliant-notice-link"
                    to={'#'}
                  >
                    Learn more.
                  </Link>
                </Typography>
              </Notice>
            )}
            <PlacementGroupsSummary placementGroup={placementGroup} />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <PlacementGroupsLinodes placementGroup={placementGroup} />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
