import { Box, Stack } from "@linode/ui";
import React from "react";

import { Flag } from "src/components/Flag";
import { ListItemOption } from "src/components/ListItemOption";

import type { Region } from "@linode/api-v4";
import type { ListItemProps } from "src/components/ListItemOption";

export const RegionOption = ({
  disabledOptions,
  item,
  props,
  selected,
}: ListItemProps<Region>) => {
  return (
    <ListItemOption
      disabledOptions={disabledOptions}
      item={item}
      props={props}
      selected={selected}
    >
      <Stack alignItems="center" direction="row" gap={1} width="100%">
        <Flag country={item.country} />
        {item.label}
        <Box flexGrow={1} />
        ({item.id})
      </Stack>
    </ListItemOption>
  );
};
