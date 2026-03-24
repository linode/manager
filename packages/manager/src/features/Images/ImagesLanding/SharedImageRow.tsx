import { useProfile, useRegionsQuery } from '@linode/queries';
import {
  Hidden,
  List,
  ListItem,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { convertStorageUnit, pluralize } from '@linode/utilities';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import { getRegionListItem } from 'src/components/ImageSelect/utilities';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import {
  PlanTextTooltip,
  StyledFormattedRegionList,
} from 'src/features/components/PlansPanel/PlansAvailabilityNotice.styles';
import { SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS } from 'src/features/Images/constants';
import { ImagesActionMenu } from 'src/features/Images/ImagesLanding/ImagesActionMenu';
import { formatDate } from 'src/utilities/formatDate';

import type { Event, Image, ImageRegion } from '@linode/api-v4';
import type { Handlers } from 'src/features/Images/ImagesLanding/ImagesActionMenu';

interface Props {
  event?: Event;
  handlers: Handlers;
  image: Image;
  pendoIDs: typeof SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS;
}

export const SharedImageRow = (props: Props) => {
  const { event, image, pendoIDs } = props;

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
    <TableRow data-qa-image-cell={id} key={id}>
      <TableCell
        data-pendo-id={`${pendoIDs.sharedImageLabel} ${label}`}
        data-qa-image-label
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
            data-pendo-id={
              SHARED_WITH_ME_IMAGES_TAB_PENDO_IDS.metadataSupportedIcon
            }
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
      <TableCell>
        {image.image_sharing?.shared_by?.sharegroup_label ?? '-'}
      </TableCell>
      <Hidden smDown>
        <TableCell
          data-pendo-id={pendoIDs.replicatedRegionPopover}
          style={{
            whiteSpace: 'nowrap',
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
      <TableCell data-qa-image-size>
        {getSizeForImage(size, status, event?.status)}
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-image-date>
          {formatDate(created, {
            timezone: profile?.timezone,
          })}
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>{id}</TableCell>
      </Hidden>
      <TableCell actionCell>
        <ImagesActionMenu {...props} sharedImageRow />
      </TableCell>
    </TableRow>
  );
};
