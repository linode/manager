import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { SelectedIcon } from '../Autocomplete/Autocomplete.styles';
import { DistributionIcon } from '../DistributionIcon';
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
    <li {...listItemProps} style={{ maxHeight: 35 }}>
      <Stack alignItems="center" direction="row" flexGrow={1} gap={2}>
        <DistributionIcon
          distribution={image.vendor}
          fontSize="1.8em"
          lineHeight="1.8em"
        />
        <Typography color="inherit">{image.label}</Typography>
        <Stack flexGrow={1} />
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
