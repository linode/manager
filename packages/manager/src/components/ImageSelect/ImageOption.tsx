import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import DistributedRegionIcon from 'src/assets/icons/entityIcons/distributed-region.svg';
import { useFlags } from 'src/hooks/useFlags';

import { SelectedIcon } from '../Autocomplete/Autocomplete.styles';
import { OSIcon } from '../OSIcon';
import { Stack } from '../Stack';
import { Tooltip } from '../Tooltip';
import { Typography } from '../Typography';
import { isImageDeprecated } from './utilities';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image;
  isSelected: boolean;
  listItemProps: Omit<React.HTMLAttributes<HTMLLIElement>, 'key'>;
}

export const ImageOption = ({ image, isSelected, listItemProps }: Props) => {
  const flags = useFlags();

  return (
    <li
      {...listItemProps}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        maxHeight: 35,
      }}
    >
      <Stack alignItems="center" direction="row" spacing={2}>
        {image?.id !== 'any/all' && (
          <OSIcon fontSize="1.8em" lineHeight="1.8em" os={image.vendor} />
        )}
        <Typography color="inherit">
          {image.label} {isImageDeprecated(image) && '(deprecated)'}
        </Typography>
      </Stack>
      <Stack alignItems="center" direction="row" spacing={1}>
        {image.capabilities.includes('distributed-sites') && (
          <Tooltip title="This image is compatible with distributed compute regions.">
            <div style={{ display: 'flex' }}>
              <DistributedRegionIcon height="24px" width="24px" />
            </div>
          </Tooltip>
        )}
        {flags.metadata && image.capabilities.includes('cloud-init') && (
          <Tooltip title="This image supports our Metadata service via cloud-init.">
            <span style={{ display: 'flex' }}>
              <CloudInitIcon />
            </span>
          </Tooltip>
        )}
        {isSelected && <SelectedIcon visible />}
      </Stack>
    </li>
  );
};
