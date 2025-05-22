import { ListItemOption, Stack, Typography } from '@linode/ui';
import React from 'react';

import type { Linode } from '@linode/api-v4';
import type { ListItemOptionProps } from '@linode/ui';

export const LinodeOption = ({
  disabledOptions,
  item,
  props,
  selected,
}: ListItemOptionProps<Linode>) => {
  return (
    <ListItemOption
      disabledOptions={disabledOptions}
      item={item}
      maxHeight={35}
      props={props}
      selected={selected}
    >
      <Stack alignItems="center" direction="row" gap={1} width="100%">
        <Typography color="inherit">{item.label}</Typography>
      </Stack>
    </ListItemOption>
  );
};

/*
0: {
    id: 77254548,
    label: "ubuntu-us-ord", 
    permissions: "read_only" 
}
1: {
    id: 77254615, 
    label: "ubuntu-us-sea", 
    permissions: "read_write" 
}
 */
