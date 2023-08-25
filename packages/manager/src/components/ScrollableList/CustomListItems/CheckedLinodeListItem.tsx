import { Linode } from '@linode/api-v4';
import { ListItemButton } from '@mui/material';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import { ListItem } from 'src/components/ListItem';
import { ListItemText } from 'src/components/ListItemText';

import type { ListItemProps } from 'src/components/ListItem';

export interface LinodeListItemProps extends ListItemProps {
  /**
   * The list of all Linode items to render as an individual list item
   */
  linode: Linode;

  /**
   * The action when clicking this list item
   */
  onClickListItem: (item: Linode) => void;
}

interface Props extends LinodeListItemProps {
  /**
   * Is this list item currently checked
   */
  checked: boolean;
}

/**
 *  A list item for Linodes in which this item can be checked
 */
export const CheckedLinodeListItem = (props: Props) => {
  const { checked, linode, onClickListItem, ...listItemProps } = props;

  return (
    <ListItem {...listItemProps} key={linode.id} sx={{ padding: 0 }}>
      <ListItemButton
        onClick={() => onClickListItem(linode)}
        sx={{ minHeight: '44px', padding: 0 }}
      >
        <Checkbox checked={checked} />
        <ListItemText>{linode.label}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
};
