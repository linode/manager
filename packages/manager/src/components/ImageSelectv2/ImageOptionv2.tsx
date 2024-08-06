import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import React from 'react';

import DistributedRegionIcon from 'src/assets/icons/entityIcons/distributed-region.svg';
import { useFlags } from 'src/hooks/useFlags';

import { SelectedIcon } from '../Autocomplete/Autocomplete.styles';
import { OSIcon } from '../OSIcon';
import { Stack } from '../Stack';
import { Tooltip } from '../Tooltip';
import { Typography } from '../Typography';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image;
  isSelected: boolean;
  listItemProps: React.HTMLAttributes<HTMLLIElement>;
}

export const ImageOptionv2 = ({ image, isSelected, listItemProps }: Props) => {
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
        <OSIcon fontSize="1.8em" lineHeight="1.8em" os={image.vendor} />
        <Typography color="inherit">{image.label}</Typography>
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
          <Tooltip title="This image is compatible with cloud-init.">
            <DescriptionOutlinedIcon />
          </Tooltip>
        )}
        {isSelected && <SelectedIcon visible />}
      </Stack>
    </li>
  );
};
