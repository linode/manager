import { ListItemOption, Typography } from '@linode/ui';
import * as React from 'react';

import type { Linode } from '@linode/api-v4';

interface LinodeOptionProps {
  disabledReason?: string;
  linode: Linode;
  props: React.HTMLAttributes<HTMLLIElement>;
  selected: boolean;
}

export const LinodeOption = ({
  disabledReason,
  linode,
  props,
  selected,
}: LinodeOptionProps) => {
  return (
    <ListItemOption
      disabledOptions={disabledReason ? { reason: disabledReason } : undefined}
      item={linode}
      props={props}
      selected={selected}
    >
      <Typography>{linode.label}</Typography>
    </ListItemOption>
  );
};
