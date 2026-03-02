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

import type { Image, ImageRegion } from '@linode/api-v4';
import type { Theme } from '@linode/ui';

interface Props {
  image: Image;
  onSelect: () => void;
  selected: boolean;
  timezone?: string;
}

export const ImageSelectTableRow = (props: Props) => {
  const { image, onSelect, selected, timezone } = props;

  const {
    capabilities,
    created,
    id,
    image_sharing,
    label,
    regions,
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
    if (
      image_sharing?.shared_with?.sharegroup_count !== null &&
      image_sharing?.shared_with?.sharegroup_count !== undefined
    ) {
      return pluralize(
        'Share Group',
        'Share Groups',
        image_sharing.shared_with.sharegroup_count
      );
    }
    return '—';
  };

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      {regions.map((region: ImageRegion, idx) => {
        return (
          <ListItem disablePadding key={`${region.region}-${idx}`}>
            {region.region}
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
            displayText={
              regions.length > 0
                ? pluralize('Region', 'Regions', regions.length)
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
