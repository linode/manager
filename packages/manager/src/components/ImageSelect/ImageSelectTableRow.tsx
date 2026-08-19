import { TableCell, TableRow } from '@akamai/cds-components/react/Table';
import { convertStorageUnit } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { pluralize } from '@akamai/compute-ui-core/formatting';
import { usePreferences } from '@linode/queries';
import { FormControlLabel, ListItem, Radio, TooltipIcon } from '@linode/ui';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import CoreSharedIcon from 'src/assets/icons/core-shared.svg';
import {
  PlanTextTooltip,
  StyledFormattedRegionList,
} from 'src/features/components/PlansPanel/PlansAvailabilityNotice.styles';
import { LINODE_CREATE_SHARED_IMAGE_ICON_TOOLTIP } from 'src/features/Images/constants';
import { getIsTableStripingEnabled } from 'src/features/Profile/Settings/TableStriping.utils';

import { getRegionListItem } from './utilities';

import type {
  IMAGE_SELECT_TABLE_LINODE_CREATE_PENDO_IDS,
  IMAGE_SELECT_TABLE_LINODE_REBUILD_PENDO_IDS,
} from './constants';
import type { Image, ImageRegion, Region } from '@linode/api-v4';
import type { IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS } from 'src/components/ImageSelect/constants';

interface Props {
  image: Image;
  onSelect?: () => void;
  pendoIDs:
    | typeof IMAGE_SELECT_TABLE_LINODE_CREATE_PENDO_IDS
    | typeof IMAGE_SELECT_TABLE_LINODE_REBUILD_PENDO_IDS
    | typeof IMAGE_SELECT_TABLE_SHARE_GROUP_CREATE_PENDO_IDS;
  regions: Region[];
  selectedImageIds: string[];
  selectionMode: 'multi' | 'single';
  timezone?: string;
}

export const ImageSelectTableRow = (props: Props) => {
  const {
    image,
    onSelect,
    pendoIDs,
    regions,
    selectedImageIds,
    timezone,
    selectionMode,
  } = props;

  const {
    capabilities,
    created,
    id,
    is_shared,
    image_sharing,
    label,
    regions: _imageRegions,
    size,
    status,
    type,
  } = image;

  const getSizeDisplay = () => {
    if (status === 'available') {
      const sizeInGB = convertStorageUnit('MB', size, 'GB');
      const formatted = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(sizeInGB);
      return `${formatted} GB`;
    }
    return 'Pending';
  };

  const getShareGroupDisplay = () => {
    if (image_sharing?.shared_by?.sharegroup_label) {
      return image_sharing.shared_by.sharegroup_label;
    }

    return '—';
  };

  const imageRegions = _imageRegions ?? []; // Failsafe for manual images whose `regions` property is null

  const selected = selectedImageIds.includes(id);

  const { data: tableStripingPreference } = usePreferences(
    (preferences) => preferences?.isTableStripingEnabled
  );
  const isTableStripingEnabled = getIsTableStripingEnabled(
    tableStripingPreference
  );

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      {imageRegions.map((region: ImageRegion, idx) => {
        return (
          <ListItem disablePadding key={`${region.region}-${idx}`}>
            {getRegionListItem(regions, region)}
          </ListItem>
        );
      })}
    </StyledFormattedRegionList>
  );

  return (
    <TableRow
      key={id}
      rowborder={!isTableStripingEnabled}
      select={onSelect}
      selectable={selectionMode === 'multi'}
      selected={selected}
      zebra={isTableStripingEnabled}
    >
      <TableCell
        style={{
          flex: '0 1 24.5%',
          overflowWrap: 'anywhere',
        }}
      >
        {selectionMode === 'single' ? (
          <FormControlLabel
            checked={selected}
            control={<Radio />}
            label={label}
            onChange={onSelect}
            sx={{ gap: 2 }}
          />
        ) : (
          label
        )}
        {type === 'manual' && capabilities.includes('cloud-init') && (
          <TooltipIcon
            data-pendo-id={pendoIDs.metadataSupportedIcon}
            icon={<CloudInitIcon />}
            sxTooltipIcon={{
              padding: 0,
            }}
            text="This image supports our Metadata service via cloud-init."
          />
        )}
        {is_shared && (
          <TooltipIcon
            icon={<CoreSharedIcon />}
            sxTooltipIcon={{
              padding: 0,
            }}
            text={LINODE_CREATE_SHARED_IMAGE_ICON_TOOLTIP}
          />
        )}
      </TableCell>
      <TableCell
        style={{
          whiteSpace: 'nowrap',
          paddingLeft: '47px',
        }}
      >
        <PlanTextTooltip
          data-pendo-id={pendoIDs.replicatedRegionPopover}
          displayText={
            imageRegions.length > 0
              ? pluralize('Region', 'Regions', imageRegions.length)
              : '—'
          }
          tooltipText={
            imageRegions?.length > 0 ? <FormattedRegionList /> : 'N/A'
          }
        />
      </TableCell>
      {selectionMode === 'single' && (
        <TableCell
          style={{
            overflowWrap: 'anywhere',
          }}
        >
          {getShareGroupDisplay()}
        </TableCell>
      )}
      <TableCell>{getSizeDisplay()}</TableCell>
      <TableCell>{formatDate(created, { timezone })}</TableCell>
      <TableCell>{id}</TableCell>
    </TableRow>
  );
};
