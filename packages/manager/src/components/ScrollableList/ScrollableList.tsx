import * as React from 'react';
import { List } from 'src/components/List';
import type { ListProps } from 'src/components/List';

interface Props extends ListProps {
  /**
   * The list items to render
   */
  ListItems: JSX.Element[];
}

/**
 * A simple list that is scrollable if there is a large number of list items
 */
export const ScrollableList = (props: Props) => {
  const { ListItems, ...listProps } = props;
  return (
    <List
      sx={{
        maxWidth: '450px',
        maxHeight: '445px',
        overflow: 'auto',
        border: '1px solid #CCCCCC',
      }}
      {...listProps}
    >
      {ListItems}
    </List>
  );
};
