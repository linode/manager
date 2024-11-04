import { Tooltip } from '@linode/ui';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import { useFlags } from 'src/hooks/useFlags';

import { SelectedIcon } from '../Autocomplete/Autocomplete.styles';
import { OSIcon } from '../OSIcon';
import { StyledListItem } from '../RegionSelect/RegionSelect.styles';
import { Stack } from '../Stack';
import { Typography } from '../Typography';
import { isImageDeprecated } from './utilities';

import type { Image } from '@linode/api-v4';
import type { DisableRegionOption } from 'src/components/RegionSelect/RegionSelect.types';

interface Props {
  disabledOptions?: DisableRegionOption;
  image: Image;
  isSelected: boolean;
  listItemProps: Omit<React.HTMLAttributes<HTMLLIElement>, 'key'>;
}

export const ImageOption = ({
  disabledOptions,
  image,
  isSelected,
  listItemProps,
}: Props) => {
  const { className, onClick } = listItemProps;
  const flags = useFlags();
  const isImageDisabled = Boolean(disabledOptions);
  const isImageDisabledReason = disabledOptions?.reason;

  return (
    <Tooltip
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            minWidth: disabledOptions?.tooltipWidth ?? 215,
          },
        },
      }}
      title={
        isImageDisabled && isImageDisabledReason ? isImageDisabledReason : ''
      }
      disableFocusListener={!isImageDisabled}
      disableHoverListener={!isImageDisabled}
      disableInteractive
      disableTouchListener={!isImageDisabled}
      enterDelay={200}
      enterNextDelay={200}
      enterTouchDelay={200}
    >
      <StyledListItem
        {...listItemProps}
        onClick={(e) =>
          isImageDisabled ? e.preventDefault() : onClick ? onClick(e) : null
        }
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          maxHeight: 35,
        }}
        aria-disabled={undefined}
        className={isImageDisabled ? `${className} Mui-disabled` : className}
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
          {flags.metadata && image.capabilities.includes('cloud-init') && (
            <Tooltip title="This image supports our Metadata service via cloud-init.">
              <span style={{ display: 'flex' }}>
                <CloudInitIcon />
              </span>
            </Tooltip>
          )}
          {isSelected && <SelectedIcon visible />}
        </Stack>
      </StyledListItem>
    </Tooltip>
  );
};
