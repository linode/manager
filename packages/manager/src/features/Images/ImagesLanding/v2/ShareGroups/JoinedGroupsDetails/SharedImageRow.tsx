import { TableCell, TableRow } from '@akamai/cds-components/react/Table';
import { convertStorageUnit } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { pluralize } from '@akamai/compute-ui-core/formatting';
import { useProfile, useRegionsQuery } from '@linode/queries';
import {
  Hidden,
  List,
  ListItem,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import { TABLE_CELL_BASE_STYLE } from 'src/components/ImageSelect/constants';
import { getRegionListItem } from 'src/components/ImageSelect/utilities';
import {
  PlanTextTooltip,
  StyledFormattedRegionList,
} from 'src/features/components/PlansPanel/PlansAvailabilityNotice.styles';
import { ImagesActionMenu } from 'src/features/Images/ImagesLanding/ImagesActionMenu';

import type { Event, Image, ImageRegion } from '@linode/api-v4';
import type { Handlers } from 'src/features/Images/ImagesLanding/ImagesActionMenu';
import type { JOINED_GROUP_DETAILS_PENDO_IDS } from 'src/features/Images/ImagesLanding/v2/constants';

interface Props {
  event?: Event;
  handlers: Handlers;
  image: Image;
  isTableStripingEnabled?: boolean;
  pendoIDs: typeof JOINED_GROUP_DETAILS_PENDO_IDS;
}

export const SharedImageRow = (props: Props) => {
  const { event, image, isTableStripingEnabled, pendoIDs } = props;

  const {
    capabilities,
    created,
    id,
    label,
    regions: imageRegions,
    size,
    status,
  } = image;

  const { data: profile } = useProfile();

  const { data: regionsData } = useRegionsQuery();
  const regions = regionsData ?? [];

  const isFailedUpload =
    image.status === 'pending_upload' && event?.status === 'failed';

  const getSizeForImage = (
    size: number,
    status: string,
    eventStatus: string | undefined
  ) => {
    if (status === 'available' || eventStatus === 'finished') {
      const sizeInGB = convertStorageUnit('MB', size, 'GB');

      const formattedSizeInGB = Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(sizeInGB);

      return `${formattedSizeInGB} GB`;
    } else if (isFailedUpload) {
      return 'N/A';
    } else {
      return 'Pending';
    }
  };

  const FormattedRegionList = () => (
    <StyledFormattedRegionList>
      <Typography>
        This image is replicated in the following{' '}
        {imageRegions.length > 1 ? 'regions' : 'region'}:
      </Typography>
      <List sx={{ listStyleType: 'disc', pl: 3 }}>
        {imageRegions.map((region: ImageRegion, idx) => {
          return (
            <ListItem
              disablePadding
              key={`${region.region}-${idx}`}
              sx={{ display: 'list-item' }}
            >
              {getRegionListItem(regions ?? [], region)}
            </ListItem>
          );
        })}
      </List>
    </StyledFormattedRegionList>
  );

  return (
    <TableRow
      data-qa-image-cell={id}
      key={id}
      rowborder={!isTableStripingEnabled}
      zebra={isTableStripingEnabled}
    >
      <TableCell
        data-pendo-id={`${pendoIDs.sharedImageLabel} ${label}`}
        data-qa-image-label
        style={{ ...TABLE_CELL_BASE_STYLE, flex: '0 1 25%' }}
      >
        <Stack
          alignItems="center"
          direction="row"
          gap={2}
          justifyContent="space-between"
        >
          {label}
          <Stack
            alignItems="center"
            data-pendo-id={pendoIDs.metadataSupportedIcon}
            direction="row"
            gap={1}
          >
            {capabilities.includes('cloud-init') && (
              <TooltipIcon
                icon={<CloudInitIcon />}
                sxTooltipIcon={{
                  padding: 0,
                }}
                text="This image supports our Metadata service via cloud-init."
              />
            )}
          </Stack>
        </Stack>
      </TableCell>
      <Hidden smDown>
        <TableCell
          data-pendo-id={pendoIDs.replicatedRegionPopover}
          style={{
            ...TABLE_CELL_BASE_STYLE,
            whiteSpace: 'nowrap',
            flex: '0 1 25%',
          }}
        >
          {imageRegions.length > 0 ? (
            <PlanTextTooltip
              displayText={pluralize('Region', 'Regions', imageRegions.length)}
              tooltipText={<FormattedRegionList />}
            />
          ) : (
            '—'
          )}
        </TableCell>
      </Hidden>
      <TableCell
        data-qa-image-size
        style={{ ...TABLE_CELL_BASE_STYLE, flex: '0 1 10%' }}
      >
        {getSizeForImage(size, status, event?.status)}
      </TableCell>
      <Hidden mdDown>
        <TableCell
          data-qa-image-date
          style={{ ...TABLE_CELL_BASE_STYLE, flex: '0 1 15%' }}
        >
          {formatDate(created, {
            timezone: profile?.timezone,
          })}
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell style={{ ...TABLE_CELL_BASE_STYLE, flex: '0 1 15%' }}>
          {id}
        </TableCell>
      </Hidden>
      <TableCell
        style={{ padding: 0, marginRight: '-12px', justifyContent: 'flex-end' }}
      >
        <ImagesActionMenu {...props} isSharedImageRow />
      </TableCell>
    </TableRow>
  );
};
