import { Box, Stack } from '@linode/ui';
import PublicIcon from '@mui/icons-material/Public';
import React from 'react';

import { Flag } from 'src/components/Flag';
import { ListItemOption } from 'src/components/ListItemOption';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';

import type { Region } from '@linode/api-v4';
import type { ListItemProps } from 'src/components/ListItemOption';

interface RegionOptionProps extends ListItemProps<Region> {
  showGlobalOption?: boolean;
}

export const RegionOption = ({
  disabledOptions,
  item,
  props,
  selected,
  showGlobalOption,
}: RegionOptionProps) => {
  const { isGeckoLAEnabled } = useIsGeckoEnabled();

  return (
    <ListItemOption
      disabledOptions={disabledOptions}
      item={item}
      props={props}
      selected={selected}
    >
      <Stack alignItems="center" direction="row" gap={1} width="100%">
        {showGlobalOption && item.id === 'global' ? (
          <PublicIcon />
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
