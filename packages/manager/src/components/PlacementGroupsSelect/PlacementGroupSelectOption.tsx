import { PLACEMENT_GROUP_TYPES } from '@linode/api-v4';
import { Box, Stack } from '@linode/ui';
import React from 'react';

import { ListItemOption } from 'src/components/ListItemOption';

import type { PlacementGroup } from '@linode/api-v4';
import type { ListItemProps } from 'src/components/ListItemOption';

export const PlacementGroupSelectOption = ({
  disabledOptions,
  item,
  props,
  selected,
}: ListItemProps<PlacementGroup>) => (
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
