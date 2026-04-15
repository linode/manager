import {
  FormControlLabel,
  Hidden,
  ListItem,
  Radio,
  TooltipIcon,
} from '@linode/ui';
import { convertStorageUnit, pluralize } from '@linode/utilities';
import useMediaQuery from '@mui/material/useMediaQuery';
import { TableCell, TableRow } from 'akamai-cds-react-components/Table';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import {
  PlanTextTooltip,
  StyledFormattedRegionList,
} from 'src/features/components/PlansPanel/PlansAvailabilityNotice.styles';
import { formatDate } from 'src/utilities/formatDate';

import { TABLE_CELL_BASE_STYLE } from './constants';
import { getRegionListItem } from './utilities';

import type {
  IMAGE_SELECT_TABLE_LINODE_CREATE_PENDO_IDS,
  IMAGE_SELECT_TABLE_LINODE_REBUILD_PENDO_IDS,
} from './constants';
import type { Image, ImageRegion, Region } from '@linode/api-v4';
import type { Theme } from '@linode/ui';
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
    image_sharing,
    label,
    regions: _imageRegions,
    size,
    status,
    type,
  } = image;

  const matchesLgDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('lg')
  );

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

  const selected = selectedImageIds.includes(id);
  return (
    <TableRow
      key={id}
      rowborder
      select={onSelect}
      selectable={selectionMode === 'multi'}
      selected={selected}
    >
      <TableCell style={{ ...TABLE_CELL_BASE_STYLE }}>
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
      </TableCell>
      <Hidden lgDown>
        <TableCell
          style={{
            whiteSpace: 'nowrap',
            paddingLeft: '58px',
            ...TABLE_CELL_BASE_STYLE,
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
      </Hidden>
      {selectionMode === 'single' && (
        <Hidden smDown>
          <TableCell
            style={{
              whiteSpace: 'nowrap',
              paddingLeft: matchesLgDown ? '58px' : undefined,
              ...TABLE_CELL_BASE_STYLE,
            }}
          >
            {getShareGroupDisplay()}
          </TableCell>
        </Hidden>
      )}
      <Hidden lgDown>
        <TableCell style={{ whiteSpace: 'nowrap', ...TABLE_CELL_BASE_STYLE }}>
          {getSizeDisplay()}
        </TableCell>
      </Hidden>
      <TableCell style={{ whiteSpace: 'nowrap', ...TABLE_CELL_BASE_STYLE }}>
        {formatDate(created, { timezone })}
      </TableCell>
      <TableCell style={{ whiteSpace: 'nowrap', ...TABLE_CELL_BASE_STYLE }}>
        {id}
      </TableCell>
    </TableRow>
  );
};
