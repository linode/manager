import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { SelectedIcon } from '../Autocomplete/Autocomplete.styles';
import { Stack } from '../Stack';
import { TooltipIcon } from '../TooltipIcon';
import { Typography } from '../Typography';
import { DistributionIcon } from './DistributionIcon';

import type { Image } from '@linode/api-v4';

interface Props {
  image: Image;
  isSelected: boolean;
  listItemProps: React.HTMLAttributes<HTMLLIElement>;
}

export const ImageOptionv2 = ({ image, isSelected, listItemProps }: Props) => {
  const flags = useFlags();

  return (
    <li {...listItemProps}>
      <Stack
        alignItems="center"
        direction="row"
        flexGrow={1}
        gap={2}
        maxHeight="20px"
      >
        <DistributionIcon distribution={image.vendor} />
        <Typography color="inherit">{image.label}</Typography>
        <Stack flexGrow={1} />
        {flags.metadata && image.capabilities.includes('cloud-init') && (
          <TooltipIcon
            icon={<DescriptionOutlinedIcon />}
            status="other"
            sxTooltipIcon={tooltipIconSx}
            text="This image is compatible with cloud-init."
          />
        )}
        {isSelected && <SelectedIcon visible />}
      </Stack>
    </li>
  );
};

const tooltipIconSx = {
  '& svg': {
    height: 20,
    width: 20,
  },
  '&:hover': {
    color: 'inherit',
  },
  color: 'inherit',
  padding: 0,
};
