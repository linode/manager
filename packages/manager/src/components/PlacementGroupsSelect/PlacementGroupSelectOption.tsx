import { PLACEMENT_GROUP_TYPES } from '@linode/api-v4';
import { Box, ListItemOption, Stack } from '@linode/ui';
import React from 'react';

import type { PlacementGroup } from '@linode/api-v4';
import type { ListItemOptionProps } from '@linode/ui';

export const PlacementGroupSelectOption = ({
  disabledOptions,
  item,
  props,
  selected,
}: ListItemOptionProps<PlacementGroup>) => (
  <ListItemOption
    disabledOptions={disabledOptions}
    item={item}
    maxHeight={35}
    props={props}
    selected={selected}
  >
    <Box alignItems="center" display="flex" flexGrow={1}>
      <Stack alignItems="center" direction="row" flexGrow={1} gap={2}>
        <Stack>{item.label}</Stack>
        <Stack flexGrow={1} />
        <Stack
          sx={{
            position: 'relative',
            right: selected ? 14 : 34,
          }}
        >
          ({PLACEMENT_GROUP_TYPES[item.placement_group_type]})
        </Stack>
      </Stack>
    </Box>
  </ListItemOption>
);
