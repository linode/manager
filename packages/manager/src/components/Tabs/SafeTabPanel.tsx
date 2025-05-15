import { useTabsContext } from '@reach/tabs';
import * as React from 'react';

import { TabPanel } from './TabPanel';

interface SafeTabPanelProps {
  children: null | React.ReactNode;
  index: null | number;
}

/**
 * SafeTabPanel only renders its children when it is currently selected. This is helpful when a
 * child component of SafeTabPanel requests data when it is mounted. In this case, we may want to
 * avoid mounting the component until the tab is actually selected/visible.
 */
export const SafeTabPanel = (props: SafeTabPanelProps) => {
  const { index, ...tabPanelProps } = props;

  const { selectedIndex } = useTabsContext();
  const isSelected = selectedIndex === index;

  return (
    <TabPanel {...tabPanelProps}>{isSelected ? props.children : null}</TabPanel>
  );
};
