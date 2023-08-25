import * as React from 'react';

import { List } from 'src/components/List';

import type { ListProps } from 'src/components/List';

interface Props extends ListProps {
  /**
   * The list items to render
   */
  ListItems: JSX.Element[];

  /**
   * The maxHeight of the list component, in px
   */
  maxHeight?: number;

  /**
   * The maxWidth of the list component, in px
   */
  maxWidth?: number;
}

/**
 * A simple list that becomes scrollable if it has a lot of list items
 */
export const ScrollableList = (props: Props) => {
  const { ListItems, maxHeight, maxWidth, ...listProps } = props;
  return (
    <List
      {...listProps}
      sx={{
        border: '1px solid #CCCCCC',
        maxHeight: maxHeight ? `${maxHeight}px` : '400px',
        maxWidth: maxWidth ? `${maxWidth}px` : '450px',
        overflow: 'auto',
      }}
    >
      {ListItems}
    </List>
  );
};
