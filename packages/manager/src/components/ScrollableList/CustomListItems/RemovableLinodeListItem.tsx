import Close from '@mui/icons-material/Close';
import * as React from 'react';

import type { LinodeListItemProps } from './CheckedLinodeListItem';
import { IconButton } from 'src/components/IconButton';
import { ListItem } from 'src/components/ListItem';
import { ListItemText } from 'src/components/ListItemText';

/**
 * A list item for Linodes in which this item can be removed from a list
 */
export const RemovableLinodeListItem = (props: LinodeListItemProps) => {
  const { linode, onClickListItem, ...listItemProps } = props;

  return (
    <ListItem
      sx={{ padding: 0, minHeight: '44px' }}
      key={linode.id}
      secondaryAction={
        <IconButton sx={{ padding: 0 }} onClick={() => onClickListItem(linode)}>
          <Close />
        </IconButton>
      }
      {...listItemProps}
    >
      <ListItemText sx={{ marginLeft: '16px' }}>{linode.label}</ListItemText>
    </ListItem>
  );
};
