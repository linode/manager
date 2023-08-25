import { Linode } from '@linode/api-v4';
import { ListItemButton } from '@mui/material';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import { ListItem } from 'src/components/ListItem';
import { ListItemText } from 'src/components/ListItemText';

import type { ListItemProps } from 'src/components/ListItem';

export interface LinodeListItemProps extends ListItemProps {
  /**
   * The Linode to render as a list item
   */
  linode: Linode;

  /**
   * The action to execute when clicking this list item
   */
  onClickListItem: (item: Linode) => void;
}

interface Props extends LinodeListItemProps {
  /**
   * Determines whether or not the list item checked
   */
  checked: boolean;
}

/**
 *  A checkable list item for a Linode
 */
export const CheckedLinodeListItem = (props: Props) => {
  const { checked, linode, onClickListItem, ...listItemProps } = props;

  return (
    <ListItem {...listItemProps} key={linode.id} sx={{ padding: 0 }}>
      <ListItemButton
        onClick={() => onClickListItem(linode)}
        sx={{ minHeight: '40px', padding: 0 }}
      >
        <Checkbox checked={checked} />
        <ListItemText sx={(theme) => ({ marginLeft: theme.spacing(0.5) })}>
          {linode.label}
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};
