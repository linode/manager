import { Box, ListItemOption, Stack } from '@linode/ui';
import PublicIcon from '@mui/icons-material/Public';
import React from 'react';

// @todo: modularization - Move `Flag` component to `@linode/shared` package.
import { Flag } from '../Flag';

import type { Region } from '@linode/api-v4';
import type { ListItemOptionProps } from '@linode/ui';

interface RegionOptionProps extends ListItemOptionProps<Region> {
  isGeckoLAEnabled: boolean;
}

export const RegionOption = ({
  disabledOptions,
  isGeckoLAEnabled,
  item,
  props,
  selected,
}: RegionOptionProps) => {
  return (
    <ListItemOption
      disabledOptions={disabledOptions}
      item={item}
      props={props}
      selected={selected}
    >
      <Stack
        alignItems="center"
        direction="row"
        gap={1}
        sx={(theme) => ({
          '&:hover .public-icon': {
            color: `${theme.tokens.color.Neutrals.White}`,
          },
        })}
        width="100%"
      >
        {item.id === 'global' ? (
          <PublicIcon
            className="public-icon"
            sx={(theme) => ({
              color: `${theme.tokens.alias.Content.Icon.Primary.Active}`,
            })}
          />
        ) : (
          <Flag country={item.country} />
        )}
        {isGeckoLAEnabled ? item.label : `${item.label} (${item.id})`}
        <Box flexGrow={1} />
        {isGeckoLAEnabled && `(${item.id})`}
      </Stack>
    </ListItemOption>
  );
};
