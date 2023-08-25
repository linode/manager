import Close from '@mui/icons-material/Close';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { ListItem } from 'src/components/ListItem';
import { ListItemText } from 'src/components/ListItemText';

import type { LinodeListItemProps } from './CheckedLinodeListItem';

/**
 * A list item for Linodes in which this item can be removed from a list
 */
export const RemovableLinodeListItem = (props: LinodeListItemProps) => {
  const { linode, onClickListItem, ...listItemProps } = props;

  return (
    <ListItem
      {...listItemProps}
      secondaryAction={
        <IconButton onClick={() => onClickListItem(linode)} sx={{ padding: 0 }}>
          <Close />
        </IconButton>
      }
      key={linode.id}
      sx={{ minHeight: '44px', padding: 0 }}
    >
      <ListItemText sx={(theme) => ({ marginLeft: theme.spacing(2) })}>
        {linode.label}
      </ListItemText>
    </ListItem>
  );
};
