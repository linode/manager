import * as React from 'react';
import { List, type RowComponentProps } from 'react-window';

import { VIRTUALIZATION_CONFIG } from '../Utils/constants';

export interface VirtualizedListboxProps {
  /**
   * The children of the VirtualizedListbox component, which are expected to be the options to be rendered in the list.
   */
  children: React.ReactNode;
}

/**
 * A virtualized listbox component that efficiently renders large lists by only
 * rendering visible items. Uses react-window for virtualization.
 */
export const VirtualizedListbox = React.memo(
  (props: VirtualizedListboxProps) => {
    const { children } = props;

    const itemData = React.Children.toArray(children);
    const itemCount = itemData.length;

    const calculatedHeight = React.useMemo(
      () =>
        Math.min(
          VIRTUALIZATION_CONFIG.MAX_VISIBLE_HEIGHT,
          itemCount * VIRTUALIZATION_CONFIG.ITEM_HEIGHT
        ),
      [itemCount]
    );

    if (itemCount === 0) {
      return <ul>{children}</ul>;
    }

    // Row component for rendering each virtualized item
    function RowComponent({
      index,
      items,
      style,
    }: RowComponentProps<{
      items: React.ReactNode[];
    }>) {
      return (
        <div style={{ ...style, boxSizing: 'border-box' }}>{items[index]}</div>
      );
    }

    return (
      <List
        className="virtualized-listbox"
        rowComponent={RowComponent}
        rowCount={itemCount}
        rowHeight={VIRTUALIZATION_CONFIG.ITEM_HEIGHT}
        rowProps={{ items: itemData }}
        style={{
          height: calculatedHeight,
          margin: 0,
        }}
      />
    );
  }
);

VirtualizedListbox.displayName = 'VirtualizedListbox';
