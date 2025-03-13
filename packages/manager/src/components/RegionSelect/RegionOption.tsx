import { Box, ListItemOption, Stack } from '@linode/ui';
import PublicIcon from '@mui/icons-material/Public';
import React from 'react';

import type { FlagComponentProps } from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { ListItemOptionProps } from '@linode/ui';

interface RegionOptionProps extends ListItemOptionProps<Region> {
  FlagComponent: React.ComponentType<FlagComponentProps>;
  isGeckoLAEnabled: boolean;
}

export const RegionOption = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FlagComponent,
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
          <FlagComponent country={item.country} />
        )}
        {isGeckoLAEnabled ? item.label : `${item.label} (${item.id})`}
        <Box flexGrow={1} />
        {isGeckoLAEnabled && `(${item.id})`}
      </Stack>
    </ListItemOption>
  );
};
