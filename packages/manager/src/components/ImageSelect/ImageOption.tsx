import { Tooltip } from '@linode/ui';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import DistributedRegionIcon from 'src/assets/icons/entityIcons/distributed-region.svg';
import { useFlags } from 'src/hooks/useFlags';
import { omitProps } from 'src/utilities/omittedProps';

import { SelectedIcon } from '../Autocomplete/Autocomplete.styles';
import { OSIcon } from '../OSIcon';
import { Stack } from '../Stack';
import { Typography } from '../Typography';
import { isImageDeprecated } from './utilities';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image;
  isSelected: boolean;
  listItemProps: React.HTMLAttributes<HTMLLIElement> & { key?: string };
}

export const ImageOption = ({ image, isSelected, listItemProps }: Props) => {
  const flags = useFlags();
  // prevents spread key console error
  const props = omitProps(listItemProps, ['key']);

  return (
    <li
      {...props}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        maxHeight: 35,
      }}
    >
      <Stack alignItems="center" direction="row" spacing={2}>
        <OSIcon fontSize="1.8em" lineHeight="1.8em" os={image.vendor} />
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
            <CloudInitIcon />
          </Tooltip>
        )}
        {isSelected && <SelectedIcon visible />}
      </Stack>
    </li>
  );
};
