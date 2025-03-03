import { Box, Stack } from '@linode/ui';
import PublicIcon from '@mui/icons-material/Public';
import React from 'react';

import { Flag } from 'src/components/Flag';
import { ListItemOption } from 'src/components/ListItemOption';
// import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';

import type { Region } from '@linode/api-v4';
import type { ListItemProps } from 'src/components/ListItemOption';

interface RegionOptionProps extends ListItemProps<Region> {
  isGeckoLAEnabled: boolean;
}

export const RegionOption = ({
  disabledOptions,
  isGeckoLAEnabled,
  item,
  props,
  selected,
}: RegionOptionProps) => {
  // const { isGeckoLAEnabled } = useIsGeckoEnabled(flags, regions);

  return (
    <ListItemOption
      disabledOptions={disabledOptions}
      item={item}
      props={props}
      selected={selected}
    >
      <Stack
        sx={(theme) => ({
          '&:hover .public-icon': {
            color: `${theme.tokens.color.Neutrals.White}`,
          },
        })}
        alignItems="center"
        direction="row"
        gap={1}
        width="100%"
      >
        {item.id === 'global' ? (
          <PublicIcon
            sx={(theme) => ({
              color: `${theme.tokens.content.Icon.Primary.Active}`,
            })}
            className="public-icon"
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
