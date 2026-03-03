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

import {
  IMAGE_SELECT_TABLE_PENDO_IDS,
  TABLE_CELL_BASE_STYLE,
} from './constants';

import type { Image, ImageRegion, Region } from '@linode/api-v4';
import type { Theme } from '@linode/ui';

interface Props {
  image: Image;
  onSelect: () => void;
  pendoIDs: typeof IMAGE_SELECT_TABLE_PENDO_IDS;
  regions: Region[];
  selected: boolean;
  timezone?: string;
}

export const ImageSelectTableRow = (props: Props) => {
  const { image, onSelect, pendoIDs, regions, selected, timezone } = props;

  const {
    capabilities,
    created,
    id,
    image_sharing,
    label,
    regions: imageRegions,
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

  const getRegionListItem = (imageRegion: ImageRegion) => {
    const matchingRegion = regions.find((r) => r.id === imageRegion.region);

    return matchingRegion
      ? `${matchingRegion.label} (${imageRegion.region})`
      : imageRegion.region;
  };

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      {imageRegions.map((region: ImageRegion, idx) => {
        return (
          <ListItem disablePadding key={`${region.region}-${idx}`}>
            {getRegionListItem(region)}
          </ListItem>
        );
      })}
    </StyledFormattedRegionList>
  );

  return (
    <TableRow key={id} rowborder>
      <TableCell style={{ ...TABLE_CELL_BASE_STYLE }}>
        <FormControlLabel
          checked={selected}
          control={<Radio />}
          label={label}
          onChange={onSelect}
          sx={{ gap: 2 }}
        />
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
            tooltipText={<FormattedRegionList />}
          />
        </TableCell>
      </Hidden>
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
